/* ===== Phase 2, batch A: security, identity and compliance ===== */
SERVICES.push(
{
  id: 'kms', name: 'AWS Key Management Service (KMS)', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS KMS'],
  summary: 'Creates and controls the encryption keys that protect data in almost every other AWS service.',
  what: `<p>AWS KMS is a managed service for creating, storing and controlling cryptographic keys. Most AWS services that store data (S3, EBS, RDS, DynamoDB, Secrets Manager and many more) call KMS to encrypt it. Key material is generated and used inside hardware security modules and never leaves them in plain text.</p>`,
  problem: `<p>Encryption is easy; managing keys is hard. KMS answers the hard questions in one place: who may use a key, when it rotates, how its use is audited, and what happens when someone leaves or a workload is retired.</p>`,
  how: `<ul>
<li><b>Three kinds of key ownership.</b> <i>AWS owned keys</i> are invisible and free. <i>AWS managed keys</i> (aliases like <code>aws/s3</code>) live in your account but AWS sets their policy. <i>Customer managed keys</i> are yours: you write the key policy, control rotation and can share them across accounts.</li>
<li><b>Envelope encryption.</b> KMS encrypts at most 4 KB directly. For real data, a service asks KMS for a <i>data key</i>, encrypts the data locally with it, then stores the data key encrypted under the KMS key alongside the data. Decryption reverses this.</li>
<li><b>The key policy is the root of access.</b> Every key has one. An IAM policy can grant use of a key only if the key policy allows the account to delegate. This is why "the role has permission but decrypt fails" is so common.</li>
<li><b>Grants</b> give temporary, narrow use of a key to a principal, typically an AWS service acting for you.</li>
<li><b>Rotation.</b> Customer managed symmetric keys can rotate automatically (yearly by default, with a configurable period). Old key material is kept so existing data still decrypts. AWS managed keys rotate yearly.</li>
<li><b>Regional.</b> A key exists in one Region. <i>Multi-Region keys</i> are related keys with the same key material in several Regions, so data encrypted in one Region can be decrypted in another.</li>
<li><b>Deletion is scheduled</b>, with a waiting period of 7 to 30 days. Once a key is gone, everything encrypted under it is unrecoverable.</li>
<li><b>Request quotas.</b> Cryptographic operations are throttled per account and Region. High-volume S3 workloads use S3 Bucket Keys to cut KMS calls.</li>
</ul>`,
  features: [
    `<b>Multi-Region keys</b> for disaster recovery and global tables.`,
    `<b>Automatic and on-demand rotation.</b>`,
    `<b>Encryption context</b>: extra key-value data that must match on decrypt and appears in CloudTrail.`,
    `<b>Custom key stores</b>: keys backed by your own CloudHSM cluster, or by a key manager outside AWS (external key store).`,
    `<b>Imported key material</b> (bring your own key), with optional expiry.`,
    `<b>Asymmetric and HMAC keys</b> for signing and verification.`,
    `<b>Post-quantum options</b>: ML-DSA signing keys and hybrid post-quantum TLS (ML-KEM) on KMS endpoints [[verify]].`
  ],
  when: [
    `Encrypting data at rest in AWS services where you need control over who can decrypt and an audit trail of every use.`,
    `Application-level envelope encryption of sensitive fields (card data, identity documents).`,
    `Digital signing with keys that never leave AWS.`,
    `Sharing encrypted snapshots or buckets with another account.`
  ],
  whenNot: [
    `<b>Storing passwords or API keys:</b> that is Secrets Manager (which uses KMS underneath).`,
    `<b>A single-tenant HSM you operate</b>, or a compliance rule that demands one: AWS CloudHSM.`,
    `<b>TLS certificates for load balancers and CloudFront:</b> AWS Certificate Manager.`,
    `<b>Encrypting large payloads directly:</b> use a data key (envelope encryption), not the Encrypt API.`
  ],
  interactions: [
    `<b>S3, EBS, RDS, Aurora, DynamoDB, EFS, Redshift, SQS, SNS, Secrets Manager, CloudWatch Logs:</b> server-side encryption with a KMS key.`,
    `<b>IAM:</b> key policy and IAM policy are evaluated together.`,
    `<b>CloudTrail:</b> logs every use of every key.`,
    `<b>CloudHSM:</b> backs a custom key store.`,
    `<b>Organizations:</b> resource control policies can restrict who may use keys across all accounts.`
  ],
  example: { title: 'A customer managed key with rotation and a readable alias (Terraform)', lang: 'hcl',
    code: `resource "aws_kms_key" "data" {
  description             = "Payments data at rest"
  enable_key_rotation     = true
  deletion_window_in_days = 30
}

resource "aws_kms_alias" "data" {
  name          = "alias/payments-data"
  target_key_id = aws_kms_key.data.key_id
}`,
    notes: `<p>With no <code>policy</code> argument, Terraform applies the default key policy, which lets IAM policies in the same account grant access. For cross-account use, add the other account as a principal in the key policy and grant <code>kms:Decrypt</code> in that account's IAM policy as well.</p>` },
  useCases: [
    `<b>Cardholder data:</b> a dedicated key per environment, usable only by the payments task role, every decrypt logged.`,
    `<b>Cross-account backups:</b> snapshots encrypted with a customer managed key that the backup account is allowed to use.`,
    `<b>Multi-Region DR:</b> a multi-Region key so replicated data can be read after failover.`
  ],
  pricing: `<p>A monthly charge for each customer managed key, plus a charge per API request above a free allowance. AWS managed keys have no monthly charge but their requests are billed. AWS owned keys cost nothing. Main cost driver at scale is request volume, which S3 Bucket Keys and data key caching reduce.</p>`,
  pricingLink: 'https://aws.amazon.com/kms/pricing/',
  alternatives: [
    `<b>AWS CloudHSM:</b> dedicated HSMs you control; more work, needed for some compliance regimes.`,
    `<b>Service default encryption</b> (for example SSE-S3): no key management at all, and no per-key access control or audit.`,
    `<b>External key store:</b> keys held outside AWS for sovereignty requirements, at the cost of availability depending on your key manager.`
  ],
  mistakes: [
    `<b>Granting IAM permissions and forgetting the key policy</b>, or the reverse.`,
    `<b>Using an AWS managed key for something you later need to share.</b> AWS managed keys cannot be used cross-account; you must re-encrypt with a customer managed key.`,
    `<b>Deleting a key that still protects data.</b> Disable first and watch CloudTrail before scheduling deletion.`,
    `<b>Assuming keys are global.</b> A copy to another Region must be re-encrypted with a key in that Region (or use multi-Region keys).`,
    `<b>KMS throttling</b> under heavy S3 SSE-KMS traffic without Bucket Keys.`,
    `<b>One key for everything.</b> Separate keys per data classification and environment keep access narrow.`
  ],
  exam: { saa: ['1.3'], sap: ['2.2'],
    trap: `<ul><li>"Customer must control and audit key usage" means SSE-KMS with a customer managed key, not SSE-S3.</li>
<li>Sharing an encrypted snapshot or AMI with another account needs a customer managed key.</li>
<li>"Dedicated, single-tenant hardware" points to CloudHSM.</li>
<li>Access to encrypted data needs both the data permission (for example <code>s3:GetObject</code>) and <code>kms:Decrypt</code>.</li></ul>`,
    proAdds: `<p>Key strategy across an organisation: central vs per-account keys, multi-Region keys for DR, external key stores for sovereignty, RCPs to stop keys being used from outside the organisation, and post-quantum cryptography options.</p>` },
  docs: [{ label: 'AWS KMS Developer Guide', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/overview.html' }]
},
{
  id: 'secrets-manager', name: 'AWS Secrets Manager', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Secrets Manager'],
  summary: 'Stores database passwords, API keys and other secrets, hands them to applications at run time, and rotates them.',
  what: `<p>Secrets Manager stores secrets encrypted with KMS, controls access with IAM and resource policies, and can rotate them automatically. Applications fetch the current value when they need it, so nothing sensitive sits in code, images or configuration files.</p>`,
  problem: `<p>Hard-coded credentials leak through source control, logs and backups, and nobody dares rotate them because nobody knows where they are used. A central store with rotation removes both problems.</p>`,
  how: `<ul>
<li><b>A secret</b> holds up to 65,536 bytes, usually JSON with fields such as username and password.</li>
<li><b>Versions and staging labels.</b> <code>AWSCURRENT</code> is the live value, <code>AWSPREVIOUS</code> the last one, <code>AWSPENDING</code> a value being rotated in.</li>
<li><b>Rotation.</b> Managed rotation is built in for Amazon RDS, Aurora, Redshift and DocumentDB credentials. Anything else rotates through a Lambda function you provide. RDS can also create and manage the master password in Secrets Manager for you.</li>
<li><b>Access.</b> IAM policies on the caller, plus an optional resource policy on the secret for cross-account access. The caller also needs <code>kms:Decrypt</code> if the secret uses a customer managed key.</li>
<li><b>Replication.</b> A secret can be replicated to other Regions and kept in sync for multi-Region applications.</li>
<li><b>Delivery.</b> ECS and EKS inject secrets at start; Lambda can use the Parameters and Secrets extension to cache them; SDK caching libraries cut cost and latency elsewhere.</li>
</ul>`,
  features: [`<b>Automatic rotation</b> on a schedule, with managed rotation for AWS databases.`, `<b>Multi-Region replication.</b>`, `<b>Resource policies</b> for cross-account sharing.`, `<b>RDS-managed master passwords.</b>`, `<b>CloudTrail logging</b> of every retrieval.`],
  when: [`Database credentials, especially when rotation is required.`, `Third-party API keys and OAuth client secrets.`, `Any secret that more than one service or account must read.`],
  whenNot: [
    `<b>Plain configuration values</b> (feature flags, URLs): Systems Manager Parameter Store is free for standard parameters.`,
    `<b>Secrets that never rotate and are read constantly, at very large counts:</b> Parameter Store SecureString may be cheaper.`,
    `<b>Encryption keys:</b> those belong in KMS.`,
    `<b>Credentials for AWS itself:</b> use IAM roles, not stored access keys.`
  ],
  interactions: [`<b>KMS:</b> encrypts every secret.`, `<b>RDS, Aurora, Redshift, DocumentDB:</b> managed rotation.`, `<b>Lambda:</b> custom rotation functions.`, `<b>ECS, EKS, Lambda:</b> injection and caching.`, `<b>VPC interface endpoint:</b> lets private subnets reach Secrets Manager without a NAT gateway.`],
  example: { title: 'Let RDS create and rotate the master password in Secrets Manager (Terraform)', lang: 'hcl',
    code: `resource "aws_db_instance" "main" {
  identifier                  = "payments"
  engine                      = "postgres"
  instance_class              = "db.t4g.medium"
  allocated_storage           = 50
  username                    = "app_admin"
  manage_master_user_password = true   # password never appears in code or state
  multi_az                    = true
  storage_encrypted           = true
  db_subnet_group_name        = aws_db_subnet_group.isolated.name
}`,
    notes: `<p>The secret's ARN is exposed as <code>aws_db_instance.main.master_user_secret[0].secret_arn</code>, ready to reference in an ECS task definition's <code>secrets</code> block.</p>` },
  useCases: [`<b>Payments API:</b> database password injected into the Fargate task at start and rotated every 30 days.`, `<b>Partner integration:</b> an acquirer's API key stored once and read by two services.`, `<b>Multi-Region service:</b> the same secret replicated to the DR Region.`],
  pricing: `<p>A monthly charge per secret (replicas count as secrets) plus a charge per 10,000 API calls. Rotation Lambda functions are billed as Lambda. Caching in the application is the main way to control the API charge.</p>`,
  pricingLink: 'https://aws.amazon.com/secrets-manager/pricing/',
  alternatives: [`<b>Systems Manager Parameter Store:</b> free standard tier, SecureString with KMS, no built-in rotation, smaller values (4 KB standard, 8 KB advanced).`, `<b>IAM database authentication</b> for RDS: short-lived tokens with no password at all.`, `<b>Third-party vaults</b> (self-managed) when you need features across multiple clouds.`],
  mistakes: [
    `<b>Calling GetSecretValue on every request</b> with no caching.`,
    `<b>Rotating a password the application has cached forever</b>, so connections fail after rotation. Use the alternating-users strategy or reconnect logic.`,
    `<b>Rotation Lambda with no network path</b> to the database or to the Secrets Manager endpoint.`,
    `<b>Secret values in Terraform variables or state.</b> Let the service generate the value.`,
    `<b>Broad <code>secretsmanager:GetSecretValue</code> on <code>*</code>.</b> Scope to the secret's ARN.`
  ],
  exam: { saa: ['1.3'], sap: ['2.2'],
    trap: `<ul><li>"Automatically rotate database credentials" is Secrets Manager. Parameter Store does not rotate by itself.</li><li>"Lowest cost for configuration and a few encrypted values" is Parameter Store.</li></ul>`,
    proAdds: `<p>Cross-account secret sharing with resource policies and KMS key policies, multi-Region replication for DR, and rotation strategy for zero-downtime (alternating users).</p>` },
  docs: [{ label: 'AWS Secrets Manager User Guide', url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html' }]
},
{
  id: 'acm', name: 'AWS Certificate Manager (ACM)', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Certificate Manager (ACM)'],
  summary: 'Issues and renews the TLS certificates used by load balancers, CloudFront and API Gateway.',
  what: `<p>ACM provisions public TLS certificates, attaches them to AWS services that terminate HTTPS, and renews them automatically. Public certificates used this way are free.</p>`,
  problem: `<p>Expired certificates cause outages, and private keys copied onto servers get lost or stolen. ACM keeps the private key inside AWS and renews without anyone remembering to.</p>`,
  how: `<ul>
<li><b>Validation.</b> You prove you control the domain by DNS (a CNAME record, preferred) or email. With DNS validation in place and the certificate in use, renewal is automatic.</li>
<li><b>Regional.</b> A certificate is usable only in the Region where it was issued. <b>CloudFront requires the certificate to be in <code>us-east-1</code>.</b></li>
<li><b>Integrated services</b> include Application and Network Load Balancers, CloudFront, API Gateway and others. The private key of a standard public certificate cannot be exported, so it cannot be installed directly on an EC2 instance. Exportable public certificates are a newer paid option [[verify]].</li>
<li><b>Imported certificates</b> from another authority work, but ACM does not renew them.</li>
<li><b>AWS Private CA</b> is a separate, paid service for certificates inside your organisation (service-to-service TLS, devices).</li>
</ul>`,
  features: [`<b>Managed renewal.</b>`, `<b>Wildcard and multi-name certificates.</b>`, `<b>Expiry events</b> in EventBridge for imported certificates.`, `<b>Private CA integration.</b>`],
  when: [`HTTPS on an ALB, NLB (TLS listener), CloudFront distribution or API Gateway custom domain.`, `Any public endpoint where you want zero certificate maintenance.`],
  whenNot: [`<b>TLS terminated on your own EC2 instances or containers:</b> you need an exportable certificate, a Private CA certificate, or a third-party certificate.`, `<b>Internal service names:</b> use AWS Private CA.`, `<b>Code signing or client certificates</b> for general use: not ACM public certificates.`],
  interactions: [`<b>Route 53:</b> one-click DNS validation records.`, `<b>Elastic Load Balancing, CloudFront, API Gateway:</b> where certificates are attached.`, `<b>EventBridge:</b> expiry notifications.`],
  example: { title: 'DNS-validated certificate (Terraform)', lang: 'hcl',
    code: `resource "aws_acm_certificate" "api" {
  domain_name       = "api.example.co.nz"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "validation" {
  for_each = { for o in aws_acm_certificate.api.domain_validation_options : o.domain_name => o }
  zone_id  = aws_route53_zone.main.zone_id
  name     = each.value.resource_record_name
  type     = each.value.resource_record_type
  records  = [each.value.resource_record_value]
  ttl      = 300
}`,
    notes: `<p>Leave the validation record in place permanently: ACM uses it again at every renewal.</p>` },
  useCases: [`<b>Public API:</b> certificate on the ALB, renewed without intervention.`, `<b>Global site:</b> certificate in us-east-1 for CloudFront, a second one in the origin's Region for the load balancer.`],
  pricing: `<p>Public certificates used with integrated AWS services are free. You pay for AWS Private CA (monthly per CA plus per certificate) and for exportable public certificates.</p>`,
  pricingLink: 'https://aws.amazon.com/certificate-manager/pricing/',
  alternatives: [`<b>Third-party certificate imported into ACM:</b> when a specific authority or extended validation is required; you handle renewal.`, `<b>Let's Encrypt on the host:</b> when TLS must terminate on the instance.`],
  mistakes: [`<b>Requesting the CloudFront certificate in the wrong Region.</b>`, `<b>Deleting the DNS validation record</b>, which silently breaks renewal.`, `<b>Forgetting that imported certificates expire</b> with no automatic renewal.`, `<b>Email validation</b> to a mailbox nobody reads.`],
  exam: { saa: ['1.3'], sap: ['2.2'],
    trap: `<ul><li>CloudFront certificate: us-east-1. Load balancer certificate: the load balancer's Region.</li><li>"Encrypt in transit to the load balancer with no certificate management": ACM public certificate.</li></ul>`,
    proAdds: `<p>Private CA hierarchies shared across accounts with AWS RAM, and end-to-end TLS designs where the load balancer re-encrypts to the targets.</p>` },
  docs: [{ label: 'AWS Certificate Manager User Guide', url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html' }]
},
{
  id: 'waf', name: 'AWS WAF', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS WAF'],
  summary: 'A web application firewall that filters HTTP requests before they reach your application.',
  what: `<p>AWS WAF inspects HTTP and HTTPS requests at layer 7 and allows, blocks, counts or challenges them according to rules you choose. It sits in front of CloudFront, Application Load Balancers, API Gateway and a few other services.</p>`,
  problem: `<p>Security groups only understand addresses and ports. They cannot tell a normal request from a SQL injection attempt, a credential-stuffing bot or one client sending ten thousand requests a minute. WAF can.</p>`,
  how: `<ul>
<li><b>Web ACL.</b> An ordered list of rules with a default action, associated with one or more resources.</li>
<li><b>Rules</b> match on IP sets, country, headers, URI, query string, body, size, and SQL injection or cross-site scripting patterns. <b>Rate-based rules</b> act when one source exceeds a request rate.</li>
<li><b>Managed rule groups.</b> AWS and Marketplace sellers maintain rule sets (common exploits, known bad inputs, IP reputation, bot control, account-takeover prevention) so you do not write everything yourself.</li>
<li><b>Actions:</b> allow, block, count (log only, for testing), CAPTCHA and silent challenge.</li>
<li><b>Scope.</b> A web ACL for CloudFront is global and created in <code>us-east-1</code>. Web ACLs for Regional resources live in that Region.</li>
<li><b>Supported resources:</b> CloudFront, Application Load Balancer, API Gateway REST APIs, AppSync, Cognito user pools, App Runner, Verified Access. <b>Not</b> Network Load Balancers or EC2 instances directly.</li>
<li><b>Logging</b> to CloudWatch Logs, S3 or Data Firehose.</li>
</ul>`,
  features: [`<b>AWS Managed Rules</b> and Marketplace rule groups.`, `<b>Rate-based rules.</b>`, `<b>Bot Control</b> and <b>Fraud Control</b> (account takeover and fake account creation).`, `<b>CAPTCHA and challenge actions.</b>`, `<b>Central deployment across accounts</b> through AWS Firewall Manager.`],
  when: [`Any internet-facing web application or API.`, `Blocking common exploits (the OWASP Top 10 style attacks).`, `Slowing HTTP floods and scraping with rate limits.`, `Blocking or allowing by country or IP list.`],
  whenNot: [`<b>Non-HTTP traffic or a Network Load Balancer:</b> use security groups, NACLs or AWS Network Firewall.`, `<b>Large volumetric DDoS:</b> that is AWS Shield's job (the two work together).`, `<b>Authorising users:</b> WAF filters requests; it does not know who a user is.`],
  interactions: [`<b>CloudFront, ALB, API Gateway, AppSync, Cognito:</b> attachment points.`, `<b>Shield Advanced:</b> uses WAF for automatic layer 7 mitigation and includes WAF charges for protected resources.`, `<b>Firewall Manager:</b> enforces web ACLs across an organisation.`, `<b>CloudWatch, S3, Data Firehose:</b> metrics and logs.`],
  example: { title: 'Web ACL with a managed rule group and a rate limit (Terraform, trimmed)', lang: 'hcl',
    code: `resource "aws_wafv2_web_acl" "api" {
  name  = "payments-api"
  scope = "REGIONAL"   # "CLOUDFRONT" for a distribution, created in us-east-1
  default_action { allow {} }

  rule {
    name     = "common"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }
    visibility_config { cloudwatch_metrics_enabled = true  metric_name = "common"  sampled_requests_enabled = true }
  }

  rule {
    name     = "rate-limit"
    priority = 2
    action { block {} }
    statement {
      rate_based_statement { limit = 1000  aggregate_key_type = "IP" }
    }
    visibility_config { cloudwatch_metrics_enabled = true  metric_name = "rate"  sampled_requests_enabled = true }
  }

  visibility_config { cloudwatch_metrics_enabled = true  metric_name = "payments-api"  sampled_requests_enabled = true }
}`,
    notes: `<p>Attach it with <code>aws_wafv2_web_acl_association</code>. Start new rules in count mode, read the logs, then switch to block. (Single-line blocks above are condensed for space; Terraform needs each argument on its own line.)</p>` },
  useCases: [`<b>Payments API:</b> managed rules plus a strict rate limit on the login and payment-initiation paths.`, `<b>Marketing site on CloudFront:</b> bot control to stop scraping.`, `<b>Incident response:</b> block an attacking IP range in minutes.`],
  pricing: `<p>A monthly charge per web ACL and per rule, plus a charge per million requests inspected. Bot Control, Fraud Control and CAPTCHA carry extra per-request fees. Paid Marketplace rule groups add subscription costs.</p>`,
  pricingLink: 'https://aws.amazon.com/waf/pricing/',
  alternatives: [`<b>CloudFront geographic restrictions:</b> simple country blocking without WAF.`, `<b>Network ACLs:</b> block IP ranges at the subnet, with no knowledge of HTTP.`, `<b>AWS Network Firewall:</b> stateful inspection of all VPC traffic, not only HTTP.`, `<b>Third-party WAF appliances</b> behind a Gateway Load Balancer.`],
  mistakes: [`<b>Turning on block mode without testing in count mode</b>, and blocking real customers.`, `<b>Protecting the load balancer but leaving it reachable directly</b> when CloudFront with WAF is meant to be the only entrance.`, `<b>No logging</b>, so you cannot tell why a request was blocked.`, `<b>Relying on rate limits alone</b> against distributed attacks from many addresses.`],
  exam: { saa: ['1.2'], sap: ['1.4'],
    trap: `<ul><li>SQL injection or cross-site scripting: WAF. Volumetric DDoS: Shield. Port and address filtering: security groups and NACLs.</li><li>WAF cannot attach to a Network Load Balancer.</li><li>"Apply the same web rules to every account": Firewall Manager.</li></ul>`,
    proAdds: `<p>Organisation-wide enforcement with Firewall Manager, restricting origins so only CloudFront can reach them, and layered edge designs (CloudFront, WAF, Shield Advanced, origin protection).</p>` },
  docs: [{ label: 'AWS WAF Developer Guide', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html' }]
},
{
  id: 'shield', name: 'AWS Shield', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Shield'],
  summary: 'Protection against distributed denial-of-service (DDoS) attacks: a free standard tier and a paid advanced tier.',
  what: `<p>AWS Shield defends against DDoS attacks. <b>Shield Standard</b> is automatic and free for every AWS customer and covers common network and transport layer attacks. <b>Shield Advanced</b> is a paid subscription with stronger detection, application-layer mitigation, expert help and cost protection.</p>`,
  problem: `<p>A DDoS attack tries to exhaust your capacity or your budget. Standard absorbs the common floods at AWS's edge. Advanced is for businesses where an outage, or the scaling bill from surviving one, is unacceptable.</p>`,
  how: `<ul>
<li><b>Standard</b> protects against layer 3 and 4 attacks (SYN floods, UDP reflection) on all AWS resources, with the strongest protection at the edge (CloudFront, Route 53, Global Accelerator).</li>
<li><b>Advanced</b> is enabled per resource: CloudFront distributions, Route 53 hosted zones, Global Accelerator, Application and Classic Load Balancers, and Elastic IP addresses (which covers Network Load Balancers and EC2).</li>
<li><b>Advanced adds:</b> detection tuned to each resource's traffic, automatic application-layer mitigation through AWS WAF, near-real-time attack visibility, access to the Shield Response Team (with a Business or Enterprise support plan), and credits for scaling charges caused by an attack.</li>
<li><b>Subscription.</b> A fixed monthly fee with a 12-month commitment, covering all accounts in an organisation's consolidated billing, plus data transfer fees. AWS WAF usage for protected resources is included.</li>
</ul>`,
  features: [`<b>Always-on detection and inline mitigation.</b>`, `<b>Automatic application-layer DDoS mitigation</b> with WAF.`, `<b>Shield Response Team</b> engagement.`, `<b>Cost protection</b> against attack-driven scaling.`, `<b>Protection groups</b> to treat several resources as one application.`],
  when: [`Standard: always (you already have it).`, `Advanced: revenue-critical or high-profile public applications, and anything with contractual availability targets.`],
  whenNot: [`<b>Advanced for small internal or low-risk sites:</b> the fixed fee is hard to justify.`, `<b>Application exploits</b> such as injection: that is WAF.`, `<b>As a substitute for good architecture:</b> edge services, auto scaling and small attack surface still matter.`],
  interactions: [`<b>CloudFront, Route 53, Global Accelerator:</b> absorb attacks at the edge.`, `<b>AWS WAF:</b> layer 7 rules and rate limiting.`, `<b>Firewall Manager:</b> applies Shield Advanced across accounts.`, `<b>CloudWatch:</b> attack metrics and alarms.`],
  useCases: [`<b>Online banking front end:</b> CloudFront plus WAF plus Shield Advanced, with the response team on call.`, `<b>Game or betting launch:</b> cost protection during expected attacks.`],
  pricing: `<p>Standard is free. Advanced is a fixed monthly subscription per organisation with a one-year commitment, plus data transfer out charges for protected resources. Example only, from training data and worth checking: the subscription has long been listed at US$3,000 a month [[verify]].</p>`,
  pricingLink: 'https://aws.amazon.com/shield/pricing/',
  alternatives: [`<b>Standard plus WAF rate-based rules</b> is enough for many workloads.`, `<b>Third-party DDoS scrubbing services</b> in front of AWS.`],
  mistakes: [`<b>Paying for Advanced and not associating resources</b> or health checks with it.`, `<b>Exposing origins directly</b> so attackers can bypass the protected edge.`, `<b>No runbook or contact set up</b> before the attack.`],
  exam: { saa: ['1.2'], sap: ['1.4'],
    trap: `<ul><li>"DDoS protection at no extra cost": Shield Standard. "24/7 response team and protection from scaling costs": Shield Advanced.</li><li>The most DDoS-resilient entry point is CloudFront or Route 53 at the edge, not a load balancer on its own.</li></ul>`,
    proAdds: `<p>Designing a complete DDoS-resilient edge and applying it across an organisation with Firewall Manager.</p>` },
  docs: [{ label: 'How AWS Shield works', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html' }]
},
{
  id: 'guardduty', name: 'Amazon GuardDuty', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon GuardDuty'],
  summary: 'Continuous threat detection that watches account activity and network traffic for signs of compromise.',
  what: `<p>GuardDuty analyses AWS log sources with threat intelligence and machine learning and raises findings such as "this instance is talking to a known command-and-control server" or "these credentials are being used from an unusual location". There is nothing to deploy for its core sources.</p>`,
  problem: `<p>Raw logs do not tell you that you have been breached. Someone has to analyse billions of events against known attack patterns. GuardDuty does that continuously for every account.</p>`,
  how: `<ul>
<li><b>Foundational sources</b>, read directly by GuardDuty without you enabling them: CloudTrail management events, VPC Flow Logs and Route 53 Resolver DNS query logs.</li>
<li><b>Optional protection plans:</b> S3 Protection (data events), EKS Protection (audit logs), Runtime Monitoring (an agent on EC2, ECS on Fargate and EKS), Malware Protection (scans EBS volumes of suspect instances, and objects uploaded to S3), RDS Protection (login anomalies) and Lambda Protection (network activity).</li>
<li><b>Findings</b> have a severity and type, appear in the console, and are sent to EventBridge, where rules can notify people or trigger automated response.</li>
<li><b>Multi-account.</b> A delegated administrator account in AWS Organizations enables and views GuardDuty for every member account, including new ones automatically.</li>
<li><b>Regional.</b> Enable it in every Region, including ones you do not use, since attackers like quiet Regions.</li>
</ul>`,
  features: [`<b>No agents or log configuration</b> for foundational detection.`, `<b>Runtime Monitoring</b> for containers and instances.`, `<b>Malware scanning</b> for EBS and S3.`, `<b>Attack sequence findings</b> that correlate several signals into one incident.`, `<b>Suppression rules and trusted IP lists.</b>`],
  when: [`Every account, every Region, from day one.`, `As the detection source for automated responses (isolate an instance, revoke a session).`],
  whenNot: [`<b>Finding software vulnerabilities:</b> Amazon Inspector.`, `<b>Finding sensitive data in S3:</b> Amazon Macie.`, `<b>Checking configuration against a standard:</b> AWS Config and Security Hub.`, `<b>Preventing</b> anything: GuardDuty detects; it does not block.`],
  interactions: [`<b>EventBridge:</b> routes findings to SNS, Lambda or Step Functions.`, `<b>Security Hub:</b> aggregates GuardDuty findings with others.`, `<b>Amazon Detective:</b> investigates a finding's context.`, `<b>Organizations:</b> central enablement.`],
  example: { title: 'Send high-severity findings to an SNS topic (EventBridge event pattern)', lang: 'json',
    code: `{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [{ "numeric": [">=", 7] }]
  }
}`,
    notes: `<p>Use this pattern in an EventBridge rule whose target is an SNS topic or an incident-response Lambda function.</p>` },
  useCases: [`<b>Stolen credentials:</b> a finding that an instance role's credentials are being used from outside AWS.`, `<b>Crypto-mining:</b> an instance querying mining pool domains.`, `<b>Data theft:</b> unusual S3 downloads from a new location.`],
  pricing: `<p>Charged by the volume of events and logs analysed, and per protection plan (for example per GB scanned for malware, per vCPU for runtime monitoring). A 30-day free trial shows the expected cost per account. Cost grows with CloudTrail and flow log volume.</p>`,
  pricingLink: 'https://aws.amazon.com/guardduty/pricing/',
  alternatives: [`<b>Third-party SIEM or detection tools</b> fed from your own log pipeline: more control, far more work.`, `<b>Amazon Security Lake plus your own analytics</b> for custom detection.`],
  mistakes: [`<b>Enabling it in one Region only.</b>`, `<b>Nobody receives the findings.</b> Route high severity to a channel people watch.`, `<b>Ignoring low-severity findings forever</b> instead of suppressing known-good ones and reviewing the rest.`, `<b>Assuming you must turn on VPC Flow Logs first.</b> GuardDuty reads its own copy.`],
  exam: { saa: ['1.2'], sap: ['2.3'],
    trap: `<ul><li>"Detect compromised instances, unusual API calls or crypto-mining": GuardDuty.</li><li>Vulnerabilities: Inspector. Sensitive data: Macie. Configuration drift: Config. Who made an API call: CloudTrail.</li></ul>`,
    proAdds: `<p>Organisation-wide deployment from a delegated security account, automated remediation with EventBridge and Step Functions, and where GuardDuty fits beside Security Hub and Security Lake.</p>` },
  docs: [{ label: 'Amazon GuardDuty User Guide', url: 'https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html' }]
},
{
  id: 'cognito', name: 'Amazon Cognito', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Cognito'],
  summary: 'Sign-up, sign-in and tokens for the users of your own web and mobile applications.',
  what: `<p>Cognito is the identity service for your application's customers. It has two parts that are often confused. <b>User pools</b> are a user directory and an OAuth 2.0 / OpenID Connect provider: they authenticate people and issue tokens. <b>Identity pools</b> exchange a token for temporary AWS credentials so a client can call AWS services directly.</p>`,
  problem: `<p>Building sign-up, password reset, MFA, social login and token handling yourself is slow and risky. Cognito provides them as a managed service that scales to millions of users.</p>`,
  how: `<ul>
<li><b>User pool.</b> Stores users or federates to Google, Apple, Facebook, SAML and OIDC providers. After sign-in it issues JSON Web Tokens: an ID token (who the user is), an access token (what they may call) and a refresh token.</li>
<li><b>OAuth 2.0.</b> Supports the authorisation code flow (with PKCE for mobile and single-page apps) and client credentials for machine-to-machine access, with custom scopes on resource servers.</li>
<li><b>Managed login pages</b> or your own UI through the SDK.</li>
<li><b>Lambda triggers</b> customise the flow: validate sign-ups, add claims to tokens, migrate users from an old system.</li>
<li><b>Identity pool.</b> Maps an authenticated (or guest) identity to an IAM role and returns temporary credentials through STS.</li>
<li><b>Where tokens are checked.</b> API Gateway (Cognito authoriser or JWT authoriser), Application Load Balancer (authenticate action), AppSync, or your own code verifying the token signature.</li>
</ul>`,
  features: [`<b>MFA and passkeys</b>, adaptive authentication and compromised-credential checks in higher tiers.`, `<b>Federation</b> with social and enterprise providers.`, `<b>User groups</b> carried as token claims.`, `<b>Machine-to-machine tokens.</b>`, `<b>Custom attributes</b>, useful for a tenant identifier in multi-tenant applications.`],
  when: [`Customer sign-in for a mobile or web application.`, `Protecting APIs with OAuth 2.0 tokens.`, `Letting app users upload to S3 or call AWS services directly with scoped, temporary credentials (identity pools).`],
  whenNot: [`<b>Employees signing in to AWS accounts:</b> IAM Identity Center.`, `<b>Fine-grained permission rules inside the application:</b> Amazon Verified Permissions or your own logic, using Cognito only for authentication.`, `<b>Complex enterprise identity requirements</b> that need a full-featured identity platform.`],
  interactions: [`<b>API Gateway, ALB, AppSync:</b> validate Cognito tokens.`, `<b>Lambda:</b> triggers.`, `<b>IAM and STS:</b> identity pool roles.`, `<b>AWS WAF:</b> protects user pool endpoints.`, `<b>SES or SNS:</b> email and SMS for verification codes.`],
  example: { title: 'Mobile app sign-in with the authorisation code flow and PKCE', lang: 'text',
    code: `1. App opens the managed login page:
   https://<domain>.auth.<region>.amazoncognito.com/oauth2/authorize
     ?response_type=code&client_id=<app client id>
     &redirect_uri=<app callback>&scope=openid+profile
     &code_challenge=<S256 hash>&code_challenge_method=S256

2. User signs in (password + MFA, or a federated provider).

3. Cognito redirects to the callback with ?code=<one-time code>.

4. App exchanges the code at /oauth2/token, sending the code_verifier.
   Response: id_token, access_token, refresh_token.

5. App calls the API with:  Authorization: Bearer <access_token>
   API Gateway or the load balancer verifies the token before the
   request reaches the service.`,
    notes: `<p>Public clients such as a Flutter app must use PKCE and must not hold a client secret.</p>` },
  useCases: [`<b>Banking app:</b> user pool with MFA; the API checks the access token and reads the customer ID from a claim.`, `<b>Multi-tenant SaaS:</b> a tenant ID in a custom attribute, copied into the token and enforced by the API.`, `<b>Photo upload:</b> identity pool credentials limited to the user's own S3 prefix.`],
  pricing: `<p>User pools are billed per monthly active user, with a free allowance and feature tiers; federated users through SAML or OIDC cost more. Machine-to-machine token requests and SMS messages are billed separately. Identity pools have no charge of their own [[verify]].</p>`,
  pricingLink: 'https://aws.amazon.com/cognito/pricing/',
  alternatives: [`<b>IAM Identity Center:</b> workforce access, not customers.`, `<b>Third-party identity platforms</b> (Auth0, Okta and similar): richer features, separate vendor.`, `<b>Your own identity service:</b> rarely worth the security burden.`],
  mistakes: [`<b>Confusing user pools with identity pools.</b>`, `<b>Using the ID token to call APIs.</b> APIs should receive the access token.`, `<b>The implicit flow or a client secret in a mobile app.</b> Use authorisation code with PKCE.`, `<b>Trusting a tenant ID sent by the client</b> instead of the one in the verified token.`, `<b>Changing required attributes later:</b> some user pool settings cannot be altered after creation.`],
  exam: { saa: ['1.1', '1.2'], sap: ['2.1'],
    trap: `<ul><li>"Authenticate users of a mobile app, including social sign-in": user pool.</li><li>"Give app users temporary access to S3 or DynamoDB": identity pool.</li><li>"Single sign-on for employees to AWS accounts": IAM Identity Center, not Cognito.</li></ul>`,
    proAdds: `<p>Application authentication and authorisation is new, explicit content in SAP-C03: OAuth 2.0 flows and scopes, user pools vs identity pools, tenant context for multi-tenant isolation, and pairing Cognito with Verified Permissions.</p>` },
  docs: [{ label: 'Amazon Cognito Developer Guide', url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html' }]
},
{
  id: 'organizations', name: 'AWS Organizations', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Organizations'],
  summary: 'Groups many AWS accounts under one owner, with one bill and guardrails no account can remove.',
  what: `<p>AWS Organizations lets you create and manage many AWS accounts as one unit. Accounts are arranged in organisational units (OUs), billed together, and governed by policies set from above. It is the foundation of every multi-account design.</p>`,
  problem: `<p>An AWS account is the strongest isolation boundary AWS offers, so serious environments use many of them: per environment, per team, per workload. Without a way to manage them centrally, that turns into dozens of separate bills, logins and security settings.</p>`,
  how: `<ul>
<li><b>Structure.</b> One <i>management account</i> owns the organisation. <i>Member accounts</i> sit under a root, grouped into OUs that can be nested.</li>
<li><b>Consolidated billing.</b> One invoice. Usage is pooled for volume discounts, and Savings Plans and Reserved Instances can be shared across accounts.</li>
<li><b>Service control policies (SCPs)</b> cap what principals in member accounts can do. They never grant; an action needs an Allow from the SCPs at every level above the account <i>and</i> an IAM permission. SCPs do not apply to the management account.</li>
<li><b>Resource control policies (RCPs)</b> cap how resources in member accounts can be accessed, whoever is asking. They are how you say "our S3 buckets can only be reached by our own organisation".</li>
<li><b>Other policy types:</b> tag policies, backup policies, and opt-out policies for AI services' use of your data.</li>
<li><b>Service integration.</b> Many services (CloudTrail, GuardDuty, Config, Security Hub, IAM Identity Center, Backup, RAM) can be enabled for the whole organisation and run from a <i>delegated administrator</i> account, so the management account stays almost unused.</li>
<li><b>Sharing condition.</b> The <code>aws:PrincipalOrgID</code> condition key lets a resource policy trust "anyone in my organisation" without listing accounts.</li>
</ul>`,
  features: [`<b>SCPs and RCPs.</b>`, `<b>Delegated administration</b> for security and operations services.`, `<b>Account creation by API</b>, the basis of account vending.`, `<b>Tag and backup policies.</b>`, `<b>Consolidated billing and discount sharing.</b>`],
  when: [`As soon as you have, or expect, more than one AWS account.`, `Separating production from non-production with a hard boundary.`, `Enforcing rules that even account administrators cannot override.`],
  whenNot: [`<b>Running workloads in the management account.</b> Keep it for billing and organisation management only; SCPs do not protect it.`, `<b>SCPs as your only access control.</b> They set the ceiling; IAM still does the granting.`, `<b>Detecting what has already happened:</b> that is CloudTrail, Config and GuardDuty.`],
  interactions: [`<b>Control Tower:</b> builds a landing zone on top of Organizations.`, `<b>IAM Identity Center:</b> sign-in and permission sets across accounts.`, `<b>CloudTrail, Config, GuardDuty, Security Hub:</b> organisation-wide enablement.`, `<b>AWS RAM:</b> share subnets, transit gateways and more within the organisation.`, `<b>Cost Explorer and Budgets:</b> per-account and per-OU cost views.`],
  example: { title: 'SCP that protects CloudTrail and limits accounts to approved Regions', lang: 'json',
    code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ProtectCloudTrail",
      "Effect": "Deny",
      "Action": ["cloudtrail:StopLogging", "cloudtrail:DeleteTrail"],
      "Resource": "*"
    },
    {
      "Sid": "ApprovedRegionsOnly",
      "Effect": "Deny",
      "NotAction": ["iam:*", "organizations:*", "route53:*", "cloudfront:*", "support:*", "sts:*"],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": { "aws:RequestedRegion": ["ap-southeast-2", "ap-southeast-6"] }
      }
    }
  ]
}`,
    notes: `<p>Global services are excluded with <code>NotAction</code> because their API calls are served from other Regions. Attach the policy to an OU, test it on a sandbox OU first, and keep the default <code>FullAWSAccess</code> policy attached unless you are deliberately building an allow list.</p>` },
  useCases: [`<b>Environment separation:</b> Production, Non-production, Security and Sandbox OUs, each with its own guardrails.`, `<b>Data residency:</b> an SCP that keeps regulated workloads in New Zealand and Sydney Regions.`, `<b>Central security:</b> GuardDuty and Security Hub run from a security account for every member.`],
  pricing: `<p>AWS Organizations is free. You pay for the resources in the accounts and for the services you enable organisation-wide.</p>`,
  pricingLink: 'https://aws.amazon.com/organizations/',
  alternatives: [`<b>Control Tower:</b> not an alternative but a layer on top that sets up the structure and guardrails for you.`, `<b>One account with tags and IAM boundaries:</b> workable for very small setups, weak isolation and hard cost separation.`],
  mistakes: [`<b>Workloads in the management account.</b>`, `<b>Applying a restrictive SCP at the root</b> without testing, locking every account out of something essential.`, `<b>Expecting an SCP to grant access.</b>`, `<b>Forgetting global services</b> in a Region-restriction SCP.`, `<b>A flat structure with no OUs</b>, which makes targeted guardrails impossible later.`],
  exam: { saa: ['1.1'], sap: ['2.3', '3.3'],
    trap: `<ul><li>"Prevent all users in member accounts, including administrators, from X": SCP.</li><li>SCPs do not affect the management account and do not grant permissions.</li><li>"One bill and shared volume discounts across accounts": consolidated billing.</li></ul>`,
    proAdds: `<p>Multi-account governance is a whole task in SAP-C03: OU design, SCP and RCP strategy, data perimeters, delegated administrators, centralised logging accounts, and cost allocation across the organisation.</p>` },
  docs: [{ label: 'AWS Organizations User Guide', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html' }]
},
{
  id: 'identity-center', name: 'AWS IAM Identity Center', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS IAM Identity Center'],
  summary: 'One sign-in for your workforce to every AWS account and many business applications.',
  what: `<p>IAM Identity Center (formerly AWS Single Sign-On) gives employees one place to sign in and then choose an account and a role. It connects to your existing identity provider, so joining, moving and leaving are handled in one directory.</p>`,
  problem: `<p>IAM users in every account mean separate passwords, long-lived access keys, and people who keep access after they leave. Identity Center replaces them with federated, short-lived sessions.</p>`,
  how: `<ul>
<li><b>Identity source.</b> Its own directory, Microsoft Active Directory, or an external provider (Entra ID, Okta, Google Workspace and others) through SAML 2.0, with users and groups synchronised by SCIM.</li>
<li><b>Permission sets.</b> Templates of IAM policies. Assigning a permission set to a group for an account makes Identity Center create the matching IAM role in that account.</li>
<li><b>Assignments.</b> Group + account + permission set. Assign to groups, not individuals.</li>
<li><b>Access.</b> People use the access portal or <code>aws sso login</code> in the CLI and receive temporary credentials. No access keys are stored.</li>
<li><b>Organisation instance.</b> Normally enabled once for the whole AWS Organization, in a home Region, and administered from a delegated administrator account.</li>
<li><b>Attributes for access control.</b> User attributes such as department can be passed as session tags for ABAC.</li>
</ul>`,
  features: [`<b>Multi-account permission sets.</b>`, `<b>SAML and SCIM</b> integration with external identity providers.`, `<b>CLI and SDK</b> sign-in with short-lived credentials.`, `<b>Application assignments</b> for SAML and OAuth applications.`, `<b>Trusted identity propagation</b> so analytics services can act as the signed-in user.`],
  when: [`Any organisation with more than one AWS account or more than a few people.`, `Replacing IAM users and shared credentials.`, `Meeting audit requirements for joiner, mover and leaver control.`],
  whenNot: [`<b>Customers of your application:</b> Amazon Cognito.`, `<b>Workloads and pipelines:</b> IAM roles and OIDC federation, not human sign-in.`, `<b>A single personal account:</b> works, but adds little.`],
  interactions: [`<b>AWS Organizations:</b> lists accounts and OUs to assign.`, `<b>IAM:</b> permission sets become IAM roles.`, `<b>External identity providers:</b> authentication and provisioning.`, `<b>CloudTrail:</b> records sign-ins and role use with the person's identity.`],
  useCases: [`<b>Developers:</b> PowerUser in development accounts, ReadOnly in production.`, `<b>Auditors:</b> a time-limited read-only permission set across all accounts.`, `<b>Leavers:</b> disabling the person in the identity provider removes all AWS access at once.`],
  pricing: `<p>No charge.</p>`,
  pricingLink: 'https://aws.amazon.com/iam/identity-center/',
  alternatives: [`<b>Direct SAML federation to IAM roles</b> in each account: more setup, sometimes needed for special cases.`, `<b>IAM users:</b> legacy for people; avoid.`],
  mistakes: [`<b>Assigning permission sets to individuals</b> instead of groups.`, `<b>AdministratorAccess for everyone</b> because it is the first permission set created.`, `<b>Running Identity Center administration from the management account</b> instead of delegating it.`, `<b>No break-glass access</b> for the day the identity provider is down.`],
  exam: { saa: ['1.1'], sap: ['2.1'],
    scopeNote: 'The SAP-C03 in-scope list names "IAM" but not Identity Center separately. Task 2.1 (identity security architectures) still covers workforce federation, so study it for both exams.',
    trap: `<ul><li>"Employees need single sign-on to multiple AWS accounts using the corporate directory": IAM Identity Center.</li><li>"Mobile app users sign in with Google": Cognito.</li></ul>`,
    proAdds: `<p>Identity source choices and their trade-offs, permission-set design across OUs, ABAC with identity attributes, and emergency access when the identity provider fails.</p>` },
  docs: [{ label: 'IAM Identity Center User Guide', url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html' }]
},
{
  id: 'cloudtrail', name: 'AWS CloudTrail', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS CloudTrail'],
  summary: 'The audit log of every API call in your AWS accounts: who did what, when, and from where.',
  what: `<p>CloudTrail records actions taken through the console, CLI, SDKs and by AWS services as events. It is the source of truth for security investigations, compliance evidence and "who changed this?".</p>`,
  problem: `<p>Without an audit trail you cannot investigate an incident, prove compliance or even find out why something broke. CloudTrail provides one that the people being audited cannot quietly edit.</p>`,
  how: `<ul>
<li><b>Event history.</b> Every account automatically has the last 90 days of management events, viewable for free, per Region.</li>
<li><b>Trails.</b> To keep events longer, a trail delivers them to an S3 bucket (and optionally CloudWatch Logs). Use a <i>multi-Region</i> trail, and in an organisation an <i>organisation trail</i> that covers every account and that member accounts cannot change.</li>
<li><b>Management events</b> are control-plane actions (create, delete, configure). <b>Data events</b> are high-volume actions on resources (S3 object reads and writes, Lambda invocations, DynamoDB item operations); they are off by default and billed.</li>
<li><b>Insights events</b> flag unusual rates of API calls or errors.</li>
<li><b>Integrity validation.</b> Digest files let you prove log files were not altered or deleted.</li>
<li><b>CloudTrail Lake.</b> A managed store you query with SQL, as an alternative to S3 plus Athena.</li>
<li><b>Not real time.</b> Events typically arrive within minutes. For immediate reaction, match the event in EventBridge.</li>
</ul>`,
  features: [`<b>Organisation trails.</b>`, `<b>Log file integrity validation.</b>`, `<b>Data event selectors</b> to log only the resources that matter.`, `<b>CloudTrail Lake</b> with long retention.`, `<b>Insights.</b>`],
  when: [`Always: an organisation trail to a locked-down bucket in a separate log archive account.`, `Data events for buckets holding sensitive data.`, `As the source for alerting on dangerous actions (root sign-in, policy changes).`],
  whenNot: [`<b>Performance metrics or application logs:</b> CloudWatch.`, `<b>What a resource's configuration looked like over time:</b> AWS Config.`, `<b>Network traffic records:</b> VPC Flow Logs.`],
  interactions: [`<b>S3:</b> long-term storage, ideally with Object Lock.`, `<b>CloudWatch Logs and EventBridge:</b> alerting and automation on specific calls.`, `<b>Athena:</b> querying logs in S3.`, `<b>GuardDuty:</b> analyses CloudTrail for threats.`, `<b>KMS:</b> encrypts log files.`],
  example: { title: 'Find who deleted a security group (CLI)', lang: 'bash',
    code: `aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteSecurityGroup \\
  --start-time 2026-11-10T00:00:00Z \\
  --query 'Events[].{time:EventTime,user:Username,id:EventId}' \\
  --output table`,
    notes: `<p>Event history covers 90 days. Older events must come from the trail's S3 bucket or CloudTrail Lake.</p>` },
  useCases: [`<b>Incident investigation:</b> every action taken with a leaked access key.`, `<b>Compliance:</b> evidence of who accessed cardholder data buckets.`, `<b>Change tracking:</b> who opened a security group to the internet.`],
  pricing: `<p>Event history is free. The first copy of management events delivered by a trail is free; additional copies, data events, Insights and CloudTrail Lake are billed by volume. S3 storage for the logs is charged as S3. Data events on busy buckets are the usual cost surprise.</p>`,
  pricingLink: 'https://aws.amazon.com/cloudtrail/pricing/',
  alternatives: [`<b>CloudTrail Lake vs S3 plus Athena:</b> convenience against lower storage cost.`, `<b>Amazon Security Lake:</b> normalises CloudTrail and other logs for security analytics.`],
  mistakes: [`<b>Relying on the 90-day event history</b> as your only record.`, `<b>Logs in the same account as the workloads</b>, where an attacker with admin rights can delete them.`, `<b>No data events</b> on the buckets that matter, so object access cannot be traced.`, `<b>Logging everything as data events</b> and being surprised by the bill.`, `<b>Integrity validation left off.</b>`],
  exam: { saa: ['1.1'], sap: ['2.3', '2.4'],
    trap: `<ul><li>"Who made this API call?": CloudTrail. "How did this resource's settings change?": Config. "CPU or error rate?": CloudWatch.</li><li>S3 object-level activity needs data events to be enabled.</li><li>"Ensure logs have not been tampered with": log file integrity validation.</li></ul>`,
    proAdds: `<p>Organisation trails into a dedicated log archive account, immutability with Object Lock, retention for compliance, and audit trail management for regulated workloads.</p>` },
  docs: [{ label: 'AWS CloudTrail User Guide', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html' }]
},
{
  id: 'config', name: 'AWS Config', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Config'],
  summary: 'Records how every resource is configured over time and checks it against rules.',
  what: `<p>AWS Config keeps an inventory of your resources, records each configuration change, and evaluates resources against rules such as "EBS volumes must be encrypted". It answers "what did this look like last Tuesday?" and "which resources break our policy right now?".</p>`,
  problem: `<p>Cloud resources change constantly. Auditors and security teams need to know current compliance and history without interviewing engineers. Config records it continuously.</p>`,
  how: `<ul>
<li><b>Configuration recorder.</b> Must be turned on per Region. It captures a <i>configuration item</i> each time a recorded resource changes, including relationships between resources.</li>
<li><b>Rules.</b> AWS managed rules cover common checks; custom rules use Lambda or Guard policy language. Rules run on change or on a schedule and mark resources compliant or non-compliant.</li>
<li><b>Conformance packs.</b> Bundles of rules and remediations for a framework, deployable across an organisation.</li>
<li><b>Remediation.</b> A non-compliant resource can trigger a Systems Manager Automation runbook, manually or automatically.</li>
<li><b>Aggregators.</b> Collect compliance data from many accounts and Regions into one view.</li>
<li><b>Detective, not preventive.</b> Config tells you after the change. Prevention is SCPs, IAM and Control Tower proactive controls.</li>
</ul>`,
  features: [`<b>Configuration timeline</b> per resource.`, `<b>Managed and custom rules.</b>`, `<b>Conformance packs.</b>`, `<b>Automatic remediation.</b>`, `<b>Multi-account aggregation</b> and advanced queries in SQL.`],
  when: [`Compliance reporting against internal policy or a standard.`, `Investigating what changed before an incident.`, `As the engine behind Security Hub standards and Control Tower detective controls.`],
  whenNot: [`<b>Blocking a change before it happens:</b> use SCPs or IAM.`, `<b>Who made the change:</b> CloudTrail (Config links to the event).`, `<b>Threat detection:</b> GuardDuty.`],
  interactions: [`<b>Security Hub and Control Tower:</b> depend on Config.`, `<b>Systems Manager Automation:</b> remediation.`, `<b>CloudTrail:</b> the API call behind each change.`, `<b>S3 and SNS:</b> history delivery and notifications.`, `<b>Organizations:</b> organisation rules and aggregators.`],
  useCases: [`<b>Encryption policy:</b> flag any unencrypted volume, bucket or database within minutes.`, `<b>Audit:</b> show that security groups never allowed public database access during the audit period.`, `<b>Auto-fix:</b> re-enable S3 Block Public Access when someone turns it off.`],
  pricing: `<p>Charged per configuration item recorded and per rule evaluation, plus conformance pack evaluations. Accounts with fast-changing resources (auto scaling, ephemeral containers) generate many items; limit recording to the resource types you need or use periodic recording.</p>`,
  pricingLink: 'https://aws.amazon.com/config/pricing/',
  alternatives: [`<b>Security Hub standards:</b> ready-made checks that run on Config underneath.`, `<b>Policy-as-code in the pipeline</b> (checks on Terraform plans): prevents instead of detects; use both.`],
  mistakes: [`<b>Expecting Config to stop a bad change.</b>`, `<b>Recording everything everywhere</b> without checking cost.`, `<b>Enabled in one Region only</b>, leaving global blind spots.`, `<b>Rules with no owner</b>, so non-compliance is reported and ignored.`],
  exam: { saa: ['1.2'], sap: ['2.3', '2.4'],
    trap: `<ul><li>"Evaluate resources against rules and see configuration history": Config.</li><li>"Automatically remediate non-compliant resources": Config rule plus Systems Manager Automation.</li><li>Config detects; SCPs prevent.</li></ul>`,
    proAdds: `<p>Automated compliance monitoring across an organisation: conformance packs, aggregators in a security account, and evidence collection for audits.</p>` },
  docs: [{ label: 'AWS Config Developer Guide', url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html' }]
},
{
  id: 'security-hub', name: 'AWS Security Hub', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  statusNote: 'renamed in 2025; the posture-management service is now called Security Hub CSPM [[verify]]',
  scopeNames: ['AWS Security Hub'],
  summary: 'One place to see security findings from every AWS security service and to score accounts against best-practice standards.',
  what: `<p>Security Hub collects findings from GuardDuty, Inspector, Macie, IAM Access Analyzer, Config and partner products in one format, and runs automated checks against security standards. It is the dashboard and prioritisation layer for cloud security posture.</p>`,
  problem: `<p>Each security service has its own console and finding format, in every account and Region. Nobody can watch them all. Security Hub brings them together and tells you what to fix first.</p>`,
  how: `<ul>
<li><b>Standards.</b> AWS Foundational Security Best Practices, CIS AWS Foundations Benchmark, PCI DSS, NIST SP 800-53 and others. Each standard is a set of <i>controls</i>, most implemented as AWS Config rules, so Config must be recording.</li>
<li><b>Findings</b> from all integrated services arrive in a common format (ASFF) with a severity.</li>
<li><b>Aggregation.</b> Cross-Region aggregation into one Region, and cross-account through a delegated administrator in AWS Organizations with central configuration.</li>
<li><b>Automation.</b> Automation rules update or suppress findings; EventBridge sends them to ticketing, chat or remediation.</li>
<li><b>Naming.</b> In 2025 AWS introduced a broader "Security Hub" that correlates findings into exposures, and renamed the standards-and-findings service described here to Security Hub CSPM [[verify]]. Exam material still says "Security Hub".</li>
</ul>`,
  features: [`<b>Security standards with a score</b> per account.`, `<b>Consolidated findings</b> across services and partners.`, `<b>Central configuration</b> for the organisation.`, `<b>Automation rules.</b>`, `<b>Insights</b> (saved groupings of findings).`],
  when: [`Any multi-account environment that needs a single security view.`, `Measuring accounts against CIS, PCI DSS or AWS best practices.`, `Routing all findings to one workflow.`],
  whenNot: [`<b>As a detector itself:</b> it aggregates and checks posture; threats come from GuardDuty, vulnerabilities from Inspector.`, `<b>Long-term log analytics:</b> Security Lake or a SIEM.`, `<b>Without Config:</b> the standards will not evaluate.`],
  interactions: [`<b>AWS Config:</b> runs the controls.`, `<b>GuardDuty, Inspector, Macie, Access Analyzer, Firewall Manager:</b> finding sources.`, `<b>EventBridge:</b> automation.`, `<b>Organizations:</b> delegated administrator.`],
  useCases: [`<b>PCI DSS preparation:</b> see failing controls per account before the assessor does.`, `<b>Weekly security review:</b> one list of critical findings across 30 accounts.`],
  pricing: `<p>Charged per security check run and per finding ingested, with a free trial. Cost follows the number of accounts, Regions, standards enabled and resources.</p>`,
  pricingLink: 'https://aws.amazon.com/security-hub/pricing/',
  alternatives: [`<b>Third-party cloud security posture tools.</b>`, `<b>Config conformance packs alone:</b> compliance checks without the finding aggregation.`],
  mistakes: [`<b>Enabling every standard</b> and drowning in duplicate controls.`, `<b>Config not enabled</b>, so controls show no data.`, `<b>Treating the score as the goal</b> instead of fixing what matters for your risk.`, `<b>Findings with no route to an owner.</b>`],
  exam: { saa: ['1.2'], sap: ['2.3'],
    trap: `<ul><li>"Single view of security findings across accounts and services" or "check against CIS or PCI DSS": Security Hub.</li><li>It does not replace GuardDuty, Inspector or Macie; it sits above them.</li></ul>`,
    proAdds: `<p>Central security tooling in a dedicated account, organisation-wide standards, and automated response pipelines.</p>` },
  docs: [{ label: 'AWS Security Hub User Guide', url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html' }]
},
{
  id: 'inspector', name: 'Amazon Inspector', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Inspector'],
  summary: 'Automatic, continuous scanning of instances, container images and functions for known software vulnerabilities.',
  what: `<p>Amazon Inspector finds software vulnerabilities (CVEs) and unintended network exposure in EC2 instances, container images in Amazon ECR, and Lambda functions. It discovers workloads automatically and rescans when a new vulnerability is published.</p>`,
  problem: `<p>New vulnerabilities appear daily. Scanning once at build time misses the ones announced afterwards. Inspector keeps an up-to-date list of what is exposed and ranks it.</p>`,
  how: `<ul>
<li><b>EC2:</b> uses the Systems Manager agent to read the software inventory (an agentless mode scans EBS snapshots), and checks network reachability.</li>
<li><b>ECR:</b> scans images when pushed and continues to rescan them as new CVEs are published (enhanced scanning).</li>
<li><b>Lambda:</b> scans function packages and layers, and optionally the code itself.</li>
<li><b>Risk score.</b> Each finding's score is adjusted for context, such as whether the instance is reachable from the internet.</li>
<li><b>Outputs.</b> Findings go to Security Hub and EventBridge. A software bill of materials (SBOM) can be exported.</li>
<li><b>Organisation-wide</b> through a delegated administrator.</li>
</ul>`,
  features: [`<b>Continuous rescanning.</b>`, `<b>Contextual risk scores.</b>`, `<b>ECR enhanced scanning.</b>`, `<b>CI/CD integration</b> to scan images in the pipeline.`, `<b>SBOM export.</b>`],
  when: [`Any environment running EC2, containers or Lambda.`, `Evidence of vulnerability management for PCI DSS or ISO 27001.`, `Gating deployments on image scan results.`],
  whenNot: [`<b>Detecting active attacks:</b> GuardDuty.`, `<b>Penetration testing or application logic flaws:</b> Inspector only knows published vulnerabilities and network paths.`, `<b>Patching:</b> Inspector reports; Systems Manager Patch Manager fixes.`],
  interactions: [`<b>Systems Manager:</b> agent-based inventory and patching.`, `<b>ECR:</b> image scanning.`, `<b>Security Hub and EventBridge:</b> findings and automation.`, `<b>CodePipeline and other CI/CD:</b> scan step before deployment.`],
  useCases: [`<b>Container pipeline:</b> block promotion of an image with a critical CVE.`, `<b>Fleet hygiene:</b> weekly list of internet-reachable instances with high-risk vulnerabilities.`],
  pricing: `<p>Charged per EC2 instance scanned per month, per container image scan and rescan, and per Lambda function scanned. A free trial is available. Cost follows fleet size and image push frequency.</p>`,
  pricingLink: 'https://aws.amazon.com/inspector/pricing/',
  alternatives: [`<b>ECR basic scanning:</b> free, scan on push only, operating system packages only.`, `<b>Third-party scanners</b> in the pipeline.`],
  mistakes: [`<b>Instances not managed by Systems Manager</b>, so they are never scanned.`, `<b>Findings without a patching process.</b>`, `<b>Scanning only at push time</b> with basic scanning and missing later CVEs.`],
  exam: { saa: ['1.2'], sap: ['2.3', '5.2'],
    trap: `<ul><li>"Scan EC2 instances or container images for software vulnerabilities": Inspector.</li><li>"Detect malicious activity": GuardDuty. "Find personal data in S3": Macie.</li></ul>`,
    proAdds: `<p>Security scanning inside CI/CD pipelines is explicit in SAP-C03: scanning and signing images before they are promoted between accounts.</p>` },
  docs: [{ label: 'Amazon Inspector User Guide', url: 'https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html' }]
},
{
  id: 'macie', name: 'Amazon Macie', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Macie'],
  summary: 'Finds personal and other sensitive data in Amazon S3, and flags buckets that are public or unencrypted.',
  what: `<p>Macie uses pattern matching and machine learning to discover sensitive data (names, addresses, card numbers, credentials) in S3 objects, and continuously reports on bucket security: public access, encryption, and sharing outside the organisation.</p>`,
  problem: `<p>Most organisations do not know which of their buckets hold personal data. Privacy law and PCI DSS both require that you do.</p>`,
  features: [`<b>Automated sensitive data discovery</b> that samples every bucket.`, `<b>Targeted discovery jobs</b> for full scans.`, `<b>Managed and custom data identifiers.</b>`, `<b>Bucket inventory</b> with public, shared and unencrypted flags.`],
  when: [`Locating personal data for NZ Privacy Act or GDPR obligations.`, `Proving cardholder data is only where it should be.`, `Before sharing or migrating a data lake.`],
  whenNot: [`<b>Data outside S3</b> (databases, file systems): Macie only covers S3.`, `<b>Threat detection:</b> GuardDuty.`, `<b>Preventing uploads of sensitive data:</b> Macie reports after the fact.`],
  pricing: `<p>Charged per bucket evaluated each month and per GB of data inspected. Sampling keeps cost down; full scans of large buckets are expensive.</p>`,
  pricingLink: 'https://aws.amazon.com/macie/pricing/',
  alternatives: [`<b>GuardDuty S3 Protection:</b> suspicious access to S3, not what the data contains.`, `<b>Third-party data discovery tools</b> for data beyond S3.`],
  mistakes: [`<b>Full discovery jobs on huge buckets</b> without checking the cost estimate.`, `<b>Expecting it to cover RDS or DynamoDB.</b>`],
  exam: { saa: ['1.3'], sap: [],
    trap: `<p>"Identify personally identifiable information in S3": Macie. It is on the SAA-C03 in-scope list and is not listed for SAP-C03.</p>` },
  docs: [{ label: 'Amazon Macie User Guide', url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html' }]
}
);

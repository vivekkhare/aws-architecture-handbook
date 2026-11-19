/* ===== Phase 7: NZ payments platform, interview questions, roadmap, extra cues, flashcards, glossary, troubleshooting ===== */

const PAYMENTS = {
  title: 'Worked example: a New Zealand payments platform',
  summary: 'One realistic system used to tie the handbook together: a Flutter app, Kotlin and Spring Boot APIs, PostgreSQL, and a pipeline from git push to production.',
  diagram: GRID([
    [['app', 'Flutter app', 'web + mobile', 'external'], ['cf', 'CloudFront + WAF', 'edge, TLS', 'edge'], ['alb', 'ALB', 'public subnets', 'network'], ['api', 'Payments API', 'Fargate, private', 'compute']],
    [['cog', 'Cognito', 'OAuth 2.0 / OIDC', 'security'], ['bank', 'Bank / acquirer APIs', 'mTLS, allow-listed', 'external'], ['q', 'SQS + EventBridge', 'async workers', 'data'], ['db', 'Aurora PostgreSQL', 'isolated subnets', 'data']],
    [['gh', 'GitHub Actions', 'OIDC, no keys', 'external'], ['ecr', 'ECR', 'scanned images', 'compute'], ['obs', 'CloudWatch + CloudTrail', 'logs, audit', 'mgmt'], ['sm', 'Secrets Manager + KMS', 'rotation, keys', 'security']]
  ], [['app', 'cf'], ['cf', 'alb'], ['alb', 'api'], ['api', 'db'], ['app', 'cog', 'sign in', true], ['api', 'q'], ['q', 'bank'], ['gh', 'ecr'], ['sm', 'db', '', true]],
    'Top row: the request path. Middle row: identity, partners, asynchronous work and data. Bottom row: what supports the whole system, from the pipeline that delivers images to the API, to secrets, keys, logs and audit.'),
  sections: [
    ['The stack', `<ul>
<li><b>Clients:</b> Flutter for iOS, Android and web. The web build is static files in S3 behind CloudFront.</li>
<li><b>APIs:</b> Kotlin and Spring Boot services in Docker images, run on ECS with Fargate behind an Application Load Balancer.</li>
<li><b>Data:</b> Aurora PostgreSQL for the ledger and customer records; DynamoDB for idempotency keys and sessions; S3 for statements and documents.</li>
<li><b>Integration:</b> SQS and EventBridge between services; outbound calls to bank and acquirer APIs.</li>
<li><b>Delivery:</b> GitHub Actions, Terraform, ECR.</li>
<li><b>Operations:</b> CloudWatch, CloudTrail, GuardDuty, Security Hub, AWS Backup.</li></ul>
<p><b>Why ECS on Fargate and not EKS?</b> A small team, a handful of services, and a compliance scope to keep small. Fargate removes host patching and gives each task its own IAM role and security group. EKS becomes the better choice if the organisation standardises on Kubernetes, needs its ecosystem (operators, service mesh, GitOps), or must run the same platform elsewhere. See <a href="#compare/compute-options">the compute comparison</a>.</p>`],
    ['Accounts: why three accounts and not three VPCs', `<p>Development, test and production each get their own AWS account, inside an organisation with a security account and a log archive account.</p>
<ul><li>An IAM mistake in development cannot touch production data.</li><li>SCPs can be strict on production (no public buckets, no IAM users, approved Regions) and looser in development.</li><li>The cardholder data environment is one account, which keeps the PCI DSS assessment boundary small and clear.</li><li>Costs separate without tags; quotas are independent.</li></ul>
<p>VPCs inside one account share IAM, quotas and every account-level setting, so they do not give the same isolation. See <a href="#concept/multi-account">multi-account strategy</a>.</p>`],
    ['Region: Sydney or New Zealand', `<div class="tablewrap"><table><thead><tr><th></th><th>ap-southeast-2 (Sydney)</th><th>ap-southeast-6 (New Zealand)</th></tr></thead><tbody>
<tr><th>Latency to NZ users</th><td>Roughly 25 to 40 ms</td><td>A few milliseconds</td></tr>
<tr><th>Data residency</th><td>Data is held in Australia</td><td>Data stays in New Zealand</td></tr>
<tr><th>Service coverage</th><td>Nearly everything</td><td>A newer Region with a smaller set; check each service you need [[verify]]</td></tr>
<tr><th>Price</th><td>Baseline</td><td>May differ per service; check the pricing pages</td></tr>
<tr><th>In-country DR</th><td>Melbourne is a second Australian Region</td><td>No second NZ Region; cross-Region DR means Sydney</td></tr>
</tbody></table></div>
<p>A reasonable design today: primary in the New Zealand Region where the required services exist, three Availability Zones for high availability, and encrypted backups or a warm standby in Sydney if the customer contracts and privacy assessment allow data to leave the country. If they do not, in-country resilience relies on the three zones plus offline copies. I am not certain which services are available in the newer Region at the time you read this; verify before committing.</p>`],
    ['From git push to production', `<ol>
<li>A developer opens a pull request. GitHub Actions runs unit tests, static analysis, dependency and secret scanning.</li>
<li>On merge, the workflow obtains short-lived AWS credentials through OIDC. No access keys exist.</li>
<li>It builds the image, tags it with the commit SHA, and pushes to ECR in the tooling account. Inspector scans it.</li>
<li>Terraform plans against the test account; policy checks reject unencrypted storage or open security groups.</li>
<li>The service deploys to test. Integration tests run against it.</li>
<li>After approval, the same image digest deploys to production as a blue/green or rolling deployment with the circuit breaker on.</li>
<li>CloudWatch alarms on error rate and latency trigger automatic rollback.</li>
<li>Database changes follow expand-and-contract so the previous version keeps working.</li></ol>
<p>Detail: <a href="#walkthrough/cicd-oidc">GitHub Actions with OIDC</a> and <a href="#walkthrough/multi-account-pipeline">the cross-account pipeline</a>.</p>`],
    ['Network and IAM boundaries', `<ul>
<li><b>Network:</b> a VPC across three zones. Public subnets hold only the load balancer and NAT gateways; Fargate tasks sit in private subnets; Aurora sits in isolated subnets with no route out. Gateway and interface endpoints serve AWS APIs.</li>
<li><b>Security groups chain:</b> load balancer accepts 443 from CloudFront's prefix list; tasks accept only the load balancer; the database accepts only the tasks.</li>
<li><b>Egress:</b> outbound traffic to banks and acquirers leaves through NAT gateways with fixed Elastic IPs (partners allow-list them), optionally filtered by Network Firewall to approved hostnames.</li>
<li><b>IAM:</b> one task role per service with only the queues, tables, secrets and keys it needs. The pipeline's deploy role can update the service and nothing else. People reach accounts through Identity Center; production access is read-only by default with a time-limited elevated role.</li></ul>`],
    ['Payment data flows', `<ol>
<li>The app authenticates the customer with Cognito (authorisation code flow with PKCE) and receives tokens.</li>
<li>The app sends a payment instruction with an <b>idempotency key</b> and the access token.</li>
<li>WAF applies rate limits; the load balancer forwards to the API, which validates the token and the scope.</li>
<li>The API records the idempotency key (conditional write), creates a pending ledger entry in one database transaction, and publishes an event.</li>
<li>A worker calls the bank or acquirer over mutual TLS, with timeouts and a circuit breaker.</li>
<li>The result updates the ledger with balanced double-entry postings; a completion event drives notifications and analytics.</li>
<li>If the partner call's outcome is unknown, the payment stays pending and a reconciliation job resolves it. Never assume failure and retry a payment blindly.</li></ol>
<p><b>Card data:</b> the simplest way to shrink PCI DSS scope is not to handle card numbers at all: use the acquirer's hosted fields or tokenisation so only tokens reach your systems.</p>`],
    ['Encryption and key management', `<ul>
<li>Customer managed KMS keys per data class and environment: ledger database, documents bucket, secrets.</li>
<li>Key policies name the specific roles that may decrypt. Every use is in CloudTrail.</li>
<li>TLS 1.2 or later everywhere: CloudFront and the load balancer use ACM certificates; the database requires TLS; partner calls use mutual TLS with certificates from Private CA or the partner's CA.</li>
<li>Database credentials are generated and rotated by Secrets Manager and injected at task start.</li>
<li>Sensitive fields (account numbers, identity documents) can be additionally encrypted in the application with envelope encryption.</li></ul>`],
    ['Audit logging', `<ul>
<li>An organisation trail records every API call to a bucket in the log archive account with Object Lock.</li>
<li>Application audit events (who initiated, approved or changed what) are written as structured, append-only records, separate from debug logs, and never contain secrets or full account numbers.</li>
<li>Database activity for privileged users is logged.</li>
<li>Config records configuration history; Security Hub tracks control status.</li>
<li>Retention follows the longest applicable legal requirement; access to logs is itself logged.</li></ul>`],
    ['How the design supports PCI DSS and the Privacy Act', `<p>Concepts only. Compliance is determined by your assessor and legal advisers.</p>
<div class="tablewrap"><table><thead><tr><th>Obligation (in plain terms)</th><th>Design feature</th></tr></thead><tbody>
<tr><td>Limit and isolate where card data lives</td><td>Tokenisation; a separate account and VPC for anything in scope</td></tr>
<tr><td>Restrict network access</td><td>Tiered subnets, chained security groups, WAF, egress filtering</td></tr>
<tr><td>Protect stored data and data in transit</td><td>KMS encryption, TLS, key access limited by policy</td></tr>
<tr><td>Restrict access by need to know; unique IDs; MFA</td><td>Identity Center with MFA, least-privilege roles, no shared accounts</td></tr>
<tr><td>Log and monitor all access</td><td>CloudTrail, application audit trail, GuardDuty, alarms</td></tr>
<tr><td>Find and fix vulnerabilities</td><td>Inspector, pipeline scanning, image rebuilds, patching by replacement</td></tr>
<tr><td>Test security</td><td>Config and Security Hub checks, penetration tests, fault injection</td></tr>
<tr><td>Privacy Act: keep personal information secure, limit use and retention, allow access and correction, notify serious breaches</td><td>Encryption, access control, lifecycle rules, data inventory (Macie), incident runbooks</td></tr>
<tr><td>Privacy Act: safeguards for information sent overseas</td><td>Region choice and SCPs; documented assessment if Sydney is used</td></tr>
</tbody></table></div>
<p>AWS's own attestations come from AWS Artifact. They cover AWS's side of the <a href="#concept/shared-responsibility">shared responsibility model</a> only.</p>`],
    ['Where open banking fits', `<p>New Zealand's open banking regime lets a customer authorise a third party to initiate payments or read account information through standardised bank APIs. The platform acts as that third party.</p>
<ul>
<li><b>Consent:</b> the customer is redirected to their bank, authenticates there, and approves a specific consent. The platform never sees bank credentials.</li>
<li><b>Tokens:</b> the bank returns an authorisation code; the platform's back end exchanges it for tokens. Tokens are stored encrypted (Secrets Manager or an encrypted table), never sent to the mobile app.</li>
<li><b>FAPI-style controls:</b> mutual TLS to the bank, signed requests (JWT), PKCE, short token lifetimes, and exact redirect URI matching.</li>
<li><b>Where it runs:</b> a dedicated integration service in the private subnets, with its own task role, its client certificate and signing key in Secrets Manager or KMS, and egress allowed only to the banks' API hosts.</li>
<li><b>Resilience:</b> bank APIs fail and throttle. Use queues, idempotency keys, timeouts and reconciliation.</li></ul>
<p>The exact standards and accreditation rules change; check the current Payments NZ API Centre and regulator material [[verify]].</p>`],
    ['STRIDE threat model for the main data flows', `<div class="tablewrap"><table><thead><tr><th>Threat</th><th>Example in this system</th><th>Mitigations</th></tr></thead><tbody>
<tr><th>Spoofing</th><td>Stolen tokens used to call the API; a fake service calling an internal API</td><td>Cognito with MFA, short-lived tokens, PKCE, mutual TLS to partners, task roles for service identity</td></tr>
<tr><th>Tampering</th><td>Payment amount changed in transit or in the queue; ledger rows altered</td><td>TLS everywhere, signed partner requests, least-privilege writes, database constraints, append-only ledger, immutable audit logs</td></tr>
<tr><th>Repudiation</th><td>A customer or operator denies initiating a payment</td><td>Application audit trail with user, device and time; CloudTrail; Object Lock on logs</td></tr>
<tr><th>Information disclosure</th><td>Account data leaked through logs, a public bucket, or another tenant's request</td><td>No sensitive data in logs, Block Public Access, KMS key policies, authorisation checks per resource, Macie</td></tr>
<tr><th>Denial of service</th><td>Request floods; a slow bank API exhausting threads</td><td>CloudFront, WAF rate limits, Shield, auto scaling, queues, timeouts, circuit breakers</td></tr>
<tr><th>Elevation of privilege</th><td>A compromised container using broad credentials; a developer changing production</td><td>Narrow task roles, no host access on Fargate, SCPs, permission boundaries, pipeline-only deployments, GuardDuty</td></tr>
</tbody></table></div>`]
  ]
};

const INTERVIEW = [
  ['Design', 'Walk me through how you would design a highly available web application on AWS.', 'Start with requirements: availability target, RTO and RPO, traffic shape, data sensitivity. Then tier by tier: Route 53 and CloudFront at the edge; a load balancer across three zones; stateless compute in an Auto Scaling group or ECS service sized so two zones carry the load; a Multi-AZ database with backups; sessions in an external store; queues between tiers. Add security (WAF, private subnets, least-privilege roles), observability (SLOs, alarms) and infrastructure as code. Finish with what you chose not to do and why, for example no second Region because the stated RTO does not need it.'],
  ['Design', 'When would you choose ECS over EKS, and Fargate over EC2?', 'ECS when the team wants the simplest way to run containers on AWS; EKS when Kubernetes is a requirement for portability, ecosystem or existing skills. Fargate when you want no hosts to manage and per-task isolation; EC2 capacity for GPUs, host agents, or large steady fleets where dense packing and commitments are cheaper. State the operational cost of each, not only the hourly price.'],
  ['Design', 'How do you decide between a relational database and DynamoDB?', 'Start from access patterns. If they are known, key-based and high-volume, and you want zero operations, DynamoDB. If you need joins, ad hoc queries, multi-row transactions with constraints, or the patterns are still changing, relational (Aurora or RDS). Many systems use both: a relational ledger and a key-value store for sessions and idempotency.'],
  ['Design', 'Explain RTO and RPO and how they shape a DR design.', 'RPO is acceptable data loss in time; RTO is acceptable downtime. They are business decisions with a price. Hours for both: backup and restore. Minutes of RTO with seconds of RPO: pilot light or warm standby with continuous replication. Near zero: active/active. Then mention the parts people forget: quotas, secrets and keys in the recovery Region, data-plane failover, and regular tests.'],
  ['Security', 'How do you give an application access to AWS services securely?', 'An IAM role with least privilege attached to the compute (instance profile, task role, execution role), never stored access keys. Scope to specific resources and add conditions. For workloads outside AWS, OIDC federation or IAM Roles Anywhere. Secrets for non-AWS systems live in Secrets Manager with rotation.'],
  ['Security', 'A developer reports AccessDenied reading an S3 object. How do you debug it?', 'Read the error message for the policy type. Then check in order: an explicit deny anywhere; SCPs on the account; the bucket policy (and whether it is cross-account, which needs both sides); the identity policy; a permissions boundary; the KMS key policy if the object uses SSE-KMS; VPC endpoint policy if the call goes through one; object ownership. Use CloudTrail to see the exact request and principal.'],
  ['Security', 'What is the difference between a security group and a network ACL?', 'A security group is stateful, attached to a network interface, and has only allow rules; it can reference other security groups. A network ACL is stateless, attached to a subnet, has ordered allow and deny rules, and needs rules for return traffic. Use security groups for most control and NACLs for coarse subnet boundaries or explicit denies.'],
  ['Security', 'How would you secure a multi-account AWS environment?', 'Organizations with OUs by function; SCPs and RCPs as guardrails; Identity Center federated to the corporate directory; an organisation trail to a log archive account with Object Lock; GuardDuty, Config, Security Hub and Inspector run from a delegated security account with auto-enrolment; a baseline deployed by Control Tower or StackSets; no workloads in the management account; break-glass access that is tested and alarmed.'],
  ['Security', 'How do you handle secrets in a CI/CD pipeline?', 'Avoid them: federate the pipeline to AWS with OIDC so it holds no AWS keys. Runtime secrets are referenced by ARN in the task definition and fetched by the platform at start, so the pipeline never sees values. Scan commits for secrets, and rotate anything that leaks immediately.'],
  ['Networking', 'How do instances in a private subnet reach the internet and AWS services?', 'Outbound internet through a NAT gateway in a public subnet, one per zone for availability. AWS services through VPC endpoints: free gateway endpoints for S3 and DynamoDB, interface endpoints for others. Isolated subnets have no NAT at all and rely on endpoints.'],
  ['Networking', 'You have 40 VPCs across accounts that need to communicate. What do you use?', 'A transit gateway shared through RAM, with separate route tables to segment production from non-production and a shared-services table. Add an inspection VPC if traffic must be filtered. Use PrivateLink or VPC Lattice where teams only need service-level access, and keep peering for any single very high-volume pair to avoid processing charges. Plan non-overlapping CIDRs with IPAM.'],
  ['Networking', 'CloudFront or Global Accelerator?', 'CloudFront for HTTP content: it caches, terminates TLS at the edge, and integrates with WAF. Global Accelerator for TCP or UDP applications, fixed anycast IPs, or fast Regional failover that does not depend on DNS. They can be combined, but usually one is the answer.'],
  ['Reliability', 'How do you make a system resilient to a slow downstream dependency?', 'Timeouts on every call; retries with exponential backoff and jitter, limited in number and only for idempotent operations; a circuit breaker with a fallback; bulkheads so one dependency cannot use every thread; a queue if the work can be asynchronous; load shedding at the edge. Then test it with fault injection.'],
  ['Reliability', 'What does idempotency mean and how do you implement it for a payments API?', 'Repeating a request has the same effect as making it once. The client sends a unique idempotency key. The server stores it with a conditional write before doing the work and stores the result; a repeat returns the stored result. Keys expire with a TTL. Combined with at-least-once messaging, this prevents double charges.'],
  ['Reliability', 'How do you deploy without downtime, and roll back?', 'Blue/green or rolling deployments behind a load balancer with health checks; canary traffic shifting for higher risk changes; automatic rollback on alarms; feature flags to separate deploy from release. Database changes use expand-and-contract so old and new versions both work. The same artefact moves through every environment.'],
  ['Cost', 'Your AWS bill doubled last month. What do you do?', 'Cost Explorer grouped by service, account and usage type to find the change; Cost Anomaly Detection history; check data transfer, NAT gateway processing, CloudWatch Logs ingestion and any new resources. Fix the cause, then add guardrails: budgets with forecast alerts, anomaly detection, tagging and an owner per account.'],
  ['Cost', 'How would you reduce cost for a steady workload on EC2?', 'In order: remove idle resources; right-size from utilisation data; move to Graviton and gp3; scale with demand and schedule non-production; then cover the remaining baseline with a Compute Savings Plan and use Spot for interruptible parts. Committing before right-sizing locks in waste.'],
  ['Operations', 'What would you monitor for an API, and how would you alert?', 'Request rate, error rate and latency percentiles at the load balancer; saturation of compute and database; queue age; dependency latency. Define an SLO on success and latency and alert on error-budget burn rate, so pages mean user impact. Every alarm links to a runbook. Add traces to find which hop is slow.'],
  ['Operations', 'Why infrastructure as code, and how do you keep it safe?', 'Repeatability, review, audit history and fast recovery. Keep it safe with plans or change sets reviewed before apply, policy checks in the pipeline, remote state with locking and encryption, least-privilege deploy roles, no manual changes in production, and drift detection.'],
  ['AI', 'How would you build a question-answering assistant over internal documents?', 'Retrieval-augmented generation: ingest documents into a knowledge base (chunk, embed, store vectors with metadata), retrieve relevant passages per question with a filter for what the user may see, and have the model answer with citations. Add guardrails for harmful content, personal data and prompt attacks; log invocations; evaluate with a test set. Use the smallest model that passes evaluation. Fine-tuning is not the tool for keeping answers current.'],
  ['Behavioural', 'Tell me about a design decision you got wrong.', 'Pick a real example. State the context and constraint, the decision, how you found out it was wrong (a metric, an incident), what you changed, and what you now do differently. Interviewers are checking for ownership and learning, not perfection.'],
  ['Behavioural', 'How do you handle a disagreement about architecture with another engineer?', 'Write down the requirements and the options, agree on the criteria (cost, risk, time, operability), gather evidence with a small test if possible, and decide with the person who owns the outcome. Record the decision and the reasons in an architecture decision record, then commit to it.']
];

const ROADMAP = [
  ['Stage 1: foundations (1 to 2 weeks if revising)', 'Be able to draw and explain a three-tier application on AWS from memory.', [
    ['concept/shared-responsibility', 'Shared responsibility model'], ['concept/global-infrastructure', 'Regions, zones and edge'], ['service/iam', 'IAM'], ['concept/policy-evaluation', 'Policy evaluation logic'], ['service/vpc', 'VPC'], ['walkthrough/vpc-three-tier', 'VPC with three subnet tiers'], ['compare/sg-vs-nacl', 'Security groups vs NACLs'], ['service/ec2', 'EC2'], ['service/s3', 'S3'], ['service/rds', 'RDS'], ['tools/cidr', 'CIDR calculator']]],
  ['Stage 2: Associate core (SAA-C03, about 3 weeks)', 'Cover all four domains, then drill questions until weak areas clear 80%.', [
    ['exam/saa-c03', 'SAA-C03 overview and study plan'], ['exam/saa-c03/domain/1', 'Domain 1: secure architectures'], ['exam/saa-c03/domain/2', 'Domain 2: resilient architectures'], ['exam/saa-c03/domain/3', 'Domain 3: high-performing architectures'], ['exam/saa-c03/domain/4', 'Domain 4: cost-optimised architectures'], ['compare/s3-classes', 'S3 storage classes'], ['compare/load-balancers', 'ALB vs NLB vs GWLB'], ['compare/messaging', 'SQS vs SNS vs EventBridge vs Kinesis'], ['compare/rds-aurora-dynamodb', 'RDS vs Aurora vs DynamoDB'], ['compare/dr-strategies', 'The four DR strategies'], ['walkthrough/fargate-api', 'Containerised API on Fargate'], ['walkthrough/ha-three-az', 'High availability across three zones'], ['exam/cues', 'Decision cues'], ['exam/saa-c03/mock', 'Mock exam']]],
  ['Stage 3: build something (alongside stage 2)', 'Deploy the payments example in a personal account with Terraform. Hands-on work is what makes the exam scenarios obvious.', [
    ['payments', 'NZ payments platform example'], ['walkthrough/cicd-oidc', 'GitHub Actions with OIDC'], ['walkthrough/rds-postgres', 'PostgreSQL on RDS'], ['walkthrough/runtime-secrets', 'Runtime secrets'], ['tools/checklists', 'Security and production checklists']]],
  ['Stage 4: Professional (SAP-C03, about 90 to 120 hours)', 'Shift from "which service" to "which design for an organisation": multi-account, hybrid, migration, cost at scale, AI.', [
    ['exam/sap-c03', 'SAP-C03 overview'], ['exam/bridge', 'Associate to Professional bridge'], ['concept/multi-account', 'Multi-account strategy'], ['walkthrough/landing-zone', 'Landing zone'], ['concept/data-perimeters', 'Data perimeters'], ['walkthrough/hybrid-network', 'Hybrid network'], ['compare/vpc-connectivity', 'Peering vs TGW vs PrivateLink vs Lattice vs Cloud WAN'], ['concept/rto-rpo-dr', 'RTO, RPO and DR'], ['walkthrough/multi-region-active', 'Multi-Region active/active'], ['concept/seven-rs', 'The seven Rs'], ['walkthrough/migration-three-tier', 'Migration walkthrough'], ['concept/multi-tenancy', 'Multi-tenant isolation'], ['concept/genai-architecture', 'Generative AI architecture'], ['walkthrough/rag-bedrock', 'RAG on Bedrock'], ['concept/finops', 'FinOps'], ['concept/observability', 'Observability'], ['exam/sap-c03/mock', 'Mock exam']]],
  ['Stage 5: interviews and the job', 'Turn knowledge into explanations you can give aloud in five minutes each.', [
    ['interview', 'Interview questions with model answers'], ['concept/well-architected', 'Well-Architected Framework'], ['concept/resilience-patterns', 'Resilience patterns'], ['concept/event-driven', 'Event-driven patterns'], ['compare/iac-tools', 'Terraform vs CloudFormation vs CDK'], ['tools/troubleshooting', 'Troubleshooting']]]
];

/* ---- More decision cues ---- */
[
  [['saa', 'sap'], 'Highly available, fault tolerant', 'Multiple Availability Zones for every tier; Auto Scaling; Multi-AZ database; no single NAT gateway or instance.'],
  [['saa', 'sap'], 'Decouple, buffer, absorb spikes', 'Amazon SQS between the components.'],
  [['saa', 'sap'], 'Fan out to several consumers', 'SNS topic with an SQS queue per consumer, or EventBridge rules.'],
  [['saa', 'sap'], 'Exactly-once processing, strict order', 'SQS FIFO with a message group ID.'],
  [['saa', 'sap'], 'Real-time streaming, replay, multiple consumers', 'Kinesis Data Streams (MSK if Kafka is named).'],
  [['saa', 'sap'], 'Load streaming data into S3 or Redshift, minimal effort', 'Amazon Data Firehose.'],
  [['saa', 'sap'], 'Unknown or unpredictable access pattern for objects', 'S3 Intelligent-Tiering.'],
  [['saa', 'sap'], 'Archive, retrieval in hours is fine, lowest cost', 'S3 Glacier Deep Archive (or Flexible Retrieval).'],
  [['saa', 'sap'], 'Cannot be deleted or modified for N years', 'S3 Object Lock in compliance mode; Backup Vault Lock.'],
  [['saa', 'sap'], 'Shared file storage for Linux across zones', 'Amazon EFS.'],
  [['saa', 'sap'], 'Windows file shares, SMB, Active Directory', 'Amazon FSx for Windows File Server.'],
  [['saa', 'sap'], 'HPC, parallel file system', 'Amazon FSx for Lustre.'],
  [['saa', 'sap'], 'Serverless, key-value, single-digit millisecond', 'Amazon DynamoDB (DAX for microseconds).'],
  [['saa', 'sap'], 'MySQL/PostgreSQL compatible, highest availability', 'Amazon Aurora.'],
  [['saa', 'sap'], 'Too many database connections from Lambda', 'RDS Proxy.'],
  [['saa', 'sap'], 'Reduce read load on the database', 'Read replicas and ElastiCache.'],
  [['saa', 'sap'], 'Rotate credentials automatically', 'AWS Secrets Manager.'],
  [['saa', 'sap'], 'Dedicated, single-tenant key hardware', 'AWS CloudHSM.'],
  [['saa', 'sap'], 'SQL injection, cross-site scripting', 'AWS WAF.'],
  [['saa', 'sap'], 'DDoS protection with response team and cost protection', 'AWS Shield Advanced.'],
  [['saa', 'sap'], 'Detect compromised instances or unusual API activity', 'Amazon GuardDuty.'],
  [['saa', 'sap'], 'Find personal data in S3', 'Amazon Macie.'],
  [['saa', 'sap'], 'Scan for software vulnerabilities', 'Amazon Inspector.'],
  [['saa', 'sap'], 'Who made this API call', 'AWS CloudTrail.'],
  [['saa', 'sap'], 'Configuration history and compliance rules', 'AWS Config.'],
  [['saa', 'sap'], 'Prevent an action in all accounts, even for admins', 'Service control policy.'],
  [['saa', 'sap'], 'Single sign-on for employees to AWS accounts', 'IAM Identity Center.'],
  [['saa', 'sap'], 'Sign-in for mobile or web app users', 'Amazon Cognito user pool.'],
  [['saa', 'sap'], 'Static IP addresses, UDP, fast global failover', 'AWS Global Accelerator.'],
  [['saa', 'sap'], 'Cache content close to users', 'Amazon CloudFront.'],
  [['saa', 'sap'], 'Consistent network performance to on-premises', 'AWS Direct Connect.'],
  [['saa', 'sap'], 'Connect on-premises quickly and cheaply', 'AWS Site-to-Site VPN.'],
  [['saa', 'sap'], 'Access instances with no SSH keys or open ports', 'Systems Manager Session Manager.'],
  [['saa', 'sap'], 'Migrate a database with minimal downtime', 'AWS DMS with change data capture (plus SCT if engines differ).'],
  [['saa', 'sap'], 'Lift and shift servers', 'AWS Application Migration Service.'],
  [['saa', 'sap'], 'Coordinate multi-step workflow with retries', 'AWS Step Functions.'],
  [['saa', 'sap'], 'Run for hours, queue of jobs', 'AWS Batch (Spot for cost).'],
  [['sap'], 'All existing and future accounts', 'Organizations integration: delegated administrator with auto-enable, StackSets with automatic deployment, SCPs on OUs.'],
  [['sap'], 'Resources must not be accessible from outside the organisation', 'Resource control policies; aws:PrincipalOrgID conditions.'],
  [['sap'], 'Service-to-service across accounts and VPCs with IAM authorisation', 'Amazon VPC Lattice.'],
  [['sap'], 'Global network with central policy and segments', 'AWS Cloud WAN.'],
  [['sap'], 'Overlapping CIDR ranges', 'PrivateLink or VPC Lattice; not peering or Transit Gateway.'],
  [['sap'], 'Inspect all traffic between VPCs and to the internet', 'Inspection VPC with Network Firewall (or Gateway Load Balancer appliances) and Transit Gateway appliance mode.'],
  [['sap'], 'Answers grounded in private, changing documents', 'RAG with Bedrock Knowledge Bases, not fine-tuning.'],
  [['sap'], 'Block harmful output, redact personal data in AI responses', 'Bedrock Guardrails.'],
  [['sap'], 'Fine-grained authorisation inside a custom application', 'Amazon Verified Permissions.'],
  [['sap'], 'Active-active relational writes across Regions', 'Aurora DSQL (DynamoDB global tables if NoSQL is acceptable).'],
  [['sap'], 'Failover must not depend on control-plane operations', 'Pre-provisioned capacity; Route 53 health checks or ARC routing controls.'],
  [['sap'], 'Verify the design meets RTO and RPO', 'AWS Resilience Hub; test with Fault Injection Service.'],
  [['sap'], 'Lowest RTO/RPO for existing servers at low standing cost', 'AWS Elastic Disaster Recovery.'],
  [['sap'], 'Allocate cost to business units across accounts and tags', 'Cost allocation tags and Cost Categories; CUR for detail.'],
  [['sap'], 'Reduce risk of a release', 'Canary or blue/green with alarm-based automatic rollback.'],
  [['sap'], 'On-premises workload needs AWS credentials without access keys', 'IAM Roles Anywhere.'],
  [['sap'], 'CI/CD outside AWS needs access', 'OIDC federation to an IAM role.'],
  [['sap'], 'Too much data to transfer in the time available', 'Offline transfer (Snow devices, Data Transfer Terminal).'],
  [['sap'], 'Tenants must not affect each other in a pooled model', 'Per-tenant throttling, tenant-scoped IAM sessions, tenant-aware queues.']
].forEach(c => CUES.push({ exams: c[0], phrase: c[1], signal: c[2] }));

/* ---- More flashcards ---- */
[
  [['saa', 'sap'], 'Maximum run time of a Lambda function?', '15 minutes.'],
  [['saa', 'sap'], 'What does RDS Multi-AZ give you, and what does it not?', 'Automatic failover to a synchronous standby in another zone. It does not scale reads (in the instance deployment) and does not protect against a Region failure.'],
  [['saa', 'sap'], 'Which Route 53 record type points a zone apex at a load balancer?', 'An alias record.'],
  [['saa', 'sap'], 'CloudFront custom domain certificate: which Region?', 'us-east-1 (N. Virginia), in ACM.'],
  [['saa', 'sap'], 'Which VPC endpoints are free?', 'Gateway endpoints for S3 and DynamoDB.'],
  [['saa', 'sap'], 'SQS standard vs FIFO delivery?', 'Standard: at-least-once, best-effort order, near-unlimited throughput. FIFO: exactly-once processing, ordered within a message group, limited throughput.'],
  [['saa', 'sap'], 'What must be longer than a Lambda function\'s timeout when it reads from SQS?', 'The queue\'s visibility timeout (AWS suggests at least six times the function timeout).'],
  [['saa', 'sap'], 'S3 Object Lock: governance vs compliance mode?', 'Governance can be bypassed by users with a special permission. Compliance cannot be removed or shortened by anyone, including root.'],
  [['saa', 'sap'], 'What does S3 Cross-Region Replication require?', 'Versioning enabled on both source and destination buckets, and an IAM role for replication.'],
  [['saa', 'sap'], 'How do you encrypt an existing unencrypted EBS volume or RDS instance?', 'Snapshot, copy the snapshot with encryption enabled, restore from the encrypted copy.'],
  [['saa', 'sap'], 'EBS volume scope?', 'One Availability Zone. Move with snapshots.'],
  [['saa', 'sap'], 'Which EC2 metrics need the CloudWatch agent?', 'Memory and disk space utilisation.'],
  [['saa', 'sap'], 'Which purchasing option also covers Fargate and Lambda?', 'Compute Savings Plans.'],
  [['saa', 'sap'], 'How much notice does a Spot Instance get before interruption?', 'Two minutes.'],
  [['saa', 'sap'], 'Placement group types?', 'Cluster (low latency, one zone), spread (distinct hardware, max seven per zone), partition (groups of instances on separate racks).'],
  [['saa', 'sap'], 'DynamoDB item size limit?', '400 KB.'],
  [['saa', 'sap'], 'GSI vs LSI in DynamoDB?', 'GSI: different partition key, added any time, eventually consistent, own capacity. LSI: same partition key, created with the table, supports strong consistency.'],
  [['saa', 'sap'], 'What is DynamoDB point-in-time recovery\'s window?', 'Up to 35 days, to any second.'],
  [['saa', 'sap'], 'Aurora storage layout?', 'Six copies of data across three Availability Zones.'],
  [['saa', 'sap'], 'Cognito user pool vs identity pool?', 'User pool: authenticates users and issues tokens. Identity pool: exchanges tokens for temporary AWS credentials.'],
  [['saa', 'sap'], 'Do SCPs grant permissions?', 'No. They only limit. They also do not apply to the management account.'],
  [['saa', 'sap'], 'What makes a NAT gateway design highly available?', 'One NAT gateway per Availability Zone, with each private route table using the one in its own zone.'],
  [['saa', 'sap'], 'ALB vs NLB in one line each?', 'ALB: layer 7, HTTP routing, WAF. NLB: layer 4, static IPs, TCP/UDP, PrivateLink.'],
  [['saa', 'sap'], 'Is VPC peering transitive?', 'No.'],
  [['saa', 'sap'], 'Is Direct Connect encrypted?', 'Not by default. Add MACsec or an IPsec VPN over it.'],
  [['saa', 'sap'], 'The four DR strategies, cheapest first?', 'Backup and restore, pilot light, warm standby, multi-site active/active.'],
  [['saa', 'sap'], 'RPO vs RTO?', 'RPO: acceptable data loss, measured in time. RTO: acceptable downtime.'],
  [['saa', 'sap'], 'Kinesis Data Streams vs Data Firehose?', 'Streams: real-time, ordered, replayable, you build consumers. Firehose: managed delivery to S3, Redshift, OpenSearch with buffering; no replay.'],
  [['saa', 'sap'], 'Secrets Manager vs Parameter Store, key difference?', 'Secrets Manager rotates secrets automatically and costs per secret. Parameter Store standard tier is free and has no built-in rotation.'],
  [['saa', 'sap'], 'What is the default CloudTrail event history retention?', '90 days of management events. Create a trail for longer.'],
  [['saa', 'sap'], 'S3 Standard-IA minimums?', '30-day minimum storage duration and 128 KB minimum billable object size.'],
  [['saa', 'sap'], 'What does an instance profile do?', 'Attaches an IAM role to an EC2 instance so software gets temporary credentials.'],
  [['sap'], 'SCP vs RCP?', 'SCP limits what principals in your accounts can do. RCP limits who can access resources in your accounts.'],
  [['sap'], 'What does Transit Gateway appliance mode do?', 'Keeps both directions of a flow through the same Availability Zone\'s appliance, so stateful inspection works.'],
  [['sap'], 'What is static stability?', 'The system keeps working during a failure without needing to make changes (no reliance on control-plane calls or scaling during the event).'],
  [['sap'], 'DMS vs SCT?', 'SCT converts schema and code between engines. DMS moves the data and replicates changes.'],
  [['sap'], 'The seven Rs?', 'Retire, retain, rehost, relocate, repurchase, replatform, refactor.'],
  [['sap'], 'RAG vs fine-tuning: when is RAG the answer?', 'When answers must reflect private, changing documents and cite sources. Fine-tuning changes model behaviour, not its knowledge of current documents.'],
  [['sap'], 'What does a Bedrock guardrail do?', 'Filters harmful content, blocks denied topics, redacts sensitive data, detects prompt attacks and checks grounding, on input and output, for any model.'],
  [['sap'], 'Silo, pool, bridge?', 'Multi-tenant models: dedicated resources per tenant; shared resources; a mix.'],
  [['sap'], 'How does a pipeline deploy to many accounts without stored keys?', 'It assumes a scoped deployment role in each target account (cross-account role assumption; OIDC if the CI system is outside AWS).'],
  [['sap'], 'Aurora Global Database: how many writer Regions?', 'One. Secondaries are read-only until promoted (write forwarding is available).'],
  [['sap'], 'What do StackSets with service-managed permissions add?', 'Deployment to whole OUs through Organizations, including automatic deployment to accounts added later.'],
  [['sap'], 'Direct Connect: maximum resilience design?', 'Connections at two or more Direct Connect locations, terminating on separate devices.'],
  [['sap'], 'What is an error budget?', 'The amount of unreliability an SLO allows (for example 0.1% for a 99.9% target). Alert on how fast it is being consumed.']
].forEach((c, i) => FLASHCARDS.push({ id: 'g' + String(i + 1).padStart(2, '0'), exams: c[0], q: c[1], a: c[2] }));

/* ---- More glossary terms ---- */
[
  ['Alias record', 'A Route 53 record that points a name at an AWS resource; works at the zone apex.'],
  ['Anycast', 'One IP address announced from many locations; the network routes each user to the nearest.'],
  ['Blast radius', 'How much is affected when one thing fails or is compromised.'],
  ['Blue/green deployment', 'Run the new version alongside the old, then switch traffic; switching back is the rollback.'],
  ['Canary deployment', 'Send a small share of traffic to the new version first and watch for errors.'],
  ['CDC (change data capture)', 'Reading a database\'s change log to replicate ongoing changes.'],
  ['Cell-based architecture', 'Several independent copies of a stack, each serving a subset of customers.'],
  ['Circuit breaker', 'Stops calling a failing dependency for a period and returns a fallback.'],
  ['Control plane', 'The APIs that create and change resources. Usually less available than the data plane.'],
  ['Data plane', 'The running resources doing the actual work, such as serving requests.'],
  ['Dead-letter queue (DLQ)', 'A queue that receives messages which repeatedly failed processing.'],
  ['Envelope encryption', 'Encrypting data with a data key, and the data key with a master (KMS) key.'],
  ['Error budget', 'The unreliability an SLO permits; a guide for how fast to release.'],
  ['Fan-out', 'Delivering one message to several independent consumers.'],
  ['Federation', 'Trusting an external identity provider to authenticate users or workloads.'],
  ['Golden AMI', 'A prebuilt, hardened machine image that instances launch from.'],
  ['Idempotency', 'Repeating an operation has the same effect as doing it once.'],
  ['Landing zone', 'A prepared multi-account environment with identity, logging, guardrails and networking in place.'],
  ['Least privilege', 'Granting only the permissions a task needs, on only the resources it needs.'],
  ['OIDC', 'OpenID Connect: an identity layer on OAuth 2.0, used for user sign-in and for federating CI systems to AWS.'],
  ['Origin access control (OAC)', 'The way CloudFront authenticates to a private S3 bucket; replaces origin access identity.'],
  ['PKCE', 'Proof Key for Code Exchange: protects the OAuth authorisation code flow for mobile and browser apps.'],
  ['Quorum', 'The minimum number of copies that must agree for a read or write to succeed.'],
  ['RAG', 'Retrieval-augmented generation: fetching relevant documents and giving them to a model with the question.'],
  ['Right-sizing', 'Matching resource size to measured need.'],
  ['Saga', 'A sequence of local transactions with compensating actions instead of one distributed transaction.'],
  ['Shuffle sharding', 'Assigning each customer a different combination of resources so one bad customer affects few others.'],
  ['SLO / SLI', 'Service-level objective and indicator: the reliability target and the measurement it is judged by.'],
  ['Static stability', 'Continuing to operate during a failure without having to make changes.'],
  ['Strangler fig', 'Replacing a legacy system gradually by routing pieces of functionality to new services.'],
  ['Token (LLM)', 'The unit of text a model reads and writes; the basis of inference pricing.'],
  ['Zero trust', 'Verifying every request by identity and context instead of trusting a network location.'],
  ['Zonal shift', 'Temporarily moving traffic away from one Availability Zone.']
].forEach(g => GLOSSARY.push(g));

/* ---- More troubleshooting entries ---- */
[
  ['AccessDenied calling an AWS API', ['Explicit deny in an SCP, boundary or policy', 'Missing identity permission', 'Cross-account: resource policy does not allow the caller', 'KMS key policy does not allow the role', 'VPC endpoint policy blocks the action'], ['Read the full error: it names the policy type', 'Find the call in CloudTrail and note the principal ARN', 'Check SCPs on the account, then the resource policy, then the identity policy', 'For encrypted resources, check kms:Decrypt and the key policy', 'Test with the IAM policy simulator']],
  ['Lambda function times out', ['Function in a VPC with no route to the service it calls', 'Downstream call is slow and has no timeout', 'Cold start plus heavy initialisation', 'Timeout set lower than the work needs'], ['Check whether it runs in a VPC and has NAT or endpoints', 'Look at the duration and init duration in logs', 'Set client timeouts shorter than the function timeout', 'Trace with X-Ray to see where time goes', 'Raise memory (more CPU) or use provisioned concurrency']],
  ['Messages pile up in an SQS queue', ['Consumers failing and returning messages', 'Too few consumers or too little concurrency', 'Visibility timeout shorter than processing time, causing reprocessing', 'A poison message blocking a FIFO message group'], ['Check ApproximateAgeOfOldestMessage and the consumer error rate', 'Look in the dead-letter queue', 'Compare visibility timeout with processing time', 'Scale consumers on backlog per instance', 'For FIFO, check which message group is stuck']],
  ['RDS failover took the application down for minutes', ['Application caches the old DNS answer', 'Connection pool holds dead connections', 'No retry on connection errors', 'Single-AZ instance, so no standby existed'], ['Confirm Multi-AZ is enabled', 'Set the JVM DNS cache TTL low', 'Configure pool validation and maximum lifetime', 'Add retries with backoff', 'Consider RDS Proxy or Aurora for faster failover']],
  ['S3 request returns 403', ['Bucket policy or Block Public Access denies it', 'Object encrypted with a KMS key the caller cannot use', 'Object owned by another account (older ACL-based setups)', 'Request not using TLS where the policy requires it', 'Wrong Region or expired presigned URL'], ['Check the principal and action in CloudTrail data events', 'Review the bucket policy for explicit denies and conditions', 'Check the object\'s encryption key and its key policy', 'Confirm Object Ownership is bucket owner enforced', 'Regenerate the presigned URL']],
  ['CloudFront serves old content after a deployment', ['Objects cached with long lifetimes and unchanged names', 'No invalidation was run', 'Browser cache'], ['Use hashed file names for assets', 'Keep index.html on a short cache time', 'Run an invalidation for changed paths', 'Check the Cache-Control headers set at upload']],
  ['Intermittent 502 or 504 from an Application Load Balancer', ['Target closes idle connections before the load balancer does', 'Targets overloaded or slow', 'Health checks passing while the application is failing', 'Deregistration delay too short during deployments'], ['Set the application keep-alive timeout higher than the ALB idle timeout', 'Check target response time and target 5xx metrics', 'Review health check path and thresholds', 'Check deployment events around the errors']],
  ['Terraform apply fails or wants to recreate resources unexpectedly', ['Manual change in the console (drift)', 'State file out of date or locked', 'Provider version changed defaults', 'A change to an immutable property forces replacement'], ['Read the plan line by line before applying', 'Run a refresh-only plan to see drift', 'Check the state lock and backend', 'Pin provider versions', 'Use lifecycle rules (prevent_destroy) on stateful resources']],
  ['Unexpectedly high AWS bill', ['NAT gateway data processing', 'Data transfer out or between zones and Regions', 'CloudWatch Logs ingestion', 'Idle resources: unattached volumes, old snapshots, unused load balancers and IPs', 'A runaway process or forgotten test environment'], ['Cost Explorer grouped by service, then usage type', 'Check Cost Anomaly Detection', 'Look for NatGateway-Bytes and DataTransfer usage types', 'Review log group sizes and retention', 'Set budgets with forecast alerts']],
  ['Cannot connect to an EC2 instance with Session Manager', ['Instance role lacks AmazonSSMManagedInstanceCore', 'No network path to Systems Manager endpoints', 'SSM Agent not running or outdated', 'Your IAM principal lacks ssm:StartSession'], ['Check the instance appears under Fleet Manager as managed', 'Confirm the instance profile and its policy', 'Private subnet: NAT or interface endpoints for ssm, ssmmessages and ec2messages', 'Check the agent status in the system log']],
  ['Bedrock call is throttled or denied', ['Model access or agreement not enabled for the account or Region', 'Tokens-per-minute or requests-per-minute quota reached', 'IAM policy lacks bedrock:InvokeModel on that model or inference profile', 'An SCP restricts models or requires a guardrail'], ['Confirm the model is available in the Region', 'Check Service Quotas and request an increase', 'Review the IAM policy resource ARNs', 'Add retries with backoff; consider a cross-Region inference profile if residency allows']]
].forEach(t => TROUBLE.push({ symptom: t[0], causes: t[1], checks: t[2] }));

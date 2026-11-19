/* ===== Phase 2, batch D: networking and content delivery ===== */
SERVICES.push(
{
  id: 'route53', name: 'Amazon Route 53', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Route 53'],
  summary: 'Managed DNS, domain registration and health-checked traffic routing.',
  what: `<p>Route 53 answers DNS queries for your domains from a global network, registers domain names, and can steer users to different endpoints by health, latency, location or weight. Inside VPCs, Route 53 Resolver handles private DNS.</p>`,
  problem: `<p>DNS is the first step of every request. It must never be down, and it is also the simplest tool for failover and multi-Region routing.</p>`,
  how: `<ul>
<li><b>Hosted zones.</b> <i>Public</i> zones answer on the internet. <i>Private</i> zones answer only inside associated VPCs.</li>
<li><b>Alias records</b> point a name at an AWS resource (load balancer, CloudFront, S3 website, API Gateway). Unlike a CNAME they work at the zone apex (<code>example.com</code>) and queries to AWS targets are free.</li>
<li><b>Routing policies.</b> <i>Simple</i>; <i>weighted</i> (split by percentage, for canary releases); <i>latency-based</i> (lowest-latency Region); <i>failover</i> (primary and standby); <i>geolocation</i> (by the user's country or continent); <i>geoproximity</i> (by distance, with a bias); <i>multivalue answer</i> (several healthy records); <i>IP-based</i>.</li>
<li><b>Health checks</b> monitor an endpoint, another health check or a CloudWatch alarm, and remove unhealthy records from answers.</li>
<li><b>TTL.</b> Resolvers cache answers for the record's time to live, so failover is only as fast as the TTL allows.</li>
<li><b>Resolver endpoints.</b> <i>Inbound</i> endpoints let on-premises servers resolve AWS private names. <i>Outbound</i> endpoints with forwarding rules let VPCs resolve on-premises names.</li>
<li><b>Resolver DNS Firewall</b> blocks queries to malicious domains. <b>DNSSEC</b> signing is supported for public zones.</li>
<li><b>Application Recovery Controller</b> adds routing controls and zonal shift for deliberate, tested failover.</li>
</ul>`,
  features: [`<b>100% availability SLA</b> for DNS queries.`, `<b>Alias records.</b>`, `<b>Health checks and DNS failover.</b>`, `<b>Hybrid DNS</b> with Resolver endpoints.`, `<b>Traffic Flow</b> visual policies.`, `<b>Route 53 Profiles</b> to share DNS configuration across accounts.`],
  when: [`DNS for any domain used with AWS.`, `Active-passive or active-active multi-Region routing.`, `Private service names inside VPCs.`, `Hybrid name resolution.`],
  whenNot: [`<b>Instant failover without DNS caching:</b> Global Accelerator.`, `<b>Load balancing within a Region:</b> Elastic Load Balancing.`, `<b>Caching content at the edge:</b> CloudFront.`],
  interactions: [`<b>ELB, CloudFront, API Gateway, S3:</b> alias targets.`, `<b>ACM:</b> DNS validation records.`, `<b>CloudWatch:</b> alarms as health check sources.`, `<b>VPC:</b> private zones and Resolver.`, `<b>AWS RAM:</b> sharing resolver rules.`],
  example: { title: 'Active-passive failover between two Regions (Terraform)', lang: 'hcl',
    code: `resource "aws_route53_health_check" "primary" {
  fqdn              = aws_lb.sydney.dns_name
  type              = "HTTPS"
  port              = 443
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
}

resource "aws_route53_record" "primary" {
  zone_id         = aws_route53_zone.main.zone_id
  name            = "api.example.co.nz"
  type            = "A"
  set_identifier  = "primary"
  health_check_id = aws_route53_health_check.primary.id
  failover_routing_policy { type = "PRIMARY" }
  alias {
    name                   = aws_lb.sydney.dns_name
    zone_id                = aws_lb.sydney.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "secondary" {
  zone_id        = aws_route53_zone.main.zone_id
  name           = "api.example.co.nz"
  type           = "A"
  set_identifier = "secondary"
  failover_routing_policy { type = "SECONDARY" }
  alias {
    name                   = aws_lb.auckland.dns_name
    zone_id                = aws_lb.auckland.zone_id
    evaluate_target_health = true
  }
}`,
    notes: `<p>Route 53's data plane (answering queries and evaluating health checks) keeps working even when its control plane is unavailable, which is why health-check failover is preferred over scripts that edit records during an incident.</p>` },
  useCases: [`<b>Regional failover</b> for an API.`, `<b>Canary release:</b> 5% of traffic to a new stack with weighted records.`, `<b>Data residency:</b> geolocation routing keeps New Zealand users on New Zealand infrastructure.`, `<b>Hybrid DNS</b> between a data centre and AWS.`],
  pricing: `<p>Charged per hosted zone per month, per million queries (alias queries to AWS resources are free), per health check, per Resolver endpoint network interface per hour, and annually per registered domain.</p>`,
  pricingLink: 'https://aws.amazon.com/route53/pricing/',
  alternatives: [`<b>Global Accelerator:</b> anycast IPs, failover in seconds without DNS.`, `<b>CloudFront origin failover:</b> for HTTP content.`, `<b>Third-party DNS providers.</b>`],
  mistakes: [`<b>CNAME at the zone apex</b> (not allowed; use an alias).`, `<b>Long TTLs on records you expect to fail over.</b>`, `<b>Failover that depends on someone making an API call</b> during the outage.`, `<b>Confusing geolocation (where the user is) with latency-based routing (what is fastest).</b>`, `<b>Private hosted zone not associated with the VPC</b> that needs it.`],
  exam: { saa: ['2.2', '3.4'], sap: ['1.4', '4.2'],
    trap: `<ul><li>Zone apex to a load balancer: alias record.</li><li>Legal requirement by user location: geolocation. Best performance: latency-based. Shift a percentage: weighted. Standby site: failover.</li><li>On-premises servers resolving private AWS names: Resolver inbound endpoint. VPC resolving on-premises names: outbound endpoint with a forwarding rule.</li></ul>`,
    proAdds: `<p>Multi-Region failover that relies only on data-plane operations, Application Recovery Controller, centralised hybrid DNS shared across accounts, and DNS for a multi-account network.</p>` },
  docs: [{ label: 'Amazon Route 53 Developer Guide', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html' }]
},
{
  id: 'cloudfront', name: 'Amazon CloudFront', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon CloudFront'],
  summary: 'A content delivery network that caches and accelerates content at edge locations close to users.',
  what: `<p>CloudFront serves your content from hundreds of edge locations. Users connect to the nearest one; cached responses return immediately and everything else travels to your <i>origin</i> over the AWS network. It is also the natural place to terminate TLS and attach WAF and DDoS protection.</p>`,
  problem: `<p>An origin in one Region is slow for distant users and exposed to every request and attack. A CDN shortens the distance, absorbs load and shields the origin.</p>`,
  how: `<ul>
<li><b>Distribution.</b> The configuration unit, with a <code>d111111abcdef8.cloudfront.net</code> name and your own domain names.</li>
<li><b>Origins.</b> S3 buckets, load balancers, API Gateway, any HTTP server, and <i>VPC origins</i> (private load balancers or instances with no public exposure).</li>
<li><b>Cache behaviours</b> match URL path patterns and choose the origin, the <i>cache policy</i> (what forms the cache key and for how long), the <i>origin request policy</i> (what is forwarded) and allowed methods.</li>
<li><b>Origin access control</b> lets only your distribution read a private S3 bucket.</li>
<li><b>Restricting viewers.</b> Signed URLs (one file) and signed cookies (many files) for paid or private content; geographic restrictions by country.</li>
<li><b>Origin groups</b> fail over to a second origin on errors.</li>
<li><b>Edge compute.</b> <i>CloudFront Functions</i> (very fast JavaScript for header and URL manipulation) and <i>Lambda@Edge</i> (fuller Node.js or Python functions).</li>
<li><b>Invalidation</b> removes cached objects early. Versioned file names are the better habit.</li>
<li><b>Certificates</b> for custom domains must be in ACM in <code>us-east-1</code>.</li>
</ul>`,
  features: [`<b>Global edge network with regional edge caches.</b>`, `<b>Origin access control and VPC origins.</b>`, `<b>Signed URLs and cookies.</b>`, `<b>Edge functions.</b>`, `<b>Origin Shield</b> to raise cache hit ratio.`, `<b>HTTP/3, field-level encryption, real-time logs.</b>`],
  when: [`Static sites and single-page applications from S3.`, `Global audiences for APIs or dynamic sites (faster TLS and routing even with no caching).`, `Video and download delivery.`, `One hardened public entry point with WAF and Shield.`],
  whenNot: [`<b>Non-HTTP traffic (TCP, UDP):</b> Global Accelerator.`, `<b>Purely internal applications.</b>`, `<b>Users all in one city next to the Region</b> and no need for edge security: the gain is small.`],
  interactions: [`<b>S3:</b> origin with origin access control.`, `<b>ALB, API Gateway:</b> dynamic origins.`, `<b>AWS WAF and Shield:</b> edge protection.`, `<b>ACM (us-east-1) and Route 53:</b> custom domain.`, `<b>Lambda@Edge and CloudFront Functions:</b> edge logic.`],
  example: { title: 'Bucket policy that lets only one distribution read the bucket', lang: 'json',
    code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontOnly",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::example-web-assets/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/E1ABCDEF234567"
      }
    }
  }]
}`,
    notes: `<p>With origin access control configured and Block Public Access left on, the bucket has no public path at all.</p>` },
  useCases: [`<b>Flutter web build</b> in S3 with long cache lifetimes on hashed asset files.`, `<b>API acceleration</b> for users in Europe calling a Sydney origin.`, `<b>Paid video</b> behind signed cookies.`],
  pricing: `<p>Charged for data transferred out to viewers (rates vary by geography), HTTP requests, and extras such as invalidations beyond a free allowance, edge functions and real-time logs. Transfer from AWS origins to CloudFront is free. A flat-rate plan option bundles CDN, WAF and DNS at fixed monthly prices [[verify]].</p>`,
  pricingLink: 'https://aws.amazon.com/cloudfront/pricing/',
  alternatives: [`<b>Global Accelerator:</b> network-layer acceleration with static IPs, no caching.`, `<b>S3 Transfer Acceleration:</b> faster uploads to a bucket.`, `<b>Third-party CDNs.</b>`],
  mistakes: [`<b>Origin still reachable directly</b>, bypassing WAF.`, `<b>Forwarding all headers and cookies</b>, which destroys the cache hit ratio.`, `<b>Caching personalised responses.</b>`, `<b>Certificate requested outside us-east-1.</b>`, `<b>Relying on invalidations for every release</b> instead of versioned file names.`],
  exam: { saa: ['3.4', '1.2', '4.4', '2.2'], sap: ['1.4', '3.2'],
    trap: `<ul><li>Private S3 content served globally: CloudFront with origin access control.</li><li>Per-user access to premium content: signed URLs or cookies.</li><li>Lower latency for global users of static and dynamic HTTP content: CloudFront. For TCP or UDP or fixed IPs: Global Accelerator.</li><li>Lower data transfer cost from S3 to the internet: put CloudFront in front.</li></ul>`,
    proAdds: `<p>Multi-origin designs with failover, edge logic for authentication and routing, protecting origins end to end, and data transfer cost optimisation.</p>` },
  docs: [{ label: 'Amazon CloudFront Developer Guide', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html' }]
},
{
  id: 'api-gateway', name: 'Amazon API Gateway', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon API Gateway'],
  summary: 'A managed front door for APIs: authentication, throttling, routing and monitoring in front of Lambda, containers or any HTTP backend.',
  what: `<p>API Gateway publishes REST, HTTP and WebSocket APIs. It accepts requests, checks who is calling, applies limits, and passes the request to a backend integration. It scales automatically and has no servers.</p>`,
  problem: `<p>Every API needs the same plumbing: TLS, authentication, rate limiting, versioning and logging. API Gateway supplies it so services contain only business logic.</p>`,
  how: `<ul>
<li><b>API types.</b> <i>HTTP APIs</i> are simpler, faster and cheaper, with JWT authorisers built in. <i>REST APIs</i> have the full feature set: usage plans and API keys, request validation, request and response transformation, caching, WAF, resource policies and private APIs. <i>WebSocket APIs</i> keep two-way connections open.</li>
<li><b>Endpoint types</b> (REST). <i>Regional</i>; <i>edge-optimised</i> (fronted by CloudFront); <i>private</i> (reachable only through a VPC interface endpoint).</li>
<li><b>Integrations.</b> Lambda proxy, HTTP backends, direct AWS service calls (for example straight to SQS or Step Functions), and <i>VPC links</i> to private load balancers.</li>
<li><b>Authorisation.</b> IAM (SigV4), Cognito user pools, JWT authorisers, Lambda authorisers (custom logic), resource policies and mutual TLS.</li>
<li><b>Throttling.</b> Account, stage and per-client limits. Excess requests receive HTTP 429.</li>
<li><b>Stages</b> (such as dev and prod) with canary deployments on REST APIs.</li>
<li><b>Limits.</b> Default integration timeout is 29 seconds (can be raised for Regional REST APIs) and the payload limit is 10 MB.</li>
</ul>`,
  features: [`<b>Usage plans and API keys</b> for per-customer quotas.`, `<b>Response caching</b> (REST).`, `<b>Request validation and mapping templates.</b>`, `<b>Custom domain names</b> with ACM certificates.`, `<b>Private APIs.</b>`, `<b>Canary releases.</b>`],
  when: [`Serverless APIs backed by Lambda.`, `Public APIs that need per-client keys, quotas and throttling.`, `A stable API contract in front of changing backends.`, `WebSocket applications such as chat or live dashboards.`],
  whenNot: [`<b>Very high, steady request volume to containers:</b> an ALB is usually cheaper.`, `<b>Requests that run longer than the timeout:</b> accept the request, queue it, and return a job ID.`, `<b>Uploads above 10 MB:</b> issue a presigned S3 URL.`, `<b>GraphQL:</b> AWS AppSync.`, `<b>Internal service-to-service calls:</b> VPC Lattice or internal load balancers.`],
  interactions: [`<b>Lambda:</b> most common backend.`, `<b>Cognito:</b> user authentication.`, `<b>AWS WAF:</b> REST API protection.`, `<b>CloudFront:</b> edge caching and global entry.`, `<b>NLB or ALB through VPC link:</b> private backends.`, `<b>SQS, Step Functions, DynamoDB:</b> direct service integrations.`, `<b>CloudWatch and X-Ray:</b> logs, metrics and traces.`],
  example: { title: 'HTTP API with a JWT authoriser in front of Lambda (Terraform)', lang: 'hcl',
    code: `resource "aws_apigatewayv2_api" "api" {
  name          = "payments"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.api.id
  name             = "cognito"
  authorizer_type  = "JWT"
  identity_sources = ["\$request.header.Authorization"]
  jwt_configuration {
    issuer   = "https://\${aws_cognito_user_pool.users.endpoint}"
    audience = [aws_cognito_user_pool_client.app.id]
  }
}

resource "aws_apigatewayv2_integration" "payments" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.payments.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "create" {
  api_id               = aws_apigatewayv2_api.api.id
  route_key            = "POST /payments"
  target               = "integrations/\${aws_apigatewayv2_integration.payments.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.jwt.id
  authorization_scopes = ["payments/write"]
}`,
    notes: `<p>Requests without a valid token carrying the <code>payments/write</code> scope are rejected before Lambda runs, so you do not pay for them.</p>` },
  useCases: [`<b>Mobile backend:</b> Cognito-authenticated routes to Lambda.`, `<b>Partner API:</b> API keys with a usage plan per partner.`, `<b>Asynchronous ingestion:</b> POST straight into SQS with no compute in the request path.`],
  pricing: `<p>Charged per million requests (HTTP APIs cost less than REST APIs), plus data transfer out. REST API caching is charged per hour by cache size. WebSocket APIs are charged per message and connection minute. Private APIs also incur interface endpoint charges.</p>`,
  pricingLink: 'https://aws.amazon.com/api-gateway/pricing/',
  alternatives: [`<b>Application Load Balancer:</b> cheaper per request at volume, fewer API features.`, `<b>Lambda function URLs:</b> one function, no gateway.`, `<b>AWS AppSync:</b> GraphQL and real-time subscriptions.`, `<b>CloudFront:</b> caching and routing only.`],
  mistakes: [`<b>Choosing REST when HTTP API would do</b>, or the reverse when you need usage plans or WAF.`, `<b>Treating API keys as authentication.</b> They identify a client for quotas; they are not a secret credential.`, `<b>No throttling</b> in front of a backend with limited capacity.`, `<b>Synchronous calls for slow work</b> that hit the timeout.`, `<b>Lambda authoriser with caching off</b>, doubling invocations.`],
  exam: { saa: ['2.1', '1.2', '3.4'], sap: ['1.1', '2.1'],
    trap: `<ul><li>"Throttle and meter third-party developers": REST API usage plans and API keys.</li><li>"Reduce calls to the backend for repeated requests": API Gateway caching.</li><li>"API reachable only from inside the VPC": private API with an interface endpoint.</li><li>Serverless, scales to zero: API Gateway with Lambda.</li></ul>`,
    proAdds: `<p>Multi-account and multi-Region API strategies, private integrations, OAuth scopes and custom authorisers for multi-tenant APIs, and buffering with queues to protect backends.</p>` },
  docs: [{ label: 'Amazon API Gateway Developer Guide', url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html' }]
},
{
  id: 'direct-connect', name: 'AWS Direct Connect', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Direct Connect'],
  summary: 'A dedicated private network link from your data centre to AWS that does not use the internet.',
  what: `<p>Direct Connect is a physical fibre connection between your network and an AWS Direct Connect location. Traffic gets consistent latency and throughput, and data transfer out of AWS over it is cheaper than over the internet.</p>`,
  problem: `<p>Internet VPNs have variable performance and limited throughput. Large data flows, latency-sensitive systems and some compliance rules need a private, predictable path.</p>`,
  how: `<ul>
<li><b>Connections.</b> <i>Dedicated</i> (a whole port: 1, 10, 100 or 400 Gbps [[verify]]) ordered from AWS, or <i>hosted</i> (50 Mbps to 25 Gbps [[verify]]) provided by a partner. Provisioning takes weeks to months.</li>
<li><b>Virtual interfaces.</b> <i>Private</i> (to a VPC's virtual private gateway or a Direct Connect gateway), <i>transit</i> (to transit gateways through a Direct Connect gateway), and <i>public</i> (to AWS public services such as S3 over the private link).</li>
<li><b>Direct Connect gateway.</b> A global object that links one connection to VPCs and transit gateways in many Regions.</li>
<li><b>Not encrypted by default.</b> Add MACsec on supported dedicated ports, or run an IPsec VPN over the connection.</li>
<li><b>Resilience.</b> One connection is a single point of failure. AWS's guidance: two connections at two locations for critical workloads, or a Site-to-Site VPN as a cheaper backup.</li>
<li><b>Routing</b> uses BGP. A link aggregation group bundles several ports into one logical link.</li>
</ul>`,
  features: [`<b>Consistent performance.</b>`, `<b>Direct Connect gateway</b> for multi-Region reach.`, `<b>MACsec encryption.</b>`, `<b>SiteLink</b> to route between your own sites over the AWS backbone.`, `<b>Resiliency Toolkit</b> for tested designs.`],
  when: [`Steady, large data transfer between on premises and AWS.`, `Latency-sensitive hybrid applications.`, `Requirements that traffic must not cross the public internet.`],
  whenNot: [`<b>You need connectivity this week:</b> Site-to-Site VPN is available in minutes.`, `<b>Small or occasional traffic:</b> VPN is cheaper.`, `<b>Remote staff laptops:</b> Client VPN.`],
  interactions: [`<b>Transit Gateway and Direct Connect gateway:</b> reach many VPCs.`, `<b>Site-to-Site VPN:</b> backup path, or encryption on top.`, `<b>Route 53 Resolver:</b> hybrid DNS over the link.`, `<b>Cloud WAN:</b> global network attachment.`],
  useCases: [`<b>Bank core systems on premises</b> with new channels in AWS.`, `<b>Nightly replication of hundreds of gigabytes</b> to S3.`, `<b>Migration programme</b> moving many servers over months.`],
  pricing: `<p>Charged per port-hour by capacity, plus data transfer out per GB at a rate below internet transfer. Inbound transfer is free. Your carrier or partner charges separately for the circuit to the Direct Connect location.</p>`,
  pricingLink: 'https://aws.amazon.com/directconnect/pricing/',
  alternatives: [`<b>Site-to-Site VPN:</b> fast to set up, encrypted, internet-dependent.`, `<b>VPN over Direct Connect:</b> both private and encrypted.`, `<b>Third-party SD-WAN</b> integrated through Transit Gateway Connect.`],
  mistakes: [`<b>Assuming Direct Connect is encrypted.</b>`, `<b>A single connection</b> for a critical workload.`, `<b>Promising it within days.</b>`, `<b>Backup VPN with asymmetric routing</b> because BGP preferences were never set.`],
  exam: { saa: ['3.4', '2.2', '4.4'], sap: ['1.3', '1.4', '3.2'],
    trap: `<ul><li>"Consistent, low latency, high throughput, private": Direct Connect. "Quick, encrypted, low cost": Site-to-Site VPN.</li><li>"Private and encrypted": VPN over Direct Connect, or MACsec.</li><li>"Highly available at lower cost": Direct Connect with a VPN backup. "Maximum resilience": connections at two locations.</li><li>One connection to VPCs in several Regions: Direct Connect gateway.</li></ul>`,
    proAdds: `<p>Resilience models, Direct Connect gateway with transit gateways across accounts, BGP path control, and data transfer cost analysis for hybrid designs.</p>` },
  docs: [{ label: 'AWS Direct Connect User Guide', url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html' }]
},
{
  id: 'vpn', name: 'AWS VPN (Site-to-Site and Client VPN)', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Site-to-Site VPN', 'AWS Client VPN', 'AWS VPN'],
  summary: 'Encrypted tunnels over the internet: Site-to-Site VPN joins a network to AWS, Client VPN joins individual devices.',
  what: `<p><b>Site-to-Site VPN</b> creates IPsec tunnels between your router (the <i>customer gateway</i>) and AWS. <b>Client VPN</b> is a managed OpenVPN-based service for laptops and phones to reach VPC and on-premises resources.</p>`,
  problem: `<p>Private resources need to be reachable from an office, a data centre or remote staff without exposing them to the internet and without waiting for a physical circuit.</p>`,
  how: `<ul>
<li><b>Site-to-Site components.</b> A <i>customer gateway</i> (your device's details), and on the AWS side a <i>virtual private gateway</i> (one VPC) or a <i>transit gateway</i> (many VPCs).</li>
<li><b>Two tunnels</b> per connection, ending in different Availability Zones. Configure both.</li>
<li><b>Routing.</b> Dynamic with BGP (preferred) or static routes. With a transit gateway, equal-cost multipath across several connections raises throughput.</li>
<li><b>Throughput.</b> Each tunnel supports up to about 1.25 Gbps [[verify]].</li>
<li><b>Accelerated VPN</b> uses Global Accelerator so traffic enters the AWS network at the nearest edge (transit gateway attachments only).</li>
<li><b>Client VPN.</b> An endpoint associated with subnets; users authenticate with Active Directory, SAML single sign-on or certificates; authorisation rules decide which networks each group can reach; split tunnelling sends only AWS-bound traffic through the VPN.</li>
</ul>`,
  features: [`<b>Managed, redundant tunnel endpoints.</b>`, `<b>BGP and ECMP.</b>`, `<b>Accelerated VPN.</b>`, `<b>Private IP VPN</b> over Direct Connect.`, `<b>Client VPN with SAML and per-group authorisation.</b>`],
  when: [`Hybrid connectivity needed quickly or at low cost.`, `Backup for Direct Connect.`, `Encrypting traffic on a Direct Connect link.`, `Remote administrator or staff access to private resources.`],
  whenNot: [`<b>Guaranteed bandwidth and latency:</b> Direct Connect.`, `<b>Shell access to instances:</b> Session Manager needs no VPN.`, `<b>Per-application access with device posture checks:</b> AWS Verified Access.`, `<b>Many branch offices in a mesh:</b> Cloud WAN or SD-WAN.`],
  interactions: [`<b>Transit Gateway:</b> one VPN serving many VPCs.`, `<b>Direct Connect:</b> backup or encrypted overlay.`, `<b>IAM Identity Center or a SAML provider:</b> Client VPN sign-in.`, `<b>CloudWatch:</b> tunnel state alarms.`],
  useCases: [`<b>Office to VPC</b> for internal tools.`, `<b>Migration bridge</b> while a Direct Connect circuit is on order.`, `<b>Contractor access</b> through Client VPN limited to one subnet.`],
  pricing: `<p>Site-to-Site: an hourly charge per VPN connection plus data transfer out. Client VPN: hourly per subnet association and per connected client. Accelerated VPN adds Global Accelerator charges.</p>`,
  pricingLink: 'https://aws.amazon.com/vpn/pricing/',
  alternatives: [`<b>Direct Connect.</b>`, `<b>AWS Verified Access:</b> zero-trust access to web applications without a VPN.`, `<b>Self-managed VPN appliances on EC2.</b>`],
  mistakes: [`<b>Only one tunnel configured.</b>`, `<b>Overlapping CIDR ranges</b> between sites and VPCs.`, `<b>Expecting more than a tunnel's throughput</b> without ECMP.`, `<b>Client VPN with full tunnelling</b> sending all staff internet traffic through AWS unintentionally.`],
  exam: { saa: ['3.4', '1.2'], sap: ['1.3', '1.4'],
    trap: `<ul><li>"Connect on premises to AWS immediately, encrypted, lowest cost": Site-to-Site VPN.</li><li>Many VPCs and several sites: terminate VPNs on a transit gateway.</li><li>Remote employees connecting from laptops: Client VPN.</li></ul>`,
    proAdds: `<p>ECMP for throughput, VPN as Direct Connect backup with correct BGP preferences, and choosing between VPN, Verified Access and Cloud WAN.</p>` },
  docs: [{ label: 'AWS Site-to-Site VPN User Guide', url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html' }, { label: 'AWS Client VPN Administrator Guide', url: 'https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html' }]
},
{
  id: 'transit-gateway', name: 'AWS Transit Gateway', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Transit Gateway'],
  summary: 'A Regional network hub that connects many VPCs and on-premises networks through one router.',
  what: `<p>Transit Gateway is a managed router. VPCs, VPN connections and Direct Connect gateways attach to it, and its route tables decide which attachments can reach which. It replaces a web of VPC peering connections with a hub-and-spoke network.</p>`,
  problem: `<p>VPC peering is one-to-one and not transitive: ten VPCs need 45 peering connections, and none of them can share a VPN. A hub scales linearly and gives one place to control routing.</p>`,
  how: `<ul>
<li><b>Attachments.</b> VPCs (one subnet per Availability Zone), Site-to-Site VPNs, Direct Connect gateways, peering to other transit gateways (including other Regions) and Connect attachments for SD-WAN appliances.</li>
<li><b>Route tables.</b> Each attachment is <i>associated</i> with one route table (which it uses to look up destinations) and can <i>propagate</i> its routes into several. Separate route tables are how you isolate production from development while both reach shared services.</li>
<li><b>Sharing.</b> AWS RAM shares the transit gateway with other accounts in the organisation.</li>
<li><b>Inspection.</b> Route traffic through an inspection VPC containing AWS Network Firewall or appliances behind a Gateway Load Balancer. <i>Appliance mode</i> keeps both directions of a flow on the same zone's appliance.</li>
<li><b>VPC side.</b> Each VPC's subnet route tables still need routes pointing at the transit gateway.</li>
<li><b>No overlapping CIDRs.</b> Routing cannot distinguish them.</li>
</ul>`,
  features: [`<b>Thousands of attachments.</b>`, `<b>Segmentation with route tables.</b>`, `<b>Inter-Region peering</b> on the AWS backbone.`, `<b>Centralised egress and inspection.</b>`, `<b>Multicast support.</b>`, `<b>Flow logs and Network Manager.</b>`],
  when: [`More than a handful of VPCs that need to communicate.`, `Shared on-premises connectivity for many VPCs.`, `Centralised inspection or centralised NAT egress.`, `Multi-account landing zones.`],
  whenNot: [`<b>Two or three VPCs with simple needs:</b> VPC peering has no hourly or per-GB processing charge.`, `<b>Exposing one service to consumers:</b> PrivateLink avoids network-level connectivity altogether.`, `<b>A global multi-Region network with central policy:</b> consider AWS Cloud WAN.`, `<b>Overlapping address ranges:</b> PrivateLink or VPC Lattice.`],
  interactions: [`<b>VPC, Site-to-Site VPN, Direct Connect gateway:</b> attachments.`, `<b>AWS RAM and Organizations:</b> cross-account sharing.`, `<b>Network Firewall, Gateway Load Balancer:</b> inspection.`, `<b>Cloud WAN:</b> can peer with or replace transit gateways.`],
  example: { title: 'Hub with isolated spokes and shared services (Terraform, trimmed)', lang: 'hcl',
    code: `resource "aws_ec2_transit_gateway" "hub" {
  default_route_table_association = "disable"
  default_route_table_propagation = "disable"
}

resource "aws_ec2_transit_gateway_route_table" "spokes" { transit_gateway_id = aws_ec2_transit_gateway.hub.id }
resource "aws_ec2_transit_gateway_route_table" "shared" { transit_gateway_id = aws_ec2_transit_gateway.hub.id }

# Spokes look up routes in the "spokes" table, which only knows the shared-services VPC.
resource "aws_ec2_transit_gateway_route_table_association" "prod" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.prod.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.spokes.id
}
resource "aws_ec2_transit_gateway_route_table_propagation" "shared_to_spokes" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.shared.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.spokes.id
}

# Shared services look up routes in the "shared" table, which knows every spoke.
resource "aws_ec2_transit_gateway_route_table_propagation" "prod_to_shared" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.prod.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.shared.id
}`,
    notes: `<p>Because spoke routes are never propagated into the spokes table, production and development cannot reach each other, yet both reach shared services.</p>` },
  useCases: [`<b>Landing zone network:</b> one transit gateway shared to every workload account.`, `<b>Central egress:</b> one set of NAT gateways and a firewall for all VPCs.`, `<b>Two Regions:</b> transit gateways peered for DR replication.`],
  pricing: `<p>An hourly charge per attachment plus a charge per GB of data processed. High-volume traffic between two VPCs is noticeably more expensive through a transit gateway than over peering.</p>`,
  pricingLink: 'https://aws.amazon.com/transit-gateway/pricing/',
  alternatives: [`<b>VPC peering:</b> simple and cheap for few VPCs.`, `<b>PrivateLink:</b> service-level access.`, `<b>VPC Lattice:</b> application-layer service networking.`, `<b>Cloud WAN:</b> policy-driven global network.`, `<b>VPC sharing:</b> several accounts using subnets of one VPC, with no routing between VPCs needed.`],
  mistakes: [`<b>Leaving default association and propagation on</b>, so every VPC can reach every other.`, `<b>Forgetting the routes in VPC subnet route tables.</b>`, `<b>No appliance mode</b> on the inspection VPC attachment, breaking stateful firewalls.`, `<b>Sending bulk data through it</b> without checking the processing charge.`],
  exam: { saa: ['3.4'], sap: ['1.4', '1.3', '3.2'],
    trap: `<ul><li>"Hundreds of VPCs and on-premises networks, simplify management": Transit Gateway.</li><li>VPC peering is not transitive; a transit gateway is.</li><li>Overlapping CIDRs rule out both peering and transit gateways.</li></ul>`,
    proAdds: `<p>Segmented route table design, centralised inspection and egress, inter-Region peering, cost of data processing against peering, and when Cloud WAN or VPC Lattice is the better fit.</p>` },
  docs: [{ label: 'Amazon VPC Transit Gateways', url: 'https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html' }]
},
{
  id: 'privatelink', name: 'AWS PrivateLink', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS PrivateLink'],
  summary: 'Private access to one specific service through a network interface in your VPC, without connecting the networks.',
  what: `<p>PrivateLink is the technology behind <i>interface VPC endpoints</i>. An endpoint places a network interface with a private IP in your subnet. Traffic sent to it reaches a specific service (an AWS service, a partner's service, or your own in another VPC) entirely on the AWS network.</p>`,
  problem: `<p>Peering and transit gateways join whole networks, which is more access than a consumer of a single service should have, and they fail when address ranges overlap. PrivateLink exposes one service in one direction only.</p>`,
  how: `<ul>
<li><b>Consumer side.</b> An interface endpoint in one or more subnets, protected by a security group. With private DNS enabled, the service's normal hostname resolves to the endpoint.</li>
<li><b>Provider side.</b> An <i>endpoint service</i> in front of a Network Load Balancer (or Gateway Load Balancer). The provider approves connection requests and controls which accounts may connect.</li>
<li><b>One-way.</b> Consumers start connections to the provider. The provider cannot reach into the consumer's VPC.</li>
<li><b>Overlapping CIDRs are fine</b> because nothing is routed between the networks.</li>
<li><b>Endpoint policies</b> restrict what can be done through an endpoint to an AWS service.</li>
<li><b>Gateway endpoints</b> for S3 and DynamoDB are a different, free mechanism based on route tables.</li>
<li><b>Resource endpoints</b> extend the idea to individual resources, such as a database, without a load balancer [[verify]].</li>
</ul>`,
  features: [`<b>Private access to most AWS service APIs.</b>`, `<b>Cross-account and cross-Region endpoint services.</b>`, `<b>Works with overlapping address ranges.</b>`, `<b>Reachable from on premises</b> over Direct Connect or VPN.`],
  when: [`Private subnets calling AWS APIs without a NAT gateway.`, `Offering your service to customers' VPCs (a SaaS pattern).`, `Connecting to a partner without exposing your network.`, `Networks with overlapping CIDRs.`],
  whenNot: [`<b>Full two-way connectivity between networks:</b> peering or Transit Gateway.`, `<b>S3 or DynamoDB access from inside the VPC only:</b> the free gateway endpoint.`, `<b>Many services each needing discovery, authentication and routing:</b> VPC Lattice.`],
  interactions: [`<b>Network Load Balancer:</b> fronts an endpoint service.`, `<b>Route 53:</b> private DNS for endpoints.`, `<b>Security groups and endpoint policies:</b> control.`, `<b>Most AWS services:</b> available as interface endpoints.`],
  example: { title: 'Interface endpoint for Secrets Manager (Terraform)', lang: 'hcl',
    code: `resource "aws_vpc_endpoint" "secrets" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-southeast-2.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}`,
    notes: `<p>The endpoint's security group must allow HTTPS (443) inbound from the workloads. With private DNS on, the SDK needs no changes.</p>` },
  useCases: [`<b>Isolated subnets</b> for a cardholder data environment reaching KMS, Secrets Manager and CloudWatch Logs with no internet route.`, `<b>SaaS provider</b> publishing its API into customer VPCs.`, `<b>Shared service</b> consumed by teams whose VPCs overlap.`],
  pricing: `<p>Each interface endpoint is charged per hour per Availability Zone, plus per GB of data processed. Many endpoints across many VPCs add up; some organisations centralise them in a shared VPC. Gateway endpoints are free.</p>`,
  pricingLink: 'https://aws.amazon.com/privatelink/pricing/',
  alternatives: [`<b>NAT gateway:</b> general outbound internet access, public path to AWS APIs.`, `<b>VPC peering, Transit Gateway:</b> network-level connectivity.`, `<b>VPC Lattice:</b> service networking with authentication policies.`],
  mistakes: [`<b>Endpoint security group that does not allow 443 from the clients.</b>`, `<b>Private DNS disabled</b>, so clients keep using the public endpoint.`, `<b>Paying for an S3 interface endpoint</b> when the free gateway endpoint would do.`, `<b>An endpoint in every VPC for every service</b> without checking cost against a NAT gateway.`],
  exam: { saa: ['1.2', '3.4', '4.4'], sap: ['1.4', '3.2'],
    trap: `<ul><li>"Access S3 or DynamoDB privately at no extra cost": gateway endpoint.</li><li>"Expose an application to other VPCs or accounts without peering": PrivateLink endpoint service behind an NLB.</li><li>"Private subnet must call an AWS API without internet access": interface endpoint.</li></ul>`,
    proAdds: `<p>Centralised endpoint architectures, endpoint policies as part of a data perimeter, cross-Region PrivateLink, and SaaS connectivity patterns.</p>` },
  docs: [{ label: 'AWS PrivateLink Guide', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html' }]
},
{
  id: 'global-accelerator', name: 'AWS Global Accelerator', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Global Accelerator'],
  summary: 'Two static anycast IP addresses that route users over the AWS backbone to the nearest healthy Regional endpoint.',
  what: `<p>Global Accelerator gives an application two fixed IP addresses announced from AWS edge locations worldwide. Traffic enters AWS at the edge closest to the user and travels on the AWS network to the best endpoint: a load balancer, an EC2 instance or an Elastic IP in one or more Regions.</p>`,
  problem: `<p>The public internet takes unpredictable routes, and DNS-based failover waits for caches to expire. Global Accelerator improves the path and fails over in seconds without clients changing address.</p>`,
  how: `<ul>
<li><b>Layer 4.</b> Works for TCP and UDP, so it suits gaming, VoIP, IoT and other non-HTTP protocols as well as HTTP.</li>
<li><b>Listeners and endpoint groups.</b> A listener takes a port range; each endpoint group is a Region with a <i>traffic dial</i> (percentage of traffic) and weighted endpoints.</li>
<li><b>Health checks</b> move traffic away from a failed endpoint or Region, typically within a minute.</li>
<li><b>No caching.</b> It proxies connections; it does not store content.</li>
<li><b>Client IP preservation</b> is available for most endpoint types.</li>
<li><b>Custom routing accelerators</b> map users deterministically to specific instances.</li>
</ul>`,
  features: [`<b>Static anycast IPs</b> (you can bring your own).`, `<b>Fast Regional failover.</b>`, `<b>Traffic dials</b> for blue/green between Regions.`, `<b>Shield Standard at the edge.</b>`],
  when: [`Non-HTTP applications with global users.`, `Customers who must allow-list fixed IP addresses.`, `Multi-Region applications needing failover faster than DNS.`],
  whenNot: [`<b>Cacheable HTTP content:</b> CloudFront.`, `<b>Single-Region application with local users.</b>`, `<b>Routing decisions based on HTTP paths or headers:</b> CloudFront or an ALB.`],
  interactions: [`<b>ALB, NLB, EC2, Elastic IP:</b> endpoints.`, `<b>Shield and WAF (on the ALB):</b> protection.`, `<b>Site-to-Site VPN:</b> accelerated VPN.`, `<b>Route 53:</b> alias to the accelerator.`],
  useCases: [`<b>Multiplayer game servers</b> over UDP.`, `<b>B2B API</b> whose customers hard-code firewall rules to two IPs.`, `<b>Active-active across Sydney and Auckland</b> with near-instant failover.`],
  pricing: `<p>A fixed hourly fee per accelerator plus a data transfer premium per GB that depends on the source and destination regions, on top of normal data transfer charges.</p>`,
  pricingLink: 'https://aws.amazon.com/global-accelerator/pricing/',
  alternatives: [`<b>CloudFront:</b> HTTP with caching and edge logic.`, `<b>Route 53 latency or failover routing:</b> cheaper, bound by DNS caching.`],
  mistakes: [`<b>Using it to cache content.</b>`, `<b>Paying for it when users and Region are in the same place.</b>`, `<b>Forgetting endpoints must be healthy in the second Region</b> before a failover is needed.`],
  exam: { saa: ['3.4', '2.2'], sap: ['1.4', '4.2'],
    trap: `<ul><li>Static IP addresses, UDP or TCP, fast failover across Regions: Global Accelerator.</li><li>HTTP content cached at the edge: CloudFront.</li><li>Both improve global performance; only CloudFront caches, only Global Accelerator gives fixed IPs.</li></ul>`,
    proAdds: `<p>Multi-Region active-active entry design and controlled Regional traffic shifting with traffic dials.</p>` },
  docs: [{ label: 'AWS Global Accelerator Developer Guide', url: 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html' }]
},
{
  id: 'network-firewall', name: 'AWS Network Firewall', category: 'networking', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Network Firewall'],
  summary: 'A managed, stateful network firewall and intrusion prevention service for VPC traffic.',
  what: `<p>Network Firewall inspects traffic entering, leaving or crossing VPCs. It filters by IP, port, protocol and domain name, and runs Suricata-compatible intrusion prevention rules. Firewall endpoints sit in dedicated subnets and route tables steer traffic through them.</p>`,
  problem: `<p>Security groups and NACLs cannot filter outbound traffic by domain name or detect attack signatures. Regulated environments usually need both.</p>`,
  features: [`<b>Domain allow lists</b> for outbound traffic (for example only approved payment and update hosts).`, `<b>Stateful and stateless rule groups.</b>`, `<b>Managed threat signatures.</b>`, `<b>TLS inspection.</b>`, `<b>Central management</b> through Firewall Manager; native Transit Gateway attachment.`],
  when: [`Egress filtering by domain.`, `Central inspection VPC for a multi-account network.`, `Compliance requirements for intrusion detection and prevention.`],
  whenNot: [`<b>HTTP application attacks:</b> AWS WAF.`, `<b>Simple port filtering:</b> security groups.`, `<b>You must run a specific vendor's firewall:</b> Gateway Load Balancer with appliances.`],
  pricing: `<p>An hourly charge per firewall endpoint plus a charge per GB processed. Advanced inspection is priced separately.</p>`,
  pricingLink: 'https://aws.amazon.com/network-firewall/pricing/',
  alternatives: [`<b>Route 53 Resolver DNS Firewall:</b> cheap domain filtering at the DNS layer only.`, `<b>Third-party appliances behind Gateway Load Balancer.</b>`, `<b>Security groups and NACLs.</b>`],
  mistakes: [`<b>Asymmetric routing</b> so return traffic bypasses the firewall.`, `<b>Putting workloads in the firewall subnet.</b>`, `<b>Confusing it with WAF.</b>`],
  exam: { saa: ['1.2'], sap: ['1.4'], trap: `<p>"Filter outbound traffic to approved domains" or "intrusion prevention for VPC traffic": Network Firewall. SQL injection or cross-site scripting: WAF.</p>` },
  docs: [{ label: 'AWS Network Firewall Developer Guide', url: 'https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html' }]
},
{
  id: 'vpc-lattice', name: 'Amazon VPC Lattice', category: 'networking', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon VPC Lattice'],
  summary: 'Application-layer networking that connects, secures and monitors services across VPCs and accounts.',
  what: `<p>VPC Lattice lets services call each other across VPCs and accounts without peering, transit gateways or load balancers between them. You create a <i>service network</i>, associate services and VPCs with it, and Lattice handles discovery, routing, authentication and metrics.</p>`,
  problem: `<p>Service-to-service communication across many accounts normally needs network plumbing plus a service mesh. Lattice provides both as one managed service, and it works even when VPC address ranges overlap.</p>`,
  features: [`<b>HTTP, HTTPS, gRPC and TCP</b> services with path and header routing and weighted targets.`, `<b>IAM auth policies</b> on service networks and services (SigV4-signed requests).`, `<b>Targets:</b> instances, IPs, Lambda, ALBs, ECS and EKS workloads.`, `<b>Sharing through AWS RAM.</b>`, `<b>Resource configurations</b> for TCP resources such as databases.`],
  when: [`Many microservices owned by different teams and accounts.`, `Zero-trust service-to-service authorisation.`, `Overlapping CIDRs or mixed compute types.`],
  whenNot: [`<b>General network connectivity</b> (any protocol, any port): Transit Gateway.`, `<b>Public-facing APIs:</b> API Gateway or an ALB.`, `<b>One service exposed to external customers:</b> PrivateLink.`],
  pricing: `<p>Charged per service per hour, per GB processed and per request.</p>`,
  pricingLink: 'https://aws.amazon.com/vpc/lattice/pricing/',
  alternatives: [`<b>PrivateLink:</b> one provider, many consumers.`, `<b>Transit Gateway with internal ALBs.</b>`, `<b>ECS Service Connect:</b> within ECS.`, `<b>Self-managed service mesh</b> such as Istio.`],
  mistakes: [`<b>Auth policies left at "none".</b>`, `<b>Using it for bulk data flows</b> where per-GB cost matters.`],
  exam: { saa: [], sap: ['1.4', '1.1'], trap: `<p>New to SAP-C03. "Service-to-service connectivity across accounts and VPCs with authentication, without managing network connectivity": VPC Lattice.</p>` },
  docs: [{ label: 'Amazon VPC Lattice User Guide', url: 'https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html' }]
},
{
  id: 'cloud-wan', name: 'AWS Cloud WAN', category: 'networking', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Cloud WAN'],
  summary: 'A managed global network defined by one policy document, connecting VPCs, branches and data centres across Regions.',
  what: `<p>Cloud WAN builds a <i>core network</i> across the Regions you choose. A single policy defines <i>segments</i> (isolated routing domains such as production and development), which attachments join which segment, and how segments share routes. AWS creates and peers the underlying routers.</p>`,
  problem: `<p>A multi-Region network made of individually peered transit gateways means hand-managed route tables in every Region. Cloud WAN replaces that with declarative, central policy.</p>`,
  features: [`<b>Segments</b> that span Regions.`, `<b>Tag-based attachment policies.</b>`, `<b>Attachments:</b> VPCs, Site-to-Site VPN, Direct Connect gateways, SD-WAN (Connect), transit gateway route tables.`, `<b>Service insertion</b> to send traffic through inspection.`, `<b>Network Manager dashboard.</b>`],
  when: [`Global organisations with many Regions and sites.`, `Consistent segmentation everywhere.`, `Replacing a mesh of peered transit gateways.`],
  whenNot: [`<b>One or two Regions:</b> Transit Gateway is simpler and cheaper.`, `<b>Service-level connectivity:</b> VPC Lattice or PrivateLink.`],
  pricing: `<p>Charged per core network edge (Region) per hour, per attachment per hour and per GB processed.</p>`,
  pricingLink: 'https://aws.amazon.com/cloud-wan/pricing/',
  alternatives: [`<b>Transit Gateway with inter-Region peering.</b>`, `<b>Third-party SD-WAN.</b>`],
  mistakes: [`<b>Adopting it for a small network.</b>`, `<b>No plan for migrating existing transit gateways.</b>`],
  exam: { saa: [], sap: ['1.4', '1.3'], trap: `<p>"Global network, central policy, segments across Regions": Cloud WAN. A single Region hub: Transit Gateway.</p>` },
  docs: [{ label: 'AWS Cloud WAN documentation', url: 'https://docs.aws.amazon.com/network-manager/latest/cloudwan/what-is-cloudwan.html' }]
}
);

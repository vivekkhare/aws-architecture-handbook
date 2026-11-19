/* ===== Phase 7: concept pages ===== */
const CONCEPTS = [];
const CN = (id, title, summary, tasks, body, related) => CONCEPTS.push({ id, title, summary, tasks, body, related });

CN('shared-responsibility', 'The shared responsibility model', 'AWS secures the cloud itself; you secure what you put in it. Where the line falls depends on the service.',
  { saa: ['1.2', '1.3'], sap: ['2.4'] },
  `<p>AWS is responsible for <b>security of the cloud</b>: buildings, hardware, the virtualisation layer, the network backbone, and the software that runs managed services. You are responsible for <b>security in the cloud</b>: your data, who can access it, and how your resources are configured.</p>
<h2>The line moves with the service type</h2>
<div class="tablewrap"><table><thead><tr><th>Service type</th><th>Example</th><th>AWS handles</th><th>You handle</th></tr></thead><tbody>
<tr><th>Infrastructure</th><td>EC2</td><td>Hardware, hypervisor, facilities</td><td>Operating system patching, firewall rules, software, data, IAM</td></tr>
<tr><th>Container or platform</th><td>RDS, Fargate, ECS</td><td>The above plus the operating system and platform patching</td><td>Network exposure, encryption settings, credentials, schema, data, IAM</td></tr>
<tr><th>Fully managed or serverless</th><td>S3, DynamoDB, Lambda</td><td>Everything up to the service API</td><td>Access policies, encryption choices, your code, data classification</td></tr>
</tbody></table></div>
<h2>Always yours, whatever the service</h2>
<ul><li>Identity and access management.</li><li>Data: classification, encryption choices, backups you are required to keep.</li><li>Network configuration you control (security groups, public access settings).</li><li>Logging and monitoring of your own account.</li><li>Compliance of your workload. AWS's audit reports (from AWS Artifact) cover AWS's part only.</li></ul>
<h2>Why it matters in design</h2>
<p>Choosing a more managed service moves work, and audit scope, to AWS. A payments API on Fargate has no host operating system for you to patch or include in a PCI DSS assessment; the same API on EC2 does.</p>
<h2>Exam traps</h2>
<ul><li>Patching the guest operating system on EC2 is the customer's job. Patching the RDS database engine and host is AWS's (in the window you choose).</li><li>AWS never manages your IAM policies or your bucket policies.</li><li>Encryption is available everywhere, but turning it on and managing key access is usually yours.</li></ul>`,
  [['service/iam', 'AWS IAM'], ['service/detective-artifact', 'AWS Artifact'], ['concept/data-residency', 'Data residency']]);

CN('well-architected', 'The Well-Architected Framework', 'Six pillars AWS uses to judge a design, and the questions behind every exam scenario.',
  { saa: ['2.2', '4.2'], sap: ['1.1', '4.3'] },
  `<p>The framework is a set of design principles and review questions. Exam domains map to it closely, so knowing the pillars tells you what an answer is being judged on.</p>
<div class="tablewrap"><table><thead><tr><th>Pillar</th><th>The question it asks</th><th>Typical moves</th></tr></thead><tbody>
<tr><th>Operational excellence</th><td>Can you run and change it safely?</td><td>Infrastructure as code, small reversible changes, runbooks, observability</td></tr>
<tr><th>Security</th><td>Is access minimal and is data protected?</td><td>Least privilege, defence in depth, encryption, traceability, automated response</td></tr>
<tr><th>Reliability</th><td>Does it keep working and recover?</td><td>Multi-AZ, automatic recovery, tested backups, quotas, loose coupling</td></tr>
<tr><th>Performance efficiency</th><td>Is it using the right resources?</td><td>Right service for the job, managed services, caching, measurement</td></tr>
<tr><th>Cost optimisation</th><td>Is every dollar doing work?</td><td>Right-sizing, elasticity, pricing models, visibility and ownership</td></tr>
<tr><th>Sustainability</th><td>Is the footprint as small as it can be?</td><td>Higher utilisation, managed services, efficient hardware such as Graviton</td></tr>
</tbody></table></div>
<h2>General design principles</h2>
<ul><li>Stop guessing capacity: scale with demand.</li><li>Test at production scale, then tear it down.</li><li>Automate so that experiments are cheap.</li><li>Let architecture evolve.</li><li>Drive decisions with data.</li><li>Practise failure with game days.</li></ul>
<h2>Using it</h2>
<p>The Well-Architected Tool walks a workload through the questions and records risks. <i>Lenses</i> add questions for specific domains: serverless, SaaS, financial services, generative AI.</p>
<h2>Reading exam questions with it</h2>
<p>Qualifiers name the pillar: "most cost-effective" (cost), "least operational overhead" (operational excellence), "highly available" (reliability), "most secure" (security), "best performance" (performance). The correct option satisfies the requirements and wins on the named pillar; options that over-deliver on a different pillar are distractors.</p>`,
  [['service/managed-observability', 'Well-Architected Tool'], ['exam/cues', 'Decision cues']]);

CN('global-infrastructure', 'Regions, Availability Zones, Local Zones and edge', 'The physical layers of AWS and what each isolates you from.',
  { saa: ['2.2', '3.4'], sap: ['1.3', '4.2'] },
  `<div class="tablewrap"><table><thead><tr><th>Layer</th><th>What it is</th><th>Design meaning</th></tr></thead><tbody>
<tr><th>Region</th><td>A separate geographic area with three or more Availability Zones, isolated from other Regions</td><td>Data stays in the Region unless you move it. Choose by latency, residency, service availability and price.</td></tr>
<tr><th>Availability Zone</th><td>One or more data centres with independent power, cooling and networking, kilometres apart, linked by low-latency fibre</td><td>The unit of high availability. Spread across at least two, ideally three.</td></tr>
<tr><th>Local Zone</th><td>An extension of a Region placed in another city</td><td>Single-digit millisecond latency to local users; a subset of services; depends on the parent Region.</td></tr>
<tr><th>Wavelength Zone</th><td>AWS compute inside a telecom 5G network</td><td>Mobile edge applications.</td></tr>
<tr><th>Outposts</th><td>AWS hardware in your own facility</td><td>On-premises latency or residency with AWS APIs.</td></tr>
<tr><th>Edge location</th><td>Hundreds of points of presence</td><td>CloudFront, Route 53, Global Accelerator, WAF and Shield run here.</td></tr>
</tbody></table></div>
<h2>Scope of services</h2>
<ul><li><b>Zonal:</b> EC2 instances, EBS volumes, subnets, a single RDS instance.</li><li><b>Regional:</b> S3, DynamoDB, Lambda, load balancers, VPCs, KMS keys, Auto Scaling groups.</li><li><b>Global:</b> IAM, Organizations, Route 53, CloudFront. Their control planes live in specific Regions (for example IAM in us-east-1), which matters for disaster recovery planning.</li></ul>
<h2>New Zealand</h2>
<p>The AWS Asia Pacific (New Zealand) Region, <code>ap-southeast-6</code>, opened in 2025 with three Availability Zones in the Auckland area. Before that, New Zealand workloads normally ran in Sydney (<code>ap-southeast-2</code>), with an Auckland Local Zone for latency [[verify]]. A new Region launches with fewer services than an established one, so check the Regional services list for anything you depend on before committing to it.</p>
<h2>Exam traps</h2>
<ul><li>Zone names such as <code>ap-southeast-2a</code> map to different physical zones in different accounts. Use zone IDs when coordinating across accounts.</li><li>A Local Zone is not a Region and is not a substitute for multi-AZ.</li><li>"Lowest latency for global users of static content" is edge locations, not more Regions.</li></ul>`,
  [['service/outposts', 'Outposts, Local Zones and Wavelength'], ['concept/availability', 'Multi-AZ and Multi-Region'], ['concept/data-residency', 'Data residency']]);

CN('availability', 'Multi-AZ, Multi-Region and static stability', 'How availability is built, measured and kept during a failure.',
  { saa: ['2.2'], sap: ['4.3', '4.2'] },
  `<h2>Availability arithmetic</h2>
<ul><li>Components in <b>series</b> multiply: two 99.9% dependencies give about 99.8%. Every hard dependency lowers availability.</li><li>Redundant components in <b>parallel</b> multiply their failure rates: two independent 99% copies give 99.99%.</li><li>So: remove hard dependencies, and add independent redundancy.</li></ul>
<div class="tablewrap"><table><thead><tr><th>Availability</th><th>Downtime per year</th></tr></thead><tbody><tr><td>99%</td><td>3.65 days</td></tr><tr><td>99.9%</td><td>8.8 hours</td></tr><tr><td>99.95%</td><td>4.4 hours</td></tr><tr><td>99.99%</td><td>53 minutes</td></tr><tr><td>99.999%</td><td>5 minutes</td></tr></tbody></table></div>
<h2>Multi-AZ</h2>
<p>The baseline for production. Run every tier in at least two zones, three where the data store allows. Zonal services need you to spread them (instances, NAT gateways); Regional services do it for you (S3, DynamoDB, Lambda).</p>
<h2>Static stability</h2>
<p>A system is statically stable if it keeps working during a failure <i>without having to make changes</i>. Control planes (the APIs that create and modify resources) are more complex and less available than data planes (the running resources). During a zone failure many customers try to launch capacity at once. So:</p>
<ul><li>Pre-provision enough capacity in the surviving zones instead of relying on scaling during the event.</li><li>Prefer failover mechanisms that are data-plane actions: health checks, zonal shift, routing controls.</li><li>Do not make recovery depend on creating resources or editing configuration.</li></ul>
<h2>Multi-Region</h2>
<p>Add a second Region only for a stated reason: a recovery objective that a Region failure would breach, regulation, or users far away. It brings asynchronous replication, conflict handling, duplicated deployment, and a need for regular failover practice.</p>
<h2>Grey failures</h2>
<p>A zone or dependency can be slow or partly broken while still passing health checks. Deep health checks, per-zone metrics and the ability to shift traffic away from one zone are what handle this.</p>`,
  [['compare/multi-az-vs-multi-region', 'Multi-AZ vs Multi-Region'], ['walkthrough/ha-three-az', 'Highly available across three zones'], ['service/arc', 'Application Recovery Controller']]);

CN('rto-rpo-dr', 'RTO, RPO and the four DR strategies', 'Two numbers from the business decide which disaster recovery design you can afford.',
  { saa: ['2.2'], sap: ['4.2'] },
  `<ul><li><b>Recovery point objective (RPO):</b> how much data, measured in time, the business accepts losing. It sets how often you back up or how you replicate.</li><li><b>Recovery time objective (RTO):</b> how long the service may be unavailable. It sets how much must already be running in the recovery site.</li></ul>
<p>Both are business decisions with a cost attached. Lower numbers cost more.</p>
<div class="tablewrap"><table><thead><tr><th>Strategy</th><th>What is ready</th><th>RPO</th><th>RTO</th><th>Cost</th></tr></thead><tbody>
<tr><th>Backup and restore</th><td>Backups and infrastructure code</td><td>Hours</td><td>Hours to a day</td><td>Lowest</td></tr>
<tr><th>Pilot light</th><td>Data replicated live; compute defined but off</td><td>Seconds to minutes</td><td>Tens of minutes</td><td>Low</td></tr>
<tr><th>Warm standby</th><td>A small but complete running copy</td><td>Seconds</td><td>Minutes</td><td>Medium</td></tr>
<tr><th>Multi-site active/active</th><td>Full capacity serving traffic</td><td>Near zero</td><td>Near zero</td><td>Highest</td></tr>
</tbody></table></div>
<h2>Building blocks</h2>
<ul><li><b>Data:</b> AWS Backup cross-Region copy, S3 replication (with Replication Time Control), Aurora Global Database, RDS cross-Region replicas, DynamoDB global tables, Elastic Disaster Recovery for servers.</li><li><b>Infrastructure:</b> CloudFormation or Terraform so the recovery site can be created or scaled the same way every time; images copied to the recovery Region.</li><li><b>Routing:</b> Route 53 failover records with health checks, Application Recovery Controller, Global Accelerator.</li></ul>
<h2>What plans forget</h2>
<ul><li>Service quotas and capacity in the recovery Region.</li><li>Secrets, parameters, certificates and KMS keys there.</li><li>Dependencies outside AWS: payment partners with IP allow lists, DNS at another provider.</li><li>How to fail <i>back</i>.</li><li>Testing. A plan is a hypothesis until it has been run.</li></ul>
<h2>Backups are not DR by themselves, and replication is not backup</h2>
<p>Replication copies mistakes and ransomware instantly. Keep point-in-time backups in a separate account, with Vault Lock, alongside any replication.</p>`,
  [['compare/dr-strategies', 'The four DR strategies'], ['walkthrough/dr-four-ways', 'One system, four DR designs'], ['service/backup', 'AWS Backup']]);

CN('replication', 'Replication: synchronous, asynchronous and what each costs', 'How copies of data stay in step, and what you give up either way.',
  { saa: ['2.2', '3.3'], sap: ['1.5', '4.2'] },
  `<div class="tablewrap"><table><thead><tr><th></th><th>Synchronous</th><th>Asynchronous</th></tr></thead><tbody>
<tr><th>Write acknowledged</th><td>After the copy confirms</td><td>Before the copy receives it</td></tr>
<tr><th>Data loss on failure</th><td>None</td><td>Up to the replication lag</td></tr>
<tr><th>Write latency</th><td>Adds the round trip to the copy</td><td>Unaffected</td></tr>
<tr><th>Practical distance</th><td>Within a Region</td><td>Any distance</td></tr>
</tbody></table></div>
<h2>How AWS services replicate</h2>
<div class="tablewrap"><table><thead><tr><th>Service</th><th>Within a Region</th><th>Across Regions</th></tr></thead><tbody>
<tr><th>RDS</th><td>Multi-AZ: synchronous standby</td><td>Read replicas: asynchronous</td></tr>
<tr><th>Aurora</th><td>Six copies, quorum writes across three zones</td><td>Global Database: asynchronous, typically under a second</td></tr>
<tr><th>DynamoDB</th><td>Three zones, synchronous</td><td>Global tables: asynchronous multi-writer (strong consistency option available)</td></tr>
<tr><th>S3</th><td>Multiple zones automatically</td><td>Replication: asynchronous; RTC gives a 15-minute target</td></tr>
<tr><th>EFS</th><td>Regional file systems span zones</td><td>EFS replication: asynchronous</td></tr>
<tr><th>EBS</th><td>Within one zone only</td><td>Snapshot copy</td></tr>
<tr><th>ElastiCache</th><td>Replicas: asynchronous</td><td>Global Datastore: asynchronous</td></tr>
</tbody></table></div>
<h2>Consistency after replication</h2>
<ul><li><b>Read-after-write:</b> a replica may not yet have what the user just wrote. Send those reads to the writer.</li><li><b>Multi-writer conflicts:</b> global tables resolve with last writer wins. Avoid conflicts by routing each user or key to one Region.</li><li><b>Ordering:</b> asynchronous copies can apply changes slightly out of step across tables.</li></ul>
<h2>Rules of thumb</h2>
<ul><li>Synchronous within a Region for availability; asynchronous across Regions for disaster recovery.</li><li>The replication lag is your real RPO. Monitor it.</li><li>Replication does not protect against deletion or corruption. Backups do.</li></ul>`,
  [['service/aurora', 'Amazon Aurora'], ['service/dynamodb', 'Amazon DynamoDB'], ['concept/rto-rpo-dr', 'RTO, RPO and DR']]);

CN('policy-evaluation', 'IAM policy evaluation logic', 'The exact order AWS uses to decide whether a request is allowed.',
  { saa: ['1.1'], sap: ['2.1', '2.3'] },
  `<p>Every request starts as <b>denied</b>. AWS then gathers every policy that applies and works through them.</p>
<ol>
<li><b>Explicit deny.</b> If any applicable policy has a matching Deny, the request is denied. Nothing overrides this.</li>
<li><b>Resource control policies (RCPs).</b> If the resource's account is in an organisation, RCPs must not block the access.</li>
<li><b>Service control policies (SCPs).</b> If the principal's account is in an organisation, an SCP at every level (root, each OU, account) must allow the action.</li>
<li><b>Resource-based policy.</b> If one allows the principal, that can be sufficient within the same account.</li>
<li><b>Identity-based policy.</b> Must allow the action (unless the resource policy already granted it in the same account).</li>
<li><b>Permissions boundary.</b> If one is set on the principal, it must also allow the action.</li>
<li><b>Session policy.</b> If the role session was created with one, it must also allow the action.</li>
</ol>
<p>If nothing allows it, the result is an <i>implicit deny</i>.</p>
<h2>Same account vs cross-account</h2>
<ul><li><b>Same account:</b> an Allow in <i>either</i> the identity policy <i>or</i> the resource policy is enough.</li><li><b>Cross-account:</b> you need an Allow on <i>both</i> sides: the resource policy in the owning account, and the identity policy in the caller's account.</li><li><b>KMS is stricter:</b> the key policy must allow access (directly or by delegating to IAM) even in the same account.</li></ul>
<h2>Useful condition keys</h2>
<ul><li><code>aws:PrincipalOrgID</code>: caller belongs to my organisation.</li><li><code>aws:SourceVpce</code>, <code>aws:SourceVpc</code>: request came through my endpoint or VPC.</li><li><code>aws:SecureTransport</code>: request used TLS.</li><li><code>aws:RequestedRegion</code>: Region restrictions.</li><li><code>aws:PrincipalTag</code>, <code>aws:ResourceTag</code>: attribute-based access control.</li><li><code>aws:SourceArn</code>, <code>aws:SourceAccount</code>: confused-deputy protection for service principals.</li></ul>
<h2>Debugging an AccessDenied</h2>
<p>The error message now states which policy type caused the denial. Check, in order: an explicit deny anywhere; an SCP; the resource policy; the identity policy; a boundary; the KMS key policy if encryption is involved. The IAM policy simulator and Access Analyzer help confirm.</p>`,
  [['service/iam', 'AWS IAM'], ['compare/policy-types', 'SCP vs RCP vs boundary vs identity policy'], ['service/organizations', 'AWS Organizations']]);

CN('multi-account', 'Multi-account strategy and landing zones', 'Why serious AWS environments use many accounts, and how they are organised.',
  { saa: ['1.1'], sap: ['2.3'] },
  `<h2>Why accounts, not just VPCs</h2>
<ul><li><b>Isolation.</b> An account is a hard boundary for IAM, quotas and blast radius. A mistake or compromise in development cannot reach production resources.</li><li><b>Guardrails.</b> SCPs attach to accounts and OUs, so different environments can have different rules.</li><li><b>Cost.</b> Each account's spend is separate with no tagging required.</li><li><b>Quotas.</b> One team's usage cannot exhaust another's limits.</li><li><b>Compliance scope.</b> A cardholder data environment in its own account keeps everything else out of the assessment.</li></ul>
<h2>A common structure</h2>
<div class="tablewrap"><table><thead><tr><th>OU</th><th>Accounts</th><th>Purpose</th></tr></thead><tbody>
<tr><th>(root)</th><td>Management</td><td>Billing and organisation management only. No workloads.</td></tr>
<tr><th>Security</th><td>Log archive, Security tooling (audit)</td><td>Immutable logs; delegated administrator for security services</td></tr>
<tr><th>Infrastructure</th><td>Network, Shared services</td><td>Transit gateway, DNS, CI/CD tooling, golden images</td></tr>
<tr><th>Workloads</th><td>Prod and non-prod accounts per application</td><td>The actual systems, with stricter guardrails on Prod</td></tr>
<tr><th>Sandbox</th><td>Per team or person</td><td>Experiments, with budgets and no corporate network</td></tr>
<tr><th>Suspended</th><td>Accounts being closed</td><td>Deny-all SCP</td></tr>
</tbody></table></div>
<h2>The landing zone</h2>
<p>A landing zone is this structure plus the baseline in every account: identity (IAM Identity Center), logging (organisation trail, Config), security services, network attachment, guardrails and budgets. AWS Control Tower builds and maintains one; Account Factory makes each new account arrive with it.</p>
<h2>Operating principles</h2>
<ul><li>Humans sign in through Identity Center with permission sets; no IAM users.</li><li>Security services are run from delegated administrator accounts, not the management account.</li><li>Shared resources are shared through RAM (subnets, transit gateways) instead of duplicated.</li><li>Everything in the baseline is code (StackSets, Terraform, Control Tower customisations).</li><li>SCPs are tested on a sandbox OU first.</li></ul>
<h2>How many accounts?</h2>
<p>At minimum: management, log archive, security, and one each for production and non-production. Grow to an account per workload per environment as teams and compliance needs grow. Accounts are free; the cost is the per-account baseline services.</p>`,
  [['walkthrough/landing-zone', 'Multi-account landing zone'], ['service/control-tower', 'AWS Control Tower'], ['service/organizations', 'AWS Organizations']]);

CN('data-perimeters', 'Data perimeters', 'Guardrails ensuring only trusted identities reach trusted resources from expected networks.',
  { saa: ['1.1'], sap: ['2.2', '2.3'] },
  `<p>A data perimeter is a set of coarse, always-on controls around your organisation. It does not replace least privilege; it catches the mistakes least privilege misses, such as a bucket policy that names the wrong account.</p>
<div class="tablewrap"><table><thead><tr><th>Objective</th><th>Meaning</th><th>Implemented with</th><th>Key condition</th></tr></thead><tbody>
<tr><th>Only trusted identities</th><td>My resources can be accessed only by my principals (and AWS services acting for me)</td><td>Resource control policies, resource policies</td><td><code>aws:PrincipalOrgID</code></td></tr>
<tr><th>Only trusted resources</th><td>My principals can access only my resources</td><td>Service control policies, VPC endpoint policies</td><td><code>aws:ResourceOrgID</code></td></tr>
<tr><th>Only expected networks</th><td>Access happens only from my VPCs and networks</td><td>SCPs, RCPs, resource policies</td><td><code>aws:SourceVpce</code>, <code>aws:SourceIp</code></td></tr>
</tbody></table></div>
<h2>What each objective stops</h2>
<ul><li><b>Trusted identities:</b> a misconfigured policy exposing data to another company or the public.</li><li><b>Trusted resources:</b> an insider or compromised credential copying data to a bucket in an attacker's account.</li><li><b>Expected networks:</b> stolen credentials being used from outside your environment.</li></ul>
<h2>Building one</h2>
<ol><li>Enable RCPs and SCPs in Organizations.</li><li>Start with the identity perimeter on S3, KMS, Secrets Manager, SQS and STS (the services RCPs support first).</li><li>Write exceptions for AWS service principals and for approved third parties.</li><li>Use IAM Access Analyzer external access findings to see what would break.</li><li>Roll out OU by OU, sandbox first.</li></ol>
<h2>Exam framing</h2>
<p>"Ensure no resource can be shared outside the organisation regardless of individual policies": RCP. "Ensure our users cannot upload to buckets outside the organisation": SCP or endpoint policy with <code>aws:ResourceOrgID</code>. "Credentials must not work from outside our network": network condition keys.</p>`,
  [['service/organizations', 'AWS Organizations'], ['service/access-analyzer', 'IAM Access Analyzer'], ['concept/policy-evaluation', 'Policy evaluation logic']]);

CN('multi-tenancy', 'Multi-tenant SaaS isolation: silo, pool and bridge', 'Serving many customers from one product without letting them see or slow each other.',
  { saa: [], sap: ['1.1', '2.1'] },
  `<div class="tablewrap"><table><thead><tr><th></th><th>Silo</th><th>Pool</th><th>Bridge</th></tr></thead><tbody>
<tr><th>Resources</th><td>Dedicated per tenant (stack or account)</td><td>Shared by all tenants</td><td>Some shared, some dedicated</td></tr>
<tr><th>Isolation</th><td>Strongest, by infrastructure</td><td>By policy and code</td><td>Mixed</td></tr>
<tr><th>Cost per tenant</th><td>Highest</td><td>Lowest</td><td>Middle</td></tr>
<tr><th>Operations</th><td>Many stacks to deploy and patch</td><td>One stack</td><td>Middle</td></tr>
<tr><th>Noisy neighbours</th><td>Not possible</td><td>Must be managed</td><td>Partly</td></tr>
<tr><th>Typical use</th><td>Regulated or very large customers</td><td>Many small customers</td><td>Shared compute, per-tenant database</td></tr>
</tbody></table></div>
<h2>Isolation in a pooled model</h2>
<ul><li><b>Tenant context</b> comes from the verified identity token, never from request input.</li><li><b>Credentials scoped per request:</b> assume a role with session tags or a session policy limiting access to the tenant's partition key or prefix.</li><li><b>Data partitioning:</b> tenant ID in the partition key (DynamoDB), a prefix (S3), row-level security (PostgreSQL), or a schema or database per tenant.</li><li><b>Encryption:</b> a KMS key per tenant where contracts require it.</li></ul>
<h2>Noisy-neighbour controls</h2>
<ul><li>Per-tenant throttling with API Gateway usage plans.</li><li>Tenant-aware queueing so one backlog cannot starve others.</li><li>Tiering: premium tenants get reserved capacity or their own silo.</li><li>Per-tenant metrics to see who is consuming what.</li></ul>
<h2>The control plane</h2>
<p>Separate from the application: tenant onboarding, identity, tiering, billing and metering, and deployment across silos. Onboarding should be fully automated in every model.</p>
<h2>Cost per tenant</h2>
<p>Silo: tags or accounts. Pool: application-level metering, plus split cost allocation data for shared clusters.</p>
<h2>Exam framing</h2>
<p>"Strongest isolation" or "compliance requires dedicated resources": silo. "Lowest cost and operational overhead for thousands of small tenants": pool with IAM-enforced isolation and throttling. Multi-tenancy is new, explicit content in SAP-C03.</p>`,
  [['walkthrough/multi-tenant-saas', 'Multi-tenant SaaS walkthrough'], ['service/cognito', 'Amazon Cognito'], ['service/verified-permissions', 'Verified Permissions']]);

CN('event-driven', 'Event-driven patterns: idempotency, ordering and dead-letter queues', 'The rules that make asynchronous systems correct, not just decoupled.',
  { saa: ['2.1'], sap: ['1.1', '5.4'] },
  `<h2>Delivery guarantees</h2>
<p>Almost everything on AWS is <b>at-least-once</b>: SQS standard queues, SNS, EventBridge, Lambda asynchronous invocation, Kinesis consumers. A message can arrive twice. Design for it.</p>
<h2>Idempotency</h2>
<p>An operation is idempotent if doing it twice has the same effect as doing it once.</p>
<ul><li>Give every command a unique ID chosen by the caller (an idempotency key).</li><li>Record the key with a conditional write before doing the work; if it exists, return the stored result.</li><li>Expire keys with a TTL.</li><li>Prefer naturally idempotent operations: "set status to PAID", not "add $10".</li></ul>
<h2>Ordering</h2>
<ul><li>Most services give no ordering guarantee. FIFO queues and topics order within a message group; Kinesis and Kafka order within a partition key.</li><li>Order only what needs it (per account, per order), not everything, or throughput collapses.</li><li>Include a version or timestamp so consumers can discard stale events.</li></ul>
<h2>Failure handling</h2>
<ul><li><b>Retries</b> with exponential backoff and jitter.</li><li><b>Dead-letter queues</b> for messages that keep failing, with an alarm and a redrive procedure.</li><li><b>Partial batch responses</b> so one bad record does not replay the batch.</li><li><b>Poison messages</b> must not block a FIFO group or a shard forever: set limits.</li></ul>
<h2>Patterns</h2>
<div class="tablewrap"><table><thead><tr><th>Pattern</th><th>Use</th><th>AWS building blocks</th></tr></thead><tbody>
<tr><th>Queue (point to point)</th><td>Buffer work for one consumer</td><td>SQS</td></tr>
<tr><th>Fan-out</th><td>One event, several consumers</td><td>SNS to SQS; EventBridge rules</td></tr>
<tr><th>Event bus</th><td>Route by content between teams</td><td>EventBridge</td></tr>
<tr><th>Stream</th><td>Ordered, replayable log</td><td>Kinesis, MSK</td></tr>
<tr><th>Saga</th><td>Multi-service transaction with compensation</td><td>Step Functions</td></tr>
<tr><th>Outbox</th><td>Update the database and publish an event atomically</td><td>Outbox table + DynamoDB Streams or DMS CDC</td></tr>
<tr><th>Claim check</th><td>Large payloads</td><td>Object in S3, pointer in the message</td></tr>
</tbody></table></div>
<h2>Choreography vs orchestration</h2>
<p>Choreography (services react to events) keeps teams independent but hides the overall flow. Orchestration (Step Functions) makes the flow explicit and easier to debug. Use orchestration inside a business transaction and events between bounded contexts.</p>`,
  [['compare/messaging', 'SQS vs SNS vs EventBridge vs Kinesis vs MSK'], ['walkthrough/serverless-pipeline', 'Serverless event-driven pipeline'], ['service/step-functions', 'AWS Step Functions']]);

CN('resilience-patterns', 'Resilience patterns: timeouts, retries, circuit breakers, bulkheads', 'How to stop one failing part from taking down everything.',
  { saa: ['2.1', '2.2'], sap: ['4.3', '5.4'] },
  `<div class="tablewrap"><table><thead><tr><th>Pattern</th><th>What it does</th><th>Get it wrong and</th></tr></thead><tbody>
<tr><th>Timeout</th><td>Stops waiting for a call after a set time</td><td>Threads and connections pile up until the caller fails too</td></tr>
<tr><th>Retry with backoff and jitter</th><td>Tries again after increasing, randomised delays, a limited number of times</td><td>Synchronised retries create a storm that prevents recovery</td></tr>
<tr><th>Circuit breaker</th><td>After repeated failures, stops calling the dependency for a while and returns a fallback</td><td>Every request waits for the full timeout during an outage</td></tr>
<tr><th>Bulkhead</th><td>Separate pools (threads, connections, instances, accounts) per dependency or customer</td><td>One slow dependency uses every thread</td></tr>
<tr><th>Load shedding</th><td>Rejects excess work early so accepted work completes</td><td>Everything is accepted and everything times out</td></tr>
<tr><th>Backpressure</th><td>Slows producers when consumers are behind (queues, limited concurrency)</td><td>Unbounded queues and memory exhaustion</td></tr>
<tr><th>Graceful degradation</th><td>Serves a reduced answer when a non-critical part fails</td><td>A recommendations outage breaks checkout</td></tr>
<tr><th>Idempotency</th><td>Makes retries safe</td><td>Retries double-charge customers</td></tr>
</tbody></table></div>
<h2>On AWS</h2>
<ul><li>The AWS SDKs retry with backoff and jitter by default; set sensible timeouts and maximum attempts yourself.</li><li>SQS between tiers gives backpressure and buffering; Lambda reserved concurrency limits pressure on a downstream system.</li><li>API Gateway and WAF throttle at the edge (load shedding).</li><li>Step Functions supplies retry and catch declaratively.</li><li>In Spring Boot, Resilience4j provides circuit breakers, bulkheads and rate limiters.</li><li>Health checks should test the instance itself, not shared dependencies, or one dependency failure removes every target.</li></ul>
<h2>Blast-radius patterns</h2>
<ul><li><b>Cells:</b> independent copies of the stack, each serving a slice of customers.</li><li><b>Shuffle sharding:</b> each customer is assigned a different combination of resources so one bad customer affects few others.</li><li><b>Zonal independence:</b> keep requests within a zone where possible so a zone failure stays contained.</li></ul>
<h2>Metastable failure</h2>
<p>A system that stays broken after the trigger has gone, usually because retries keep it overloaded. The cures are the patterns above: bounded retries, load shedding, and circuit breakers. Test them with AWS Fault Injection Service.</p>`,
  [['service/resilience-hub', 'Resilience Hub and Fault Injection Service'], ['concept/event-driven', 'Event-driven patterns'], ['concept/availability', 'Multi-AZ and static stability']]);

CN('seven-rs', 'The seven Rs of migration', 'The strategies for moving each application, and the phases of a migration programme.',
  { saa: ['3.5'], sap: ['4.1'] },
  `<div class="tablewrap"><table><thead><tr><th>Strategy</th><th>Meaning</th><th>Example</th><th>Typical tool</th></tr></thead><tbody>
<tr><th>Retire</th><td>Switch it off</td><td>A reporting tool nobody uses</td><td>Discovery data</td></tr>
<tr><th>Retain</th><td>Leave it where it is, for now</td><td>A mainframe due for replacement in two years</td><td>Hybrid connectivity</td></tr>
<tr><th>Rehost</th><td>Lift and shift, unchanged</td><td>VMs to EC2</td><td>Application Migration Service</td></tr>
<tr><th>Relocate</th><td>Move the platform as a whole</td><td>VMware estate to Amazon Elastic VMware Service</td><td>VMware HCX</td></tr>
<tr><th>Repurchase</th><td>Replace with SaaS</td><td>Self-hosted CRM to a SaaS CRM</td><td>Vendor migration tools</td></tr>
<tr><th>Replatform</th><td>Lift, tinker and shift</td><td>Oracle on a server to RDS; app to containers without redesign</td><td>DMS, App2Container</td></tr>
<tr><th>Refactor (re-architect)</th><td>Redesign for the cloud</td><td>Monolith to event-driven services</td><td>Your engineers; AWS Transform</td></tr>
</tbody></table></div>
<p>Effort and benefit both rise from top to bottom. Most programmes rehost the bulk for speed and refactor a chosen few.</p>
<h2>Programme phases</h2>
<ol><li><b>Assess.</b> Inventory, dependencies, business case, readiness (Cloud Adoption Framework perspectives: business, people, governance, platform, security, operations).</li><li><b>Mobilise.</b> Landing zone, connectivity, security baseline, skills, a pilot wave.</li><li><b>Migrate and modernise.</b> Waves of applications, each with a plan, test, cut-over and rollback.</li></ol>
<h2>Choosing per application</h2>
<ul><li>Deadline-driven (data centre exit): rehost now, improve later.</li><li>Licence or operations pain: replatform to managed services.</li><li>Strategic, changing product: refactor.</li><li>Commodity function: repurchase.</li><li>Always ask first: can it be retired?</li></ul>
<h2>Wave planning</h2>
<p>Group servers that talk to each other and move them together. Start with low-risk applications to build a repeatable factory. Keep parallel running short: it is the expensive period.</p>`,
  [['walkthrough/migration-three-tier', 'Migrating a three-tier application'], ['service/mgn', 'Application Migration Service'], ['service/migration-planning', 'Migration planning tools']]);

CN('hybrid-connectivity', 'Hybrid connectivity', 'Joining a data centre or office to AWS: links, routing, DNS and identity.',
  { saa: ['3.4'], sap: ['1.3'] },
  `<h2>The link</h2>
<div class="tablewrap"><table><thead><tr><th>Option</th><th>Use when</th></tr></thead><tbody>
<tr><th>Site-to-Site VPN</th><td>You need it now, volume is modest, or as a backup</td></tr>
<tr><th>Direct Connect</th><td>Steady high volume, consistent latency, or a no-internet requirement</td></tr>
<tr><th>Direct Connect + VPN backup</th><td>Good resilience at moderate cost</td></tr>
<tr><th>Direct Connect at two locations</th><td>Critical workloads</td></tr>
<tr><th>VPN over Direct Connect, or MACsec</th><td>Private path that must also be encrypted</td></tr>
<tr><th>Client VPN or Verified Access</th><td>Individual users, not sites</td></tr>
</tbody></table></div>
<h2>The AWS end</h2>
<ul><li>One VPC: virtual private gateway.</li><li>Many VPCs in a Region: transit gateway.</li><li>Several Regions: Direct Connect gateway in front of transit gateways, or Cloud WAN.</li></ul>
<h2>Routing</h2>
<ul><li>BGP carries routes in both directions. Advertise summarised prefixes.</li><li>Prefer Direct Connect over VPN with BGP attributes (local preference, AS path prepending) on both sides to avoid asymmetric paths.</li><li>Plan address space first: overlapping ranges between sites and VPCs are the most expensive mistake to fix.</li></ul>
<h2>DNS</h2>
<ul><li>Route 53 Resolver <b>inbound</b> endpoints: on-premises resolves AWS private zones.</li><li><b>Outbound</b> endpoints with forwarding rules: AWS resolves on-premises names.</li><li>Share rules across accounts with RAM or Route 53 Profiles.</li></ul>
<h2>Identity and services</h2>
<ul><li>Workforce: federate the corporate directory to IAM Identity Center.</li><li>Windows workloads: AWS Managed Microsoft AD with a trust, or AD Connector.</li><li>On-premises applications calling AWS: IAM Roles Anywhere.</li><li>AWS services reached privately from on premises: interface endpoints (gateway endpoints do not work from outside the VPC).</li></ul>
<h2>Hybrid compute and storage</h2>
<p>Outposts, ECS Anywhere, EKS Hybrid Nodes for compute; Storage Gateway for ongoing file, volume or tape access; DataSync for transfer.</p>`,
  [['walkthrough/hybrid-network', 'Hybrid network walkthrough'], ['compare/dx-vs-vpn', 'Direct Connect vs VPN'], ['service/route53', 'Amazon Route 53']]);

CN('ipv6', 'IPv6 and dual-stack', 'Why IPv6 matters on AWS now, and how it changes subnet and gateway design.',
  { saa: ['3.4'], sap: ['1.4'] },
  `<h2>Why bother</h2>
<ul><li>Private IPv4 space runs out in large container platforms: every pod or task takes an address.</li><li>AWS charges per hour for every public IPv4 address. IPv6 addresses are free.</li><li>Overlapping private ranges disappear, since IPv6 addresses are globally unique.</li><li>Some mobile networks and governments require IPv6 reachability.</li></ul>
<h2>How it works in a VPC</h2>
<ul><li>A VPC gets a /56 IPv6 block (from Amazon or your own); each subnet takes a /64.</li><li><b>Dual-stack</b> subnets carry IPv4 and IPv6. <b>IPv6-only</b> subnets carry IPv6 alone.</li><li>All IPv6 addresses are globally routable. There is no private range and no NAT in the IPv4 sense. Reachability is decided by route tables and security groups.</li></ul>
<div class="tablewrap"><table><thead><tr><th>Need</th><th>IPv4</th><th>IPv6</th></tr></thead><tbody>
<tr><th>Two-way internet</th><td>Internet gateway + public IP</td><td>Internet gateway</td></tr>
<tr><th>Outbound only</th><td>NAT gateway</td><td>Egress-only internet gateway (free)</td></tr>
<tr><th>IPv6-only workloads reaching IPv4 services</th><td></td><td>NAT64 on the NAT gateway + DNS64 in Route 53 Resolver</td></tr>
</tbody></table></div>
<h2>Adoption path</h2>
<ol><li>Add an IPv6 block to the VPC and subnets (dual-stack).</li><li>Enable dual-stack on load balancers and CloudFront so clients can use either.</li><li>Add IPv6 rules to security groups and NACLs: they are separate from IPv4 rules.</li><li>Move internal workloads to IPv6-only subnets where the software supports it (EKS and ECS do).</li></ol>
<h2>Traps</h2>
<ul><li>A security group that allows <code>0.0.0.0/0</code> does not allow IPv6; that is <code>::/0</code>, and the reverse is also true: opening <code>::/0</code> by accident exposes instances that have IPv6 addresses.</li><li>An egress-only internet gateway is the IPv6 answer to "outbound only"; a NAT gateway is not used for plain IPv6 egress.</li><li>Not every AWS service endpoint supports IPv6. Check before going IPv6-only.</li></ul>`,
  [['service/vpc', 'Amazon VPC'], ['compare/internet-paths', 'NAT gateway vs internet gateway vs endpoints'], ['tools/cidr', 'CIDR calculator']]);

CN('encryption', 'Encryption and key management', 'At rest, in transit, in use, and who controls the keys, including post-quantum options.',
  { saa: ['1.3'], sap: ['2.2'] },
  `<h2>At rest</h2>
<ul><li>Most services encrypt by default or with one setting, using <b>envelope encryption</b>: a data key encrypts the data, and a KMS key encrypts the data key.</li><li><b>Key choice</b> is the real decision: AWS owned (invisible), AWS managed (visible, fixed policy), customer managed (your policy, sharing, rotation, audit).</li><li>Use customer managed keys when you need to restrict who can decrypt, share across accounts, or prove usage to an auditor.</li></ul>
<h2>In transit</h2>
<ul><li>TLS everywhere: ACM certificates at load balancers, CloudFront and API Gateway; AWS Private CA for internal services and mutual TLS.</li><li>Enforce it: <code>aws:SecureTransport</code> on S3, <code>rds.force_ssl</code>, TLS-only listeners, security policies that drop old protocol versions.</li><li>Between Regions and zones AWS encrypts traffic on its backbone, but application-layer TLS is still expected for sensitive data.</li><li>Direct Connect is not encrypted unless you add MACsec or IPsec.</li></ul>
<h2>In use</h2>
<p>Nitro Enclaves isolate processing of very sensitive data from administrators. AWS Payment Cryptography performs card-payment operations inside managed payment HSMs.</p>
<h2>Where keys live</h2>
<div class="tablewrap"><table><thead><tr><th>Option</th><th>Control</th><th>Trade-off</th></tr></thead><tbody>
<tr><th>KMS (standard)</th><td>Policies and audit; AWS runs the HSMs</td><td>None for most workloads</td></tr>
<tr><th>Imported key material</th><td>You generate the key and can expire it</td><td>You must keep a copy; no automatic rotation</td></tr>
<tr><th>CloudHSM custom key store</th><td>Keys in your single-tenant HSMs</td><td>You operate the cluster; cost</td></tr>
<tr><th>External key store</th><td>Keys outside AWS entirely</td><td>AWS availability depends on your key manager</td></tr>
</tbody></table></div>
<h2>Multi-account and multi-Region</h2>
<ul><li>Cross-account use needs both the key policy and the caller's IAM policy.</li><li>Keys are Regional. For replicated data use multi-Region keys or re-encrypt at the destination.</li><li>RCPs can stop keys being used by anyone outside the organisation.</li></ul>
<h2>Post-quantum cryptography</h2>
<p>A future quantum computer could break today's public-key algorithms, and attackers can record traffic now to decrypt later. AWS responses, new in the SAP-C03 guide:</p>
<ul><li><b>ML-KEM</b> hybrid key exchange in TLS on AWS service endpoints, protecting data in transit.</li><li><b>ML-DSA</b> signing keys in KMS for quantum-resistant signatures [[verify]].</li><li>Symmetric encryption (AES-256), which protects data at rest, is already considered quantum-resistant.</li></ul>
<p>Practical step today: keep SDKs and TLS libraries current so hybrid post-quantum key exchange is negotiated automatically, and inventory where long-lived signatures and key exchanges are used.</p>`,
  [['service/kms', 'AWS KMS'], ['compare/kms-vs-cloudhsm', 'KMS vs CloudHSM'], ['service/acm', 'AWS Certificate Manager']]);

CN('data-residency', 'Data residency and sovereignty', 'Keeping data where the law, the regulator or the customer contract says it must be.',
  { saa: ['1.3'], sap: ['2.4'] },
  `<p>This page describes technical controls. It is not legal advice; requirements come from your regulator, contracts and counsel.</p>
<h2>Three different questions</h2>
<ul><li><b>Residency:</b> where is the data stored and processed?</li><li><b>Sovereignty:</b> whose laws apply, and who can compel access?</li><li><b>Access:</b> who, from where, can actually reach it?</li></ul>
<h2>What AWS does by default</h2>
<p>Customer content stays in the Region you choose unless you configure something that moves it. Things that do move data, which you must review: cross-Region replication and backups, global tables and global databases, CloudFront caching, cross-Region inference in Bedrock, support attachments, and some services whose control plane or analytics run in another Region.</p>
<h2>Preventive controls</h2>
<ul><li>SCPs (or Control Tower Region deny) restricting accounts to approved Regions, with exemptions for global services.</li><li>RCPs and bucket policies blocking access from outside the organisation.</li><li>Disabling or scoping replication targets through policy.</li><li>Bedrock: choose in-Region inference or an inference profile whose geography is acceptable.</li></ul>
<h2>Detective controls</h2>
<ul><li>AWS Config rules and aggregators reporting resources outside approved Regions.</li><li>CloudTrail for evidence of where and by whom data was accessed.</li><li>Macie for locating personal data in S3.</li></ul>
<h2>Key location as a control</h2>
<p>If data is encrypted with keys you hold, access to the ciphertext alone is not access to the data. Options rise in control and effort: customer managed KMS keys, CloudHSM, external key store.</p>
<h2>New Zealand context</h2>
<ul><li>The Privacy Act 2020 permits storing personal information overseas if comparable safeguards apply (principle 12), but many public-sector and financial customers ask for data to stay in New Zealand.</li><li>The <code>ap-southeast-6</code> Region makes in-country storage and processing possible. Check each service you rely on is available there, and where its disaster recovery copy would go: a second Region means leaving the country, so in-country DR relies on the Region's three zones or an on-premises copy.</li><li>Sydney remains the usual second Region for trans-Tasman designs.</li></ul>
<h2>Exam framing</h2>
<p>"Ensure data cannot leave the Region": preventive SCP plus detective Config. "Prove it": Config evidence and CloudTrail. "Customer must control keys outside AWS": external key store.</p>`,
  [['concept/data-perimeters', 'Data perimeters'], ['service/organizations', 'AWS Organizations'], ['concept/global-infrastructure', 'Regions and zones']]);

CN('genai-architecture', 'Generative AI architecture: RAG, agents, guardrails and evaluation', 'The building blocks of AI applications on AWS and the decisions between them.',
  { saa: [], sap: ['1.2', '2.5'] },
  `<h2>Choose the lightest technique that works</h2>
<div class="tablewrap"><table><thead><tr><th>Technique</th><th>Use when</th><th>Cost and effort</th></tr></thead><tbody>
<tr><th>Prompt engineering</th><td>The model already knows enough; you need format and tone</td><td>Lowest</td></tr>
<tr><th>Retrieval-augmented generation (RAG)</th><td>Answers must come from your current, private documents</td><td>Moderate: ingestion and a vector store</td></tr>
<tr><th>Agents with tools</th><td>The task needs actions or live data from your systems</td><td>Higher: tool design, security, testing</td></tr>
<tr><th>Fine-tuning or distillation</th><td>You need a consistent style, a narrow skill, or a cheaper small model that imitates a large one</td><td>High: data preparation and retraining</td></tr>
<tr><th>Custom model on SageMaker AI</th><td>Predictive ML on your own data, or full control of serving</td><td>Highest</td></tr>
</tbody></table></div>
<h2>RAG</h2>
<ol><li><b>Ingest:</b> split documents into chunks, create embeddings, store vectors with metadata.</li><li><b>Retrieve:</b> embed the question, find similar chunks, filter by metadata (including who may see what), optionally rerank.</li><li><b>Generate:</b> send the question plus retrieved text to the model; return the answer with citations.</li></ol>
<p>Quality depends mostly on chunking and retrieval, not on the model. Bedrock Knowledge Bases manages the pipeline; vector stores include OpenSearch Serverless, Aurora PostgreSQL with pgvector and S3 Vectors.</p>
<h2>Agents</h2>
<p>An agent lets the model decide which tool to call next. Production concerns: session isolation, memory, tool access control, identity propagation, and observability. Bedrock AgentCore supplies these as services (runtime, memory, gateway, identity, observability) for agents built in any framework. Tools are often exposed through the Model Context Protocol (MCP).</p>
<h2>Security and responsible AI</h2>
<ul><li><b>Guardrails</b> on input and output: content filters, denied topics, personal data redaction, prompt attack detection, grounding checks.</li><li><b>Least privilege for tools:</b> an agent can do whatever its credentials allow. Scope per tool, and require human approval for consequential actions.</li><li><b>Prompt injection</b> arrives through documents and tool results as well as users. Treat retrieved text as data, never as instructions.</li><li><b>Access control at retrieval</b>, not by asking the model to withhold.</li><li><b>Logging:</b> model invocation logs for audit, protected because they contain user content.</li><li><b>Evaluation:</b> test sets, automated and human scoring, and regression checks whenever the prompt, model or data changes.</li></ul>
<h2>Cost and performance</h2>
<ul><li>Tokens are the unit of cost; output tokens cost more than input.</li><li>Use the smallest model that passes evaluation; route simple requests to cheaper models.</li><li>Prompt caching for repeated prefixes; batch inference for offline work; provisioned throughput for steady high volume.</li><li>Streaming responses improve perceived latency.</li></ul>
<h2>Capacity and residency</h2>
<p>On-demand inference has per-account quotas. Cross-Region inference profiles spread requests over several Regions for capacity; check the profile's geography against data-residency rules. Not every model is offered in every Region.</p>`,
  [['service/bedrock', 'Amazon Bedrock'], ['walkthrough/rag-bedrock', 'RAG application on Bedrock'], ['service/sagemaker', 'Amazon SageMaker AI']]);

CN('finops', 'FinOps: tagging, showback and chargeback', 'Making cloud cost visible, owned and optimised as an ongoing practice.',
  { saa: ['4.2'], sap: ['3.3', '3.1'] },
  `<p>FinOps is the practice of engineering, finance and product teams sharing responsibility for cloud spend. Its loop: <b>inform</b> (see the cost), <b>optimise</b> (reduce it), <b>operate</b> (keep it that way).</p>
<h2>Inform: allocation</h2>
<ul><li><b>Accounts</b> are the cleanest boundary: one workload and environment per account needs no tags.</li><li><b>Tags</b> for everything else: a small mandatory set such as <code>cost-centre</code>, <code>application</code>, <code>environment</code>, <code>owner</code>. Enforce with tag policies and deny-untagged conditions; activate them as cost allocation tags.</li><li><b>Cost Categories</b> combine accounts and tags into business groupings.</li><li><b>Shared costs</b> (networking, security tooling, clusters): split by a rule such as proportional usage; split cost allocation data handles shared ECS and EKS.</li></ul>
<div class="tablewrap"><table><thead><tr><th></th><th>Showback</th><th>Chargeback</th></tr></thead><tbody>
<tr><th>What happens</th><td>Teams are shown their costs</td><td>Costs are billed to team budgets</td></tr>
<tr><th>Needs</th><td>Reasonable allocation</td><td>Accurate allocation, agreed rules, finance integration</td></tr>
<tr><th>Good for</th><td>Starting out, building awareness</td><td>Mature organisations, strong accountability</td></tr>
</tbody></table></div>
<h2>Optimise</h2>
<ol><li><b>Remove waste:</b> idle instances, unattached volumes, old snapshots, unused load balancers and IPs.</li><li><b>Right-size:</b> Compute Optimizer; scale to demand; schedule non-production.</li><li><b>Modernise:</b> Graviton, gp3, serverless, managed services.</li><li><b>Commit:</b> Savings Plans and reservations on what remains steady.</li><li><b>Architecture:</b> data transfer paths, storage classes, caching.</li></ol>
<p>Order matters: committing before right-sizing locks in waste.</p>
<h2>Operate</h2>
<ul><li>Budgets with forecast alerts per team; Cost Anomaly Detection.</li><li>A monthly review with unit metrics: cost per transaction, per customer, per environment.</li><li>Cost as a design input: estimate with the Pricing Calculator before building.</li></ul>
<h2>Unit economics</h2>
<p>Total spend rising is fine if cost per transaction is falling. Track a unit cost that the business understands.</p>`,
  [['service/cost-explorer', 'Cost Explorer, CUR and Cost Categories'], ['service/budgets', 'AWS Budgets'], ['service/savings-plans', 'Savings Plans and Reserved Instances']]);

CN('observability', 'Observability: metrics, logs, traces and SLOs', 'Knowing what your system is doing, why, and whether users are affected.',
  { saa: ['2.2'], sap: ['5.3'] },
  `<div class="tablewrap"><table><thead><tr><th>Signal</th><th>Answers</th><th>AWS tools</th></tr></thead><tbody>
<tr><th>Metrics</th><td>How much, how fast, how often? Cheap to store, good for alarms and trends.</td><td>CloudWatch metrics, Managed Service for Prometheus</td></tr>
<tr><th>Logs</th><td>What exactly happened in this component?</td><td>CloudWatch Logs and Logs Insights, OpenSearch, S3 with Athena</td></tr>
<tr><th>Traces</th><td>Where did this request spend its time across services?</td><td>X-Ray, CloudWatch Application Signals, OpenTelemetry (ADOT)</td></tr>
<tr><th>Events</th><td>What changed?</td><td>CloudTrail, EventBridge, deployment markers</td></tr>
</tbody></table></div>
<h2>What to measure</h2>
<ul><li><b>For services (RED):</b> request rate, errors, duration.</li><li><b>For resources (USE):</b> utilisation, saturation, errors.</li><li><b>The four golden signals:</b> latency, traffic, errors, saturation.</li><li>Use percentiles (p95, p99) for latency. Averages hide the slow requests users complain about.</li></ul>
<h2>Service-level objectives</h2>
<ul><li><b>SLI:</b> a measured indicator, for example the share of payment requests that succeed within 800 ms.</li><li><b>SLO:</b> the target, for example 99.9% over 28 days.</li><li><b>Error budget:</b> the allowed failure (0.1%). Spend it on releases; when it is running out, slow down.</li><li>Alert on <b>burn rate</b> (how fast the budget is being used), not on every error. That pages people only when users are affected.</li></ul>
<h2>Making it work</h2>
<ul><li>Structured (JSON) logs with a correlation or trace ID on every line.</li><li>Propagate trace context through queues and asynchronous calls.</li><li>Instrument with OpenTelemetry so the backend can change.</li><li>Synthetic canaries test from outside; real-user monitoring measures the client side.</li><li>Dashboards per service with the same layout; alarms linked to runbooks.</li></ul>
<h2>At organisation scale</h2>
<ul><li>CloudWatch cross-account observability with a monitoring account.</li><li>Central log archive for audit; workload logs kept locally with retention set.</li><li>Control cost: log levels, sampling of traces, retention, the Infrequent Access log class, and metric cardinality.</li></ul>
<h2>Monitoring vs observability</h2>
<p>Monitoring tells you a known condition occurred. Observability lets you ask new questions of a system you did not predict would fail that way. You need alarms for the first and rich, correlated telemetry for the second.</p>`,
  [['service/cloudwatch', 'Amazon CloudWatch'], ['service/xray', 'X-Ray and OpenTelemetry'], ['walkthrough/central-logging', 'Centralised logging and monitoring']]);

/* ===== Phase 7: comparison pages ===== */
const CMP = (id, title, summary, tasks, columns, rows, rules, scenario, trap) =>
  COMPARISONS.push({ id, title, summary, tasks, columns, rows, rules, scenario: '<p>' + scenario + '</p>', trap: '<p>' + trap + '</p>' });

CMP('compute-options', 'EC2 vs ECS vs EKS vs Fargate vs Lambda', 'Five ways to run code, from most control to least management.',
  { saa: ['3.2', '2.1'], sap: ['1.1'] },
  ['EC2', 'ECS', 'EKS', 'Fargate', 'Lambda'],
  [
    ['What you manage', 'OS, patching, scaling, everything above the hypervisor', 'Task definitions and services; hosts only if on EC2', 'Kubernetes objects, add-ons, version upgrades; nodes unless Auto Mode or Fargate', 'Nothing below the task', 'Only the function code'],
    ['Unit of work', 'Instance', 'Task (containers)', 'Pod', 'Task or pod', 'Invocation, up to 15 minutes'],
    ['Scales to zero', 'No', 'With Fargate', 'With Fargate or Karpenter', 'Yes', 'Yes'],
    ['Billing', 'Per instance-second', 'Underlying compute', 'Cluster fee + compute', 'vCPU and memory per second', 'Requests + duration'],
    ['Best for', 'Legacy, licensed, GPU, special OS needs', 'Most container services on AWS', 'Kubernetes standardisation and portability', 'Containers with no host work', 'Event-driven, spiky, short tasks']
  ],
  ['<b>Start with Fargate on ECS</b> for a new containerised service unless you have a reason not to.', '<b>Choose Lambda</b> when work is event-driven, short and spiky.', '<b>Choose EKS</b> when Kubernetes is a requirement, not a preference.', '<b>Choose EC2</b> for software that cannot be containerised, needs GPUs or host-level control, or is licensed per host.'],
  'A Kotlin and Spring Boot payments API with steady daytime traffic, a small team and a PCI DSS scope to keep small: ECS on Fargate. No hosts to patch or include in scope, per-task IAM roles and security groups, and no Kubernetes to operate. A nightly reconciliation that runs 40 minutes is a scheduled Fargate task; a webhook handler that fires a few times a minute is Lambda.',
  '"Least operational overhead" with containers means Fargate. "Already uses Kubernetes" or "open-source portability" means EKS. Anything over 15 minutes rules out Lambda. Fargate is not an orchestrator: it always sits under ECS or EKS.');

CMP('ecs-ec2-vs-fargate', 'ECS on EC2 vs ECS on Fargate', 'Same orchestrator, two kinds of capacity.',
  { saa: ['3.2', '4.2'], sap: ['1.1', '3.1'] },
  ['ECS on EC2', 'ECS on Fargate'],
  [
    ['Hosts', 'You run and patch an Auto Scaling group of instances', 'None'],
    ['Isolation', 'Tasks share a host kernel', 'Each task in its own micro-VM'],
    ['Cost shape', 'Cheaper per vCPU when hosts are densely packed and covered by commitments', 'Pay exactly for task size; no idle host capacity'],
    ['Capabilities', 'GPUs, privileged mode, daemon tasks, custom AMIs', 'No privileged mode or host access'],
    ['Scaling speed', 'Tasks start fast if host capacity exists; otherwise wait for instances', 'Each task provisions its own capacity']
  ],
  ['<b>Fargate</b> by default, and always for small teams and variable load.', '<b>EC2</b> for GPUs, host agents, very large steady fleets, or special kernel needs.', '<b>Mix them</b> with capacity providers: baseline on EC2, bursts on Fargate or Fargate Spot.'],
  'A platform runs 400 tasks around the clock at high utilisation with a team that already manages AMIs. EC2 capacity with a Compute Savings Plan is cheaper. The same company\'s internal tools, with a few tasks each and idle nights, belong on Fargate.',
  'Exam questions that say "without managing servers" or "reduce operational overhead" want Fargate even if EC2 would be cheaper per hour.');

CMP('load-balancers', 'ALB vs NLB vs Gateway Load Balancer', 'Three load balancers for three layers of the network.',
  { saa: ['3.4', '2.2'], sap: ['1.4'] },
  ['Application LB', 'Network LB', 'Gateway LB'],
  [
    ['Layer', '7: HTTP, HTTPS, gRPC', '4: TCP, UDP, TLS', '3: all IP traffic'],
    ['Routing', 'Host, path, header, query string', 'Port and protocol', 'To a fleet of virtual appliances'],
    ['Addresses', 'DNS name only', 'Static IP per zone, Elastic IPs', 'Used through gateway endpoints'],
    ['Integrations', 'WAF, Cognito/OIDC auth, Lambda targets', 'PrivateLink endpoint services, client IP preserved', 'Firewalls, IDS/IPS appliances'],
    ['Typical use', 'Web apps and APIs', 'Non-HTTP, extreme scale, fixed IPs', 'Central inspection']
  ],
  ['<b>ALB</b> when the traffic is HTTP and you want routing rules or WAF.', '<b>NLB</b> when you need a static IP, a non-HTTP protocol, or to publish a PrivateLink service.', '<b>Gateway LB</b> only to insert third-party network appliances.'],
  'A partner demands two fixed IP addresses to allow-list, but the service needs path-based routing. Put an NLB with Elastic IPs in front of an ALB (ALB as an NLB target), or use Global Accelerator in front of the ALB.',
  'WAF cannot attach to an NLB. An ALB cannot offer static IPs. Classic Load Balancer is legacy and rarely the right answer.');

CMP('api-gateway-vs-alb', 'API Gateway vs Application Load Balancer', 'Two HTTP front doors with different strengths.',
  { saa: ['2.1', '3.4'], sap: ['1.1'] },
  ['API Gateway', 'Application Load Balancer'],
  [
    ['Nature', 'Managed API front door, no capacity to manage', 'Load balancer you provision per VPC'],
    ['API features', 'Auth (IAM, Cognito, JWT, Lambda), usage plans, API keys, throttling, validation, transformation, caching', 'OIDC/Cognito authentication, routing rules, sticky sessions'],
    ['Backends', 'Lambda, HTTP, AWS services directly, private via VPC link', 'EC2, ECS, EKS, IP, Lambda'],
    ['Limits', '29 s default timeout, 10 MB payload', 'Long requests and large payloads fine; WebSocket and gRPC'],
    ['Pricing', 'Per request', 'Per hour plus capacity units']
  ],
  ['<b>API Gateway</b> for serverless backends, public APIs with per-client quotas, or direct service integrations.', '<b>ALB</b> for container and instance services with steady high volume, long requests or streaming.', '<b>Both</b> is common: API Gateway in front for API management, ALB behind through a VPC link.'],
  'A partner API with 12 customers, each on a different rate limit and monthly quota, backed by Fargate: API Gateway REST API with usage plans in front of the internal ALB. The company\'s own mobile app calling the same service at high volume can go through the ALB (with CloudFront and WAF) to avoid per-request charges.',
  '"Throttle per customer", "API keys", "usage plans" and "request validation" mean API Gateway. At billions of requests a month, an ALB is usually cheaper.');

CMP('cloudfront-vs-ga', 'CloudFront vs Global Accelerator', 'Both use the AWS edge network; they solve different problems.',
  { saa: ['3.4', '2.2'], sap: ['1.4'] },
  ['CloudFront', 'Global Accelerator'],
  [
    ['Layer and protocols', 'HTTP, HTTPS, WebSocket', 'TCP and UDP'],
    ['Caches content', 'Yes', 'No'],
    ['Entry point', 'DNS name, changing IPs', 'Two static anycast IPs'],
    ['Failover', 'Origin groups on HTTP errors', 'Health-based across Regions in seconds'],
    ['Extras', 'WAF, edge functions, signed URLs', 'Traffic dials, client IP preservation']
  ],
  ['<b>CloudFront</b> for websites, APIs and media over HTTP.', '<b>Global Accelerator</b> for non-HTTP protocols, fixed IP requirements, or fast multi-Region failover.'],
  'A multiplayer game uses UDP for gameplay and HTTPS for its store pages. Global Accelerator fronts the game servers; CloudFront serves the store.',
  'If the question mentions caching or static content, it is CloudFront. If it mentions static IP addresses, UDP, or failover not dependent on DNS, it is Global Accelerator.');

CMP('storage-types', 'S3 vs EBS vs EFS vs FSx', 'Object, block and file storage, and which workloads need which.',
  { saa: ['3.1', '4.1'], sap: ['1.5', '3.4'] },
  ['S3', 'EBS', 'EFS', 'FSx'],
  [
    ['Type', 'Object', 'Block', 'File (NFS)', 'File (SMB, Lustre, NFS, iSCSI)'],
    ['Attached to', 'Anything with the API', 'One instance in one zone (mostly)', 'Many Linux clients across zones', 'Many clients; protocol depends on type'],
    ['Capacity', 'Unlimited, automatic', 'Provisioned per volume', 'Elastic', 'Provisioned'],
    ['Durability scope', 'Multi-AZ by default', 'Single AZ; snapshots to S3', 'Multi-AZ (Regional)', 'Single- or Multi-AZ'],
    ['Use for', 'Files, backups, lakes, static sites', 'Boot and database volumes', 'Shared Linux content', 'Windows shares, HPC, NetApp/ZFS migrations']
  ],
  ['<b>S3</b> unless something needs a mounted file system or a disk.', '<b>EBS</b> for a single instance\'s disk.', '<b>EFS</b> for shared Linux files.', '<b>FSx</b> when a specific file system or protocol is required.'],
  'A document management system stores uploads (S3), runs PostgreSQL on a managed service (its own storage), shares a rendering cache between Linux workers (EFS), and must serve an old Windows desktop application over SMB (FSx for Windows File Server).',
  'EBS cannot be shared across zones. EFS is not for Windows. S3 is not a file system, although Mountpoint and File Gateway can present it as one for specific cases.');

CMP('s3-classes', 'S3 storage classes', 'Matching storage price to how often data is read.',
  { saa: ['4.1', '3.1'], sap: ['3.4'] },
  ['Access', 'Retrieval', 'Minimum duration', 'Notes'],
  [
    ['Standard', 'Frequent', 'Instant, no fee', 'None', 'Default'],
    ['Intelligent-Tiering', 'Unknown or changing', 'Instant (optional archive tiers are not)', 'None', 'Monitoring fee per object'],
    ['Standard-IA', 'Monthly or less', 'Instant, per-GB fee', '30 days', '128 KB minimum billable size'],
    ['One Zone-IA', 'Infrequent, re-creatable', 'Instant, per-GB fee', '30 days', 'One Availability Zone'],
    ['Glacier Instant Retrieval', 'Quarterly', 'Instant, higher fee', '90 days', 'Archive with millisecond access'],
    ['Glacier Flexible Retrieval', 'Yearly', 'Minutes to 12 hours', '90 days', 'Bulk retrieval is free'],
    ['Glacier Deep Archive', 'Rarely, if ever', '12 to 48 hours', '180 days', 'Lowest storage price']
  ],
  ['<b>Do not know the pattern?</b> Intelligent-Tiering.', '<b>Know it?</b> Lifecycle rules: Standard, then an infrequent class, then archive, then expire.', '<b>Small or short-lived objects</b> stay in Standard.'],
  'Card statements: read often in the first month, occasionally for a year, then kept seven years for compliance. Standard for 30 days, Standard-IA to day 365, Glacier Deep Archive to year seven, then expire. Object Lock covers the retention requirement.',
  'Minimum durations and minimum object sizes make "cheaper" classes more expensive for small or short-lived objects. One Zone-IA is only for data you can recreate.');

CMP('rds-aurora-dynamodb', 'RDS vs Aurora vs DynamoDB', 'The three main operational databases.',
  { saa: ['3.3', '4.3', '2.2'], sap: ['1.5'] },
  ['RDS', 'Aurora', 'DynamoDB'],
  [
    ['Model', 'Relational, six engines', 'Relational, MySQL/PostgreSQL compatible', 'Key-value and document'],
    ['Scaling', 'Vertical; read replicas', 'Up to 15 readers on shared storage; Serverless v2', 'Horizontal, automatic'],
    ['Availability', 'Multi-AZ standby, failover 1 to 2 minutes', 'Six copies in three zones, failover about 30 seconds', 'Three zones by default'],
    ['Multi-Region', 'Cross-Region read replicas', 'Global Database (one writer Region)', 'Global tables (multi-writer)'],
    ['Operations', 'Instances, versions, windows', 'Same, less storage management', 'None'],
    ['Query flexibility', 'Full SQL', 'Full SQL', 'By key and index only']
  ],
  ['<b>DynamoDB</b> when access patterns are known and key-based, and scale or zero operations matters most.', '<b>Aurora</b> for critical relational workloads on MySQL or PostgreSQL.', '<b>RDS</b> for other engines or when cost at small scale matters most.'],
  'A payments platform keeps its double-entry ledger in Aurora PostgreSQL (transactions, constraints, reporting joins) and its idempotency keys and session state in DynamoDB (single-key lookups at high volume with TTL).',
  '"Relational" plus "highest availability" is Aurora. "Serverless, any scale, millisecond" is DynamoDB. Oracle or SQL Server can only be RDS (or EC2).');

CMP('caches', 'ElastiCache vs MemoryDB vs DAX', 'Three in-memory services that are not interchangeable.',
  { saa: ['3.3'], sap: ['1.5'] },
  ['ElastiCache', 'MemoryDB', 'DAX'],
  [
    ['Purpose', 'Cache and ephemeral data', 'Durable in-memory primary database', 'Cache for DynamoDB only'],
    ['Durability', 'Can lose recent writes on failover', 'Multi-AZ transaction log', 'Cache; source of truth is DynamoDB'],
    ['API', 'Valkey, Redis OSS, Memcached', 'Valkey, Redis OSS', 'DynamoDB API'],
    ['Code change', 'Caching logic in the application', 'Used as a database', 'Swap the client endpoint']
  ],
  ['<b>ElastiCache</b> to speed up any database or store sessions.', '<b>MemoryDB</b> when the in-memory data must not be lost.', '<b>DAX</b> when the only goal is faster DynamoDB reads.'],
  'A rate limiter whose counters may reset after a rare failover: ElastiCache. A shopping cart that must survive node loss and is read in microseconds: MemoryDB. A product table in DynamoDB read thousands of times a second: DAX.',
  'DAX works only with DynamoDB. "Durable" with "in-memory" points to MemoryDB, which is on the SAP-C03 list and not the SAA-C03 list.');

CMP('secrets-vs-parameters', 'Secrets Manager vs Parameter Store', 'Two places to keep configuration and secrets.',
  { saa: ['1.3'], sap: ['2.2'] },
  ['Secrets Manager', 'Parameter Store'],
  [
    ['Built-in rotation', 'Yes, managed for AWS databases', 'No'],
    ['Cost', 'Per secret per month + API calls', 'Standard tier free'],
    ['Size', 'Up to 64 KB', '4 KB standard, 8 KB advanced'],
    ['Cross-Region', 'Replication built in', 'Manual'],
    ['Cross-account', 'Resource policies', 'Sharing of advanced parameters via RAM'],
    ['Best for', 'Credentials and keys', 'Configuration, flags, low-cost secrets']
  ],
  ['<b>Secrets Manager</b> for anything that should rotate or be shared across accounts or Regions.', '<b>Parameter Store</b> for configuration and for secrets where rotation is handled elsewhere.'],
  'A service keeps its database password in Secrets Manager with 30-day rotation, and its feature flags, service URLs and log level in Parameter Store under <code>/payments/prod/</code>.',
  '"Automatic rotation" is the keyword for Secrets Manager. "Lowest cost" with no rotation requirement is Parameter Store.');

CMP('kms-vs-cloudhsm', 'KMS vs CloudHSM', 'Shared, integrated key management against dedicated hardware.',
  { saa: ['1.3'], sap: ['2.2'] },
  ['AWS KMS', 'AWS CloudHSM'],
  [
    ['Tenancy', 'Multi-tenant HSM fleet', 'Single-tenant HSMs in your VPC'],
    ['Who controls keys', 'You, through policies; AWS operates the service', 'Only you; AWS cannot access key material'],
    ['Integration', 'Native in almost every AWS service', 'Through KMS custom key store, or your application'],
    ['Operations', 'None', 'You manage users, cluster size, backups'],
    ['Cost', 'Per key and per request', 'Per HSM-hour, at least two']
  ],
  ['<b>KMS</b> for nearly everything.', '<b>CloudHSM</b> when a regulation or contract requires dedicated hardware or direct HSM APIs.', '<b>External key store</b> when keys must live outside AWS.'],
  'A payment switch must perform PIN translation under scheme rules: neither general KMS nor plain CloudHSM is the natural fit; AWS Payment Cryptography is. The same company encrypts its S3 data and databases with KMS customer managed keys.',
  '"Single-tenant", "dedicated", "FIPS 140 Level 3 under customer control": CloudHSM. Otherwise KMS.');

CMP('network-filters', 'Security groups vs NACLs vs Network Firewall', 'Three layers of network filtering.',
  { saa: ['1.2'], sap: ['1.4'] },
  ['Security group', 'Network ACL', 'Network Firewall'],
  [
    ['Applies to', 'Network interface', 'Subnet', 'Traffic routed through firewall endpoints'],
    ['State', 'Stateful', 'Stateless', 'Stateful and stateless'],
    ['Rules', 'Allow only', 'Allow and deny, ordered', 'IP, port, domain, protocol, signatures'],
    ['Can reference', 'Other security groups', 'CIDR ranges only', 'Domains and rule groups'],
    ['Cost', 'Free', 'Free', 'Per endpoint-hour and per GB']
  ],
  ['<b>Security groups</b> do the day-to-day work: reference groups, least privilege.', '<b>NACLs</b> for a coarse subnet boundary or an explicit deny.', '<b>Network Firewall</b> for domain filtering, intrusion prevention and central inspection.'],
  'A cardholder data environment allows inbound only from the application security group (security groups), blocks a hostile IP range at the subnet (NACL), and restricts outbound traffic to the acquirer\'s hostnames (Network Firewall).',
  'A security group cannot deny. A NACL needs rules for return traffic. Neither can filter by domain name.');

CMP('subnet-types', 'Public vs private vs isolated subnets', 'A subnet\'s type is decided by its route table.',
  { saa: ['1.2', '3.4'], sap: ['1.4'] },
  ['Public', 'Private', 'Isolated'],
  [
    ['Default route', 'Internet gateway', 'NAT gateway', 'None'],
    ['Inbound from internet', 'Possible, with a public IP', 'No', 'No'],
    ['Outbound to internet', 'Yes', 'Yes, through NAT', 'No; AWS services through endpoints'],
    ['Put here', 'Load balancers, NAT gateways', 'Application servers and tasks', 'Databases, sensitive processing']
  ],
  ['<b>Public</b> only for things that must be reachable from the internet.', '<b>Private</b> for compute.', '<b>Isolated</b> for data.'],
  'Three Availability Zones, nine subnets: ALB and NAT in public, Fargate tasks in private, Aurora in isolated subnets with interface endpoints for KMS and Secrets Manager.',
  'A subnet is public because of its route to an internet gateway, not because of its name. An instance there still needs a public IP to be reachable.');

CMP('internet-paths', 'NAT gateway vs internet gateway vs VPC endpoints', 'Three ways traffic leaves a VPC.',
  { saa: ['1.2', '4.4'], sap: ['1.4', '3.2'] },
  ['Internet gateway', 'NAT gateway', 'Gateway endpoint', 'Interface endpoint'],
  [
    ['Direction', 'Both ways', 'Outbound only', 'Outbound to S3 or DynamoDB', 'Outbound to one service'],
    ['Needs public IP', 'Yes, on the resource', 'No', 'No', 'No'],
    ['Destination', 'Internet', 'Internet', 'S3, DynamoDB', 'Most AWS services and PrivateLink services'],
    ['Cost', 'Free', 'Hourly + per GB', 'Free', 'Hourly per zone + per GB']
  ],
  ['<b>Gateway endpoints</b> always, where S3 or DynamoDB is used.', '<b>Interface endpoints</b> for isolated subnets or strict no-internet rules.', '<b>NAT</b> when workloads must reach arbitrary internet hosts.'],
  'Fargate tasks pull images and write logs. With NAT only, every image layer and log line is billed through NAT. Adding the S3 gateway endpoint (image layers) and interface endpoints for ECR and CloudWatch Logs removes most of that traffic.',
  'Gateway endpoints exist only for S3 and DynamoDB and cannot be used from on premises. A NAT gateway lives in a public subnet.');

CMP('vpc-connectivity', 'Peering vs Transit Gateway vs PrivateLink vs VPC Lattice vs Cloud WAN', 'Five ways to connect workloads across VPCs.',
  { saa: ['3.4'], sap: ['1.4', '3.2'] },
  ['Peering', 'Transit Gateway', 'PrivateLink', 'VPC Lattice', 'Cloud WAN'],
  [
    ['Connects', 'Two VPCs', 'Many VPCs and on-premises', 'Consumers to one service', 'Services to services', 'Many VPCs and sites globally'],
    ['Level', 'Network', 'Network', 'Service (L4)', 'Application (L7, some L4)', 'Network'],
    ['Transitive', 'No', 'Yes', 'N/A', 'N/A', 'Yes'],
    ['Overlapping CIDRs', 'No', 'No', 'Yes', 'Yes', 'No'],
    ['Cost', 'Data transfer only', 'Per attachment + per GB', 'Per endpoint + per GB', 'Per service + per GB + requests', 'Per edge, attachment, GB']
  ],
  ['<b>Peering</b> for a few VPCs or one heavy flow.', '<b>Transit Gateway</b> for a Regional hub.', '<b>PrivateLink</b> to publish one service.', '<b>VPC Lattice</b> for many services across accounts with IAM auth.', '<b>Cloud WAN</b> for a global, policy-driven network.'],
  'A group has 30 VPCs in Sydney (Transit Gateway), a data-science VPC exchanging 20 TB a day with the lake VPC (add peering for that pair), a partner consuming one API (PrivateLink), and teams calling each other\'s microservices (VPC Lattice).',
  'Peering is never transitive. Overlapping ranges rule out peering, Transit Gateway and Cloud WAN.');

CMP('dx-vs-vpn', 'Direct Connect vs Site-to-Site VPN', 'Private circuit or encrypted tunnel over the internet.',
  { saa: ['3.4', '4.4'], sap: ['1.3'] },
  ['Direct Connect', 'Site-to-Site VPN'],
  [
    ['Path', 'Dedicated fibre', 'Internet'],
    ['Setup time', 'Weeks to months', 'Minutes'],
    ['Performance', 'Consistent; up to 100 Gbps and beyond', 'Variable; about 1.25 Gbps per tunnel'],
    ['Encryption', 'Not by default (MACsec or VPN on top)', 'IPsec built in'],
    ['Cost', 'Port-hours + lower egress rate + carrier', 'Connection-hours + normal egress']
  ],
  ['<b>VPN</b> to start, for low volume, or as backup.', '<b>Direct Connect</b> for steady high volume or consistent latency.', '<b>Both</b> for resilience: Direct Connect primary, VPN backup; or two Direct Connect locations for maximum resilience.'],
  'A migration starts next week: build a VPN now, order Direct Connect, then keep the VPN as the backup path with BGP preferring Direct Connect.',
  'Direct Connect is private, not encrypted. One connection is a single point of failure.');

CMP('iac-tools', 'Terraform vs CloudFormation vs CDK', 'Three ways to define infrastructure as code.',
  { saa: ['2.2'], sap: ['5.1'] },
  ['Terraform / OpenTofu', 'CloudFormation', 'AWS CDK'],
  [
    ['Language', 'HCL, declarative', 'YAML or JSON, declarative', 'TypeScript, Python, Java, C#, Go'],
    ['State', 'State file you store and lock', 'Managed by AWS', 'CloudFormation stacks'],
    ['Scope', 'AWS and many other providers', 'AWS', 'AWS'],
    ['Multi-account', 'Workspaces, pipelines, provider aliases', 'StackSets with Organizations', 'Pipelines and StackSets'],
    ['Preview and rollback', 'Plan; no automatic rollback', 'Change sets; automatic rollback', 'Diff; CloudFormation rollback']
  ],
  ['<b>Terraform</b> when the team or market expects it (common in New Zealand job ads) or you span providers.', '<b>CloudFormation</b> for AWS-native baselines, StackSets and Service Catalog.', '<b>CDK</b> for developer teams who want real code and reusable constructs.'],
  'A company uses Terraform for application stacks deployed by GitHub Actions, and CloudFormation StackSets for the security baseline that Control Tower rolls into every account.',
  'The AWS exams expect CloudFormation concepts (StackSets, change sets, drift, DeletionPolicy). CDK is out of scope for SAA-C03 and in scope for SAP-C03. Terraform is not examined.');

CMP('iam-identities', 'IAM users vs roles vs Identity Center', 'Which kind of identity for which situation.',
  { saa: ['1.1'], sap: ['2.1'] },
  ['IAM user', 'IAM role', 'IAM Identity Center'],
  [
    ['Credentials', 'Long-lived password and access keys', 'Temporary, issued by STS', 'Temporary, after federated sign-in'],
    ['Used by', 'Legacy people and tools', 'Workloads, services, cross-account, federated people', 'Workforce across accounts'],
    ['Lifecycle', 'Managed per account', 'Assumed when needed', 'Follows the identity provider'],
    ['Recommended', 'Rarely (break-glass, tools that cannot federate)', 'Yes', 'Yes, for people']
  ],
  ['<b>People</b>: Identity Center.', '<b>Workloads on AWS</b>: roles.', '<b>Workloads outside AWS</b>: OIDC federation or IAM Roles Anywhere.', '<b>IAM users</b>: only when nothing else works, with MFA and rotation.'],
  'A developer signs in through Identity Center and gets a PowerUser session in the dev account. The CI pipeline assumes a deploy role by OIDC. The running service uses its ECS task role. No access key exists anywhere.',
  'Any answer creating IAM users with access keys for applications or pipelines is wrong when a role is possible.');

CMP('policy-types', 'SCP vs RCP vs permissions boundary vs identity policy', 'Four policy types that combine to decide access.',
  { saa: ['1.1'], sap: ['2.1', '2.3'] },
  ['Identity policy', 'Permissions boundary', 'SCP', 'RCP'],
  [
    ['Attached to', 'User, group, role', 'User or role', 'OU or account', 'OU or account'],
    ['Grants access', 'Yes', 'No, only limits', 'No, only limits', 'No, only limits'],
    ['Limits', 'The principal it is attached to', 'One principal\'s maximum', 'All principals in the accounts', 'Access to resources in the accounts, by anyone'],
    ['Set by', 'Account admins', 'Admins delegating role creation', 'Organisation admins', 'Organisation admins'],
    ['Typical use', 'Day-to-day permissions', 'Safe delegation to developers', 'Guardrails (Regions, protect logging)', 'Data perimeter (only our organisation)']
  ],
  ['<b>Grant</b> with identity (and resource) policies.', '<b>Cap one role</b> with a boundary.', '<b>Cap every principal in accounts</b> with SCPs.', '<b>Cap who can reach your resources</b> with RCPs.'],
  'A request is allowed only if the identity policy allows it, the boundary (if any) allows it, every SCP above the account allows it, no RCP blocks the resource, and nothing explicitly denies it.',
  'SCPs and boundaries never grant. SCPs do not affect the management account. An SCP cannot stop an external principal that a bucket policy allows; an RCP can.');

CMP('identity-services', 'Cognito vs Identity Center vs Verified Permissions', 'Customer sign-in, workforce sign-in and fine-grained authorisation.',
  { saa: ['1.1', '1.2'], sap: ['2.1'] },
  ['Cognito', 'IAM Identity Center', 'Verified Permissions'],
  [
    ['For', 'Your application\'s customers', 'Your employees', 'Your application\'s authorisation decisions'],
    ['Does', 'Sign-up, sign-in, MFA, tokens, social login', 'Single sign-on to AWS accounts and apps', 'Evaluates Cedar policies: allow or deny'],
    ['Issues', 'JWTs; AWS credentials via identity pools', 'Temporary role sessions', 'Decisions, not credentials']
  ],
  ['<b>Cognito</b> authenticates customers.', '<b>Identity Center</b> authenticates staff.', '<b>Verified Permissions</b> decides what an authenticated user may do inside your app.'],
  'A banking app: customers sign in through a Cognito user pool; the API asks Verified Permissions whether this customer may view this account; engineers reach the AWS accounts through Identity Center.',
  'Cognito is never the answer for employees accessing AWS accounts, and Identity Center is never the answer for mobile app users.');

CMP('multi-az-vs-multi-region', 'Multi-AZ vs Multi-Region', 'High availability within a Region against resilience across Regions.',
  { saa: ['2.2'], sap: ['4.2', '4.3'] },
  ['Multi-AZ', 'Multi-Region'],
  [
    ['Protects against', 'Data centre or zone failure', 'Regional failure, or serves distant users'],
    ['Latency between sites', 'Low single-digit milliseconds', 'Tens to hundreds of milliseconds'],
    ['Replication', 'Usually synchronous', 'Usually asynchronous'],
    ['Complexity and cost', 'Modest', 'High: data consistency, routing, duplicated stacks'],
    ['Typical driver', 'Availability targets', 'DR requirements, regulation, global latency']
  ],
  ['<b>Multi-AZ</b> always for production.', '<b>Multi-Region</b> only when a requirement (RTO/RPO, regulation, global users) demands it.'],
  'A New Zealand payments API: three zones in one Region meets a 99.95% target. A regulator\'s requirement to survive loss of a Region adds a warm standby in a second Region with Aurora Global Database.',
  'Multi-AZ is not disaster recovery from a Regional event, and Multi-Region does not replace Multi-AZ.');

CMP('dr-strategies', 'The four disaster recovery strategies', 'Cost rises and recovery time falls from left to right.',
  { saa: ['2.2'], sap: ['4.2'] },
  ['Backup and restore', 'Pilot light', 'Warm standby', 'Multi-site active/active'],
  [
    ['Running in recovery Region', 'Nothing; backups only', 'Data replicated; core services off or minimal', 'Scaled-down full stack', 'Full stack serving traffic'],
    ['RTO', 'Hours to a day', 'Tens of minutes to hours', 'Minutes', 'Near zero'],
    ['RPO', 'Hours', 'Seconds to minutes', 'Seconds to minutes', 'Near zero'],
    ['Cost', 'Lowest', 'Low', 'Medium', 'Highest'],
    ['Failover action', 'Rebuild from IaC and restore data', 'Start and scale compute', 'Scale up and shift traffic', 'Shift traffic']
  ],
  ['Pick the cheapest strategy that meets the stated RTO and RPO.', 'Keep infrastructure as code for every strategy.', 'Test it, including quotas in the recovery Region.'],
  'RPO 15 minutes and RTO 1 hour: pilot light (continuous database replication, images and IaC ready, compute off). RPO seconds and RTO 5 minutes: warm standby. A regulator demanding no interruption: active/active.',
  'The exam gives RTO and RPO numbers and a cost preference; the answer is the least expensive strategy that still meets both.');

CMP('messaging', 'SQS vs SNS vs EventBridge vs Kinesis vs MSK', 'Queues, topics, buses and streams.',
  { saa: ['2.1', '3.5'], sap: ['1.1'] },
  ['SQS', 'SNS', 'EventBridge', 'Kinesis Data Streams', 'MSK'],
  [
    ['Pattern', 'Queue', 'Pub/sub push', 'Event bus with rules', 'Stream', 'Kafka stream'],
    ['Consumers per message', 'One', 'Every subscriber', 'Up to five targets per rule', 'Many, independent', 'Many consumer groups'],
    ['Retention and replay', 'Up to 14 days; no replay', 'None', 'Archive and replay', '1 to 365 days; replay', 'Configurable; replay'],
    ['Ordering', 'FIFO queues', 'FIFO topics', 'No', 'Per partition key', 'Per partition'],
    ['Operations', 'None', 'None', 'None', 'Shards or on-demand', 'Cluster or serverless']
  ],
  ['<b>SQS</b> to buffer work for one consumer.', '<b>SNS</b> for simple fan-out.', '<b>EventBridge</b> to route by content and to receive AWS or SaaS events.', '<b>Kinesis</b> for ordered, replayable, high-volume streams.', '<b>MSK</b> when Kafka is required.'],
  'A payment is accepted: an event goes to EventBridge; rules deliver it to an SQS queue for the ledger service and another for notifications. Every transaction is also written to a Kinesis stream that feeds fraud scoring and the data lake.',
  '"Decouple" or "buffer": SQS. "Fan-out": SNS. "SaaS events" or "schedule": EventBridge. "Real-time analytics" or "replay": Kinesis. "Kafka": MSK.');

CMP('orchestration', 'Step Functions vs EventBridge vs SQS for coordination', 'Orchestration against choreography.',
  { saa: ['2.1'], sap: ['1.1', '5.4'] },
  ['Step Functions', 'EventBridge', 'SQS'],
  [
    ['Style', 'Orchestration: a central state machine', 'Choreography: services react to events', 'Hand-off of work'],
    ['Visibility', 'Full execution history', 'Distributed; needs tracing', 'Queue metrics'],
    ['Error handling', 'Retry, Catch, compensation built in', 'Per-target retries and DLQ', 'Visibility timeout and DLQ'],
    ['Coupling', 'Coordinator knows the steps', 'Publisher knows nobody', 'Producer knows the queue']
  ],
  ['<b>Step Functions</b> when the order of steps and their failure handling is the business logic.', '<b>EventBridge</b> when independent teams react to facts.', '<b>SQS</b> for simple pipelines and buffering.'],
  'Onboarding a merchant has six ordered steps including a manual review: Step Functions. Once onboarded, a "MerchantActivated" event lets billing, CRM and analytics each do their own thing: EventBridge.',
  '"Workflow", "sequence", "human approval": Step Functions.');

CMP('commitments', 'Savings Plans vs Reserved Instances vs Spot', 'Three ways to pay less than On-Demand.',
  { saa: ['4.2'], sap: ['3.1'] },
  ['Compute Savings Plan', 'EC2 Instance Savings Plan', 'Standard RI', 'Spot'],
  [
    ['Commitment', '$/hour for 1 or 3 years', '$/hour for a family in a Region', 'Specific configuration', 'None'],
    ['Flexibility', 'Any EC2, Fargate, Lambda', 'Size and OS within the family', 'Low (Convertible is higher)', 'Can be interrupted'],
    ['Discount', 'Good', 'Better', 'Best of the commitments', 'Deepest'],
    ['Capacity reserved', 'No', 'No', 'Only zonal RIs', 'No']
  ],
  ['<b>Compute Savings Plans</b> as the default commitment.', '<b>Spot</b> for fault-tolerant, stateless or batch work.', '<b>On-Demand Capacity Reservations</b> when capacity itself must be guaranteed.'],
  'Baseline of 40 vCPUs all year: Compute Savings Plan. Peak scaling: On-Demand. Nightly batch: Spot with several instance types.',
  'Spot for databases or anything that cannot tolerate interruption is wrong. Only a Compute Savings Plan covers Lambda and Fargate.');

CMP('transfer-services', 'DataSync vs Snow Family vs Transfer Family vs DMS', 'Four data-movement services for four kinds of data.',
  { saa: ['3.5'], sap: ['4.1'] },
  ['DataSync', 'Snow Family / Data Transfer Terminal', 'Transfer Family', 'DMS'],
  [
    ['Moves', 'Files and objects', 'Very large data sets', 'Files from partners', 'Database contents'],
    ['How', 'Online, agent-based, scheduled', 'Offline, shipped or carried', 'SFTP, FTPS, AS2 endpoints', 'Full load + change capture'],
    ['Use when', 'Bandwidth is sufficient', 'Network would take too long', 'Others send you files', 'Migrating or replicating databases']
  ],
  ['Work out transfer time first: data size divided by usable bandwidth.', '<b>DataSync</b> if it fits the deadline; offline transfer if not.', '<b>DMS</b> for anything with tables.', '<b>Transfer Family</b> when the other party insists on SFTP.'],
  'Moving a data centre: 40 TB of file shares over 1 Gbps (DataSync, about four days), a 2 TB Oracle database to Aurora (SCT and DMS), 500 TB of video archive (offline), and daily bank settlement files (Transfer Family).',
  'Storage Gateway is not a migration tool; it provides ongoing hybrid access. Several Snow devices are retired, so newer questions favour DataSync and Data Transfer Terminal.');

CMP('analytics-engines', 'Athena vs Redshift vs EMR', 'Three ways to analyse large data.',
  { saa: ['3.5', '4.3'], sap: ['1.5'] },
  ['Athena', 'Redshift', 'EMR'],
  [
    ['What it is', 'Serverless SQL on S3', 'Data warehouse', 'Managed Spark, Hive, Flink and more'],
    ['Infrastructure', 'None', 'Cluster or serverless', 'Cluster, EKS or serverless'],
    ['Pricing', 'Per TB scanned', 'Per node-hour or RPU', 'EMR fee + compute'],
    ['Strength', 'Ad hoc queries, logs', 'Fast repeated BI queries, complex joins', 'Custom large-scale processing']
  ],
  ['<b>Athena</b> for occasional queries.', '<b>Redshift</b> for dashboards used all day.', '<b>EMR</b> (or Glue) for heavy transformation.'],
  'Security analysts query CloudTrail logs a few times a week (Athena). Finance dashboards refresh every few minutes over three years of transactions (Redshift). A nightly job joins and cleans 5 TB of events (Glue or EMR).',
  '"Serverless" and "S3" with "SQL": Athena. "Data warehouse": Redshift. "Hadoop" or "Spark": EMR.');

CMP('security-services', 'GuardDuty vs Inspector vs Macie vs Security Hub vs Detective vs Config', 'Six security services with one job each.',
  { saa: ['1.2', '1.3'], sap: ['2.3'] },
  ['Answers the question', 'Looks at'],
  [
    ['GuardDuty', 'Is something malicious happening?', 'CloudTrail, flow logs, DNS, runtime'],
    ['Inspector', 'Which software has known vulnerabilities?', 'EC2, ECR images, Lambda'],
    ['Macie', 'Where is our sensitive data?', 'S3 objects'],
    ['Config', 'How is this configured, and does it comply?', 'Resource configurations'],
    ['Security Hub', 'What is our overall posture and what should we fix first?', 'Findings from all of the above + standards'],
    ['Detective', 'What exactly happened around this finding?', 'A graph of logs and findings'],
    ['CloudTrail', 'Who called which API?', 'API activity']
  ],
  ['Enable GuardDuty, Config, CloudTrail and Security Hub everywhere, from a delegated security account.', 'Add Inspector wherever there are instances, images or functions.', 'Use Macie on buckets that may hold personal data.'],
  'An alert says an instance is talking to a crypto-mining pool (GuardDuty). The analyst checks what the instance role did in the last day (Detective), finds the unpatched library that let the attacker in (Inspector), and confirms the security group change that exposed it (Config and CloudTrail).',
  'Detect threats: GuardDuty. Vulnerabilities: Inspector. Personal data: Macie. Compliance: Config. Single pane: Security Hub. Root cause: Detective.');

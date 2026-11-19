/* ===== Phases 3 and 5: study notes for every task statement =====
   TASK_NOTES[exam][task] = { know: [...], pick: [[requirement, choice]...], traps: [...] } */
const TASK_NOTES = { saa: {}, sap: {} };
const TN = (key, id, know, pick, traps) => { TASK_NOTES[key][id] = { know, pick, traps }; };

/* ---------------- SAA-C03 ---------------- */
TN('saa', '1.1', [
  'IAM building blocks: users, groups, roles, policies. Roles give temporary credentials and are the right answer for workloads and cross-account access.',
  'Policy evaluation: an explicit Deny always wins; otherwise an Allow is needed from every policy type that applies (identity, resource, boundary, SCP).',
  'Root user: MFA on, no access keys, used only for the few tasks that need it.',
  'Workforce sign-in to many accounts is IAM Identity Center with an external identity provider. Customer sign-in is Cognito.',
  'Multi-account basics: AWS Organizations, SCPs as guardrails, Control Tower to set it all up.'
], [
  ['Application on EC2, ECS or Lambda needs AWS access', 'IAM role (instance profile, task role, execution role)'],
  ['Access a resource in another account', 'Cross-account role, or a resource policy'],
  ['Stop everyone in an account doing X, admins included', 'Service control policy'],
  ['Limit what roles created by developers can ever do', 'Permissions boundary'],
  ['Employees use corporate credentials for AWS', 'IAM Identity Center (federation)'],
  ['Windows workloads need Active Directory', 'AWS Managed Microsoft AD, or AD Connector to reuse on-premises AD']
], [
  'SCPs never grant permissions and do not apply to the management account.',
  'Any answer that stores access keys in code, a file or an AMI is wrong.',
  'A resource policy can allow cross-account access by itself; an identity policy cannot.'
]);
TN('saa', '1.2', [
  'VPC layers: public, private and isolated subnets; security groups (stateful, allow only) and network ACLs (stateless, allow and deny).',
  'Edge protection: WAF for HTTP attacks, Shield for DDoS, CloudFront to hide and offload the origin.',
  'Private access to AWS services: gateway endpoints (S3, DynamoDB, free) and interface endpoints (PrivateLink).',
  'Detection services: GuardDuty (threats), Inspector (vulnerabilities), Macie (sensitive data in S3), Config (configuration), Security Hub (aggregation).',
  'Application authentication: Cognito user pools; API Gateway and ALB can validate tokens.',
  'Administration without SSH: Systems Manager Session Manager.'
], [
  ['Block SQL injection or cross-site scripting', 'AWS WAF'],
  ['Block one IP range at the subnet', 'Network ACL deny rule'],
  ['Only the app tier may reach the database', 'Security group rule referencing the app security group'],
  ['Private subnet needs outbound internet', 'NAT gateway (one per Availability Zone)'],
  ['Filter outbound traffic by domain name', 'AWS Network Firewall'],
  ['Same WAF rules in every account', 'AWS Firewall Manager'],
  ['Expose a service privately to other VPCs', 'PrivateLink behind a Network Load Balancer']
], [
  'Security groups cannot deny. If the question needs a deny, it is a network ACL or WAF.',
  'GuardDuty detects; it does not block or patch.',
  'WAF attaches to CloudFront, ALB, API Gateway, AppSync and Cognito, not to a Network Load Balancer.'
]);
TN('saa', '1.3', [
  'Encryption at rest: KMS keys (AWS owned, AWS managed, customer managed). Customer managed keys give policy control, audit and cross-account sharing.',
  'S3 encryption options: SSE-S3 (default), SSE-KMS, DSSE-KMS, SSE-C, client-side.',
  'Encryption in transit: TLS with ACM certificates; enforce on S3 with aws:SecureTransport.',
  'Secrets: Secrets Manager (rotation) vs Parameter Store (cheap, no rotation).',
  'Data protection features: S3 versioning, Object Lock, MFA delete, Backup Vault Lock, lifecycle and retention policies.',
  'Existing unencrypted EBS volumes and RDS instances are encrypted through an encrypted snapshot copy.'
], [
  ['Control and audit key usage', 'SSE-KMS with a customer managed key'],
  ['Dedicated single-tenant key hardware', 'AWS CloudHSM'],
  ['Rotate database credentials automatically', 'Secrets Manager'],
  ['Records must be undeletable for N years', 'S3 Object Lock, compliance mode'],
  ['Find personal data in S3', 'Amazon Macie'],
  ['TLS certificate on ALB or CloudFront', 'ACM (us-east-1 for CloudFront)']
], [
  'Access to SSE-KMS objects needs both the S3 permission and kms:Decrypt.',
  'AWS managed keys cannot be shared across accounts.',
  'Governance mode can be bypassed with a permission; compliance mode cannot.'
]);
TN('saa', '2.1', [
  'Loose coupling: put a queue, topic or event bus between components so each can fail and scale independently.',
  'SQS (queue, one consumer group), SNS (push fan-out), EventBridge (content-based routing, AWS and SaaS events), Step Functions (orchestration), Kinesis (ordered, replayable streams).',
  'Stateless tiers: keep sessions in ElastiCache or DynamoDB so any instance can serve any request.',
  'Scaling: EC2 Auto Scaling (target tracking, step, scheduled, predictive), Application Auto Scaling for ECS, DynamoDB and Aurora replicas.',
  'Serverless and containers: Lambda (up to 15 minutes), Fargate (no hosts), ECS vs EKS.',
  'API front doors: API Gateway (throttling, keys, caching) and Application Load Balancer.'
], [
  ['Absorb traffic spikes in front of a slow backend', 'SQS queue'],
  ['Several services each need every event', 'SNS topic to one SQS queue per service'],
  ['Strict order and exactly-once', 'SQS FIFO'],
  ['Coordinate multiple steps with retries', 'Step Functions'],
  ['React to AWS or SaaS events', 'EventBridge'],
  ['Run containers with least operational overhead', 'ECS on Fargate'],
  ['Read-heavy database load', 'Read replicas and caching']
], [
  'Scale queue workers on backlog, not CPU.',
  'A standard SQS queue can deliver twice: consumers must be idempotent.',
  'Lambda is wrong for anything over 15 minutes.'
]);
TN('saa', '2.2', [
  'High availability means surviving a failure with little or no interruption (multi-AZ). Disaster recovery means recovering after a larger failure (multi-Region or backups).',
  'RPO is how much data you can lose; RTO is how long recovery may take.',
  'DR strategies, cheapest and slowest first: backup and restore, pilot light, warm standby, multi-site active/active.',
  'Database resilience: RDS Multi-AZ (automatic failover), read replicas (scaling, cross-Region DR), Aurora (six copies, fast failover, Global Database), DynamoDB (multi-AZ by default, global tables, point-in-time recovery).',
  'Routing for failover: Route 53 health checks and failover records; Global Accelerator for fast, non-DNS failover.',
  'Storage resilience: S3 (multi-AZ by design, replication for cross-Region), EFS Regional, EBS snapshots.'
], [
  ['Survive an Availability Zone failure', 'Multi-AZ everything: ASG across zones, RDS Multi-AZ, NAT per zone'],
  ['Cross-Region relational DR with low RPO', 'Aurora Global Database, or RDS cross-Region read replica'],
  ['Cheapest DR, long RTO acceptable', 'Backup and restore'],
  ['Automatic DNS failover', 'Route 53 failover routing with health checks'],
  ['Central backups across services', 'AWS Backup'],
  ['Recover from accidental deletes', 'Versioning (S3), point-in-time recovery (RDS, DynamoDB)']
], [
  'Multi-AZ is availability; read replicas are scaling. They are not interchangeable.',
  'Replication is not backup: a bad delete replicates too.',
  'A single NAT gateway or a single-AZ database is a hidden single point of failure in "highly available" designs.'
]);
TN('saa', '3.1', [
  'Block (EBS), file (EFS, FSx) and object (S3) storage, and which workloads need which.',
  'EBS types: gp3 default, io2 Block Express for the highest IOPS, st1 and sc1 for sequential and cold HDD workloads. Instance store is fast and temporary.',
  'File services: EFS (Linux NFS, elastic, multi-AZ), FSx for Windows (SMB, AD), FSx for Lustre (HPC), FSx for ONTAP (multi-protocol), FSx for OpenZFS.',
  'S3 performance: multipart upload, Transfer Acceleration, prefixes scale request rates, CloudFront for downloads.',
  'Hybrid storage: Storage Gateway (file, volume, tape) for ongoing access; DataSync for transfer.'
], [
  ['Shared Linux file system across zones', 'Amazon EFS'],
  ['Windows shares with Active Directory', 'FSx for Windows File Server'],
  ['HPC parallel file system linked to S3', 'FSx for Lustre'],
  ['Highest IOPS for one database volume', 'io2 Block Express'],
  ['Faster long-distance uploads to S3', 'Transfer Acceleration, multipart upload'],
  ['On-premises apps need NFS/SMB backed by S3', 'S3 File Gateway']
], [
  'EBS is tied to one Availability Zone.',
  'HDD volume types cannot be boot volumes.',
  'EFS is not for Windows.'
]);
TN('saa', '3.2', [
  'Choosing compute: EC2 (control), containers on ECS or EKS (portability), Fargate (no hosts), Lambda (events, short), Batch (queued jobs), Elastic Beanstalk (platform).',
  'EC2 families: general (M, T), compute (C), memory (R, X), storage (I, D), accelerated (G, P). Graviton for price-performance.',
  'Placement groups: cluster (low latency), spread (isolate hardware), partition (large distributed systems).',
  'Scaling policies and what metric to scale on.',
  'Lambda performance: memory size sets CPU; provisioned concurrency removes cold starts.',
  'Edge and hybrid compute: Outposts, Local Zones, Wavelength.'
], [
  ['Short event-driven tasks', 'Lambda'],
  ['Long-running jobs, no servers', 'Fargate tasks or AWS Batch'],
  ['Lowest latency between nodes', 'Cluster placement group'],
  ['Eliminate cold starts', 'Provisioned concurrency'],
  ['Deploy code without managing infrastructure, keep EC2 visibility', 'Elastic Beanstalk'],
  ['AWS services in your own data centre', 'Outposts']
], [
  'Burstable T instances are wrong for sustained high CPU.',
  'Fargate does not remove the need for an orchestrator: ECS or EKS still schedules.',
  'CloudWatch does not show EC2 memory without the agent.'
]);
TN('saa', '3.3', [
  'Match the data model: relational (RDS, Aurora), key-value (DynamoDB), in-memory (ElastiCache, MemoryDB), document (DocumentDB), graph (Neptune), wide-column (Keyspaces), time-series (Timestream), warehouse (Redshift), search (OpenSearch).',
  'Read scaling: read replicas, Aurora readers with the reader endpoint, caching, DAX for DynamoDB.',
  'Connection management: RDS Proxy.',
  'DynamoDB design: partition key choice, GSIs and LSIs, on-demand vs provisioned, strong vs eventual consistency.',
  'Aurora features: Serverless v2, Global Database, cloning.'
], [
  ['Serverless key-value at any scale', 'DynamoDB'],
  ['Microsecond DynamoDB reads', 'DAX'],
  ['Cache query results or sessions', 'ElastiCache'],
  ['Analytics with complex SQL on terabytes', 'Redshift'],
  ['Relationships many hops deep', 'Neptune'],
  ['MongoDB or Cassandra compatibility', 'DocumentDB or Keyspaces'],
  ['Lambda exhausting database connections', 'RDS Proxy']
], [
  'Redshift is never the answer for transaction processing.',
  'GSIs are eventually consistent only.',
  'Bigger instance is rarely the intended answer when caching or replicas fit.'
]);
TN('saa', '3.4', [
  'Load balancers: ALB (layer 7), NLB (layer 4, static IP), Gateway Load Balancer (appliances).',
  'Global delivery: CloudFront (HTTP caching) vs Global Accelerator (TCP/UDP, static IPs).',
  'Route 53 routing policies: simple, weighted, latency, failover, geolocation, geoproximity, multivalue.',
  'Hybrid connectivity: Site-to-Site VPN (fast, encrypted, internet) vs Direct Connect (private, consistent, weeks to provision).',
  'Connecting VPCs: peering (non-transitive), Transit Gateway (hub), PrivateLink (one service).',
  'VPC design: CIDR sizing, subnets per zone, endpoints.'
], [
  ['Path or host-based routing', 'Application Load Balancer'],
  ['Static IP or non-HTTP protocol', 'Network Load Balancer'],
  ['Cache static content for global users', 'CloudFront'],
  ['Fixed IPs and fast failover across Regions', 'Global Accelerator'],
  ['Many VPCs and on-premises networks', 'Transit Gateway'],
  ['Consistent high-throughput link to on-premises', 'Direct Connect'],
  ['Route users by country for compliance', 'Route 53 geolocation']
], [
  'VPC peering is not transitive.',
  'Direct Connect is not encrypted by default.',
  'An ALB has no fixed IP addresses.'
]);
TN('saa', '3.5', [
  'Streaming: Kinesis Data Streams (ordered, replay, many consumers), Data Firehose (managed delivery, near real time), MSK (Kafka), Managed Service for Apache Flink (stream processing).',
  'Batch and ETL: Glue (serverless ETL and catalogue), EMR (Spark and Hadoop), Athena (SQL on S3).',
  'Data lakes: S3 plus Glue Data Catalog plus Lake Formation permissions.',
  'Transfer: DataSync (online files), Snow Family (offline), Transfer Family (SFTP), DMS (databases), AppFlow (SaaS).',
  'Visualisation: QuickSight (Quick). Columnar formats (Parquet) and partitioning reduce query cost.'
], [
  ['Load a stream into S3 or Redshift with no code', 'Data Firehose'],
  ['Real-time, ordered, replayable', 'Kinesis Data Streams'],
  ['Existing Kafka applications', 'Amazon MSK'],
  ['Serverless ETL and schema discovery', 'AWS Glue'],
  ['SQL on files in S3', 'Athena'],
  ['SFTP into S3', 'Transfer Family'],
  ['Petabytes, poor bandwidth', 'Snow Family']
], [
  'Firehose is near real time, not real time, and cannot replay.',
  'DataSync moves data; Storage Gateway provides ongoing hybrid access.',
  'Athena cost depends on data scanned: partition and use Parquet.'
]);
TN('saa', '4.1', [
  'S3 storage classes, minimum durations and retrieval fees; lifecycle rules; Intelligent-Tiering for unknown patterns.',
  'EBS: gp3 over gp2, delete unattached volumes and old snapshots, snapshot archive.',
  'EFS and FSx: lifecycle to infrequent access, One Zone options.',
  'Backup retention matched to requirements; cold storage tiers.',
  'Data transfer methods and their cost (Snow Family vs network).'
], [
  ['Unknown or changing access pattern', 'S3 Intelligent-Tiering'],
  ['Rarely read, instant access', 'Standard-IA or Glacier Instant Retrieval'],
  ['Archive, hours to retrieve', 'Glacier Flexible Retrieval or Deep Archive'],
  ['Re-creatable infrequent data', 'One Zone-IA'],
  ['Automate tiering and expiry', 'Lifecycle rules'],
  ['Cheaper SSD volumes', 'gp3']
], [
  'IA classes charge a 128 KB minimum per object and a 30-day minimum.',
  'Versioned buckets need a rule to expire noncurrent versions.',
  'Incomplete multipart uploads cost money until aborted.'
]);
TN('saa', '4.2', [
  'Purchase options: On-Demand, Savings Plans, Reserved Instances, Spot, Dedicated Hosts.',
  'Right-sizing with Compute Optimizer; Graviton; scheduling non-production off.',
  'Serverless and containers to remove idle cost; Fargate Spot.',
  'Auto Scaling so capacity follows demand.',
  'Cost tools: Cost Explorer, Budgets, Cost and Usage Report, Trusted Advisor.'
], [
  ['Steady baseline for 1 to 3 years', 'Savings Plan or Reserved Instances'],
  ['Flexible commitment across EC2, Fargate, Lambda', 'Compute Savings Plan'],
  ['Interruptible batch', 'Spot Instances'],
  ['Idle outside office hours', 'Scheduled stop or scaling to zero'],
  ['Licence tied to physical cores', 'Dedicated Hosts'],
  ['Alert on spend', 'AWS Budgets']
], [
  'Spot is wrong for stateful, non-interruptible workloads.',
  'Savings Plans do not reserve capacity.',
  'Right-size before committing.'
]);
TN('saa', '4.3', [
  'Engine choice affects cost: open-source engines over licensed ones; Aurora Serverless for variable load; DynamoDB on-demand vs provisioned.',
  'Reduce load with caching and read replicas before scaling up.',
  'Reserved capacity for steady databases.',
  'Backup retention, snapshot export, and storage type (gp3, Aurora I/O-Optimized).',
  'Use the right tool: Athena for occasional queries instead of an always-on cluster.'
], [
  ['Intermittent or unpredictable relational load', 'Aurora Serverless v2'],
  ['Spiky NoSQL traffic', 'DynamoDB on-demand'],
  ['Steady NoSQL traffic', 'DynamoDB provisioned with auto scaling'],
  ['Repeated identical reads', 'ElastiCache or DAX'],
  ['Occasional analysis of S3 data', 'Athena'],
  ['Expire old items for free', 'DynamoDB TTL']
], [
  'Multi-AZ doubles instance cost: do not add it to development databases.',
  'A provisioned warehouse running 24/7 for weekly reports is a cost trap.'
]);
TN('saa', '4.4', [
  'What is charged: data out to the internet, between Regions, between Availability Zones, NAT gateway processing, Transit Gateway processing, interface endpoint hours.',
  'What is free: data in, traffic within one zone on private IPs, S3 and DynamoDB gateway endpoints, S3 to CloudFront.',
  'CloudFront lowers egress and origin load.',
  'Direct Connect has lower per-GB egress than the internet for large steady flows.',
  'Choose connectivity by volume: peering for two VPCs with heavy traffic, Transit Gateway for many.'
], [
  ['High NAT charges for S3 traffic', 'S3 gateway endpoint'],
  ['High egress serving content', 'CloudFront'],
  ['Heavy traffic between two VPCs', 'VPC peering'],
  ['Large steady transfer to on-premises', 'Direct Connect'],
  ['Cheap hybrid link for low volume', 'Site-to-Site VPN']
], [
  'Cross-AZ traffic is charged in both directions.',
  'Using public IPs between instances in the same Region costs more than private IPs.',
  'A NAT gateway per zone is right for availability, but it is a cost you should know.'
]);

/* ---------------- SAP-C03 ---------------- */
TN('sap', '1.1', [
  'Cloud-native patterns: event-driven design, microservices, serverless, loose coupling, statelessness, immutable infrastructure.',
  'Multi-tenancy models: silo (per-tenant stack), pool (shared), bridge (mixed); tenant isolation, noisy-neighbour control, tenant-aware routing and cost.',
  'Incremental modernisation: strangler fig, anti-corruption layers, queues between old and new.',
  'Choosing compute per component: Lambda, Fargate, ECS, EKS, EC2, Batch.',
  'Service-to-service communication: API Gateway, ALB, VPC Lattice, EventBridge, SQS and SNS.'
], [
  ['Decouple a slow dependency without a rewrite', 'SNS/SQS between the components'],
  ['Explicit multi-step transactions with compensation', 'Step Functions saga'],
  ['Per-tenant rate limits in a pooled model', 'API Gateway usage plans, tenant-aware queues'],
  ['Strong tenant isolation required', 'Silo model: account or stack per tenant'],
  ['Replace a monolith gradually', 'Strangler fig behind an ALB or API Gateway']
], [
  'The exam rewards the option that meets requirements with the least operational overhead, not the most sophisticated design.',
  'Big-bang rewrites are almost never the intended answer.',
  '"Pooled" does not mean unprotected: isolation still has to be enforced by IAM, not by application code alone.'
]);
TN('sap', '1.2', [
  'Amazon Bedrock: model choice, on-demand vs batch vs provisioned throughput, cross-Region inference, prompt caching and routing.',
  'RAG with Knowledge Bases: sources, chunking, embeddings, vector stores (OpenSearch Serverless, Aurora pgvector, S3 Vectors).',
  'Agents and AgentCore: runtime, memory, gateway (tools), identity, observability.',
  'When to customise: prompt engineering first, then RAG, then fine-tuning or distillation.',
  'SageMaker AI for custom models: real-time, serverless, asynchronous and batch inference.',
  'Purpose-built AI services (Textract, Transcribe, Comprehend, Rekognition) when the task is standard.'
], [
  ['Answers grounded in changing company documents', 'Bedrock Knowledge Bases (RAG)'],
  ['Offline bulk inference at lower cost', 'Batch inference'],
  ['Guaranteed capacity for steady high volume', 'Provisioned throughput'],
  ['Production agents with isolation and tool governance', 'Bedrock AgentCore'],
  ['Custom model trained on your data', 'SageMaker AI'],
  ['Lower cost for simple tasks', 'Smaller model, prompt routing, caching']
], [
  'Fine-tuning does not keep a model current with documents that change weekly; RAG does.',
  'Cross-Region inference can move processing outside a country: check residency requirements.',
  'A model is not an access-control system.'
]);
TN('sap', '1.3', [
  'Connectivity: Direct Connect (dedicated and hosted, virtual interfaces, Direct Connect gateway, resilience models), Site-to-Site VPN, VPN over Direct Connect, MACsec.',
  'Hybrid DNS: Route 53 Resolver inbound and outbound endpoints, forwarding rules shared with RAM.',
  'Hybrid compute: Outposts, Local Zones, ECS Anywhere, EKS Anywhere and Hybrid Nodes.',
  'Hybrid storage and transfer: Storage Gateway, DataSync, Transfer Family, Data Transfer Terminal.',
  'Hybrid identity: Directory Service, AD Connector, IAM Roles Anywhere, federation.'
], [
  ['Maximum resilience for a private link', 'Direct Connect at two locations, separate devices'],
  ['Private and encrypted', 'MACsec, or IPsec VPN over Direct Connect'],
  ['One connection reaching VPCs in several Regions', 'Direct Connect gateway (with transit gateways)'],
  ['Two-way name resolution', 'Resolver inbound + outbound endpoints'],
  ['On-premises workloads need AWS credentials without keys', 'IAM Roles Anywhere'],
  ['Data must stay on site but use AWS APIs', 'Outposts']
], [
  'Two connections at one location do not protect against losing the location.',
  'A VPN backup has different performance: check whether "consistent" is a requirement.',
  'Outposts depends on its parent Region for the control plane.'
]);
TN('sap', '1.4', [
  'Multi-VPC and multi-account networking: Transit Gateway route table segmentation, VPC sharing, peering, PrivateLink, VPC Lattice, Cloud WAN.',
  'Centralised inspection and egress: inspection VPC, Network Firewall, Gateway Load Balancer, appliance mode.',
  'Edge: CloudFront, Global Accelerator, Route 53 policies, WAF and Shield Advanced.',
  'IP addressing: non-overlapping CIDR plans with IPAM, IPv6, handling overlaps with PrivateLink or Lattice.',
  'Private service access: interface and gateway endpoints, endpoint policies, centralised endpoints.'
], [
  ['Many VPCs, one Region, segmentation', 'Transit Gateway with separate route tables'],
  ['Global network, central policy', 'Cloud WAN'],
  ['Service-level access across accounts with IAM auth', 'VPC Lattice'],
  ['One provider service to many consumers, overlapping CIDRs', 'PrivateLink'],
  ['Inspect all east-west and outbound traffic', 'Inspection VPC with Network Firewall'],
  ['Teams deploy into centrally owned subnets', 'VPC sharing (RAM)']
], [
  'Transit Gateway and peering both fail with overlapping CIDRs.',
  'Forgetting appliance mode breaks stateful inspection across zones.',
  'Transit Gateway data processing charges matter for high-volume flows.'
]);
TN('sap', '1.5', [
  'Purpose-built databases and when each fits, including Aurora DSQL, MemoryDB and Timestream (new to the C03 list).',
  'Multi-Region data: Aurora Global Database, DynamoDB global tables, DSQL, S3 replication and Multi-Region Access Points.',
  'Data lakes and analytics: S3, Glue, Lake Formation, Athena, Redshift, EMR, streaming ingestion, zero-ETL.',
  'Storage selection across S3, EBS, EFS and the FSx family at scale.',
  'Consistency, durability and latency trade-offs between options.'
], [
  ['Active-active relational, strong consistency, serverless', 'Aurora DSQL'],
  ['Active-active NoSQL', 'DynamoDB global tables'],
  ['Relational read scaling plus cross-Region DR', 'Aurora Global Database'],
  ['Durable in-memory primary store', 'MemoryDB'],
  ['Column- and row-level lake permissions', 'Lake Formation'],
  ['Operational data into the warehouse without pipelines', 'Zero-ETL integration with Redshift']
], [
  'Global tables use last-writer-wins by default: the application must tolerate it.',
  'Aurora Global Database has one writer Region.',
  'Choosing one database for every workload is usually the wrong answer at this level.'
]);
TN('sap', '2.1', [
  'Workforce identity: IAM Identity Center, external IdPs with SAML and SCIM, permission sets, ABAC with session tags.',
  'Workload identity: roles, OIDC federation for CI/CD, IAM Roles Anywhere, EKS Pod Identity.',
  'Application identity (new emphasis in C03): Cognito user pools and identity pools, OAuth 2.0 flows and scopes, Verified Permissions for fine-grained authorisation, Verified Access for VPN-less access.',
  'Cross-account access patterns and confused-deputy protection with external IDs and source conditions.',
  'Tenant isolation with session policies and tags.'
], [
  ['Pipelines outside AWS need access', 'OIDC federation to a scoped role'],
  ['Fine-grained business authorisation rules', 'Amazon Verified Permissions (Cedar)'],
  ['Per-application access by identity and device, no VPN', 'AWS Verified Access'],
  ['Third party assumes a role in your account', 'Trust policy with an external ID'],
  ['Per-tenant data isolation in a shared role', 'Session policies or session tags (ABAC)'],
  ['Customer sign-in with social providers', 'Cognito user pool']
], [
  'Authentication (who) and authorisation (what) are different services: Cognito vs Verified Permissions.',
  'Long-lived access keys are wrong whenever a federation option exists.',
  'Identity Center is workforce; Cognito is customers.'
]);
TN('sap', '2.2', [
  'KMS key strategy: customer managed keys, key policies, grants, multi-Region keys, rotation, imported key material.',
  'Sovereignty options: CloudHSM custom key store, external key store, and their availability trade-offs.',
  'Cross-account and cross-Region encryption for backups, replication and sharing.',
  'Data perimeters: RCPs, VPC endpoint policies, aws:PrincipalOrgID and network conditions.',
  'Certificates: ACM, Private CA hierarchies, mutual TLS.',
  'Post-quantum cryptography: ML-KEM hybrid TLS, ML-DSA signatures (new in C03).'
], [
  ['Decrypt replicated data in a DR Region', 'Multi-Region keys, or re-encrypt with a destination key'],
  ['Keys must stay outside AWS', 'KMS external key store'],
  ['Dedicated HSM under your control', 'CloudHSM (custom key store)'],
  ['No resource reachable from outside the organisation', 'Resource control policies'],
  ['Internal service-to-service TLS', 'AWS Private CA'],
  ['Reduce KMS cost on busy buckets', 'S3 Bucket Keys']
], [
  'KMS keys are Regional.',
  'An external key store makes AWS availability depend on your key manager.',
  'SCPs restrict your principals; RCPs restrict access to your resources.'
]);
TN('sap', '2.3', [
  'Organisation design: OUs by function (Security, Infrastructure, Workloads, Sandbox), account-per-workload-per-environment.',
  'Policy types: SCPs, RCPs, tag policies, backup policies, AI opt-out policies.',
  'Control Tower: landing zone, controls (preventive, detective, proactive), Account Factory and customisations.',
  'Central security services with delegated administration: GuardDuty, Security Hub, Inspector, Macie, Config aggregators, Firewall Manager, Security Lake.',
  'Sharing with RAM and Service Catalog.'
], [
  ['Guardrail no account admin can remove', 'SCP on the OU'],
  ['Standard new accounts with baseline', 'Control Tower Account Factory'],
  ['Security tooling for all current and future accounts', 'Delegated administrator with auto-enable'],
  ['Self-service approved stacks', 'Service Catalog'],
  ['Same WAF or firewall rules everywhere', 'Firewall Manager'],
  ['Central normalised security logs', 'Security Lake']
], [
  'Never run workloads or daily security operations in the management account.',
  'SCPs do not apply to the management account or to service-linked roles.',
  'Test SCPs on a sandbox OU before applying widely.'
]);
TN('sap', '2.4', [
  'Evidence and audit: CloudTrail organisation trails, log archive account, Object Lock, log file validation, Audit Manager, Artifact.',
  'Continuous compliance: Config rules, conformance packs, Security Hub standards, automated remediation.',
  'Data residency and sovereignty: Region restrictions, Local Zones and dedicated options, key location.',
  'Retention and immutability: S3 Object Lock, Backup Vault Lock, snapshot lock.',
  'Shared responsibility: AWS reports cover AWS; your controls cover your workload.'
], [
  ['Prove data stays in approved Regions', 'Region-deny SCP plus Config evidence'],
  ['Tamper-proof audit logs', 'Org trail to log archive account with Object Lock'],
  ['Backups that cannot be deleted', 'Backup Vault Lock'],
  ['Map evidence to PCI DSS or ISO 27001', 'Audit Manager, Security Hub standards'],
  ['AWS\'s own compliance reports', 'AWS Artifact']
], [
  'Detective controls do not prevent; pair them with preventive ones.',
  'A compliance report for AWS is not evidence your workload is compliant.',
  'Global services need exemptions in Region-restriction policies.'
]);
TN('sap', '2.5', [
  'Bedrock Guardrails: content filters, denied topics, sensitive information filters, prompt attack detection, grounding checks.',
  'Governance: IAM and SCP controls on models and guardrails, model invocation logging, CloudTrail.',
  'Data protection for AI: private endpoints, encryption, tenant isolation in knowledge bases and memory, least-privilege agent tools.',
  'Responsible AI practices: evaluation, human review (A2I), transparency, bias checks (SageMaker Clarify).',
  'Threats: prompt injection, data exfiltration through tools, over-permissive agents.'
], [
  ['Block topics and redact personal data', 'Bedrock Guardrails'],
  ['Require guardrails and approved models organisation-wide', 'SCP/IAM with Bedrock condition keys'],
  ['Audit prompts and responses', 'Model invocation logging to a protected store'],
  ['Restrict retrieval per user or tenant', 'Metadata filters or separate knowledge bases'],
  ['Human check on low-confidence output', 'Amazon Augmented AI or an approval step']
], [
  'A system prompt is not a security control.',
  'Agent permissions should be scoped per tool, not one broad role.',
  'Logging prompts can itself store personal data: protect and limit the logs.'
]);
TN('sap', '3.1', [
  'Pricing models: On-Demand, Savings Plans (Compute, EC2 Instance, database), Reserved Instances, Spot, capacity reservations.',
  'Organisation-level sharing of commitments and volume discounts.',
  'Serverless vs provisioned crossover; Graviton; right-sizing.',
  'Generative AI pricing: tokens, batch, provisioned throughput, caching, model selection.',
  'Licensing: bring your own licence, Dedicated Hosts, License Manager.'
], [
  ['Flexible commitment across an evolving fleet', 'Compute Savings Plans in the management account'],
  ['Fault-tolerant stateless capacity', 'Spot with diversified instance types'],
  ['Steady high request volume', 'Compare Lambda against containers'],
  ['Nightly AI workloads', 'Bedrock batch inference'],
  ['Guaranteed capacity for a DR event', 'On-Demand Capacity Reservations']
], [
  'Commit to the baseline, not the peak.',
  'Savings Plans do not guarantee capacity.',
  'The cheapest unit price is not the cheapest solution if it adds operational work.'
]);
TN('sap', '3.2', [
  'Where transfer charges arise: internet egress, inter-Region, inter-AZ, NAT, Transit Gateway, PrivateLink, Global Accelerator.',
  'Reducing them: gateway endpoints, centralised egress, peering for heavy flows, CloudFront, compression, Direct Connect, zone-aware routing.',
  'Centralised vs distributed endpoints and NAT: trade hourly charges against processing charges.',
  'Architectural placement: keep chatty components in the same zone or Region; replicate deliberately.'
], [
  ['NAT cost dominated by S3/DynamoDB traffic', 'Gateway endpoints'],
  ['Dozens of VPCs each with NAT', 'Centralised egress VPC'],
  ['Heavy flow between two VPCs on a transit gateway', 'Add peering for that pair'],
  ['Large egress to on-premises', 'Direct Connect'],
  ['Global content delivery cost', 'CloudFront']
], [
  'Centralising everything adds Transit Gateway processing charges: do the arithmetic.',
  'Single-AZ to save transfer cost sacrifices availability.'
]);
TN('sap', '3.3', [
  'Tagging strategy: tag policies, cost allocation tags, enforcement with SCP and IAM conditions.',
  'Cost Categories, Cost Explorer, Cost and Usage Report (Data Exports) with Athena or Quick.',
  'Budgets and budget actions, Cost Anomaly Detection.',
  'Shared-cost allocation: split cost allocation data for ECS and EKS, Billing Conductor.',
  'Organisation structure as a cost boundary: account per workload.'
], [
  ['Cost by product across accounts and tags', 'Cost Categories'],
  ['Per-team cost on a shared EKS cluster', 'Split cost allocation data'],
  ['Block spend past a limit in sandboxes', 'Budgets actions'],
  ['Catch unusual spend early', 'Cost Anomaly Detection'],
  ['Most detailed billing data', 'Cost and Usage Report']
], [
  'Tags do nothing for billing until activated as cost allocation tags.',
  'Budgets lag by hours: they are not instant spending caps.'
]);
TN('sap', '3.4', [
  'S3: Intelligent-Tiering, lifecycle, Storage Lens, expiring versions and multipart uploads.',
  'EBS: gp3, snapshot archive, Data Lifecycle Manager.',
  'Databases: right-sizing, reserved capacity, Aurora I/O-Optimized, Serverless v2, DynamoDB capacity modes and Standard-IA table class, TTL.',
  'File systems: EFS lifecycle, FSx tiering.',
  'Backups: retention aligned to policy, cold tiers.'
], [
  ['Unpredictable access at petabyte scale', 'S3 Intelligent-Tiering'],
  ['I/O-heavy Aurora', 'Aurora I/O-Optimized'],
  ['Many idle small databases', 'Consolidate or Aurora Serverless v2'],
  ['Rarely read DynamoDB history', 'Standard-IA table class'],
  ['Automate snapshot retention', 'Data Lifecycle Manager or AWS Backup']
], [
  'Archive classes have minimum durations and retrieval costs.',
  'Deleting backups to save money can break compliance.'
]);
TN('sap', '4.1', [
  'Migration frameworks: assess, mobilise, migrate and modernise; the seven Rs.',
  'Discovery and planning: Application Discovery Service, AWS Transform, Migration Hub, wave planning from dependencies.',
  'Tools by workload: Application Migration Service (servers), DMS and SCT (databases), DataSync, Transfer Family, Snow or Data Transfer Terminal (data).',
  'Modernisation targets: containers, managed databases, serverless; strangler fig.',
  'Cut-over planning: replication, testing, rollback, DNS.'
], [
  ['Move many servers fast', 'Rehost with Application Migration Service'],
  ['Change database engine with little downtime', 'SCT + DMS with CDC'],
  ['Large file shares, online', 'DataSync'],
  ['Too much data for the link', 'Offline transfer'],
  ['Buy instead of migrate', 'Repurchase (SaaS)'],
  ['Unused application', 'Retire']
], [
  'DMS moves data; schema and code conversion is a separate step.',
  'Skipping dependency mapping splits applications across waves.',
  'Lift-and-shift without right-sizing carries waste into the cloud.'
]);
TN('sap', '4.2', [
  'RPO and RTO drive the strategy: backup and restore, pilot light, warm standby, multi-site active/active.',
  'Data replication options per service and their lag.',
  'Failover mechanics: Route 53 health checks, Application Recovery Controller, Global Accelerator; rely on data-plane actions.',
  'Elastic Disaster Recovery for servers; AWS Backup with cross-Region and cross-account copies.',
  'Readiness: quotas, capacity reservations, IaC for the recovery Region, regular drills.'
], [
  ['RPO seconds, RTO minutes, servers', 'Elastic Disaster Recovery'],
  ['Relational cross-Region with managed switchover', 'Aurora Global Database'],
  ['Stated replication time for S3', 'Replication Time Control'],
  ['Failover that works during a control-plane impairment', 'Pre-provisioned capacity + health-check routing'],
  ['Lowest cost, hours acceptable', 'Backup and restore']
], [
  'A DR plan that needs API calls to create resources may fail when you need it.',
  'Untested DR is not DR.',
  'Quotas are per Region.'
]);
TN('sap', '4.3', [
  'Resilience patterns: timeouts, retries with backoff and jitter, circuit breakers, bulkheads, load shedding, idempotency, graceful degradation.',
  'Static stability and zonal independence; zonal shift.',
  'Blast-radius reduction: cells, shuffle sharding, account and Region isolation.',
  'Testing: Resilience Hub assessments, Fault Injection Service experiments, game days.',
  'Dependencies: avoid hard dependencies on control planes and on other Regions.'
], [
  ['Check design against RTO/RPO', 'AWS Resilience Hub'],
  ['Prove behaviour under failure', 'AWS Fault Injection Service'],
  ['Evacuate an impaired zone quickly', 'Zonal shift'],
  ['Contain failures and bad deploys', 'Cell-based architecture'],
  ['Stop cascading failure from a slow dependency', 'Timeouts, circuit breaker, queue']
], [
  'Unbounded retries turn a blip into an outage.',
  'Health checks that depend on shared downstream systems can take every target out at once.'
]);
TN('sap', '5.1', [
  'CloudFormation: StackSets with Organizations, change sets, drift detection, stack policies, deletion policies, hooks.',
  'CDK and when it fits; Terraform as the common third-party choice.',
  'Policy as code before deployment (Guard, hooks, plan checks).',
  'Environment promotion and account baselines; Control Tower customisations.',
  'Immutable infrastructure and golden images.'
], [
  ['Baseline to all current and future accounts', 'StackSets with automatic deployment'],
  ['Block non-compliant resources before creation', 'CloudFormation Hooks or pipeline policy checks'],
  ['Protect stateful resources', 'DeletionPolicy, stack policy, change set review'],
  ['Infrastructure in a programming language', 'AWS CDK'],
  ['Detect console changes', 'Drift detection']
], [
  'Manual changes to managed resources cause drift and failed updates.',
  'One stack for everything makes every change risky.'
]);
TN('sap', '5.2', [
  'Pipelines: CodePipeline, CodeBuild, CodeDeploy; cross-account deployment roles; OIDC for external CI.',
  'Deployment strategies: rolling, blue/green, canary, linear; automatic rollback on alarms; feature flags.',
  'DevSecOps: static analysis, dependency and secret scanning, image scanning and signing, SBOM.',
  'Database changes: expand and contract.',
  'Separation of duties and approvals.'
], [
  ['Instant rollback', 'Blue/green'],
  ['Limit exposure of a new version', 'Canary with alarms'],
  ['Deploy to many accounts securely', 'Central pipeline assuming scoped roles'],
  ['Find vulnerable images after release', 'ECR enhanced scanning (Inspector)'],
  ['Change behaviour without deploying', 'AppConfig feature flags']
], [
  'Long-lived keys in CI systems are a finding, not a solution.',
  'A release that cannot be rolled back because of a schema change is a design error.'
]);
TN('sap', '5.3', [
  'CloudWatch at scale: cross-account observability, metric streams, Logs Insights, log classes and retention.',
  'Tracing and OpenTelemetry: ADOT, X-Ray, Application Signals, context propagation.',
  'SLOs and error budgets; percentile metrics; synthetic and real-user monitoring.',
  'Managed Prometheus and Grafana for container platforms.',
  'Central logging architecture and Security Lake.'
], [
  ['One view across many accounts', 'CloudWatch cross-account observability'],
  ['Find the slow hop', 'Distributed tracing'],
  ['Alert on user impact', 'SLO burn-rate alarms'],
  ['Keep Prometheus and Grafana, drop the servers', 'Managed Prometheus + Managed Grafana'],
  ['Test endpoints from outside', 'CloudWatch Synthetics']
], [
  'Averages hide tail latency.',
  'Log ingestion is the main CloudWatch cost: control verbosity and retention.'
]);
TN('sap', '5.4', [
  'Event-driven operations: EventBridge rules, Step Functions, Systems Manager Automation, Lambda.',
  'Auto-remediation with Config; automated incident response to GuardDuty and Security Hub findings.',
  'Fleet operations: Patch Manager, State Manager, Run Command, hybrid nodes.',
  'Self-healing: Auto Scaling, health checks, queues, retries, dead-letter queues.',
  'Scheduling: EventBridge Scheduler. Configuration: AppConfig, Parameter Store.',
  'Overload protection: throttling, backpressure, load shedding.'
], [
  ['Isolate a compromised instance automatically', 'EventBridge + Step Functions/SSM Automation'],
  ['Restore a required setting everywhere', 'Config rule with remediation (plus SCP to prevent)'],
  ['Patch cloud and on-premises fleets', 'Systems Manager Patch Manager'],
  ['Reliable scheduled jobs', 'EventBridge Scheduler'],
  ['Safe runtime configuration changes', 'AppConfig']
], [
  'Automation without a dead-letter queue or alarm fails silently.',
  'Remediate and prevent together; remediation alone is a loop.'
]);

/* ===== Phase 5: SAP-C03 practice questions, domains 1 and 2 ===== */

/* ---- Domain 1: Design Solutions for Organizational Complexity ---- */
Q('sap-004', '1.1', 'medium', 'A retailer runs a monolithic order application on EC2. Checkout calls inventory, payment and email modules in sequence; when the email provider is slow, checkout times out and orders are lost. The company wants to modernise incrementally with the least risk. What should the solutions architect recommend FIRST?', [
  ['Rewrite the whole application as microservices on Amazon EKS before changing anything in production.', 0, 'A big-bang rewrite is the highest-risk path and delays the fix for months.'],
  ['Have checkout publish an order event to Amazon SNS with an Amazon SQS queue per downstream function, and move email sending to a consumer of its queue.', 1, 'Decouples the slow dependency immediately, keeps orders durable, and is a first step toward extracting services one at a time.'],
  ['Increase the checkout timeout and the instance size.', 0, 'Hides the coupling; orders still fail when the provider is down.'],
  ['Put Amazon CloudFront in front of the application.', 0, 'Caching does nothing for a synchronous call chain on writes.']
], 'service/sqs');
Q('sap-005', '1.1', 'hard', 'A SaaS company serves 400 business customers from one shared Amazon ECS service and one Amazon Aurora cluster. Two large tenants periodically consume most of the capacity and degrade service for the rest. The company wants to keep the pooled model for cost reasons. Which combination BEST limits noisy-neighbour impact? (Choose TWO.)', [
  ['Apply per-tenant throttling at Amazon API Gateway with usage plans keyed to each tenant.', 1, 'Caps each tenant\'s request rate before it reaches shared compute.'],
  ['Move asynchronous work onto Amazon SQS with tenant-aware fairness so one tenant\'s backlog cannot starve the others.', 1, 'Isolates background load per tenant in a pooled system.'],
  ['Give every tenant its own AWS account and full stack.', 0, 'That abandons the pooled model the company wants to keep.'],
  ['Double the Aurora instance size.', 0, 'A large tenant simply consumes the extra capacity.'],
  ['Enable Aurora Backtrack.', 0, 'A recovery feature, unrelated to isolation.']
], 'service/api-gateway');
Q('sap-006', '1.1', 'medium', 'A logistics company processes shipment updates with a Lambda function invoked synchronously by another Lambda function, which is invoked by a third. Failures midway leave shipments in inconsistent states, and nobody can see where an update stopped. Which redesign addresses both problems with the LEAST custom code?', [
  ['Add try/catch blocks and custom retry loops to each function.', 0, 'More hand-written error handling, still no visibility.'],
  ['Orchestrate the steps with AWS Step Functions, using Retry and Catch with compensating steps.', 1, 'Explicit state, built-in retries, compensation paths and a visual history of each execution.'],
  ['Replace Lambda with larger EC2 instances.', 0, 'Changes compute, not coordination.'],
  ['Increase each function\'s timeout to 15 minutes.', 0, 'Pays for waiting and fixes neither issue.']
], 'service/step-functions');
Q('sap-007', '1.2', 'medium', 'A bank wants a customer-service assistant that answers questions using its 30,000 internal policy documents, which change weekly. Answers must reflect the latest documents and cite sources. The team wants the LEAST model-management effort. Which approach should the solutions architect choose?', [
  ['Fine-tune a foundation model on the documents every week.', 0, 'Costly, slow to refresh, and fine-tuned models do not cite sources.'],
  ['Use Amazon Bedrock Knowledge Bases to index the documents from Amazon S3 and retrieve relevant passages at query time.', 1, 'Retrieval-augmented generation keeps answers current through re-syncing and returns source references.'],
  ['Train a custom model from scratch on Amazon SageMaker AI.', 0, 'The highest effort and unnecessary for document question answering.'],
  ['Paste all documents into every prompt.', 0, 'Exceeds context limits and cost grows with every request.']
], 'service/bedrock');
Q('sap-008', '1.2', 'hard', 'A company calls a large foundation model on Amazon Bedrock for every support ticket: classification, sentiment and a draft reply. Costs are rising and classification latency is too high. Quality of draft replies must not drop. Which changes are MOST appropriate? (Choose TWO.)', [
  ['Route classification and sentiment to a smaller, cheaper model and keep the large model for drafting.', 1, 'Simple tasks rarely need the largest model; this cuts cost and latency where it matters.'],
  ['Enable prompt caching for the long, repeated system instructions.', 1, 'Repeated prompt prefixes are billed at a reduced rate and processed faster.'],
  ['Move all inference to provisioned throughput sized for peak.', 0, 'Guarantees capacity but usually raises cost for variable load.'],
  ['Disable guardrails to save tokens.', 0, 'Removes a safety control for a marginal saving.'],
  ['Increase the maximum output tokens.', 0, 'Raises cost.']
], 'service/bedrock');
Q('sap-009', '1.2', 'medium', 'An insurer is building an AI agent that reads a claim, looks up the policy through an internal API, and files a recommendation. The agent framework is open source. The company needs session isolation between users, managed scaling, and controlled access to internal APIs as tools. Which AWS capability fits BEST?', [
  ['Run the agent on a single EC2 instance with API keys in environment variables.', 0, 'No isolation, no scaling, and static credentials.'],
  ['Deploy the agent on Amazon Bedrock AgentCore Runtime and expose the internal APIs as tools through AgentCore Gateway with AgentCore Identity.', 1, 'Purpose-built runtime with per-session isolation, plus governed tool access and credentials.'],
  ['Use Amazon Lex intents.', 0, 'Lex builds scripted conversational bots, not tool-using agents.'],
  ['Use AWS Glue workflows.', 0, 'ETL orchestration.']
], 'service/bedrock');
Q('sap-010', '1.3', 'medium', 'A hospital group must keep patient imaging systems within its own data centre because of equipment latency, but wants to use the same AWS APIs, automation and managed databases as its cloud workloads. Which solution should be recommended?', [
  ['AWS Outposts in the data centre.', 1, 'AWS infrastructure and services on premises, operated through the parent Region.'],
  ['AWS Storage Gateway.', 0, 'Hybrid storage only.'],
  ['AWS Site-to-Site VPN.', 0, 'Connectivity, not local compute.'],
  ['AWS Wavelength.', 0, 'For 5G mobile edge applications in carrier networks.']
], 'service/outposts');
Q('sap-011', '1.3', 'hard', 'A company has a 1 Gbps AWS Direct Connect connection as its only link to AWS. An outage at the Direct Connect location took production offline for six hours. The business now requires connectivity to survive the loss of a device or an entire location, at consistent performance. Which design meets this?', [
  ['Add a second connection at the same Direct Connect location.', 0, 'Survives a device failure but not the loss of the location.'],
  ['Add a Site-to-Site VPN as backup.', 0, 'Cost-effective, but performance over the internet is not consistent.'],
  ['Provision connections at two different Direct Connect locations, each terminating on separate customer devices, with BGP failover.', 1, 'Location and device redundancy with dedicated-link performance.'],
  ['Upgrade the existing connection to 10 Gbps.', 0, 'More bandwidth, same single point of failure.']
], 'service/direct-connect');
Q('sap-012', '1.3', 'medium', 'Applications in 30 VPCs must resolve hostnames in the on-premises domain corp.example, and on-premises servers must resolve names in AWS private hosted zones. The network team wants one central configuration. What should be built?', [
  ['Run BIND servers on EC2 in every VPC.', 0, 'Thirty sets of servers to operate.'],
  ['Route 53 Resolver inbound and outbound endpoints in a shared networking VPC, with forwarding rules shared to the other accounts through AWS RAM.', 1, 'Central hybrid DNS, with rules distributed by sharing.'],
  ['A public hosted zone for corp.example.', 0, 'Exposes internal names and does not reach on-premises DNS.'],
  ['Edit the hosts file on each instance.', 0, 'Unmanageable.']
], 'service/route53');
Q('sap-013', '1.4', 'hard', 'A company must inspect all traffic between its 40 VPCs and all outbound internet traffic with a stateful firewall. VPCs attach to one transit gateway. Which architecture meets the requirement with centralised management?', [
  ['Security groups in every VPC with identical rules.', 0, 'No stateful inspection of content, and no central point.'],
  ['An inspection VPC with AWS Network Firewall, transit gateway route tables that send inter-VPC and internet-bound traffic through it, and appliance mode on the inspection attachment.', 1, 'All flows traverse one firewall layer; appliance mode keeps both directions on the same zone.'],
  ['A NAT gateway in every VPC.', 0, 'NAT does not inspect traffic.'],
  ['VPC peering between all VPCs with network ACLs.', 0, 'Hundreds of peerings and stateless filtering only.']
], 'service/transit-gateway');
Q('sap-014', '1.4', 'medium', 'A software vendor wants to offer its API to customers privately from their own VPCs. Many customers use the 10.0.0.0/16 range, the same as the vendor. Customers must not gain network access to anything else in the vendor\'s VPC. Which solution should be used?', [
  ['VPC peering with each customer.', 0, 'Fails with overlapping ranges and exposes the network.'],
  ['An AWS PrivateLink endpoint service in front of a Network Load Balancer.', 1, 'One-way, service-level access that works with overlapping CIDRs.'],
  ['A transit gateway shared with every customer.', 0, 'Overlapping routes and far too much connectivity.'],
  ['A public API with IP allow lists.', 0, 'Not private.']
], 'service/privatelink');
Q('sap-015', '1.4', 'hard', 'Sixty microservices owned by twelve teams run on a mix of ECS, EKS and Lambda in separate accounts and VPCs, several with overlapping CIDR ranges. Teams need service-to-service calls with IAM-based authorisation and no VPC peering or transit gateway routing to manage. Which service addresses this?', [
  ['AWS Cloud WAN.', 0, 'A global network backbone; it still routes IP networks and does not authorise service calls.'],
  ['Amazon VPC Lattice with a service network shared through AWS RAM and auth policies on services.', 1, 'Application-layer connectivity across accounts and compute types, independent of IP overlap, with IAM auth.'],
  ['One large shared VPC for all teams.', 0, 'A migration project that removes account isolation.'],
  ['Internet-facing load balancers for every service.', 0, 'Exposes internal services publicly.']
], 'service/vpc-lattice');
Q('sap-016', '1.4', 'medium', 'A company operates in nine AWS Regions with transit gateways peered by hand. Route tables are inconsistent and segmentation between production and development differs by Region. Management wants one policy that defines segments globally. Which service should replace the current design?', [
  ['AWS Cloud WAN with a core network policy defining production and development segments.', 1, 'A central policy document creates consistent segments across Regions.'],
  ['More transit gateway peering connections.', 0, 'More of the manual work that caused the problem.'],
  ['AWS Global Accelerator.', 0, 'Accelerates user traffic to endpoints; not a private network backbone.'],
  ['Amazon Route 53 private hosted zones.', 0, 'DNS, not routing.']
], 'service/cloud-wan');
Q('sap-017', '1.5', 'hard', 'A trading platform needs a relational database that accepts writes in both Sydney and Singapore with strong consistency, survives the loss of a Region without manual failover, and requires no capacity management. Which option fits BEST?', [
  ['Amazon Aurora Global Database with write forwarding.', 0, 'One primary Region accepts writes; failover is a promotion step.'],
  ['Amazon Aurora DSQL in a multi-Region configuration.', 1, 'Serverless distributed SQL with active-active, strongly consistent multi-Region writes.'],
  ['Amazon RDS Multi-AZ with a cross-Region read replica.', 0, 'Single writer and manual promotion.'],
  ['Amazon DynamoDB global tables.', 0, 'Active-active, but not relational SQL.']
], 'service/aurora-dsql');
Q('sap-018', '1.5', 'medium', 'A company is building a data lake on Amazon S3 used by five business units. Analysts in each unit may see only certain tables, and personal data columns must be hidden from most users, whichever query engine they use. What should the architect implement?', [
  ['A bucket policy per analyst.', 0, 'Bucket policies cannot restrict columns and do not scale.'],
  ['AWS Lake Formation permissions with column-level and tag-based access control over the Glue Data Catalog.', 1, 'Central, fine-grained permissions enforced by Athena, Redshift Spectrum and EMR.'],
  ['Separate copies of the data for each business unit.', 0, 'Duplicates storage and governance work.'],
  ['Amazon Macie.', 0, 'Finds sensitive data; it does not control query access.']
], 'service/lake-formation');
Q('sap-019', '1.5', 'medium', 'A company runs Redis as a cache and a separate relational table to keep the same shopping-cart data durable, with custom code to keep them in sync. The team wants to simplify while keeping microsecond reads and no data loss on node failure. Which service should replace both?', [
  ['Amazon ElastiCache without replicas.', 0, 'Data is lost on node failure.'],
  ['Amazon MemoryDB.', 1, 'Redis-compatible, in-memory speed with a durable multi-AZ transaction log.'],
  ['Amazon DynamoDB Accelerator.', 0, 'A cache for DynamoDB only.'],
  ['Amazon Redshift.', 0, 'A data warehouse.']
], 'service/memorydb');
Q('sap-020', '1.5', 'hard', 'An IoT platform ingests 200,000 sensor readings per second. Operations staff query the last few hours constantly; analysts occasionally query years of history. Storage cost must fall automatically as data ages. Which design is MOST appropriate?', [
  ['Insert every reading into Amazon RDS for PostgreSQL.', 0, 'A single relational instance will not sustain this write rate economically.'],
  ['Ingest through Amazon Kinesis Data Streams into a time-series database for recent data, and deliver the stream through Amazon Data Firehose to S3 in Parquet for long-term analysis with Athena.', 1, 'Purpose-built hot store for recent queries and low-cost columnar history in S3.'],
  ['Write each reading as a separate object in S3 Standard.', 0, 'Billions of tiny objects and request charges, with no fast recent-data queries.'],
  ['Store everything in Amazon ElastiCache.', 0, 'Memory is the most expensive place to keep years of data.']
], 'service/timestream');
Q('sap-021', '1.3', 'medium', 'A media company has 300 TB of video on premises to move to Amazon S3 within three weeks. Its internet link is 200 Mbps and is shared with production traffic. Which approach is MOST likely to meet the deadline?', [
  ['AWS DataSync over the existing link.', 0, 'At 200 Mbps, 300 TB takes roughly five months even at full utilisation.'],
  ['An offline transfer: ship the data on storage devices, or carry it to an AWS Data Transfer Terminal.', 1, 'Physical transfer avoids the bandwidth limit and fits a three-week window.'],
  ['S3 Transfer Acceleration.', 0, 'Still bounded by the 200 Mbps uplink.'],
  ['A Site-to-Site VPN.', 0, 'Uses the same constrained link.']
], 'service/snow-family');
Q('sap-022', '1.1', 'medium', 'A company wants several AWS accounts to deploy workloads into subnets that a central networking team owns and controls, so that application teams cannot change routing or create internet gateways. What should be used?', [
  ['VPC sharing through AWS Resource Access Manager.', 1, 'Participants create resources in shared subnets while the owner controls the network.'],
  ['VPC peering from each account.', 0, 'Each account still owns and controls its own VPC.'],
  ['A copy of the VPC in every account built with CloudFormation.', 0, 'Teams could alter their own copies.'],
  ['AWS Client VPN.', 0, 'Remote user access.']
], 'service/ram');

/* ---- Domain 2: Design Secure and Compliant Solutions ---- */
Q('sap-023', '2.1', 'medium', 'A company with 80 accounts wants to stop using long-lived access keys in its GitHub Actions pipelines, which deploy to many accounts. Which approach should replace the keys?', [
  ['Store the access keys in GitHub secrets and rotate them quarterly.', 0, 'Still long-lived secrets outside AWS.'],
  ['Configure GitHub as an OIDC identity provider in IAM and let workflows assume a role whose trust policy restricts the repository and branch.', 1, 'Short-lived credentials per run, with no stored secret.'],
  ['Create one IAM user with administrator access shared by all pipelines.', 0, 'The worst case: one static, all-powerful credential.'],
  ['Use the root user of the management account.', 0, 'Never appropriate.']
], 'service/iam');
Q('sap-024', '2.1', 'hard', 'A multi-tenant SaaS application stores each tenant\'s documents under a tenant-specific prefix in one S3 bucket. Application code runs under one IAM role. A penetration test showed a bug could let one tenant read another\'s files. Which control gives the STRONGEST isolation while keeping one bucket?', [
  ['Validate the tenant ID more carefully in application code only.', 0, 'A single code bug still exposes all tenants.'],
  ['For each request, assume a role with a session policy or session tags scoped to the tenant\'s prefix, and use those credentials for S3 calls.', 1, 'IAM itself enforces the tenant boundary, so a code defect cannot cross it.'],
  ['Enable S3 versioning.', 0, 'Protects against overwrite, not cross-tenant reads.'],
  ['Encrypt the bucket with SSE-S3.', 0, 'Any principal with read access still decrypts transparently.']
], 'service/iam');
Q('sap-025', '2.1', 'medium', 'A company\'s application needs fine-grained authorisation rules such as "an adjuster may approve claims under $10,000 in their own region". Rules change often and auditors want every decision logged. Developers currently hard-code checks across twenty services. Which service should centralise this?', [
  ['Amazon Cognito user pool groups alone.', 0, 'Groups cover coarse roles, not attribute-based rules on resources.'],
  ['Amazon Verified Permissions with Cedar policies.', 1, 'A central policy store and decision API with audit logging.'],
  ['IAM policies for each application user.', 0, 'IAM governs AWS API access, not business rules for end users.'],
  ['AWS WAF rules.', 0, 'Filters web requests; knows nothing of claims or users\' roles.']
], 'service/verified-permissions');
Q('sap-026', '2.1', 'hard', 'On-premises batch servers upload files to Amazon S3 using IAM user access keys stored on disk. The security team wants to eliminate the keys. The company runs its own certificate authority. Which solution is MOST appropriate?', [
  ['Rotate the keys every 30 days with a script.', 0, 'Keys still exist on disk.'],
  ['Use IAM Roles Anywhere so the servers exchange X.509 certificates for temporary credentials.', 1, 'Workloads outside AWS get short-lived role credentials through the existing PKI.'],
  ['Make the bucket public for the servers\' IP range.', 0, 'IP-based public access is weak and exposes the bucket.'],
  ['Install the SSM Agent.', 0, 'Makes the servers manageable; it is not the standard way to give applications S3 credentials.']
], 'service/roles-anywhere');
Q('sap-027', '2.2', 'medium', 'A company replicates encrypted S3 data from Sydney to a DR Region. After a failover test, applications in the DR Region could not decrypt replicated objects. What is the MOST likely fix?', [
  ['Use the same AWS managed key ID in both Regions.', 0, 'AWS managed keys are Region-specific and cannot be shared.'],
  ['Configure replication to re-encrypt with a KMS key in the destination Region and grant the DR application roles permission to use that key.', 1, 'Keys are Regional; the replica needs a destination key the DR roles can use (or multi-Region keys).'],
  ['Disable encryption on the destination bucket.', 0, 'Violates the encryption requirement.'],
  ['Enable S3 Transfer Acceleration.', 0, 'Unrelated to decryption.']
], 'service/kms');
Q('sap-028', '2.2', 'hard', 'A regulator requires that a company can make its data in AWS unreadable immediately by revoking keys it holds outside AWS, and that key material never resides in AWS. Which option meets the requirement, and what trade-off must the architect raise?', [
  ['KMS customer managed keys with automatic rotation; no trade-off.', 0, 'Key material is generated and held inside AWS KMS.'],
  ['A KMS external key store backed by the company\'s own key manager; availability and latency of AWS services now depend on that external system.', 1, 'Keys stay outside AWS and can be cut off, at the cost of an external dependency for every cryptographic operation.'],
  ['SSE-S3; no trade-off.', 0, 'AWS owns and manages the keys.'],
  ['Imported key material in KMS; keys never reside in AWS.', 0, 'Imported material is stored inside KMS, even though you can delete it.']
], 'service/kms');
Q('sap-029', '2.2', 'medium', 'A security architect wants to guarantee that S3 buckets across the organisation can never be accessed by principals outside the organisation, regardless of mistakes in individual bucket policies. Which control is MOST appropriate?', [
  ['A service control policy.', 0, 'SCPs limit what your principals do; they do not stop external principals reaching your resources.'],
  ['A resource control policy that denies S3 access unless aws:PrincipalOrgID matches the organisation (with exceptions for AWS services).', 1, 'RCPs cap access to resources in member accounts, whoever the caller is.'],
  ['Amazon Macie.', 0, 'Reports on exposure; does not prevent it.'],
  ['S3 Storage Lens.', 0, 'Usage analytics.']
], 'service/organizations');
Q('sap-030', '2.2', 'medium', 'An organisation is assessing "harvest now, decrypt later" risk for data in transit to AWS APIs and for long-lived digital signatures. Which AWS capabilities are relevant? (Choose TWO.)', [
  ['Hybrid post-quantum TLS (ML-KEM) on supported AWS service endpoints.', 1, 'Protects key exchange against future quantum attacks.'],
  ['Post-quantum signature key types (ML-DSA) in AWS KMS.', 1, 'Quantum-resistant digital signatures.'],
  ['AWS Shield Advanced.', 0, 'DDoS protection.'],
  ['S3 Object Lock.', 0, 'Immutability, not cryptographic strength.'],
  ['Amazon GuardDuty Malware Protection.', 0, 'Malware scanning.']
], 'service/kms');
Q('sap-031', '2.3', 'medium', 'A security team needs GuardDuty, Security Hub and Inspector enabled in every existing and future account, with findings visible in one place, without using the management account for daily work. What should be configured?', [
  ['Sign in to each account and enable the services manually.', 0, 'Does not cover future accounts and does not scale.'],
  ['Designate a security account as delegated administrator for each service in AWS Organizations and enable auto-enrolment for all members.', 1, 'Central administration from a dedicated account, with new accounts included automatically.'],
  ['Run all security tooling from the management account.', 0, 'Best practice keeps the management account almost unused.'],
  ['Email findings from each account to a shared mailbox.', 0, 'No central control or correlation.']
], 'service/guardduty');
Q('sap-032', '2.3', 'hard', 'A company is designing its organisational unit structure. Requirements: production and non-production isolated by different guardrails; a place for centralised logs that workload administrators cannot alter; a place where teams may experiment freely but with spending limits and no access to corporate networks. Which structure fits BEST?', [
  ['One OU containing every account, with tags to distinguish them.', 0, 'SCPs attach to OUs and accounts, not tags, so guardrails cannot differ.'],
  ['A Security OU with log archive and audit accounts; Workloads OU split into Prod and Non-Prod; a Sandbox OU with restrictive network SCPs and budgets.', 1, 'Matches guardrails to purpose and isolates logs in dedicated accounts.'],
  ['One account per Region.', 0, 'Regions are not the isolation requirement.'],
  ['All workloads in the management account with IAM boundaries.', 0, 'SCPs do not apply there, and blast radius is maximal.']
], 'service/control-tower');
Q('sap-033', '2.3', 'medium', 'Central IT wants project teams to provision only pre-approved, compliant database and network stacks themselves, without granting them broad IAM permissions to create the underlying resources. Which service enables this?', [
  ['AWS Service Catalog with launch constraints.', 1, 'Users launch approved products; a launch role holds the permissions.'],
  ['AWS Trusted Advisor.', 0, 'Advisory checks only.'],
  ['IAM Access Analyzer.', 0, 'Analyses access; does not provision.'],
  ['AWS Budgets.', 0, 'Cost alerts.']
], 'service/service-catalog');
Q('sap-034', '2.4', 'hard', 'A New Zealand financial services company must demonstrate that customer data is stored and processed only in approved Regions, and must detect any drift. Which combination provides preventive and detective coverage? (Choose TWO.)', [
  ['An SCP (or Control Tower Region deny control) that blocks service use outside approved Regions.', 1, 'Preventive: resources cannot be created elsewhere.'],
  ['AWS Config rules or conformance packs aggregated organisation-wide to report resources and settings that violate the residency policy.', 1, 'Detective: continuous evidence and drift detection.'],
  ['Amazon CloudFront geo-restriction.', 0, 'Limits who can view content, not where data is stored.'],
  ['AWS Shield Advanced.', 0, 'DDoS protection.'],
  ['A wiki page listing the approved Regions.', 0, 'Documentation is not a control.']
], 'service/organizations');
Q('sap-035', '2.4', 'medium', 'Auditors require an immutable, organisation-wide record of API activity retained for seven years, protected even from administrators of the workload accounts. Which design satisfies this?', [
  ['A trail in each account writing to a bucket in the same account.', 0, 'Local administrators could alter or delete the logs.'],
  ['An organisation trail delivering to an S3 bucket in a dedicated log archive account, with Object Lock in compliance mode and log file validation.', 1, 'Central, tamper-evident and write-once, outside workload accounts.'],
  ['CloudTrail event history.', 0, 'Only 90 days.'],
  ['VPC Flow Logs to CloudWatch.', 0, 'Network metadata, not API activity.']
], 'service/cloudtrail');
Q('sap-036', '2.4', 'medium', 'A company must prove to its PCI DSS assessor that backups of cardholder-data systems exist, are retained for the required period and cannot be deleted early. Which features of AWS Backup support this? (Choose TWO.)', [
  ['AWS Backup Vault Lock in compliance mode.', 1, 'Prevents deletion or shortened retention.'],
  ['AWS Backup Audit Manager reports.', 1, 'Evidence that resources comply with backup controls.'],
  ['Amazon Data Lifecycle Manager fast snapshot restore.', 0, 'A performance feature.'],
  ['S3 Transfer Acceleration.', 0, 'Unrelated.'],
  ['AWS Compute Optimizer.', 0, 'Right-sizing.']
], 'service/backup');
Q('sap-037', '2.5', 'medium', 'A public chatbot built on Amazon Bedrock must never give investment advice, must mask customers\' account numbers in responses, and must resist prompt-injection attempts. Which feature addresses these requirements together?', [
  ['A longer system prompt asking the model to behave.', 0, 'Instructions alone are easily bypassed.'],
  ['Amazon Bedrock Guardrails with denied topics, sensitive information filters and prompt attack detection.', 1, 'Configurable policy enforcement applied to inputs and outputs, independent of the model.'],
  ['AWS WAF SQL injection rules.', 0, 'A different class of attack and layer.'],
  ['Amazon Macie.', 0, 'Scans S3 for sensitive data.']
], 'service/bedrock');
Q('sap-038', '2.5', 'hard', 'A healthcare company uses a Bedrock knowledge base shared by several departments. Clinicians must retrieve only documents for their own department, and the company must be able to show regulators which prompts and responses were produced. Which measures are MOST appropriate? (Choose TWO.)', [
  ['Apply metadata filters on retrieval tied to the caller\'s department (or separate knowledge bases per department), enforced by the application\'s IAM-scoped role.', 1, 'Restricts retrieval to authorised content.'],
  ['Enable model invocation logging to a protected S3 bucket or CloudWatch Logs with restricted access.', 1, 'Provides an auditable record of prompts and responses.'],
  ['Increase the model temperature.', 0, 'Changes randomness, not access or audit.'],
  ['Allow all departments to query everything and rely on the model to refuse.', 0, 'Models are not an access-control mechanism.'],
  ['Disable CloudTrail to reduce noise.', 0, 'Removes audit evidence.']
], 'service/bedrock');
Q('sap-039', '2.5', 'medium', 'A security team wants to ensure that no application in the organisation can call Amazon Bedrock models without an approved guardrail attached, and that only approved models are used. Which approach enforces this centrally?', [
  ['Ask teams to follow a guideline document.', 0, 'Not enforcement.'],
  ['Use SCPs and IAM policies with Bedrock condition keys that require a specific guardrail on invocation and limit the allowed model IDs.', 1, 'Policy-level enforcement that applications cannot bypass.'],
  ['Enable Amazon GuardDuty.', 0, 'Detects threats; does not enforce guardrail use.'],
  ['Use AWS Budgets actions.', 0, 'Cost controls.']
], 'service/bedrock');
Q('sap-040', '2.3', 'medium', 'A company wants one normalised, queryable store of security logs from all accounts and Regions, plus third-party sources, that its SIEM and its analysts using Athena can both consume. Which service is designed for this?', [
  ['Amazon Security Lake.', 1, 'Centralises and normalises security data to OCSF in S3 with subscriber access.'],
  ['Amazon Detective.', 0, 'Investigation graphs, not a general log lake.'],
  ['AWS Artifact.', 0, 'AWS compliance reports.'],
  ['Amazon Inspector.', 0, 'Vulnerability findings.']
], 'service/security-lake');
Q('sap-041', '2.1', 'medium', 'Employees access internal web applications through a client VPN that grants broad network access. The company wants per-application access decisions based on user identity and device posture, with no VPN client. Which service should be adopted?', [
  ['AWS Verified Access.', 1, 'Evaluates each request against identity and device trust before reaching the application.'],
  ['AWS Client VPN with more authorisation rules.', 0, 'Still network-level access through a client.'],
  ['Amazon Cognito identity pools.', 0, 'Issue AWS credentials to app users.'],
  ['AWS Direct Connect.', 0, 'A private link from a site, not user access control.']
], 'service/verified-permissions');

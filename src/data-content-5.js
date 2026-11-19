/* ===== Phase 5: SAP-C03 practice questions, domains 3, 4 and 5 ===== */

/* ---- Domain 3: Design Cost-Optimized Solutions (the SAP-C03 name for this domain is in the exam data) ---- */
Q('sap-042', '3.1', 'medium', 'A company runs 300 EC2 instances across 25 accounts. Finance bought Standard Reserved Instances for specific instance types three years ago; many are now unused because teams moved to Graviton and Fargate. Commitments are due for renewal. What should the architect recommend?', [
  ['Renew the same Standard Reserved Instances.', 0, 'Repeats the mismatch that left reservations unused.'],
  ['Right-size first, then buy Compute Savings Plans in the management account sized to the steady baseline, shared across the organisation.', 1, 'Flexible across families, Regions, Fargate and Lambda, and applied organisation-wide.'],
  ['Move everything to Spot Instances.', 0, 'Not suitable for all workloads.'],
  ['Buy Savings Plans for 100% of peak usage.', 0, 'Unused commitment is still paid for.']
], 'service/savings-plans');
Q('sap-043', '3.1', 'hard', 'A data processing platform runs a fault-tolerant Spark workload on Amazon EMR for six hours each night. The primary and core nodes hold HDFS metadata and data; task nodes only compute. Which purchasing strategy minimises cost without risking the cluster?', [
  ['Spot Instances for all node types.', 0, 'Losing core nodes loses HDFS data and can fail the job.'],
  ['On-Demand (or Savings Plan covered) primary and core nodes, with Spot task nodes across several instance types.', 1, 'Protects cluster state while using cheap, diversified capacity for stateless compute.'],
  ['Dedicated Hosts.', 0, 'Most expensive, with no benefit here.'],
  ['Reserved Instances for task nodes that run 24 hours a day.', 0, 'The workload runs six hours a night.']
], 'service/emr');
Q('sap-044', '3.1', 'medium', 'An API receives 5 million requests a day at a steady rate around the clock, each taking 200 ms on AWS Lambda at 1 GB. The team asks whether Lambda is still the right choice on cost alone. What is the BEST guidance?', [
  ['Lambda is always the cheapest compute.', 0, 'Not at sustained, steady utilisation.'],
  ['Model the cost: at steady high utilisation, containers on Fargate or EC2 with a Savings Plan often cost less; include operational effort in the comparison.', 1, 'Per-request pricing wins for spiky or low traffic; steady load favours provisioned compute.'],
  ['Move to Dedicated Hosts.', 0, 'For licensing and compliance needs.'],
  ['Increase the memory to 10 GB.', 0, 'Raises cost per millisecond.']
], 'service/lambda');
Q('sap-045', '3.1', 'medium', 'A company\'s Bedrock application generates nightly summaries for two million documents. Results are needed by morning, not in real time. How can inference cost be reduced with the LEAST change?', [
  ['Use batch inference for the nightly job.', 1, 'Batch is priced below on-demand for work that tolerates delay.'],
  ['Buy provisioned throughput for a year.', 0, 'Pays for capacity all day for a nightly job.'],
  ['Call the model synchronously with more concurrency.', 0, 'Same on-demand price and quota pressure.'],
  ['Fine-tune a model.', 0, 'A large effort that does not by itself lower per-token price.']
], 'service/bedrock');
Q('sap-046', '3.1', 'medium', 'Several Java services on x86 EC2 instances are CPU-bound and run all year. The team has spare engineering capacity. Which change is MOST likely to cut compute cost without re-architecting?', [
  ['Move to Graviton-based instances after testing, then cover the baseline with a Savings Plan.', 1, 'Arm instances typically give better price-performance for JVM workloads, and commitments add a further discount.'],
  ['Move to larger x86 instances.', 0, 'More cost.'],
  ['Switch to Dedicated Instances.', 0, 'A premium with no benefit.'],
  ['Enable detailed monitoring.', 0, 'Adds cost.']
], 'service/ec2');
Q('sap-047', '3.2', 'hard', 'A company has 50 VPCs, each with three NAT gateways, mostly used to reach AWS service APIs and a few external SaaS endpoints. NAT hourly and processing charges are the largest network cost. Which redesign reduces cost MOST while keeping private subnets?', [
  ['Add more NAT gateways to spread the load.', 0, 'Increases hourly charges.'],
  ['Add gateway endpoints for S3 and DynamoDB in every VPC, and centralise remaining internet egress through a shared egress VPC reached by the transit gateway.', 1, 'Free endpoints remove the bulk traffic, and consolidating NAT removes most hourly charges.'],
  ['Give every instance a public IP address.', 0, 'Abandons private subnets and adds public IPv4 charges.'],
  ['Replace NAT gateways with a Site-to-Site VPN.', 0, 'Does not provide internet egress.']
], 'service/vpc');
Q('sap-048', '3.2', 'medium', 'A company replicates 5 TB a day from its data centre to Amazon S3 over the internet and also pulls 8 TB a day of analytics results back. A Direct Connect connection already exists for other workloads. What reduces data transfer cost?', [
  ['Route the transfers over Direct Connect using a public or private virtual interface.', 1, 'Data transfer out over Direct Connect is billed at a lower rate than internet egress.'],
  ['Enable S3 Transfer Acceleration.', 0, 'Adds a per-GB fee.'],
  ['Compress nothing and add bandwidth.', 0, 'No cost effect.'],
  ['Use a NAT gateway.', 0, 'Adds processing charges.']
], 'service/direct-connect');
Q('sap-049', '3.2', 'medium', 'A SaaS application returns large JSON responses from an Application Load Balancer to customers worldwide. Data transfer out is a major cost. Which change is MOST likely to reduce it?', [
  ['Put Amazon CloudFront in front, enable compression, and cache cacheable responses.', 1, 'Compression and caching reduce bytes sent from the origin, and CloudFront egress rates are often lower.'],
  ['Add more load balancer nodes.', 0, 'No effect on transfer charges.'],
  ['Move the load balancer to a public subnet in every Region.', 0, 'Multiplies infrastructure.'],
  ['Use AWS Global Accelerator.', 0, 'Adds a transfer premium and does not cache.']
], 'service/cloudfront');
Q('sap-050', '3.2', 'hard', 'Two analytics VPCs in the same Region exchange 40 TB a day through a transit gateway that also connects 60 other VPCs. The transit gateway data processing charge for this flow is significant. What is the MOST appropriate optimisation?', [
  ['Remove the transit gateway entirely.', 0, 'Breaks connectivity for the other 60 VPCs.'],
  ['Add a VPC peering connection between the two analytics VPCs with more specific routes, keeping the transit gateway for everything else.', 1, 'High-volume traffic takes the peering path, which has no processing charge.'],
  ['Move the data through NAT gateways.', 0, 'Adds NAT charges.'],
  ['Create a second transit gateway.', 0, 'Same per-GB charge.']
], 'service/transit-gateway');
Q('sap-051', '3.3', 'medium', 'A company with 120 accounts wants a monthly report of cost by product line. Products span several accounts, and some accounts host several products distinguished by a tag. Which approach gives accurate allocation with the LEAST manual work?', [
  ['Ask each team to email their bill.', 0, 'Manual and inconsistent.'],
  ['Activate cost allocation tags, define AWS Cost Categories that combine account and tag rules, and report on them in Cost Explorer or the Cost and Usage Report.', 1, 'Rule-based grouping across accounts and tags, applied automatically.'],
  ['Create a separate organisation per product.', 0, 'Loses consolidated billing and central governance.'],
  ['Use AWS Budgets only.', 0, 'Alerts, not allocation.']
], 'service/cost-explorer');
Q('sap-052', '3.3', 'medium', 'Finance wants to enforce that every resource carries a "cost-centre" tag with one of a fixed list of values across all accounts. Which combination supports this? (Choose TWO.)', [
  ['A tag policy in AWS Organizations defining the allowed key and values.', 1, 'Standardises tag keys and values organisation-wide.'],
  ['An SCP or IAM condition that denies resource creation without the required tag (aws:RequestTag).', 1, 'Prevents untagged resources from being created where the service supports it.'],
  ['AWS Shield Advanced.', 0, 'Unrelated.'],
  ['Amazon Macie.', 0, 'Unrelated.'],
  ['An S3 lifecycle rule.', 0, 'Unrelated.']
], 'service/organizations');
Q('sap-053', '3.3', 'hard', 'Twelve teams share one Amazon EKS cluster. Finance cannot tell how much each team\'s workloads cost. Which solution provides per-team cost with the LEAST custom tooling?', [
  ['Divide the cluster bill equally by twelve.', 0, 'Does not reflect actual use.'],
  ['Enable split cost allocation data for Amazon EKS in the Cost and Usage Report and label workloads by team or namespace.', 1, 'Allocates cluster compute cost to pods based on requested and used resources.'],
  ['Give each team a separate cluster.', 0, 'Higher cost and operational load just to see a number.'],
  ['Check CloudWatch CPU graphs monthly.', 0, 'Not a billing allocation.']
], 'service/cost-explorer');
Q('sap-054', '3.3', 'medium', 'A sandbox account for experiments must never spend more than a set amount per month. When the limit is reached, new resource creation should be blocked automatically. What should be configured?', [
  ['A CloudWatch dashboard.', 0, 'Displays; does not act.'],
  ['An AWS Budgets action that applies a restrictive IAM policy or SCP when the threshold is reached.', 1, 'Budgets can trigger preventive policies automatically.'],
  ['Cost Explorer forecasts.', 0, 'Informational.'],
  ['A Savings Plan.', 0, 'A discount commitment.']
], 'service/budgets');
Q('sap-055', '3.3', 'medium', 'A sudden spike in a team\'s daily spend went unnoticed for two weeks because it stayed under the monthly budget threshold. Which capability would have flagged it early?', [
  ['AWS Cost Anomaly Detection.', 1, 'Learns normal spend patterns and alerts on unusual changes.'],
  ['AWS Pricing Calculator.', 0, 'Estimates.'],
  ['AWS Artifact.', 0, 'Compliance reports.'],
  ['AWS License Manager.', 0, 'Licence tracking.']
], 'service/cost-explorer');
Q('sap-056', '3.4', 'medium', 'A company holds 900 TB in S3 Standard across thousands of prefixes with very different, unpredictable access patterns. Nobody can maintain lifecycle rules per prefix. Which approach optimises storage cost with the LEAST effort?', [
  ['Move everything to S3 Glacier Deep Archive.', 0, 'Frequently used data becomes unusable and retrievals costly.'],
  ['Move objects to S3 Intelligent-Tiering and enable its archive tiers where retrieval delay is acceptable.', 1, 'Objects are tiered automatically by actual access.'],
  ['Write a script to analyse access logs weekly.', 0, 'Custom work that the storage class already does.'],
  ['Enable versioning.', 0, 'Adds cost.']
], 'service/s3');
Q('sap-057', '3.4', 'hard', 'An Amazon Aurora PostgreSQL cluster\'s bill shows I/O charges exceeding 40% of total database spend for a write-heavy ledger. Instance sizes are appropriate. What should the architect evaluate?', [
  ['Switching the cluster to Aurora I/O-Optimized.', 1, 'Removes per-request I/O charges and is generally cheaper when I/O exceeds roughly a quarter of the bill.'],
  ['Adding more reader instances.', 0, 'Adds instance cost and does not cut write I/O.'],
  ['Moving to Amazon Redshift.', 0, 'Wrong engine for a transactional ledger.'],
  ['Turning off backups.', 0, 'Unsafe and unrelated to I/O charges.']
], 'service/aurora');
Q('sap-058', '3.4', 'medium', 'A company keeps 2,000 gp2 EBS volumes of various sizes. Many need more IOPS than their size provides, so teams over-provision capacity. What is the MOST cost-effective change?', [
  ['Migrate volumes to gp3 and set IOPS and throughput independently of size.', 1, 'gp3 is cheaper per GB and decouples performance from capacity.'],
  ['Migrate all volumes to io2.', 0, 'Far more expensive.'],
  ['Double every volume size.', 0, 'The waste they already have.'],
  ['Use instance store.', 0, 'Not durable.']
], 'service/ebs');
Q('sap-059', '3.4', 'medium', 'A DynamoDB table holds five years of order history. Orders older than 90 days are read a few times a month but must remain queryable in milliseconds. Which change lowers cost?', [
  ['Use the DynamoDB Standard-Infrequent Access table class for the historical data (for example in a separate table).', 1, 'Lower storage price for rarely read items, with the same latency.'],
  ['Add DAX.', 0, 'Adds cost.'],
  ['Increase provisioned capacity.', 0, 'Adds cost.'],
  ['Export everything to Glacier Deep Archive.', 0, 'Not queryable in milliseconds.']
], 'service/dynamodb');
Q('sap-060', '3.4', 'hard', 'A company runs 60 small Amazon RDS for PostgreSQL instances for internal applications, each Multi-AZ, most below 5% CPU. Which options should the architect consider to reduce cost? (Choose TWO.)', [
  ['Consolidate low-use databases onto fewer instances or onto Aurora Serverless v2 that scales with demand.', 1, 'Removes idle instance-hours.'],
  ['Right-size instance classes using Compute Optimizer recommendations and cover the remaining baseline with reserved capacity or a database Savings Plan.', 1, 'Smaller instances plus commitment discounts.'],
  ['Disable automated backups.', 0, 'Removes recoverability.'],
  ['Move every database to io2 storage.', 0, 'Raises cost.'],
  ['Make every instance publicly accessible.', 0, 'A security failure with no saving.']
], 'service/rds');
Q('sap-061', '3.2', 'medium', 'A company\'s workloads in private subnets across 20 VPCs each have their own interface endpoints for ten AWS services, in three Availability Zones. The endpoint hourly charges are substantial. What is a common way to reduce them?', [
  ['Centralise interface endpoints in a shared services VPC and share the private DNS configuration so other VPCs resolve and route to them through the transit gateway.', 1, 'One set of endpoints serves many VPCs, trading hourly charges for transit data processing.'],
  ['Delete the endpoints and use public IP addresses.', 0, 'Abandons the private design.'],
  ['Add endpoints in more Availability Zones.', 0, 'Raises cost.'],
  ['Replace interface endpoints with gateway endpoints for all ten services.', 0, 'Gateway endpoints exist only for S3 and DynamoDB.']
], 'service/privatelink');

/* ---- Domain 4: Design Migration, Modernization and Continuity ---- */
Q('sap-062', '4.1', 'medium', 'A company must leave its data centre in nine months. It has 600 servers; most run packaged software it does not intend to change soon. Which strategy and service fit the bulk of the estate?', [
  ['Refactor every application to serverless before the deadline.', 0, 'Unrealistic for 600 servers in nine months.'],
  ['Rehost with AWS Application Migration Service, in waves planned from discovery data, and modernise selected applications afterwards.', 1, 'Block-level replication moves servers quickly with short cut-over windows.'],
  ['Repurchase every application as SaaS.', 0, 'Not available or practical for all packaged software.'],
  ['Retain everything on premises.', 0, 'The data centre is closing.']
], 'service/mgn');
Q('sap-063', '4.1', 'hard', 'A company wants to move a 4 TB Oracle database to Amazon Aurora PostgreSQL. The application can tolerate at most 30 minutes of downtime. Which sequence is MOST appropriate?', [
  ['Export with Data Pump during a weekend outage and import into Aurora.', 0, 'Engines differ, and the outage far exceeds 30 minutes.'],
  ['Convert the schema and code with AWS SCT or DMS Schema Conversion, run an AWS DMS full load followed by change data capture, validate, then cut over.', 1, 'Schema conversion handles the engine change; CDC keeps the target in sync until a short switch.'],
  ['Use AWS Application Migration Service.', 0, 'Rehosts servers; it does not change database engines.'],
  ['Use AWS DataSync.', 0, 'File and object transfer.']
], 'service/dms');
Q('sap-064', '4.1', 'medium', 'Before planning migration waves, an architect needs to know which on-premises servers communicate with each other and their real CPU and memory use. Which approach provides this?', [
  ['Read the five-year-old CMDB.', 0, 'Likely stale and without network dependencies.'],
  ['Deploy AWS Application Discovery Service agents (or use AWS Transform assessments) to collect utilisation and network connection data.', 1, 'Agent-based discovery captures processes, connections and performance.'],
  ['Ask each team to estimate.', 0, 'Unreliable.'],
  ['Enable AWS Config.', 0, 'Records AWS resources, not on-premises servers.']
], 'service/migration-planning');
Q('sap-065', '4.1', 'medium', 'For each application, match the migration strategy: a CRM replaced by a SaaS product; a Java app moved from WebLogic on a VM to a managed container platform with a managed database; an old reporting tool that nobody uses. Which answer is correct?', [
  ['Repurchase; replatform; retire.', 1, 'Buying SaaS is repurchase, changing the platform with minimal code change is replatform, and switching off unused systems is retire.'],
  ['Rehost; refactor; retain.', 0, 'None of the three matches.'],
  ['Refactor; rehost; relocate.', 0, 'None of the three matches.'],
  ['Retain; repurchase; rehost.', 0, 'None of the three matches.']
], 'service/migration-planning');
Q('sap-066', '4.1', 'hard', 'A company is modernising a large monolith. It wants to move functionality to new services gradually while the monolith keeps running, routing a growing share of requests to the new services. Which pattern and AWS building blocks suit this?', [
  ['A big-bang cut-over on a holiday weekend.', 0, 'High risk and all-or-nothing.'],
  ['The strangler fig pattern: place a routing layer (for example an Application Load Balancer or API Gateway) in front and move routes to new services one at a time.', 1, 'Incremental replacement with easy rollback per route.'],
  ['Copy the monolith into Lambda as one function.', 0, 'Not modernisation, and unlikely to fit Lambda limits.'],
  ['Freeze the monolith for a year while rewriting.', 0, 'Blocks business change.']
], 'service/elb');
Q('sap-067', '4.1', 'medium', 'A company moves 80 TB of NFS file shares to Amazon EFS over a 1 Gbps Direct Connect link and must keep source and destination in step for a month before cut-over. Which service should be used?', [
  ['AWS DataSync with scheduled incremental tasks.', 1, 'Parallel, verified transfers with recurring syncs of changes.'],
  ['AWS Storage Gateway Tape Gateway.', 0, 'Virtual tapes for backup software.'],
  ['AWS DMS.', 0, 'Databases.'],
  ['Manual rsync scripts on one server.', 0, 'Slow, unverified and unmanaged.']
], 'service/datasync');
Q('sap-068', '4.2', 'medium', 'Order these disaster recovery strategies from lowest to highest cost (and from longest to shortest recovery time): warm standby, backup and restore, multi-site active/active, pilot light.', [
  ['Backup and restore; pilot light; warm standby; multi-site active/active.', 1, 'Each step keeps more running in the recovery Region, raising cost and cutting recovery time.'],
  ['Pilot light; backup and restore; multi-site; warm standby.', 0, 'Incorrect order.'],
  ['Warm standby; pilot light; backup and restore; multi-site.', 0, 'Incorrect order.'],
  ['Multi-site; warm standby; pilot light; backup and restore.', 0, 'This is highest to lowest.']
], 'service/backup');
Q('sap-069', '4.2', 'hard', 'A company\'s DR plan fails over to a second Region by running a script that updates Amazon Route 53 records and scales up Auto Scaling groups. During a real Regional event the script failed because control-plane APIs were impaired. How should the design change?', [
  ['Run the script from a third Region.', 0, 'Still depends on control-plane operations at the moment of failure.'],
  ['Rely on data-plane mechanisms: pre-provisioned capacity in the recovery Region and Route 53 health-check-based failover or Application Recovery Controller routing controls.', 1, 'Static stability: recovery does not depend on making changes during the event.'],
  ['Lower the DNS TTL to one second.', 0, 'Does not remove the dependency on API calls.'],
  ['Add more retries to the script.', 0, 'Retries do not help if the API is unavailable.']
], 'service/route53');
Q('sap-070', '4.2', 'medium', 'A company runs 200 Windows and Linux servers on EC2 in one Region and needs recovery in a second Region with an RPO of seconds and RTO of minutes, at low standing cost and without re-architecting. Which service fits?', [
  ['AWS Backup with daily cross-Region copies.', 0, 'RPO of up to a day.'],
  ['AWS Elastic Disaster Recovery.', 1, 'Continuous block-level replication to low-cost staging, with fast launch on demand.'],
  ['Full duplicate fleet running in the second Region.', 0, 'Meets the targets at roughly double the cost.'],
  ['Amazon Data Lifecycle Manager.', 0, 'Snapshot schedules; minutes-to-hours RPO and manual rebuild.']
], 'service/drs');
Q('sap-071', '4.2', 'hard', 'An application uses DynamoDB global tables in two Regions, with stateless services in both behind Amazon Route 53 latency routing. During a Regional impairment, some users saw stale or conflicting data. Which statement BEST explains this and the design consideration?', [
  ['Global tables do not replicate between Regions.', 0, 'They do, asynchronously by default.'],
  ['Default global tables replicate asynchronously with last-writer-wins conflict resolution; the design must tolerate this, pin a user\'s writes to one Region, or use multi-Region strong consistency where its constraints are acceptable.', 1, 'Eventual consistency between Regions is a property the application must be designed for.'],
  ['Route 53 does not support two Regions.', 0, 'It does.'],
  ['DynamoDB loses data when a Region is impaired.', 0, 'Data already replicated is retained; only in-flight writes may lag.']
], 'service/dynamodb');
Q('sap-072', '4.2', 'medium', 'A DR runbook assumes the recovery Region can launch 400 large instances and 50 load balancers on the day. What should the architect verify in advance?', [
  ['That service quotas in the recovery Region match production needs, and consider On-Demand Capacity Reservations for critical capacity.', 1, 'Quotas are per Region, and capacity is not guaranteed without a reservation.'],
  ['That the recovery Region has the same name.', 0, 'Not meaningful.'],
  ['That CloudTrail is disabled in the recovery Region.', 0, 'Counter-productive.'],
  ['Nothing; AWS capacity is unlimited.', 0, 'Quotas and capacity constraints are real, especially during a Regional event.']
], 'service/service-catalog');
Q('sap-073', '4.3', 'medium', 'A team claims its application meets an RTO of 15 minutes and an RPO of 5 minutes but has never tested it. Leadership wants an objective assessment and recommended fixes. Which service should be used first?', [
  ['AWS Resilience Hub.', 1, 'Assesses the architecture against stated RTO and RPO and recommends improvements and tests.'],
  ['AWS Trusted Advisor.', 0, 'General best-practice checks, not RTO and RPO analysis.'],
  ['AWS Cost Explorer.', 0, 'Cost analysis.'],
  ['Amazon Inspector.', 0, 'Vulnerabilities.']
], 'service/resilience-hub');
Q('sap-074', '4.3', 'hard', 'A payments company wants evidence that its multi-AZ service keeps working when one Availability Zone loses power. The test must be safe to run in production with automatic halting if customer impact exceeds a threshold. What should the architect propose?', [
  ['Terminate random instances by hand and watch.', 0, 'Uncontrolled and not a zone-level failure.'],
  ['An AWS Fault Injection Service experiment using the AZ power interruption scenario, with CloudWatch alarm stop conditions.', 1, 'A controlled, repeatable zone failure with automatic rollback criteria.'],
  ['A tabletop exercise only.', 0, 'Useful, but provides no technical evidence.'],
  ['Wait for a real outage.', 0, 'Not a test.']
], 'service/resilience-hub');
Q('sap-075', '4.3', 'hard', 'A service runs across three Availability Zones behind an Application Load Balancer. One zone is degraded: instances pass health checks but respond slowly, hurting a third of requests. What is the fastest safe mitigation?', [
  ['Deploy a new version of the application.', 0, 'A deployment during an incident adds risk and takes time.'],
  ['Start a zonal shift (Application Recovery Controller) to move traffic away from the impaired zone.', 1, 'Shifts traffic within minutes using a data-plane action, provided the other zones have capacity.'],
  ['Delete the load balancer and recreate it.', 0, 'Causes a full outage.'],
  ['Increase the health check interval.', 0, 'Slower detection.']
], 'service/arc');
Q('sap-076', '4.3', 'medium', 'A critical downstream fraud-scoring service sometimes responds slowly, causing the payments API\'s threads to pile up until the API itself fails. Which resiliency patterns should the architect apply? (Choose TWO.)', [
  ['Timeouts with a circuit breaker and a defined fallback (for example, queue for later review).', 1, 'Stops waiting on a failing dependency and degrades gracefully.'],
  ['Retries with exponential backoff and jitter, capped, only for idempotent calls.', 1, 'Avoids retry storms that worsen an overload.'],
  ['Unlimited immediate retries.', 0, 'Amplifies the overload.'],
  ['Remove all timeouts.', 0, 'Guarantees thread exhaustion.'],
  ['Run the API in a single Availability Zone.', 0, 'Reduces resilience.']
], 'service/sqs');
Q('sap-077', '4.3', 'medium', 'An architect is asked to reduce the blast radius of failures and bad deployments for a SaaS platform serving 5,000 customers. Which approach BEST limits how many customers one failure can affect?', [
  ['One large shared stack for all customers.', 0, 'One failure affects everyone.'],
  ['A cell-based architecture: several independent, identical stacks, each serving a subset of customers, with deployments rolled out cell by cell.', 1, 'A failure or bad release is contained within one cell.'],
  ['A bigger database instance.', 0, 'Capacity, not isolation.'],
  ['A longer maintenance window.', 0, 'Unrelated to blast radius.']
], 'service/ecs');
Q('sap-078', '4.2', 'medium', 'A company needs its Amazon S3 data lake available in a second Region with a guaranteed replication time for most objects so that it can state an RPO. Which feature provides this?', [
  ['S3 Cross-Region Replication with Replication Time Control.', 1, 'Backed by a 15-minute replication target with metrics and alerts.'],
  ['S3 Transfer Acceleration.', 0, 'Upload speed.'],
  ['S3 Intelligent-Tiering.', 0, 'Cost tiering.'],
  ['A nightly DataSync job.', 0, 'RPO of up to a day.']
], 'service/s3');
Q('sap-079', '4.1', 'medium', 'A bank exchanges settlement files with partners over SFTP using a self-managed server that is being decommissioned. Partners must keep the same hostname, user names and keys. Files should land in Amazon S3. Which solution has the LEAST operational overhead?', [
  ['AWS Transfer Family with an SFTP endpoint backed by S3, the existing hostname through Route 53, and imported host and user keys.', 1, 'Managed SFTP with no change for partners.'],
  ['An EC2 instance running OpenSSH.', 0, 'A server to patch and scale.'],
  ['Ask partners to use the S3 API.', 0, 'Forces every partner to change.'],
  ['AWS DataSync.', 0, 'Not an SFTP endpoint for partners.']
], 'service/transfer-family');
Q('sap-080', '4.2', 'hard', 'A relational workload on Amazon Aurora requires cross-Region DR with RPO under one second in normal operation and a tested, managed way to switch Regions for planned maintenance with no data loss. Which features should be used?', [
  ['Aurora Global Database with managed switchover for planned events and failover for unplanned ones.', 1, 'Sub-second replication lag typically, with switchover that synchronises before changing roles.'],
  ['Daily snapshot copy.', 0, 'RPO of a day.'],
  ['A cross-Region DMS task.', 0, 'More to operate and typically more lag.'],
  ['Multi-AZ only.', 0, 'Single Region.']
], 'service/aurora');

/* ---- Domain 5: Design for Operational Excellence ---- */
Q('sap-081', '5.1', 'medium', 'A platform team must deploy the same baseline (logging, IAM roles, Config rules) to every account in an organisation, including accounts created in future, in four Regions. Which mechanism should be used?', [
  ['CloudFormation StackSets with service-managed permissions and automatic deployment to target OUs.', 1, 'Deploys and keeps the baseline in all current and future accounts in the OUs.'],
  ['Email the template to each account owner.', 0, 'Manual and unverifiable.'],
  ['A single stack in the management account.', 0, 'Creates resources in one account only.'],
  ['AWS Systems Manager Session Manager.', 0, 'Interactive access.']
], 'service/cloudformation');
Q('sap-082', '5.1', 'hard', 'Engineers sometimes change production resources in the console, and later CloudFormation updates fail or silently revert the changes. Which combination addresses the problem? (Choose TWO.)', [
  ['Remove routine write access to production from humans so changes flow only through the pipeline.', 1, 'Prevents drift at the source.'],
  ['Run CloudFormation drift detection on a schedule and alert on drifted stacks.', 1, 'Detects any drift that still occurs.'],
  ['Stop using infrastructure as code.', 0, 'Abandons repeatability.'],
  ['Disable rollback on stack updates.', 0, 'Leaves stacks in broken states.'],
  ['Give everyone AdministratorAccess to fix issues quickly.', 0, 'The cause of the problem.']
], 'service/cloudformation');
Q('sap-083', '5.1', 'medium', 'A company wants to block deployment of any infrastructure template that creates unencrypted storage or security groups open to the world, before resources are created. Where is the MOST effective place to enforce this?', [
  ['A policy-as-code check on the template or plan in the pipeline (for example CloudFormation Guard or CloudFormation Hooks), failing the build on violations.', 1, 'Prevents non-compliant resources from ever being created.'],
  ['A monthly manual review.', 0, 'Too late and too slow.'],
  ['An AWS Config rule only.', 0, 'Detects after creation; valuable as a second layer but not preventive.'],
  ['A naming convention.', 0, 'Not a control.']
], 'service/cloudformation');
Q('sap-084', '5.1', 'medium', 'A development team prefers defining infrastructure in TypeScript with reusable components and unit tests, while operations requires deployments to go through CloudFormation for change sets and rollback. Which tool satisfies both?', [
  ['AWS CDK.', 1, 'Code in a general-purpose language that synthesises to CloudFormation.'],
  ['Shell scripts calling the AWS CLI.', 0, 'Imperative, with no state or rollback.'],
  ['The AWS Management Console.', 0, 'Manual.'],
  ['AWS Systems Manager Run Command.', 0, 'Runs commands on servers.']
], 'service/cdk');
Q('sap-085', '5.2', 'hard', 'A company deploys to production accounts from a pipeline in a shared tooling account. Security requires that the pipeline has no standing administrator access in production and that container images are scanned and signed before deployment. Which design meets this?', [
  ['Store production administrator access keys in the pipeline.', 0, 'A standing, powerful secret.'],
  ['The pipeline assumes a narrowly scoped deployment role in each production account; the build stage scans images with Amazon Inspector and signs them, and deployment admits only signed images.', 1, 'Short-lived, least-privilege cross-account access, with supply-chain checks before release.'],
  ['Developers deploy from laptops.', 0, 'No control or audit.'],
  ['Scan images once a year.', 0, 'New vulnerabilities appear daily.']
], 'service/codepipeline');
Q('sap-086', '5.2', 'medium', 'A team releases a new Lambda version several times a day and wants to expose it to 10% of traffic for ten minutes, then shift fully, rolling back automatically if errors rise. What should be used?', [
  ['AWS CodeDeploy with a canary deployment configuration and CloudWatch alarms for rollback.', 1, 'Traffic shifting on a Lambda alias with alarm-based automatic rollback.'],
  ['Publish the version and update the alias manually.', 0, 'All at once, with manual rollback.'],
  ['Create a second AWS account for each release.', 0, 'Excessive.'],
  ['Increase the memory setting.', 0, 'Unrelated.']
], 'service/codepipeline');
Q('sap-087', '5.2', 'medium', 'An Amazon ECS service needs releases with instant rollback: the new version must run alongside the old, receive test traffic, then take production traffic only after validation. Which deployment strategy fits?', [
  ['Rolling update with minimum healthy percent 100.', 0, 'Replaces tasks gradually; rollback is another rolling deployment.'],
  ['Blue/green deployment with two target groups and a test listener.', 1, 'Both versions run in parallel; switching back is a traffic shift.'],
  ['Stop all tasks, then start the new version.', 0, 'Causes downtime.'],
  ['Deploy directly to one task and hope.', 0, 'Not a strategy.']
], 'service/ecs');
Q('sap-088', '5.2', 'hard', 'A database schema change must ship with an application release, and the release must be reversible for 24 hours without data loss. Which approach is MOST appropriate?', [
  ['Apply a breaking schema change and the new code at the same moment.', 0, 'Rolling back the code leaves it facing a schema it cannot use.'],
  ['Use expand-and-contract: add new structures in a backward-compatible way, deploy code that works with both, migrate data, and remove old structures only after the rollback window.', 1, 'Old and new code both work during the window, so rollback is safe.'],
  ['Restore last night\'s backup if anything goes wrong.', 0, 'Loses a day of data.'],
  ['Skip schema changes.', 0, 'Not practical.']
], 'service/rds');
Q('sap-089', '5.3', 'medium', 'An operations team must view metrics, logs and traces from 70 accounts in one place without switching accounts. Which capability provides this natively?', [
  ['Amazon CloudWatch cross-account observability with a monitoring account linked to source accounts.', 1, 'One account sees telemetry from many.'],
  ['A shared IAM user in every account.', 0, 'A security problem and still account switching.'],
  ['Exporting screenshots to a wiki.', 0, 'Not monitoring.'],
  ['AWS Artifact.', 0, 'Compliance reports.']
], 'service/cloudwatch');
Q('sap-090', '5.3', 'hard', 'Requests pass through API Gateway, three ECS services, an SQS queue and a Lambda function. Users report occasional 4-second delays, but every service\'s average latency looks normal. What should the architect implement to find the cause?', [
  ['Larger instances everywhere.', 0, 'Guesswork.'],
  ['Distributed tracing with OpenTelemetry (ADOT) and trace context propagated through the queue, viewed in X-Ray or CloudWatch Application Signals, alongside percentile latency metrics.', 1, 'Traces show where time is spent for individual slow requests; percentiles reveal what averages hide.'],
  ['More verbose logging only.', 0, 'Hard to correlate across services without trace IDs.'],
  ['Disable the queue.', 0, 'Removes decoupling without finding the cause.']
], 'service/xray');
Q('sap-091', '5.3', 'medium', 'A product team wants to be paged only when users are actually affected, and to track reliability against a target such as "99.9% of payment requests succeed within 800 ms over 28 days". Which approach suits this?', [
  ['Alarms on CPU utilisation of every instance.', 0, 'Resource metrics that often do not correspond to user impact.'],
  ['Define service-level objectives on request success and latency (for example in CloudWatch Application Signals) and alert on error-budget burn rate.', 1, 'Alerts follow user-visible reliability against an explicit target.'],
  ['A daily email of all log lines.', 0, 'Noise.'],
  ['Alarms on every individual error.', 0, 'Alert fatigue.']
], 'service/cloudwatch');
Q('sap-092', '5.3', 'medium', 'A platform team runs many EKS clusters and already uses Prometheus queries and Grafana dashboards. It wants to stop operating the monitoring servers. Which services should replace them?', [
  ['Amazon Managed Service for Prometheus and Amazon Managed Grafana.', 1, 'Managed, compatible versions of the tools the team already uses.'],
  ['Amazon Redshift.', 0, 'A data warehouse.'],
  ['AWS Config.', 0, 'Configuration tracking.'],
  ['Amazon Macie.', 0, 'Data classification.']
], 'service/managed-observability');
Q('sap-093', '5.3', 'hard', 'CloudWatch Logs cost has tripled. Most volume is debug-level application logs kept forever, rarely queried. Which actions reduce cost while keeping logs needed for audits? (Choose TWO.)', [
  ['Set retention periods on log groups and archive required logs to S3 with lifecycle rules.', 1, 'Stops paying indefinitely for CloudWatch storage; S3 archive is far cheaper.'],
  ['Lower log verbosity in production and use the Infrequent Access log class for rarely queried groups.', 1, 'Cuts ingestion, the largest cost driver.'],
  ['Create more dashboards.', 0, 'Adds cost.'],
  ['Enable detailed monitoring on all instances.', 0, 'Adds cost, unrelated to logs.'],
  ['Turn off CloudTrail.', 0, 'Removes audit evidence and does not address application logs.']
], 'service/cloudwatch');
Q('sap-094', '5.4', 'medium', 'When Amazon GuardDuty reports that an EC2 instance is communicating with a command-and-control server, the security team wants the instance isolated and a forensic snapshot taken within minutes, with no human needed. What should be built?', [
  ['A weekly review meeting.', 0, 'Far too slow.'],
  ['An EventBridge rule on the finding type that starts a Step Functions workflow or Systems Manager Automation runbook to swap the security group, snapshot the volumes and notify the team.', 1, 'Event-driven, automated containment and evidence capture.'],
  ['A larger instance.', 0, 'Unrelated.'],
  ['Disable GuardDuty to stop the alerts.', 0, 'Removes detection.']
], 'service/eventbridge');
Q('sap-095', '5.4', 'medium', 'A company must patch 3,000 EC2 instances and 400 on-premises servers monthly, in defined windows, with a compliance report for auditors. Which solution has the LEAST custom work?', [
  ['AWS Systems Manager Patch Manager with patch baselines, maintenance windows and hybrid activations for on-premises servers.', 1, 'One managed patching and compliance tool across both environments.'],
  ['SSH to each server.', 0, 'Not feasible.'],
  ['A cron job on every server.', 0, 'No central control or reporting.'],
  ['Rebuild every server by hand each month.', 0, 'Not feasible.']
], 'service/systems-manager');
Q('sap-096', '5.4', 'hard', 'A security review finds S3 buckets where Block Public Access was disabled by developers. The company wants the setting restored automatically within minutes wherever it is changed, in every account, and prevented where possible. Which combination is BEST? (Choose TWO.)', [
  ['An organisation-wide AWS Config rule with automatic remediation through Systems Manager Automation.', 1, 'Detects and corrects the setting continuously.'],
  ['Account-level Block Public Access enforced, with an SCP denying changes to it.', 1, 'Prevents the change in the first place.'],
  ['A quarterly audit spreadsheet.', 0, 'Slow and manual.'],
  ['More CloudWatch dashboards.', 0, 'Visibility without action.'],
  ['Amazon Polly notifications.', 0, 'Text to speech.']
], 'service/config');
Q('sap-097', '5.4', 'medium', 'Nightly batch jobs are started by cron on a single EC2 instance. When that instance fails, jobs silently do not run. Which replacement is MOST resilient with the LEAST management?', [
  ['A second EC2 instance with the same cron entries.', 0, 'Risks duplicate runs and still requires servers.'],
  ['Amazon EventBridge Scheduler starting ECS tasks or Step Functions workflows, with retries and a dead-letter queue.', 1, 'Managed, highly available scheduling with failure handling.'],
  ['A reminder in a team calendar.', 0, 'Manual.'],
  ['A larger instance.', 0, 'Same single point of failure.']
], 'service/eventbridge');
Q('sap-098', '5.4', 'hard', 'During traffic surges a service\'s dependency overloads, callers retry aggressively, and recovery takes hours after the surge ends. Which design changes address this failure mode? (Choose TWO.)', [
  ['Apply load shedding or throttling at the entry point so the service only accepts work it can complete.', 1, 'Protects the system from accepting more than it can handle.'],
  ['Place a queue in front of the dependency and limit consumer concurrency, with capped, jittered retries in clients.', 1, 'Buffers the surge and stops retry storms.'],
  ['Remove all limits to let every request through.', 0, 'Deepens the overload.'],
  ['Make clients retry immediately and indefinitely.', 0, 'The cause of the slow recovery.'],
  ['Disable alarms during surges.', 0, 'Hides the problem.']
], 'service/sqs');
Q('sap-099', '5.4', 'medium', 'A team wants to change a feature flag and tune a rate limit in production without redeploying, with validation of the new values and automatic rollback if alarms fire. Which service is designed for this?', [
  ['AWS AppConfig.', 1, 'Validated, gradual configuration deployments with alarm-based rollback.'],
  ['Hard-code the values and redeploy.', 0, 'Slow, and couples configuration to releases.'],
  ['Edit environment variables on running tasks by hand.', 0, 'Not possible without a restart, and unaudited.'],
  ['AWS Artifact.', 0, 'Compliance reports.']
], 'service/appconfig');
Q('sap-100', '5.2', 'medium', 'A company wants every pull request to be checked for vulnerable dependencies and hard-coded secrets before merge, and container images to be rescanned as new CVEs are published after release. Which combination covers both stages? (Choose TWO.)', [
  ['Static analysis, dependency and secret scanning in the CI build stage that fails the build on findings.', 1, 'Catches issues before code is merged or packaged.'],
  ['Amazon ECR enhanced scanning with Amazon Inspector for continuous rescanning of stored images.', 1, 'Finds newly published vulnerabilities in images already built.'],
  ['An annual penetration test only.', 0, 'Too infrequent.'],
  ['AWS Shield Advanced.', 0, 'DDoS protection.'],
  ['Amazon Route 53 health checks.', 0, 'Availability checks.']
], 'service/inspector');
Q('sap-101', '5.1', 'medium', 'A stack contains a production database. An engineer worries that a template mistake could delete or replace it during an update. Which safeguards should be configured? (Choose TWO.)', [
  ['DeletionPolicy and UpdateReplacePolicy set to Retain or Snapshot on the database resource.', 1, 'Keeps the data if the resource is removed or replaced.'],
  ['Review change sets before execution and apply a stack policy that denies replacement of the database.', 1, 'Shows and blocks destructive changes before they happen.'],
  ['Disable termination protection.', 0, 'Removes a safeguard.'],
  ['Deploy with the root user.', 0, 'Never appropriate.'],
  ['Delete the stack before each update.', 0, 'Destroys the resources.']
], 'service/cloudformation');

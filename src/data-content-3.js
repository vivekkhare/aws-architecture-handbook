/* ===== Phase 3: SAA-C03 practice questions, domains 3 and 4 ===== */

/* ---- Domain 3: Design High-Performing Architectures ---- */
Q('saa-044', '3.1', 'easy', 'Twenty Linux application servers in three Availability Zones need to read and write the same set of files at the same time through a standard file system interface. Which storage service should be used?', [
  ['Amazon EBS with Multi-Attach.', 0, 'Multi-Attach works only within one zone and needs cluster-aware software.'],
  ['Amazon EFS.', 1, 'A shared NFS file system available across zones.'],
  ['Amazon S3.', 0, 'Object storage, not a POSIX file system.'],
  ['Instance store volumes.', 0, 'Local to each instance and lost on stop.']
], 'service/efs');
Q('saa-045', '3.1', 'medium', 'A Windows application requires a shared file system that supports the SMB protocol and Microsoft Active Directory permissions. Which service meets the requirement with the LEAST management?', [
  ['Amazon EFS.', 0, 'EFS supports NFS for Linux only.'],
  ['Amazon FSx for Windows File Server.', 1, 'Managed SMB shares integrated with Active Directory.'],
  ['Amazon FSx for Lustre.', 0, 'A Linux high-performance file system.'],
  ['A Windows file server on EC2.', 0, 'Works, but you manage it.']
], 'service/fsx');
Q('saa-046', '3.1', 'medium', 'A genomics team runs compute clusters that need a parallel file system with sub-millisecond latency and hundreds of gigabytes per second of throughput. Input data sits in Amazon S3. Which storage choice is MOST suitable?', [
  ['Amazon FSx for Lustre linked to the S3 bucket.', 1, 'A parallel file system built for HPC that presents S3 objects as files.'],
  ['Amazon EFS in Bursting mode.', 0, 'Not designed for this throughput.'],
  ['Amazon S3 Standard accessed directly.', 0, 'No file system semantics or the required latency.'],
  ['Amazon EBS gp3 volumes on each node.', 0, 'Not shared between nodes.']
], 'service/fsx');
Q('saa-047', '3.1', 'medium', 'A self-managed database on EC2 needs 150,000 sustained IOPS on one volume with sub-millisecond latency and the highest available volume durability. Which EBS volume type should be used?', [
  ['gp3.', 0, 'General purpose SSD does not reach this IOPS figure and has lower durability than io2.'],
  ['io2 Block Express.', 1, 'Provisioned IOPS SSD for the highest sustained IOPS, lowest latency and 99.999% durability.'],
  ['st1.', 0, 'Throughput-optimised HDD, for large sequential work.'],
  ['sc1.', 0, 'Cold HDD, the slowest type.']
], 'service/ebs');
Q('saa-048', '3.1', 'medium', 'Users around the world upload large video files to an Amazon S3 bucket in Sydney and complain that uploads are slow. Which feature improves upload speed with the LEAST change?', [
  ['S3 Transfer Acceleration.', 1, 'Uploads enter at the nearest edge location and travel on the AWS network.'],
  ['S3 Cross-Region Replication.', 0, 'Copies objects after upload; it does not speed the upload.'],
  ['S3 Intelligent-Tiering.', 0, 'A storage class for cost.'],
  ['Amazon CloudFront with caching.', 0, 'Caching helps downloads, not uploads.']
], 'service/s3');
Q('saa-049', '3.2', 'easy', 'A job runs for about 40 minutes whenever a large file arrives, a few times a day. The team wants no servers to manage and to pay only while the job runs. Which compute option fits?', [
  ['AWS Lambda.', 0, 'Lambda functions stop at 15 minutes.'],
  ['An AWS Fargate task started for each file.', 1, 'Serverless containers with no time limit, billed per second.'],
  ['A reserved EC2 instance.', 0, 'Pays for idle time and needs management.'],
  ['Amazon Lightsail.', 0, 'A fixed-price server, always on.']
], 'service/fargate');
Q('saa-050', '3.2', 'medium', 'A Java API on AWS Lambda has unacceptable latency on the first request after idle periods. Traffic is predictable during business hours. What should a solutions architect do?', [
  ['Increase the function timeout.', 0, 'Timeout does not affect start-up time.'],
  ['Configure provisioned concurrency for business hours.', 1, 'Keeps initialised environments ready, removing cold starts.'],
  ['Move the function into a VPC.', 0, 'Does not reduce cold starts.'],
  ['Reduce the memory setting.', 0, 'Less memory means less CPU and a slower start.']
], 'service/lambda');
Q('saa-051', '3.2', 'medium', 'A tightly coupled high-performance computing workload needs the lowest possible network latency between its EC2 instances. Which placement strategy should be used?', [
  ['Spread placement group.', 0, 'Separates instances onto distinct hardware for resilience.'],
  ['Cluster placement group.', 1, 'Packs instances close together in one zone for low latency and high throughput.'],
  ['Partition placement group.', 0, 'For large distributed systems that need fault isolation.'],
  ['Instances in three Regions.', 0, 'Maximises latency.']
], 'service/ec2');
Q('saa-052', '3.2', 'medium', 'An Auto Scaling group of workers processes messages from an Amazon SQS queue. Message volume varies widely. Which scaling approach is MOST appropriate?', [
  ['Target tracking on average CPU utilisation.', 0, 'Workers waiting on I/O can show low CPU while the queue grows.'],
  ['Target tracking on a backlog-per-instance metric derived from the queue length.', 1, 'Scales directly on the work waiting to be done.'],
  ['Scheduled scaling at midnight.', 0, 'Volume is variable, not scheduled.'],
  ['Manual scaling by the operations team.', 0, 'Slow and error-prone.']
], 'service/auto-scaling');
Q('saa-053', '3.3', 'easy', 'A gaming company needs a database for player profiles with single-digit millisecond reads and writes at any scale, simple key-based access, and no servers to manage. Which database should be chosen?', [
  ['Amazon RDS for MySQL.', 0, 'Relational, instance-based, and harder to scale horizontally.'],
  ['Amazon DynamoDB.', 1, 'Serverless key-value store with consistent low latency at scale.'],
  ['Amazon Redshift.', 0, 'A data warehouse for analytics.'],
  ['Amazon Neptune.', 0, 'A graph database.']
], 'service/dynamodb');
Q('saa-054', '3.3', 'medium', 'A read-heavy application on Amazon DynamoDB needs response times in microseconds for repeated reads. The team does not want to change application logic significantly. What should be added?', [
  ['A global secondary index.', 0, 'Adds a query pattern, not microsecond latency.'],
  ['DynamoDB Accelerator (DAX).', 1, 'An in-memory cache that is API-compatible with DynamoDB.'],
  ['More read capacity units.', 0, 'Raises throughput, not speed per request.'],
  ['Amazon ElastiCache with custom cache-aside code.', 0, 'Works, but requires caching logic in the application.']
], 'service/dynamodb');
Q('saa-055', '3.3', 'medium', 'A company needs to analyse 20 TB of structured sales data with complex SQL joins and aggregations for business intelligence dashboards used all day. Which service is MOST suitable?', [
  ['Amazon Redshift.', 1, 'A columnar, parallel data warehouse built for this.'],
  ['Amazon DynamoDB.', 0, 'No joins or analytical SQL.'],
  ['Amazon RDS for PostgreSQL with one large instance.', 0, 'Transactional engine; poor fit at this analytical scale.'],
  ['Amazon ElastiCache.', 0, 'A cache.']
], 'service/redshift');
Q('saa-056', '3.3', 'hard', 'Thousands of AWS Lambda invocations open connections to an Amazon Aurora PostgreSQL database during peaks, exhausting the connection limit. Which change resolves this with the LEAST application change?', [
  ['Use Amazon RDS Proxy between the functions and the database.', 1, 'The proxy pools and reuses connections.'],
  ['Increase the Lambda timeout.', 0, 'Holds connections longer.'],
  ['Add an Aurora read replica.', 0, 'Writes still go to one instance, and each replica has its own limit.'],
  ['Move the database to a public subnet.', 0, 'Unrelated and insecure.']
], 'service/rds');
Q('saa-057', '3.3', 'medium', 'A fraud team needs to find accounts connected to a known fraudulent account through shared devices, addresses and cards, several hops deep. Which database type is designed for this?', [
  ['Amazon Neptune.', 1, 'A graph database traverses relationships efficiently.'],
  ['Amazon Timestream.', 0, 'Time-series data.'],
  ['Amazon DynamoDB.', 0, 'Key-value lookups; multi-hop traversal is awkward.'],
  ['Amazon Redshift.', 0, 'Many self-joins, slow for deep relationship queries.']
], 'service/neptune');
Q('saa-058', '3.4', 'medium', 'A company must connect its data centre to AWS with consistent network performance and throughput of several gigabits per second for nightly data transfers. Which option is MOST appropriate?', [
  ['AWS Site-to-Site VPN.', 0, 'Runs over the internet with variable performance and limited throughput per tunnel.'],
  ['AWS Direct Connect.', 1, 'A dedicated private link with predictable performance.'],
  ['AWS Client VPN.', 0, 'For individual devices.'],
  ['VPC peering.', 0, 'Connects VPCs, not a data centre.']
], 'service/direct-connect');
Q('saa-059', '3.4', 'medium', 'A single Application Load Balancer must send requests for /api/* to one group of containers and /images/* to another. Which feature provides this?', [
  ['Listener rules with path-based routing to separate target groups.', 1, 'ALB routes on the URL path.'],
  ['Cross-zone load balancing.', 0, 'Distributes evenly across zones.'],
  ['A Network Load Balancer.', 0, 'Operates at layer 4 and cannot see paths.'],
  ['Sticky sessions.', 0, 'Pins a client to a target.']
], 'service/elb');
Q('saa-060', '3.5', 'medium', 'A company needs to capture clickstream events from its website and load them into Amazon S3 in near real time, converted to Parquet, with the LEAST operational effort. Which service should be used?', [
  ['Amazon Data Firehose.', 1, 'Managed delivery to S3 with buffering and format conversion.'],
  ['Amazon Kinesis Data Streams with a custom consumer on EC2.', 0, 'You would write and operate the delivery code.'],
  ['AWS DataSync.', 0, 'For file transfers between storage systems.'],
  ['Amazon SQS.', 0, 'A queue with no delivery to S3.']
], 'service/kinesis');
Q('saa-061', '3.5', 'medium', 'Several applications must each read the same stream of trading events in order and be able to replay the last seven days. Which service fits BEST?', [
  ['Amazon SQS standard queue.', 0, 'A message is removed once processed, and there is no replay.'],
  ['Amazon Kinesis Data Streams with extended retention.', 1, 'An ordered, retained stream that many consumers read independently.'],
  ['Amazon SNS.', 0, 'Delivers and forgets.'],
  ['Amazon Data Firehose.', 0, 'Delivers to destinations; no replay.']
], 'service/kinesis');

/* ---- Domain 4: Design Cost-Optimized Architectures ---- */
Q('saa-062', '4.1', 'easy', 'Compliance archives must be kept for ten years and are almost never read. Retrieval within 12 hours is acceptable. Which Amazon S3 storage class has the LOWEST storage cost?', [
  ['S3 Standard-IA.', 0, 'Millisecond access costs more than is needed here.'],
  ['S3 Glacier Instant Retrieval.', 0, 'Pays for instant access that is not required.'],
  ['S3 Glacier Deep Archive.', 1, 'Lowest price; standard retrieval within 12 hours.'],
  ['S3 One Zone-IA.', 0, 'More expensive, and one zone is wrong for compliance records.']
], 'service/s3');
Q('saa-063', '4.1', 'medium', 'Application logs in Amazon S3 are read often for 30 days, rarely for the next 11 months, and can be deleted after a year. How should cost be minimised with the LEAST effort?', [
  ['A lifecycle rule: transition to S3 Standard-IA after 30 days and expire after 365 days.', 1, 'Automates the move to cheaper storage and the deletion.'],
  ['A weekly script that moves and deletes objects.', 0, 'Custom code for something S3 does natively.'],
  ['Keep everything in S3 Standard.', 0, 'Pays the highest storage rate for cold data.'],
  ['Enable versioning.', 0, 'Adds cost.']
], 'service/s3');
Q('saa-064', '4.1', 'medium', 'A company finds it is paying for hundreds of unattached EBS volumes and years of old snapshots. Which TWO actions reduce this cost going forward?', [
  ['Use Amazon Data Lifecycle Manager policies to expire snapshots.', 1, 'Automates retention so snapshots do not accumulate.'],
  ['Identify and delete unattached volumes, for example with Trusted Advisor or Compute Optimizer findings.', 1, 'Unattached volumes are billed in full.'],
  ['Convert all volumes to io2.', 0, 'The most expensive type.'],
  ['Enable EBS encryption.', 0, 'A security control with no cost effect.'],
  ['Increase snapshot frequency.', 0, 'More snapshots, more cost.']
], 'service/ebs');
Q('saa-065', '4.1', 'medium', 'A company has 500 GB of shared files on Amazon EFS. Most files are not opened after the first week. What is the simplest way to reduce storage cost?', [
  ['Enable EFS lifecycle management to move files to the Infrequent Access class.', 1, 'Files move automatically after a period without access.'],
  ['Copy old files to EBS volumes.', 0, 'Manual and not shared.'],
  ['Switch to Provisioned Throughput.', 0, 'Changes throughput cost, not storage.'],
  ['Create a second file system.', 0, 'Doubles the bill.']
], 'service/efs');
Q('saa-066', '4.1', 'hard', 'A company stores millions of 10 KB objects that are deleted after 20 days. An engineer proposes moving them to S3 Standard-IA after one day to save money. Why is this a poor idea?', [
  ['Standard-IA has a minimum billable object size and a 30-day minimum storage duration, so these objects would cost more.', 1, 'Each object is billed as 128 KB and for 30 days even if deleted sooner, plus transition requests.'],
  ['Standard-IA is less durable than S3 Standard.', 0, 'Durability is the same.'],
  ['Standard-IA cannot hold more than one million objects.', 0, 'No such limit.'],
  ['Objects in Standard-IA cannot be deleted.', 0, 'They can; early deletion is simply charged.']
], 'service/s3');
Q('saa-067', '4.2', 'easy', 'A nightly rendering job can be stopped and restarted without losing much work and has a flexible deadline. Which EC2 purchasing option gives the LOWEST cost?', [
  ['On-Demand Instances.', 0, 'Full price.'],
  ['Spot Instances.', 1, 'Deep discounts for interruptible work.'],
  ['Dedicated Hosts.', 0, 'The most expensive option.'],
  ['Standard Reserved Instances.', 0, 'A commitment for steady use, not a few hours a night.']
], 'service/ec2');
Q('saa-068', '4.2', 'medium', 'A company runs a steady baseline of compute across EC2, AWS Fargate and AWS Lambda and expects to change instance families during the next three years. Which commitment gives savings with the MOST flexibility?', [
  ['Standard Reserved Instances.', 0, 'Tied to an instance family and Region, and EC2 only.'],
  ['EC2 Instance Savings Plan.', 0, 'Tied to one family in one Region, and EC2 only.'],
  ['Compute Savings Plan.', 1, 'Applies across EC2 families, Regions, Fargate and Lambda.'],
  ['Spot Instances.', 0, 'Not a commitment, and unsuitable as a baseline.']
], 'service/savings-plans');
Q('saa-069', '4.2', 'medium', 'Development and test EC2 instances run 24 hours a day but are used only on weekdays from 8 am to 6 pm. Which change saves the MOST with little effort?', [
  ['Buy Reserved Instances for them.', 0, 'Commits to paying for hours nobody uses.'],
  ['Stop the instances outside working hours on a schedule.', 1, 'Removes roughly 70% of the instance-hours.'],
  ['Move them to a larger instance type.', 0, 'Costs more.'],
  ['Enable detailed monitoring.', 0, 'Adds cost.']
], 'service/ec2');
Q('saa-070', '4.2', 'medium', 'A company wants recommendations for EC2 instances that are larger than their workloads need, based on actual utilisation. Which service provides this?', [
  ['AWS Compute Optimizer.', 1, 'Analyses utilisation metrics and recommends right-sized instance types.'],
  ['AWS Budgets.', 0, 'Alerts on spend thresholds.'],
  ['AWS Artifact.', 0, 'Compliance reports.'],
  ['Amazon Inspector.', 0, 'Vulnerability scanning.']
], 'service/compute-optimizer');
Q('saa-071', '4.2', 'hard', 'A stateless web application runs on an Auto Scaling group. Baseline load needs four instances all year; peaks need up to twelve for a few hours. Which purchasing mix is MOST cost-effective while keeping the baseline reliable?', [
  ['All On-Demand.', 0, 'No discount on the predictable baseline.'],
  ['A Savings Plan covering the four baseline instances, with Spot Instances (and On-Demand as fallback) for the peaks.', 1, 'Commitment discount on steady usage and cheap capacity for the stateless, variable part.'],
  ['Reserved Instances for all twelve.', 0, 'Pays for eight instances that are mostly idle.'],
  ['All Spot.', 0, 'The baseline could be interrupted.']
], 'service/savings-plans');
Q('saa-072', '4.3', 'medium', 'A development database on Amazon Aurora is used for a few hours on some days and is idle the rest of the time. Which option minimises cost?', [
  ['A provisioned Aurora cluster with a reader.', 0, 'Pays for two instances around the clock.'],
  ['Aurora Serverless v2 that scales down when idle.', 1, 'Capacity follows usage, down to the minimum when idle.'],
  ['Amazon RDS Multi-AZ.', 0, 'Doubles instance cost for availability that development does not need.'],
  ['Amazon Redshift.', 0, 'A warehouse, not a transactional database.']
], 'service/aurora');
Q('saa-073', '4.3', 'medium', 'A new application on Amazon DynamoDB has traffic that is unknown and likely to be very spiky. Which capacity mode avoids both throttling and paying for unused capacity?', [
  ['Provisioned capacity sized for the peak.', 0, 'Pays for the peak all day.'],
  ['On-demand capacity.', 1, 'Charges per request and adapts instantly.'],
  ['Provisioned capacity sized for the average.', 0, 'Throttles during spikes.'],
  ['Reserved capacity.', 0, 'A commitment that suits steady, known load.']
], 'service/dynamodb');
Q('saa-074', '4.3', 'medium', 'A reporting team runs a few SQL queries a week over CSV files in Amazon S3. Which approach is MOST cost-effective?', [
  ['Load the files into a provisioned Amazon Redshift cluster that runs all the time.', 0, 'Pays for a cluster that is idle most of the week.'],
  ['Query the files in place with Amazon Athena.', 1, 'Serverless and charged only for data scanned.'],
  ['Load the files into Amazon RDS.', 0, 'An always-on instance plus loading work.'],
  ['Run an Amazon EMR cluster continuously.', 0, 'Continuous cluster cost for occasional queries.']
], 'service/athena');
Q('saa-075', '4.3', 'hard', 'A product catalogue in Amazon RDS receives the same read queries thousands of times a minute, forcing the company onto ever-larger instances. Data changes a few times an hour. What is the MOST cost-effective improvement?', [
  ['Add Amazon ElastiCache and cache the query results with a short TTL.', 1, 'Repeated reads are served from memory, so a smaller database suffices.'],
  ['Move to the largest available instance class.', 0, 'The most expensive path.'],
  ['Enable Multi-AZ.', 0, 'Availability, not read capacity.'],
  ['Increase allocated storage.', 0, 'Does not address read load.']
], 'service/elasticache');
Q('saa-076', '4.4', 'medium', 'EC2 instances in private subnets transfer terabytes of data to Amazon S3 every day through a NAT gateway, and NAT data processing charges are high. What should be changed?', [
  ['Add an S3 gateway VPC endpoint and route S3 traffic through it.', 1, 'Gateway endpoints are free and bypass the NAT gateway.'],
  ['Add a second NAT gateway.', 0, 'Same per-GB charge.'],
  ['Use a larger NAT gateway.', 0, 'NAT gateways are not sized, and the charge is per GB.'],
  ['Move the instances to public subnets.', 0, 'Weakens security to save money.']
], 'service/privatelink');
Q('saa-077', '4.4', 'medium', 'A company serves large downloads directly from an Amazon S3 bucket to users worldwide, and data transfer out charges are high. Which change is likely to lower cost and improve performance?', [
  ['Serve the files through Amazon CloudFront.', 1, 'Transfer from S3 to CloudFront is free, CloudFront rates are often lower, and caching cuts origin requests.'],
  ['Enable S3 Transfer Acceleration.', 0, 'Adds a fee and targets uploads.'],
  ['Turn on S3 versioning.', 0, 'Adds storage cost.'],
  ['Replicate the bucket to every Region.', 0, 'Multiplies storage cost and complexity.']
], 'service/cloudfront');
Q('saa-078', '4.4', 'medium', 'Two VPCs in the same Region exchange a large, steady volume of data through a transit gateway that connects only these two VPCs. How can the network cost be reduced?', [
  ['Replace the transit gateway with a VPC peering connection.', 1, 'Peering has no hourly attachment or per-GB processing charge.'],
  ['Add a second transit gateway.', 0, 'Doubles the fixed cost.'],
  ['Send the traffic through NAT gateways.', 0, 'Adds NAT processing charges and public routing.'],
  ['Use a Site-to-Site VPN between the VPCs.', 0, 'Adds VPN charges and throughput limits.']
], 'service/transit-gateway');
Q('saa-079', '4.4', 'hard', 'An application spreads chatty microservices across three Availability Zones, and the bill shows significant inter-AZ data transfer. The services must remain highly available. Which approach reduces the charge without giving up resilience?', [
  ['Run everything in one Availability Zone.', 0, 'Removes the charge and the resilience.'],
  ['Keep the multi-AZ deployment but prefer same-zone routing between services where healthy, for example with zone-aware routing or by disabling cross-zone load balancing on internal load balancers.', 1, 'Traffic stays in-zone in normal operation while every zone still has full capacity.'],
  ['Move the services to different Regions.', 0, 'Inter-Region transfer costs more.'],
  ['Encrypt traffic between services.', 0, 'No effect on transfer charges.']
], 'service/elb');
Q('saa-080', '4.2', 'medium', 'A company wants to be warned by email when its monthly AWS spend is forecast to exceed NZ$10,000 equivalent. Which service should be configured?', [
  ['AWS Budgets with a forecast-based alert.', 1, 'Budgets can alert on forecast as well as actual spend.'],
  ['AWS Cost and Usage Report.', 0, 'Detailed data, no alerting.'],
  ['AWS Trusted Advisor.', 0, 'Best-practice checks.'],
  ['AWS Pricing Calculator.', 0, 'Estimates future designs.']
], 'service/budgets');

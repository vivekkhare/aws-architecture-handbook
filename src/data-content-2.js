/* ===== Phase 3: SAA-C03 practice questions, domains 1 and 2 =====
   Original questions written for this handbook. Q(id, task, level, stem, [[option, 1 if correct, why]...], handbook page) */
function Q(id, task, level, stem, opts, see, doc) {
  const o = opts.map(x => { const r = { t: x[0], why: x[2] }; if (x[1]) r.ok = true; return r; });
  const q = { id, exam: id.slice(0, 3), domain: +task.split('.')[0], task, level, stem, options: o };
  if (o.filter(z => z.ok).length > 1) q.multi = true;
  if (see) q.see = see;
  if (doc) q.doc = doc;
  QUESTIONS.push(q);
}

/* ---- Domain 1: Design Secure Architectures ---- */
Q('saa-008', '1.1', 'easy', 'A company has 40 developers who each sign in to five AWS accounts with separate IAM users. The company already manages staff in Microsoft Entra ID. Which solution gives developers single sign-on to all accounts with the LEAST ongoing administration?', [
  ['Create identical IAM users in every account with a CloudFormation StackSet.', 0, 'Still five sets of credentials per person, and leavers must be removed everywhere.'],
  ['Enable AWS IAM Identity Center, connect it to Entra ID, and assign permission sets to groups for each account.', 1, 'One sign-in, temporary credentials, and access follows group membership in the existing directory.'],
  ['Create an Amazon Cognito user pool federated with Entra ID.', 0, 'Cognito is for the users of your applications, not workforce access to AWS accounts.'],
  ['Share one IAM user per team and rotate the password monthly.', 0, 'Shared credentials remove accountability and are a basic security failure.']
], 'service/identity-center');
Q('saa-009', '1.1', 'medium', 'A security team in account A must read CloudWatch Logs in account B. Staff should not receive long-term credentials in account B. What should a solutions architect configure?', [
  ['An IAM user in account B for each analyst.', 0, 'Long-term credentials in a second account are exactly what the requirement rules out.'],
  ['An IAM role in account B that trusts account A, with read permissions on the logs; analysts assume it.', 1, 'Cross-account role assumption gives temporary credentials and keeps identities in one account.'],
  ['A VPC peering connection between the two accounts.', 0, 'Peering connects networks. It grants no permission to call AWS APIs.'],
  ['A resource policy on the IAM users in account A.', 0, 'IAM users do not have resource policies.']
], 'service/iam');
Q('saa-010', '1.1', 'medium', 'A company uses AWS Organizations. Management wants to guarantee that nobody in any development account, including account administrators, can launch resources outside the Sydney Region. What should be used?', [
  ['An IAM policy attached to every developer group.', 0, 'Account administrators can change or detach IAM policies.'],
  ['A service control policy attached to the development organisational unit that denies actions outside ap-southeast-2.', 1, 'An SCP caps permissions for every principal in the accounts and cannot be altered from inside them.'],
  ['An AWS Config rule that reports resources in other Regions.', 0, 'Config detects after the fact; it does not prevent.'],
  ['AWS Budgets alerts per Region.', 0, 'A budget alert neither prevents nor restricts actions.']
], 'service/organizations');
Q('saa-011', '1.1', 'medium', 'A team lets developers create IAM roles for their Lambda functions. The security team must ensure no developer-created role can ever exceed a defined set of permissions, even if a developer attaches AdministratorAccess to it. Which feature meets this need?', [
  ['IAM permissions boundaries required on every role the developers create.', 1, 'A boundary caps the effective permissions of a role regardless of the policies attached to it.'],
  ['IAM access keys with rotation.', 0, 'Key rotation does not limit what a role can do.'],
  ['An inline policy on each developer.', 0, 'That limits the developer, not the roles the developer creates.'],
  ['AWS Shield Advanced.', 0, 'Shield is DDoS protection.']
], 'service/iam');
Q('saa-012', '1.1', 'easy', 'Which practice BEST protects the root user of a new AWS account?', [
  ['Use the root user for daily administration so that actions are never blocked.', 0, 'The root user has unrestricted power and should be used only for the few tasks that require it.'],
  ['Create root access keys and store them in AWS Secrets Manager.', 0, 'Root access keys should not exist at all.'],
  ['Enable multi-factor authentication on the root user, create no access keys, and use federated roles for everyday work.', 1, 'MFA, no keys and no routine use is the standard root protection.'],
  ['Delete the root user after creating an administrator.', 0, 'The root user cannot be deleted.']
], 'service/iam');
Q('saa-013', '1.2', 'easy', 'A three-tier web application runs in a VPC. The database must accept connections only from the application servers, which scale in and out. Which rule on the database security group is the MOST appropriate?', [
  ['Allow the database port from 0.0.0.0/0.', 0, 'Opens the database to every address.'],
  ['Allow the database port from the CIDR range of the whole VPC.', 0, 'Works, but lets every resource in the VPC connect, not only the application tier.'],
  ['Allow the database port from the application servers\' security group.', 1, 'Referencing the security group follows the instances as they scale, with nothing else admitted.'],
  ['Allow all traffic from the application subnets in a network ACL and remove the security group.', 0, 'Security groups cannot be removed, and NACLs are a coarser, stateless control.']
], 'compare/sg-vs-nacl');
Q('saa-014', '1.2', 'medium', 'A public web application behind an Application Load Balancer is receiving SQL injection attempts and bursts of requests from a small set of IP addresses. Which service should be added to block both?', [
  ['AWS Shield Standard.', 0, 'Already active, and it covers network-layer floods, not SQL injection.'],
  ['AWS WAF with managed rule groups and a rate-based rule, associated with the load balancer.', 1, 'WAF inspects HTTP requests for injection patterns and can rate-limit by source IP.'],
  ['Network ACL deny rules for the SQL keywords.', 0, 'NACLs filter addresses and ports. They cannot read request content.'],
  ['Amazon GuardDuty.', 0, 'GuardDuty detects threats; it does not block requests.']
], 'service/waf');
Q('saa-015', '1.2', 'medium', 'EC2 instances in private subnets must download operating system patches from the internet. Nothing on the internet may initiate a connection to them. Which design meets this with high availability?', [
  ['Assign public IP addresses and restrict inbound rules.', 0, 'Makes the instances directly addressable; the requirement is private subnets.'],
  ['A NAT gateway in a public subnet of each Availability Zone, with each private route table pointing to the NAT gateway in its own zone.', 1, 'NAT allows outbound-initiated traffic only, and one per zone avoids a single point of failure.'],
  ['One internet gateway attached to the private subnets.', 0, 'An internet gateway attaches to the VPC and needs public addresses on the instances.'],
  ['A gateway VPC endpoint for the internet.', 0, 'No such endpoint exists; gateway endpoints are for S3 and DynamoDB.']
], 'service/vpc');
Q('saa-016', '1.2', 'easy', 'Administrators currently connect to EC2 instances through a bastion host with SSH keys. The company wants to remove inbound SSH access and keep an audit log of sessions. Which solution should be used?', [
  ['AWS Systems Manager Session Manager.', 1, 'No inbound ports, no keys, IAM-controlled access and optional full session logging.'],
  ['A second bastion host in another Availability Zone.', 0, 'Adds availability but keeps the open port and the keys.'],
  ['AWS Client VPN to the public subnet.', 0, 'Still relies on SSH and keys once connected.'],
  ['Amazon Inspector.', 0, 'Inspector scans for vulnerabilities.']
], 'service/systems-manager');
Q('saa-017', '1.2', 'medium', 'A mobile banking app must let customers sign up, sign in with multi-factor authentication, and call an Amazon API Gateway API. Which approach requires the LEAST custom code?', [
  ['Store user names and password hashes in Amazon DynamoDB and validate them in a Lambda function.', 0, 'Building authentication yourself is slow and risky.'],
  ['Create an IAM user for each customer.', 0, 'IAM users are for administering AWS, not application customers, and do not scale to them.'],
  ['Use an Amazon Cognito user pool for sign-up and sign-in, and have API Gateway validate the tokens.', 1, 'User pools provide the directory, MFA and tokens; API Gateway checks them natively.'],
  ['Use AWS IAM Identity Center with a permission set per customer.', 0, 'Identity Center is for workforce access to AWS accounts.']
], 'service/cognito');
Q('saa-018', '1.2', 'medium', 'A company wants to be alerted when an EC2 instance starts communicating with known malicious IP addresses or when credentials are used from an unusual location. Which service provides this with the LEAST setup?', [
  ['Amazon GuardDuty.', 1, 'It analyses CloudTrail, VPC flow and DNS data for exactly these threats, with nothing to deploy.'],
  ['Amazon Macie.', 0, 'Macie finds sensitive data in S3.'],
  ['AWS Config.', 0, 'Config records and evaluates configuration.'],
  ['Amazon Inspector.', 0, 'Inspector finds software vulnerabilities.']
], 'service/guardduty');
Q('saa-019', '1.3', 'easy', 'A company must encrypt objects in Amazon S3 and be able to audit every use of the encryption key and control who can decrypt. Which option meets these requirements?', [
  ['Server-side encryption with Amazon S3 managed keys (SSE-S3).', 0, 'Encrypts the data but offers no per-key access control or usage audit.'],
  ['Server-side encryption with an AWS KMS customer managed key (SSE-KMS).', 1, 'The key policy controls decryption and every use is logged in CloudTrail.'],
  ['Client-side Base64 encoding.', 0, 'Encoding is not encryption.'],
  ['An S3 bucket policy that denies public access.', 0, 'Access control, not encryption or key audit.']
], 'service/kms');
Q('saa-020', '1.3', 'medium', 'An application stores its Amazon RDS password in a configuration file. The security team requires the password to be rotated every 30 days without application downtime or manual work. What should a solutions architect recommend?', [
  ['Store the password as a SecureString in Systems Manager Parameter Store.', 0, 'Encrypted storage, but no built-in rotation.'],
  ['Store the credentials in AWS Secrets Manager with automatic rotation, and have the application fetch them at run time.', 1, 'Secrets Manager has managed rotation for RDS and serves the current value on request.'],
  ['Encrypt the configuration file with AWS KMS.', 0, 'The password is still static and still in a file.'],
  ['Use IAM access keys in place of the database password.', 0, 'Access keys are for AWS APIs, not database logins.']
], 'service/secrets-manager');
Q('saa-021', '1.3', 'medium', 'Regulations require a company to keep financial records in Amazon S3 for seven years. During that time no user, including the account root user, may delete or overwrite them. Which configuration meets the requirement?', [
  ['Enable versioning and MFA delete.', 0, 'A user with the MFA device can still delete versions.'],
  ['Enable S3 Object Lock in compliance mode with a seven-year retention period.', 1, 'Compliance mode cannot be shortened or removed by anyone until retention expires.'],
  ['Enable S3 Object Lock in governance mode.', 0, 'Users with a bypass permission can override governance mode.'],
  ['Move the objects to S3 Glacier Deep Archive.', 0, 'A storage class does not prevent deletion.']
], 'service/s3');
Q('saa-022', '1.3', 'medium', 'A company needs to find out which of its 300 Amazon S3 buckets contain personal information such as names and credit card numbers. Which service should be used?', [
  ['Amazon Macie.', 1, 'Macie discovers and classifies sensitive data in S3.'],
  ['Amazon GuardDuty.', 0, 'GuardDuty looks for threats and unusual access, not data content.'],
  ['AWS Trusted Advisor.', 0, 'It checks for open bucket permissions, not what the data contains.'],
  ['Amazon Athena.', 0, 'You would have to write every detection query yourself.']
], 'service/macie');
Q('saa-023', '1.3', 'hard', 'An unencrypted Amazon RDS for MySQL database must become encrypted at rest. Which sequence achieves this?', [
  ['Modify the DB instance and enable encryption.', 0, 'Encryption cannot be switched on for an existing unencrypted instance.'],
  ['Take a snapshot, copy the snapshot with encryption enabled, restore a new instance from the encrypted copy, and point the application to it.', 1, 'Encryption is applied when the snapshot is copied; the restored instance is encrypted.'],
  ['Create an encrypted read replica of the unencrypted instance in the same Region and promote it.', 0, 'A same-Region read replica of an unencrypted instance cannot be encrypted.'],
  ['Enable TLS on client connections.', 0, 'That is encryption in transit.']
], 'service/rds');
Q('saa-024', '1.3', 'medium', 'A company must enforce that all requests to an Amazon S3 bucket use HTTPS. What should a solutions architect do?', [
  ['Add a bucket policy that denies requests when aws:SecureTransport is false.', 1, 'The condition key rejects any request not sent over TLS.'],
  ['Enable default encryption on the bucket.', 0, 'That is encryption at rest.'],
  ['Enable S3 Transfer Acceleration.', 0, 'Acceleration speeds uploads; it does not forbid HTTP.'],
  ['Turn on S3 Block Public Access.', 0, 'Controls public exposure, not the protocol.']
], 'service/s3');
Q('saa-025', '1.3', 'hard', 'A compliance rule states that encryption keys must be stored in dedicated, single-tenant hardware that only the company controls. Which service should hold the keys?', [
  ['AWS KMS with AWS managed keys.', 0, 'KMS HSMs are shared, multi-tenant infrastructure.'],
  ['AWS CloudHSM.', 1, 'CloudHSM provides dedicated HSMs whose keys AWS cannot access.'],
  ['AWS Secrets Manager.', 0, 'It stores secrets, encrypted by KMS.'],
  ['AWS Certificate Manager.', 0, 'ACM manages TLS certificates.']
], 'service/cloudhsm');

/* ---- Domain 2: Design Resilient Architectures ---- */
Q('saa-026', '2.1', 'easy', 'An order service must notify a billing service, a shipping service and an analytics service whenever an order is placed. Each must process every order independently, and a slow service must not delay the others. Which design is BEST?', [
  ['The order service calls each of the three services synchronously.', 0, 'Tight coupling: one slow or failed service blocks the order.'],
  ['Publish to an Amazon SNS topic that fans out to one Amazon SQS queue per service.', 1, 'Each consumer has its own durable queue and works at its own pace.'],
  ['Write orders to one Amazon SQS queue that all three services poll.', 0, 'Each message would be received by only one of the consumers.'],
  ['Store orders in Amazon S3 and have each service list the bucket every minute.', 0, 'Polling a bucket is slow, wasteful and loses ordering.']
], 'service/sns');
Q('saa-027', '2.1', 'medium', 'A payment processor requires that transactions for the same account are processed exactly once and in the order they were sent. Throughput is a few hundred messages per second. Which service fits?', [
  ['Amazon SQS standard queue.', 0, 'Standard queues are at-least-once with best-effort ordering.'],
  ['Amazon SQS FIFO queue with the account ID as the message group ID.', 1, 'FIFO preserves order per message group and deduplicates.'],
  ['Amazon SNS standard topic.', 0, 'No ordering or deduplication guarantee.'],
  ['Amazon Kinesis Data Firehose.', 0, 'Firehose is for delivery to storage, with buffering.']
], 'service/sqs');
Q('saa-028', '2.1', 'medium', 'A web tier on EC2 stores user sessions in local memory. When Auto Scaling replaces instances, users are signed out. What is the MOST appropriate fix?', [
  ['Enable sticky sessions and stop scaling in.', 0, 'Users still lose sessions when an instance fails, and you lose elasticity.'],
  ['Store session state in Amazon ElastiCache so that any instance can serve any user.', 1, 'Externalising state makes the web tier stateless.'],
  ['Increase the instance size.', 0, 'Does nothing for session loss.'],
  ['Store sessions on each instance\'s EBS volume.', 0, 'Still local to one instance.']
], 'service/elasticache');
Q('saa-029', '2.1', 'medium', 'A company needs to run a container-based API with unpredictable traffic. The team is small and does not want to manage or patch servers. Which option meets the requirement?', [
  ['Amazon ECS with the AWS Fargate launch type and service auto scaling.', 1, 'Containers with no hosts to manage, scaling with load.'],
  ['Amazon EC2 instances running Docker, managed by scripts.', 0, 'The team would manage every host.'],
  ['Amazon EKS with self-managed node groups.', 0, 'Most operational work of all the options.'],
  ['AWS Batch on EC2.', 0, 'Batch is for queued jobs, not a request-serving API.']
], 'service/ecs');
Q('saa-030', '2.1', 'medium', 'An image-processing workflow has five steps run by separate Lambda functions. The company needs retries with backoff, branching on results, and a visual record of each execution. Which service should coordinate the steps?', [
  ['AWS Step Functions.', 1, 'State machines provide sequencing, retries, branching and execution history.'],
  ['Amazon SQS with a queue between each function.', 0, 'Possible, but error handling and visibility must all be hand-built.'],
  ['Amazon EventBridge Scheduler.', 0, 'It starts things on a schedule; it does not coordinate steps.'],
  ['One Lambda function that invokes the others synchronously.', 0, 'Fragile, hits the timeout, and pays for waiting.']
], 'service/step-functions');
Q('saa-031', '2.1', 'easy', 'A company wants a function to run automatically whenever an object is uploaded to an Amazon S3 bucket, with no servers to manage. Which solution is MOST suitable?', [
  ['An EC2 instance polling the bucket with a cron job.', 0, 'A server to manage, and a polling delay.'],
  ['An S3 event notification that invokes an AWS Lambda function.', 1, 'Event-driven and serverless.'],
  ['AWS DataSync on a schedule.', 0, 'DataSync transfers data between storage systems.'],
  ['Amazon Athena scheduled queries.', 0, 'Athena queries data; it does not react to uploads.']
], 'service/lambda');
Q('saa-032', '2.1', 'hard', 'An application behind Amazon API Gateway writes each request to an Amazon RDS database. Traffic spikes of 50 times normal cause database connection errors and lost requests. Requests do not need an immediate result. Which change makes the design MOST resilient?', [
  ['Have API Gateway place each request on an Amazon SQS queue, with workers writing to the database at a controlled rate.', 1, 'The queue absorbs the spike and nothing is lost while the database works at its own pace.'],
  ['Double the database instance size.', 0, 'A 50-fold spike still overwhelms it, and you pay for the size all the time.'],
  ['Add a read replica.', 0, 'Replicas do not help writes.'],
  ['Enable API Gateway caching.', 0, 'Caching helps repeated reads, not unique writes.']
], 'service/sqs');
Q('saa-033', '2.1', 'medium', 'A company runs many microservices and wants each to react to business events such as "OrderPlaced" based on the event\'s content, without the publisher knowing the consumers. Events from a SaaS help-desk product must be handled the same way. Which service should be used?', [
  ['Amazon EventBridge.', 1, 'Content-based rules on an event bus, with partner event sources for SaaS.'],
  ['Amazon SQS.', 0, 'Point-to-point queues with no content routing.'],
  ['AWS Step Functions.', 0, 'Orchestration, not routing between independent services.'],
  ['Amazon Kinesis Data Streams.', 0, 'A stream for high-volume ordered data; no SaaS sources or content rules.']
], 'service/eventbridge');
Q('saa-034', '2.2', 'easy', 'A stateless web application runs on two EC2 instances in one Availability Zone behind an Application Load Balancer. Which change gives the BEST improvement in availability?', [
  ['Use larger instances.', 0, 'Still one zone.'],
  ['Run the instances in an Auto Scaling group across at least two Availability Zones.', 1, 'Survives the loss of a zone and replaces failed instances.'],
  ['Add an Elastic IP address to each instance.', 0, 'Addresses do not add resilience.'],
  ['Take hourly AMI backups.', 0, 'Backups help recovery, not availability.']
], 'service/auto-scaling');
Q('saa-035', '2.2', 'medium', 'A company needs its relational database to keep serving reads to users in Europe with low latency and to be recoverable in Europe within minutes if the primary Region in Asia Pacific fails. Which solution fits?', [
  ['Amazon RDS Multi-AZ.', 0, 'Multi-AZ protects against a zone failure, not a Region failure.'],
  ['Amazon Aurora Global Database with a secondary Region in Europe.', 1, 'Low-latency reads in the secondary Region and fast promotion for DR.'],
  ['Daily snapshots copied to Europe.', 0, 'Recovery point of up to a day and no local reads.'],
  ['Amazon ElastiCache in Europe.', 0, 'A cache is not a recoverable copy of the database.']
], 'service/aurora');
Q('saa-036', '2.2', 'medium', 'A company wants the lowest-cost disaster recovery approach for a non-critical internal system. A recovery time of 24 hours and data loss of up to 24 hours are acceptable. Which strategy should be chosen?', [
  ['Multi-site active/active.', 0, 'The most expensive strategy, for near-zero recovery targets.'],
  ['Warm standby.', 0, 'Runs a scaled-down copy all the time, more than is needed.'],
  ['Backup and restore.', 1, 'Cheapest option; restoring from backups fits a 24-hour target.'],
  ['Pilot light.', 0, 'Keeps core components running, which costs more than the targets require.']
], 'service/backup');
Q('saa-037', '2.2', 'medium', 'A website is hosted in two Regions. Users should go to the primary Region, and automatically to the secondary if the primary becomes unhealthy. Which Amazon Route 53 configuration achieves this?', [
  ['Weighted routing with equal weights.', 0, 'Splits traffic evenly.'],
  ['Failover routing with a health check on the primary record.', 1, 'Route 53 answers with the secondary when the health check fails.'],
  ['Geolocation routing.', 0, 'Routes by user location, not health.'],
  ['Simple routing with two IP addresses.', 0, 'No health checking.']
], 'service/route53');
Q('saa-038', '2.2', 'hard', 'An application needs at least four running EC2 instances to handle its load. It runs in an Auto Scaling group across three Availability Zones. The company must keep full capacity if one zone fails, without waiting for replacement instances to launch. What is the MINIMUM number of instances the group should run?', [
  ['Four.', 0, 'Spread 2-1-1, losing the zone with two leaves only two instances.'],
  ['Five.', 0, 'Spread 2-2-1, losing a zone with two leaves three, one short.'],
  ['Six.', 1, 'Two per zone: losing any zone leaves four, exactly the capacity needed, with nothing to launch during the failure.'],
  ['Eight.', 0, 'Works, but it is more than the minimum.']
], 'service/auto-scaling');
Q('saa-039', '2.2', 'medium', 'An application must keep working if an entire Availability Zone fails. It uses Amazon EFS for shared files and Amazon RDS for PostgreSQL. Which combination provides this? (Choose TWO.)', [
  ['An EFS Regional file system with mount targets in each zone.', 1, 'Regional EFS stores data across zones.'],
  ['An EFS One Zone file system.', 0, 'Lives in a single zone.'],
  ['RDS Multi-AZ deployment.', 1, 'A synchronous standby in another zone with automatic failover.'],
  ['RDS read replica in the same zone.', 0, 'Same zone, and replicas are not automatic failover targets.'],
  ['Larger EBS volumes.', 0, 'EBS volumes are zonal.']
], 'service/efs');
Q('saa-040', '2.2', 'medium', 'A company accidentally deleted important items from an Amazon DynamoDB table two hours ago. Which feature would have allowed the table to be restored to its state just before the deletion?', [
  ['DynamoDB Accelerator (DAX).', 0, 'DAX is a cache.'],
  ['Point-in-time recovery.', 1, 'Restores to any second within the last 35 days.'],
  ['Global tables.', 0, 'Replication copies the deletion to every Region.'],
  ['DynamoDB Streams.', 0, 'Streams hold changes for 24 hours but do not restore a table.']
], 'service/dynamodb');
Q('saa-041', '2.2', 'medium', 'A company needs centralised, policy-based backups for Amazon EBS, Amazon RDS, Amazon EFS and Amazon DynamoDB across several accounts, with copies in a second Region. Which service should be used?', [
  ['Amazon Data Lifecycle Manager.', 0, 'Covers EBS snapshots and AMIs only.'],
  ['AWS Backup with a backup plan and cross-Region copy.', 1, 'One policy across services and accounts, with copy rules.'],
  ['A Lambda function per service that calls the snapshot APIs.', 0, 'Works, but is custom code to maintain.'],
  ['AWS Storage Gateway.', 0, 'Hybrid storage, not backup orchestration.']
], 'service/backup');
Q('saa-042', '2.2', 'hard', 'A global application uses UDP and needs users directed to the nearest healthy Region through two fixed IP addresses, with failover in under a minute. Which service should be used?', [
  ['Amazon CloudFront.', 0, 'CloudFront serves HTTP and HTTPS, not arbitrary UDP.'],
  ['AWS Global Accelerator.', 1, 'Static anycast IPs, TCP and UDP, health-based failover in seconds.'],
  ['Amazon Route 53 latency-based routing.', 0, 'No fixed IPs, and failover waits on DNS caching.'],
  ['A Network Load Balancer in one Region.', 0, 'Regional only.']
], 'service/global-accelerator');
Q('saa-043', '2.2', 'medium', 'An EC2 instance that runs a legacy application occasionally becomes unreachable because of a failure of the underlying host. The application cannot run on more than one instance. Which action restores it automatically while keeping the same private IP address and instance ID?', [
  ['A CloudWatch alarm on the system status check with the EC2 recover action.', 1, 'Recovery moves the instance to healthy hardware with its identity and addresses intact.'],
  ['An Application Load Balancer health check.', 0, 'There is only one instance to route to.'],
  ['A larger instance type.', 0, 'Does not address host failure.'],
  ['AWS Backup daily backups.', 0, 'Restoring a backup creates a new instance and loses a day of state.']
], 'service/cloudwatch');

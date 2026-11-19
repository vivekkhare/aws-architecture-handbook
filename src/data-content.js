/* ===== Walkthroughs, comparisons, questions, flashcards, tools data ===== */
const WALKTHROUGHS = [
{
  id: 'fargate-api', title: 'A containerised API on ECS Fargate behind a load balancer',
  summary: 'The reference design for the payments platform API: Kotlin and Spring Boot in a container, three Availability Zones, private application subnets, an isolated PostgreSQL database.',
  diagram: DG_VPC,
  tasks: { saa: ['1.2', '2.1', '2.2', '3.2'], sap: ['1.1', '1.4', '4.2'] },
  intro: `<p>This is the design most container workloads on AWS start from. It is worth knowing well enough to draw from memory, because many exam scenarios and most architecture interviews are variations of it.</p>`,
  flow: [
    `A customer's app resolves <code>api.example.co.nz</code> in Route 53 to the Application Load Balancer.`,
    `The request enters the VPC through the internet gateway and reaches a load balancer node in a public subnet. The ALB terminates TLS using a certificate from AWS Certificate Manager.`,
    `The ALB picks a healthy task from its target group and forwards the request to that task's private IP on port 8080. The task's security group accepts traffic only from the ALB's security group.`,
    `The Spring Boot application handles the request. It opens a connection to PostgreSQL on port 5432. The database security group accepts traffic only from the task security group.`,
    `If the application needs an AWS API (for example to publish an event to SQS), it uses the task role's temporary credentials. The call leaves through a VPC endpoint or the NAT gateway in the same AZ.`,
    `The response returns along the same path. The task writes its logs to CloudWatch Logs through the <code>awslogs</code> driver.`
  ],
  components: [
    ['Route 53', 'Public DNS name pointing at the load balancer (alias record).'],
    ['Internet gateway', 'The only door between the VPC and the internet.'],
    ['Application Load Balancer', 'Public entry point. TLS termination, health checks, spreads requests across tasks in all AZs.'],
    ['ECS service on Fargate', 'Keeps three tasks running, one per AZ, and replaces any that fail or are unhealthy.'],
    ['NAT gateways', 'Outbound-only internet access for tasks, one per AZ.'],
    ['RDS PostgreSQL, Multi-AZ', 'Primary in one AZ, synchronous standby in another, automatic failover.'],
    ['Secrets Manager', 'Holds the database credentials; injected into the task at start.'],
    ['CloudWatch', 'Logs, metrics and alarms.']
  ],
  security: [
    `<b>Network:</b> three security groups chained by reference. Internet to ALB on 443. ALB group to task group on 8080. Task group to database group on 5432. Nothing else.`,
    `<b>Subnets:</b> only the load balancer and NAT gateways are in public subnets. The database subnets have no route to the internet in either direction.`,
    `<b>Identity:</b> the task execution role can pull one image and read one secret. The task role holds only what the application calls. No access keys anywhere.`,
    `<b>Data:</b> TLS to the load balancer; RDS storage encrypted with a KMS key; TLS enforced on database connections.`,
    `<b>Add for production:</b> AWS WAF on the ALB, VPC Flow Logs, GuardDuty, and separate AWS accounts for each environment.`
  ],
  cost: [
    `Fixed costs that exist even with no traffic: the ALB, three NAT gateways, the Multi-AZ database, three Fargate tasks.`,
    `NAT gateways are the easiest saving in non-production (one instead of three). In production, add the S3 gateway endpoint and ECR interface endpoints if image pulls and S3 traffic are significant.`,
    `Right-size tasks from CloudWatch metrics after a week of real traffic; consider ARM64 and a Compute Savings Plan once usage is steady.`
  ],
  failures: [
    ['One task crashes', 'The ALB health check fails, traffic stops going to it, ECS starts a replacement. Users may see a few failed requests.'],
    ['An Availability Zone fails', 'The ALB stops routing to that AZ. The two remaining tasks carry the load, so each must have headroom. ECS starts replacement tasks in the healthy AZs. If the database primary was in the failed AZ, RDS fails over to the standby, typically in one to two minutes.'],
    ['A bad deployment', 'New tasks fail health checks; the deployment circuit breaker rolls back to the previous task definition.'],
    ['The Region fails', 'This design does not survive it. That needs a disaster recovery strategy in a second Region (later walkthrough).']
  ],
  related: [['service/vpc', 'Amazon VPC'], ['service/ecs', 'Amazon ECS on Fargate'], ['service/iam', 'IAM'], ['compare/sg-vs-nacl', 'Security groups vs network ACLs']]
}
];

const COMPARISONS = [
{
  id: 'sg-vs-nacl', title: 'Security groups vs network ACLs',
  summary: 'Two firewalls in every VPC. Security groups do nearly all the work; network ACLs are a coarse second layer and the only one that can deny.',
  tasks: { saa: ['1.2'], sap: ['1.4'] },
  columns: ['Security group', 'Network ACL'],
  rows: [
    ['Applies to', 'A network interface (instance, task, load balancer, database)', 'A whole subnet'],
    ['State', 'Stateful: return traffic is allowed automatically', 'Stateless: return traffic needs its own rule'],
    ['Rule types', 'Allow only', 'Allow and deny'],
    ['Evaluation', 'All rules considered together; any match allows', 'Numbered rules, lowest first; first match decides'],
    ['Default', 'New group: no inbound, all outbound', 'Default NACL allows everything; a new custom NACL denies everything'],
    ['Can reference', 'IP ranges, prefix lists, other security groups', 'IP ranges only'],
    ['Traffic inside the subnet', 'Filtered (each interface has its own group)', 'Not filtered (only crosses the subnet boundary)'],
    ['Typical use', 'Every day: "the app accepts 8080 from the load balancer group"', 'Occasionally: block a known bad IP range, hard separation between subnet tiers']
  ],
  rules: [
    `Use <b>security groups</b> for normal access control, and reference groups instead of IP ranges wherever both ends are in AWS.`,
    `Use a <b>network ACL</b> when you must <i>deny</i> specific addresses, or when policy demands a subnet-level backstop that application teams cannot change.`,
    `If traffic is blocked and the security groups look right, check the NACL's <i>outbound</i> rules for the ephemeral port range (1024 to 65535).`,
    `To block attackers by IP at the application edge, AWS WAF on the load balancer or CloudFront is usually a better tool than a NACL.`
  ],
  scenario: `<p><b>Scenario.</b> A payments API is being probed from a small set of IP addresses. The team wants those addresses blocked immediately at the network level while they prepare WAF rules.</p>
<p><b>Answer.</b> Add deny rules for those addresses to the network ACL on the public subnets, numbered lower than the existing allow rules. A security group cannot do this because it has no deny rules; removing an allow would block everyone.</p>`,
  trap: `<p>Questions often describe a symptom: "the instance can send requests but never gets responses" (stateless NACL missing the return rule) or ask for "a deny rule for one IP address" (NACL, because security groups cannot deny).</p>`
}
];

/* Original practice questions. Not real exam questions. */
const QUESTIONS = [
{ id: 'saa-001', exam: 'saa', domain: 1, task: '1.1', level: 'easy',
  stem: 'An application on Amazon EC2 instances must read objects from an Amazon S3 bucket in the same account. Which approach gives the application access MOST securely?',
  options: [
    { t: 'Create an IAM user, generate access keys, and store them in the application configuration file.', why: 'Long-lived keys on disk can leak and must be rotated by hand.' },
    { t: 'Create an IAM role with read access to the bucket and attach it to the instances through an instance profile.', ok: true, why: 'The instances receive temporary credentials that AWS rotates automatically. Nothing is stored.' },
    { t: 'Make the bucket public and restrict access by the instances\' public IP addresses.', why: 'Exposes the bucket to the internet and breaks whenever an address changes.' },
    { t: 'Use the root user access keys so that the application never lacks permissions.', why: 'Root credentials grant everything and should never be used by applications.' }
  ], doc: ['IAM roles for Amazon EC2', 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html'], see: 'service/iam' },
{ id: 'saa-002', exam: 'saa', domain: 1, task: '1.2', level: 'medium', multi: true,
  stem: 'Amazon ECS tasks on AWS Fargate run in private subnets that have no NAT gateway. Security policy forbids any route to the internet. Which TWO additions let the tasks pull their images from Amazon ECR?',
  options: [
    { t: 'Interface VPC endpoints for the ECR API and ECR Docker registry.', ok: true, why: 'The task reaches ECR privately through these two endpoints.' },
    { t: 'A gateway VPC endpoint for Amazon S3.', ok: true, why: 'ECR stores image layers in S3, so the pull also needs a private path to S3.' },
    { t: 'A public IP address on each task.', why: 'A public IP is useless without an internet gateway route, and the policy forbids one.' },
    { t: 'An internet gateway route in the private subnets\' route table.', why: 'That makes the subnets public and breaks the policy.' },
    { t: 'A VPC peering connection to the ECR service VPC.', why: 'You cannot peer with an AWS service; private access is through endpoints.' }
  ], doc: ['Amazon ECR interface VPC endpoints', 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html'], see: 'service/ecs' },
{ id: 'saa-003', exam: 'saa', domain: 2, task: '2.1', level: 'easy',
  stem: 'A web application accepts orders and passes them directly to a fleet of worker instances for processing. During sales events the workers are overwhelmed and orders are lost. What should a solutions architect do to make the design more resilient?',
  options: [
    { t: 'Replace the worker instances with a larger instance type.', why: 'A bigger instance raises the ceiling but orders are still lost once it is reached.' },
    { t: 'Place an Amazon SQS queue between the web tier and the workers, and scale the workers on queue depth.', ok: true, why: 'The queue holds orders durably during spikes; workers process at their own pace and scale with the backlog.' },
    { t: 'Add an Application Load Balancer in front of the workers.', why: 'A load balancer spreads requests but does not store them when every worker is busy.' },
    { t: 'Store incoming orders in instance store volumes on the web servers.', why: 'Instance store data is lost when an instance stops or fails.' }
  ], doc: ['Amazon SQS Developer Guide', 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html'] },
{ id: 'saa-004', exam: 'saa', domain: 2, task: '2.2', level: 'easy',
  stem: 'A company runs a PostgreSQL database on Amazon RDS in a single Availability Zone. The business requires the database to recover automatically if that Availability Zone fails, with no change to the application connection string. Which solution meets the requirement?',
  options: [
    { t: 'Create a read replica in another Availability Zone.', why: 'A read replica is asynchronous and must be promoted manually; the endpoint changes.' },
    { t: 'Convert the DB instance to a Multi-AZ deployment.', ok: true, why: 'RDS keeps a synchronous standby in another AZ and fails over automatically behind the same endpoint.' },
    { t: 'Take automated snapshots every hour.', why: 'Snapshots allow a restore, which is manual, slow and loses recent data.' },
    { t: 'Increase the instance size and enable storage autoscaling.', why: 'Neither protects against the loss of an Availability Zone.' }
  ], doc: ['Amazon RDS Multi-AZ deployments', 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html'] },
{ id: 'saa-005', exam: 'saa', domain: 3, task: '3.4', level: 'easy',
  stem: 'A company serves product images from an Amazon S3 bucket in the Sydney Region. Customers in Europe and North America report slow page loads. Which change improves performance for all customers with the LEAST operational effort?',
  options: [
    { t: 'Create an Amazon CloudFront distribution with the bucket as its origin.', ok: true, why: 'CloudFront caches the images at edge locations close to each customer.' },
    { t: 'Copy the bucket to every Region and have the application choose the nearest one.', why: 'Works, but needs replication, routing logic and ongoing maintenance.' },
    { t: 'Enable S3 Transfer Acceleration on the bucket.', why: 'Transfer Acceleration speeds up long-distance uploads and downloads to one bucket; it does not cache content near users.' },
    { t: 'Move the images to Amazon EFS and mount it on the web servers.', why: 'EFS is a Regional file system and does nothing for distant users.' }
  ], doc: ['Amazon CloudFront Developer Guide', 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html'] },
{ id: 'saa-006', exam: 'saa', domain: 3, task: '3.3', level: 'easy',
  stem: 'Month-end reporting queries on an Amazon RDS for MySQL database slow down the customer-facing application. The reports can tolerate data that is a few seconds old. What is the MOST appropriate solution?',
  options: [
    { t: 'Enable Multi-AZ and point the reports at the standby.', why: 'The standby in a Multi-AZ DB instance deployment cannot serve reads.' },
    { t: 'Create a read replica and run the reporting queries against it.', ok: true, why: 'The replica takes the read load off the primary; slight replication lag is acceptable here.' },
    { t: 'Move the database to a larger instance class.', why: 'Costs more all month and reports still compete with customer traffic.' },
    { t: 'Export the database to Amazon S3 Glacier each month.', why: 'Glacier is archival storage, not a query engine.' }
  ], doc: ['Working with DB instance read replicas', 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html'] },
{ id: 'saa-007', exam: 'saa', domain: 4, task: '4.1', level: 'easy',
  stem: 'A company stores several terabytes of files in Amazon S3. Some files are read daily, others not for months, and the pattern cannot be predicted. Files must remain immediately available. Which storage choice minimises cost with the least management?',
  options: [
    { t: 'S3 Standard for all objects.', why: 'Always available, but pays the highest storage rate for objects nobody reads.' },
    { t: 'S3 Intelligent-Tiering.', ok: true, why: 'Moves each object between access tiers automatically based on use, with no retrieval charges and immediate access.' },
    { t: 'S3 Glacier Flexible Retrieval for all objects.', why: 'Retrievals take minutes to hours, so files are not immediately available.' },
    { t: 'A lifecycle rule that moves every object to S3 One Zone-IA after 30 days.', why: 'A fixed rule guesses the pattern, adds retrieval charges for objects that become active again, and stores data in one AZ.' }
  ], doc: ['Amazon S3 Intelligent-Tiering', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html'] },
{ id: 'sap-001', exam: 'sap', domain: 2, task: '2.3', level: 'medium',
  stem: 'A company has 60 AWS accounts in AWS Organizations, grouped into organisational units. An audit found that administrators in several workload accounts had stopped AWS CloudTrail logging and had created resources in Regions the company has not approved. The security team needs a control that prevents both actions in all workload accounts, including by users with the AdministratorAccess policy, and that applies automatically to new accounts. Which solution meets these requirements with the LEAST operational overhead?',
  options: [
    { t: 'Deploy an IAM policy with explicit Deny statements to every account by using AWS CloudFormation StackSets, and attach it to all users and roles.', why: 'Account administrators can detach or edit IAM policies in their own account, and every new role must be covered.' },
    { t: 'Attach service control policies to the workload organisational units that deny CloudTrail stop and delete actions and deny actions outside approved Regions.', ok: true, why: 'SCPs set a ceiling no principal in a member account can exceed, cannot be changed from inside the account, and apply to any account placed in the OU.' },
    { t: 'Create AWS Config rules in each account that detect disabled trails and resources in unapproved Regions, with automatic remediation.', why: 'Detective and after the fact; the action still happens, and the rules can be removed by an administrator.' },
    { t: 'Set a permissions boundary on every IAM role in each account that excludes the unwanted actions.', why: 'Boundaries are per role, must be applied to each one, and an administrator can create a role without one.' }
  ], doc: ['Service control policies', 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html'], see: 'service/iam' },
{ id: 'sap-002', exam: 'sap', domain: 4, task: '4.2', level: 'medium',
  stem: 'A payments company runs its transaction API on Amazon ECS with an Amazon Aurora PostgreSQL database in one Region. The business now requires recovery in a second Region with a recovery point objective of a few seconds and a recovery time objective of under 5 minutes. Leadership wants the lowest ongoing cost that reliably meets both objectives. Which disaster recovery strategy should the solutions architect recommend?',
  options: [
    { t: 'Backup and restore: copy Aurora snapshots and container images to the second Region and rebuild the environment there during a disaster.', why: 'Cheapest, but restoring a database and deploying infrastructure takes hours and loses data since the last snapshot.' },
    { t: 'Pilot light: replicate the database to the second Region with an Aurora global database and keep the ECS service defined there with zero running tasks.', why: 'Meets the RPO, but starting and warming the whole application tier from zero makes a 5-minute RTO unreliable.' },
    { t: 'Warm standby: use an Aurora global database and run a scaled-down but fully functional copy of the ECS service in the second Region, scaling it up on failover.', ok: true, why: 'Continuous replication gives an RPO of seconds; a running, smaller stack can take traffic within minutes and scale out. It costs less than running full capacity twice.' },
    { t: 'Multi-site active/active: run full production capacity in both Regions and serve customers from both at all times.', why: 'Meets the objectives but at roughly double the compute cost, more than the requirement calls for.' }
  ], doc: ['Disaster recovery options in the cloud', 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html'] },
{ id: 'sap-003', exam: 'sap', domain: 1, task: '1.4', level: 'medium',
  stem: 'After several acquisitions a company has 45 VPCs across 20 AWS accounts in one Region, plus two data centres connected with AWS Direct Connect. Teams create VPC peering connections whenever two VPCs need to communicate, and the network team can no longer track the routes. New VPCs are added every month. The company wants any approved VPC to reach any other and the data centres, with routing managed centrally. Which design meets these requirements?',
  options: [
    { t: 'Continue with VPC peering, and use AWS CloudFormation StackSets to create a full mesh automatically.', why: 'A full mesh of 45 VPCs is 990 peering connections, peering never routes transitively, and it does not connect to Direct Connect.' },
    { t: 'Create a transit gateway in a network account, share it with the organisation through AWS RAM, attach every VPC, and connect Direct Connect through a Direct Connect gateway.', ok: true, why: 'A transit gateway is a central router with transitive routing and its own route tables; sharing it lets every account attach, and on-premises routes arrive through one association.' },
    { t: 'Expose each application through AWS PrivateLink endpoint services.', why: 'PrivateLink shares individual services in one direction; it does not provide general network connectivity between VPCs and data centres.' },
    { t: 'Create a Site-to-Site VPN from each VPC to the data centres and route traffic between VPCs through them.', why: 'Sends inter-VPC traffic out to the data centres and back, with VPN bandwidth limits and 45 sets of tunnels to manage.' }
  ], doc: ['What is AWS Transit Gateway?', 'https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html'], see: 'service/vpc' }
];

const FLASHCARDS = [
  { id: 'f01', exams: ['saa','sap'], q: 'How many IP addresses does AWS reserve in every subnet, and which ones?', a: 'Five: the network address, the VPC router (+1), DNS (+2), one reserved for future use (+3), and the last address.' },
  { id: 'f02', exams: ['saa','sap'], q: 'Security group vs network ACL: which is stateful, and which can deny?', a: 'Security groups are stateful and allow-only. Network ACLs are stateless and support both allow and deny rules.' },
  { id: 'f03', exams: ['saa','sap'], q: 'What makes a subnet public?', a: 'Its route table has a default route to an internet gateway. Resources still need a public IP address to be reachable.' },
  { id: 'f04', exams: ['saa','sap'], q: 'Which services have gateway VPC endpoints, and what do they cost?', a: 'Amazon S3 and DynamoDB only. Gateway endpoints have no charge. Every other service uses interface endpoints, which are billed.' },
  { id: 'f05', exams: ['saa','sap'], q: 'In IAM policy evaluation, what always wins?', a: 'An explicit Deny in any applicable policy. Without any Allow, the result is an implicit deny.' },
  { id: 'f06', exams: ['saa','sap'], q: 'Do service control policies grant permissions?', a: 'No. They only set the maximum a member account can use. They do not apply to the management account.' },
  { id: 'f07', exams: ['saa','sap'], q: 'ECS task execution role vs task role?', a: 'Execution role: used by ECS to pull the image, write logs and fetch secrets. Task role: used by your application code to call AWS APIs.' },
  { id: 'f08', exams: ['saa','sap'], q: 'Which network mode do Fargate tasks use, and what follows from it?', a: 'awsvpc. Each task has its own network interface and security groups, and load balancer target groups must use target type ip.' },
  { id: 'f09', exams: ['saa'], q: 'RDS Multi-AZ vs read replica?', a: 'Multi-AZ: synchronous standby, automatic failover, for availability. Read replica: asynchronous copy, for read scaling; promotion is manual.' },
  { id: 'f10', exams: ['saa','sap'], q: 'Is VPC peering transitive?', a: 'No. If A peers with B and B with C, A cannot reach C through B. Use a transit gateway for hub-and-spoke routing.' },
  { id: 'f11', exams: ['saa'], q: 'SAA-C03: questions, time, pass mark?', a: '65 questions (50 scored), 130 minutes, 720 out of 1,000.' },
  { id: 'f12', exams: ['sap'], q: 'SAP-C03: domains and weights?', a: 'Architecture built for the cloud 25%, Security/compliance/governance 25%, Cost 15%, Resilience/migration/continuity 15%, Operational excellence 20%.' },
  { id: 'f13', exams: ['sap'], q: 'Name the four disaster recovery strategies from cheapest to fastest recovery.', a: 'Backup and restore, pilot light, warm standby, multi-site active/active.' },
  { id: 'f14', exams: ['saa','sap'], q: 'Cross-account access to an S3 bucket: which policies must allow it?', a: 'Both: the bucket policy in the owning account and an identity policy in the calling account.' }
];

const GLOSSARY = [
  ['Region', 'A geographic area with multiple isolated Availability Zones, for example ap-southeast-2 (Sydney).'],
  ['Availability Zone (AZ)', 'One or more data centres with independent power and networking inside a Region. Designs spread across AZs to survive the loss of one.'],
  ['VPC', 'Virtual private cloud. Your isolated network in one Region.'],
  ['CIDR block', 'An IP range written as address/prefix, for example 10.20.0.0/16. A smaller prefix number means a larger range.'],
  ['Subnet', 'A slice of a VPC range in one Availability Zone.'],
  ['Route table', 'Rules that decide where traffic leaving a subnet is sent.'],
  ['Internet gateway (IGW)', 'Connects a VPC to the internet for resources with public IP addresses.'],
  ['NAT gateway', 'Lets resources in private subnets start outbound internet connections without being reachable from outside.'],
  ['Security group', 'Stateful, allow-only firewall on a network interface.'],
  ['Network ACL (NACL)', 'Stateless allow/deny filter on a subnet boundary.'],
  ['ENI', 'Elastic network interface. The virtual network card an instance, task or endpoint uses in a subnet.'],
  ['VPC endpoint', 'Private connection from a VPC to an AWS service. Gateway type for S3 and DynamoDB; interface type (PrivateLink) for the rest.'],
  ['Principal', 'An identity that can make a request to AWS: a user, role, federated identity or AWS service.'],
  ['IAM role', 'An identity with permissions but no long-term credentials. It is assumed, producing temporary credentials.'],
  ['Trust policy', 'The policy on a role that says who may assume it.'],
  ['STS', 'AWS Security Token Service. Issues temporary credentials.'],
  ['SCP', 'Service control policy. An AWS Organizations policy that caps what principals in member accounts can do.'],
  ['RCP', 'Resource control policy. An AWS Organizations policy that caps how resources in member accounts can be accessed.'],
  ['OIDC', 'OpenID Connect. A standard for federated sign-in; used to let external pipelines assume AWS roles without stored keys.'],
  ['ARN', 'Amazon Resource Name. The unique identifier of an AWS resource.'],
  ['Task definition', 'The versioned blueprint for an ECS task: images, CPU, memory, roles, logging.'],
  ['Task', 'A running instance of a task definition.'],
  ['Service (ECS)', 'Keeps a set number of tasks running and connects them to a load balancer.'],
  ['Fargate', 'Serverless compute for containers. You size tasks; AWS manages the hosts.'],
  ['Target group', 'The set of destinations a load balancer forwards to, with a health check.'],
  ['Multi-AZ', 'Running a resource across Availability Zones for availability, for example an RDS standby.'],
  ['RTO', 'Recovery time objective. How long the business can wait for service to be restored.'],
  ['RPO', 'Recovery point objective. How much recent data the business can afford to lose, measured in time.'],
  ['Well-Architected Framework', 'AWS\'s design principles in six pillars: operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability.'],
  ['Shared responsibility model', 'AWS secures the cloud itself (facilities, hardware, managed service internals); you secure what you put in it (data, identity, configuration).'],
  ['Infrastructure as code (IaC)', 'Defining infrastructure in version-controlled files (Terraform, CloudFormation, CDK) instead of console clicks.'],
  ['Compensatory scoring', 'How AWS exams are marked: only your total score has to reach the pass mark, not each domain.']
];

const CHECKLISTS = [
  { id: 'sec', title: 'Security baseline', items: [
    'Root user has MFA and no access keys; it is not used for daily work.',
    'People sign in through IAM Identity Center or federation, not IAM users.',
    'Workloads use roles; no long-lived access keys in code, images or CI/CD.',
    'CloudTrail is on in all Regions, delivering to a bucket in a separate log account.',
    'GuardDuty is enabled in every account and Region in use.',
    'S3 Block Public Access is on at account level.',
    'No security group allows 0.0.0.0/0 on SSH, RDP or database ports.',
    'Databases and application tiers are in private or isolated subnets.',
    'Data is encrypted at rest (KMS) and in transit (TLS).',
    'Secrets live in Secrets Manager or Parameter Store, not in environment files or task definitions.',
    'VPC Flow Logs are enabled for production VPCs.',
    'Production, test and development are separate AWS accounts.' ] },
  { id: 'prod', title: 'Production readiness', items: [
    'The workload runs in at least two Availability Zones and survives losing one.',
    'Health checks reflect real readiness, not just "process is running".',
    'Deployments roll back automatically on failure.',
    'Auto scaling is configured and has been load-tested.',
    'Alarms exist for errors, latency, saturation and failed deployments, and someone receives them.',
    'Logs have a retention period and can be searched.',
    'Backups are automated and a restore has been tested.',
    'RTO and RPO are written down and the design has been checked against them.',
    'All infrastructure is defined as code and deployed by a pipeline.',
    'Service quotas have been checked against expected peak usage.' ] },
  { id: 'cost', title: 'Cost optimisation', items: [
    'Budgets and cost anomaly alerts are configured.',
    'Resources are tagged so cost can be allocated to teams or products.',
    'Non-production environments are scaled down or stopped out of hours.',
    'Gateway endpoints for S3 and DynamoDB are in place; NAT data charges have been reviewed.',
    'Compute is right-sized from real metrics (Compute Optimizer).',
    'Steady usage is covered by Savings Plans or reservations.',
    'S3 lifecycle rules or Intelligent-Tiering are set for large buckets.',
    'Unattached volumes, old snapshots and idle load balancers are cleaned up.',
    'CloudWatch Logs retention is set on every log group.' ] },
  { id: 'dr', title: 'Disaster recovery readiness', items: [
    'Each workload has an agreed RTO and RPO.',
    'A DR strategy (backup and restore, pilot light, warm standby, active/active) has been chosen to match.',
    'Data is replicated or backed up to a second Region where the objectives require it.',
    'Backups are protected from deletion (separate account, vault lock or Object Lock).',
    'Infrastructure can be recreated from code in the recovery Region.',
    'Failover and failback steps are written as a runbook.',
    'A recovery test has been run in the last 12 months and timed against the RTO.',
    'DNS failover or traffic switching has been tested.' ] }
];

const TROUBLE = [
  { symptom: 'ECS task stops with CannotPullContainerError', causes: ['No network path from the task subnet to ECR.', 'The task execution role lacks ECR permissions.', 'The image tag or digest does not exist.'],
    checks: ['Private subnet: is there a NAT gateway route, or interface endpoints for ecr.api and ecr.dkr plus the S3 gateway endpoint?', 'Does the endpoint security group allow 443 from the task security group?', 'Is the AmazonECSTaskExecutionRolePolicy (or equivalent) attached to the execution role?', 'Does the image URI in the task definition match what is in the repository?'] },
  { symptom: 'Application Load Balancer returns 503', causes: ['The target group has no healthy targets.', 'Tasks are failing health checks while starting.'],
    checks: ['Open the target group: are targets registered, and what reason does the health status give?', 'Does the task security group allow the container port from the ALB security group?', 'Does the health check path return 200 without authentication?', 'Is the health check grace period long enough for the application to start?'] },
  { symptom: 'Access denied even though the IAM policy allows the action', causes: ['An explicit Deny somewhere (SCP, RCP, permissions boundary, resource policy).', 'The resource policy does not allow the principal (cross-account).', 'A KMS key policy does not allow the principal.', 'A condition (source VPC, MFA, tags) is not met.'],
    checks: ['Read the full error: it often names the policy type that denied.', 'Use the IAM policy simulator or Access Analyzer.', 'For S3 with KMS encryption, check both the bucket policy and the key policy.', 'Check for SCPs on the account\'s organisational unit.'] },
  { symptom: 'Instance or task in a private subnet cannot reach the internet', causes: ['No default route to a NAT gateway.', 'The NAT gateway is in a private subnet, or its subnet has no internet gateway route.', 'A network ACL blocks return traffic.'],
    checks: ['Private subnet route table: 0.0.0.0/0 points to a NAT gateway?', 'NAT gateway\'s subnet route table: 0.0.0.0/0 points to the internet gateway?', 'Outbound security group rule allows the traffic?', 'NACLs allow ephemeral ports 1024 to 65535 inbound?'] },
  { symptom: 'Application cannot connect to the RDS database', causes: ['The database security group does not allow the application security group.', 'Wrong endpoint or port.', 'Subnets cannot route to each other (different VPCs with no connection).', 'Credentials or TLS settings are wrong.'],
    checks: ['Database security group: inbound 5432 (or 3306) from the application security group?', 'Is the application using the cluster or instance endpoint, not an IP address?', 'Timeout usually means network; "authentication failed" means credentials.', 'Use Reachability Analyzer between the task interface and the database interface.'] }
];

/* What this build contains, shown on the home page. */
const BUILD = [
  { phase: 'Phase 1', what: 'Handbook shell, tools, Exam Centre engine, three complete services (VPC, IAM, ECS on Fargate), one walkthrough, one comparison, 10 practice questions', done: true },
  { phase: 'Phase 2', what: 'The remaining Associate-critical core services, one category at a time', done: true },
  { phase: 'Phase 3', what: 'SAA-C03 study notes per task, traps, and question batches (20 per domain)', done: true },
  { phase: 'Phase 4', what: 'Remaining core services and all supporting services', done: true },
  { phase: 'Phase 5', what: 'SAP-C03 study notes, long scenario questions, full bridge', done: true },
  { phase: 'Phase 6', what: 'Catalogue cards for every other AWS service', done: true },
  { phase: 'Phase 7', what: 'Remaining walkthroughs, comparisons, concept pages and the NZ payments platform section', done: true }
];

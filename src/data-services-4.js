/* ===== Phase 2, batch C: compute and containers ===== */
SERVICES.push(
{
  id: 'ec2', name: 'Amazon EC2', category: 'compute', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon EC2'],
  summary: 'Virtual servers you rent by the second, in hundreds of sizes, with full control of the operating system.',
  what: `<p>Amazon Elastic Compute Cloud provides virtual machines called <i>instances</i>. You pick the hardware profile (instance type), the operating system image (AMI), the network placement and the storage, and you manage everything from the operating system up.</p>`,
  problem: `<p>Buying servers takes weeks and locks in capacity for years. EC2 gives capacity in minutes and lets you return it when you are done. It is also the fallback when a workload does not fit containers or functions.</p>`,
  how: `<ul>
<li><b>Instance types</b> are named by family, generation and size, for example <code>m7g.large</code>. Families: general purpose (M, T), compute optimised (C), memory optimised (R, X), storage optimised (I, D), accelerated (G, P). A <code>g</code> suffix means AWS Graviton (Arm) processors, usually the best price for performance. T instances are <i>burstable</i> and earn CPU credits.</li>
<li><b>AMI.</b> The template for the root volume. Bake your own "golden" AMI so instances start ready.</li>
<li><b>Purchase options.</b> On-Demand; <b>Savings Plans</b> and <b>Reserved Instances</b> (1 or 3 year commitment for a large discount); <b>Spot Instances</b> (spare capacity at a deep discount, reclaimable with two minutes' notice); <b>Dedicated Hosts</b> (a physical server for licence or compliance needs); <b>Capacity Reservations</b> (guaranteed capacity in a zone).</li>
<li><b>Storage.</b> EBS volumes persist; instance store disks are fast but lost on stop.</li>
<li><b>Network.</b> Instances sit in a subnet with one or more security groups. Placement groups control proximity: <i>cluster</i> (low latency, one zone), <i>spread</i> (separate hardware, up to seven per zone), <i>partition</i> (large distributed systems).</li>
<li><b>Identity.</b> An <i>instance profile</i> attaches an IAM role. The metadata service (use IMDSv2 only) hands the role's temporary credentials to software on the instance.</li>
<li><b>User data</b> runs a script at first boot. <b>Launch templates</b> capture the whole configuration for Auto Scaling.</li>
<li><b>Stop, hibernate, terminate.</b> Stopping keeps EBS volumes and ends compute charges; hibernation also saves memory to disk; termination deletes the root volume by default.</li>
<li><b>Access.</b> Prefer Systems Manager Session Manager over SSH keys and open port 22.</li>
</ul>`,
  features: [`<b>Graviton instances</b> for lower cost per unit of work.`, `<b>Spot Instances</b> for interruptible work.`, `<b>Nitro system</b>: near bare-metal performance and Nitro Enclaves for isolated processing.`, `<b>Launch templates and EC2 Fleet</b> mixing instance types and purchase options.`, `<b>Elastic IP addresses and multiple network interfaces.</b>`],
  when: [`Software that needs a full operating system, special kernel settings, GPUs or licences tied to hosts.`, `Lift-and-shift migrations.`, `Steady, heavy workloads where reserved pricing beats serverless.`, `Self-managed databases or commercial products with no managed option.`],
  whenNot: [`<b>Stateless APIs and jobs that fit a container:</b> ECS on Fargate removes host management.`, `<b>Short, event-driven work:</b> Lambda.`, `<b>Standard databases:</b> RDS or Aurora.`, `<b>A simple website for a small business:</b> Lightsail or Amplify Hosting.`],
  interactions: [`<b>EC2 Auto Scaling and Elastic Load Balancing:</b> fleets that scale and heal.`, `<b>EBS, EFS, FSx:</b> storage.`, `<b>VPC and security groups:</b> networking.`, `<b>IAM roles:</b> credentials without keys.`, `<b>Systems Manager:</b> patching, access and inventory.`, `<b>CloudWatch:</b> metrics (memory and disk need the CloudWatch agent).`, `<b>EC2 Image Builder:</b> golden AMI pipelines.`],
  example: { title: 'Launch template for a hardened, keyless instance (Terraform)', lang: 'hcl',
    code: `resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ssm_parameter.al2023_arm.value
  instance_type = "t4g.small"

  iam_instance_profile { name = aws_iam_instance_profile.app.name }
  vpc_security_group_ids = [aws_security_group.app.id]

  metadata_options {
    http_tokens                 = "required"   # IMDSv2 only
    http_put_response_hop_limit = 1
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 20
      volume_type = "gp3"
      encrypted   = true
    }
  }

  user_data = base64encode(file("bootstrap.sh"))
}`,
    notes: `<p>No key pair and no inbound SSH rule: administrators connect through Session Manager, which needs the <code>AmazonSSMManagedInstanceCore</code> policy on the instance role.</p>` },
  useCases: [`<b>Legacy application server</b> moved from a data centre with minimal change.`, `<b>Batch rendering</b> on Spot Instances.`, `<b>Licensed database</b> on Dedicated Hosts.`],
  pricing: `<p>Billed per second (minimum 60 seconds) for most Linux and Windows instances, by instance type and Region. Add EBS volumes, snapshots, data transfer, public IPv4 addresses and optional detailed monitoring. Savings Plans and Reserved Instances cut steady usage by a large fraction; Spot cuts interruptible usage further. Idle and oversized instances are the main waste.</p>`,
  pricingLink: 'https://aws.amazon.com/ec2/pricing/',
  alternatives: [`<b>ECS or EKS on Fargate:</b> containers with no hosts.`, `<b>Lambda:</b> functions billed per request.`, `<b>Elastic Beanstalk or App Runner:</b> platform-managed deployment.`, `<b>Lightsail:</b> fixed-price bundles.`, `<b>AWS Batch:</b> job scheduling on top of EC2 or Fargate.`],
  mistakes: [`<b>SSH open to 0.0.0.0/0.</b>`, `<b>Access keys stored on the instance</b> instead of a role.`, `<b>IMDSv1 left enabled</b>, exposing role credentials to request-forgery attacks.`, `<b>Hand-configured "pet" servers</b> that cannot be recreated.`, `<b>State on instance store or the root volume</b> of auto-scaled instances.`, `<b>One Availability Zone.</b>`, `<b>Burstable instances for sustained CPU load</b>, which run out of credits or run up surplus charges.`],
  exam: { saa: ['2.2', '3.2', '4.2', '1.2'], sap: ['1.1', '3.1'],
    trap: `<ul><li>Fault-tolerant, flexible batch at the lowest cost: Spot. Steady 24/7 for a year or more: Savings Plan or Reserved Instances. Short, unpredictable, cannot be interrupted: On-Demand.</li><li>Licences bound to sockets or cores: Dedicated Hosts.</li><li>Lowest network latency between nodes: cluster placement group. Reduce correlated hardware failure: spread placement group.</li><li>Applications on EC2 get AWS credentials from an instance role, never stored keys.</li></ul>`,
    proAdds: `<p>Fleet-level decisions: mixing purchase options, Graviton migration, capacity planning with reservations, and modernisation paths away from EC2.</p>` },
  docs: [{ label: 'Amazon EC2 User Guide', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html' }]
},
{
  id: 'auto-scaling', name: 'Amazon EC2 Auto Scaling', category: 'compute', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon EC2 Auto Scaling', 'AWS Auto Scaling', 'AWS Application Auto Scaling'],
  summary: 'Keeps the right number of healthy EC2 instances running, adding and removing them as load changes.',
  what: `<p>An <i>Auto Scaling group</i> maintains a fleet of EC2 instances between a minimum and maximum size. It replaces unhealthy instances and scales the fleet in response to demand or a schedule. Two related names appear in exam lists: <b>Application Auto Scaling</b> scales other services (ECS services, DynamoDB capacity, Aurora replicas, Lambda provisioned concurrency), and <b>AWS Auto Scaling</b> is a console for scaling plans across several resources.</p>`,
  problem: `<p>A fixed fleet is either too big (waste) or too small (outage), and a failed server needs a person to notice. Auto scaling fixes both.</p>`,
  how: `<ul>
<li><b>Group settings.</b> Launch template, subnets in several Availability Zones, minimum, maximum and desired capacity.</li>
<li><b>Health checks.</b> EC2 status checks by default; add load balancer health checks so instances that fail the application check are replaced.</li>
<li><b>Scaling policies.</b> <i>Target tracking</i> (keep a metric such as average CPU or requests per target near a value) is the default choice. <i>Step scaling</i> reacts in stages to alarm thresholds. <i>Scheduled scaling</i> handles known patterns. <i>Predictive scaling</i> forecasts from history and scales ahead of time.</li>
<li><b>Cooldowns and warm-up</b> stop the group reacting again before the last change has taken effect.</li>
<li><b>Lifecycle hooks</b> pause an instance while it starts or stops so you can install software or drain work.</li>
<li><b>Instance refresh</b> rolls a new launch template version through the group. <b>Warm pools</b> keep pre-initialised instances ready for faster scale-out.</li>
<li><b>Mixed instances policy</b> combines On-Demand and Spot and several instance types.</li>
<li><b>Zone rebalancing.</b> The group keeps capacity even across zones and replaces capacity lost when a zone fails.</li>
</ul>`,
  features: [`<b>Target tracking and predictive scaling.</b>`, `<b>Mixed On-Demand and Spot.</b>`, `<b>Instance refresh</b> for rolling updates.`, `<b>Warm pools and lifecycle hooks.</b>`, `<b>Attribute-based instance selection.</b>`],
  when: [`Any EC2 workload that should survive instance or zone failure.`, `Variable load.`, `Even a single instance that must restart automatically (min = max = 1).`],
  whenNot: [`<b>Stateful servers that cannot be replaced.</b> Fix the state problem first.`, `<b>Workloads that scale to zero between events:</b> Lambda or Fargate.`, `<b>Containers:</b> use ECS or EKS scaling (which may sit on an Auto Scaling group underneath).`],
  interactions: [`<b>Elastic Load Balancing:</b> registers instances and supplies health checks.`, `<b>CloudWatch:</b> metrics and alarms that drive scaling.`, `<b>SQS:</b> scale on queue backlog per instance.`, `<b>Launch templates:</b> what gets launched.`, `<b>EventBridge and SNS:</b> notifications of scaling events.`],
  example: { title: 'Group across three zones with target tracking (Terraform)', lang: 'hcl',
    code: `resource "aws_autoscaling_group" "app" {
  name                = "app"
  min_size            = 2
  max_size            = 10
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 120

  launch_template {
    id      = aws_launch_template.app.id
    version = "\$Latest"
  }
}

resource "aws_autoscaling_policy" "cpu" {
  name                   = "cpu-50"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"
  target_tracking_configuration {
    predefined_metric_specification { predefined_metric_type = "ASGAverageCPUUtilization" }
    target_value = 50
  }
}`,
    notes: `<p><code>health_check_type = "ELB"</code> is what makes the group replace an instance whose application has hung while the virtual machine itself still looks healthy.</p>` },
  useCases: [`<b>Web tier:</b> scale on requests per target.`, `<b>Queue workers:</b> scale on messages waiting per instance.`, `<b>Business hours:</b> scheduled scale-up at 8 am, down at 6 pm.`],
  pricing: `<p>No charge for Auto Scaling itself. You pay for the instances and CloudWatch alarms it uses.</p>`,
  pricingLink: 'https://aws.amazon.com/ec2/autoscaling/pricing/',
  alternatives: [`<b>ECS service auto scaling</b> and <b>Kubernetes autoscalers</b> for containers.`, `<b>Lambda</b> scales per request with no policy.`],
  mistakes: [`<b>EC2 health checks only</b>, so hung applications stay in service.`, `<b>Scaling on CPU when the bottleneck is something else</b> (connections, queue depth, memory).`, `<b>Slow boot from heavy user data</b>; bake an AMI.`, `<b>Maximum set too low</b> to absorb a zone failure.`, `<b>No scale-in protection or draining</b> for long-running work.`],
  exam: { saa: ['2.1', '2.2', '3.2', '4.2'], sap: ['1.1', '5.4'],
    trap: `<ul><li>Known daily pattern: scheduled scaling. Recurring pattern learned from history: predictive. Keep a metric at a value: target tracking.</li><li>"Instances must finish processing before termination": lifecycle hook.</li><li>Queue-driven workers scale on SQS backlog, not CPU.</li><li>Auto Scaling adds capacity; it does not distribute traffic. That is the load balancer.</li></ul>`,
    proAdds: `<p>Capacity design for zone failure (static stability), Spot diversification, and scaling policies for cost as well as performance.</p>` },
  docs: [{ label: 'Amazon EC2 Auto Scaling User Guide', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html' }]
},
{
  id: 'lambda', name: 'AWS Lambda', category: 'compute', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Lambda'],
  summary: 'Runs your code in response to events, with no servers to manage and billing by the millisecond.',
  what: `<p>Lambda runs a <i>function</i> when something triggers it: an HTTP request, a queue message, a file upload, a schedule. AWS provisions and scales the execution environments. When nothing is happening, nothing runs and nothing is billed.</p>`,
  problem: `<p>A server that waits all day for occasional events is wasted money and standing maintenance. Lambda removes both, and scales from zero to thousands of concurrent executions automatically.</p>`,
  how: `<ul>
<li><b>Limits that shape designs.</b> Maximum run time 15 minutes. Memory 128 MB to 10,240 MB, with CPU allocated in proportion. Ephemeral <code>/tmp</code> storage up to 10 GB. Deployment as a .zip (250 MB unzipped) or a container image (up to 10 GB).</li>
<li><b>Invocation models.</b> <i>Synchronous</i> (API Gateway, load balancer, function URL): the caller waits. <i>Asynchronous</i> (S3, SNS, EventBridge): Lambda queues the event and retries twice on failure, then sends it to a dead-letter queue or failure destination. <i>Event source mapping</i> (SQS, Kinesis, DynamoDB Streams, Kafka): Lambda polls and delivers batches.</li>
<li><b>Concurrency.</b> Each concurrent request uses its own environment. An account has a Regional concurrency quota. <i>Reserved concurrency</i> caps and guarantees a function's share. <i>Provisioned concurrency</i> keeps environments initialised to remove cold starts.</li>
<li><b>Cold start.</b> The first request to a new environment pays for start-up. Reduce it with smaller packages, Arm, provisioned concurrency or SnapStart (snapshot of an initialised runtime; started with Java).</li>
<li><b>Permissions.</b> The <i>execution role</i> is what the function may do. A <i>resource-based policy</i> says who may invoke it.</li>
<li><b>VPC access.</b> A function can be attached to private subnets to reach databases. It then needs a NAT gateway or VPC endpoints to reach the internet or AWS APIs.</li>
<li><b>Versions and aliases</b> support weighted traffic shifting for safe deployments.</li>
</ul>`,
  features: [`<b>Event source mappings</b> with batching, filtering and partial batch failure.`, `<b>Provisioned concurrency and SnapStart.</b>`, `<b>Function URLs and response streaming.</b>`, `<b>Layers and extensions.</b>`, `<b>Graviton (arm64)</b> for lower cost.`, `<b>Durable functions</b> for multi-step workflows that checkpoint and resume [[verify]].`],
  when: [`Event handlers: file processing, stream consumers, scheduled jobs, webhooks.`, `APIs with spiky or low traffic.`, `Glue between AWS services and operational automation.`],
  whenNot: [`<b>Work longer than 15 minutes:</b> Fargate, AWS Batch or Step Functions orchestrating smaller steps.`, `<b>Steady high-throughput services:</b> containers are usually cheaper.`, `<b>Latency-critical JVM services without SnapStart or provisioned concurrency.</b>`, `<b>Large numbers of long-lived database connections:</b> add RDS Proxy or use a container.`],
  interactions: [`<b>API Gateway, ALB, function URLs:</b> HTTP front doors.`, `<b>SQS, SNS, EventBridge, Kinesis, DynamoDB Streams, S3:</b> event sources.`, `<b>Step Functions:</b> orchestration.`, `<b>RDS Proxy:</b> connection pooling.`, `<b>CloudWatch Logs and X-Ray:</b> logs and traces.`, `<b>Secrets Manager and Parameter Store:</b> configuration.`],
  example: { title: 'Kotlin handler for SQS messages with partial batch failure', lang: 'kotlin',
    code: `class PaymentEventHandler : RequestHandler<SQSEvent, SQSBatchResponse> {

    override fun handleRequest(event: SQSEvent, context: Context): SQSBatchResponse {
        val failures = mutableListOf<SQSBatchResponse.BatchItemFailure>()

        for (record in event.records) {
            try {
                process(record.body)          // must be idempotent: SQS can deliver twice
            } catch (e: Exception) {
                context.logger.log("Failed \${record.messageId}: \${e.message}")
                failures += SQSBatchResponse.BatchItemFailure(record.messageId)
            }
        }
        return SQSBatchResponse(failures)     // only failed messages return to the queue
    }
}`,
    notes: `<p>Enable <code>ReportBatchItemFailures</code> on the event source mapping. Without it, one bad message makes the whole batch retry.</p>` },
  useCases: [`<b>Receipt generation:</b> an S3 upload triggers a function that renders a PDF.`, `<b>Webhook receiver</b> for an acquirer's payment notifications.`, `<b>Nightly reconciliation</b> started by EventBridge Scheduler.`],
  pricing: `<p>Charged per request and per GB-second of duration (memory size multiplied by run time, in 1 ms steps), with a monthly free tier. Arm is cheaper per GB-second. Provisioned concurrency is billed while configured, used or not. Main drivers: memory setting, duration, and hidden costs such as NAT gateways and CloudWatch Logs.</p>`,
  pricingLink: 'https://aws.amazon.com/lambda/pricing/',
  alternatives: [`<b>ECS on Fargate:</b> long-running or steady services.`, `<b>App Runner:</b> simple container web services.`, `<b>Step Functions:</b> when the "function" is really a workflow.`, `<b>AWS Batch:</b> long compute jobs.`],
  mistakes: [`<b>Non-idempotent handlers</b> behind at-least-once event sources.`, `<b>Functions calling functions synchronously</b> in chains; use queues or Step Functions.`, `<b>Exhausting database connections</b> as concurrency rises.`, `<b>VPC-attached function with no route to AWS APIs.</b>`, `<b>Timeout longer than the SQS visibility timeout allows</b> (set visibility to at least six times the function timeout).`, `<b>Over-broad execution role.</b>`, `<b>No reserved concurrency</b>, letting one function starve the rest or flood a downstream system.`],
  exam: { saa: ['2.1', '3.2', '4.2', '1.2'], sap: ['1.1', '5.4'],
    trap: `<ul><li>Longer than 15 minutes: not Lambda.</li><li>"Eliminate cold starts": provisioned concurrency.</li><li>Lambda with a relational database at scale: RDS Proxy.</li><li>Decoupling producers from a Lambda consumer: put SQS in between.</li><li>Lambda in a VPC needs NAT or endpoints for outbound access.</li></ul>`,
    proAdds: `<p>Serverless at organisation scale: concurrency management across teams, event-driven designs with failure handling, cost crossover against containers, and safe deployment with aliases.</p>` },
  docs: [{ label: 'AWS Lambda Developer Guide', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' }]
},
{
  id: 'elb', name: 'Elastic Load Balancing', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Elastic Load Balancing (ELB)'],
  summary: 'Spreads incoming traffic across healthy targets in several Availability Zones.',
  what: `<p>Elastic Load Balancing gives applications one stable entry point and sends each request or connection to a healthy target: instances, containers, IP addresses or Lambda functions. There are three current types, each for a different job.</p>`,
  problem: `<p>Without a load balancer, clients must know about individual servers, a failed server takes its traffic down with it, and scaling out requires telling every client.</p>`,
  how: `<div class="tablewrap"><table><thead><tr><th></th><th>Application Load Balancer</th><th>Network Load Balancer</th><th>Gateway Load Balancer</th></tr></thead><tbody>
<tr><th>Layer</th><td>7 (HTTP, HTTPS, gRPC, WebSocket)</td><td>4 (TCP, UDP, TLS)</td><td>3 (all IP traffic, GENEVE)</td></tr>
<tr><th>Routes by</th><td>Host, path, header, method, query string</td><td>Port and protocol</td><td>Sends everything to appliances</td></tr>
<tr><th>Addresses</th><td>DNS name; IPs change</td><td>One static IP per zone; Elastic IPs allowed</td><td>Reached through gateway endpoints</td></tr>
<tr><th>Security group</th><td>Yes</td><td>Yes (optional)</td><td>No</td></tr>
<tr><th>Extras</th><td>WAF, authentication (Cognito, OIDC), redirects, Lambda targets</td><td>Extreme throughput, preserves client IP, source for PrivateLink</td><td>Scales firewalls and inspection appliances</td></tr>
</tbody></table></div>
<ul>
<li><b>Listeners</b> accept traffic on a port; <b>rules</b> choose a <b>target group</b>; the target group health-checks its targets.</li>
<li><b>Cross-zone load balancing</b> is on for ALB, and off by default for NLB.</li>
<li><b>TLS</b> terminates at the load balancer with an ACM certificate. An NLB can also pass TLS straight through to targets.</li>
<li><b>Deregistration delay</b> (connection draining) lets in-flight requests finish. <b>Sticky sessions</b> pin a client to a target.</li>
<li><b>Internal or internet-facing.</b> Internet-facing load balancers sit in public subnets; targets stay private.</li>
<li><b>Classic Load Balancer</b> is the previous generation. Do not use it for new work.</li>
</ul>`,
  features: [`<b>Content-based routing</b> (ALB).`, `<b>Static IPs and PrivateLink</b> (NLB).`, `<b>Weighted target groups</b> for blue/green and canary releases.`, `<b>Built-in authentication</b> (ALB).`, `<b>Mutual TLS</b> (ALB).`, `<b>Zonal shift</b> to move traffic away from an impaired zone.`],
  when: [`ALB: web applications, APIs and microservices over HTTP.`, `NLB: non-HTTP protocols, static IP requirements, very high or spiky connection rates, exposing a service through PrivateLink.`, `GWLB: inserting third-party firewalls into the traffic path.`],
  whenNot: [`<b>API management</b> (keys, throttling per client, request validation): API Gateway.`, `<b>Routing users to the nearest Region:</b> Route 53 or Global Accelerator in front of Regional load balancers.`, `<b>Caching static content:</b> CloudFront.`],
  interactions: [`<b>EC2 Auto Scaling, ECS, EKS:</b> register and deregister targets automatically.`, `<b>ACM:</b> certificates.`, `<b>AWS WAF and Shield:</b> protection (ALB).`, `<b>Route 53:</b> alias records.`, `<b>CloudFront and Global Accelerator:</b> global entry in front.`, `<b>CloudWatch and access logs in S3:</b> visibility.`],
  example: { title: 'HTTPS listener that redirects HTTP and routes by path (Terraform)', lang: 'hcl',
    code: `resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.public.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.public.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.api.arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener_rule" "payments" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10
  condition {
    path_pattern { values = ["/payments/*"] }
  }
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.payments.arn
  }
}`,
    notes: `<p>One load balancer serves several services by path, each with its own target group and health check.</p>` },
  useCases: [`<b>Microservices behind one hostname</b>, routed by path.`, `<b>Partner integration needing fixed IPs</b> to allow-list: NLB with Elastic IPs.`, `<b>Central inspection VPC:</b> GWLB in front of firewall appliances.`],
  pricing: `<p>An hourly charge per load balancer plus usage measured in capacity units (new connections, active connections, bytes processed, rule evaluations). Idle load balancers still cost the hourly rate, so consolidate where it makes sense.</p>`,
  pricingLink: 'https://aws.amazon.com/elasticloadbalancing/pricing/',
  alternatives: [`<b>API Gateway:</b> managed API front door.`, `<b>CloudFront:</b> global HTTP entry with caching.`, `<b>Global Accelerator:</b> static anycast IPs across Regions.`, `<b>Route 53 multivalue routing:</b> simple DNS-level distribution with no proxy.`],
  mistakes: [`<b>Health check path that depends on a downstream system</b>, so one database blip removes every target.`, `<b>Target security group open to the world</b> instead of to the load balancer's security group.`, `<b>Expecting an ALB to have fixed IPs.</b>`, `<b>Load balancer subnets in only one zone.</b>`, `<b>Idle timeout shorter than the application's keep-alive</b>, causing intermittent 502 errors.`, `<b>Reading the client IP from the connection</b> instead of the <code>X-Forwarded-For</code> header behind an ALB.`],
  exam: { saa: ['2.1', '2.2', '3.4', '1.2'], sap: ['1.4'],
    trap: `<ul><li>Path or host-based routing, HTTP features, WAF: ALB.</li><li>Static IP, TCP or UDP, millions of connections, lowest latency: NLB.</li><li>Third-party virtual firewalls: Gateway Load Balancer.</li><li>A load balancer is Regional. Cross-Region needs Route 53, Global Accelerator or CloudFront.</li></ul>`,
    proAdds: `<p>Inspection architectures with Gateway Load Balancer, PrivateLink services behind NLBs, zonal shift and static stability, and when to replace load balancers between services with VPC Lattice.</p>` },
  docs: [{ label: 'Elastic Load Balancing User Guide', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html' }]
},
{
  id: 'eks', name: 'Amazon EKS', category: 'containers', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon EKS', 'Amazon EKS Anywhere', 'Amazon EKS Distro'],
  summary: 'Managed Kubernetes: AWS runs the control plane, you run workloads with standard Kubernetes tools.',
  what: `<p>Amazon Elastic Kubernetes Service runs upstream, certified Kubernetes. AWS operates the control plane (API server and etcd) across multiple Availability Zones. Your pods run on EC2 nodes, on Fargate, or on nodes that EKS manages for you.</p>`,
  problem: `<p>Kubernetes is the industry-standard container platform, with a large tool ecosystem and portable skills, but running its control plane well is hard. EKS takes that part away.</p>`,
  how: `<ul>
<li><b>Compute options.</b> <i>Managed node groups</i> (EC2 nodes that EKS provisions and upgrades), <i>self-managed nodes</i>, <i>Fargate profiles</i> (one micro-VM per pod, no nodes), and <i>EKS Auto Mode</i>, where AWS manages nodes, scaling, networking and storage add-ons for you.</li>
<li><b>Node scaling.</b> Karpenter launches right-sized nodes directly for pending pods; Cluster Autoscaler adjusts node groups. Pods scale with the Horizontal Pod Autoscaler.</li>
<li><b>Networking.</b> The VPC CNI plugin gives every pod a real VPC IP address, so subnets need enough addresses. The AWS Load Balancer Controller creates ALBs and NLBs from Kubernetes resources.</li>
<li><b>Identity.</b> <i>EKS Pod Identity</i> or <i>IAM Roles for Service Accounts</i> give each pod its own IAM role. <i>Access entries</i> map IAM principals to Kubernetes permissions.</li>
<li><b>Add-ons.</b> Managed versions of CoreDNS, kube-proxy, the CNI, storage drivers (EBS, EFS) and observability agents.</li>
<li><b>Upgrades.</b> Kubernetes releases about three times a year. You upgrade the control plane, then nodes and add-ons. Versions leave standard support after about 14 months, with paid extended support after that.</li>
<li><b>Variants.</b> <i>EKS Anywhere</i> runs clusters on your own hardware; <i>EKS Distro</i> is the open-source Kubernetes build EKS uses; <i>EKS Hybrid Nodes</i> attach on-premises machines to a cloud control plane.</li>
</ul>`,
  features: [`<b>EKS Auto Mode.</b>`, `<b>Pod-level IAM roles.</b>`, `<b>Karpenter</b> for fast, cost-aware node provisioning.`, `<b>Managed add-ons.</b>`, `<b>Hybrid and on-premises options.</b>`],
  when: [`The organisation has standardised on Kubernetes or needs its ecosystem (Helm, operators, service mesh, GitOps).`, `Workloads must be portable across clouds or to on-premises.`, `Large platform teams running many services with shared tooling.`],
  whenNot: [`<b>A small team that just needs to run containers:</b> ECS on Fargate is far less to learn and operate.`, `<b>A single web service:</b> App Runner.`, `<b>No capacity to keep up with Kubernetes upgrades.</b>`],
  interactions: [`<b>ECR:</b> images.`, `<b>IAM:</b> pod and cluster identity.`, `<b>VPC, ELB:</b> pod networking and ingress.`, `<b>EBS, EFS, FSx:</b> persistent volumes.`, `<b>CloudWatch, Managed Prometheus, Managed Grafana:</b> observability.`, `<b>GuardDuty:</b> EKS audit log and runtime protection.`, `<b>Secrets Manager:</b> secrets through the CSI driver.`],
  example: { title: 'Deployment and Service for a Spring Boot API (Kubernetes manifest)', lang: 'yaml',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: payments-api }
  template:
    metadata:
      labels: { app: payments-api }
    spec:
      serviceAccountName: payments-api      # linked to an IAM role by EKS Pod Identity
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels: { app: payments-api }
      containers:
        - name: api
          image: 111122223333.dkr.ecr.ap-southeast-2.amazonaws.com/payments-api:1.4.2
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: 500m, memory: 1Gi }
            limits:   { memory: 1Gi }
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
---
apiVersion: v1
kind: Service
metadata:
  name: payments-api
spec:
  selector: { app: payments-api }
  ports: [{ port: 80, targetPort: 8080 }]`,
    notes: `<p>The topology spread constraint keeps the three replicas in three different Availability Zones. The readiness probe keeps traffic away from a pod until Spring Boot is ready.</p>` },
  useCases: [`<b>Platform team</b> offering a shared cluster to twenty product teams.`, `<b>Software vendor</b> shipping the same Helm chart to customers on any cloud.`, `<b>ML platform</b> scheduling GPU jobs with Kubernetes operators.`],
  pricing: `<p>An hourly fee per cluster for the control plane, plus the compute (EC2, Fargate), storage, load balancers and data transfer the workloads use. Clusters on a Kubernetes version in extended support pay a higher hourly fee. Auto Mode adds a management fee on the instances it runs.</p>`,
  pricingLink: 'https://aws.amazon.com/eks/pricing/',
  alternatives: [`<b>Amazon ECS:</b> simpler, AWS-native orchestrator.`, `<b>AWS App Runner:</b> source or image to URL.`, `<b>Self-managed Kubernetes on EC2:</b> full control, full burden.`, `<b>Red Hat OpenShift Service on AWS (ROSA).</b>`],
  mistakes: [`<b>Choosing Kubernetes for one or two services.</b>`, `<b>Subnets too small</b> for one IP address per pod.`, `<b>Node IAM role with broad permissions</b> shared by every pod instead of pod-level roles.`, `<b>Falling behind on versions</b> and paying for extended support.`, `<b>Public API endpoint with no CIDR restriction.</b>`, `<b>No resource requests</b>, which makes scheduling and autoscaling unreliable.`],
  exam: { saa: ['2.1', '3.2'], sap: ['1.1', '4.1'],
    trap: `<ul><li>"Already uses Kubernetes" or "must stay portable and open source": EKS. "Simplest way to run containers with least operational overhead": ECS on Fargate.</li><li>"Run the same Kubernetes on premises": EKS Anywhere.</li></ul>`,
    proAdds: `<p>Multi-tenant cluster strategy, cluster-per-account versus shared clusters, pod identity, hybrid nodes, and migrating self-managed Kubernetes to EKS.</p>` },
  docs: [{ label: 'Amazon EKS User Guide', url: 'https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html' }]
},
{
  id: 'ecr', name: 'Amazon ECR', category: 'containers', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon ECR'],
  summary: 'A private registry for container images, integrated with IAM, ECS, EKS and Lambda.',
  what: `<p>Amazon Elastic Container Registry stores, versions and scans container images and other OCI artefacts. ECS, EKS and Lambda pull from it using IAM permissions, with no registry passwords.</p>`,
  problem: `<p>Images need a home that is private, close to where they run, access-controlled and scanned. Public registries add rate limits and supply-chain risk.</p>`,
  features: [`<b>Image scanning:</b> basic on push, or enhanced continuous scanning through Amazon Inspector.`, `<b>Lifecycle policies</b> that expire old or untagged images.`, `<b>Tag immutability.</b>`, `<b>Cross-Region and cross-account replication.</b>`, `<b>Pull-through cache</b> for public registries.`, `<b>Repository policies</b> for cross-account pulls.`],
  when: [`Any container workload on AWS.`, `Sharing base images across accounts in an organisation.`],
  whenNot: [`<b>Images that must be anonymously public:</b> ECR Public or another public registry.`],
  pricing: `<p>Charged per GB-month of image storage and for data transferred out (pulls within the same Region are free). Enhanced scanning is billed through Inspector.</p>`,
  pricingLink: 'https://aws.amazon.com/ecr/pricing/',
  alternatives: [`<b>Docker Hub, GitHub Container Registry:</b> public ecosystems, external credentials.`, `<b>Self-hosted registry (Harbor):</b> more control and work.`],
  mistakes: [`<b>No lifecycle policy</b>, storing every image ever built.`, `<b>Mutable tags such as <code>latest</code> in production.</b>`, `<b>Private subnets with no path to ECR:</b> needs NAT or the ECR API, ECR Docker and S3 endpoints.`],
  exam: { saa: ['3.2'], sap: ['5.2'], trap: `<p>"Private Docker image repository with vulnerability scanning": ECR. Tasks in private subnets need VPC endpoints or NAT to pull.</p>` },
  docs: [{ label: 'Amazon ECR User Guide', url: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html' }]
},
{
  id: 'fargate', name: 'AWS Fargate', category: 'containers', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Fargate'],
  summary: 'Serverless compute for containers: you define the task, AWS supplies and patches the machine underneath.',
  what: `<p>Fargate is a launch type for Amazon ECS and a compute option for Amazon EKS. Each task or pod runs in its own isolated micro-VM sized to the CPU and memory you request. There are no instances to choose, patch or scale. The <a href="#service/ecs">Amazon ECS page</a> covers it in detail.</p>`,
  problem: `<p>Managing a fleet of container hosts (capacity, patching, bin-packing) is work that adds nothing to the application.</p>`,
  features: [`<b>Per-task isolation.</b>`, `<b>Fargate Spot</b> for interruptible tasks at a discount.`, `<b>Graviton (Arm) support.</b>`, `<b>Up to 16 vCPU and 120 GB memory per task</b> [[verify]].`, `<b>Ephemeral storage up to 200 GB;</b> EFS (and EBS on ECS) for persistence.`],
  when: [`Default choice for new container services and scheduled jobs.`, `Small teams, variable load, strong isolation needs.`],
  whenNot: [`<b>GPUs, privileged containers or daemon-style host agents:</b> EC2 capacity.`, `<b>Very large steady fleets where host bin-packing wins on price.</b>`, `<b>Windows containers needing unsupported features.</b>`],
  pricing: `<p>Charged per second for the vCPU and memory requested by each task, plus extra ephemeral storage. Savings Plans apply. Idle headroom inside a task is paid for, so right-size task definitions.</p>`,
  pricingLink: 'https://aws.amazon.com/fargate/pricing/',
  alternatives: [`<b>ECS or EKS on EC2:</b> control and density.`, `<b>Lambda:</b> short event-driven work.`, `<b>App Runner:</b> simplest web service hosting.`],
  mistakes: [`<b>Tasks in private subnets with no NAT or endpoints</b> to pull images.`, `<b>Oversized CPU and memory</b> copied from an old server.`, `<b>Expecting SSH access to a host.</b> Use ECS Exec.`],
  exam: { saa: ['3.2', '4.2'], sap: ['1.1'], trap: `<p>"Run containers without managing servers or clusters": Fargate. It is not an orchestrator; ECS or EKS still schedules the work.</p>` },
  docs: [{ label: 'AWS Fargate for Amazon ECS', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html' }]
}
);

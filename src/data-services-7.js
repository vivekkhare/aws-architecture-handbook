/* ===== Phase 2, batch F: application integration, streaming, management ===== */
SERVICES.push(
{
  id: 'sqs', name: 'Amazon SQS', category: 'integration', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon SQS'],
  summary: 'A fully managed message queue that lets one part of a system hand work to another without waiting for it.',
  what: `<p>Amazon Simple Queue Service holds messages until a consumer processes them. Producers and consumers never talk directly, so each can fail, deploy and scale on its own.</p>`,
  problem: `<p>When service A calls service B directly, A fails whenever B is slow or down, and a traffic spike hits B at full force. A queue absorbs the spike and holds the work until B is ready.</p>`,
  how: `<ul>
<li><b>Standard queues.</b> Practically unlimited throughput, <i>at-least-once</i> delivery (a message can occasionally arrive twice) and best-effort ordering.</li>
<li><b>FIFO queues.</b> Strict order within a <i>message group</i> and exactly-once processing through deduplication. Throughput is limited (300 messages per second, 3,000 with batching, more in high-throughput mode). Names end in <code>.fifo</code>.</li>
<li><b>Visibility timeout.</b> When a consumer receives a message it becomes invisible to others for a period (default 30 seconds). If the consumer does not delete it in time, it reappears. Set the timeout longer than processing takes.</li>
<li><b>Dead-letter queue.</b> After <code>maxReceiveCount</code> failed attempts a message moves to a second queue for inspection, so one bad message does not block the rest. <i>Redrive</i> moves messages back after a fix.</li>
<li><b>Long polling</b> (wait time up to 20 seconds) reduces empty receives and cost.</li>
<li><b>Limits.</b> Message size up to 256 KB (raised to 1 MB in 2025 [[verify]]); larger payloads go to S3 with a pointer. Retention defaults to 4 days and can be set up to 14.</li>
<li><b>Delay queues</b> and per-message timers postpone delivery by up to 15 minutes.</li>
<li><b>Each message goes to one consumer.</b> For several independent consumers, publish to SNS or EventBridge and give each its own queue.</li>
</ul>`,
  features: [`<b>Standard and FIFO queues.</b>`, `<b>Dead-letter queues and redrive.</b>`, `<b>Server-side encryption</b> (SSE-SQS by default, or KMS).`, `<b>Lambda event source mapping</b> with batching and partial failure reporting.`, `<b>Fair queues</b> to reduce noisy-neighbour impact in multi-tenant systems [[verify]].`],
  when: [`Decoupling a front end from slower back-end processing.`, `Smoothing bursts so workers process at a steady rate.`, `Retrying work reliably.`, `Scaling workers on backlog.`],
  whenNot: [`<b>Several consumers each need every message:</b> SNS or EventBridge fan-out to queues.`, `<b>Replaying history or strict ordering at very high throughput:</b> Kinesis Data Streams or MSK.`, `<b>Multi-step workflows with state:</b> Step Functions.`, `<b>Existing applications using JMS or AMQP:</b> Amazon MQ.`],
  interactions: [`<b>SNS and EventBridge:</b> fan-out sources.`, `<b>Lambda, ECS, EC2 Auto Scaling:</b> consumers that scale on queue depth.`, `<b>S3 event notifications:</b> buffered object events.`, `<b>API Gateway:</b> direct integration for asynchronous APIs.`, `<b>KMS, IAM, VPC endpoints:</b> security.`, `<b>CloudWatch:</b> <code>ApproximateAgeOfOldestMessage</code> is the key alarm.`],
  example: { title: 'Queue with a dead-letter queue (Terraform)', lang: 'hcl',
    code: `resource "aws_sqs_queue" "dlq" {
  name                      = "payment-events-dlq"
  message_retention_seconds = 1209600   # 14 days
}

resource "aws_sqs_queue" "main" {
  name                       = "payment-events"
  visibility_timeout_seconds = 180       # 6 x the consumer's 30 s timeout
  receive_wait_time_seconds  = 20        # long polling
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_cloudwatch_metric_alarm" "dlq_not_empty" {
  alarm_name          = "payment-events-dlq-not-empty"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  dimensions          = { QueueName = aws_sqs_queue.dlq.name }
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}`,
    notes: `<p>A dead-letter queue nobody watches is a place where failures hide. The alarm makes the first poisoned message visible.</p>` },
  useCases: [`<b>Order or payment events</b> handed to fulfilment and notification workers.`, `<b>Image or document processing</b> after upload.`, `<b>Write buffering</b> in front of a database during spikes.`],
  pricing: `<p>Charged per million requests after a free tier; FIFO costs more than standard. A request covers up to 10 messages in a batch, and payloads are billed in 64 KB chunks. Long polling and batching are the main savings. KMS encryption adds KMS request charges.</p>`,
  pricingLink: 'https://aws.amazon.com/sqs/pricing/',
  alternatives: [`<b>Amazon SNS:</b> push to many subscribers.`, `<b>Amazon EventBridge:</b> routing by event content.`, `<b>Kinesis Data Streams or MSK:</b> ordered, replayable streams.`, `<b>Amazon MQ:</b> standard broker protocols.`, `<b>Step Functions:</b> orchestrated workflows.`],
  mistakes: [`<b>Non-idempotent consumers</b> on a standard queue.`, `<b>Visibility timeout shorter than processing time</b>, causing duplicates.`, `<b>No dead-letter queue</b>, or one with no alarm.`, `<b>Short polling in a tight loop.</b>`, `<b>FIFO chosen "to be safe"</b> where order does not matter, limiting throughput.`, `<b>One message group ID for everything</b>, which serialises the entire FIFO queue.`],
  exam: { saa: ['2.1', '2.2', '3.5'], sap: ['1.1'],
    trap: `<ul><li>"Decouple", "buffer", "handle spikes", "process asynchronously": SQS.</li><li>"Exactly once" and "in order": FIFO.</li><li>"Messages that repeatedly fail": dead-letter queue.</li><li>"Several services must each process every event": SNS topic fanned out to SQS queues.</li><li>Scale consumers on queue backlog, not CPU.</li></ul>`,
    proAdds: `<p>Queues as the standard tool for resilience between tiers and accounts, backpressure and load shedding, cross-account queue policies, and tenant fairness.</p>` },
  docs: [{ label: 'Amazon SQS Developer Guide', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html' }]
},
{
  id: 'sns', name: 'Amazon SNS', category: 'integration', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon SNS'],
  summary: 'Publish/subscribe messaging: one message to a topic is pushed to every subscriber.',
  what: `<p>Amazon Simple Notification Service delivers each published message to all subscriptions of a <i>topic</i>: SQS queues, Lambda functions, HTTPS endpoints, Data Firehose streams, email addresses, SMS numbers and mobile push services.</p>`,
  problem: `<p>When several systems care about the same event, the publisher should not have to know or call each of them. A topic lets new subscribers be added without touching the publisher.</p>`,
  how: `<ul>
<li><b>Push, not pull.</b> SNS delivers immediately and does not store messages for later (apart from retries).</li>
<li><b>Fan-out.</b> The standard pattern is one topic with an SQS queue per consuming service, so each consumer gets durability and its own retry behaviour.</li>
<li><b>Filter policies</b> let each subscription receive only messages whose attributes or body match.</li>
<li><b>FIFO topics</b> preserve order and deduplicate, delivering to FIFO queues.</li>
<li><b>Delivery retries</b> and a <i>dead-letter queue per subscription</i> for messages that cannot be delivered.</li>
<li><b>Limits.</b> Messages up to 256 KB.</li>
<li><b>Security.</b> Topic policies control who may publish and subscribe; server-side encryption with KMS.</li>
</ul>`,
  features: [`<b>Many subscriber types.</b>`, `<b>Message filtering.</b>`, `<b>FIFO topics.</b>`, `<b>Message archiving and replay</b> for FIFO topics.`, `<b>Mobile push, SMS and email</b> for notifying people.`],
  when: [`Fan-out of one event to several independent consumers.`, `Alerts from CloudWatch alarms to people.`, `Simple push notifications.`],
  whenNot: [`<b>A single consumer that needs buffering:</b> SQS alone.`, `<b>Routing on rich event content, schedules, or SaaS events:</b> EventBridge.`, `<b>Marketing email at scale:</b> Amazon SES.`, `<b>Replayable streams:</b> Kinesis.`],
  interactions: [`<b>SQS:</b> durable fan-out.`, `<b>Lambda:</b> direct invocation.`, `<b>CloudWatch alarms, AWS Budgets, EventBridge:</b> publish notifications.`, `<b>Data Firehose:</b> archive all messages to S3.`],
  example: { title: 'Subscription that only receives failed payments (Terraform)', lang: 'hcl',
    code: `resource "aws_sns_topic_subscription" "failed_to_support" {
  topic_arn            = aws_sns_topic.payment_events.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.support.arn
  raw_message_delivery = true
  filter_policy = jsonencode({
    status = ["FAILED", "CHARGEBACK"]
  })
}`,
    notes: `<p>The queue also needs a queue policy allowing <code>sqs:SendMessage</code> from the topic. That missing policy is the usual reason a subscription delivers nothing.</p>` },
  useCases: [`<b>Payment completed</b> event sent to ledger, notification and analytics queues.`, `<b>Operations alerts</b> to an on-call channel.`],
  pricing: `<p>Charged per million publishes and per delivery, with rates by protocol. Deliveries to SQS and Lambda are free or very cheap; SMS is charged per message by country and is the usual cost surprise.</p>`,
  pricingLink: 'https://aws.amazon.com/sns/pricing/',
  alternatives: [`<b>EventBridge:</b> content-based routing with many more sources and targets.`, `<b>SQS:</b> point-to-point.`, `<b>Kinesis Data Streams:</b> multiple consumers reading a retained stream.`],
  mistakes: [`<b>Subscribing Lambda or HTTP endpoints directly</b> for critical events with no queue or dead-letter queue.`, `<b>Missing SQS queue policy.</b>`, `<b>No filter policies</b>, so every consumer discards most messages.`, `<b>Open topic policy</b> letting anyone publish.`],
  exam: { saa: ['2.1', '3.5'], sap: ['1.1'],
    trap: `<ul><li>"Notify multiple subscribers" or "fan out": SNS.</li><li>SNS pushes and does not retain; SQS holds until polled. Together: fan-out with durability.</li><li>"Send an email or SMS when an alarm fires": CloudWatch alarm to SNS.</li></ul>`,
    proAdds: `<p>Cross-account and cross-Region event distribution, and choosing between SNS, EventBridge and streams for an event backbone.</p>` },
  docs: [{ label: 'Amazon SNS Developer Guide', url: 'https://docs.aws.amazon.com/sns/latest/dg/welcome.html' }]
},
{
  id: 'eventbridge', name: 'Amazon EventBridge', category: 'integration', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon EventBridge'],
  summary: 'A serverless event bus that routes events from AWS services, your applications and SaaS products to targets using rules.',
  what: `<p>EventBridge receives events (JSON documents describing something that happened) and delivers them to targets when they match a rule. Nearly every AWS service emits events to it automatically, which makes it the backbone for automation and event-driven design.</p>`,
  problem: `<p>Point-to-point integrations multiply as systems grow. An event bus lets producers publish facts without knowing who reacts, and lets consumers subscribe with a filter instead of code.</p>`,
  how: `<ul>
<li><b>Event buses.</b> The <i>default</i> bus carries AWS service events. <i>Custom</i> buses carry your application's events. <i>Partner</i> buses receive events from SaaS providers.</li>
<li><b>Rules</b> match on any field of the event with an <i>event pattern</i> and send matches to up to five targets: Lambda, SQS, SNS, Step Functions, ECS tasks, Kinesis, API destinations (any HTTPS endpoint) and many more.</li>
<li><b>Input transformers</b> reshape the event for the target.</li>
<li><b>Delivery.</b> At-least-once, with retries for up to 24 hours and an optional dead-letter queue per target. Order is not guaranteed.</li>
<li><b>Archive and replay</b> stores events and re-sends them later, for recovery or testing.</li>
<li><b>Cross-account and cross-Region.</b> A rule can target a bus in another account, the usual way to centralise events in an organisation.</li>
<li><b>EventBridge Scheduler</b> runs one-time and recurring schedules at scale with time zones and flexible windows. It supersedes scheduled rules.</li>
<li><b>EventBridge Pipes</b> connect one source (SQS, Kinesis, DynamoDB Streams, Kafka) to one target with optional filtering and enrichment.</li>
<li><b>Schema registry</b> discovers event shapes and generates code bindings.</li>
</ul>`,
  features: [`<b>Content-based filtering.</b>`, `<b>Over 200 AWS event sources and SaaS integrations.</b>`, `<b>Archive and replay.</b>`, `<b>Scheduler.</b>`, `<b>Pipes.</b>`, `<b>API destinations.</b>`, `<b>Global endpoints</b> for Regional failover of event ingestion.`],
  when: [`Reacting to AWS events: an instance changed state, a GuardDuty finding, a failed pipeline.`, `Event-driven integration between microservices.`, `Scheduled jobs.`, `Receiving events from SaaS products.`],
  whenNot: [`<b>Strict ordering or very high-throughput streams:</b> Kinesis or MSK.`, `<b>Simple fan-out at the highest throughput and lowest latency:</b> SNS.`, `<b>Work queue with backpressure:</b> SQS (often as an EventBridge target).`, `<b>Coordinating steps with state:</b> Step Functions.`],
  interactions: [`<b>All AWS services:</b> event sources through the default bus.`, `<b>Lambda, SQS, SNS, Step Functions, ECS:</b> common targets.`, `<b>CloudTrail:</b> API calls as events.`, `<b>Organizations:</b> central event bus across accounts.`],
  example: { title: 'Rule: react to any root user console sign-in', lang: 'json',
    code: `{
  "source": ["aws.signin"],
  "detail-type": ["AWS Console Sign In via CloudTrail"],
  "detail": {
    "userIdentity": { "type": ["Root"] }
  }
}`,
    notes: `<p>Target an SNS topic that pages the security contact. Sign-in events for the root user are recorded in <code>us-east-1</code>, so the rule belongs there.</p>` },
  useCases: [`<b>Security automation:</b> GuardDuty finding triggers an isolation workflow.`, `<b>Domain events</b> such as <code>PaymentSettled</code> consumed by several services.`, `<b>Nightly jobs</b> with Scheduler starting ECS tasks.`],
  pricing: `<p>Events from AWS services on the default bus are free. Custom and partner events are charged per million published. Archive storage, replay, Pipes, Scheduler invocations beyond a free tier, and API destinations are charged by use.</p>`,
  pricingLink: 'https://aws.amazon.com/eventbridge/pricing/',
  alternatives: [`<b>SNS:</b> simpler pub/sub.`, `<b>SQS:</b> queues.`, `<b>Kinesis, MSK:</b> streams.`, `<b>Step Functions:</b> orchestration.`, `<b>Amazon MQ:</b> legacy protocols.`],
  mistakes: [`<b>Targets with no dead-letter queue.</b>`, `<b>Assuming ordered or exactly-once delivery.</b>`, `<b>Rules that match their own output</b>, creating loops.`, `<b>Over-broad patterns</b> invoking targets for every event.`, `<b>Forgetting resource policies</b> for cross-account delivery.`],
  exam: { saa: ['2.1', '3.5'], sap: ['1.1', '5.4'],
    trap: `<ul><li>"React to changes in AWS resources" or "run on a schedule": EventBridge.</li><li>"Integrate with a SaaS application's events": EventBridge partner event source.</li><li>Routing by message content with many target types: EventBridge. Plain fan-out: SNS.</li></ul>`,
    proAdds: `<p>Organisation-wide event buses, automated remediation and operations (task 5.4), archive and replay for recovery, and event-driven architecture across accounts.</p>` },
  docs: [{ label: 'Amazon EventBridge User Guide', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html' }]
},
{
  id: 'step-functions', name: 'AWS Step Functions', category: 'integration', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Step Functions'],
  summary: 'Serverless workflows that coordinate multiple services as a state machine with built-in retries and error handling.',
  what: `<p>Step Functions runs <i>state machines</i>: a defined series of steps with branching, parallelism, waits, retries and error handling. Each step can call a Lambda function, an ECS task, or almost any AWS API directly.</p>`,
  problem: `<p>Business processes span several services and can fail halfway. Hiding that logic inside functions calling functions makes it invisible and fragile. A workflow engine makes each step, its state and its failure handling explicit.</p>`,
  how: `<ul>
<li><b>Standard workflows.</b> Run for up to one year, execute each step exactly once, keep a full execution history, and are billed per state transition. Use them for long-running, auditable processes.</li>
<li><b>Express workflows.</b> Run for up to five minutes at very high rates with at-least-once execution, billed by duration. Use them for high-volume event processing.</li>
<li><b>States.</b> Task, Choice, Parallel, Map (iterate over a list; <i>Distributed Map</i> processes millions of items, for example objects in S3), Wait, Pass, Succeed, Fail.</li>
<li><b>Integration patterns.</b> Request-response; <code>.sync</code> (wait for a job such as an ECS task or Glue job to finish); <code>.waitForTaskToken</code> (pause until an external system or a person calls back).</li>
<li><b>Error handling.</b> <code>Retry</code> with backoff and <code>Catch</code> to route failures, which is how compensation steps (the saga pattern) are built.</li>
<li><b>Definition</b> in Amazon States Language (JSON), with JSONata or JSONPath for data handling, or the visual Workflow Studio.</li>
</ul>`,
  features: [`<b>Over 200 direct service integrations</b> with no Lambda glue.`, `<b>Visual execution history.</b>`, `<b>Distributed Map.</b>`, `<b>Callback pattern</b> for human approval.`, `<b>Redrive</b> of failed executions from the point of failure.`],
  when: [`Multi-step business processes: onboarding, order fulfilment, refunds.`, `Sagas with compensating actions across services.`, `Data and machine learning pipelines.`, `Human approval steps.`, `Large-scale parallel batch processing.`],
  whenNot: [`<b>A single task:</b> Lambda alone.`, `<b>Simple decoupling:</b> SQS.`, `<b>Loose event choreography with independent services:</b> EventBridge.`, `<b>Complex scheduled data pipelines already written for Airflow:</b> Amazon MWAA.`],
  interactions: [`<b>Lambda, ECS, Batch, Glue, SageMaker, Bedrock:</b> task targets.`, `<b>EventBridge and API Gateway:</b> start executions.`, `<b>SQS, SNS, DynamoDB:</b> direct calls.`, `<b>CloudWatch and X-Ray:</b> monitoring.`],
  example: { title: 'Payment saga with a compensation step (Amazon States Language, trimmed)', lang: 'json',
    code: `{
  "StartAt": "ReserveFunds",
  "States": {
    "ReserveFunds": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "reserve-funds", "Payload.$": "$" },
      "Retry": [{ "ErrorEquals": ["States.TaskFailed"], "IntervalSeconds": 2, "MaxAttempts": 3, "BackoffRate": 2 }],
      "Next": "SubmitToAcquirer"
    },
    "SubmitToAcquirer": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "submit-to-acquirer", "Payload.$": "$" },
      "Catch": [{ "ErrorEquals": ["States.ALL"], "ResultPath": "$.error", "Next": "ReleaseFunds" }],
      "Next": "RecordSuccess"
    },
    "ReleaseFunds": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "release-funds", "Payload.$": "$" },
      "Next": "PaymentFailed"
    },
    "RecordSuccess": { "Type": "Succeed" },
    "PaymentFailed": { "Type": "Fail", "Error": "PaymentFailed" }
  }
}`,
    notes: `<p>If the acquirer call fails after funds were reserved, the <code>Catch</code> routes to a step that releases them. Each function must be idempotent because retries can repeat a call.</p>` },
  useCases: [`<b>Customer onboarding</b> with identity checks and a manual review step.`, `<b>Refund processing</b> across ledger, acquirer and notification services.`, `<b>Nightly batch</b> over millions of S3 objects with Distributed Map.`],
  pricing: `<p>Standard: per state transition. Express: per request plus duration and memory. Tasks invoked (Lambda, ECS and so on) are billed separately. A high-volume loop in a Standard workflow is the usual cost mistake.</p>`,
  pricingLink: 'https://aws.amazon.com/step-functions/pricing/',
  alternatives: [`<b>EventBridge choreography:</b> no central coordinator.`, `<b>Amazon MWAA:</b> managed Apache Airflow.`, `<b>Lambda durable functions:</b> workflow logic written in code.`, `<b>SQS chains:</b> simple pipelines.`],
  mistakes: [`<b>Standard workflow for millions of short executions</b> (use Express).`, `<b>Passing large payloads between states</b> (limit 256 KB); store data in S3 and pass references.`, `<b>Lambda functions written only to call another AWS API</b> when a direct integration exists.`, `<b>No Catch on steps that can fail.</b>`],
  exam: { saa: ['2.1', '3.5'], sap: ['1.1', '5.4'],
    trap: `<ul><li>"Coordinate multiple Lambda functions", "workflow", "sequence with error handling", "human approval": Step Functions.</li><li>Long-running and auditable: Standard. High-volume, short: Express.</li><li>Step Functions replaces the retired Simple Workflow Service in answers.</li></ul>`,
    proAdds: `<p>Sagas for distributed transactions, operational runbooks as workflows, and orchestration of migration and data pipelines.</p>` },
  docs: [{ label: 'AWS Step Functions Developer Guide', url: 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html' }]
},
{
  id: 'kinesis', name: 'Amazon Kinesis Data Streams and Data Firehose', category: 'analytics', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Kinesis', 'Amazon Kinesis Data Streams'],
  summary: 'Real-time streaming: Data Streams keeps an ordered, replayable log of records; Data Firehose delivers streams to storage with no code.',
  what: `<p><b>Kinesis Data Streams</b> ingests records continuously and stores them in order so several applications can read and re-read them. <b>Amazon Data Firehose</b> (formerly Kinesis Data Firehose) takes a stream and loads it into S3, Redshift, OpenSearch, Iceberg tables or third-party tools, batching and transforming on the way.</p>`,
  problem: `<p>Clickstreams, logs, telemetry and transactions arrive continuously. Queues delete messages once processed; analytics and multiple independent readers need a retained, ordered stream.</p>`,
  how: `<ul>
<li><b>Shards.</b> A stream is made of shards. Each shard accepts 1 MB or 1,000 records per second of writes and serves 2 MB per second of reads. Records with the same <i>partition key</i> go to the same shard and stay in order.</li>
<li><b>Capacity modes.</b> <i>On-demand</i> scales shards automatically; <i>provisioned</i> fixes the shard count.</li>
<li><b>Retention.</b> 24 hours by default, extendable to 365 days. Consumers can replay from any point.</li>
<li><b>Consumers.</b> Lambda, the Kinesis Client Library, Managed Service for Apache Flink, Firehose. <i>Enhanced fan-out</i> gives each consumer its own 2 MB per second per shard.</li>
<li><b>Firehose.</b> Fully managed delivery with buffering by size or time (so it is near real time, not instant), optional Lambda transformation, format conversion to Parquet, and compression. No shards to manage and no replay.</li>
<li><b>Managed Service for Apache Flink</b> runs stateful stream processing (windows, joins, aggregations) on streams.</li>
<li><b>Kinesis Video Streams</b> is a separate service for ingesting video from cameras.</li>
</ul>`,
  features: [`<b>Ordering per partition key and replay.</b>`, `<b>On-demand capacity.</b>`, `<b>Enhanced fan-out.</b>`, `<b>Firehose direct delivery</b> to S3, Redshift, OpenSearch, Iceberg, Splunk, Datadog and HTTP endpoints.`, `<b>Server-side encryption with KMS.</b>`],
  when: [`Real-time analytics and dashboards.`, `Several applications consuming the same events independently.`, `Log and event delivery into a data lake (Firehose).`, `Change data capture pipelines.`],
  whenNot: [`<b>Simple work queue:</b> SQS is simpler and cheaper.`, `<b>Kafka APIs or ecosystem required:</b> Amazon MSK.`, `<b>Routing events to many kinds of targets by content:</b> EventBridge.`, `<b>Batch file transfer:</b> DataSync or S3 uploads.`],
  interactions: [`<b>Lambda, Managed Service for Apache Flink:</b> processing.`, `<b>Firehose to S3, Redshift, OpenSearch:</b> delivery.`, `<b>DynamoDB Streams, CloudWatch Logs, IoT Core, DMS:</b> sources.`, `<b>Glue, Athena:</b> analysing delivered data.`],
  example: { title: 'Firehose delivering to S3 as Parquet, partitioned by date (Terraform, trimmed)', lang: 'hcl',
    code: `resource "aws_kinesis_firehose_delivery_stream" "events" {
  name        = "app-events"
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn            = aws_iam_role.firehose.arn
    bucket_arn          = aws_s3_bucket.lake.arn
    prefix              = "events/dt=!{timestamp:yyyy-MM-dd}/"
    error_output_prefix = "errors/!{firehose:error-output-type}/"
    buffering_size      = 128   # MB
    buffering_interval  = 300   # seconds

    data_format_conversion_configuration {
      input_format_configuration  { deserializer { open_x_json_ser_de {} } }
      output_format_configuration { serializer   { parquet_ser_de {} } }
      schema_configuration {
        database_name = aws_glue_catalog_database.lake.name
        table_name    = aws_glue_catalog_table.events.name
        role_arn      = aws_iam_role.firehose.arn
      }
    }
  }
}`,
    notes: `<p>Applications call <code>PutRecord</code>; Firehose batches, converts to Parquet and writes date-partitioned objects that Athena can query cheaply.</p>` },
  useCases: [`<b>App analytics:</b> events from a Flutter app into S3 and Athena.`, `<b>Fraud signals:</b> transactions scored in a Flink application within seconds.`, `<b>Central logging:</b> CloudWatch Logs subscriptions through Firehose to a log archive bucket.`],
  pricing: `<p>Data Streams: per shard-hour and per million PUT payload units (provisioned), or per GB written and read (on-demand), plus extended retention and enhanced fan-out. Firehose: per GB ingested, plus format conversion and other optional features.</p>`,
  pricingLink: 'https://aws.amazon.com/kinesis/data-streams/pricing/',
  alternatives: [`<b>Amazon MSK:</b> managed Apache Kafka.`, `<b>SQS:</b> queues.`, `<b>EventBridge:</b> event routing.`, `<b>DynamoDB Streams:</b> change stream for one table.`],
  mistakes: [`<b>Hot shard</b> from a poorly distributed partition key.`, `<b>Calling Firehose "real time".</b> It buffers for at least a few seconds, usually a minute or more.`, `<b>Many consumers sharing a shard's read limit</b> without enhanced fan-out.`, `<b>Expecting Firehose to replay.</b>`, `<b>Consumer falling behind</b> with no alarm on iterator age.`],
  exam: { saa: ['3.5', '2.1'], sap: ['1.5', '1.1'],
    trap: `<ul><li>"Real-time", "ordered", "replay", "multiple consumers": Kinesis Data Streams.</li><li>"Load streaming data into S3, Redshift or OpenSearch with the least operational overhead": Data Firehose.</li><li>"Real-time analytics with SQL or Flink on a stream": Managed Service for Apache Flink.</li><li>"Apache Kafka": MSK.</li></ul>`,
    proAdds: `<p>Streaming ingestion into lakes and warehouses, cross-account stream access, and choosing between Kinesis, MSK, EventBridge and SQS for an event platform.</p>` },
  docs: [{ label: 'Amazon Kinesis Data Streams Developer Guide', url: 'https://docs.aws.amazon.com/streams/latest/dev/introduction.html' }, { label: 'Amazon Data Firehose Developer Guide', url: 'https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html' }]
},
{
  id: 'cloudwatch', name: 'Amazon CloudWatch', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon CloudWatch'],
  summary: 'Metrics, logs, alarms and dashboards for AWS resources and your applications.',
  what: `<p>CloudWatch is the monitoring service. AWS services send it metrics automatically; applications send logs and custom metrics. Alarms watch metrics and trigger notifications or automatic actions.</p>`,
  problem: `<p>You cannot operate what you cannot see. CloudWatch is the default place to see performance, detect failure and trigger a response.</p>`,
  how: `<ul>
<li><b>Metrics</b> are time series identified by a namespace, name and dimensions. Most services publish at one-minute or five-minute intervals. EC2 does <b>not</b> report memory or disk usage unless the CloudWatch agent is installed.</li>
<li><b>Alarms</b> have three states (OK, ALARM, INSUFFICIENT_DATA) and act through SNS, Auto Scaling, EC2 actions (stop, reboot, recover) or Systems Manager. <i>Composite alarms</i> combine others to cut noise. <i>Anomaly detection</i> alarms learn a normal band.</li>
<li><b>Logs.</b> Log groups hold streams of events. Set a <i>retention period</i>; the default is to keep logs forever. <i>Metric filters</i> turn log patterns into metrics. <i>Subscription filters</i> stream logs to Lambda, Kinesis, Firehose or OpenSearch. <i>Logs Insights</i> queries logs interactively.</li>
<li><b>Embedded metric format</b> lets an application emit metrics inside structured log lines.</li>
<li><b>Application Signals</b> builds service maps and service-level objectives from OpenTelemetry traces and metrics. <b>Synthetics</b> canaries test endpoints from outside. <b>RUM</b> measures real users. <b>Container Insights</b> and <b>Lambda Insights</b> add workload detail.</li>
<li><b>Cross-account observability</b> lets a monitoring account view metrics, logs and traces from many source accounts.</li>
</ul>`,
  features: [`<b>Alarms with automated actions.</b>`, `<b>Logs Insights.</b>`, `<b>Dashboards.</b>`, `<b>Application Signals and SLOs.</b>`, `<b>Synthetics and RUM.</b>`, `<b>Cross-account observability.</b>`, `<b>Infrequent Access log class</b> for cheaper, less-queried logs.`],
  when: [`Always: baseline monitoring and alerting for every workload.`, `Scaling triggers.`, `Central application logs.`, `Service-level objectives.`],
  whenNot: [`<b>Who made an API call:</b> CloudTrail.`, `<b>Configuration compliance:</b> AWS Config.`, `<b>Long-term analytics on logs at low cost:</b> export to S3 and query with Athena.`, `<b>Prometheus-native metrics at scale:</b> Amazon Managed Service for Prometheus.`],
  interactions: [`<b>SNS:</b> alarm notifications.`, `<b>EC2 Auto Scaling and Application Auto Scaling:</b> scaling policies.`, `<b>EventBridge:</b> alarm state change events.`, `<b>X-Ray and OpenTelemetry:</b> traces.`, `<b>Lambda, ECS, EKS, API Gateway, RDS:</b> automatic metrics and logs.`, `<b>Firehose, S3:</b> log archiving.`],
  example: { title: 'Alarm on the 99th percentile latency of a load balancer (Terraform)', lang: 'hcl',
    code: `resource "aws_cloudwatch_metric_alarm" "p99_latency" {
  alarm_name          = "payments-api-p99-latency"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "TargetResponseTime"
  dimensions          = { LoadBalancer = aws_lb.public.arn_suffix }
  extended_statistic  = "p99"
  period              = 60
  evaluation_periods  = 5
  datapoints_to_alarm = 3
  threshold           = 0.8          # seconds
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}`,
    notes: `<p>Percentiles show what slow requests look like; an average hides them. "3 out of 5" datapoints avoids paging on a single spike.</p>` },
  useCases: [`<b>On-call alerting</b> for error rate, latency and queue age.`, `<b>Auto recovery</b> of an EC2 instance on a failed system status check.`, `<b>Security alerts</b> from metric filters on CloudTrail logs.`],
  pricing: `<p>Charged per custom metric, per alarm, per dashboard, per GB of logs ingested and stored, per GB scanned by Logs Insights, and per canary run. Log ingestion is usually the largest item, so control verbosity and set retention.</p>`,
  pricingLink: 'https://aws.amazon.com/cloudwatch/pricing/',
  alternatives: [`<b>Amazon Managed Service for Prometheus and Managed Grafana.</b>`, `<b>OpenSearch Service</b> for log analytics.`, `<b>Third-party observability platforms</b> (Datadog, New Relic, Grafana Cloud).`],
  mistakes: [`<b>Log groups that never expire.</b>`, `<b>Expecting EC2 memory metrics without the agent.</b>`, `<b>Alarms on averages</b> for latency.`, `<b>Alarms nobody receives</b> or that fire so often they are ignored.`, `<b>Debug logging in production</b> at full volume.`, `<b>High-cardinality custom metric dimensions</b> multiplying cost.`],
  exam: { saa: ['2.2', '3.2', '1.2'], sap: ['5.3', '5.4'],
    trap: `<ul><li>Performance and operational health: CloudWatch. API audit: CloudTrail. Configuration history: Config.</li><li>EC2 memory or disk space: install the CloudWatch agent.</li><li>"Automatically recover an instance": CloudWatch alarm with the recover action.</li><li>"Search and analyse logs interactively": Logs Insights.</li></ul>`,
    proAdds: `<p>Observability is its own task in SAP-C03: cross-account monitoring, OpenTelemetry and distributed tracing, service-level objectives, and centralised logging architectures.</p>` },
  docs: [{ label: 'Amazon CloudWatch User Guide', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' }]
},
{
  id: 'cloudformation', name: 'AWS CloudFormation', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS CloudFormation'],
  summary: 'Infrastructure as code: describe resources in a template and AWS creates, updates and deletes them as one unit.',
  what: `<p>CloudFormation provisions AWS resources from YAML or JSON <i>templates</i>. A deployed template is a <i>stack</i>. Changing the template and updating the stack changes the infrastructure, in dependency order, with rollback on failure.</p>`,
  problem: `<p>Environments built by clicking cannot be reviewed, repeated or recovered. Code can be versioned, tested and deployed the same way every time.</p>`,
  how: `<ul>
<li><b>Template sections.</b> Parameters, Mappings, Conditions, Resources (the only required one) and Outputs.</li>
<li><b>Change sets</b> preview what an update will add, modify or replace before you apply it.</li>
<li><b>Rollback.</b> A failed create or update returns the stack to its last good state.</li>
<li><b>StackSets</b> deploy one template to many accounts and Regions, integrated with AWS Organizations so new accounts receive it automatically.</li>
<li><b>Drift detection</b> reports resources changed outside CloudFormation.</li>
<li><b>Protection.</b> <code>DeletionPolicy: Retain</code> or <code>Snapshot</code> keeps data when a stack is deleted; stack policies block updates to critical resources; termination protection guards the stack itself.</li>
<li><b>Reuse.</b> Nested stacks, cross-stack exports and imports, and modules.</li>
<li><b>Extending.</b> Custom resources (backed by Lambda) and the registry of third-party resource types.</li>
<li><b>IaC generator</b> builds templates from resources that already exist.</li>
<li><b>Related tools.</b> <i>AWS CDK</i> writes infrastructure in a programming language and synthesises CloudFormation. <i>AWS SAM</i> is a shorthand for serverless applications. <i>Terraform</i> is the common third-party alternative and does not use CloudFormation.</li>
</ul>`,
  features: [`<b>Change sets.</b>`, `<b>StackSets.</b>`, `<b>Drift detection.</b>`, `<b>Automatic rollback.</b>`, `<b>Hooks</b> that check resources against policy before they are created.`, `<b>Git sync.</b>`],
  when: [`Any environment that should be repeatable.`, `Baselines rolled out to every account (StackSets).`, `Disaster recovery, where infrastructure must be recreated quickly in another Region.`, `Service Catalog products and Control Tower customisations.`],
  whenNot: [`<b>Your team has standardised on Terraform:</b> stay consistent.`, `<b>Configuration inside servers:</b> Systems Manager, user data or baked AMIs.`, `<b>Application deployment logic:</b> CodeDeploy or your pipeline.`],
  interactions: [`<b>Organizations:</b> StackSets.`, `<b>Service Catalog and Control Tower:</b> built on CloudFormation.`, `<b>CodePipeline:</b> deploy action.`, `<b>IAM:</b> service roles limit what a stack can do.`, `<b>Secrets Manager and Parameter Store:</b> dynamic references for secrets.`],
  example: { title: 'Minimal template with a parameter, a protected resource and an output', lang: 'yaml',
    code: `AWSTemplateFormatVersion: '2010-09-09'
Description: Document bucket for one environment

Parameters:
  Environment:
    Type: String
    AllowedValues: [dev, test, prod]

Resources:
  DocumentBucket:
    Type: AWS::S3::Bucket
    DeletionPolicy: Retain
    UpdateReplacePolicy: Retain
    Properties:
      BucketName: !Sub 'example-docs-\${Environment}-\${AWS::AccountId}'
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

Outputs:
  BucketArn:
    Value: !GetAtt DocumentBucket.Arn
    Export:
      Name: !Sub '\${Environment}-document-bucket-arn'`,
    notes: `<p><code>DeletionPolicy: Retain</code> means deleting the stack leaves the bucket and its data in place.</p>` },
  useCases: [`<b>Account baseline</b> (logging, roles, guardrails) through StackSets.`, `<b>Identical dev, test and production stacks</b> from one template.`, `<b>DR:</b> recreate the network and compute layer in a second Region.`],
  pricing: `<p>No charge for AWS resource types. You pay for what the stacks create. Third-party resource types and hooks are charged per operation.</p>`,
  pricingLink: 'https://aws.amazon.com/cloudformation/pricing/',
  alternatives: [`<b>AWS CDK:</b> real programming languages on top of CloudFormation.`, `<b>Terraform or OpenTofu:</b> multi-cloud, separate state.`, `<b>Pulumi.</b>`, `<b>AWS SAM:</b> serverless shorthand.`],
  mistakes: [`<b>Manual changes to stack-managed resources</b>, causing drift and failed updates.`, `<b>No DeletionPolicy on databases and buckets.</b>`, `<b>One giant stack</b> for everything.`, `<b>Secrets as plain parameters.</b>`, `<b>Applying updates without reading the change set</b>, then discovering a resource was replaced.`],
  exam: { saa: ['2.2'], sap: ['5.1'],
    scopeNote: 'The SAA-C03 exam guide lists AWS CDK as out of scope, and CloudFormation as in scope. SAP-C03 lists both.',
    trap: `<ul><li>"Deploy the same infrastructure to multiple accounts and Regions": StackSets.</li><li>"Preview the effect of a change": change set.</li><li>"Keep the database when the stack is deleted": DeletionPolicy Retain or Snapshot.</li><li>"Repeatable, consistent environments": infrastructure as code.</li></ul>`,
    proAdds: `<p>Infrastructure as code is a full task: StackSets with Organizations, pipeline-driven deployments, drift management, policy checks before deployment, and choosing between CloudFormation, CDK and third-party tools.</p>` },
  docs: [{ label: 'AWS CloudFormation User Guide', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html' }]
},
{
  id: 'systems-manager', name: 'AWS Systems Manager', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Systems Manager'],
  summary: 'A toolbox for operating servers at scale: remote access without SSH, patching, command execution, inventory and configuration storage.',
  what: `<p>Systems Manager manages EC2 instances, on-premises servers and other nodes through an agent. It is a collection of capabilities; a handful matter for architecture and exams.</p>`,
  problem: `<p>Logging in to servers one by one does not scale and leaves no audit trail. Opening SSH ports and distributing keys is a security risk.</p>`,
  how: `<ul>
<li><b>Managed nodes.</b> The SSM Agent (preinstalled on most AWS images) plus an instance role with <code>AmazonSSMManagedInstanceCore</code> and a network path to the Systems Manager endpoints. On-premises servers register through hybrid activations.</li>
<li><b>Session Manager.</b> Shell or port-forwarding access through the console or CLI with no inbound ports, no bastion host and no SSH keys. Access is controlled by IAM and every session can be logged.</li>
<li><b>Run Command.</b> Run scripts across fleets, targeted by tag, with rate and error controls.</li>
<li><b>Patch Manager.</b> Patch baselines, maintenance windows and compliance reporting.</li>
<li><b>Parameter Store.</b> Hierarchical configuration values and <i>SecureString</i> secrets encrypted with KMS. The standard tier is free. It has no built-in rotation.</li>
<li><b>Automation.</b> Runbooks for multi-step operations, used for AWS Config remediation and incident response.</li>
<li><b>State Manager</b> keeps configuration applied. <b>Inventory</b> collects installed software. <b>Fleet Manager</b> gives a console view. <b>OpsCenter</b> and <b>Incident Manager</b> track operational issues.</li>
</ul>`,
  features: [`<b>Session Manager.</b>`, `<b>Patch Manager.</b>`, `<b>Parameter Store.</b>`, `<b>Automation runbooks.</b>`, `<b>Hybrid and multi-cloud node management.</b>`, `<b>Just-in-time node access</b> with approvals.`],
  when: [`Administering EC2 without bastion hosts.`, `Patching fleets on a schedule.`, `Storing application configuration and low-cost secrets.`, `Automated remediation.`],
  whenNot: [`<b>Secrets needing rotation or cross-Region replication:</b> Secrets Manager.`, `<b>Container workloads on Fargate:</b> use ECS Exec (built on Session Manager) and rebuild images instead of patching.`, `<b>Provisioning infrastructure:</b> CloudFormation or Terraform.`],
  interactions: [`<b>EC2 and IAM:</b> instance roles.`, `<b>AWS Config:</b> remediation through Automation.`, `<b>CloudWatch and S3:</b> session and command logs.`, `<b>Inspector:</b> uses the agent for scanning.`, `<b>VPC interface endpoints:</b> private access for nodes with no internet route.`, `<b>KMS:</b> SecureString encryption.`],
  example: { title: 'Open a shell and forward a database port with no SSH (CLI)', lang: 'bash',
    code: `# Interactive shell on an instance in a private subnet
aws ssm start-session --target i-0123456789abcdef0

# Forward local port 5432 to an RDS endpoint through that instance
aws ssm start-session \\
  --target i-0123456789abcdef0 \\
  --document-name AWS-StartPortForwardingSessionToRemoteHost \\
  --parameters '{"host":["payments.abc123.ap-southeast-2.rds.amazonaws.com"],"portNumber":["5432"],"localPortNumber":["5432"]}'`,
    notes: `<p>The instance needs no public IP and no inbound security group rule. Who may start sessions on which instances is an IAM policy, and the session appears in CloudTrail.</p>` },
  useCases: [`<b>Replace bastion hosts</b> across all accounts.`, `<b>Monthly patching</b> with a compliance report for auditors.`, `<b>Feature flags and endpoints</b> in Parameter Store, read at start-up.`],
  pricing: `<p>Most capabilities are free for EC2: Session Manager, Run Command, Patch Manager, State Manager and standard parameters. Charges apply to advanced parameters, higher-throughput parameter API calls, Automation steps beyond a free tier, on-premises nodes in the advanced tier, and some operations features.</p>`,
  pricingLink: 'https://aws.amazon.com/systems-manager/pricing/',
  alternatives: [`<b>Secrets Manager</b> for secrets.`, `<b>EC2 Instance Connect:</b> short-lived SSH keys.`, `<b>Ansible, Chef, Puppet:</b> third-party configuration management.`, `<b>AWS AppConfig:</b> validated, gradually deployed application configuration.`],
  mistakes: [`<b>Instance missing the role or the network path</b>, so it never appears as managed.`, `<b>Keeping bastion hosts and open port 22</b> when Session Manager would do.`, `<b>Database passwords in plain String parameters.</b>`, `<b>Session logging off.</b>`],
  exam: { saa: ['1.2', '1.3'], sap: ['5.4', '2.3'],
    trap: `<ul><li>"Access instances without opening SSH or managing keys or bastions": Session Manager.</li><li>"Patch a fleet automatically": Patch Manager.</li><li>"Store configuration and secrets at the lowest cost, no rotation needed": Parameter Store.</li><li>"Automatically fix non-compliant resources": Config rule with Systems Manager Automation.</li></ul>`,
    proAdds: `<p>Operational automation across accounts, runbooks for incident response, and operations for hybrid fleets.</p>` },
  docs: [{ label: 'AWS Systems Manager User Guide', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html' }]
},
{
  id: 'control-tower', name: 'AWS Control Tower', category: 'management', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Control Tower'],
  summary: 'Sets up and governs a secure multi-account environment (a landing zone) using AWS best practices.',
  what: `<p>Control Tower automates the creation of a <i>landing zone</i>: an AWS Organization with a standard OU structure, central logging and audit accounts, single sign-on, and a library of guardrails called <i>controls</i>. It orchestrates Organizations, IAM Identity Center, CloudTrail, Config and CloudFormation for you.</p>`,
  problem: `<p>Building a well-governed multi-account setup by hand takes weeks and specialist knowledge, and every company would otherwise reinvent the same design.</p>`,
  how: `<ul>
<li><b>Landing zone.</b> A management account, a Security OU with a <i>log archive</i> account and an <i>audit</i> account, and OUs for workloads and sandboxes.</li>
<li><b>Controls.</b> <i>Preventive</i> (implemented as SCPs and RCPs), <i>detective</i> (AWS Config rules) and <i>proactive</i> (CloudFormation hooks that check resources before they are created). Each is mandatory, strongly recommended or elective.</li>
<li><b>Account Factory</b> provisions new accounts with the baseline applied. <i>Account Factory for Terraform</i> and <i>Customizations for Control Tower</i> add your own resources through pipelines.</li>
<li><b>Region deny control</b> restricts accounts to approved Regions, a common data-residency tool.</li>
<li><b>Dashboard</b> shows compliance of accounts and OUs against enabled controls.</li>
<li><b>Existing organisations</b> can be enrolled; you are not limited to new setups.</li>
</ul>`,
  features: [`<b>Automated landing zone.</b>`, `<b>Hundreds of ready-made controls</b> mapped to frameworks.`, `<b>Account Factory.</b>`, `<b>Central logging.</b>`, `<b>Drift detection</b> for landing zone resources.`],
  when: [`Starting or tidying a multi-account environment.`, `Fast, standard governance without a platform team writing everything.`, `Regulated environments that need demonstrable guardrails.`],
  whenNot: [`<b>A single account.</b>`, `<b>A highly customised organisation structure</b> you already manage with your own tooling and do not want reshaped.`],
  interactions: [`<b>Organizations:</b> accounts, OUs, SCPs.`, `<b>IAM Identity Center:</b> access.`, `<b>CloudTrail and Config:</b> logging and detective controls.`, `<b>CloudFormation StackSets and Service Catalog:</b> provisioning.`, `<b>Security Hub:</b> additional controls.`],
  useCases: [`<b>New fintech platform:</b> production, non-production and security accounts with region restrictions from day one.`, `<b>Self-service accounts</b> for teams through Account Factory.`],
  pricing: `<p>No charge for Control Tower. You pay for the services it enables, mainly AWS Config, CloudTrail and S3 storage in every enrolled account.</p>`,
  pricingLink: 'https://aws.amazon.com/controltower/pricing/',
  alternatives: [`<b>AWS Organizations with your own Terraform or CloudFormation:</b> full flexibility, more work.`, `<b>Landing Zone Accelerator on AWS:</b> an AWS solution for highly regulated sectors.`],
  mistakes: [`<b>Changing Control Tower-managed resources by hand</b>, causing drift.`, `<b>Enabling it and never reviewing which elective controls matter.</b>`, `<b>Workloads in the management account.</b>`],
  exam: { saa: ['1.1'], sap: ['2.3'],
    trap: `<ul><li>"Set up a secure, multi-account environment quickly using best practices": Control Tower.</li><li>Preventive guardrail: SCP. Detective guardrail: Config rule.</li><li>"Provision new accounts in a standard way": Account Factory.</li></ul>`,
    proAdds: `<p>Landing zone design, account vending with customisations, control strategy across OUs, and extending governance to existing organisations.</p>` },
  docs: [{ label: 'AWS Control Tower User Guide', url: 'https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html' }]
}
);

/* ===== Phase 6: Tier 3 catalogue cards =====
   Row format: [id, name, summary, reach-for-it-when, product page slug or full URL, options]
   options: { s: status, n: status note, scope: [official names], alt: consider instead } */
function T3(category, rows, mgmt) {
  rows.forEach(r => {
    const o = r[5] || {};
    SERVICES.push({
      id: r[0], name: r[1], category, tier: 3, mgmt: mgmt || 'aws', status: o.s || 'current', statusNote: o.n,
      scopeNames: o.scope || [r[1]], summary: r[2],
      when: [r[3]], whenNot: o.alt ? ['<b>Consider instead:</b> ' + o.alt] : undefined,
      exam: { saa: [], sap: [] },
      docs: r[4] ? [{ label: r[1] + ' product page', url: r[4].startsWith('http') ? r[4] : 'https://aws.amazon.com/' + r[4] + '/' }] : []
    });
  });
}
const V = ' [[verify]]';

T3('compute', [
  ['lightsail', 'Amazon Lightsail', 'Simple virtual servers, containers, databases and storage at fixed monthly prices.', 'A small website, blog or test server for someone who does not want to learn VPCs and IAM.', 'lightsail', { alt: 'EC2, App Runner or Amplify Hosting once the workload grows.' }],
  ['app-runner', 'AWS App Runner', 'Runs a web application or API straight from source code or a container image, with HTTPS, scaling and load balancing included.', 'One containerised web service that should be online in minutes with nothing to configure.', 'apprunner', { alt: 'ECS on Fargate for more control over networking and deployment.' }],
  ['image-builder', 'EC2 Image Builder', 'Automates building, testing and distributing golden AMIs and container images.', 'You want patched base images produced on a schedule and shared across accounts.', 'image-builder'],
  ['sar', 'AWS Serverless Application Repository', 'A catalogue of prebuilt serverless applications packaged with AWS SAM.', 'Deploying a published Lambda-based utility, or sharing your own inside an organisation.', 'serverless/serverlessrepo', { scope: ['AWS Serverless Application Repository'] }],
  ['evs', 'Amazon Elastic VMware Service', 'Runs VMware Cloud Foundation inside your own VPC. It follows the earlier "VMware Cloud on AWS" offering, now sold by Broadcom.', 'Moving a VMware estate to AWS without converting virtual machines.', 'evs', { scope: ['VMware Cloud on AWS'], n: 'the SAA-C03 guide still lists "VMware Cloud on AWS"' + V, alt: 'Application Migration Service to convert VMs to EC2.' }],
  ['pcs', 'AWS Parallel Computing Service', 'Managed high-performance computing clusters using the Slurm scheduler.', 'Scientific and engineering simulations run by teams already using Slurm.', 'pcs', { alt: 'AWS Batch for container-based batch work.' }],
  ['nitro-enclaves', 'AWS Nitro Enclaves', 'Isolated compute environments carved out of an EC2 instance with no network, no storage and no operator access.', 'Processing highly sensitive data (card numbers, private keys) so that even administrators cannot see it.', 'ec2/nitro/nitro-enclaves'],
  ['sam', 'AWS Serverless Application Model (SAM)', 'A shorthand template syntax and CLI for building, testing and deploying serverless applications on CloudFormation.', 'Lambda and API Gateway projects that want local testing and concise templates.', 'serverless/sam'],
  ['simspace', 'AWS SimSpace Weaver', 'Large-scale spatial simulations across many EC2 instances.', 'Crowd, city or traffic simulations.', 'simspaceweaver', { s: 'legacy', n: 'AWS has announced the end of support' + V }]
]);

T3('containers', [
  ['rosa', 'Red Hat OpenShift Service on AWS (ROSA)', 'Managed OpenShift clusters, jointly supported by Red Hat and AWS.', 'The organisation has standardised on OpenShift.', 'rosa', { alt: 'Amazon EKS for upstream Kubernetes.' }],
  ['app2container', 'AWS App2Container', 'A command-line tool that packages existing Java and .NET applications into containers.', 'Containerising legacy applications during a migration.', 'app2container'],
  ['ecs-anywhere', 'Amazon ECS Anywhere', 'Registers your own servers with an ECS cluster so the cloud control plane schedules containers on premises.', 'Running a few containers in a data centre with the same tooling as the cloud.', 'ecs/anywhere', { scope: ['Amazon ECS Anywhere'] }]
]);

T3('storage', [
  ['file-cache', 'Amazon File Cache', 'A high-speed cache in AWS in front of file data stored on premises or in S3.', 'Cloud compute jobs that need fast temporary access to data that lives elsewhere.', 'filecache'],
  ['s3-outposts', 'Amazon S3 on Outposts', 'S3 object storage running on an Outpost in your own facility.', 'Object data that must stay on premises for residency or latency.', 's3/outposts'],
  ['backup-gateway', 'AWS Backup Gateway', 'Connects AWS Backup to VMware and Hyper-V virtual machines on premises.', 'Backing up on-premises VMs with the same policies as cloud resources.', 'backup']
]);

T3('database', [
  ['aurora-dsql', 'Amazon Aurora DSQL', 'A serverless, distributed SQL database with PostgreSQL compatibility and active-active multi-Region writes.', 'New applications that need relational transactions with multi-Region availability and no capacity management.', 'rds/aurora/dsql', { alt: 'Aurora or RDS when you need full PostgreSQL features.' }],
  ['qldb', 'Amazon QLDB', 'A ledger database with an immutable, cryptographically verifiable journal.', 'Nothing new: AWS ended support in 2025.', 'qldb', { s: 'avoid', n: 'retired July 2025' + V, alt: 'Aurora PostgreSQL with audit tables, or S3 Object Lock for immutable records.' }],
  ['oracle-at-aws', 'Oracle Database@AWS', 'Oracle Exadata and Autonomous Database running on Oracle-managed infrastructure inside AWS data centres.', 'Oracle workloads that need Exadata or RAC next to AWS applications.', 'marketplace/featured-seller/oracle'],
  ['dax', 'Amazon DynamoDB Accelerator (DAX)', 'An in-memory cache for DynamoDB that returns reads in microseconds with no application caching logic.', 'Read-heavy DynamoDB tables where milliseconds are too slow.', 'dynamodbaccelerator'],
  ['rds-proxy', 'Amazon RDS Proxy', 'A managed connection pool in front of RDS and Aurora.', 'Lambda or many small services opening more connections than the database can hold.', 'rds/proxy']
]);

T3('networking', [
  ['cloud-map', 'AWS Cloud Map', 'A registry where services record their locations so others can find them by name through DNS or an API.', 'Service discovery for ECS services and custom resources.', 'cloud-map', { scope: ['AWS Cloud Map'] }],
  ['app-mesh', 'AWS App Mesh', 'A service mesh based on Envoy proxies.', 'Nothing new: AWS is ending support in September 2026.', 'app-mesh', { s: 'avoid', n: 'end of support 30 September 2026' + V, alt: 'ECS Service Connect or VPC Lattice.' }],
  ['arc', 'Amazon Application Recovery Controller', 'Routing controls, readiness checks and zonal shift to move traffic away from an unhealthy zone or Region.', 'Deliberate, tested failover for multi-AZ and multi-Region applications.', 'application-recovery-controller'],
  ['ipam', 'Amazon VPC IP Address Manager (IPAM)', 'Plans, allocates and audits IP address space across accounts and Regions.', 'More than a few VPCs, to stop overlapping CIDR ranges.', 'vpc/ipam'],
  ['network-manager', 'AWS Network Manager and Reachability Analyzer', 'A global view of your network, plus tools that check whether a path between two resources is open and why not.', 'Troubleshooting connectivity across transit gateways, and proving no unintended internet path exists.', 'transit-gateway/network-manager'],
  ['private-5g', 'AWS Private 5G', 'Managed private cellular networks.', 'Nothing new: the service has been discontinued.', 'private5g', { s: 'avoid', n: 'discontinued in 2025' + V }]
]);

T3('security', [
  ['access-analyzer', 'IAM Access Analyzer', 'Finds resources shared outside your account or organisation, flags unused permissions, and validates policies before deployment.', 'Every account: it is how you prove nothing is unintentionally public.', 'iam/access-analyzer'],
  ['private-ca', 'AWS Private Certificate Authority', 'A managed private certificate authority for internal TLS, devices and mutual TLS.', 'Service-to-service encryption and client certificates inside your organisation.', 'private-ca'],
  ['payment-cryptography', 'AWS Payment Cryptography', 'Managed HSM-backed cryptographic operations for card payments: PIN translation, CVV generation, key exchange.', 'Payment processors and issuers replacing dedicated payment HSMs.', 'payment-cryptography'],
  ['signer', 'AWS Signer', 'Code signing for Lambda packages and container images.', 'Enforcing that only signed code can be deployed.', 'signer'],
  ['security-incident-response', 'AWS Security Incident Response', 'A service that triages findings and gives access to AWS incident responders.', 'Organisations wanting AWS-backed help during a security incident.', 'security-incident-response'],
  ['audit-manager', 'AWS Audit Manager', 'Continuously collects evidence from your accounts and maps it to compliance frameworks.', 'Preparing for PCI DSS, ISO 27001 or SOC 2 audits.', 'audit-manager'],
  ['roles-anywhere', 'IAM Roles Anywhere', 'Lets servers outside AWS obtain temporary IAM credentials using X.509 certificates.', 'On-premises workloads calling AWS APIs without long-lived access keys.', 'iam/roles-anywhere']
]);

T3('management', [
  ['appconfig', 'AWS AppConfig', 'Deploys application configuration and feature flags gradually, with validation and automatic rollback.', 'Changing behaviour in production without a code deployment.', 'systems-manager/features/appconfig'],
  ['trusted-advisor', 'AWS Trusted Advisor', 'Checks accounts against best practices for cost, security, fault tolerance, performance and service limits.', 'A quick review of a new or inherited account.', 'premiumsupport/technology/trusted-advisor'],
  ['cloudshell', 'AWS CloudShell', 'A browser-based shell with the AWS CLI preinstalled and your console credentials.', 'Running a few CLI commands without setting up a workstation.', 'cloudshell', { scope: ['AWS CloudShell'] }],
  ['cli-console', 'AWS CLI and AWS Management Console', 'The command-line tool and the web interface for working with AWS.', 'Everyday administration and scripting.', 'cli', { scope: ['AWS CLI', 'AWS Management Console'] }],
  ['resource-explorer', 'AWS Resource Explorer and Resource Groups', 'Searches for resources across Regions and accounts, and groups them by tag.', 'Finding "that bucket" or applying an action to everything with a tag.', 'resourceexplorer'],
  ['incident-manager', 'AWS Systems Manager Incident Manager', 'Response plans, on-call schedules, escalation and runbooks for incidents.', 'Teams without a dedicated incident tool.', 'systems-manager/features/incident-manager'],
  ['q-chat', 'Amazon Q Developer in chat applications', 'Sends alarms and events to Slack or Microsoft Teams and runs commands from chat. Formerly AWS Chatbot.', 'Operational notifications where the team already talks.', 'chatbot'],
  ['launch-wizard', 'AWS Launch Wizard', 'Guided, best-practice deployment of enterprise software such as SAP and SQL Server.', 'Standing up a supported commercial application quickly.', 'launchwizard'],
  ['ams', 'AWS Managed Services', 'AWS operates your infrastructure for you: patching, monitoring, incident handling.', 'Enterprises without a cloud operations team.', 'managed-services'],
  ['support', 'AWS Support plans', 'Paid tiers of technical support, from Developer to Enterprise.', 'Production workloads need at least Business support for timely help and full Trusted Advisor checks.', 'premiumsupport/plans'],
  ['user-notifications', 'AWS User Notifications', 'Central configuration of notifications from AWS services to email, chat and the console.', 'One place to manage who is told about what.', 'notifications']
]);

T3('devtools', [
  ['codeartifact', 'AWS CodeArtifact', 'Private package repositories for Maven, Gradle, npm, pip, NuGet and others.', 'Controlling and caching the dependencies your builds use.', 'codeartifact', { scope: ['AWS CodeArtifact'] }],
  ['q-developer', 'Amazon Q Developer and Kiro', 'AI coding assistants: Q Developer in the IDE, CLI and console; Kiro as an agentic development environment.', 'Code generation, explanation, upgrades and AWS troubleshooting.', 'q/developer'],
  ['cloud9', 'AWS Cloud9', 'A browser-based IDE on an EC2 instance.', 'Nothing new: closed to new customers.', 'cloud9', { s: 'legacy', n: 'closed to new customers since 2024' + V, alt: 'A local IDE with the AWS Toolkit, or CloudShell.' }],
  ['codecatalyst', 'Amazon CodeCatalyst', 'A unified software development service with repositories, issues and workflows.', 'Existing users only.', 'codecatalyst', { s: 'legacy', n: 'closed to new customers' + V, alt: 'GitHub or GitLab with CodePipeline.' }],
  ['infrastructure-composer', 'AWS Infrastructure Composer', 'A visual canvas for designing CloudFormation and SAM templates.', 'Sketching a serverless architecture and generating the template.', 'infrastructure-composer'],
  ['sdks', 'AWS SDKs and Tools', 'Libraries for calling AWS from Kotlin, Java, Python, JavaScript, Go, .NET, Rust and more.', 'Any application code that talks to AWS.', 'developer/tools', { scope: ['AWS Tools and SDKs'] }],
  ['corretto', 'Amazon Corretto', 'A free, production-ready distribution of OpenJDK with long-term support.', 'Running Java or Kotlin services, including Spring Boot, on AWS.', 'corretto', { scope: ['Amazon Corretto'] }]
]);

T3('integration', [
  ['mwaa', 'Amazon Managed Workflows for Apache Airflow (MWAA)', 'Managed Apache Airflow for scheduling data pipelines written as Python DAGs.', 'Teams already using Airflow.', 'managed-workflows-for-apache-airflow', { scope: ['Amazon Managed Workflows for Apache Airflow (Amazon MWAA)'], alt: 'Step Functions for AWS-native orchestration.' }],
  ['swf', 'Amazon Simple Workflow Service (SWF)', 'An older workflow coordination service.', 'Existing applications only.', 'swf', { s: 'legacy', alt: 'AWS Step Functions.' }],
  ['b2bi', 'AWS B2B Data Interchange', 'Translates EDI documents (X12 and others) to and from JSON and XML.', 'Trading partners that exchange EDI files.', 'b2b-data-interchange'],
  ['appsync', 'AWS AppSync', 'Managed GraphQL and real-time publish/subscribe APIs.', 'Mobile and web apps needing flexible queries and live updates.', 'appsync']
]);

T3('analytics', [
  ['flink', 'Amazon Managed Service for Apache Flink', 'Runs Apache Flink applications for stateful stream processing.', 'Windowed aggregations, joins and anomaly detection on streams in real time.', 'managed-service-apache-flink'],
  ['data-exchange', 'AWS Data Exchange', 'A marketplace for subscribing to third-party data sets and APIs.', 'Buying market, weather, financial or demographic data delivered into S3 or Redshift.', 'data-exchange', { scope: ['AWS Data Exchange'] }],
  ['clean-rooms', 'AWS Clean Rooms', 'Lets several companies analyse their combined data without revealing the underlying records to each other.', 'Joint analysis with a partner where raw data cannot be shared.', 'clean-rooms', { scope: ['AWS Clean Rooms'] }],
  ['data-pipeline', 'AWS Data Pipeline', 'An older service for scheduled data movement.', 'Nothing new, though the SAA-C03 guide still lists it.', 'datapipeline', { s: 'avoid', n: 'closed to new customers in 2024' + V, scope: ['AWS Data Pipeline'], alt: 'Glue, Step Functions or MWAA.' }],
  ['datazone', 'Amazon DataZone and SageMaker Catalog', 'A data catalogue and governance portal where teams publish, discover and request access to data.', 'A data mesh with many producing and consuming teams.', 'datazone'],
  ['entity-resolution', 'AWS Entity Resolution', 'Matches and links related records across data sets.', 'Building a single customer view from several systems.', 'entity-resolution'],
  ['sagemaker-unified', 'Amazon SageMaker Unified Studio and Lakehouse', 'One workspace for SQL analytics, data processing and machine learning over a unified S3 and Redshift lakehouse.', 'Teams wanting a single environment across analytics and ML.', 'sagemaker'],
  ['cloudsearch', 'Amazon CloudSearch', 'An older managed search service.', 'Existing users only.', 'cloudsearch', { s: 'legacy', n: 'closed to new customers' + V, alt: 'Amazon OpenSearch Service.' }]
]);

T3('ai', [
  ['q-business', 'Amazon Q Business', 'A managed assistant that answers questions and takes actions over company documents and systems, respecting existing permissions.', 'An employee assistant without building a RAG application.', 'q/business'],
  ['nova', 'Amazon Nova', 'Amazon\'s own family of foundation models for text, images, video and speech, available through Bedrock.', 'A cost-effective default model family on Bedrock.', 'ai/generative-ai/nova'],
  ['comprehend', 'Amazon Comprehend', 'Natural-language processing: entities, key phrases, sentiment, language and personal data detection.', 'Classifying or redacting text at scale.', 'comprehend', { scope: ['Amazon Comprehend'] }],
  ['textract', 'Amazon Textract', 'Extracts text, forms and tables from scanned documents and images.', 'Processing invoices, identity documents and application forms.', 'textract', { scope: ['Amazon Textract'] }],
  ['rekognition', 'Amazon Rekognition', 'Image and video analysis: objects, faces, text, unsafe content.', 'Content moderation, identity verification with face comparison.', 'rekognition', { scope: ['Amazon Rekognition'] }],
  ['transcribe', 'Amazon Transcribe', 'Speech to text, with speaker identification and redaction.', 'Call recordings, subtitles and voice notes.', 'transcribe', { scope: ['Amazon Transcribe'] }],
  ['polly', 'Amazon Polly', 'Text to lifelike speech.', 'Voice responses and accessibility features.', 'polly', { scope: ['Amazon Polly'] }],
  ['translate', 'Amazon Translate', 'Neural machine translation between languages.', 'Localising content and user messages.', 'translate', { scope: ['Amazon Translate'] }],
  ['lex', 'Amazon Lex', 'Builds voice and text chatbots with intent recognition.', 'Contact-centre bots and guided conversational flows.', 'lex', { scope: ['Amazon Lex'] }],
  ['kendra', 'Amazon Kendra', 'Managed enterprise search with natural-language understanding and many connectors.', 'Search across document repositories; a retriever for RAG.', 'kendra'],
  ['personalize', 'Amazon Personalize', 'Real-time recommendations trained on your interaction data.', 'Product or content recommendations.', 'personalize', { scope: ['Amazon Personalize'] }],
  ['fraud-detector', 'Amazon Fraud Detector', 'Machine-learning models for online fraud.', 'Existing users only.', 'fraud-detector', { s: 'legacy', n: 'closed to new customers in late 2025' + V, alt: 'SageMaker AI models or a third-party fraud service.' }],
  ['forecast', 'Amazon Forecast', 'Time-series forecasting.', 'Existing users only.', 'forecast', { s: 'legacy', n: 'closed to new customers in 2024' + V, alt: 'SageMaker Canvas or SageMaker AI.' }],
  ['healthlake', 'AWS HealthLake, Comprehend Medical and Transcribe Medical', 'Health-specific data store and language services.', 'Healthcare workloads.', 'healthlake', { scope: ['Amazon HealthLake', 'Amazon Comprehend Medical', 'Amazon Transcribe Medical'] }],
  ['a2i', 'Amazon Augmented AI (A2I)', 'Adds human review steps to machine-learning predictions.', 'Low-confidence document extractions that a person should check.', 'augmented-ai'],
  ['dl-frameworks', 'AWS Deep Learning AMIs and Containers', 'Prebuilt machine images and containers with PyTorch, TensorFlow and GPU drivers.', 'Running your own training or inference on EC2, ECS or EKS.', 'machine-learning/amis', { scope: ['AWS Deep Learning AMIs (DLAMI)', 'AWS Deep Learning Containers', 'PyTorch on AWS', 'TensorFlow on AWS', 'Apache MXNet on AWS', 'AWS Inferentia'] }],
  ['deepracer', 'AWS DeepRacer and DeepComposer', 'Learning tools for reinforcement learning and generative music.', 'Education only; both are being wound down.', 'deepracer', { s: 'legacy', scope: ['AWS DeepRacer', 'AWS DeepComposer'] }]
]);

T3('migration', [
  ['mainframe', 'AWS Mainframe Modernization', 'Tools and a managed runtime to refactor or replatform mainframe applications. Now largely delivered through AWS Transform for mainframe.', 'COBOL and PL/I estates moving to AWS.', 'mainframe-modernization'],
  ['migration-hub', 'AWS Migration Hub', 'A single place to track discovery and migration status across tools.', 'Reporting progress on a migration programme.', 'migration-hub', { n: 'being folded into AWS Transform' + V }]
]);

T3('cost', [
  ['pricing-calculator', 'AWS Pricing Calculator', 'Estimates the monthly cost of an architecture before you build it.', 'Every design proposal and business case.', 'https://calculator.aws/'],
  ['billing-conductor', 'AWS Billing Conductor', 'Produces customised, pro forma bills with your own rates for internal showback or reselling.', 'Organisations that charge business units or customers at different rates.', 'aws-cost-management/aws-billing-conductor'],
  ['marketplace', 'AWS Marketplace', 'A catalogue for buying third-party software, data and services through your AWS bill.', 'Procuring commercial software with consolidated billing and private offers.', 'marketplace'],
  ['cost-optimization-hub', 'Cost Optimization Hub', 'Gathers savings recommendations (rightsizing, idle resources, commitments, Graviton) across an organisation into one list.', 'A monthly cost review with estimated savings per action.', 'aws-cost-management/cost-optimization-hub']
]);

T3('frontend', [
  ['amplify', 'AWS Amplify', 'Hosting for web apps with Git-based deployments, plus libraries and a code-first backend (auth, data, storage) for web and mobile, including Flutter.', 'Front-end developers shipping a full-stack app without assembling the services by hand.', 'amplify', { scope: ['AWS Amplify'] }],
  ['device-farm', 'AWS Device Farm', 'Tests mobile and web apps on real phones, tablets and browsers in the AWS cloud.', 'Automated testing of an Android or iOS build across many devices.', 'device-farm', { scope: ['AWS Device Farm'] }],
  ['location', 'Amazon Location Service', 'Maps, geocoding, routing, tracking and geofencing.', 'Adding maps or delivery tracking to an application.', 'location', { scope: ['Amazon Location Service'] }],
  ['ses', 'Amazon Simple Email Service (SES)', 'Sends transactional and marketing email at scale, and receives mail.', 'Receipts, password resets and notifications from your application.', 'ses'],
  ['end-user-messaging', 'AWS End User Messaging', 'SMS, voice, WhatsApp and push messaging APIs. Takes over the channels of Amazon Pinpoint, which reaches end of support in October 2026.', 'One-time passwords and alerts by SMS or push.', 'end-user-messaging', { n: 'Pinpoint end of support 30 October 2026' + V }]
]);

T3('euc', [
  ['workspaces', 'Amazon WorkSpaces', 'Managed virtual desktops (Windows or Linux) for employees.', 'Remote staff or contractors who need a controlled desktop.', 'workspaces'],
  ['workspaces-apps', 'Amazon WorkSpaces Applications (formerly AppStream 2.0)', 'Streams individual desktop applications to a browser.', 'Delivering a heavy or licensed Windows application without installing it.', 'workspaces/applications', { n: 'renamed from AppStream 2.0 in 2025' + V }],
  ['workspaces-browser', 'Amazon WorkSpaces Secure Browser', 'A locked-down browser session for reaching internal websites and SaaS.', 'Giving access to web applications from unmanaged devices.', 'workspaces/secure-browser']
]);

T3('business', [
  ['connect', 'Amazon Connect', 'A cloud contact centre with voice, chat, routing, analytics and AI assistance.', 'Customer service operations of any size, paid per use.', 'connect'],
  ['chime-sdk', 'Amazon Chime SDK', 'Building blocks for adding audio, video and messaging to your own applications.', 'In-app video calls, such as telehealth or remote advice.', 'chime/chime-sdk'],
  ['workmail', 'Amazon WorkMail', 'Managed business email and calendars.', 'Existing users only.', 'workmail', { s: 'legacy', n: 'AWS has announced end of support' + V }],
  ['wickr', 'AWS Wickr', 'End-to-end encrypted messaging and file sharing with retention controls.', 'Sensitive internal communication that must still be archived for compliance.', 'wickr'],
  ['appfabric', 'AWS AppFabric', 'Connects SaaS applications to normalise their audit logs for security tools.', 'Monitoring user activity across many SaaS products.', 'appfabric'],
  ['supply-chain', 'AWS Supply Chain', 'A managed application for supply chain visibility and planning.', 'Retail and manufacturing planning teams.', 'aws-supply-chain']
]);

T3('iot', [
  ['iot-core', 'AWS IoT Core', 'Connects devices to AWS over MQTT, HTTPS and LoRaWAN, with a rules engine that routes messages to other services.', 'Any fleet of connected devices sending telemetry.', 'iot-core', { scope: ['All Internet of Things services'] }],
  ['greengrass', 'AWS IoT Greengrass', 'Runs Lambda functions, containers and ML inference on edge devices, even when offline.', 'Local processing at a factory or shop before data goes to the cloud.', 'greengrass', { scope: ['All Internet of Things services'] }],
  ['iot-device', 'AWS IoT Device Management and Device Defender', 'Onboards, organises, updates and audits fleets of devices.', 'Over-the-air updates and security monitoring for devices in the field.', 'iot-device-management', { scope: ['All Internet of Things services'] }],
  ['sitewise', 'AWS IoT SiteWise and TwinMaker', 'Collects and models industrial equipment data, and builds digital twins.', 'Factory monitoring and predictive maintenance.', 'iot-sitewise', { scope: ['All Internet of Things services'] }],
  ['freertos', 'FreeRTOS', 'An open-source real-time operating system for microcontrollers.', 'Low-power embedded devices.', 'freertos', { scope: ['All Internet of Things services'] }]
]);

T3('media', [
  ['mediaconvert', 'AWS Elemental MediaConvert', 'File-based video transcoding for broadcast and streaming formats. It replaced Amazon Elastic Transcoder.', 'Converting uploaded video into adaptive streaming formats.', 'mediaconvert', { scope: ['AWS Elemental MediaConvert'] }],
  ['medialive', 'AWS Elemental MediaLive, MediaPackage, MediaConnect and MediaTailor', 'Live video encoding, packaging, transport and ad insertion.', 'Live streaming channels and events.', 'medialive', { scope: ['AWS Elemental MediaLive', 'AWS Elemental MediaPackage', 'AWS Elemental MediaConnect', 'AWS Elemental MediaTailor', 'AWS Elemental Appliances and Software'] }],
  ['ivs', 'Amazon Interactive Video Service (IVS)', 'Managed low-latency live streaming with chat.', 'Adding live video to an app with little video expertise.', 'ivs', { scope: ['Amazon Interactive Video Service (Amazon IVS)'] }],
  ['kvs', 'Amazon Kinesis Video Streams', 'Ingests and stores video from cameras and devices for playback and analysis; supports WebRTC.', 'Security cameras, video doorbells, machine-vision pipelines.', 'kinesis/video-streams', { scope: ['Amazon Kinesis Video Streams'] }],
  ['deadline', 'AWS Deadline Cloud', 'Managed render farm for visual effects and animation.', 'Studios rendering frames at scale.', 'deadline-cloud'],
  ['elastic-transcoder', 'Amazon Elastic Transcoder', 'An older media transcoding service.', 'Nothing: it was retired in November 2025 and removed from the SAA-C03 guide.', 'elastictranscoder', { s: 'avoid', n: 'retired 13 November 2025' + V, alt: 'AWS Elemental MediaConvert.' }]
]);

T3('other', [
  ['gamelift', 'Amazon GameLift Servers and Streams', 'Hosting for multiplayer game servers, and streaming of games to any device.', 'Session-based multiplayer games.', 'gamelift', { scope: ['Amazon GameLift'] }],
  ['managed-blockchain', 'Amazon Managed Blockchain', 'Managed blockchain nodes and networks (Hyperledger Fabric, Ethereum, Bitcoin) and query APIs.', 'Applications that must read or write public or consortium blockchains.', 'managed-blockchain', { scope: ['Amazon Managed Blockchain (AMB)'] }],
  ['braket', 'Amazon Braket', 'Access to quantum computers and simulators for research.', 'Experimenting with quantum algorithms.', 'braket', { scope: ['Amazon Braket'] }],
  ['ground-station', 'AWS Ground Station', 'Rents time on satellite ground antennas to downlink data into AWS.', 'Earth-observation and satellite operators.', 'ground-station', { scope: ['AWS Ground Station'] }],
  ['robomaker', 'AWS RoboMaker', 'Robotics simulation.', 'Nothing new: the service ended in 2025.', 'robomaker', { s: 'avoid', n: 'end of support September 2025' + V, alt: 'AWS Batch for simulation workloads.' }]
]);

T3('thirdparty', [
  ['terraform', 'Terraform and OpenTofu', 'Infrastructure as code with a declarative language, a state file and providers for AWS and hundreds of other platforms.', 'The most common IaC choice in New Zealand job ads; use it when teams work across clouds or prefer its module ecosystem.', '', { alt: 'CloudFormation or CDK when you want AWS-native tooling with no state to manage.' }],
  ['kubernetes-tools', 'Helm, Argo CD and Flux', 'Helm packages Kubernetes applications; Argo CD and Flux deploy them by syncing clusters to Git (GitOps).', 'Any EKS platform beyond a handful of manifests.', ''],
  ['docker', 'Docker and container build tools', 'Builds and runs container images. Images built with Docker, Buildah or Jib run on ECS, EKS, Lambda and App Runner.', 'Packaging a Spring Boot service for any AWS container platform.', ''],
  ['github-actions', 'GitHub Actions and GitLab CI', 'CI/CD pipelines hosted with your source code, assuming AWS roles through OIDC federation.', 'Teams whose code already lives in GitHub or GitLab.', '', { alt: 'CodePipeline and CodeBuild to keep CI/CD inside AWS.' }],
  ['datadog', 'Datadog, New Relic, Dynatrace and Grafana Cloud', 'Commercial observability platforms that ingest metrics, logs and traces from AWS.', 'Organisations wanting one monitoring tool across clouds and richer application performance features.', '', { alt: 'CloudWatch, Managed Prometheus and Managed Grafana.' }],
  ['splunk', 'Splunk, Microsoft Sentinel and other SIEMs', 'Security information and event management platforms that correlate logs and raise alerts.', 'Security operations centres; feed them from Security Lake or CloudTrail.', ''],
  ['vault', 'HashiCorp Vault', 'A secrets manager and encryption service that works across clouds and data centres.', 'Multi-cloud secret management or dynamic database credentials outside AWS.', '', { alt: 'AWS Secrets Manager and KMS.' }],
  ['idp', 'Okta, Microsoft Entra ID and Auth0', 'Identity providers for workforce single sign-on (Okta, Entra ID) and customer identity (Auth0).', 'Workforce sign-in federated into IAM Identity Center; customer sign-in with richer features than Cognito.', ''],
  ['snowflake', 'Snowflake and Databricks', 'Third-party data warehouse and lakehouse platforms that run on AWS.', 'Organisations standardised on them; they store data in S3 and integrate with IAM and PrivateLink.', '', { alt: 'Redshift, Athena, EMR and SageMaker.' }],
  ['mongodb-atlas', 'MongoDB Atlas, Confluent Cloud and Elastic Cloud', 'Vendor-run managed MongoDB, Kafka and Elasticsearch on AWS.', 'You need the vendor\'s full feature set and support.', '', { alt: 'DocumentDB, MSK and OpenSearch Service.' }],
  ['jenkins', 'Jenkins', 'A self-hosted automation server for CI/CD.', 'Existing pipelines; rarely the choice for new work.', '', { s: 'legacy' }],
  ['ansible', 'Ansible, Chef and Puppet', 'Configuration management tools that install and configure software on servers.', 'Fleets of long-lived servers, often alongside Systems Manager.', ''],
  ['pagerduty', 'PagerDuty and Opsgenie', 'On-call scheduling and incident alerting.', 'Routing CloudWatch alarms to the engineer on call.', ''],
  ['cloudflare', 'Cloudflare, Akamai and Fastly', 'Third-party CDNs and edge security networks.', 'Organisations with an existing edge provider in front of AWS origins.', '', { alt: 'CloudFront, WAF and Shield.' }],
  ['wiz', 'Wiz, Prisma Cloud and other CNAPP tools', 'Third-party cloud security platforms that scan configurations, workloads and identities across clouds.', 'Security teams wanting one posture view across AWS, Azure and Google Cloud.', '', { alt: 'Security Hub, Inspector and GuardDuty.' }]
], 'third');

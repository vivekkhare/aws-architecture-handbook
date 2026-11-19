/* ===== Phase 4, batch H: AI, remaining security, developer tools, compute, integration, governance ===== */
SERVICES.push(
{
  id: 'bedrock', name: 'Amazon Bedrock', category: 'ai', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Bedrock'],
  summary: 'Managed access to foundation models through one API, with tools for retrieval, agents and safety controls.',
  what: `<p>Amazon Bedrock offers large language and other foundation models from Amazon and other providers (Anthropic, Meta, Mistral and more) as a serverless API. Your prompts and outputs are not used to train the base models and stay within your AWS account's control. Around the models it supplies building blocks for production applications: knowledge bases, agents, guardrails, evaluation and prompt management.</p>`,
  problem: `<p>Hosting models yourself needs GPUs, scaling and specialist operations. Most teams want to add generative AI to an application with the same security, networking and governance as any other AWS service.</p>`,
  how: `<ul>
<li><b>Inference.</b> The <code>Converse</code> and <code>InvokeModel</code> APIs. <i>On-demand</i> pricing per token; <i>batch inference</i> at a discount for offline jobs; <i>provisioned throughput</i> for guaranteed capacity; <i>cross-Region inference profiles</i> route requests across Regions for capacity (check the profile's geography against data-residency rules).</li>
<li><b>Knowledge Bases</b> implement retrieval-augmented generation (RAG): documents from S3 and other sources are chunked, embedded and stored in a vector store (OpenSearch Serverless, Aurora PostgreSQL, S3 Vectors and others), then retrieved at query time so answers are grounded in your data.</li>
<li><b>Guardrails</b> filter harmful content, block denied topics, redact personal data, detect prompt attacks and check answers against sources. They apply to any model and can be enforced through IAM.</li>
<li><b>Agents and AgentCore.</b> Agents let a model plan steps and call your APIs. <i>Amazon Bedrock AgentCore</i> is a set of services for running agents built with any framework: a serverless runtime with session isolation, memory, a gateway that exposes APIs and Lambda functions as tools, identity for agent-to-service authentication, and observability.</li>
<li><b>Customisation.</b> Fine-tuning, distillation and imported custom models.</li>
<li><b>Cost and latency tools.</b> Prompt caching, intelligent prompt routing between models, and model choice.</li>
<li><b>Security.</b> IAM permissions per model, PrivateLink endpoints, KMS encryption, CloudTrail logging and optional model invocation logging to S3 or CloudWatch.</li>
</ul>`,
  features: [`<b>Many models behind one API.</b>`, `<b>Knowledge Bases (managed RAG).</b>`, `<b>Guardrails.</b>`, `<b>AgentCore</b> for production agents.`, `<b>Model evaluation.</b>`, `<b>Batch inference and prompt caching.</b>`],
  when: [`Adding chat, summarisation, extraction, classification or code generation to an application.`, `Question answering over company documents (RAG).`, `Agents that complete multi-step tasks with tools.`, `Regulated environments needing private connectivity and audit.`],
  whenNot: [`<b>Training your own models from scratch or full control of serving infrastructure:</b> SageMaker AI.`, `<b>A narrow task with a ready-made API</b> (OCR, speech-to-text, translation): Textract, Transcribe, Translate.`, `<b>An out-of-the-box employee assistant:</b> Amazon Q Business or Amazon Quick.`, `<b>Deterministic calculations and rules:</b> ordinary code.`],
  interactions: [`<b>S3, OpenSearch Serverless, Aurora, S3 Vectors:</b> knowledge base sources and vector stores.`, `<b>Lambda, API Gateway:</b> agent tools and application front ends.`, `<b>IAM, KMS, PrivateLink, CloudTrail:</b> security and audit.`, `<b>CloudWatch:</b> token usage, latency and guardrail metrics.`, `<b>Step Functions:</b> orchestrating multi-step AI workflows.`],
  example: { title: 'Call a model with a guardrail attached (Kotlin, AWS SDK, trimmed)', lang: 'kotlin',
    code: `suspend fun summarise(client: BedrockRuntimeClient, text: String): String {
    val response = client.converse {
        modelId = System.getenv("MODEL_ID")          // a model or inference profile ID
        messages = listOf(Message {
            role = ConversationRole.User
            content = listOf(ContentBlock.Text("Summarise for a customer service agent:\\n\$text"))
        })
        inferenceConfig { maxTokens = 400; temperature = 0.2f }
        guardrailConfig {
            guardrailIdentifier = System.getenv("GUARDRAIL_ID")
            guardrailVersion = "1"
        }
    }
    return response.output?.asMessage()?.content?.firstOrNull()?.asText().orEmpty()
}`,
    notes: `<p>The task role needs <code>bedrock:InvokeModel</code> on the specific model and <code>bedrock:ApplyGuardrail</code>. Keep the model ID in configuration: models are replaced frequently.</p>` },
  useCases: [`<b>Support assistant</b> answering from product documentation with a knowledge base.`, `<b>Document intake:</b> extracting fields from uploaded statements.`, `<b>Operations agent</b> that reads alarms and proposes runbook steps.`],
  pricing: `<p>On-demand inference is charged per input and output token, at rates that differ widely by model. Batch is cheaper; provisioned throughput is hourly per model unit. Knowledge bases add vector store and embedding costs; guardrails, agents and AgentCore components are charged by use. Output length and model choice drive most of the bill.</p>`,
  pricingLink: 'https://aws.amazon.com/bedrock/pricing/',
  alternatives: [`<b>Amazon SageMaker AI:</b> build, train and host any model.`, `<b>Amazon Q:</b> finished assistants for developers and business users.`, `<b>Model providers' own APIs.</b>`, `<b>Self-hosted open models on EC2 or EKS.</b>`],
  mistakes: [`<b>No guardrails or input validation</b> on a public-facing assistant.`, `<b>Trusting model output as fact</b> without grounding or human review.`, `<b>Putting personal data in prompts</b> with invocation logging on and no redaction.`, `<b>Agents with broad IAM permissions.</b>`, `<b>Ignoring quotas</b> for tokens per minute.`, `<b>Using a cross-Region profile</b> when data must stay in one country.`, `<b>Largest model for every task</b>, when a small one is faster and far cheaper.`],
  exam: { saa: [], sap: ['1.2', '2.5', '3.1'],
    scopeNote: 'Bedrock is not on the SAA-C03 service list. It is central to two SAP-C03 tasks added in the C03 version: 1.2 (integrate AI and ML services) and 2.5 (security and responsible AI controls).',
    trap: `<ul><li>Answers from private documents without retraining: RAG with Knowledge Bases, not fine-tuning.</li><li>Block harmful content or redact personal data: Guardrails.</li><li>Keep traffic off the internet: interface VPC endpoint.</li><li>Predictable high volume: provisioned throughput. Offline bulk jobs: batch inference.</li><li>Full custom training pipeline: SageMaker AI.</li></ul>`,
    proAdds: `<p>Architecture choices between RAG, fine-tuning and agents; multi-tenant isolation of knowledge bases and memory; cost and latency design (routing, caching, batch); responsible AI controls, logging and evaluation; and agent security with AgentCore identity and gateway.</p>` },
  docs: [{ label: 'Amazon Bedrock User Guide', url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html' }, { label: 'Amazon Bedrock AgentCore', url: 'https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html' }]
},
{
  id: 'sagemaker', name: 'Amazon SageMaker AI', category: 'ai', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon SageMaker AI'],
  summary: 'A platform to build, train, tune and deploy your own machine learning models.',
  what: `<p>SageMaker AI (the service long known simply as SageMaker) covers the machine learning lifecycle: notebooks, data preparation, managed training jobs, hyperparameter tuning, a model registry, pipelines and hosted inference endpoints. The broader "next generation" SageMaker brand also includes a unified studio for data and analytics.</p>`,
  features: [`<b>Managed training</b> on demand or on Spot capacity.`, `<b>Inference options:</b> real-time endpoints, serverless inference, asynchronous inference and batch transform.`, `<b>JumpStart</b> for pre-built and open models.`, `<b>Pipelines, Model Registry, Model Monitor</b> for MLOps.`, `<b>Clarify</b> for bias detection and explainability.`],
  when: [`Custom models trained on your own data (fraud scoring, forecasting, recommendations).`, `Hosting open-source models with full control.`, `Teams with data scientists needing a governed platform.`],
  whenNot: [`<b>Using a foundation model through an API:</b> Bedrock.`, `<b>Standard tasks with ready-made services:</b> Rekognition, Comprehend, Textract and others.`],
  pricing: `<p>Charged per instance-hour for notebooks, training and endpoints, plus storage. Always-on real-time endpoints are the common cost leak; serverless and asynchronous inference scale down.</p>`,
  pricingLink: 'https://aws.amazon.com/sagemaker-ai/pricing/',
  alternatives: [`<b>Amazon Bedrock.</b>`, `<b>AI services with pre-trained models.</b>`, `<b>Self-managed ML on EKS or EC2.</b>`],
  mistakes: [`<b>Endpoints left running after experiments.</b>`, `<b>Real-time endpoints for workloads that could run as batch.</b>`],
  exam: { saa: ['3.5'], sap: ['1.2'], trap: `<p>"Build, train and deploy custom ML models": SageMaker AI. Infrequent traffic: serverless inference. Large payloads or long processing: asynchronous inference. Whole data sets offline: batch transform.</p>` },
  docs: [{ label: 'Amazon SageMaker AI Developer Guide', url: 'https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html' }]
},
{
  id: 'cloudhsm', name: 'AWS CloudHSM', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS CloudHSM'],
  summary: 'Dedicated, single-tenant hardware security modules in your VPC that only you control.',
  what: `<p>CloudHSM gives you a cluster of FIPS 140 Level 3 validated HSMs. AWS manages the hardware; you manage users and keys, and AWS has no access to the key material. Applications use industry-standard APIs (PKCS #11, JCE, OpenSSL).</p>`,
  features: [`<b>Single-tenant HSMs.</b>`, `<b>Custom key store</b> so KMS keys are backed by your cluster.`, `<b>Multi-AZ clusters</b> with automatic replication.`, `<b>TLS offload and certificate authority key protection;</b> Oracle and SQL Server TDE.`],
  when: [`Compliance or contracts demand dedicated HSMs or FIPS 140 Level 3 under your sole control.`, `Applications need standard HSM APIs.`],
  whenNot: [`<b>Ordinary encryption of AWS data:</b> KMS is cheaper, integrated and enough for nearly all cases.`],
  pricing: `<p>Charged per HSM per hour, with no upfront cost. At least two HSMs in different zones are needed for availability.</p>`,
  pricingLink: 'https://aws.amazon.com/cloudhsm/pricing/',
  alternatives: [`<b>AWS KMS.</b>`, `<b>KMS external key store</b> with an HSM outside AWS.`, `<b>AWS Payment Cryptography</b> for card-payment key operations.`],
  mistakes: [`<b>One HSM only.</b>`, `<b>Losing the crypto officer credentials:</b> AWS cannot recover them.`],
  exam: { saa: ['1.3'], sap: ['2.2'], trap: `<p>"Dedicated hardware", "single-tenant", "customer has exclusive control of keys", "FIPS 140 Level 3": CloudHSM. Otherwise KMS.</p>` },
  docs: [{ label: 'AWS CloudHSM User Guide', url: 'https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html' }]
},
{
  id: 'directory-service', name: 'AWS Directory Service', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Directory Service'],
  summary: 'Managed Microsoft Active Directory in AWS, and connectors to an existing on-premises directory.',
  what: `<p>Three options. <b>AWS Managed Microsoft AD</b> is real Active Directory run by AWS across two zones, able to form trusts with an on-premises domain. <b>AD Connector</b> is a proxy that forwards authentication to your existing directory and stores nothing in AWS. <b>Simple AD</b> is a low-cost, Samba-based directory with basic features.</p>`,
  features: [`<b>Trust relationships</b> with on-premises AD.`, `<b>Multi-Region replication</b> (Enterprise edition).`, `<b>Integrations:</b> FSx for Windows File Server, RDS for SQL Server, WorkSpaces, IAM Identity Center, EC2 domain join.`],
  when: [`Windows workloads in AWS that need Active Directory.`, `Using on-premises identities for AWS applications.`],
  whenNot: [`<b>Customer identities:</b> Cognito.`, `<b>Only single sign-on to AWS accounts from a cloud identity provider:</b> IAM Identity Center on its own.`],
  pricing: `<p>Charged per directory per hour by type and edition, plus additional domain controllers and Regions.</p>`,
  pricingLink: 'https://aws.amazon.com/directoryservice/pricing/',
  alternatives: [`<b>Self-managed domain controllers on EC2.</b>`, `<b>Microsoft Entra ID with IAM Identity Center.</b>`],
  mistakes: [`<b>AD Connector with an unreliable link</b> to on premises: sign-in fails when the link does.`],
  exam: { saa: ['1.1'], sap: ['2.1', '1.3'], trap: `<ul><li>Full AD features or a trust with on premises: AWS Managed Microsoft AD.</li><li>Use the existing on-premises directory without storing or syncing anything: AD Connector.</li><li>Small, standalone, cheapest: Simple AD.</li></ul>` },
  docs: [{ label: 'AWS Directory Service Administration Guide', url: 'https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html' }]
},
{
  id: 'firewall-manager', name: 'AWS Firewall Manager', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Firewall Manager'],
  summary: 'Applies and enforces firewall rules across every account in an organisation from one place.',
  what: `<p>Firewall Manager defines security policies centrally and applies them to existing and future resources in all accounts: AWS WAF web ACLs, Shield Advanced protections, security group rules and audits, Network Firewall, Route 53 Resolver DNS Firewall and network ACLs. It requires AWS Organizations and AWS Config.</p>`,
  features: [`<b>Automatic protection of new resources and accounts.</b>`, `<b>Security group auditing and clean-up.</b>`, `<b>Central compliance view.</b>`],
  when: [`Many accounts needing the same baseline WAF or firewall rules.`, `Guaranteeing that every new load balancer gets a web ACL.`],
  whenNot: [`<b>A single account:</b> configure WAF directly.`],
  pricing: `<p>Charged per policy per Region per month, plus the underlying WAF, Config and firewall resources. Included with Shield Advanced for some policy types.</p>`,
  pricingLink: 'https://aws.amazon.com/firewall-manager/pricing/',
  alternatives: [`<b>StackSets</b> deploying WAF resources, without continuous enforcement.`],
  mistakes: [`<b>Config not enabled in member accounts</b>, so policies cannot evaluate.`],
  exam: { saa: ['1.2'], sap: ['2.3'], trap: `<p>"Centrally manage WAF rules, Shield Advanced or security groups across multiple accounts": Firewall Manager.</p>` },
  docs: [{ label: 'AWS Firewall Manager', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/fms-chapter.html' }]
},
{
  id: 'ram', name: 'AWS Resource Access Manager (RAM)', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Resource Access Manager (AWS RAM)'],
  summary: 'Shares resources such as subnets and transit gateways with other accounts, without copying them.',
  what: `<p>RAM lets the owner of a resource share it with specific accounts, organisational units or the whole organisation. The resource stays in the owner's account; participants use it as if it were local. Sharing inside an organisation needs no invitation.</p>`,
  features: [`<b>Shareable resources include:</b> VPC subnets (VPC sharing), transit gateways, Route 53 Resolver rules and Profiles, License Manager configurations, Private CA, prefix lists, VPC Lattice service networks, Aurora clusters and more.`, `<b>Managed and custom permissions</b> per resource type.`],
  when: [`Central networking account sharing subnets or a transit gateway.`, `Avoiding duplicated resources in every account.`],
  whenNot: [`<b>Sharing S3 buckets, KMS keys or IAM roles:</b> those use resource policies and role assumption.`],
  pricing: `<p>No charge.</p>`,
  pricingLink: 'https://aws.amazon.com/ram/',
  alternatives: [`<b>Resource-based policies</b> for services that support them.`, `<b>VPC peering or PrivateLink</b> instead of shared subnets.`],
  mistakes: [`<b>Assuming participants can modify a shared subnet.</b> They create resources in it; the owner controls the network.`],
  exam: { saa: ['1.1'], sap: ['2.3', '1.4'], trap: `<p>"Multiple accounts launch resources into centrally managed subnets": VPC sharing through RAM. "Share a transit gateway across accounts": RAM.</p>` },
  docs: [{ label: 'AWS RAM User Guide', url: 'https://docs.aws.amazon.com/ram/latest/userguide/what-is.html' }]
},
{
  id: 'detective-artifact', name: 'Amazon Detective, AWS Artifact and AWS Audit Manager', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Detective', 'AWS Artifact'],
  summary: 'Three audit and investigation helpers: Detective analyses incidents, Artifact supplies AWS compliance reports, Audit Manager collects your evidence.',
  what: `<p><b>Amazon Detective</b> builds a graph from CloudTrail, VPC Flow Logs and GuardDuty findings so an analyst can see what a suspicious role or instance did before and after an alert. <b>AWS Artifact</b> is a self-service portal for AWS's own audit reports (SOC, ISO 27001, PCI DSS attestation) and agreements. <b>AWS Audit Manager</b> continuously gathers evidence from your accounts and maps it to frameworks to prepare for your own audits.</p>`,
  features: [`<b>Detective:</b> visual investigation timelines, finding groups, integration with GuardDuty and Security Hub.`, `<b>Artifact:</b> downloadable reports and agreement management, free.`, `<b>Audit Manager:</b> prebuilt frameworks (PCI DSS, ISO 27001, SOC 2) and assessment reports.`],
  when: [`Detective: root-cause analysis of a GuardDuty finding.`, `Artifact: an auditor asks for proof of AWS's certifications.`, `Audit Manager: preparing evidence of your own controls.`],
  whenNot: [`<b>Detecting threats:</b> GuardDuty.`, `<b>Checking configuration:</b> Config and Security Hub.`],
  pricing: `<p>Detective: per GB of data ingested. Artifact: free. Audit Manager: per resource assessment.</p>`,
  pricingLink: 'https://aws.amazon.com/detective/pricing/',
  alternatives: [`<b>Athena queries over CloudTrail</b> for manual investigation.`, `<b>Third-party GRC tools.</b>`],
  mistakes: [`<b>Treating AWS's compliance reports as proof that your own workload is compliant.</b> They cover AWS's side of the shared responsibility model only.`],
  exam: { saa: ['1.2', '1.3'], sap: [], trap: `<ul><li>"Investigate the root cause of a security finding": Detective.</li><li>"Download AWS compliance reports such as SOC or PCI": Artifact.</li><li>"Continuously collect audit evidence": Audit Manager.</li></ul>` },
  docs: [{ label: 'Amazon Detective User Guide', url: 'https://docs.aws.amazon.com/detective/latest/userguide/what-is-detective.html' }, { label: 'AWS Artifact User Guide', url: 'https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html' }]
},
{
  id: 'verified-permissions', name: 'Amazon Verified Permissions and AWS Verified Access', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Verified Permissions', 'AWS Verified Access'],
  summary: 'Two zero-trust services: fine-grained authorisation inside your application, and VPN-less access to corporate applications.',
  what: `<p><b>Amazon Verified Permissions</b> is a policy store and decision engine for your own application's permissions. Policies are written in the Cedar language ("a teller may view accounts in their own branch") and your code asks "is this principal allowed this action on this resource?". <b>AWS Verified Access</b> lets employees reach internal web applications without a VPN: every request is checked against identity (IAM Identity Center or an OIDC provider) and device posture before it reaches the application.</p>`,
  features: [`<b>Verified Permissions:</b> role- and attribute-based policies, policy templates, Cognito and OIDC token integration, API Gateway authoriser, audit of every decision.`, `<b>Verified Access:</b> per-application policies, device trust providers, WAF integration, request logging.`],
  when: [`Verified Permissions: multi-tenant or role-rich applications where authorisation logic is spreading through the code.`, `Verified Access: replacing Client VPN for web applications with per-request checks.`],
  whenNot: [`<b>Controlling access to AWS APIs:</b> IAM.`, `<b>Authenticating users:</b> Cognito or your identity provider (these services decide what an authenticated user may do).`, `<b>Non-web network access for administrators:</b> Client VPN or Session Manager.`],
  pricing: `<p>Verified Permissions: per authorisation request. Verified Access: per application-hour and per GB processed.</p>`,
  pricingLink: 'https://aws.amazon.com/verified-permissions/pricing/',
  alternatives: [`<b>Hand-written authorisation code</b> or Open Policy Agent.`, `<b>Client VPN.</b>`],
  mistakes: [`<b>Confusing authentication (Cognito) with authorisation (Verified Permissions).</b>`],
  exam: { saa: [], sap: ['2.1'], trap: `<ul><li>"Fine-grained, policy-based authorisation inside a custom application": Verified Permissions.</li><li>"Secure access to corporate applications without a VPN, based on identity and device": Verified Access.</li><li>Both are on the SAP-C03 list only.</li></ul>` },
  docs: [{ label: 'Amazon Verified Permissions User Guide', url: 'https://docs.aws.amazon.com/verifiedpermissions/latest/userguide/what-is-avp.html' }, { label: 'AWS Verified Access User Guide', url: 'https://docs.aws.amazon.com/verified-access/latest/ug/what-is-verified-access.html' }]
},
{
  id: 'security-lake', name: 'Amazon Security Lake', category: 'security', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Security Lake'],
  summary: 'Centralises security logs from AWS, SaaS and on-premises sources into one S3 data lake in a standard format.',
  what: `<p>Security Lake collects CloudTrail, VPC Flow Logs, Route 53 Resolver logs, Security Hub findings, EKS audit logs, WAF logs and third-party sources across accounts and Regions. It converts them to the Open Cybersecurity Schema Framework (OCSF) in Parquet and stores them in S3 buckets you own, with lifecycle management. Analytics tools subscribe to the data.</p>`,
  features: [`<b>OCSF normalisation.</b>`, `<b>Multi-account, multi-Region roll-up</b> through Organizations.`, `<b>Subscribers</b> with query access (Athena, Lake Formation) or data access (S3 notifications) for SIEM tools.`],
  when: [`A security team needs long-term, queryable logs from the whole organisation.`, `Feeding one or more SIEM or analytics tools from a single source.`],
  whenNot: [`<b>Detection:</b> GuardDuty. <b>Posture:</b> Security Hub. Security Lake stores and normalises; it does not alert.`],
  pricing: `<p>Charged per GB ingested and normalised, plus S3 storage and query costs.</p>`,
  pricingLink: 'https://aws.amazon.com/security-lake/pricing/',
  alternatives: [`<b>Organisation trail to a log archive bucket</b> queried with Athena.`, `<b>Shipping logs directly to a SIEM.</b>`],
  mistakes: [`<b>Duplicating log collection</b> and paying twice.`],
  exam: { saa: [], sap: ['2.3', '5.3'], trap: `<p>"Centralise and normalise security data from many accounts and sources for analysis": Security Lake (SAP-C03 list).</p>` },
  docs: [{ label: 'Amazon Security Lake User Guide', url: 'https://docs.aws.amazon.com/security-lake/latest/userguide/what-is-security-lake.html' }]
},
{
  id: 'codepipeline', name: 'AWS CodePipeline, CodeBuild and CodeDeploy', category: 'devtools', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS CodePipeline', 'AWS CodeBuild', 'AWS CodeDeploy', 'AWS CodeCommit'],
  summary: 'The AWS-native CI/CD set: CodePipeline orchestrates stages, CodeBuild compiles and tests, CodeDeploy releases to servers, containers and functions.',
  what: `<p><b>CodePipeline</b> models a release as stages (source, build, test, approval, deploy) and runs them on every change. <b>CodeBuild</b> is a serverless build service that runs commands from a <code>buildspec.yml</code> in a container. <b>CodeDeploy</b> automates deployments to EC2, on-premises servers, ECS and Lambda. <b>CodeCommit</b> is a managed Git service; many teams use GitHub or GitLab as the source instead.</p>`,
  features: [`<b>CodeDeploy strategies:</b> in-place rolling; blue/green; for Lambda and ECS, <i>canary</i> (a small share first), <i>linear</i> (equal steps) and <i>all-at-once</i> traffic shifting.`, `<b>Automatic rollback</b> on failed health checks or CloudWatch alarms.`, `<b>Manual approval actions</b> and cross-account, cross-Region deployment actions.`, `<b>CodeBuild</b> runs security scans, tests and image builds; integrates with ECR and Inspector.`, `<b>CodeArtifact</b> stores packages.`],
  when: [`Pipelines that deploy into AWS with IAM roles and no long-lived credentials.`, `Safe deployment patterns for ECS and Lambda.`, `Organisations wanting CI/CD inside their AWS boundary.`],
  whenNot: [`<b>Your team already runs GitHub Actions or GitLab CI:</b> federate with OIDC and keep them.`, `<b>Kubernetes GitOps:</b> Argo CD or Flux.`],
  pricing: `<p>CodePipeline: per active pipeline or per action-minute depending on pipeline type. CodeBuild: per build-minute by compute size. CodeDeploy: free for EC2, ECS and Lambda; charged per on-premises instance update.</p>`,
  pricingLink: 'https://aws.amazon.com/codepipeline/pricing/',
  alternatives: [`<b>GitHub Actions, GitLab CI, Jenkins.</b>`, `<b>ECS built-in deployment strategies.</b>`, `<b>CDK Pipelines.</b>`],
  mistakes: [`<b>All-at-once deployments to production with no alarms or rollback.</b>`, `<b>Access keys in a third-party CI system</b> instead of OIDC roles.`, `<b>One pipeline role with administrator access to every account.</b>`],
  exam: { saa: [], sap: ['5.2'], scopeNote: 'SAA-C03 lists CodeBuild, CodeCommit, CodeDeploy and CodeArtifact as out of scope. SAP-C03 lists CodePipeline, CodeBuild, CodeDeploy and CodeCommit as in scope.', trap: `<ul><li>Lowest-risk release with fast rollback: blue/green. Expose a small percentage first: canary.</li><li>Deploy to many accounts: a central pipeline assuming a role in each target account.</li><li>Security scanning belongs in the build stage, before deployment.</li></ul>` },
  docs: [{ label: 'AWS CodePipeline User Guide', url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html' }, { label: 'AWS CodeDeploy User Guide', url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html' }]
},
{
  id: 'cdk', name: 'AWS CDK', category: 'devtools', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS CDK'],
  summary: 'Define infrastructure in TypeScript, Python, Java, C# or Go; the CDK turns it into CloudFormation.',
  what: `<p>The AWS Cloud Development Kit lets you describe infrastructure with ordinary programming constructs: loops, functions, classes and packages. <i>Constructs</i> bundle resources with sensible defaults. <code>cdk synth</code> produces a CloudFormation template and <code>cdk deploy</code> deploys it, so everything CloudFormation provides (change sets, rollback, drift detection) still applies.</p>`,
  features: [`<b>Three construct levels:</b> raw resources (L1), resources with defaults and helper methods (L2), and whole patterns (L3).`, `<b>Automatic IAM wiring</b> through <code>grant</code> methods.`, `<b>Assets:</b> bundles Lambda code and container images.`, `<b>CDK Pipelines</b> for self-updating delivery pipelines.`, `<b>Unit tests</b> on synthesised templates.`],
  when: [`Development teams that prefer code to YAML.`, `Reusable internal platform components published as libraries.`],
  whenNot: [`<b>Multi-cloud or an existing Terraform estate.</b>`, `<b>Operations teams more comfortable with declarative templates.</b>`],
  pricing: `<p>Free; you pay for the resources deployed.</p>`,
  pricingLink: 'https://aws.amazon.com/cdk/',
  alternatives: [`<b>CloudFormation, AWS SAM.</b>`, `<b>Terraform, Pulumi.</b>`],
  mistakes: [`<b>Accepting defaults without reading the synthesised template.</b>`, `<b>Logic so clever that nobody can predict what will be deployed.</b>`],
  exam: { saa: [], sap: ['5.1'], trap: `<p>Out of scope for SAA-C03, in scope for SAP-C03. "Define infrastructure with a familiar programming language and reusable components": CDK. It still deploys through CloudFormation.</p>` },
  docs: [{ label: 'AWS CDK Developer Guide', url: 'https://docs.aws.amazon.com/cdk/v2/guide/home.html' }]
},
{
  id: 'xray', name: 'AWS X-Ray and AWS Distro for OpenTelemetry', category: 'devtools', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS X-Ray', 'AWS Distro for OpenTelemetry'],
  summary: 'Distributed tracing: follow one request through every service it touches and see where time is spent or errors occur.',
  what: `<p><b>X-Ray</b> collects <i>traces</i> made of segments from each service a request passes through and draws a service map with latency and error rates. <b>AWS Distro for OpenTelemetry</b> (ADOT) is AWS's supported build of OpenTelemetry, the vendor-neutral standard for traces, metrics and logs. AWS now recommends OpenTelemetry instrumentation, with traces viewed in CloudWatch (Application Signals and Transaction Search) [[verify]].</p>`,
  features: [`<b>Service map and trace timelines.</b>`, `<b>Sampling rules</b> to control volume and cost.`, `<b>Annotations</b> for filtering traces by business attributes.`, `<b>Built-in integration</b> with Lambda, API Gateway, ECS, EKS and App Runner.`],
  when: [`Microservices where a slow or failing request crosses several services.`, `Finding which downstream call causes latency.`],
  whenNot: [`<b>Infrastructure metrics and alarms:</b> CloudWatch.`, `<b>API audit:</b> CloudTrail.`],
  pricing: `<p>Charged per trace recorded and per trace retrieved or scanned, after a free tier.</p>`,
  pricingLink: 'https://aws.amazon.com/xray/pricing/',
  alternatives: [`<b>CloudWatch Application Signals.</b>`, `<b>Third-party APM tools</b> fed by OpenTelemetry.`],
  mistakes: [`<b>Tracing 100% of requests in a busy system.</b>`, `<b>Trace context not propagated</b> through queues and asynchronous calls.`],
  exam: { saa: ['2.1'], sap: ['5.3'], scopeNote: 'SAA-C03 lists X-Ray as in scope and AWS Distro for OpenTelemetry as out of scope. SAP-C03 lists both.', trap: `<p>"Trace requests across microservices", "identify the bottleneck service": X-Ray. Vendor-neutral instrumentation: OpenTelemetry (ADOT).</p>` },
  docs: [{ label: 'AWS X-Ray Developer Guide', url: 'https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html' }]
},
{
  id: 'elastic-beanstalk', name: 'AWS Elastic Beanstalk', category: 'compute', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Elastic Beanstalk'],
  summary: 'Upload code and Elastic Beanstalk provisions and manages the servers, load balancer, scaling and deployments for it.',
  what: `<p>Elastic Beanstalk is a platform service for web applications in Java, .NET, Node.js, Python, PHP, Ruby, Go and Docker. It creates ordinary resources in your account (EC2, Auto Scaling group, load balancer, optionally RDS) that you can still see and adjust.</p>`,
  features: [`<b>Deployment policies:</b> all at once, rolling, rolling with additional batch, immutable, traffic splitting, and blue/green by swapping environment URLs.`, `<b>Managed platform updates.</b>`, `<b>Web server and worker (SQS-driven) environment tiers.</b>`, `<b>Configuration through <code>.ebextensions</code>.</b>`],
  when: [`Migrating a traditional web application quickly with little AWS expertise.`, `Small teams that want EC2 without wiring it together.`],
  whenNot: [`<b>New container services:</b> ECS on Fargate or App Runner.`, `<b>Fine control of infrastructure as code:</b> Terraform or CloudFormation directly.`, `<b>Databases you care about created inside the environment:</b> they are deleted with it.`],
  pricing: `<p>No charge for Elastic Beanstalk; you pay for the EC2, load balancer and other resources.</p>`,
  pricingLink: 'https://aws.amazon.com/elasticbeanstalk/pricing/',
  alternatives: [`<b>App Runner, ECS on Fargate, Lightsail, Amplify Hosting.</b>`],
  mistakes: [`<b>Production database tied to the environment's lifecycle.</b>`, `<b>All-at-once deployments in production.</b>`],
  exam: { saa: ['3.2'], sap: ['1.1', '4.1'], trap: `<p>"Developers want to deploy code without managing infrastructure, but keep access to the underlying resources": Elastic Beanstalk. Zero-downtime with easy rollback: immutable or blue/green.</p>` },
  docs: [{ label: 'AWS Elastic Beanstalk Developer Guide', url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html' }]
},
{
  id: 'batch', name: 'AWS Batch', category: 'compute', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Batch'],
  summary: 'Runs batch computing jobs of any scale by queuing them and provisioning the right compute automatically.',
  what: `<p>You submit jobs (container images with commands) to a job queue. AWS Batch schedules them onto compute environments built on EC2, Spot, Fargate or EKS, scaling capacity up for the queue and back to zero afterwards.</p>`,
  features: [`<b>Job dependencies and array jobs.</b>`, `<b>Spot integration</b> with automatic retries.`, `<b>Priority queues and fair-share scheduling.</b>`, `<b>Multi-node parallel jobs and GPU support.</b>`],
  when: [`Long-running or heavy compute jobs: rendering, simulations, genomics, risk calculations, large ETL.`, `Work exceeding Lambda's 15-minute limit.`],
  whenNot: [`<b>Short event-driven tasks:</b> Lambda.`, `<b>Always-on services:</b> ECS or EKS.`, `<b>Spark or Hadoop:</b> EMR or Glue.`],
  pricing: `<p>No charge for AWS Batch; you pay for the compute it launches.</p>`,
  pricingLink: 'https://aws.amazon.com/batch/pricing/',
  alternatives: [`<b>Step Functions with ECS tasks or Distributed Map.</b>`, `<b>ECS scheduled tasks.</b>`, `<b>AWS Parallel Computing Service</b> for Slurm-based HPC.`],
  mistakes: [`<b>On-Demand compute for interruptible jobs</b> that would run cheaply on Spot.`],
  exam: { saa: ['3.2', '4.2'], sap: ['1.1'], trap: `<p>"Batch jobs", "run for hours", "queue of jobs", "lowest cost": AWS Batch with Spot.</p>` },
  docs: [{ label: 'AWS Batch User Guide', url: 'https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html' }]
},
{
  id: 'outposts', name: 'AWS Outposts, Local Zones and Wavelength', category: 'compute', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Outposts', 'AWS Local Zones', 'AWS Wavelength'],
  summary: 'Three ways to run AWS infrastructure closer to users or data than the nearest Region.',
  what: `<p><b>AWS Outposts</b> puts AWS-owned racks or servers in your own data centre, running EC2, EBS, ECS, EKS, RDS and S3 locally, managed from the parent Region. <b>Local Zones</b> are AWS-run extensions of a Region in other cities (Auckland has one attached to the Sydney Region [[verify]]) offering a subset of services with single-digit millisecond latency to local users. <b>Wavelength Zones</b> embed AWS compute inside telecom providers' 5G networks.</p>`,
  features: [`<b>Same APIs, tools and console as the Region.</b>`, `<b>VPC subnets extended</b> into the Outpost, Local Zone or Wavelength Zone.`, `<b>Dedicated Local Zones</b> for a single customer's sovereignty needs.`],
  when: [`Outposts: data must stay on premises, or systems need very low latency to factory, hospital or trading equipment.`, `Local Zones: latency-sensitive applications for users in a city without a Region; some residency needs.`, `Wavelength: mobile edge applications over 5G.`],
  whenNot: [`<b>A full Region is close enough.</b> New Zealand now has its own Region, <code>ap-southeast-6</code>.`, `<b>You only need hybrid storage or connectivity:</b> Storage Gateway, Direct Connect.`, `<b>Disconnected operation:</b> Outposts needs a reliable link to its Region.`],
  pricing: `<p>Outposts: a three-year term for the configured capacity. Local Zones and Wavelength: per-resource pricing, usually higher than in the parent Region.</p>`,
  pricingLink: 'https://aws.amazon.com/outposts/pricing/',
  alternatives: [`<b>ECS Anywhere, EKS Anywhere, EKS Hybrid Nodes</b> on your own hardware.`, `<b>CloudFront and Global Accelerator</b> for edge delivery.`],
  mistakes: [`<b>Expecting every service in a Local Zone.</b>`, `<b>Treating an Outpost as a separate Region:</b> its control plane is in the parent Region.`],
  exam: { saa: ['3.2', '2.2'], sap: ['1.3'], trap: `<ul><li>"Run AWS services on premises with the same APIs" or "data must remain in our data centre": Outposts.</li><li>"Single-digit millisecond latency for users in a specific city": Local Zones.</li><li>"5G mobile devices": Wavelength.</li></ul>` },
  docs: [{ label: 'AWS Outposts User Guide', url: 'https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html' }, { label: 'AWS Local Zones User Guide', url: 'https://docs.aws.amazon.com/local-zones/latest/ug/what-is-aws-local-zones.html' }]
},
{
  id: 'mq-appflow', name: 'Amazon MQ, Amazon AppFlow and AWS AppSync', category: 'integration', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon MQ', 'Amazon AppFlow'],
  summary: 'Three narrower integration services: a managed message broker, SaaS data flows, and managed GraphQL.',
  what: `<p><b>Amazon MQ</b> runs Apache ActiveMQ and RabbitMQ brokers, supporting standard protocols (JMS, AMQP, MQTT, STOMP, OpenWire) so existing applications migrate without rewriting their messaging code. <b>Amazon AppFlow</b> moves data between SaaS applications (Salesforce, SAP, Slack, ServiceNow) and AWS services such as S3 and Redshift, on a schedule or on events, with no code. <b>AWS AppSync</b> provides managed GraphQL and real-time publish/subscribe APIs over DynamoDB, Lambda, Aurora and HTTP sources.</p>`,
  features: [`<b>Amazon MQ:</b> active/standby or cluster deployments across zones.`, `<b>AppFlow:</b> field mapping, filtering, validation, PrivateLink to supported SaaS.`, `<b>AppSync:</b> subscriptions over WebSockets, offline sync, caching, several authorisation modes.`],
  when: [`Amazon MQ: lift-and-shift of applications tied to JMS or AMQP.`, `AppFlow: bringing CRM or ERP data into a data lake.`, `AppSync: mobile and web apps needing flexible queries and live updates.`],
  whenNot: [`<b>New cloud-native messaging:</b> SQS, SNS and EventBridge scale further with less to manage.`, `<b>Database replication:</b> DMS.`, `<b>Simple REST APIs:</b> API Gateway.`],
  pricing: `<p>Amazon MQ: per broker instance-hour and storage. AppFlow: per flow run and per GB processed. AppSync: per million operations and connection minutes.</p>`,
  pricingLink: 'https://aws.amazon.com/amazon-mq/pricing/',
  alternatives: [`<b>SQS, SNS, EventBridge, MSK.</b>`, `<b>Glue or third-party ETL connectors.</b>`],
  mistakes: [`<b>Choosing Amazon MQ for a new application</b> with no protocol requirement.`, `<b>Single-instance broker in production.</b>`],
  exam: { saa: ['2.1', '3.5'], sap: ['1.1', '4.1'], trap: `<ul><li>"Migrate an application using JMS, AMQP, ActiveMQ or RabbitMQ with minimal changes": Amazon MQ.</li><li>"Transfer data from Salesforce or another SaaS into AWS without code": AppFlow.</li><li>"GraphQL": AppSync.</li></ul>` },
  docs: [{ label: 'Amazon MQ Developer Guide', url: 'https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html' }, { label: 'Amazon AppFlow User Guide', url: 'https://docs.aws.amazon.com/appflow/latest/userguide/what-is-appflow.html' }]
},
{
  id: 'service-catalog', name: 'AWS Service Catalog, License Manager and Service Quotas', category: 'management', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Service Catalog', 'AWS License Manager', 'Service Quotas', 'AWS Proton'],
  summary: 'Governance helpers: an approved-products catalogue, software licence tracking, and visibility of service limits.',
  what: `<p><b>AWS Service Catalog</b> lets administrators publish approved products (CloudFormation or Terraform templates) that users launch through self-service without needing permissions on the underlying resources. <b>AWS License Manager</b> tracks licences for Microsoft, Oracle, SAP and other software, enforces limits, and manages Dedicated Host allocation. <b>Service Quotas</b> shows the limits on each service per account and Region, raises alarms as usage approaches them, and requests increases. <b>AWS Proton</b>, an older platform-template service for containers and serverless, is being retired [[verify]].</p>`,
  features: [`<b>Service Catalog:</b> portfolios shared across the organisation, launch constraints that supply the provisioning role, versioning.`, `<b>License Manager:</b> rules by vCPU, core or socket; discovery through Systems Manager Inventory.`, `<b>Service Quotas:</b> quota request templates applied to new accounts; CloudWatch usage metrics.`],
  when: [`Self-service provisioning with guardrails.`, `Bring-your-own-licence compliance.`, `Checking limits before a launch, a migration or a DR failover.`],
  whenNot: [`<b>Preventing actions outright:</b> SCPs.`, `<b>Creating AWS accounts:</b> Control Tower Account Factory (which uses Service Catalog underneath).`],
  pricing: `<p>Service Catalog charges per API call beyond a free allowance. License Manager and Service Quotas are free.</p>`,
  pricingLink: 'https://aws.amazon.com/servicecatalog/pricing/',
  alternatives: [`<b>Internal developer platforms</b> such as Backstage with Terraform modules.`],
  mistakes: [`<b>Forgetting that quotas are per Region</b>, so the DR Region cannot scale during failover.`],
  exam: { saa: ['1.1'], sap: ['2.3', '5.4', '4.2'], trap: `<ul><li>"Users deploy only approved, standardised resources without broad permissions": Service Catalog.</li><li>"Track and enforce software licence usage": License Manager.</li><li>A DR plan is incomplete until quotas in the recovery Region match production.</li></ul>` },
  docs: [{ label: 'AWS Service Catalog Administrator Guide', url: 'https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html' }, { label: 'Service Quotas User Guide', url: 'https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html' }]
},
{
  id: 'resilience-hub', name: 'AWS Resilience Hub and AWS Fault Injection Service', category: 'management', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Resilience Hub', 'AWS Fault Injection Service', 'AWS Fault Injection Simulator (AWS FIS)'],
  summary: 'Assess whether an application can meet its recovery targets, then prove it by injecting real failures.',
  what: `<p><b>AWS Resilience Hub</b> takes an application's resources and your recovery time and recovery point objectives, then reports whether the architecture can meet them for failures of the application, infrastructure, Availability Zone and Region, with recommendations, alarms and test suggestions. <b>AWS Fault Injection Service</b> (FIS) runs controlled chaos experiments: stopping instances, throttling APIs, adding network latency, failing over databases, or simulating the loss of power to a zone, with stop conditions tied to CloudWatch alarms.</p>`,
  features: [`<b>Resilience score and policy tracking over time.</b>`, `<b>Scenario library</b> including Availability Zone power interruption and cross-Region connectivity loss.`, `<b>Stop conditions and IAM-scoped experiment roles.</b>`, `<b>Multi-account experiments.</b>`],
  when: [`Validating DR and high-availability claims before an audit or launch.`, `Game days.`, `Regulated environments needing evidence of resilience testing.`],
  whenNot: [`<b>Load testing:</b> use a load testing tool.`, `<b>Production experiments without alarms, stop conditions and a rollback plan.</b>`],
  pricing: `<p>Resilience Hub: per application assessed per month. FIS: per action-minute.</p>`,
  pricingLink: 'https://aws.amazon.com/resilience-hub/pricing/',
  alternatives: [`<b>Application Recovery Controller</b> for controlling failover (not testing it).`, `<b>Open-source chaos tools</b> such as Chaos Mesh or Litmus.`],
  mistakes: [`<b>Never testing failover</b> and discovering missing quotas, permissions or data during a real outage.`],
  exam: { saa: [], sap: ['4.3', '4.2'], scopeNote: 'SAA-C03 lists AWS Fault Injection Simulator as out of scope. SAP-C03 lists both Resilience Hub and Fault Injection Service.', trap: `<p>"Verify the architecture meets RTO and RPO targets": Resilience Hub. "Test how the system behaves when a zone or dependency fails": Fault Injection Service.</p>` },
  docs: [{ label: 'AWS Resilience Hub User Guide', url: 'https://docs.aws.amazon.com/resilience-hub/latest/userguide/what-is.html' }, { label: 'AWS Fault Injection Service User Guide', url: 'https://docs.aws.amazon.com/fis/latest/userguide/what-is.html' }]
},
{
  id: 'managed-observability', name: 'Amazon Managed Grafana, Managed Service for Prometheus, AWS Health and Well-Architected Tool', category: 'management', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Managed Grafana', 'Amazon Managed Service for Prometheus', 'AWS Health Dashboard', 'AWS Well-Architected Tool'],
  summary: 'Managed open-source observability, AWS service health notifications, and a structured architecture review tool.',
  what: `<p><b>Amazon Managed Service for Prometheus</b> stores and queries Prometheus metrics at scale without running Prometheus servers; it is the usual choice for Kubernetes metrics. <b>Amazon Managed Grafana</b> is a managed Grafana workspace with single sign-on and data sources for CloudWatch, Prometheus, OpenSearch, X-Ray and third parties. <b>AWS Health Dashboard</b> shows AWS service events that affect your specific resources and scheduled maintenance, with events available in EventBridge. The <b>AWS Well-Architected Tool</b> reviews a workload against the six pillars (operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability) and records risks and improvement plans.</p>`,
  features: [`<b>PromQL-compatible queries and alerting.</b>`, `<b>Grafana dashboards across accounts and data sources.</b>`, `<b>Health events for an entire organisation.</b>`, `<b>Lenses</b> for specific domains (serverless, SaaS, financial services, generative AI).`],
  when: [`Container platforms already using Prometheus and Grafana.`, `Automating responses to AWS maintenance and incidents.`, `Periodic architecture reviews.`],
  whenNot: [`<b>Basic AWS resource monitoring:</b> CloudWatch alone.`],
  pricing: `<p>Managed Prometheus: per metric sample ingested, stored and queried. Managed Grafana: per active user. Health Dashboard and the Well-Architected Tool are free.</p>`,
  pricingLink: 'https://aws.amazon.com/prometheus/pricing/',
  alternatives: [`<b>CloudWatch dashboards and Container Insights.</b>`, `<b>Self-hosted Prometheus and Grafana.</b>`, `<b>Third-party observability platforms.</b>`],
  mistakes: [`<b>High-cardinality labels</b> inflating Prometheus cost.`],
  exam: { saa: ['2.2'], sap: ['5.3'], trap: `<ul><li>"Existing Prometheus and Grafana, minimise operational overhead": the two managed services.</li><li>"Be notified of AWS events affecting our resources": AWS Health with EventBridge.</li><li>"Review a workload against best practices": Well-Architected Tool.</li></ul>` },
  docs: [{ label: 'Amazon Managed Service for Prometheus User Guide', url: 'https://docs.aws.amazon.com/prometheus/latest/userguide/what-is-Amazon-Managed-Service-Prometheus.html' }, { label: 'AWS Well-Architected Tool User Guide', url: 'https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html' }]
}
);

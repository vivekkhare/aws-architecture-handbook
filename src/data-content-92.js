/* ===== Link the "new in SAP-C03" list and the Associate-to-Professional bridge to the pages that now exist ===== */
(() => {
  const pages = ['service/kinesis', 'service/step-functions', 'service/vpc-lattice', 'service/ecr', 'service/elb', 'service/api-gateway', 'concept/multi-tenancy',
    'service/bedrock', 'service/bedrock', 'service/sagemaker', 'walkthrough/rag-bedrock', 'service/outposts', 'concept/ipv6', 'walkthrough/data-lake', 'service/redshift', 'service/lake-formation',
    'service/cognito', 'service/roles-anywhere', 'concept/encryption', 'concept/data-residency', 'service/detective-artifact', 'payments', 'service/bedrock', 'service/bedrock', 'concept/genai-architecture',
    'service/bedrock', 'concept/genai-architecture', 'concept/observability', 'service/eks', 'walkthrough/multi-account-pipeline', 'walkthrough/multi-account-pipeline', 'concept/genai-architecture',
    'service/cloudwatch', 'concept/genai-architecture', 'service/cloudwatch', 'concept/resilience-patterns', 'service/systems-manager'];
  C03_NEW.forEach((x, i) => { if (pages[i]) x.page = pages[i]; });
  const bridge = {
    'Identity and access': ['service/iam', 'service/identity-center', 'service/cognito', 'concept/policy-evaluation', 'compare/policy-types', 'compare/identity-services'],
    'Networking': ['service/vpc', 'service/transit-gateway', 'service/privatelink', 'service/direct-connect', 'compare/vpc-connectivity', 'walkthrough/hybrid-network', 'concept/hybrid-connectivity'],
    'Compute and containers': ['service/ec2', 'service/ecs', 'service/eks', 'service/lambda', 'compare/compute-options', 'walkthrough/fargate-api'],
    'Storage': ['service/s3', 'service/ebs', 'service/efs', 'service/fsx', 'compare/storage-types', 'compare/s3-classes'],
    'Databases': ['service/rds', 'service/aurora', 'service/dynamodb', 'service/elasticache', 'compare/rds-aurora-dynamodb', 'concept/replication'],
    'Security and governance': ['service/kms', 'service/organizations', 'service/control-tower', 'concept/multi-account', 'concept/data-perimeters', 'concept/encryption', 'compare/security-services', 'walkthrough/landing-zone'],
    'Cost': ['service/savings-plans', 'service/cost-explorer', 'service/budgets', 'concept/finops', 'compare/commitments'],
    'Resilience and migration': ['concept/rto-rpo-dr', 'concept/availability', 'concept/resilience-patterns', 'concept/seven-rs', 'compare/dr-strategies', 'walkthrough/dr-four-ways', 'walkthrough/migration-three-tier', 'walkthrough/multi-region-active'],
    'Operations': ['service/cloudwatch', 'service/cloudformation', 'service/systems-manager', 'service/codepipeline', 'concept/observability', 'compare/iac-tools', 'walkthrough/multi-account-pipeline'],
    'AI and machine learning': ['service/bedrock', 'service/sagemaker', 'concept/genai-architecture', 'walkthrough/rag-bedrock']
  };
  BRIDGE.forEach(b => { if (bridge[b.topic]) b.pages = bridge[b.topic]; });
})();

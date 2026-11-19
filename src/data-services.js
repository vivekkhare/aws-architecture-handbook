/* ===== Reference data: categories, diagrams, services ===== */
const CATEGORIES = [
  { id: 'networking', name: 'Networking and content delivery' },
  { id: 'compute', name: 'Compute' },
  { id: 'containers', name: 'Containers' },
  { id: 'storage', name: 'Storage' },
  { id: 'database', name: 'Database' },
  { id: 'security', name: 'Security, identity and compliance' },
  { id: 'management', name: 'Management and governance' },
  { id: 'devtools', name: 'Developer tools' },
  { id: 'integration', name: 'Application integration' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'ai', name: 'Machine learning and AI' },
  { id: 'migration', name: 'Migration and transfer' },
  { id: 'cost', name: 'Cloud financial management' },
  { id: 'frontend', name: 'Front-end web and mobile' },
  { id: 'euc', name: 'End user computing' },
  { id: 'business', name: 'Business applications' },
  { id: 'iot', name: 'Internet of Things' },
  { id: 'media', name: 'Media services' },
  { id: 'other', name: 'Other (game tech, blockchain, quantum, robotics, satellite)' },
  { id: 'thirdparty', name: 'Third-party tools' }
];

/* ---- Diagrams (data only; app.js renders them as SVG) ---- */
const DG_VPC = (() => {
  const groups = [], nodes = [], edges = [];
  nodes.push({ id: 'net', x: 380, y: 6, w: 140, h: 36, label: 'Users / internet', kind: 'external' });
  groups.push({ x: 10, y: 56, w: 880, h: 498, label: 'Region: ap-southeast-2 (Sydney)' });
  groups.push({ x: 28, y: 100, w: 844, h: 442, label: 'VPC 10.20.0.0/16' });
  nodes.push({ id: 'igw', x: 385, y: 82, w: 130, h: 36, label: 'Internet gateway', kind: 'network' });
  ['a', 'b', 'c'].forEach((az, i) => {
    const x = 44 + i * 276;
    groups.push({ x, y: 140, w: 260, h: 390, label: 'Availability Zone ' + az });
    groups.push({ x: x + 10, y: 166, w: 240, h: 108, label: 'Public 10.20.' + i + '.0/24', cls: 'solid' });
    nodes.push({ id: 'nat' + i, x: x + 20, y: 206, w: 104, h: 52, label: 'NAT gateway', sub: 'Elastic IP', kind: 'network' });
    nodes.push({ id: 'alb' + i, x: x + 136, y: 206, w: 104, h: 52, label: 'ALB node', sub: 'HTTPS 443', kind: 'edge' });
    groups.push({ x: x + 10, y: 286, w: 240, h: 108, label: 'Private 10.20.' + (16 * (i + 1)) + '.0/20', cls: 'solid' });
    nodes.push({ id: 'task' + i, x: x + 70, y: 334, w: 120, h: 52, label: 'ECS task', sub: 'port 8080', kind: 'compute' });
    groups.push({ x: x + 10, y: 406, w: 240, h: 108, label: 'Isolated 10.20.' + (8 + i) + '.0/24', cls: 'solid' });
    edges.push({ from: 'igw', to: 'alb' + i });
    edges.push({ from: 'alb' + i, to: 'task' + i });
  });
  nodes.push({ id: 'rds0', x: 114, y: 446, w: 120, h: 52, label: 'RDS primary', sub: 'PostgreSQL 5432', kind: 'data' });
  nodes.push({ id: 'rds1', x: 390, y: 446, w: 120, h: 52, label: 'RDS standby', sub: 'Multi-AZ', kind: 'data' });
  edges.push({ from: 'net', to: 'igw' });
  edges.push({ from: 'task0', to: 'rds0' });
  edges.push({ from: 'task1', to: 'rds0', label: '5432' });
  edges.push({ from: 'task2', to: 'rds0' });
  edges.push({ from: 'task0', to: 'nat0', dashed: true, label: 'outbound', lp: 0.2 });
  edges.push({ from: 'rds0', to: 'rds1', dashed: true, label: 'synchronous replication' });
  return { w: 900, h: 564, groups, nodes, edges,
    caption: 'A three-AZ VPC with public, private and isolated subnets. Inbound traffic enters through the internet gateway to the load balancer. Tasks in private subnets reach the internet only through a NAT gateway. The database has no route to the internet at all. Each AZ has its own NAT gateway; only one outbound path is drawn.' };
})();

const DG_IAM = (() => {
  const steps = [
    ['Explicit Deny in any policy?', 'checked first, always wins'],
    ['Resource control policy (RCP) allows it?', 'AWS Organizations, limits resources'],
    ['Service control policy (SCP) allows it?', 'AWS Organizations, limits principals'],
    ['Resource-based policy allows it?', 'bucket policy, key policy, role trust policy'],
    ['Identity-based policy allows it?', 'attached to the user or role'],
    ['Permissions boundary allows it?', 'only if one is set'],
    ['Session policy allows it?', 'only if one was passed']
  ];
  const nodes = steps.map((s, i) => ({ id: 's' + i, x: 40, y: 16 + i * 72, w: 330, h: 48, label: s[0], sub: s[1], kind: 'security' }));
  nodes.push({ id: 'allow', x: 40, y: 524, w: 330, h: 46, label: 'Allow', kind: 'allow' });
  nodes.push({ id: 'denyA', x: 520, y: 16, w: 180, h: 192, label: 'Deny', sub: 'evaluation stops', kind: 'deny' });
  nodes.push({ id: 'allow2', x: 520, y: 232, w: 180, h: 48, label: 'Allow', sub: 'enough in the same account', kind: 'allow' });
  nodes.push({ id: 'denyB', x: 520, y: 304, w: 180, h: 192, label: 'Deny', sub: 'implicit deny', kind: 'deny' });
  const edges = [
    { from: 's0', to: 's1', label: 'no' }, { from: 's1', to: 's2', label: 'yes' }, { from: 's2', to: 's3', label: 'yes' },
    { from: 's3', to: 's4', label: 'says nothing' }, { from: 's4', to: 's5', label: 'yes' }, { from: 's5', to: 's6', label: 'yes' },
    { from: 's6', to: 'allow', label: 'yes' },
    { from: 's0', to: 'denyA', label: 'yes', hz: true }, { from: 's1', to: 'denyA', label: 'no', hz: true }, { from: 's2', to: 'denyA', label: 'no', hz: true },
    { from: 's3', to: 'allow2', label: 'yes', hz: true, dashed: true },
    { from: 's4', to: 'denyB', label: 'no', hz: true }, { from: 's5', to: 'denyB', label: 'no', hz: true }, { from: 's6', to: 'denyB', label: 'no', hz: true }
  ];
  return { w: 730, h: 586, groups: [], nodes, edges,
    caption: 'How AWS decides a request inside one account. Everything starts as an implicit deny. An explicit Deny anywhere ends the evaluation. RCPs, SCPs, permissions boundaries and session policies never grant access; they only limit what other policies grant.' };
})();

const DG_ECS = {
  w: 880, h: 384,
  groups: [{ x: 230, y: 120, w: 440, h: 122, label: 'Private subnets, one per Availability Zone' }],
  nodes: [
    { id: 'gha', x: 20, y: 16, w: 180, h: 48, label: 'GitHub Actions', sub: 'third-party CI/CD', kind: 'external' },
    { id: 'ecr', x: 250, y: 16, w: 150, h: 48, label: 'Amazon ECR', sub: 'image repository', kind: 'data' },
    { id: 'svc', x: 430, y: 16, w: 200, h: 48, label: 'ECS service', sub: 'keeps 3 tasks running', kind: 'mgmt' },
    { id: 'aas', x: 720, y: 16, w: 150, h: 48, label: 'Auto Scaling', sub: 'target tracking', kind: 'mgmt' },
    { id: 'alb', x: 16, y: 158, w: 150, h: 60, label: 'Load balancer (ALB)', sub: 'public subnets', kind: 'edge' },
    { id: 't0', x: 245, y: 158, w: 130, h: 60, label: 'Task, AZ a', sub: 'own ENI + SG', kind: 'compute' },
    { id: 't1', x: 385, y: 158, w: 130, h: 60, label: 'Task, AZ b', sub: 'own ENI + SG', kind: 'compute' },
    { id: 't2', x: 525, y: 158, w: 130, h: 60, label: 'Task, AZ c', sub: 'own ENI + SG', kind: 'compute' },
    { id: 'sm', x: 110, y: 314, w: 170, h: 48, label: 'Secrets Manager', sub: 'read at task start', kind: 'security' },
    { id: 'cw', x: 330, y: 314, w: 170, h: 48, label: 'CloudWatch Logs', sub: 'awslogs driver', kind: 'mgmt' },
    { id: 'rds', x: 550, y: 314, w: 170, h: 48, label: 'RDS PostgreSQL', sub: 'isolated subnets', kind: 'data' }
  ],
  edges: [
    { from: 'gha', to: 'ecr', label: 'push' },
    { from: 'ecr', to: 't0', dashed: true, label: 'image pull' },
    { from: 'svc', to: 't1', label: 'starts and replaces' },
    { from: 'aas', to: 'svc', label: 'desired count' },
    { from: 'alb', to: 't0', label: '8080' },
    { from: 't0', to: 'sm', dashed: true, label: 'execution role' },
    { from: 't1', to: 'cw', label: 'logs' },
    { from: 't2', to: 'rds', label: '5432' }
  ],
  caption: 'The moving parts of an ECS service on Fargate. The service keeps the desired number of tasks running across AZs and registers each task with the load balancer, which spreads requests across all three (one arrow drawn). The execution role pulls the image and reads secrets; the task role is what your application code uses.'
};

/* ---- Services ---- */
const SERVICES = [
{
  id: 'vpc', name: 'Amazon VPC', category: 'networking', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon VPC'],
  summary: 'Your own isolated network inside an AWS Region: IP ranges, subnets, routing and traffic filtering.',
  what: `<p>A virtual private cloud (VPC) is a logically isolated network in one AWS Region, owned by your account. You choose its IP address ranges, divide it into subnets, and decide which subnets can reach the internet, other networks, or nothing at all. Almost every other resource you run (EC2 instances, ECS tasks, RDS databases, load balancers) gets a network interface inside a VPC.</p>`,
  problem: `<p>Without a VPC, every resource would sit on a shared network with only application-level protection. A VPC gives you network-level control: private addressing, separation between tiers (web, application, database), a controlled path in from the internet, a controlled path out, and private links to your offices or data centres.</p>`,
  how: `<ul>
<li><b>Address space.</b> A VPC has a primary IPv4 CIDR block between <code>/16</code> (65,536 addresses) and <code>/28</code> (16 addresses). You cannot change the primary block later, but you can add secondary blocks. IPv6 is optional (dual-stack), and IPv6-only subnets are supported.</li>
<li><b>Subnets.</b> A VPC spans every Availability Zone in its Region. A subnet lives in exactly one AZ and has a CIDR block carved from the VPC range. A subnet cannot be resized after creation. AWS reserves 5 addresses in every subnet: the network address, the VPC router (+1), DNS (+2), one for future use (+3) and the last address.</li>
<li><b>Route tables.</b> Every subnet is associated with exactly one route table. A <code>local</code> route for the VPC range always exists, so everything inside the VPC can route to everything else. The most specific matching route wins.</li>
<li><b>What makes a subnet public.</b> Only its route table. A <i>public</i> subnet has a default route (<code>0.0.0.0/0</code>) to an internet gateway, and resources in it need a public IPv4 address to be reachable. A <i>private</i> subnet has a default route to a NAT gateway, so it can start outbound connections but cannot be reached from the internet. An <i>isolated</i> subnet has no default route.</li>
<li><b>Internet gateway (IGW).</b> One per VPC, horizontally scaled, no charge. It performs one-to-one address translation for resources that have public IPs.</li>
<li><b>NAT gateway.</b> A managed device placed in a public subnet with an Elastic IP. It lets private subnets reach the internet without accepting inbound connections. A standard NAT gateway lives in one AZ, so resilient designs use one per AZ. A regional NAT gateway mode that spans AZs was announced in late 2025 [[verify]].</li>
<li><b>Security groups.</b> Stateful firewalls attached to network interfaces. Allow rules only. Return traffic is allowed automatically. A rule can name another security group as its source, which is how you say "only the load balancer may call the application".</li>
<li><b>Network ACLs.</b> Stateless filters on a subnet boundary. Numbered allow and deny rules, evaluated lowest number first. Because they are stateless you must allow return traffic on ephemeral ports (1024 to 65535).</li>
<li><b>VPC endpoints.</b> Private access to AWS services without the internet. <i>Gateway endpoints</i> (S3 and DynamoDB only) are route table entries and cost nothing. <i>Interface endpoints</i> (AWS PrivateLink) are network interfaces with private IPs in your subnets, billed per hour and per GB.</li>
<li><b>DNS.</b> The Route 53 Resolver answers at the VPC base address plus two. <code>enableDnsSupport</code> and <code>enableDnsHostnames</code> must both be on for private hosted zones and interface endpoint private DNS to work.</li>
<li><b>Default quotas</b> [[verify]] (most can be raised): 5 VPCs per Region, 200 subnets per VPC, 5 IPv4 CIDR blocks per VPC, 60 inbound and 60 outbound rules per security group, 5 security groups per network interface, 20 rules per direction in a network ACL.</li>
</ul>`,
  features: [
    `<b>Secondary CIDR blocks</b>: extend a VPC that is running out of addresses.`,
    `<b>IPv6 and dual-stack</b>, with an <b>egress-only internet gateway</b> for outbound-only IPv6.`,
    `<b>Gateway and interface endpoints</b>: keep traffic to AWS services off the internet and off the NAT gateway bill.`,
    `<b>VPC Flow Logs</b>: metadata for accepted and rejected traffic, at VPC, subnet or interface level, sent to CloudWatch Logs, S3 or Data Firehose.`,
    `<b>VPC sharing</b> (through AWS RAM): one account owns the VPC, other accounts in the organisation launch resources into its subnets.`,
    `<b>IP Address Manager (IPAM)</b>: plan and track CIDR allocations across accounts and Regions.`,
    `<b>Reachability Analyzer</b> and <b>Network Access Analyzer</b>: prove whether a path exists without sending traffic.`,
    `<b>VPC Block Public Access</b>: an account-level or organisation-level switch that blocks internet gateway traffic regardless of route tables.`,
    `<b>Traffic Mirroring</b>: copy packets to inspection tools.`
  ],
  when: [
    `Any workload that runs on EC2, ECS, EKS, RDS, ElastiCache or behind a load balancer. In practice, always.`,
    `When tiers need different exposure: public entry point, private application, isolated database.`,
    `When you need private connectivity to on-premises networks (Site-to-Site VPN, Direct Connect) or to other VPCs.`
  ],
  whenNot: [
    `<b>Do not use the default VPC for production.</b> Its subnets are all public. Create a purpose-built VPC.`,
    `<b>Do not build a mesh of VPC peering connections</b> once you have more than a handful of VPCs. Peering is not transitive. Use Transit Gateway.`,
    `<b>Do not attach a Lambda function to a VPC unless it needs something private</b> (such as an RDS database). A VPC-attached function loses direct internet access and needs a NAT gateway or endpoints to call AWS APIs.`,
    `<b>Do not expose one service to another VPC by peering the whole network</b> when a single PrivateLink endpoint service would do.`
  ],
  interactions: [
    `<b>EC2, ECS, EKS, RDS, ElastiCache, Lambda (VPC-attached):</b> each gets elastic network interfaces in your subnets, protected by your security groups.`,
    `<b>Elastic Load Balancing:</b> load balancer nodes live in the subnets you choose, one per AZ.`,
    `<b>Route 53:</b> private hosted zones resolve only inside associated VPCs; Resolver endpoints connect DNS to on-premises.`,
    `<b>Transit Gateway, VPC peering, PrivateLink, VPC Lattice:</b> connect VPCs to each other.`,
    `<b>Site-to-Site VPN and Direct Connect:</b> connect a VPC to on-premises through a virtual private gateway or a transit gateway.`,
    `<b>Network Firewall and Gateway Load Balancer:</b> inspect traffic by steering it through an inspection subnet with route tables.`,
    `<b>CloudWatch Logs and S3:</b> destinations for flow logs.`
  ],
  example: {
    title: 'Three-AZ VPC with public, private and isolated subnets (Terraform)', lang: 'hcl',
    code: `data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}

resource "aws_vpc" "main" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "payments-prod" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

# Public: 10.20.0.0/24, 10.20.1.0/24, 10.20.2.0/24 (load balancer, NAT)
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
}

# Isolated: 10.20.8.0/24, 10.20.9.0/24, 10.20.10.0/24 (database, no default route)
resource "aws_subnet" "isolated" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 8)
}

# Private: 10.20.16.0/20, 10.20.32.0/20, 10.20.48.0/20 (application tasks)
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index + 1)
}

resource "aws_eip" "nat" {
  count  = 3
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  depends_on    = [aws_internet_gateway.igw]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table" "private" {
  count  = 3
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[count.index].id
  }
}

resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Free gateway endpoint so S3 traffic skips the NAT gateways
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.ap-southeast-2.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.private[*].id
}`,
    notes: `<p>The isolated subnets are left on the VPC's main route table, which has only the local route. In CloudFormation the same resources are <code>AWS::EC2::VPC</code>, <code>AWS::EC2::Subnet</code> and so on; in CDK the <code>ec2.Vpc</code> construct builds this whole layout from a few lines of subnet configuration. The <a href="#tools/cidr">CIDR calculator</a> produces the same address plan.</p>`
  },
  useCases: [
    `<b>Three-tier web application:</b> load balancer in public subnets, application in private subnets, database in isolated subnets.`,
    `<b>Payments platform:</b> the cardholder-data environment sits in its own VPC or its own account, with every path in and out explicit and logged, which keeps PCI DSS scope small.`,
    `<b>Hybrid network:</b> a VPC reachable from head office over Direct Connect, with on-premises DNS resolving AWS private names.`,
    `<b>Shared services:</b> one networking account owns the VPCs and shares subnets with workload accounts.`
  ],
  pricing: `<p>A VPC, its subnets, route tables, security groups, network ACLs and internet gateway cost nothing. You pay for what you attach:</p>
<ul><li><b>NAT gateways:</b> per hour for each gateway, plus per GB processed. Usually the biggest surprise on a network bill.</li>
<li><b>Public IPv4 addresses:</b> charged per hour for every public address, in use or not.</li>
<li><b>Interface endpoints:</b> per hour for each endpoint in each AZ, plus per GB.</li>
<li><b>Data transfer:</b> between AZs, between Regions and out to the internet.</li>
<li><b>Transit Gateway attachments, VPN connections, Traffic Mirroring, Flow Logs</b> (log ingestion and storage).</li></ul>
<p>Main cost levers: gateway endpoints for S3 and DynamoDB, keeping chatty traffic inside one AZ where resilience allows, and interface endpoints once NAT data charges exceed their hourly cost.</p>`,
  pricingLink: 'https://aws.amazon.com/vpc/pricing/',
  alternatives: [
    `There is no alternative to a VPC for VPC-based resources. The real choices are about how VPCs connect: see <a href="#compare/sg-vs-nacl">security groups vs network ACLs</a>, and (in later phases) peering vs Transit Gateway vs PrivateLink.`,
    `<b>One big VPC vs many small ones:</b> separate VPCs (and usually separate accounts) per environment give a stronger boundary than subnets inside one VPC.`
  ],
  mistakes: [
    `<b>Overlapping CIDR ranges</b> between VPCs or with the office network. They cannot be peered or routed later without address translation. Plan ranges centrally.`,
    `<b>A VPC range that is too small.</b> Load balancers, endpoints and containers that take one IP each use addresses quickly.`,
    `<b>One NAT gateway for all AZs.</b> Cheaper, but an AZ failure removes outbound access for everyone, and traffic from other AZs pays cross-AZ charges.`,
    `<b>Databases in public subnets</b>, or security groups open to <code>0.0.0.0/0</code> on SSH (22), RDP (3389) or database ports.`,
    `<b>Using network ACLs as the main firewall.</b> Use security groups for normal control; keep NACLs for coarse subnet rules and explicit denies.`,
    `<b>Forgetting return traffic in a NACL.</b> Stateless means the ephemeral port range must be allowed.`,
    `<b>Sending S3 traffic through NAT</b> when a gateway endpoint is free.`,
    `<b>No flow logs.</b> You cannot investigate what you did not record.`
  ],
  exam: {
    saa: ['1.2', '3.4', '4.4'], sap: ['1.3', '1.4', '3.2'],
    trap: `<ul><li>A private instance needs outbound internet access: the answer is a NAT gateway <i>in a public subnet</i> plus a route, never an internet gateway on the private subnet.</li>
<li>Security groups are stateful and cannot deny. Network ACLs are stateless and can. "Block this IP address" means NACL or WAF.</li>
<li>Gateway endpoints exist only for S3 and DynamoDB and are free. Everything else is an interface endpoint.</li>
<li>VPC peering is not transitive. If A peers with B and B with C, A cannot reach C.</li></ul>`,
    proAdds: `<p>The Professional exam assumes all of the above and asks about scale: dozens of VPCs across accounts joined by Transit Gateway or Cloud WAN, centralised egress and inspection VPCs, shared VPCs, hybrid DNS with Resolver endpoints, Direct Connect resilience, overlapping address ranges after a merger, IPv6 and dual-stack migration, and the data transfer cost of each design.</p>`
  },
  docs: [
    { label: 'Amazon VPC User Guide', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html' },
    { label: 'Amazon VPC quotas', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/amazon-vpc-limits.html' }
  ],
  diagram: DG_VPC
},
{
  id: 'iam', name: 'AWS Identity and Access Management (IAM)', category: 'security', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['IAM'],
  summary: 'Decides who or what can call which AWS API on which resource, on every request.',
  what: `<p>IAM is the global service that authenticates every call to an AWS API and decides whether to allow it. It has two halves: <b>principals</b> (the root user, IAM users, IAM roles, federated identities and AWS services) and <b>policies</b> (JSON documents that allow or deny actions on resources, optionally under conditions).</p>`,
  problem: `<p>One AWS account can hold hundreds of resources used by people, applications, pipelines and other AWS services. IAM lets each of them hold exactly the permissions it needs, for as short a time as possible, and gives you one place to answer "who could have done this?".</p>`,
  how: `<ul>
<li><b>Every request is denied by default.</b> AWS collects all policies that apply to the request and evaluates them (see the diagram). An explicit <code>Deny</code> in any policy wins over any <code>Allow</code>.</li>
<li><b>Policy types that grant:</b> identity-based policies (attached to users, groups, roles) and resource-based policies (attached to a resource such as an S3 bucket, KMS key or SQS queue, naming who may use it).</li>
<li><b>Policy types that only limit:</b> permissions boundaries (a ceiling for one user or role), service control policies and resource control policies (ceilings for whole accounts, set in AWS Organizations) and session policies (a ceiling for one session). None of these ever grants access.</li>
<li><b>Same account vs cross-account.</b> Inside one account, an Allow in either the identity policy or the resource policy is normally enough. Across accounts, <i>both</i> sides must allow: the resource policy in account B and the identity policy in account A.</li>
<li><b>Roles.</b> A role has no password or keys. It has a <i>trust policy</i> (who may assume it) and permissions policies (what it can do). Assuming a role calls AWS STS, which returns temporary credentials. The default session is 1 hour; a role can allow up to 12 hours; a role assumed from another role (chaining) is limited to 1 hour.</li>
<li><b>How workloads get credentials.</b> EC2 uses an instance profile, ECS a task role, Lambda an execution role. The platform delivers and rotates the temporary credentials; your code never stores keys.</li>
<li><b>Federation.</b> People sign in through IAM Identity Center or a SAML/OIDC identity provider and receive a role session. Pipelines outside AWS (GitHub Actions, GitLab) use OIDC with <code>sts:AssumeRoleWithWebIdentity</code>.</li>
<li><b>Policy language.</b> <code>Effect</code>, <code>Action</code>, <code>Resource</code>, optional <code>Condition</code>, and <code>Principal</code> in resource-based policies. Conditions can test tags (attribute-based access control), source network, MFA, organisation ID and more.</li>
<li><b>Global and eventually consistent.</b> IAM is not tied to a Region. Changes can take a few seconds to apply everywhere.</li>
<li><b>Default quotas</b> [[verify]]: 5,000 users and 1,000 roles per account, 10 managed policies per role, 6,144 characters per managed policy, 2,048 characters per role trust policy.</li>
</ul>`,
  features: [
    `<b>IAM Access Analyzer</b>: finds resources shared outside your account or organisation, finds unused access, validates policies, and generates least-privilege policies from CloudTrail activity.`,
    `<b>Permissions boundaries</b>: let teams create their own roles without being able to exceed a ceiling you set.`,
    `<b>ABAC with tags and session tags</b>: one policy that says "you may act on resources whose <code>project</code> tag matches yours".`,
    `<b>IAM Roles Anywhere</b>: temporary credentials for servers outside AWS, authenticated with X.509 certificates.`,
    `<b>OIDC and SAML identity providers</b>: trust an external issuer instead of creating IAM users.`,
    `<b>Service-linked roles</b>: predefined roles an AWS service needs to act for you.`,
    `<b>Last-accessed information and the credential report</b>: evidence for removing unused permissions and stale keys.`,
    `<b>Centralised root access management</b>: remove root credentials from member accounts in an organisation and perform root-only tasks from a central account.`
  ],
  when: [
    `Always. Every AWS design starts with who can do what.`,
    `<b>Roles</b> for anything that runs: instances, tasks, functions, pipelines, cross-account access.`,
    `<b>Resource-based policies</b> when another account or an AWS service needs access to one specific resource.`,
    `<b>Permissions boundaries</b> when you delegate role creation to development teams.`
  ],
  whenNot: [
    `<b>IAM users for people</b> in anything beyond a single small account. Use IAM Identity Center with your identity provider, so people get short-lived sessions and leave with one switch.`,
    `<b>Long-lived access keys in CI/CD.</b> Use OIDC federation so the pipeline assumes a role for each run.`,
    `<b>IAM for your application's end users.</b> Customer sign-up and sign-in belongs in Amazon Cognito or another identity provider.`,
    `<b>IAM policies for fine-grained rules inside your application</b> ("a teller may view accounts in their branch"). That is application authorisation: Amazon Verified Permissions or your own logic.`,
    `<b>Identity policies to stop administrators.</b> An account admin can edit them. Preventive, account-wide limits belong in service control policies.`
  ],
  interactions: [
    `<b>AWS STS:</b> issues the temporary credentials behind every role session.`,
    `<b>AWS Organizations:</b> service control policies and resource control policies sit above every account's IAM policies.`,
    `<b>IAM Identity Center:</b> creates roles in each account from permission sets and signs people in to them.`,
    `<b>KMS, S3, SQS, SNS, Secrets Manager, Lambda, ECR:</b> have resource-based policies evaluated together with identity policies. KMS key policies are mandatory: IAM alone cannot grant access to a key unless the key policy permits it.`,
    `<b>CloudTrail:</b> records every API call with the principal that made it.`,
    `<b>EC2, ECS, Lambda:</b> receive role credentials automatically through instance profiles, task roles and execution roles.`
  ],
  example: {
    title: 'Trust policy that lets one GitHub repository branch assume a deploy role (no stored keys)', lang: 'json',
    code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::111122223333:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:my-org/payments-api:ref:refs/heads/main"
        }
      }
    }
  ]
}`,
    notes: `<p>The <code>sub</code> condition is the control that matters: without it, any repository on GitHub could assume the role. The role's permissions policy should then allow only what a deployment needs, for example pushing to one ECR repository and updating one ECS service. In Terraform this is an <code>aws_iam_openid_connect_provider</code> plus an <code>aws_iam_role</code> whose <code>assume_role_policy</code> is the document above.</p>`
  },
  useCases: [
    `<b>Application permissions:</b> the payments API task role may read one secret and write to one queue, nothing else.`,
    `<b>Cross-account deployment:</b> a pipeline in a tooling account assumes a deploy role in the production account.`,
    `<b>Break-glass access:</b> an emergency role that requires MFA, is alarmed in CloudTrail, and is otherwise unused.`,
    `<b>Third-party access:</b> a vendor assumes a role in your account, with an external ID condition so their other customers cannot trick them into using it.`
  ],
  pricing: `<p>IAM, AWS STS and IAM Identity Center have no charge. IAM Access Analyzer's external-access findings are free; its unused-access analysis and custom policy checks are paid features (charged per identity analysed and per check). You still pay for whatever the principals do with their permissions.</p>`,
  pricingLink: 'https://aws.amazon.com/iam/',
  alternatives: [
    `<b>IAM Identity Center</b> for workforce sign-in across accounts (it builds on IAM roles; it does not replace them).`,
    `<b>Amazon Cognito</b> for customers signing in to your application.`,
    `<b>Amazon Verified Permissions</b> for authorisation decisions inside your application.`,
    `<b>Service control policies and resource control policies</b> for organisation-wide limits that account administrators cannot remove.`
  ],
  mistakes: [
    `<b>Using the root user</b> for daily work, or leaving it without MFA.`,
    `<b>Wildcards everywhere:</b> <code>"Action": "*"</code> with <code>"Resource": "*"</code>. Start from the specific actions and resources and widen only when something fails.`,
    `<b>Unrestricted <code>iam:PassRole</code>.</b> Anyone who can pass any role to a service can run code with that role's permissions. Restrict it to named roles.`,
    `<b>Trusting a whole account or <code>*</code> in a trust policy</b> without conditions. For third parties add an external ID; for your own organisation add <code>aws:PrincipalOrgID</code>.`,
    `<b>An OIDC trust policy without a <code>sub</code> condition.</b>`,
    `<b>Assuming an SCP grants access.</b> It never does. The principal still needs an identity or resource policy that allows the action.`,
    `<b>Forgetting the KMS key policy</b> when a role "has permission" but decryption still fails.`,
    `<b>Access keys that never rotate</b>, committed to source control or baked into images.`
  ],
  exam: {
    saa: ['1.1'], sap: ['2.1', '2.3'],
    trap: `<ul><li>An explicit Deny always wins, wherever it is.</li>
<li>"An application on EC2 needs access to S3 securely": an IAM role through an instance profile, never access keys on the instance.</li>
<li>SCPs limit, never grant, and do not apply to the organisation's management account.</li>
<li>Cross-account access needs an Allow on both sides.</li>
<li>"Let developers create roles but never exceed X": a permissions boundary.</li></ul>`,
    proAdds: `<p>The Professional exam moves from single policies to identity architecture: federation with a corporate identity provider, permission sets across many accounts, data perimeters built from SCPs, RCPs and VPC endpoint policies, ABAC to avoid a policy per team, least-privilege cross-account patterns, IAM Roles Anywhere for hybrid workloads, and OAuth 2.0 with Cognito for application users.</p>`
  },
  docs: [
    { label: 'IAM User Guide', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html' },
    { label: 'Policy evaluation logic', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html' },
    { label: 'Security best practices in IAM', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html' }
  ],
  diagram: DG_IAM
},
{
  id: 'ecs', name: 'Amazon ECS on AWS Fargate', category: 'containers', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon ECS', 'AWS Fargate'],
  summary: 'Run containers as long-lived services or one-off tasks without managing servers or a Kubernetes control plane.',
  what: `<p>Amazon Elastic Container Service (ECS) is AWS's own container orchestrator: you describe a container workload and ECS starts it, keeps it running, connects it to a load balancer and replaces it when it fails. AWS Fargate is the serverless compute engine underneath: each task runs in its own isolated environment that AWS provisions, patches and retires. Together they give you containers with no EC2 instances to manage.</p>`,
  problem: `<p>Running containers yourself means running a fleet: choosing instance sizes, patching hosts, packing containers onto them, replacing failed nodes and scaling two layers (hosts and containers). ECS on Fargate removes the host layer. You size and scale tasks; AWS handles everything below.</p>`,
  how: `<ul>
<li><b>Task definition.</b> A versioned blueprint: container images, CPU and memory, ports, environment variables, secrets, logging and two IAM roles. Each change creates a new revision.</li>
<li><b>Task.</b> One running copy of a task definition. On Fargate a task gets between 0.25 and 16 vCPU and 0.5 to 120 GB of memory, in fixed combinations, and 20 GiB of ephemeral storage by default (configurable up to 200 GiB).</li>
<li><b>Service.</b> Keeps a desired number of tasks running, spreads them across Availability Zones, registers them with a load balancer target group and performs deployments. A <b>cluster</b> is the logical grouping services and tasks belong to.</li>
<li><b>Networking.</b> Fargate tasks always use <code>awsvpc</code> mode: every task gets its own network interface, private IP and security groups in your subnet. Load balancer target groups must therefore use target type <code>ip</code>.</li>
<li><b>Two roles, often confused.</b> The <i>task execution role</i> is used by ECS itself to pull the image from ECR, write logs and fetch secrets. The <i>task role</i> is what your application code uses to call AWS APIs.</li>
<li><b>Getting the image.</b> A task in a private subnet needs a path to ECR: either a NAT gateway, or interface endpoints for <code>ecr.api</code> and <code>ecr.dkr</code> plus the S3 gateway endpoint (image layers are stored in S3). Add endpoints for CloudWatch Logs and Secrets Manager if the task uses them.</li>
<li><b>Deployments.</b> Rolling updates replace tasks gradually, controlled by minimum healthy and maximum percent. The deployment circuit breaker stops and rolls back a deployment whose tasks keep failing. Blue/green deployments shift traffic between two task sets, through CodeDeploy or ECS's built-in blue/green strategy [[verify]].</li>
<li><b>Scaling.</b> Application Auto Scaling adjusts the desired count, usually with target tracking on CPU, memory or requests per target.</li>
<li><b>Stopping.</b> ECS sends <code>SIGTERM</code>, waits for the stop timeout (30 seconds by default, up to 120 on Fargate), then sends <code>SIGKILL</code>. Fargate Spot tasks receive a two-minute warning before interruption.</li>
<li><b>What Fargate does not offer:</b> GPUs [[verify]], privileged containers, host networking, or the daemon scheduling strategy. Those need ECS on EC2.</li>
</ul>`,
  features: [
    `<b>Capacity providers</b> <code>FARGATE</code> and <code>FARGATE_SPOT</code>: mix on-demand and interruptible capacity with a base and weights.`,
    `<b>Deployment circuit breaker with automatic rollback.</b>`,
    `<b>Secrets injection</b> from Secrets Manager or Parameter Store at task start, so values never appear in the task definition.`,
    `<b>ECS Service Connect</b>: service-to-service discovery and traffic metrics without running your own mesh.`,
    `<b>ECS Exec</b>: open a shell in a running container through Systems Manager, with the session logged.`,
    `<b>Graviton (ARM64) tasks</b>: usually cheaper per vCPU if your image is built for ARM.`,
    `<b>EFS and EBS volumes</b> for tasks that need persistent or larger storage.`,
    `<b>Container Insights</b> and <b>GuardDuty Runtime Monitoring</b> for task-level metrics and threat detection.`,
    `<b>Scheduled and event-driven tasks</b> started by EventBridge.`
  ],
  when: [
    `Stateless HTTP APIs and web applications behind an Application Load Balancer.`,
    `Background workers that read from SQS, and scheduled batch jobs.`,
    `Teams that want containers without running Kubernetes or patching hosts.`,
    `Workloads with variable load, where paying per task-second beats paying for idle instances.`
  ],
  whenNot: [
    `<b>You need Kubernetes</b> (existing manifests, Helm charts, operators, portability across clouds): use Amazon EKS.`,
    `<b>You need GPUs, privileged containers, daemon tasks or a specific instance family:</b> use ECS on EC2.`,
    `<b>Large, steady fleets where compute cost dominates:</b> well-packed EC2 instances with Savings Plans or Spot usually cost less per vCPU than Fargate.`,
    `<b>Short, event-driven work that can finish within 15 minutes and scales to zero:</b> AWS Lambda is simpler.`,
    `<b>A single simple web service with no need for VPC-level control:</b> AWS App Runner needs less setup.`
  ],
  interactions: [
    `<b>Amazon ECR:</b> stores the images; scan-on-push and lifecycle policies keep the repository clean.`,
    `<b>Elastic Load Balancing:</b> an ALB (HTTP) or NLB (TCP) in front of the service; ECS registers and deregisters task IPs.`,
    `<b>IAM:</b> task execution role and task role.`,
    `<b>Secrets Manager and Parameter Store:</b> secrets injected as environment variables at start.`,
    `<b>CloudWatch:</b> logs through the <code>awslogs</code> driver (or FireLens for other destinations), metrics, alarms, Container Insights.`,
    `<b>Application Auto Scaling:</b> scales the service's desired count.`,
    `<b>CodeDeploy and CodePipeline:</b> blue/green deployments and release pipelines.`,
    `<b>EventBridge:</b> runs scheduled tasks and receives task state-change events.`,
    `<b>VPC:</b> subnets, security groups and endpoints decide what a task can reach.`
  ],
  example: {
    title: 'Task definition and service for a Spring Boot API (Terraform)', lang: 'hcl',
    code: `resource "aws_ecs_task_definition" "api" {
  family                   = "payments-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.task_execution.arn # pull image, logs, secrets
  task_role_arn            = aws_iam_role.task.arn           # what the app may call

  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([{
    name         = "api"
    image        = "\${aws_ecr_repository.api.repository_url}@\${var.image_digest}"
    essential    = true
    portMappings = [{ containerPort = 8080, protocol = "tcp" }]
    secrets = [{
      name      = "SPRING_DATASOURCE_PASSWORD"
      valueFrom = aws_secretsmanager_secret.db.arn
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "api"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name            = "payments-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn # target_type must be "ip"
    container_name   = "api"
    container_port   = 8080
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  health_check_grace_period_seconds = 60
}`,
    notes: `<p>The image is referenced by digest, not by a tag such as <code>latest</code>, so a deployment always runs exactly the image that was tested. In CloudFormation these are <code>AWS::ECS::TaskDefinition</code> and <code>AWS::ECS::Service</code>; in CDK the <code>ApplicationLoadBalancedFargateService</code> pattern creates the service, load balancer and roles together.</p>`
  },
  useCases: [
    `<b>Payments API:</b> three tasks across three AZs behind an ALB, scaling on request count, database password injected from Secrets Manager.`,
    `<b>Queue workers:</b> a service that scales on SQS queue depth and runs on Fargate Spot because jobs can be retried.`,
    `<b>Nightly reconciliation job:</b> an EventBridge schedule runs one task, which exits when finished.`,
    `<b>Migration target:</b> a Docker Compose application moved to AWS with little change.`
  ],
  pricing: `<p>ECS itself has no charge on Fargate. Fargate bills for the vCPU and memory a task requests, per second with a one-minute minimum, from image pull until the task stops. Ephemeral storage above the included 20 GiB is extra.</p>
<ul><li><b>Fargate Spot</b> is substantially cheaper in exchange for possible interruption.</li>
<li><b>Compute Savings Plans</b> apply to Fargate.</li>
<li><b>ARM64 (Graviton)</b> tasks have a lower rate than x86.</li>
<li>Around it you also pay for the load balancer, NAT gateway or interface endpoints, CloudWatch Logs ingestion and data transfer.</li></ul>
<p>Main cost drivers: over-sized task definitions, tasks left running in non-production environments, and verbose logs.</p>`,
  pricingLink: 'https://aws.amazon.com/fargate/pricing/',
  alternatives: [
    `<b>ECS on EC2:</b> same orchestrator, you manage the instances. More control and often cheaper at steady scale. ECS Managed Instances, announced in 2025, has AWS manage those instances for you [[verify]].`,
    `<b>Amazon EKS:</b> managed Kubernetes. Choose it for the Kubernetes ecosystem, not for simplicity.`,
    `<b>AWS Lambda:</b> no containers to keep running; limited to 15 minutes per invocation.`,
    `<b>AWS App Runner:</b> source or image to HTTPS endpoint with almost no configuration.`,
    `<b>Elastic Beanstalk:</b> older platform-as-a-service that manages EC2 for you.`
  ],
  mistakes: [
    `<b>Mixing up the two roles.</b> "Access denied" while pulling the image or reading a secret is the execution role. "Access denied" inside your code is the task role.`,
    `<b>No route to ECR.</b> A task in a private subnet with no NAT gateway and no endpoints fails with <code>CannotPullContainerError</code>.`,
    `<b>Tasks in public subnets with public IPs</b> to avoid NAT. It works, and it puts your application directly on the internet.`,
    `<b>Deploying the <code>latest</code> tag.</b> You cannot tell which code is running or roll back reliably. Use immutable tags or digests.`,
    `<b>Secrets as plain environment variables</b> in the task definition, visible to anyone who can describe it.`,
    `<b>No circuit breaker.</b> A broken image makes ECS start and stop tasks indefinitely.`,
    `<b>Health check grace period too short</b> for a slow-starting JVM, so the load balancer kills tasks before they are ready.`,
    `<b>Ignoring <code>SIGTERM</code>.</b> In-flight requests are dropped on every deployment unless the application shuts down gracefully.`,
    `<b>Target group type <code>instance</code></b> instead of <code>ip</code>.`,
    `<b>No log retention set</b>, so CloudWatch Logs keeps everything forever.`
  ],
  exam: {
    saa: ['2.1', '3.2', '4.2'], sap: ['1.1', '4.2', '5.2', '5.3'],
    trap: `<ul><li>"Run containers with the least operational overhead": Fargate. "Must use Kubernetes": EKS. "Needs GPUs or host access": the EC2 launch type.</li>
<li>Permissions for application code go on the task role, not the execution role and not the instance profile.</li>
<li>Fargate Spot suits fault-tolerant workers, not a service that must never drop below its desired count.</li></ul>`,
    proAdds: `<p>The Professional exam adds deployment strategy (blue/green and canary with automatic rollback), cross-account pipelines that promote one image through environments, image scanning and signing, service-to-service communication with Service Connect or VPC Lattice, capacity provider strategies for cost, Container Insights, and multi-cluster or multi-Region designs for disaster recovery.</p>`
  },
  docs: [
    { label: 'Amazon ECS Developer Guide', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html' },
    { label: 'AWS Fargate for Amazon ECS', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html' }
  ],
  diagram: DG_ECS
}
];

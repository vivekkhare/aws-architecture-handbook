/* ===== Phase 2, batch B: storage ===== */
SERVICES.push(
{
  id: 's3', name: 'Amazon S3', category: 'storage', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon S3', 'Amazon S3 Glacier'],
  summary: 'Object storage for any amount of data: files, backups, static websites, logs and data lakes.',
  what: `<p>Amazon Simple Storage Service stores <i>objects</i> (a file plus metadata) in <i>buckets</i>. There are no disks to size and no capacity to plan. It is designed for 99.999999999% (eleven nines) durability and is the default place to put data that is not a database record or a mounted file system.</p>`,
  problem: `<p>File servers fill up, fail and need backups. S3 removes capacity planning and hardware failure from the picture, and adds storage classes that lower the price of data as it ages.</p>`,
  how: `<ul>
<li><b>Buckets and keys.</b> A bucket lives in one Region and has a globally unique name. An object is addressed by a key (its full name). Folders are just key prefixes. One object could long be up to 5 TB; AWS raised the limit to 50 TB in late 2025 [[verify]]; uploads over 100 MB should use multipart upload.</li>
<li><b>Consistency.</b> Reads after writes are strongly consistent.</li>
<li><b>Access control.</b> Access is private by default. Use IAM policies and bucket policies. <i>Block Public Access</i> is on by default and overrides anything that would make data public. ACLs are disabled by default (Object Ownership: bucket owner enforced). <i>Access points</i> give each application its own policy on a shared bucket.</li>
<li><b>Encryption.</b> Every new object is encrypted at rest with SSE-S3 by default. SSE-KMS adds key control and audit; DSSE-KMS applies two layers; SSE-C uses a key you send with each request. A bucket policy can require TLS with <code>aws:SecureTransport</code>.</li>
<li><b>Versioning</b> keeps every version of an object; a delete adds a delete marker instead of removing data. It is required for replication and Object Lock.</li>
<li><b>Lifecycle rules</b> move objects to cheaper classes and expire them after a set age.</li>
<li><b>Replication.</b> Same-Region or Cross-Region, asynchronous, new objects only unless you run Batch Replication. Replication Time Control gives a 15-minute target.</li>
<li><b>Object Lock</b> makes objects write-once-read-many. <i>Compliance</i> mode cannot be removed by anyone, including root; <i>governance</i> mode can be bypassed with a special permission.</li>
<li><b>Presigned URLs</b> give time-limited access to one object without making it public.</li>
<li><b>Event notifications</b> to Lambda, SQS, SNS or EventBridge when objects change.</li>
</ul>
<h3>Storage classes</h3>
<div class="tablewrap"><table><thead><tr><th>Class</th><th>Use it for</th><th>Know this</th></tr></thead><tbody>
<tr><td>S3 Standard</td><td>Frequently accessed data</td><td>No retrieval fee or minimum duration</td></tr>
<tr><td>S3 Intelligent-Tiering</td><td>Unknown or changing access patterns</td><td>Moves objects between tiers automatically for a small monitoring fee; no retrieval fee</td></tr>
<tr><td>S3 Standard-IA</td><td>Infrequent access, needed in milliseconds</td><td>Retrieval fee; 30-day minimum; 128 KB minimum billable size</td></tr>
<tr><td>S3 One Zone-IA</td><td>Infrequent, re-creatable data</td><td>One Availability Zone only; cheaper</td></tr>
<tr><td>S3 Glacier Instant Retrieval</td><td>Archive read about once a quarter, in milliseconds</td><td>90-day minimum</td></tr>
<tr><td>S3 Glacier Flexible Retrieval</td><td>Archive, retrieval in minutes to hours</td><td>90-day minimum; expedited, standard and bulk retrievals</td></tr>
<tr><td>S3 Glacier Deep Archive</td><td>Long-term retention, retrieval within 12 hours (bulk up to 48)</td><td>180-day minimum; lowest storage price</td></tr>
<tr><td>S3 Express One Zone</td><td>Single-digit millisecond access for compute in the same zone</td><td>Directory buckets; one zone</td></tr>
</tbody></table></div>`,
  features: [
    `<b>Storage classes and lifecycle rules</b> to match cost to access pattern.`,
    `<b>Versioning, replication and Object Lock</b> for protection and compliance.`,
    `<b>Block Public Access, access points and Multi-Region Access Points.</b>`,
    `<b>Transfer Acceleration</b> (uploads through edge locations) and multipart upload.`,
    `<b>Static website hosting</b>, normally fronted by CloudFront with origin access control.`,
    `<b>S3 Tables and S3 Vectors</b>: managed Apache Iceberg tables for analytics, and vector storage for AI retrieval [[verify]].`,
    `<b>Storage Lens and Storage Class Analysis</b> for usage and cost insight.`
  ],
  when: [`Files uploaded by users, application assets, logs, backups and archives.`, `A data lake queried by Athena, Redshift Spectrum or EMR.`, `Static site content behind CloudFront.`, `Immutable records that must be retained for years.`],
  whenNot: [
    `<b>A file system mounted by many servers with file locking:</b> Amazon EFS or FSx.`,
    `<b>A boot or database volume:</b> Amazon EBS.`,
    `<b>Frequent small in-place updates or queries by attribute:</b> a database.`,
    `<b>Sub-millisecond access:</b> a cache or a local volume.`
  ],
  interactions: [
    `<b>CloudFront:</b> serves private bucket content globally through origin access control.`,
    `<b>KMS:</b> SSE-KMS encryption; S3 Bucket Keys reduce KMS request cost.`,
    `<b>Lambda, SQS, SNS, EventBridge:</b> react to object events.`,
    `<b>Athena, Glue, Lake Formation, Redshift:</b> analytics directly on S3 data.`,
    `<b>VPC gateway endpoint:</b> free private path from a VPC to S3.`,
    `<b>CloudTrail data events and server access logs:</b> who read what.`,
    `<b>AWS Backup, DataSync, Storage Gateway, Transfer Family, Snow Family:</b> ways data gets in and is protected.`
  ],
  example: { title: 'Private, versioned, encrypted bucket with a lifecycle rule (Terraform)', lang: 'hcl',
    code: `resource "aws_s3_bucket" "docs" {
  bucket = "example-payments-documents"
}

resource "aws_s3_bucket_public_access_block" "docs" {
  bucket                  = aws_s3_bucket.docs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "docs" {
  bucket = aws_s3_bucket.docs.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "docs" {
  bucket = aws_s3_bucket.docs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.data.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "docs" {
  bucket = aws_s3_bucket.docs.id
  rule {
    id     = "age-out"
    status = "Enabled"
    filter {}
    transition { days = 90   storage_class = "STANDARD_IA" }
    transition { days = 365  storage_class = "DEEP_ARCHIVE" }
    noncurrent_version_expiration { noncurrent_days = 90 }
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }
}`,
    notes: `<p>The last two lines are the ones people forget: old versions and abandoned multipart uploads are billed until a rule removes them. (Transition blocks are condensed onto one line here; Terraform needs each argument on its own line.)</p>` },
  useCases: [
    `<b>Customer statements:</b> generated PDFs in a private bucket, downloaded through presigned URLs that expire in minutes.`,
    `<b>Audit logs:</b> CloudTrail delivered to a bucket with Object Lock in compliance mode.`,
    `<b>Flutter web app:</b> static build in S3, served only through CloudFront.`,
    `<b>Data lake:</b> raw, cleaned and curated prefixes, catalogued by Glue and queried by Athena.`
  ],
  pricing: `<p>You pay for storage per GB-month (by class), requests, data retrieved from infrequent and archive classes, data transferred out to the internet or other Regions, and optional features such as replication, inventory and Intelligent-Tiering monitoring. Transfer in is free, and so is transfer to CloudFront. The usual surprises are request charges on millions of tiny objects, minimum storage durations, and old versions nobody expires.</p>`,
  pricingLink: 'https://aws.amazon.com/s3/pricing/',
  alternatives: [`<b>Amazon EFS:</b> shared POSIX file system for Linux.`, `<b>Amazon FSx:</b> Windows, Lustre, NetApp ONTAP or OpenZFS file systems.`, `<b>Amazon EBS:</b> block volume for one instance.`, `<b>AWS Storage Gateway:</b> S3-backed storage presented on premises as files, volumes or tapes.`],
  mistakes: [
    `<b>Turning off Block Public Access</b> to make one file public. Use CloudFront or a presigned URL.`,
    `<b>Versioning with no rule to expire old versions.</b>`,
    `<b>Moving small or short-lived objects to an infrequent-access class</b>, where minimum size and duration charges cost more than Standard.`,
    `<b>Expecting replication to copy existing objects</b> or to act as a backup. A delete marker can replicate too if you enable it.`,
    `<b>SSE-KMS without Bucket Keys</b> on a busy bucket: high KMS cost and throttling.`,
    `<b>A bucket policy that grants a whole account access when one role was meant.</b>`,
    `<b>No <code>aws:SecureTransport</code> condition</b> where encryption in transit is a requirement.`
  ],
  exam: { saa: ['1.3', '2.2', '3.1', '4.1'], sap: ['1.5', '3.4', '4.2'],
    trap: `<ul>
<li>Unknown or changing access pattern: Intelligent-Tiering. Rarely read but needed instantly: Standard-IA or Glacier Instant Retrieval. Compliance archive retrieved in hours: Glacier Flexible Retrieval or Deep Archive.</li>
<li>"Cannot be deleted by anyone for seven years": Object Lock in compliance mode.</li>
<li>"Private content delivered globally": CloudFront with origin access control, not a public bucket.</li>
<li>"Temporary access to one object for a user without AWS credentials": presigned URL.</li>
<li>"Faster uploads from distant users": Transfer Acceleration or multipart upload.</li>
<li>Cross-Region Replication needs versioning on both buckets.</li>
<li>One Zone-IA only for data you can recreate.</li>
</ul>`,
    proAdds: `<p>Data perimeters with RCPs and VPC endpoint policies, Multi-Region Access Points with failover, cross-account access patterns, replication for DR with defined RPO, lifecycle and class design at petabyte scale, and S3 as the base of a governed data lake.</p>` },
  docs: [{ label: 'Amazon S3 User Guide', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' }, { label: 'S3 storage classes', url: 'https://aws.amazon.com/s3/storage-classes/' }]
},
{
  id: 'ebs', name: 'Amazon EBS', category: 'storage', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon EBS'],
  summary: 'Network-attached block volumes for EC2 instances: the disks that hold operating systems and databases.',
  what: `<p>Amazon Elastic Block Store provides persistent block storage volumes that attach to EC2 instances. A volume behaves like a raw disk: you format it, mount it and can run a database on it. It outlives the instance if you want it to.</p>`,
  problem: `<p>The disk physically inside an EC2 host (instance store) is lost when the instance stops. EBS gives durable disks that can be resized, snapshotted and moved between instances.</p>`,
  how: `<ul>
<li><b>Zonal.</b> A volume lives in one Availability Zone and attaches only to instances in that zone. Moving data to another zone or Region goes through a snapshot.</li>
<li><b>Volume types.</b> <code>gp3</code> is the general-purpose SSD default; IOPS and throughput are set independently of size. <code>io2 Block Express</code> is for the highest IOPS and durability. <code>st1</code> (throughput HDD) suits large sequential workloads; <code>sc1</code> (cold HDD) is the cheapest. HDD types cannot be boot volumes. <code>gp2</code> and <code>io1</code> are older generations.</li>
<li><b>Snapshots</b> are incremental backups stored in S3 by AWS. They can be copied across Regions and accounts, archived to a cheaper tier, and used to create new volumes or AMIs.</li>
<li><b>Encryption</b> uses KMS and covers data at rest, in transit to the instance, and all snapshots. Turn on <i>encryption by default</i> per Region. An unencrypted volume is encrypted by copying its snapshot with encryption enabled.</li>
<li><b>Elastic Volumes.</b> Size, type and performance can change while the volume is in use.</li>
<li><b>Multi-Attach</b> lets an io1 or io2 volume attach to several instances in the same zone, for clustered software that manages concurrent writes.</li>
<li><b>Delete on termination</b> is on by default for root volumes and off for additional ones.</li>
</ul>`,
  features: [`<b>gp3</b> with independently provisioned IOPS and throughput.`, `<b>Snapshots</b>, Fast Snapshot Restore, snapshot archive and Recycle Bin.`, `<b>Amazon Data Lifecycle Manager</b> to automate snapshot schedules.`, `<b>Encryption by default.</b>`, `<b>Snapshot lock</b> for write-once retention.`],
  when: [`Boot volumes and data volumes for EC2.`, `Self-managed databases that need consistent IOPS.`, `Any single-instance workload needing a file system.`],
  whenNot: [`<b>Storage shared by many instances across zones:</b> EFS or FSx.`, `<b>Objects and archives:</b> S3.`, `<b>Temporary scratch space needing extreme speed:</b> instance store.`, `<b>A managed database is acceptable:</b> RDS or Aurora manage their own storage.`],
  interactions: [`<b>EC2:</b> attachment and EBS-optimised throughput limits per instance type.`, `<b>KMS:</b> encryption.`, `<b>AWS Backup and Data Lifecycle Manager:</b> snapshot policies.`, `<b>CloudWatch:</b> volume metrics such as queue length and burst balance.`, `<b>Compute Optimizer:</b> right-sizing recommendations.`],
  example: { title: 'Encrypted gp3 data volume attached to an instance (Terraform)', lang: 'hcl',
    code: `resource "aws_ebs_volume" "data" {
  availability_zone = aws_instance.app.availability_zone
  size              = 200
  type              = "gp3"
  iops              = 6000
  throughput        = 250
  encrypted         = true
  kms_key_id        = aws_kms_key.data.arn
}

resource "aws_volume_attachment" "data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.data.id
  instance_id = aws_instance.app.id
}`,
    notes: `<p>The volume must be in the same Availability Zone as the instance, which is why the zone is read from the instance.</p>` },
  useCases: [`<b>Self-managed PostgreSQL:</b> io2 volume for the data directory, snapshots every hour.`, `<b>Cross-Region DR:</b> snapshots copied to a second Region nightly.`, `<b>Cost fix:</b> migrating gp2 volumes to gp3.`],
  pricing: `<p>Charged per GB-month provisioned (not used), plus provisioned IOPS and throughput above the gp3 baseline, plus snapshot storage per GB-month. Unattached volumes and forgotten snapshots keep costing money.</p>`,
  pricingLink: 'https://aws.amazon.com/ebs/pricing/',
  alternatives: [`<b>Instance store:</b> free with the instance, very fast, lost on stop or failure.`, `<b>EFS:</b> shared, elastic, multi-AZ.`, `<b>FSx:</b> managed file systems with specific protocols.`],
  mistakes: [`<b>Assuming a volume can follow an instance to another zone.</b>`, `<b>Unattached volumes and old snapshots</b> left running up charges.`, `<b>gp2 kept out of habit</b> when gp3 is cheaper and faster for most workloads.`, `<b>Treating snapshots of a busy database as consistent</b> without quiescing or using application-aware backups.`, `<b>Instance type's EBS throughput limit lower than the volume's</b>, so the volume never reaches its provisioned performance.`],
  exam: { saa: ['1.3', '3.1', '4.1'], sap: ['1.5', '3.4'],
    trap: `<ul><li>EBS is single-AZ. "Shared across instances in multiple zones" is EFS.</li><li>Highest IOPS for a critical database: io2 Block Express. Large sequential, low cost: st1. Lowest cost, rarely accessed: sc1.</li><li>Encrypt an existing unencrypted volume: snapshot, copy with encryption, restore.</li><li>Data on instance store is lost when the instance stops.</li></ul>`,
    proAdds: `<p>Snapshot strategy at scale (lifecycle policies, cross-account copies into a backup account, archive tier), and storage cost optimisation across a fleet.</p>` },
  docs: [{ label: 'Amazon EBS User Guide', url: 'https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html' }]
},
{
  id: 'efs', name: 'Amazon EFS', category: 'storage', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon EFS'],
  summary: 'A shared, elastic NFS file system for Linux workloads that many instances, containers and functions can mount at once.',
  what: `<p>Amazon Elastic File System is a managed NFS file system. It grows and shrinks automatically, stores data across multiple Availability Zones, and can be mounted by thousands of clients at the same time.</p>`,
  problem: `<p>Some applications need a real shared file system: content management, shared configuration, home directories, machine learning data sets. EBS cannot be shared across zones and S3 is not a file system.</p>`,
  how: `<ul>
<li><b>Protocol.</b> NFS version 4. Linux only; Windows workloads use FSx for Windows File Server.</li>
<li><b>Mount targets.</b> One per Availability Zone, each with a security group that must allow TCP 2049 from the clients.</li>
<li><b>File system types.</b> <i>Regional</i> (multi-AZ, the default) or <i>One Zone</i> (cheaper, single zone).</li>
<li><b>Storage classes.</b> Standard, Infrequent Access and Archive. Lifecycle management moves files that have not been read for a set time to the cheaper classes and back on access.</li>
<li><b>Throughput modes.</b> <i>Elastic</i> (pay for what you use, recommended), <i>Provisioned</i>, or <i>Bursting</i> (scales with stored size).</li>
<li><b>Access points</b> give an application its own entry point with an enforced POSIX user and root directory.</li>
<li><b>Encryption</b> at rest with KMS (chosen at creation) and in transit with TLS through the mount helper.</li>
<li><b>Clients.</b> EC2, ECS, EKS, Fargate and Lambda, plus on-premises servers over Direct Connect or VPN.</li>
</ul>`,
  features: [`<b>Elastic capacity</b> with no provisioning.`, `<b>Multi-AZ by default.</b>`, `<b>Lifecycle to Infrequent Access and Archive.</b>`, `<b>Replication</b> to another Region or zone.`, `<b>Access points and IAM authorisation.</b>`],
  when: [`Shared content or state across a fleet of Linux instances or containers.`, `Persistent storage for Fargate tasks or Lambda functions.`, `Lift-and-shift of applications that expect a POSIX file system.`],
  whenNot: [`<b>Windows or SMB:</b> FSx for Windows File Server.`, `<b>High-performance computing scratch:</b> FSx for Lustre.`, `<b>One instance needing a low-latency disk:</b> EBS is cheaper and faster.`, `<b>Static assets served to the web:</b> S3.`],
  interactions: [`<b>EC2, ECS, EKS, Lambda:</b> mount the file system.`, `<b>AWS Backup:</b> scheduled backups.`, `<b>DataSync:</b> migrating data in.`, `<b>KMS, IAM, security groups:</b> protection.`],
  example: { title: 'Mount on Amazon Linux with encryption in transit', lang: 'bash',
    code: `sudo dnf install -y amazon-efs-utils
sudo mkdir -p /mnt/shared
sudo mount -t efs -o tls,iam fs-0123456789abcdef0:/ /mnt/shared

# Persist across reboots
echo "fs-0123456789abcdef0:/ /mnt/shared efs _netdev,tls,iam 0 0" | sudo tee -a /etc/fstab`,
    notes: `<p>If the mount hangs, the mount target's security group is almost always missing an inbound rule for TCP 2049 from the instance's security group.</p>` },
  useCases: [`<b>WordPress or a CMS:</b> uploads shared by every web server.`, `<b>Batch processing:</b> a working directory shared by Fargate tasks.`, `<b>Lambda:</b> large libraries or models kept outside the deployment package.`],
  pricing: `<p>Charged per GB-month stored by storage class, plus data read and written under Elastic throughput (or provisioned throughput), plus access charges for the infrequent classes. Per GB it costs several times more than EBS gp3 or S3 Standard, so lifecycle policies matter.</p>`,
  pricingLink: 'https://aws.amazon.com/efs/pricing/',
  alternatives: [`<b>FSx for Windows File Server, Lustre, NetApp ONTAP, OpenZFS:</b> other protocols and performance profiles.`, `<b>S3 with Mountpoint:</b> file-like access to objects for read-heavy workloads.`, `<b>EBS Multi-Attach:</b> narrow clustered use within one zone.`],
  mistakes: [`<b>Security group not allowing NFS.</b>`, `<b>Bursting throughput on a small file system</b> that runs out of burst credits.`, `<b>No lifecycle policy</b>, paying Standard rates for cold files.`, `<b>Using EFS as a database volume</b> for latency-sensitive engines.`, `<b>Choosing One Zone for data that cannot be recreated.</b>`],
  exam: { saa: ['3.1', '4.1', '2.2'], sap: ['1.5', '3.4'],
    trap: `<ul><li>"Shared file storage for Linux instances across Availability Zones": EFS.</li><li>"Windows, SMB, Active Directory": FSx for Windows File Server.</li><li>"Containers on Fargate need persistent shared storage": EFS.</li></ul>`,
    proAdds: `<p>Choosing between EFS, the FSx family and S3 for a migration, and replication for DR.</p>` },
  docs: [{ label: 'Amazon EFS User Guide', url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html' }]
},
{
  id: 'fsx', name: 'Amazon FSx', category: 'storage', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon FSx (for all types)', 'Amazon FSx'],
  summary: 'Managed file systems built on four well-known products: Windows File Server, Lustre, NetApp ONTAP and OpenZFS.',
  what: `<p>Amazon FSx runs commercial and open-source file systems as a managed service, so an application that depends on a specific file system's features and protocol can move to AWS unchanged.</p>`,
  problem: `<p>EFS covers NFS on Linux. Many workloads need something else: SMB with Active Directory, a parallel file system for high-performance computing, or the snapshot and cloning features of NetApp or ZFS.</p>`,
  how: `<div class="tablewrap"><table><thead><tr><th>FSx for</th><th>Protocol</th><th>Choose it when</th></tr></thead><tbody>
<tr><td>Windows File Server</td><td>SMB</td><td>Windows applications, Active Directory permissions, DFS namespaces, SQL Server shares. Single-AZ or Multi-AZ.</td></tr>
<tr><td>Lustre</td><td>Lustre (Linux)</td><td>High-performance computing, machine learning training, media rendering. Sub-millisecond latency, very high throughput. Links to an S3 bucket to present objects as files. <i>Scratch</i> (temporary, no replication) or <i>persistent</i> deployments.</td></tr>
<tr><td>NetApp ONTAP</td><td>NFS, SMB, iSCSI</td><td>Migrating NetApp environments, or one system that must serve Linux, Windows and block clients. SnapMirror replication, deduplication, tiering to cheaper capacity storage.</td></tr>
<tr><td>OpenZFS</td><td>NFS</td><td>Migrating ZFS or Linux file servers that rely on snapshots, clones and compression with very low latency.</td></tr>
</tbody></table></div>
<ul><li>All types sit inside a VPC, support encryption at rest with KMS, and integrate with AWS Backup.</li><li>Capacity and throughput are provisioned, unlike EFS, though most types can be scaled later.</li></ul>`,
  features: [`<b>Multi-AZ deployments</b> with automatic failover (Windows, ONTAP, OpenZFS).`, `<b>S3 data repository integration</b> for Lustre.`, `<b>Active Directory integration.</b>`, `<b>Snapshots, clones and replication</b> (ONTAP, OpenZFS).`, `<b>FSx Intelligent-Tiering</b> storage class for some types [[verify]].`],
  when: [`Windows file shares: FSx for Windows File Server.`, `Fast shared scratch for compute clusters: FSx for Lustre.`, `Multi-protocol access or NetApp migration: FSx for NetApp ONTAP.`, `ZFS migration: FSx for OpenZFS.`],
  whenNot: [`<b>Simple shared Linux storage with unpredictable size:</b> EFS is simpler and elastic.`, `<b>Object storage:</b> S3.`, `<b>A single instance's disk:</b> EBS.`],
  interactions: [`<b>AWS Managed Microsoft AD or self-managed AD:</b> authentication for Windows and ONTAP SMB shares.`, `<b>S3:</b> Lustre data repository.`, `<b>AWS Backup, DataSync:</b> protection and migration.`, `<b>Direct Connect and VPN:</b> on-premises access.`],
  useCases: [`<b>Department file shares</b> migrated from Windows servers, permissions intact.`, `<b>ML training:</b> Lustre file system loaded lazily from an S3 data set.`, `<b>SAP or Oracle</b> on ONTAP with snapshots and clones for test environments.`],
  pricing: `<p>Charged for provisioned storage capacity, provisioned throughput capacity, backups, and (for some types) provisioned IOPS and data tiering. Multi-AZ costs more than Single-AZ.</p>`,
  pricingLink: 'https://aws.amazon.com/fsx/pricing/',
  alternatives: [`<b>EFS:</b> elastic NFS for Linux.`, `<b>Storage Gateway File Gateway:</b> on-premises file access backed by S3.`, `<b>Self-managed file servers on EC2:</b> full control, full operational burden.`],
  mistakes: [`<b>Picking EFS for a Windows workload.</b>`, `<b>Lustre scratch deployment for data that must survive a failure.</b>`, `<b>Single-AZ for business-critical shares.</b>`, `<b>Under-provisioned throughput</b>, the usual cause of slow FSx.`],
  exam: { saa: ['3.1', '2.2'], sap: ['1.5', '4.1'],
    trap: `<ul><li>SMB, Windows, Active Directory: FSx for Windows File Server.</li><li>HPC, parallel, sub-millisecond, linked to S3: FSx for Lustre.</li><li>NFS and SMB and iSCSI from one system: FSx for NetApp ONTAP.</li></ul>`,
    proAdds: `<p>Matching each on-premises file workload to the right target during a migration, and DR between Regions with native replication.</p>` },
  docs: [{ label: 'Amazon FSx documentation', url: 'https://docs.aws.amazon.com/fsx/' }]
},
{
  id: 'backup', name: 'AWS Backup', category: 'storage', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Backup'],
  summary: 'One place to schedule, retain, copy and audit backups across most AWS data services.',
  what: `<p>AWS Backup centralises backup for EBS, EC2, RDS, Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway volumes and more. You define a plan once and apply it by tag, instead of configuring each service's own backup feature.</p>`,
  problem: `<p>Every service has a different backup mechanism. Proving to an auditor that everything is backed up, retained for the right period and copied off-site is painful without one control point.</p>`,
  how: `<ul>
<li><b>Backup plan.</b> Rules with a schedule, a retention period, optional transition to cold storage, and optional copy to another Region or account.</li>
<li><b>Resource assignment.</b> By tag (for example <code>backup=daily</code>) or by resource ID, so new resources are covered automatically.</li>
<li><b>Backup vault.</b> A container for recovery points with its own KMS key and access policy.</li>
<li><b>Vault Lock.</b> Write-once protection: recovery points cannot be deleted or have retention shortened. Compliance mode cannot be undone after a cooling-off period.</li>
<li><b>Logically air-gapped vaults</b> isolate copies for ransomware recovery and can be shared for restore to another account.</li>
<li><b>Organisation backup policies</b> push plans to every account from AWS Organizations.</li>
<li><b>Audit Manager</b> for Backup reports on whether resources meet your backup rules. <b>Restore testing</b> runs scheduled trial restores.</li>
<li><b>Point-in-time recovery</b> is supported for some services (for example RDS and S3) through continuous backup.</li>
</ul>`,
  features: [`<b>Tag-based policies.</b>`, `<b>Cross-Region and cross-account copy.</b>`, `<b>Vault Lock and air-gapped vaults.</b>`, `<b>Restore testing.</b>`, `<b>Compliance reporting.</b>`],
  when: [`Any environment with more than a couple of stateful services.`, `Regulated workloads needing proof of backup and immutability.`, `Ransomware protection with isolated copies.`],
  whenNot: [`<b>Fast failover of whole servers:</b> AWS Elastic Disaster Recovery replicates continuously.`, `<b>Database high availability:</b> Multi-AZ, not backups.`, `<b>Versioning of individual objects:</b> S3 versioning is simpler.`],
  interactions: [`<b>Organizations:</b> backup policies.`, `<b>KMS:</b> vault encryption.`, `<b>EventBridge and SNS:</b> job notifications.`, `<b>All supported data services:</b> uses their native snapshot mechanisms.`],
  example: { title: 'Daily backups kept 35 days and copied to a second Region (Terraform)', lang: 'hcl',
    code: `resource "aws_backup_plan" "daily" {
  name = "daily-35d"
  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 14 * * ? *)"   # 14:00 UTC = early morning NZ
    lifecycle { delete_after = 35 }
    copy_action {
      destination_vault_arn = aws_backup_vault.dr.arn
      lifecycle { delete_after = 35 }
    }
  }
}

resource "aws_backup_selection" "tagged" {
  name         = "tagged-daily"
  plan_id      = aws_backup_plan.daily.id
  iam_role_arn = aws_iam_role.backup.arn
  selection_tag {
    type  = "STRINGEQUALS"
    key   = "backup"
    value = "daily"
  }
}`,
    notes: `<p>Anything tagged <code>backup=daily</code> is now protected. Pair this with a Config rule or Backup Audit Manager control that flags untagged databases and volumes.</p>` },
  useCases: [`<b>Payments platform:</b> RDS, EFS and DynamoDB under one plan, copies in a separate backup account with Vault Lock.`, `<b>Audit evidence:</b> a report showing every production resource has a recovery point younger than 24 hours.`],
  pricing: `<p>Charged for backup storage per GB-month (warm and cold tiers priced separately), restores per GB, and cross-Region transfer for copies. Audit Manager and restore testing are billed per evaluation or test.</p>`,
  pricingLink: 'https://aws.amazon.com/backup/pricing/',
  alternatives: [`<b>Native service backups</b> (RDS automated backups, DynamoDB PITR, Data Lifecycle Manager): fine for one service, no central view.`, `<b>AWS Elastic Disaster Recovery:</b> low RPO and RTO for servers.`, `<b>Third-party backup products.</b>`],
  mistakes: [`<b>Backups never test-restored.</b>`, `<b>Copies in the same account</b> as the workload, where a compromised admin can delete them.`, `<b>Resources missing the tag</b> and silently unprotected.`, `<b>Confusing backup with high availability.</b>`, `<b>Retention that does not match the stated RPO and compliance period.</b>`],
  exam: { saa: ['2.2', '1.3'], sap: ['4.2', '2.4'],
    trap: `<ul><li>"Centrally manage and automate backups across services and accounts": AWS Backup.</li><li>"Backups must not be deletable": Vault Lock.</li><li>Backup and restore is the cheapest DR strategy with the longest RTO.</li></ul>`,
    proAdds: `<p>Organisation-wide backup policy, cross-account isolation, immutability for ransomware resilience, and matching backup design to RPO and RTO.</p>` },
  docs: [{ label: 'AWS Backup Developer Guide', url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html' }]
},
{
  id: 'storage-gateway', name: 'AWS Storage Gateway', category: 'storage', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Storage Gateway'],
  summary: 'Presents AWS storage to on-premises applications as ordinary file shares, disks or tapes.',
  what: `<p>Storage Gateway is a virtual or hardware appliance in your data centre that speaks standard storage protocols on one side and stores the data in AWS on the other, with a local cache for frequently used data.</p>`,
  problem: `<p>On-premises applications cannot call the S3 API, but the business wants cloud durability, off-site backup or cheaper capacity. A gateway bridges the two without rewriting anything.</p>`,
  how: `<ul>
<li><b>S3 File Gateway.</b> NFS and SMB shares whose files become objects in S3, one object per file, usable by other AWS services.</li>
<li><b>FSx File Gateway.</b> Local cache for FSx for Windows File Server shares [[verify]] (AWS has stopped offering it to new customers).</li>
<li><b>Volume Gateway.</b> iSCSI block volumes. <i>Cached</i> mode keeps the full data set in S3 and hot data locally; <i>stored</i> mode keeps all data locally and backs it up to AWS as EBS snapshots.</li>
<li><b>Tape Gateway.</b> A virtual tape library for existing backup software, storing tapes in S3 and archiving them to Glacier classes.</li>
<li><b>Deployment.</b> A VM on VMware, Hyper-V or KVM, a hardware appliance, or an EC2 instance. It connects out to AWS over the internet, VPN or Direct Connect.</li>
</ul>`,
  features: [`<b>Local cache</b> for low-latency access.`, `<b>Standard protocols:</b> NFS, SMB, iSCSI, iSCSI-VTL.`, `<b>S3 lifecycle and storage classes</b> apply to the stored objects.`, `<b>Active Directory integration</b> for SMB.`],
  when: [`Hybrid file shares with data landing in S3.`, `Replacing physical tape with no change to backup software.`, `On-premises block storage with cloud-backed snapshots.`, `Extending capacity without buying arrays.`],
  whenNot: [`<b>One-off or scheduled bulk migration:</b> AWS DataSync is faster and simpler.`, `<b>Applications already in AWS:</b> use S3, EFS or FSx directly.`, `<b>Petabytes over a slow link:</b> Snow Family or Data Transfer Terminal.`],
  interactions: [`<b>S3 and Glacier classes:</b> where the data lives.`, `<b>EBS snapshots:</b> Volume Gateway backups.`, `<b>AWS Backup:</b> protects Volume Gateway volumes.`, `<b>Direct Connect or VPN:</b> the network path.`],
  useCases: [`<b>Branch office file server</b> with all data in S3 and recent files cached locally.`, `<b>Tape replacement:</b> Veeam or Commvault writing to a virtual tape library.`],
  pricing: `<p>Charged for the storage used in AWS (S3, EBS snapshots, tape storage), requests written by the gateway, and data retrieval from archive. The hardware appliance is a separate purchase.</p>`,
  pricingLink: 'https://aws.amazon.com/storagegateway/pricing/',
  alternatives: [`<b>AWS DataSync:</b> transfer, not ongoing access.`, `<b>FSx for NetApp ONTAP with on-premises caching (FlexCache).</b>`, `<b>Direct S3 API integration</b> when the application can be changed.`],
  mistakes: [`<b>Confusing Storage Gateway with DataSync.</b> Gateway is ongoing hybrid access; DataSync moves data.`, `<b>Cache too small</b> for the working set.`, `<b>Editing gateway-managed objects directly in S3</b> without refreshing the gateway's view.`],
  exam: { saa: ['3.1', '2.2'], sap: ['1.3', '4.1'],
    trap: `<ul><li>"On-premises applications need NFS or SMB access to data stored in S3": S3 File Gateway.</li><li>"Replace tape backups without changing backup software": Tape Gateway.</li><li>"Migrate 50 TB once over the network": DataSync.</li></ul>`,
    proAdds: `<p>Hybrid storage patterns as part of a staged migration, and choosing between gateway types, DataSync and offline transfer.</p>` },
  docs: [{ label: 'AWS Storage Gateway documentation', url: 'https://docs.aws.amazon.com/storagegateway/' }]
},
{
  id: 'dlm', name: 'Amazon Data Lifecycle Manager', category: 'storage', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Data Lifecycle Manager'],
  summary: 'Automates creating, copying, retaining and deleting EBS snapshots and EBS-backed AMIs.',
  what: `<p>Data Lifecycle Manager runs policies that take EBS snapshots or AMIs on a schedule, selected by tag, keep them for a set time or count, copy them to other Regions or accounts, and delete them when they expire.</p>`,
  problem: `<p>Hand-written snapshot scripts fail silently and leave years of snapshots behind. A policy replaces both the script and the clean-up.</p>`,
  features: [`<b>Tag-based targeting.</b>`, `<b>Cross-Region and cross-account copy.</b>`, `<b>Snapshot archive tiering.</b>`, `<b>Application-consistent snapshots</b> with pre and post scripts through Systems Manager.`],
  when: [`You only need EBS snapshot or AMI automation.`, `Fast, free policy engine without setting up backup vaults.`],
  whenNot: [`<b>Backups across many service types, with central audit and immutability:</b> AWS Backup.`],
  pricing: `<p>No charge for the service. You pay for the snapshot storage and any cross-Region copies.</p>`,
  pricingLink: 'https://aws.amazon.com/ebs/data-lifecycle-manager/',
  alternatives: [`<b>AWS Backup:</b> broader, with vaults, Vault Lock and reporting.`],
  mistakes: [`<b>Both Data Lifecycle Manager and AWS Backup snapshotting the same volumes</b>, doubling cost.`, `<b>Volumes missing the target tag.</b>`],
  exam: { saa: [], sap: ['3.4', '4.2'], trap: `<p>Listed in scope for SAP-C03 only. "Automate EBS snapshot retention with the least effort": Data Lifecycle Manager. "Across RDS, EFS and DynamoDB too": AWS Backup.</p>` },
  docs: [{ label: 'Amazon Data Lifecycle Manager', url: 'https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html' }]
},
{
  id: 'drs', name: 'AWS Elastic Disaster Recovery', category: 'storage', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['AWS Elastic Disaster Recovery'],
  summary: 'Continuously replicates servers into AWS so they can be started there within minutes after a disaster.',
  what: `<p>Elastic Disaster Recovery (DRS) installs an agent on source servers (on-premises, in another cloud, or in another AWS Region) and replicates their disks block by block into low-cost staging resources in AWS. In a disaster, or a drill, it launches full recovery instances from the latest or an earlier point in time.</p>`,
  problem: `<p>A second data centre kept idle for disasters is expensive. DRS keeps only cheap staging storage running until you actually need the servers.</p>`,
  features: [`<b>Recovery point objective of seconds</b> and recovery time of minutes.`, `<b>Point-in-time recovery</b>, useful after ransomware.`, `<b>Non-disruptive drills.</b>`, `<b>Failback</b> to the original site.`],
  when: [`Disaster recovery for server-based workloads that cannot be re-architected.`, `Cross-Region DR for EC2 fleets.`, `Replacing a secondary data centre.`],
  whenNot: [`<b>Managed databases and serverless:</b> use their native multi-Region features.`, `<b>One-time migration:</b> AWS Application Migration Service uses the same technology for that purpose.`, `<b>Hours of RTO are acceptable:</b> backup and restore is cheaper.`],
  pricing: `<p>Charged per replicating source server per hour, plus the staging resources (small EC2 replication servers, EBS volumes, snapshots). Recovery instances are billed as normal EC2 only while running.</p>`,
  pricingLink: 'https://aws.amazon.com/disaster-recovery/pricing/',
  alternatives: [`<b>AWS Backup:</b> cheaper, longer RTO.`, `<b>Warm standby or multi-site active/active:</b> faster, costlier, needs application design.`],
  mistakes: [`<b>Never running a drill.</b>`, `<b>Forgetting the network and DNS side of failover.</b>`, `<b>Using it for databases with better native replication.</b>`],
  exam: { saa: [], sap: ['4.2'], trap: `<p>"Lowest RTO and RPO for existing servers at low standing cost": Elastic Disaster Recovery, a pilot-light style solution. It appears on the SAP-C03 list and not on the SAA-C03 list.</p>` },
  docs: [{ label: 'AWS Elastic Disaster Recovery User Guide', url: 'https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html' }]
}
);

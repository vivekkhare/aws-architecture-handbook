/* ===== Phase 2, batch E: databases ===== */
SERVICES.push(
{
  id: 'rds', name: 'Amazon RDS', category: 'database', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon RDS'],
  summary: 'Managed relational databases: PostgreSQL, MySQL, MariaDB, Oracle, SQL Server and Db2 without the patching and backup chores.',
  what: `<p>Amazon Relational Database Service runs standard database engines for you. AWS handles provisioning, patching, backups, failure detection and failover. You keep control of schema, queries and tuning, but not the operating system.</p>`,
  problem: `<p>Running a production database well means backups that restore, patching without long outages, replication and failover. Those tasks are the same for everyone, so RDS automates them.</p>`,
  how: `<ul>
<li><b>Multi-AZ instance deployment.</b> A synchronous standby in another Availability Zone. On failure RDS repoints the endpoint to the standby, typically in one to two minutes. The standby serves no traffic: it is for availability, not scaling.</li>
<li><b>Multi-AZ DB cluster.</b> One writer and two readable standbys in three zones, with faster failover (PostgreSQL and MySQL).</li>
<li><b>Read replicas</b> use asynchronous replication to scale reads, can be in another Region, and can be promoted to a standalone database. They may lag.</li>
<li><b>Backups.</b> Automated daily snapshots plus transaction logs give point-in-time recovery within a retention period of up to 35 days. Manual snapshots are kept until deleted. A restore always creates a <i>new</i> instance with a new endpoint.</li>
<li><b>Storage.</b> gp3 or Provisioned IOPS (io1, io2) on EBS, with optional storage autoscaling.</li>
<li><b>Security.</b> Private subnets through a DB subnet group, security groups, KMS encryption at rest (chosen at creation), TLS in transit, and optional IAM database authentication.</li>
<li><b>RDS Proxy</b> pools connections, which protects the database from Lambda bursts and shortens failover for applications.</li>
<li><b>Maintenance.</b> Patches apply in a window you set. <i>Blue/green deployments</i> rehearse major upgrades on a synchronised copy and switch over in about a minute.</li>
<li><b>RDS Custom</b> gives operating system access for Oracle and SQL Server applications that require it.</li>
</ul>`,
  features: [`<b>Multi-AZ</b> for availability.`, `<b>Read replicas</b>, including cross-Region.`, `<b>Point-in-time recovery.</b>`, `<b>RDS Proxy.</b>`, `<b>Blue/green deployments.</b>`, `<b>Performance Insights / Database Insights</b> for query analysis.`, `<b>Secrets Manager integration</b> for managed master passwords.`],
  when: [`Transactional applications needing SQL, joins and strong consistency.`, `Lift-and-shift of existing relational databases.`, `Engines Aurora does not offer (Oracle, SQL Server, MariaDB, Db2).`, `Predictable workloads where the lowest managed-database cost matters.`],
  whenNot: [`<b>Key-value access at very large scale:</b> DynamoDB.`, `<b>Higher availability, faster failover or serverless scaling on MySQL or PostgreSQL:</b> Aurora.`, `<b>Analytics over billions of rows:</b> Redshift or Athena.`, `<b>Caching:</b> ElastiCache.`, `<b>You need the operating system or unsupported extensions:</b> RDS Custom or EC2.`],
  interactions: [`<b>VPC, security groups:</b> network isolation.`, `<b>KMS, Secrets Manager, IAM:</b> encryption and credentials.`, `<b>RDS Proxy, Lambda, ECS:</b> application access.`, `<b>CloudWatch and Database Insights:</b> monitoring.`, `<b>AWS Backup:</b> central backup policy.`, `<b>DMS:</b> migrations into RDS.`, `<b>ElastiCache:</b> read offload.`],
  example: { title: 'Multi-AZ PostgreSQL in isolated subnets (Terraform)', lang: 'hcl',
    code: `resource "aws_db_instance" "main" {
  identifier        = "payments"
  engine            = "postgres"
  engine_version    = "17"
  instance_class    = "db.m7g.large"
  allocated_storage = 100
  storage_type      = "gp3"

  multi_az                    = true
  db_subnet_group_name        = aws_db_subnet_group.isolated.name
  vpc_security_group_ids      = [aws_security_group.db.id]
  publicly_accessible         = false

  storage_encrypted           = true
  kms_key_id                  = aws_kms_key.data.arn
  username                    = "app_admin"
  manage_master_user_password = true

  backup_retention_period = 14
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "payments-final"
}`,
    notes: `<p>The database security group should allow port 5432 only from the application's security group. <code>deletion_protection</code> stops an accidental <code>terraform destroy</code>.</p>` },
  useCases: [`<b>Payments ledger:</b> PostgreSQL, Multi-AZ, point-in-time recovery, connections from Fargate tasks through RDS Proxy.`, `<b>Reporting:</b> a read replica for heavy queries.`, `<b>DR:</b> a cross-Region read replica ready to promote.`],
  pricing: `<p>Charged per instance-hour by class and engine (Multi-AZ roughly doubles it), plus storage per GB-month, provisioned IOPS, backup storage beyond the database size, and data transfer. Oracle and SQL Server include or require licences. Reserved Instances cut steady-state cost. RDS Proxy and Database Insights' advanced mode are extra.</p>`,
  pricingLink: 'https://aws.amazon.com/rds/pricing/',
  alternatives: [`<b>Amazon Aurora:</b> cloud-native storage, faster failover, serverless option.`, `<b>DynamoDB:</b> serverless NoSQL.`, `<b>Database on EC2:</b> total control, total responsibility.`, `<b>Aurora DSQL:</b> serverless distributed SQL.`],
  mistakes: [`<b>Confusing Multi-AZ with read scaling.</b>`, `<b>Publicly accessible database</b> with a wide security group.`, `<b>Encryption forgotten at creation</b>; fixing it needs a snapshot copy and restore.`, `<b>Lambda opening a connection per invocation</b> with no proxy.`, `<b>Never testing a restore</b> or knowing that it yields a new endpoint.`, `<b>Running out of storage</b> with autoscaling off.`, `<b>Applications that do not retry</b> after failover.`],
  exam: { saa: ['2.2', '3.3', '4.3', '1.3'], sap: ['1.5', '4.2', '3.4'],
    trap: `<ul><li>High availability: Multi-AZ. Read performance: read replicas. Both are often needed.</li><li>Cross-Region DR for RDS: cross-Region read replica (or automated backup replication).</li><li>Too many connections from Lambda: RDS Proxy.</li><li>Encrypt an unencrypted database: snapshot, copy with encryption, restore.</li><li>Oracle or SQL Server with operating system access: RDS Custom.</li></ul>`,
    proAdds: `<p>Choosing engines during migration, cross-Region DR with stated RPO and RTO, blue/green upgrades, connection management at scale, and cost trade-offs between RDS, Aurora and purpose-built databases.</p>` },
  docs: [{ label: 'Amazon RDS User Guide', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html' }]
},
{
  id: 'aurora', name: 'Amazon Aurora', category: 'database', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Aurora', 'Amazon Aurora Serverless'],
  summary: 'A MySQL- and PostgreSQL-compatible database rebuilt for the cloud, with storage replicated six ways across three zones.',
  what: `<p>Aurora keeps the MySQL and PostgreSQL interfaces but replaces the storage engine. Compute instances share one distributed storage volume that keeps six copies of the data across three Availability Zones and grows automatically.</p>`,
  problem: `<p>Traditional replication copies the whole database to each replica, which makes replicas lag and failover slow. Aurora's shared storage gives replicas with almost no lag and failover in well under a minute.</p>`,
  how: `<ul>
<li><b>Cluster.</b> One <i>writer</i> instance and up to 15 <i>reader</i> instances over the same storage. The <i>cluster endpoint</i> always points at the writer; the <i>reader endpoint</i> balances across readers.</li>
<li><b>Storage.</b> Six copies in three zones; tolerates the loss of two copies for writes and three for reads; grows automatically to a large maximum [[verify]].</li>
<li><b>Failover.</b> A reader is promoted, usually in about 30 seconds. With no reader, Aurora recreates the instance, which takes much longer.</li>
<li><b>Aurora Serverless v2.</b> Capacity scales in fine steps (Aurora capacity units) with load, and can scale to zero when idle [[verify]]. Writers and readers can each be serverless or provisioned.</li>
<li><b>Global Database.</b> One primary Region and up to several read-only secondary Regions with replication lag typically under a second. A secondary can be promoted for DR; managed switchover supports planned moves.</li>
<li><b>Backtrack</b> (MySQL) rewinds a cluster in place. <b>Cloning</b> creates a copy-on-write duplicate in minutes for testing.</li>
<li><b>I/O-Optimized</b> configuration removes per-request I/O charges for I/O-heavy workloads.</li>
<li><b>Aurora DSQL</b> is a separate serverless, distributed SQL database with active-active multi-Region writes, PostgreSQL-compatible with some differences.</li>
</ul>`,
  features: [`<b>Up to 15 low-lag read replicas</b> with auto scaling.`, `<b>Serverless v2.</b>`, `<b>Global Database.</b>`, `<b>Fast cloning and Backtrack.</b>`, `<b>Zero-ETL integration with Redshift.</b>`, `<b>Aurora Limitless Database</b> for horizontally scaled PostgreSQL writes.`],
  when: [`Business-critical relational workloads on MySQL or PostgreSQL.`, `Read-heavy applications.`, `Spiky or unpredictable load (Serverless v2).`, `Multi-Region reads and fast cross-Region recovery.`],
  whenNot: [`<b>Small, steady databases where cost matters most:</b> RDS is cheaper.`, `<b>Oracle or SQL Server.</b>`, `<b>Simple key-value access:</b> DynamoDB.`, `<b>Engine features or extensions Aurora does not support.</b>`],
  interactions: [`<b>RDS Proxy:</b> connection pooling and faster failover handling.`, `<b>Secrets Manager, KMS, IAM:</b> security.`, `<b>Lambda:</b> can be invoked from database events; Data API for HTTP access.`, `<b>Redshift:</b> zero-ETL analytics.`, `<b>AWS Backup, DMS:</b> protection and migration.`],
  example: { title: 'Spring Boot with separate writer and reader endpoints (application.yml)', lang: 'yaml',
    code: `app:
  datasource:
    writer:
      jdbc-url: jdbc:postgresql://payments.cluster-abc123.ap-southeast-2.rds.amazonaws.com:5432/payments
      maximum-pool-size: 10
    reader:
      jdbc-url: jdbc:postgresql://payments.cluster-ro-abc123.ap-southeast-2.rds.amazonaws.com:5432/payments
      maximum-pool-size: 20
      read-only: true`,
    notes: `<p>Route <code>@Transactional(readOnly = true)</code> methods to the reader pool. Reads on a replica can be a few milliseconds behind the writer, so read-your-own-write flows should stay on the writer.</p>` },
  useCases: [`<b>Core transaction store</b> with two readers in other zones.`, `<b>Development environments</b> on Serverless v2 that idle overnight.`, `<b>Trans-Tasman service:</b> Global Database with Sydney primary and a secondary in the New Zealand Region.`],
  pricing: `<p>Charged for instance-hours (or Aurora capacity units for Serverless v2), storage per GB-month, I/O requests (Standard configuration) or a higher instance and storage rate with no I/O charge (I/O-Optimized), backup storage, and Global Database replicated writes.</p>`,
  pricingLink: 'https://aws.amazon.com/rds/aurora/pricing/',
  alternatives: [`<b>Amazon RDS:</b> simpler and cheaper for modest needs; more engines.`, `<b>DynamoDB global tables:</b> multi-Region active-active NoSQL.`, `<b>Aurora DSQL:</b> multi-Region active-active SQL.`],
  mistakes: [`<b>A cluster with only a writer</b>, losing fast failover.`, `<b>All traffic on the cluster endpoint</b>, leaving readers idle.`, `<b>Standard configuration on an I/O-heavy workload</b> where I/O charges dominate.`, `<b>Assuming Global Database fails over automatically</b> in an unplanned outage. Promotion is a decision you make or automate.`, `<b>Serverless minimum capacity too low</b> for the working set, causing slow scale-up.`],
  exam: { saa: ['2.2', '3.3', '4.3'], sap: ['1.5', '4.2', '3.4'],
    trap: `<ul><li>"MySQL or PostgreSQL compatible, highest availability, minimal replica lag": Aurora.</li><li>"Unpredictable or intermittent workload": Aurora Serverless.</li><li>"Cross-Region DR with RPO of seconds and RTO of minutes for a relational database": Aurora Global Database.</li><li>"Fast copy of production for testing": Aurora cloning.</li></ul>`,
    proAdds: `<p>Global Database failover procedures, write forwarding, choosing between Global Database, DSQL and DynamoDB global tables, and migration from commercial engines.</p>` },
  docs: [{ label: 'Amazon Aurora User Guide', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html' }]
},
{
  id: 'dynamodb', name: 'Amazon DynamoDB', category: 'database', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon DynamoDB'],
  summary: 'A serverless key-value and document database with single-digit millisecond performance at any scale.',
  what: `<p>DynamoDB stores items in tables and retrieves them by key. There are no servers, versions or maintenance windows. Data is replicated across three Availability Zones, and performance stays flat as tables grow to any size.</p>`,
  problem: `<p>Relational databases become hard to scale past one large machine. DynamoDB trades flexible queries for limitless horizontal scale and zero operations, provided you design around your access patterns.</p>`,
  how: `<ul>
<li><b>Keys.</b> A <i>partition key</i> alone, or a partition key plus <i>sort key</i>. Efficient reads supply the partition key; a <i>Query</i> returns items sharing it, ordered by sort key. A <i>Scan</i> reads the whole table and should be rare.</li>
<li><b>Indexes.</b> A <i>global secondary index</i> has different keys, its own capacity and eventually consistent reads; it can be added any time. A <i>local secondary index</i> shares the partition key, supports strong consistency and must be created with the table.</li>
<li><b>Capacity modes.</b> <i>On-demand</i> charges per request and absorbs spikes. <i>Provisioned</i> sets read and write capacity units, usually with auto scaling, and is cheaper for steady load.</li>
<li><b>Consistency.</b> Reads are eventually consistent by default; strongly consistent reads cost twice as much. Transactions provide all-or-nothing writes across items.</li>
<li><b>Item size</b> is limited to 400 KB. Larger payloads belong in S3 with a pointer.</li>
<li><b>Streams</b> record every change for 24 hours, for Lambda triggers and replication.</li>
<li><b>Global tables</b> replicate a table across Regions with writes accepted everywhere (last writer wins), with an option for multi-Region strong consistency [[verify]].</li>
<li><b>TTL</b> deletes expired items for free. <b>Point-in-time recovery</b> restores to any second in the last 35 days. <b>DAX</b> is an in-memory cache giving microsecond reads.</li>
</ul>`,
  features: [`<b>On-demand capacity.</b>`, `<b>Global tables.</b>`, `<b>Streams and Kinesis integration.</b>`, `<b>TTL.</b>`, `<b>Point-in-time recovery and on-demand backups.</b>`, `<b>Standard-IA table class</b> for rarely read data.`, `<b>Fine-grained access control</b> with IAM condition keys on partition key values.`],
  when: [`Known, key-based access patterns at high scale: sessions, carts, user profiles, device state, idempotency keys.`, `Serverless applications with Lambda.`, `Spiky traffic.`, `Multi-Region active-active.`],
  whenNot: [`<b>Ad hoc queries, joins and aggregations:</b> a relational database or analytics engine.`, `<b>Access patterns still unknown.</b>`, `<b>Large objects:</b> S3.`, `<b>Complex multi-table transactions with relational integrity.</b>`],
  interactions: [`<b>Lambda:</b> stream triggers.`, `<b>API Gateway and AppSync:</b> direct integrations.`, `<b>DAX:</b> read cache.`, `<b>VPC gateway endpoint:</b> free private access.`, `<b>S3:</b> export and import.`, `<b>KMS, IAM:</b> encryption and item-level permissions.`, `<b>Application Auto Scaling:</b> provisioned capacity scaling.`],
  example: { title: 'Idempotent write with a conditional expression (Kotlin, AWS SDK)', lang: 'kotlin',
    code: `suspend fun recordPayment(ddb: DynamoDbClient, p: Payment) {
    try {
        ddb.putItem {
            tableName = "payments"
            item = mapOf(
                "pk"        to AttributeValue.S("PAYMENT#\${p.idempotencyKey}"),
                "amount"    to AttributeValue.N(p.amountCents.toString()),
                "status"    to AttributeValue.S("ACCEPTED"),
                "expiresAt" to AttributeValue.N(p.expiryEpochSeconds.toString())   // TTL attribute
            )
            conditionExpression = "attribute_not_exists(pk)"
        }
    } catch (e: ConditionalCheckFailedException) {
        // The same idempotency key was already processed: return the stored result.
    }
}`,
    notes: `<p>The condition makes the write succeed only once, however many times the client retries. This is the standard way to make payment and message handlers idempotent.</p>` },
  useCases: [`<b>Idempotency store</b> for a payments API.`, `<b>Session and device registry</b> for a mobile app.`, `<b>Event-driven pipeline:</b> Streams feeding Lambda.`, `<b>Global leaderboard or profile store</b> with global tables.`],
  pricing: `<p>On-demand: per million read and write request units. Provisioned: per capacity unit per hour, with reserved capacity available. Plus storage per GB-month, and optional charges for global table replicated writes, streams reads, backups, point-in-time recovery, DAX nodes and data transfer. Scans and unused provisioned capacity are the usual waste.</p>`,
  pricingLink: 'https://aws.amazon.com/dynamodb/pricing/',
  alternatives: [`<b>Aurora or RDS:</b> relational model.`, `<b>Amazon Keyspaces:</b> Cassandra-compatible.`, `<b>Amazon DocumentDB:</b> MongoDB-compatible.`, `<b>ElastiCache or MemoryDB:</b> in-memory speed.`],
  mistakes: [`<b>Hot partitions</b> from a low-cardinality partition key.`, `<b>Scans in the request path.</b>`, `<b>Modelling tables like relational ones</b> instead of starting from access patterns.`, `<b>Expecting strong consistency from a global secondary index.</b>`, `<b>No point-in-time recovery.</b>`, `<b>Storing large blobs</b> in items.`],
  exam: { saa: ['2.1', '3.3', '4.3', '2.2'], sap: ['1.5', '4.2', '3.4'],
    trap: `<ul><li>"Serverless, millisecond latency, scales automatically, key-value": DynamoDB.</li><li>"Microsecond read latency": add DAX.</li><li>"Multi-Region, active-active writes": global tables.</li><li>Unpredictable traffic: on-demand. Steady, predictable: provisioned with auto scaling.</li><li>"React to item changes": DynamoDB Streams with Lambda.</li><li>"Automatically remove old items": TTL.</li></ul>`,
    proAdds: `<p>Single-table design trade-offs, multi-Region consistency choices, tenant isolation with fine-grained IAM, and cost modelling between capacity modes.</p>` },
  docs: [{ label: 'Amazon DynamoDB Developer Guide', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' }]
},
{
  id: 'elasticache', name: 'Amazon ElastiCache', category: 'database', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon ElastiCache'],
  summary: 'Managed in-memory caching with Valkey, Redis OSS or Memcached, for sub-millisecond reads.',
  what: `<p>ElastiCache runs in-memory data stores. Applications keep frequently read or expensive-to-compute data in it so they can answer in microseconds and take load off the database.</p>`,
  problem: `<p>Databases are the slowest and most expensive part of most request paths. A cache serves repeated reads from memory and stores short-lived state such as sessions.</p>`,
  how: `<ul>
<li><b>Engines.</b> <i>Valkey</i> (the open-source continuation of Redis, and the lower-priced default) and <i>Redis OSS</i> offer rich data structures, replication, persistence options, pub/sub and clustering. <i>Memcached</i> is a simple multi-threaded cache with no replication or persistence.</li>
<li><b>Deployment.</b> <i>Serverless</i> (no nodes to size, scales automatically) or <i>node-based</i> clusters you design.</li>
<li><b>High availability</b> (Valkey and Redis OSS). A primary with replicas in other zones and automatic failover (Multi-AZ). <i>Cluster mode</i> shards data across several primaries for write scale.</li>
<li><b>Global Datastore</b> replicates to other Regions for low-latency reads and DR.</li>
<li><b>Caching strategies.</b> <i>Lazy loading</i> (cache-aside): read the cache, on a miss read the database and populate. <i>Write-through</i>: update the cache on every write. Add a TTL so stale data expires.</li>
<li><b>Security.</b> Runs inside a VPC; encryption in transit and at rest; authentication with tokens, role-based access control or IAM.</li>
</ul>`,
  features: [`<b>Serverless option.</b>`, `<b>Multi-AZ with automatic failover.</b>`, `<b>Cluster mode sharding.</b>`, `<b>Global Datastore.</b>`, `<b>Data tiering</b> to SSD for large data sets.`, `<b>Vector search</b> on Valkey [[verify]].`],
  when: [`Caching database query results or API responses.`, `Session storage for stateless web tiers.`, `Leaderboards, counters, rate limiters.`, `Lightweight pub/sub and queues.`],
  whenNot: [`<b>The system of record:</b> a cache can lose data. For a durable in-memory database use Amazon MemoryDB.`, `<b>Caching HTTP responses for end users:</b> CloudFront.`, `<b>Only DynamoDB reads need speeding up:</b> DAX needs no code changes.`],
  interactions: [`<b>RDS, Aurora, DynamoDB:</b> the databases it shields.`, `<b>ECS, EKS, Lambda (in a VPC), EC2:</b> clients.`, `<b>CloudWatch:</b> evictions, memory and CPU metrics.`, `<b>Secrets Manager, KMS:</b> credentials and encryption.`],
  example: { title: 'Cache-aside in Kotlin with Spring', lang: 'kotlin',
    code: `@Service
class RateService(private val repo: FxRateRepository) {

    @Cacheable(cacheNames = ["fx-rates"], key = "#currencyPair")
    fun currentRate(currencyPair: String): FxRate =
        repo.findLatest(currencyPair)          // only called on a cache miss

    @CacheEvict(cacheNames = ["fx-rates"], key = "#rate.currencyPair")
    fun publish(rate: FxRate) = repo.save(rate)
}

// application.yml
// spring.cache.type: redis
// spring.cache.redis.time-to-live: 60s
// spring.data.redis.host: \${CACHE_ENDPOINT}
// spring.data.redis.ssl.enabled: true`,
    notes: `<p>The 60-second TTL bounds how stale a rate can be even if an eviction is missed. The application must still work, more slowly, when the cache is unavailable.</p>` },
  useCases: [`<b>Product and pricing lookups</b> cached for seconds.`, `<b>Login sessions</b> shared by all API tasks.`, `<b>API rate limiting</b> with atomic counters.`],
  pricing: `<p>Node-based: per node-hour by node type, with reserved nodes available; replicas and shards multiply cost. Serverless: per GB-hour of data stored and per compute unit consumed. Plus backup storage and cross-zone or cross-Region transfer.</p>`,
  pricingLink: 'https://aws.amazon.com/elasticache/pricing/',
  alternatives: [`<b>Amazon MemoryDB:</b> Valkey/Redis-compatible with durable multi-AZ storage, usable as a primary database.`, `<b>DAX:</b> cache dedicated to DynamoDB.`, `<b>CloudFront, API Gateway caching:</b> HTTP-level caching.`, `<b>In-process cache:</b> free and fast, not shared between instances.`],
  mistakes: [`<b>No TTL</b>, so stale data lives forever and memory fills.`, `<b>Treating the cache as durable.</b>`, `<b>Single node with no replica</b> in production.`, `<b>Cache stampede</b> when a hot key expires and every request hits the database at once.`, `<b>Encryption in transit off.</b>`],
  exam: { saa: ['3.3', '2.1', '4.3'], sap: ['1.5'],
    trap: `<ul><li>"Reduce load on the database for repeated reads" or "store session state externally": ElastiCache.</li><li>Need replication, persistence, sorted sets or pub/sub: Valkey or Redis OSS. Simplest multi-threaded cache: Memcached.</li><li>"Durable in-memory database": MemoryDB (SAP-C03 list).</li></ul>`,
    proAdds: `<p>Global Datastore for multi-Region, cache sizing against database cost, and choosing between ElastiCache, MemoryDB and DAX.</p>` },
  docs: [{ label: 'Amazon ElastiCache User Guide', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html' }]
},
{
  id: 'redshift', name: 'Amazon Redshift', category: 'analytics', tier: 1, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Redshift'],
  summary: 'A petabyte-scale data warehouse for SQL analytics over large, structured data sets.',
  what: `<p>Redshift is a columnar, massively parallel SQL data warehouse. It is built for analytical queries (aggregations and joins over billions of rows), not for transaction processing.</p>`,
  problem: `<p>Running reports on the transactional database slows the application and does not scale. A warehouse separates analytics and is designed for it.</p>`,
  how: `<ul>
<li><b>Deployment.</b> <i>Provisioned</i> clusters of nodes (RA3 nodes separate compute from managed storage) or <i>Redshift Serverless</i>, which scales capacity automatically and bills for use.</li>
<li><b>Columnar storage and parallel execution</b> across nodes; distribution and sort keys shape performance.</li>
<li><b>Redshift Spectrum</b> queries data in S3 without loading it. <b>Federated queries</b> reach into RDS and Aurora.</li>
<li><b>Loading.</b> <code>COPY</code> from S3, streaming ingestion from Kinesis and MSK, and <i>zero-ETL integrations</i> from Aurora, RDS and DynamoDB.</li>
<li><b>Concurrency scaling</b> adds transient capacity for bursts of queries. <b>Workload management</b> prioritises queues.</li>
<li><b>Availability and DR.</b> Multi-AZ deployments for RA3; automated snapshots with cross-Region copy.</li>
<li><b>Data sharing</b> gives other clusters and accounts live access without copying.</li>
</ul>`,
  features: [`<b>Serverless.</b>`, `<b>Spectrum and federated queries.</b>`, `<b>Zero-ETL integrations.</b>`, `<b>Materialised views and automatic table optimisation.</b>`, `<b>Data sharing.</b>`, `<b>Redshift ML.</b>`],
  when: [`Business intelligence and dashboards over large structured data.`, `Complex joins and aggregations run repeatedly.`, `A central warehouse fed from many systems.`],
  whenNot: [`<b>Transaction processing:</b> RDS, Aurora or DynamoDB.`, `<b>Occasional ad hoc queries on files in S3:</b> Athena, with nothing to run.`, `<b>Search and log analytics:</b> OpenSearch Service.`, `<b>Small data:</b> a read replica is enough.`],
  interactions: [`<b>S3:</b> load, unload and Spectrum.`, `<b>Glue Data Catalog and Lake Formation:</b> shared metadata and permissions.`, `<b>Kinesis, MSK, Firehose:</b> streaming ingestion.`, `<b>Quick (QuickSight):</b> dashboards.`, `<b>Aurora, RDS, DynamoDB:</b> zero-ETL sources.`],
  useCases: [`<b>Finance reporting</b> across years of transactions.`, `<b>Product analytics</b> joining app events with the customer database.`, `<b>Lakehouse:</b> hot data in Redshift, history in S3 through Spectrum.`],
  pricing: `<p>Provisioned: per node-hour, with reserved pricing, plus managed storage per GB-month. Serverless: per Redshift processing unit second while queries run, plus storage. Spectrum is charged per TB scanned. Concurrency scaling beyond free credits and cross-Region snapshot transfer are extra.</p>`,
  pricingLink: 'https://aws.amazon.com/redshift/pricing/',
  alternatives: [`<b>Amazon Athena:</b> serverless SQL on S3, pay per query.`, `<b>Amazon EMR:</b> Spark and Hadoop for custom processing.`, `<b>OpenSearch Service:</b> search and log analytics.`, `<b>Third-party warehouses</b> such as Snowflake.`],
  mistakes: [`<b>Using it as an application database.</b>`, `<b>Provisioned cluster running 24/7 for a few daily reports.</b>`, `<b>Row-by-row inserts</b> instead of bulk loads.`, `<b>Publicly accessible cluster.</b>`],
  exam: { saa: ['3.3', '3.5', '4.3'], sap: ['1.5'],
    trap: `<ul><li>"Data warehouse, complex analytical SQL, petabytes": Redshift.</li><li>"Query data directly in S3 with no infrastructure": Athena. "From Redshift, without loading": Spectrum.</li><li>OLTP is never Redshift.</li></ul>`,
    proAdds: `<p>Lakehouse architectures, cross-account data sharing, zero-ETL pipelines and DR for analytics platforms.</p>` },
  docs: [{ label: 'Amazon Redshift Management Guide', url: 'https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html' }]
},
{
  id: 'documentdb', name: 'Amazon DocumentDB', category: 'database', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon DocumentDB'],
  summary: 'A managed document database with MongoDB compatibility.',
  what: `<p>DocumentDB stores JSON-like documents and implements the MongoDB API, so existing MongoDB drivers and tools work. Its architecture resembles Aurora: compute instances over a shared storage volume replicated six ways across three zones.</p>`,
  problem: `<p>Teams with MongoDB workloads want a managed service inside AWS with backups, replication and scaling handled.</p>`,
  features: [`<b>Up to 15 read replicas.</b>`, `<b>Global clusters</b> for cross-Region reads and DR.`, `<b>Elastic clusters</b> with sharding.`, `<b>Point-in-time recovery.</b>`, `<b>Serverless scaling</b> [[verify]].`],
  when: [`Migrating MongoDB applications.`, `Content, catalogues and profiles with flexible schemas and rich queries.`],
  whenNot: [`<b>Simple key-value access:</b> DynamoDB is cheaper and serverless.`, `<b>You rely on MongoDB features DocumentDB does not implement:</b> check compatibility first.`],
  pricing: `<p>Charged per instance-hour, storage per GB-month, I/O requests (or an I/O-optimised configuration) and backup storage.</p>`,
  pricingLink: 'https://aws.amazon.com/documentdb/pricing/',
  alternatives: [`<b>DynamoDB:</b> serverless NoSQL.`, `<b>MongoDB Atlas on AWS</b> (third party).`, `<b>PostgreSQL JSONB on RDS or Aurora.</b>`],
  mistakes: [`<b>Assuming full MongoDB feature parity.</b>`],
  exam: { saa: ['3.3'], sap: ['1.5'], trap: `<p>"MongoDB workload, managed, minimal code change": DocumentDB.</p>` },
  docs: [{ label: 'Amazon DocumentDB Developer Guide', url: 'https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html' }]
},
{
  id: 'neptune', name: 'Amazon Neptune', category: 'database', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Neptune'],
  summary: 'A managed graph database for highly connected data.',
  what: `<p>Neptune stores relationships as first-class data and answers questions that follow many connections quickly. It supports property graphs (Gremlin, openCypher) and RDF (SPARQL).</p>`,
  problem: `<p>"Friends of friends" or "which accounts share a device with a known fraudster" need many self-joins in SQL and get slower with depth. Graph databases traverse relationships directly.</p>`,
  features: [`<b>Read replicas and Multi-AZ.</b>`, `<b>Neptune Serverless.</b>`, `<b>Global Database.</b>`, `<b>Neptune Analytics</b> for in-memory graph algorithms and vector search.`],
  when: [`Fraud rings, recommendations, social networks, knowledge graphs, network topology, identity graphs.`],
  whenNot: [`<b>Tabular or key-value data with few relationships.</b>`, `<b>General-purpose transactions.</b>`],
  pricing: `<p>Charged per instance-hour (or capacity units for serverless), storage, I/O and backup.</p>`,
  pricingLink: 'https://aws.amazon.com/neptune/pricing/',
  alternatives: [`<b>Relational database with recursive queries</b> for shallow graphs.`, `<b>Neo4j</b> (third party).`],
  mistakes: [`<b>Choosing a graph database for data that is not graph-shaped.</b>`],
  exam: { saa: ['3.3'], sap: ['1.5'], trap: `<p>"Relationships", "social graph", "fraud detection across connected entities", "knowledge graph": Neptune.</p>` },
  docs: [{ label: 'Amazon Neptune User Guide', url: 'https://docs.aws.amazon.com/neptune/latest/userguide/intro.html' }]
},
{
  id: 'keyspaces', name: 'Amazon Keyspaces', category: 'database', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Keyspaces'],
  summary: 'A serverless, Apache Cassandra-compatible wide-column database.',
  what: `<p>Keyspaces lets applications written for Apache Cassandra (using CQL and Cassandra drivers) run against a managed, serverless service with on-demand or provisioned capacity.</p>`,
  problem: `<p>Operating Cassandra clusters (repairs, compaction, scaling, upgrades) is demanding. Keyspaces removes it.</p>`,
  features: [`<b>Serverless with on-demand capacity.</b>`, `<b>Multi-Region replication.</b>`, `<b>Point-in-time recovery.</b>`, `<b>Encryption by default.</b>`],
  when: [`Migrating Cassandra workloads.`, `High-volume time-ordered writes with Cassandra data models.`],
  whenNot: [`<b>New applications with no Cassandra dependency:</b> DynamoDB is the native choice.`],
  pricing: `<p>Charged per read and write request (on-demand) or per capacity unit-hour (provisioned), plus storage and optional backups.</p>`,
  pricingLink: 'https://aws.amazon.com/keyspaces/pricing/',
  alternatives: [`<b>DynamoDB.</b>`, `<b>Self-managed Cassandra on EC2.</b>`],
  mistakes: [`<b>Assuming every Cassandra feature is supported.</b>`],
  exam: { saa: ['3.3'], sap: ['1.5'], trap: `<p>"Apache Cassandra" or "CQL": Keyspaces.</p>` },
  docs: [{ label: 'Amazon Keyspaces Developer Guide', url: 'https://docs.aws.amazon.com/keyspaces/latest/devguide/what-is-keyspaces.html' }]
},
{
  id: 'memorydb', name: 'Amazon MemoryDB', category: 'database', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon MemoryDB'],
  summary: 'A durable, in-memory database compatible with Valkey and Redis OSS.',
  what: `<p>MemoryDB keeps data in memory for microsecond reads and single-digit millisecond writes, and records every write in a multi-AZ transaction log, so data survives node failures. It can be the primary database, not only a cache.</p>`,
  problem: `<p>Teams that love Redis data structures often run a cache plus a separate durable database and keep them in sync. MemoryDB combines the two.</p>`,
  features: [`<b>Multi-AZ durability.</b>`, `<b>Multi-Region active-active.</b>`, `<b>Vector search.</b>`, `<b>Cluster sharding.</b>`],
  when: [`Microservices needing durable, very fast state: sessions, carts, game state, rate limits that must not reset.`, `Redis-based applications that currently use a second database only for durability.`],
  whenNot: [`<b>A disposable cache:</b> ElastiCache is cheaper.`, `<b>Data much larger than memory or relational queries.</b>`],
  pricing: `<p>Charged per node-hour, per GB of data written, and for snapshot storage.</p>`,
  pricingLink: 'https://aws.amazon.com/memorydb/pricing/',
  alternatives: [`<b>ElastiCache:</b> cache.`, `<b>DynamoDB with DAX.</b>`],
  mistakes: [`<b>Paying for MemoryDB when losing the cache would not matter.</b>`],
  exam: { saa: [], sap: ['1.5'], trap: `<p>"In-memory" plus "durable" or "primary database": MemoryDB. Listed for SAP-C03 only.</p>` },
  docs: [{ label: 'Amazon MemoryDB Developer Guide', url: 'https://docs.aws.amazon.com/memorydb/latest/devguide/what-is-memorydb.html' }]
},
{
  id: 'timestream', name: 'Amazon Timestream', category: 'database', tier: 2, mgmt: 'aws', status: 'current',
  scopeNames: ['Amazon Timestream'],
  summary: 'A managed time-series database for metrics, telemetry and events ordered by time.',
  what: `<p>Timestream stores and queries measurements that arrive with timestamps. It comes as <i>Timestream for LiveAnalytics</i> (serverless, with memory and magnetic storage tiers; AWS has restricted it for new customers [[verify]]) and <i>Timestream for InfluxDB</i> (managed open-source InfluxDB).</p>`,
  problem: `<p>Time-series data arrives constantly, is mostly queried by recent time window, and loses value with age. General databases store it inefficiently.</p>`,
  features: [`<b>Automatic tiering</b> from memory to cheaper storage.`, `<b>Time-series functions</b> such as interpolation and smoothing.`, `<b>InfluxDB compatibility.</b>`],
  when: [`IoT sensor data, application and infrastructure metrics, clickstream timing.`],
  whenNot: [`<b>Transactional or relational data.</b>`, `<b>Operational monitoring of AWS resources:</b> CloudWatch.`],
  pricing: `<p>LiveAnalytics: per GB written, per GB-hour stored in each tier, and per query compute. InfluxDB: per instance-hour and storage.</p>`,
  pricingLink: 'https://aws.amazon.com/timestream/pricing/',
  alternatives: [`<b>Amazon Managed Service for Prometheus:</b> metrics.`, `<b>DynamoDB with time-based sort keys.</b>`, `<b>PostgreSQL with TimescaleDB on EC2.</b>`],
  mistakes: [`<b>Using a relational database for high-rate telemetry</b> when the question describes time-series needs.`],
  exam: { saa: [], sap: ['1.5'], trap: `<p>"Time-series data", "IoT telemetry with time-window queries": Timestream. Listed for SAP-C03 only.</p>` },
  docs: [{ label: 'Amazon Timestream documentation', url: 'https://docs.aws.amazon.com/timestream/' }]
}
);

---
name: system-design
description: High-scale distributed system design framework enforcing production-grade resilience, edge case handling, capacity estimation, and component deep dives.
---

# System Design & High-Scale Architecture Skill

## Overview

Use this skill when designing high-scale distributed systems, evaluating backend architecture, performing capacity planning, and conducting component deep dives.

> [!CAUTION]
> **MANDATE: BANISH HAPPY-PATH TUNNEL VISION**
> An architecture that only works under ideal conditions is a broken architecture. Agents MUST NEVER present a design that assumes zero network latency, infinite database connections, or 100% downstream availability. Every design proposal MUST explicitly address edge cases, partial outages, retry storms, data race conditions, and graceful degradation.

---

## 4-Step Production-Grade System Design Framework

### Step 1: Requirements & Capacity Planning (Back-of-the-Envelope)

1. **Functional Requirements:**
   - Define core user use-cases and clear boundary scope.
   - Out-of-scope declarations.

2. **Non-Functional Requirements & SLA:**
   - **Availability:** $99.99\%$ ($52.6\text{ mins/year}$ downtime).
   - **Latency:** $\text{p99} < 100\text{ms}, \text{p95} < 50\text{ms}$.
   - **Consistency Model:** Strong Consistency (Financial/Order) vs Eventual Consistency (Social Feed/Likes).

3. **Back-of-the-Envelope Estimations:**
   - **QPS (Queries Per Second):**
     $$\text{Read QPS} = \frac{\text{DAU} \times \text{Read Operations/User}}{86,400}$$
     $$\text{Peak QPS} = \text{Read QPS} \times (2 - 5\times \text{Spoke Factor})$$
   - **Storage Growth:**
     $$\text{Daily Storage} = \text{Daily Write Requests} \times \text{Average Payload Size}$$
     Estimate 3-year and 5-year storage capacity with indexing overhead ($+20\%$).
   - **Memory & Cache (Pareto 80/20 Rule):**
     $$\text{Cache RAM} = 0.20 \times (\text{Daily Read Data Volume})$$

---

### Step 2: High-Level Design (HLD) & API Contracts

1. **Strict API Contracts:**
   - Define HTTP Methods, URL Paths, Request/Response payloads, Header requirements.
   - Explicit HTTP Status Codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `429 Too Many Requests`, `503 Service Unavailable`.
   - **Idempotency Keys:** Mandatory for write/payment APIs (`X-Idempotency-Key`).

2. **Core Data Model & Schema:**
   - **RDBMS (PostgreSQL/MySQL):** Normalized tables, primary/foreign keys, B-Tree indexes, transaction isolation levels.
   - **NoSQL (Document/KeyValue/Columnar):** Partition keys, sort keys, document structures.

3. **High-Level Topology Diagram:**
   - Client Layer (Web, Mobile, Third-party).
   - Edge Gateway / Reverse Proxy (TLS termination, Rate Limiting, Authentication).
   - L4/L7 Load Balancers.
   - Stateless Application Microservices.
   - Distributed Cache Layer (Redis Cluster / Memcached).
   - Event Bus / Queue (Kafka / RabbitMQ / AWS SQS).
   - Primary & Replica Database Shards.

---

### Step 3: Critical Component Deep Dives

1. **Caching Architecture:**
   - **Patterns:** Cache-Aside (Read path), Write-Through / Write-Behind (Write path).
   - **Eviction Policies:** LRU (Least Recently Used), LFU, TTL expiration.
   - **Failure Prevention:**
     - *Cache Stampede / Thundering Herd:* Distributed locks (Redlock) or Mutex locks on cache miss.
     - *Cache Penetration:* Bloom Filters for non-existent key lookups.
     - *Cache Avalanche:* Randomized TTL jitter ($+ \text{random}(1..300\text{s})$).

2. **Database Scaling & Partitioning:**
   - **Replication:** Single-Master Async/Sync Replication with Read Replicas.
   - **Sharding (Horizontal Partitioning):** Hash-based vs Range-based partitioning.
   - **Consistent Hashing:** Ring topology with virtual nodes ($256\text{ vnodes/node}$) for even data distribution and zero-downtime resharding.

3. **Asynchronous Event-Driven Architecture:**
   - Decouple synchronous API handlers using Pub/Sub streams (Kafka/RabbitMQ).
   - **Dead Letter Queue (DLQ):** Handle poison pills and unprocessable messages after max retry attempts ($N=3$).
   - **Consumer Idempotency:** DB unique constraint or Redis idempotency check before message execution.

4. **Distributed Rate Limiting:**
   - **Algorithms:** Token Bucket, Leaky Bucket, Sliding Window Log / Counter.
   - Distributed state synchronization using Redis + Lua Scripts for atomic counter increments.

---

### Step 4: Edge Cases, Failure Modes & Resilience (MANDATORY SECTION)

Every system design MUST detail the following failure scenarios:

| Failure Scenario | Impact | Mitigation & Pattern |
| --- | --- | --- |
| **Downstream Outage** | Service thread pool exhaustion | **Circuit Breaker** (Netflix Hystrix / Resilience4j) + Fallback static response |
| **Network Partition / Split-Brain** | Inconsistent writes | **CAP/PACELC Choice** + Quorum Consensus ($W + R > N$) |
| **Database Master Failure** | Write unavailability | **Automated Failover** via Consul/Patroni + Read-Only mode fallback |
| **Traffic Spike / Flash Crowd** | Server overload & crash | **Rate Limiting** ($429$) + **Backpressure** + Queue Buffering |
| **Duplicate Webhook / Retry** | Double charging / Duplicate records | **Idempotency Key Check** via Redis/DB Unique Constraint |

---

## Architectural Archetypes for Industry Use Cases

### 1. High-Volume URL Shortener
- **Key Challenge:** 100:1 Read-to-Write ratio, Base62 key generation, Hash collision.
- **Solution:** Pre-generated Range Key Allocator (ZooKeeper / DB Range locks), Redis Cache-Aside, HTTP 302 vs 301 redirect trade-off.

### 2. Distributed Rate Limiter
- **Key Challenge:** Microsecond overhead, Distributed atomic counting across clusters.
- **Solution:** API Gateway middleware, Redis sliding window counter via Lua script, HTTP 429 response with `Retry-After` header.

### 3. Real-Time Chat & Notification System
- **Key Challenge:** Bi-directional persistent connections, Offline delivery.
- **Solution:** WebSockets with HTTP Long Polling fallback, Connection Managers, Kafka event bus, Cassandra/HBase for append-heavy chat history.

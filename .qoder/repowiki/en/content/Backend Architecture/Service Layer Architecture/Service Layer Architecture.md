# Service Layer Architecture

<cite>
**Referenced Files in This Document**
- [server.js](file://backend/server.js)
- [config/index.js](file://backend/src/config/index.js)
- [services/solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [services/helius.js](file://backend/src/services/helius.js)
- [services/validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [services/rpcProber.js](file://backend/src/services/rpcProber.js)
- [services/bagsApi.js](file://backend/src/services/bagsApi.js)
- [routes/index.js](file://backend/src/routes/index.js)
- [routes/network.js](file://backend/src/routes/network.js)
- [routes/rpc.js](file://backend/src/routes/rpc.js)
- [routes/validators.js](file://backend/src/routes/validators.js)
- [routes/bags.js](file://backend/src/routes/bags.js)
- [middleware/errorHandler.js](file://backend/src/middleware/errorHandler.js)
- [jobs/criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [jobs/routinePoller.js](file://backend/src/jobs/routinePoller.js)
- [models/queries.js](file://backend/src/models/queries.js)
- [models/redis.js](file://backend/src/models/redis.js)
- [models/cacheKeys.js](file://backend/src/models/cacheKeys.js)
- [package.json](file://backend/package.json)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive Bags API service integration for token launch data and trading ecosystem
- Enhanced configuration management with centralized config module supporting multiple API providers
- Improved error handling across all services with graceful degradation and fallback mechanisms
- Added new Bags ecosystem routes with cache-first patterns and comprehensive validation
- Enhanced service initialization with better error handling and graceful failure modes

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the InfraWatch service layer architecture, focusing on how the backend collects, transforms, and exposes real-time Solana infrastructure data. It explains the service layer pattern implementation, external API integrations, and business logic encapsulation. It covers the Solana RPC service, Helius integration, Validators.app integration, RPC prober service, and the new Bags API service for token launch ecosystem data. It also documents initialization, configuration management, error handling, retry mechanisms, inter-service communication, data transformation, and caching integration. Finally, it provides usage examples, dependency injection patterns, and testing strategies.

## Project Structure
The backend follows a layered architecture with enhanced configuration management:
- Entry point initializes Express, Socket.io, middleware, and schedules periodic jobs.
- Services encapsulate external integrations and domain logic with comprehensive error handling.
- Routes define the API surface and orchestrate service calls with cache-first patterns.
- Data Access Layer (DAL) abstracts database operations.
- Models provide Redis caching and cache key conventions.
- Jobs coordinate periodic data collection and broadcasting.

```mermaid
graph TB
subgraph "Entry Point"
S["server.js"]
end
subgraph "Routes"
RIdx["routes/index.js"]
RN["routes/network.js"]
RR["routes/rpc.js"]
RV["routes/validators.js"]
RB["routes/bags.js"]
end
subgraph "Services"
SRPC["services/solanaRpc.js"]
SH["services/helius.js"]
SV["services/validatorsApp.js"]
PR["services/rpcProber.js"]
BA["services/bagsApi.js"]
end
subgraph "Data Access"
Q["models/queries.js"]
RC["models/cacheKeys.js"]
RD["models/redis.js"]
end
subgraph "Jobs"
CP["jobs/criticalPoller.js"]
RP["jobs/routinePoller.js"]
end
S --> RIdx
RIdx --> RN
RIdx --> RR
RIdx --> RV
RIdx --> RB
RN --> Q
RN --> RD
RR --> Q
RR --> RD
RR --> PR
RV --> Q
RV --> RD
RV --> SV
RB --> BA
RB --> RD
CP --> SRPC
CP --> SH
CP --> PR
CP --> Q
CP --> RD
RP --> SV
RP --> SRPC
RP --> Q
RP --> RD
```

**Diagram sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [routes/index.js:1-26](file://backend/src/routes/index.js#L1-L26)
- [routes/network.js:1-135](file://backend/src/routes/network.js#L1-L135)
- [routes/rpc.js:1-135](file://backend/src/routes/rpc.js#L1-L135)
- [routes/validators.js:1-112](file://backend/src/routes/validators.js#L1-L112)
- [routes/bags.js:1-202](file://backend/src/routes/bags.js#L1-L202)
- [services/solanaRpc.js:1-359](file://backend/src/services/solanaRpc.js#L1-L359)
- [services/helius.js:1-188](file://backend/src/services/helius.js#L1-L188)
- [services/validatorsApp.js:1-416](file://backend/src/services/validatorsApp.js#L1-L416)
- [services/rpcProber.js:1-342](file://backend/src/services/rpcProber.js#L1-L342)
- [services/bagsApi.js:1-200](file://backend/src/services/bagsApi.js#L1-L200)
- [models/queries.js:1-459](file://backend/src/models/queries.js#L1-L459)
- [models/redis.js:1-161](file://backend/src/models/redis.js#L1-L161)
- [models/cacheKeys.js:1-51](file://backend/src/models/cacheKeys.js#L1-L51)
- [jobs/criticalPoller.js:1-129](file://backend/src/jobs/criticalPoller.js#L1-L129)
- [jobs/routinePoller.js:1-129](file://backend/src/jobs/routinePoller.js#L1-L129)

**Section sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [routes/index.js:1-26](file://backend/src/routes/index.js#L1-L26)

## Core Components
- Solana RPC Service: Collects network health, TPS, slot info, epoch info, delinquent validators, and confirmation time. Computes congestion score and aggregates a network snapshot.
- Helius Integration: Provides priority fee estimates and enhanced TPS via Helius RPC. Gracefully handles missing API keys.
- Validators.app Integration: Fetches validator data with rate limiting and caching. Normalizes data and detects commission changes.
- RPC Prober Service: Probes multiple RPC providers for health and latency, computes rolling statistics, and recommends the best provider.
- Bags API Service: Integrates with Bags FM for token launch data, trading ecosystem information, and liquidity pool data.
- Data Access Layer: Encapsulates database operations for network snapshots, RPC health checks, validators, validator snapshots, and alerts.
- Caching: Redis-backed cache with TTL constants and cache key helpers.
- Jobs: Periodic collectors that orchestrate service calls, persist data, broadcast updates, and manage retries.

**Section sources**
- [services/solanaRpc.js:1-359](file://backend/src/services/solanaRpc.js#L1-L359)
- [services/helius.js:1-188](file://backend/src/services/helius.js#L1-L188)
- [services/validatorsApp.js:1-416](file://backend/src/services/validatorsApp.js#L1-L416)
- [services/rpcProber.js:1-342](file://backend/src/services/rpcProber.js#L1-L342)
- [services/bagsApi.js:1-200](file://backend/src/services/bagsApi.js#L1-L200)
- [models/queries.js:1-459](file://backend/src/models/queries.js#L1-L459)
- [models/redis.js:1-161](file://backend/src/models/redis.js#L1-L161)
- [models/cacheKeys.js:1-51](file://backend/src/models/cacheKeys.js#L1-L51)
- [jobs/criticalPoller.js:1-129](file://backend/src/jobs/criticalPoller.js#L1-L129)
- [jobs/routinePoller.js:1-129](file://backend/src/jobs/routinePoller.js#L1-L129)

## Architecture Overview
The system uses a service-layer pattern where each service encapsulates a bounded responsibility with enhanced error handling:
- External integrations are isolated in dedicated modules with graceful fallbacks.
- Business logic is centralized in services (e.g., congestion scoring, normalization, rate limiting).
- Routes act as orchestrators, delegating to services and DAL with cache-first patterns.
- Jobs coordinate periodic tasks and broadcast updates via WebSocket.

```mermaid
sequenceDiagram
participant Cron as "Cron Scheduler"
participant CP as "CriticalPoller"
participant SRPC as "SolanaRpc"
participant SH as "Helius"
participant PR as "RPC Prober"
participant BA as "BagsApi"
participant Q as "Queries"
participant RD as "Redis"
Cron->>CP : Schedule tick (every 30s)
CP->>SRPC : collectNetworkSnapshot()
SRPC->>SRPC : getNetworkHealth/getCurrentTps/getSlotInfo/getEpochInfo/getDelinquentValidators/getConfirmationTime
CP->>SH : getPriorityFeeEstimate()
SH-->>CP : priorityFeeData
CP->>SRPC : calculateCongestionScore(tps, percentile90, slotLatencyMs)
CP->>PR : probeAllProviders()
PR-->>CP : rpcResults
CP->>BA : getTokenLaunchFeed()/getBagsPools()
BA-->>CP : bagsData (if configured)
CP->>Q : insertNetworkSnapshot(...)
CP->>Q : insertRpcHealthCheck(...) (for each provider)
CP->>RD : setCache(NETWORK_CURRENT, snapshot)
CP->>RD : setCache(RPC_LATEST, rpcResults)
CP-->>Cron : emit("network : update"/"rpc : update") via Socket.io
```

**Diagram sources**
- [jobs/criticalPoller.js:32-115](file://backend/src/jobs/criticalPoller.js#L32-L115)
- [services/solanaRpc.js:289-347](file://backend/src/services/solanaRpc.js#L289-L347)
- [services/helius.js:13-70](file://backend/src/services/helius.js#L13-L70)
- [services/rpcProber.js:140-180](file://backend/src/services/rpcProber.js#L140-L180)
- [services/bagsApi.js:13-81](file://backend/src/services/bagsApi.js#L13-L81)
- [models/queries.js:27-118](file://backend/src/models/queries.js#L27-L118)
- [models/redis.js:99-112](file://backend/src/models/redis.js#L99-L112)

**Section sources**
- [jobs/criticalPoller.js:32-115](file://backend/src/jobs/criticalPoller.js#L32-L115)
- [server.js:84-107](file://backend/server.js#L84-L107)

## Detailed Component Analysis

### Solana RPC Service
Responsibilities:
- Health checks, TPS sampling, slot progression, epoch info, delinquent validators, and confirmation time.
- Aggregates a network snapshot and computes congestion score using TPS, priority fees, and slot latency.
- Uses @solana/web3.js Connection with a configured RPC URL.

Key behaviors:
- Concurrent collection of metrics via Promise.all.
- Defensive error handling returning safe defaults.
- Module-level state for slot tracking to compute latency.

```mermaid
flowchart TD
Start(["collectNetworkSnapshot"]) --> G1["getNetworkHealth()"]
Start --> G2["getCurrentTps()"]
Start --> G3["getSlotInfo()"]
Start --> G4["getEpochInfo()"]
Start --> G5["getDelinquentValidators()"]
Start --> G6["getConfirmationTime()"]
G1 --> Merge["Aggregate into snapshot"]
G2 --> Merge
G3 --> Merge
G4 --> Merge
G5 --> Merge
G6 --> Merge
Merge --> FeeCheck{"Priority fee data available?"}
FeeCheck --> |Yes| Score["calculateCongestionScore(tps, percentile90, slotLatencyMs)"]
FeeCheck --> |No| Skip["Leave congestionScore null"]
Score --> Out["Return snapshot"]
Skip --> Out
```

**Diagram sources**
- [services/solanaRpc.js:289-347](file://backend/src/services/solanaRpc.js#L289-L347)
- [services/solanaRpc.js:228-268](file://backend/src/services/solanaRpc.js#L228-L268)

**Section sources**
- [services/solanaRpc.js:1-359](file://backend/src/services/solanaRpc.js#L1-L359)

### Helius Integration Service
Responsibilities:
- Fetches priority fee estimates and optional enhanced TPS via Helius RPC.
- Validates configuration and returns null when API key is missing.
- Applies timeouts and logs errors.

Key behaviors:
- Configurable via environment variables; constructs Helius RPC URL from API key.
- Returns structured fee levels and proxies percentile90 to high for convenience.

```mermaid
sequenceDiagram
participant Caller as "Caller"
participant H as "Helius Service"
participant CFG as "Config"
participant AX as "Axios"
Caller->>H : getPriorityFeeEstimate()
H->>CFG : read heliusApiKey/heliusRpcUrl
alt API key configured
H->>AX : POST heliusRpcUrl with getPriorityFeeEstimate
AX-->>H : response.data
H-->>Caller : {low, medium, high, veryHigh, percentile90}
else Not configured
H-->>Caller : null
end
```

**Diagram sources**
- [services/helius.js:13-70](file://backend/src/services/helius.js#L13-L70)
- [config/index.js:21-26](file://backend/src/config/index.js#L21-L26)

**Section sources**
- [services/helius.js:1-188](file://backend/src/services/helius.js#L1-L188)
- [config/index.js:21-26](file://backend/src/config/index.js#L21-L26)

### Validators.app Integration Service
Responsibilities:
- Fetches validators with rate limiting and caching.
- Normalizes raw data to a unified schema.
- Detects commission changes and provides helper queries for top validators, delinquency, and data center grouping.

Key behaviors:
- Built-in rate limiter (40 requests per 5 minutes) with queueing and backpressure.
- Module-level cache with TTL and cache invalidation heuristics.
- Robust error handling with fallbacks to empty arrays.

```mermaid
classDiagram
class RateLimiter {
+maxRequests
+windowMs
+requests
+queue
+acquire()
+processQueue()
+getCurrentCount()
+getRemaining()
+getTimeUntilNextSlot()
}
class ValidatorsApp {
+getValidators(limit)
+getValidatorDetail(votePubkey)
+getPingThing()
+getCachedValidators()
+detectCommissionChanges(current, cached)
+getDelinquentValidators()
+getTopValidatorsByStake(count)
+getValidatorsByDataCenter()
+isConfigured()
+getRateLimitStatus()
-makeRequest(endpoint, params)
-normalizeValidator(validator)
}
ValidatorsApp --> RateLimiter : "uses"
```

**Diagram sources**
- [services/validatorsApp.js:9-99](file://backend/src/services/validatorsApp.js#L9-L99)
- [services/validatorsApp.js:115-149](file://backend/src/services/validatorsApp.js#L115-L149)
- [services/validatorsApp.js:156-179](file://backend/src/services/validatorsApp.js#L156-L179)

**Section sources**
- [services/validatorsApp.js:1-416](file://backend/src/services/validatorsApp.js#L1-L416)

### RPC Prober Service
Responsibilities:
- Probes multiple RPC providers for health and latency.
- Computes rolling statistics (percentiles, uptime, last incident).
- Recommends the best provider based on recent stats.

Key behaviors:
- Concurrent probing with Promise.allSettled to avoid partial failures.
- Maintains in-memory history per provider with capped size.
- Provides configuration for providers and environment overrides.

```mermaid
sequenceDiagram
participant Caller as "Caller"
participant RP as "RPC Prober"
participant AX as "Axios"
participant Hist as "History Map"
Caller->>RP : probeAllProviders()
loop For each provider
RP->>AX : POST getSlot with timeout
AX-->>RP : {result or error}
RP->>Hist : append check result
end
RP-->>Caller : results + update latestProbeResults
Caller->>RP : getAllProviderStats()
RP-->>Caller : {p50,p95,p99,uptime,...}
```

**Diagram sources**
- [services/rpcProber.js:140-180](file://backend/src/services/rpcProber.js#L140-L180)
- [services/rpcProber.js:208-250](file://backend/src/services/rpcProber.js#L208-L250)

**Section sources**
- [services/rpcProber.js:1-342](file://backend/src/services/rpcProber.js#L1-L342)

### Bags API Service
Responsibilities:
- Integrates with Bags FM API for token launch ecosystem data.
- Provides token launch feed, liquidity pools, lifetime fees, and trade quotes.
- Implements comprehensive error handling and graceful degradation.

Key behaviors:
- Configurable via environment variables with API key validation.
- Implements timeout handling and structured error responses.
- Provides multiple endpoints for different types of token ecosystem data.

```mermaid
flowchart TD
Start(["Bags API Service"]) --> CheckCfg{"API Key Configured?"}
CheckCfg --> |No| ReturnNull["Return null (graceful fallback)"]
CheckCfg --> |Yes| Endpoints["Available Endpoints"]
Endpoints --> LaunchFeed["getTokenLaunchFeed()"]
Endpoints --> Pools["getBagsPools()"]
Endpoints --> Fees["getTokenLifetimeFees()"]
Endpoints --> Quote["getTradeQuote()"]
LaunchFeed --> Validate["Validate response"]
Pools --> Validate
Fees --> Validate
Quote --> Validate
Validate --> Success["Return data"]
Validate --> Error["Log error and return null"]
```

**Diagram sources**
- [services/bagsApi.js:13-183](file://backend/src/services/bagsApi.js#L13-L183)

**Section sources**
- [services/bagsApi.js:1-200](file://backend/src/services/bagsApi.js#L1-L200)

### Data Access Layer (DAL)
Responsibilities:
- Parameterized queries for network snapshots, RPC health checks, validators, validator snapshots, and alerts.
- Ensures SQL injection prevention and consistent return types.

Key behaviors:
- Upserts validators on conflict using vote_pubkey.
- Retrieves latest entries per provider and provider-specific histories.
- Supports time-range queries for charts and dashboards.

**Section sources**
- [models/queries.js:1-459](file://backend/src/models/queries.js#L1-L459)

### Caching Integration
Responsibilities:
- Redis client with lazy initialization and retry strategy.
- Cache key constants and TTL helpers for network, RPC, validators, and history data.

Key behaviors:
- Graceful degradation when Redis is unavailable.
- JSON serialization/deserialization with error logging.
- TTL values tailored to data freshness needs.

**Section sources**
- [models/redis.js:1-161](file://backend/src/models/redis.js#L1-L161)
- [models/cacheKeys.js:1-51](file://backend/src/models/cacheKeys.js#L1-L51)

### Jobs Orchestration
Responsibilities:
- CriticalPoller: Every 30 seconds, collects network snapshot, probes RPC providers, persists to DB, caches, and emits WebSocket updates.
- RoutinePoller: Every 5 minutes, fetches validators, detects changes, upserts, snapshots, caches epoch info, and emits alerts.

Key behaviors:
- Throttling to prevent overlapping runs.
- Graceful error handling for DB and Redis failures.
- Broadcasting via Socket.io for real-time UI updates.

**Section sources**
- [jobs/criticalPoller.js:1-129](file://backend/src/jobs/criticalPoller.js#L1-L129)
- [jobs/routinePoller.js:1-129](file://backend/src/jobs/routinePoller.js#L1-L129)

### Routes and API Surface
Responsibilities:
- Network: current status and historical charts with cache-first strategy.
- RPC: provider status, rolling stats, recommendation, and provider history.
- Validators: top validators and detailed validator info with multi-source fallback.
- Bags: token launch ecosystem data with cache-first pattern and comprehensive validation.

Key behaviors:
- Cache-first with Redis, fallback to DB.
- Validation of query parameters and structured error responses.
- Multi-source fallback: Redis → DB → external APIs.

**Section sources**
- [routes/network.js:1-135](file://backend/src/routes/network.js#L1-L135)
- [routes/rpc.js:1-135](file://backend/src/routes/rpc.js#L1-L135)
- [routes/validators.js:1-112](file://backend/src/routes/validators.js#L1-L112)
- [routes/bags.js:1-202](file://backend/src/routes/bags.js#L1-L202)

## Dependency Analysis
External dependencies and their roles:
- @solana/web3.js: Solana RPC connectivity and metrics.
- axios: HTTP client for Helius, Validators.app, and Bags FM APIs.
- node-cron: Scheduling periodic jobs.
- pg: PostgreSQL driver for the DAL.
- ioredis: Redis client with retry strategy.
- express, socket.io, cors, helmet, compression: Web server, real-time updates, and security.

```mermaid
graph LR
SRV["server.js"] --> CFG["config/index.js"]
SRV --> RT["routes/index.js"]
SRV --> DBI["models/db.js"]
SRV --> RDI["models/redis.js"]
RT --> RNW["routes/network.js"]
RT --> RRP["routes/rpc.js"]
RT --> RV["routes/validators.js"]
RT --> RB["routes/bags.js"]
RNW --> Q["models/queries.js"]
RNW --> RD["models/redis.js"]
RRP --> Q
RRP --> RD
RRP --> PR["services/rpcProber.js"]
RV --> Q
RV --> RD
RV --> SV["services/validatorsApp.js"]
RB --> BA["services/bagsApi.js"]
CP["jobs/criticalPoller.js"] --> SRPC["services/solanaRpc.js"]
CP --> SH["services/helius.js"]
CP --> PR
CP --> BA
CP --> Q
CP --> RD
RPJ["jobs/routinePoller.js"] --> SV
RPJ --> SRPC
RPJ --> Q
RPJ --> RD
```

**Diagram sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [routes/index.js:1-26](file://backend/src/routes/index.js#L1-L26)
- [models/redis.js:1-161](file://backend/src/models/redis.js#L1-L161)
- [models/queries.js:1-459](file://backend/src/models/queries.js#L1-L459)
- [services/solanaRpc.js:1-359](file://backend/src/services/solanaRpc.js#L1-L359)
- [services/helius.js:1-188](file://backend/src/services/helius.js#L1-L188)
- [services/validatorsApp.js:1-416](file://backend/src/services/validatorsApp.js#L1-L416)
- [services/rpcProber.js:1-342](file://backend/src/services/rpcProber.js#L1-L342)
- [services/bagsApi.js:1-200](file://backend/src/services/bagsApi.js#L1-L200)
- [jobs/criticalPoller.js:1-129](file://backend/src/jobs/criticalPoller.js#L1-L129)
- [jobs/routinePoller.js:1-129](file://backend/src/jobs/routinePoller.js#L1-L129)

**Section sources**
- [package.json:22-34](file://backend/package.json#L22-L34)

## Performance Considerations
- Concurrency: Services use Promise.all and Promise.allSettled to minimize latency when fetching multiple endpoints.
- Caching: Redis cache keys and TTLs reduce DB and external API load. Cache-first routes improve response times.
- Rate limiting: Validators.app integration prevents throttling by queuing requests and enforcing limits.
- Retries: Redis client has retryStrategy and maxRetriesPerRequest; jobs handle transient failures gracefully.
- Timeouts: External calls enforce timeouts to bound latency and prevent hanging requests.
- Percentile calculations: Rolling stats use interpolation for accurate latency percentiles.
- Graceful degradation: All services implement fallback mechanisms when external APIs are unavailable.

## Troubleshooting Guide
Common issues and strategies:
- Missing API keys or endpoints:
  - Helius: Service returns null when API key is missing; verify configuration.
  - Validators.app: Service logs when API key is missing; ensure environment variable is set.
  - Bags FM: Service returns null when API key is missing; ensure BAGS_API_KEY is configured.
- Redis unavailability:
  - Redis module returns null or false; routes and jobs continue with DB fallback.
- Database outages:
  - DAL throws errors; jobs wrap DB operations in try/catch and warn rather than failing the whole cycle.
- External provider errors:
  - RPC Prober records error messages and marks providers unhealthy; routes still return partial data.
- Error handling middleware:
  - Centralized error handler converts known errors to appropriate HTTP responses and logs details.
- Bags API specific:
  - All Bags API endpoints return 503 status when API is not configured.
  - Token mint validation ensures proper parameters are provided.

**Section sources**
- [services/helius.js:14-18](file://backend/src/services/helius.js#L14-L18)
- [services/validatorsApp.js:116-119](file://backend/src/services/validatorsApp.js#L116-L119)
- [services/bagsApi.js:14-18](file://backend/src/services/bagsApi.js#L14-L18)
- [models/redis.js:75-89](file://backend/src/models/redis.js#L75-L89)
- [jobs/criticalPoller.js:49-63](file://backend/src/jobs/criticalPoller.js#L49-L63)
- [middleware/errorHandler.js:44-109](file://backend/src/middleware/errorHandler.js#L44-L109)

## Conclusion
InfraWatch's service layer cleanly separates concerns across external integrations, business logic, persistence, and presentation. The design emphasizes resilience through comprehensive error handling, caching, rate limiting, and graceful degradation. The addition of the Bags API service enhances the platform's capabilities for tracking token launch ecosystems. Periodic jobs keep data fresh, while routes provide a robust, cache-first API. The architecture supports easy extension and testing, with clear boundaries between services and modules.

## Appendices

### Service Initialization and Configuration Management
- Configuration loading:
  - Loads .env if present, merges with environment variables, and constructs derived URLs (e.g., Helius RPC URL).
  - Defines polling intervals, Redis URL, and CORS origin.
  - Supports multiple API configurations: Solana RPC, Validators.app, Bags FM.
- Redis initialization:
  - Lazy connection with retry strategy and event logging.
- Server startup:
  - Initializes database and Redis, mounts routes, sets up Socket.io, and starts jobs.

**Section sources**
- [config/index.js:1-74](file://backend/src/config/index.js#L1-L74)
- [models/redis.js:16-68](file://backend/src/models/redis.js#L16-L68)
- [server.js:84-107](file://backend/server.js#L84-L107)

### Inter-Service Communication Patterns
- Jobs orchestrate services and DAL, emitting updates via Socket.io.
- Routes delegate to services and DAL, applying cache-first policies.
- Services remain stateless and rely on shared configuration and Redis.
- Bags API service integrates seamlessly with existing service patterns.

**Section sources**
- [jobs/criticalPoller.js:33-92](file://backend/src/jobs/criticalPoller.js#L33-L92)
- [routes/network.js:17-79](file://backend/src/routes/network.js#L17-L79)
- [routes/rpc.js:17-88](file://backend/src/routes/rpc.js#L17-L88)
- [routes/validators.js:52-109](file://backend/src/routes/validators.js#L52-L109)
- [routes/bags.js:20-68](file://backend/src/routes/bags.js#L20-L68)

### Data Transformation Processes
- Solana RPC:
  - Metrics aggregation into a normalized snapshot with congestion score computation.
- Validators.app:
  - Raw validator objects normalized to a unified schema.
  - Commission change detection via cached vs. current comparison.
- RPC Prober:
  - Provider results transformed into rolling statistics and recommendations.
- Bags API:
  - Token launch data normalized to consistent schema.
  - Trade quotes processed and validated for accuracy.

**Section sources**
- [services/solanaRpc.js:289-347](file://backend/src/services/solanaRpc.js#L289-L347)
- [services/validatorsApp.js:156-179](file://backend/src/services/validatorsApp.js#L156-L179)
- [services/rpcProber.js:208-250](file://backend/src/services/rpcProber.js#L208-L250)
- [services/bagsApi.js:13-81](file://backend/src/services/bagsApi.js#L13-L81)

### Caching Integration Details
- Cache keys:
  - Centralized constants for network, RPC, validators, and history with TTL values.
  - Added Bags-specific cache keys with 60-second TTL.
- Redis operations:
  - Lazy initialization, JSON serialization, TTL, and error-safe operations.
- Route cache-first:
  - Network and validators routes attempt Redis first, then DB, and cache responses.
  - Bags routes implement cache-first with 60-second TTL for pools and launches.

**Section sources**
- [models/cacheKeys.js:1-51](file://backend/src/models/cacheKeys.js#L1-L51)
- [models/redis.js:75-112](file://backend/src/models/redis.js#L75-L112)
- [routes/network.js:19-42](file://backend/src/routes/network.js#L19-L42)
- [routes/validators.js:22-42](file://backend/src/routes/validators.js#L22-L42)
- [routes/bags.js:12-13](file://backend/src/routes/bags.js#L12-L13)

### Examples of Service Usage
- Network route:
  - GET /api/network/current returns a cache-first snapshot, transforming internal fields to API shape.
- RPC route:
  - GET /api/rpc/status merges latest results with rolling stats and provides a recommendation.
- Validators route:
  - GET /api/validators/:votePubkey attempts Redis cache, then Validators.app, then DB.
- Bags routes:
  - GET /api/bags/pools returns cached or fresh pools data with migration filtering.
  - GET /api/bags/launches returns token launch feed with cache-first approach.
  - GET /api/bags/fees/:tokenMint returns lifetime fees for a specific token.
  - GET /api/bags/quote returns trade quotes with parameter validation.

**Section sources**
- [routes/network.js:17-79](file://backend/src/routes/network.js#L17-L79)
- [routes/rpc.js:17-88](file://backend/src/routes/rpc.js#L17-L88)
- [routes/validators.js:52-109](file://backend/src/routes/validators.js#L52-L109)
- [routes/bags.js:16-199](file://backend/src/routes/bags.js#L16-L199)

### Dependency Injection and Testing Strategies
- Dependency injection:
  - Services are pure modules exporting functions; routes import and call them directly.
  - Jobs import services and DAL; server imports routes and jobs.
- Testing strategies:
  - Mock external services (Helius, Validators.app, Bags FM) by stubbing axios and returning controlled responses.
  - Test rate limiter behavior by simulating queue acquisition and window expiration.
  - Verify congestion score calculation with known TPS, fee, and latency inputs.
  - Validate RPC prober percentile calculations with deterministic arrays.
  - Use in-memory history for RPC prober tests and clearHistory to reset state.
  - Test Bags API error handling by mocking API failures and verifying graceful fallbacks.

### Enhanced Error Handling and Graceful Degradation
- All services implement comprehensive error handling with structured logging.
- Graceful fallback mechanisms ensure system continues operating when external APIs fail.
- Timeout configurations prevent hanging requests and resource exhaustion.
- Centralized error handling middleware standardizes error responses across all routes.

**Section sources**
- [services/bagsApi.js:38-41](file://backend/src/services/bagsApi.js#L38-L41)
- [services/helius.js:66-69](file://backend/src/services/helius.js#L66-L69)
- [services/validatorsApp.js:141-148](file://backend/src/services/validatorsApp.js#L141-L148)
- [routes/bags.js:45-50](file://backend/src/routes/bags.js#L45-L50)
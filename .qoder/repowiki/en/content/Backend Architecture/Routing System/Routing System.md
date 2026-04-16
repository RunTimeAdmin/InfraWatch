# Routing System

<cite>
**Referenced Files in This Document**
- [server.js](file://backend/server.js)
- [routes/index.js](file://backend/src/routes/index.js)
- [routes/network.js](file://backend/src/routes/network.js)
- [routes/rpc.js](file://backend/src/routes/rpc.js)
- [routes/validators.js](file://backend/src/routes/validators.js)
- [routes/epoch.js](file://backend/src/routes/epoch.js)
- [routes/alerts.js](file://backend/src/routes/alerts.js)
- [routes/bags.js](file://backend/src/routes/bags.js)
- [websocket/index.js](file://backend/src/websocket/index.js)
- [middleware/errorHandler.js](file://backend/src/middleware/errorHandler.js)
- [models/queries.js](file://backend/src/models/queries.js)
- [models/cacheKeys.js](file://backend/src/models/cacheKeys.js)
- [models/redis.js](file://backend/src/models/redis.js)
- [services/rpcProber.js](file://backend/src/services/rpcProber.js)
- [services/validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [services/solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [services/bagsApi.js](file://backend/src/services/bagsApi.js)
- [config/index.js](file://backend/src/config/index.js)
- [package.json](file://backend/package.json)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive documentation for new Bags routes providing integration with Bags FM API
- Enhanced Network Routes documentation to reflect improved camelCase field name handling
- Updated WebSocket architecture documentation to reflect centralized initialization
- Added new Bags ecosystem endpoints for token launches, pools, and trading quotes
- Expanded route composition patterns to include the new Bags domain

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

## Introduction
This document describes the InfraWatch routing system built with Express. It explains the modular router architecture, route organization by domain, and the endpoint structure for network, RPC, validators, epoch, alerts, and the newly added Bags ecosystem routes. It also documents middleware usage, parameter validation, error handling, and how routes integrate with the service and data layers.

## Project Structure
The backend exposes a single API base path and mounts sub-routers grouped by domain. Each route file encapsulates endpoints for its domain and delegates data access to services and the data layer. The system now includes a comprehensive Bags ecosystem integration alongside traditional network monitoring capabilities.

```mermaid
graph TB
A["Express App<br/>server.js"] --> B["Routes Aggregator<br/>routes/index.js"]
B --> C["Network Routes<br/>routes/network.js"]
B --> D["RPC Routes<br/>routes/rpc.js"]
B --> E["Validators Routes<br/>routes/validators.js"]
B --> F["Epoch Routes<br/>routes/epoch.js"]
B --> G["Alerts Routes<br/>routes/alerts.js"]
B --> H["Bags Routes<br/>routes/bags.js"]
C --> I["Queries (DB)<br/>models/queries.js"]
C --> J["Redis Cache<br/>models/redis.js"]
D --> I
D --> J
D --> K["RPC Prober<br/>services/rpcProber.js"]
E --> I
E --> J
E --> L["Validators.app Client<br/>services/validatorsApp.js"]
F --> J
F --> M["Solana RPC Client<br/>services/solanaRpc.js"]
G --> I
H --> N["Bags API Client<br/>services/bagsApi.js"]
H --> J
```

**Diagram sources**
- [server.js:71-72](file://backend/server.js#L71-L72)
- [routes/index.js:16-24](file://backend/src/routes/index.js#L16-L24)
- [routes/network.js:1-136](file://backend/src/routes/network.js#L1-L136)
- [routes/rpc.js:1-135](file://backend/src/routes/rpc.js#L1-L135)
- [routes/validators.js:1-112](file://backend/src/routes/validators.js#L1-L112)
- [routes/epoch.js:1-62](file://backend/src/routes/epoch.js#L1-L62)
- [routes/alerts.js:1-46](file://backend/src/routes/alerts.js#L1-L46)
- [routes/bags.js:1-202](file://backend/src/routes/bags.js#L1-L202)
- [models/queries.js:1-200](file://backend/src/models/queries.js#L1-L200)
- [models/redis.js:1-161](file://backend/src/models/redis.js#L1-L161)
- [services/rpcProber.js:1-200](file://backend/src/services/rpcProber.js#L1-L200)
- [services/validatorsApp.js:1-200](file://backend/src/services/validatorsApp.js#L1-L200)
- [services/solanaRpc.js:1-200](file://backend/src/services/solanaRpc.js#L1-L200)
- [services/bagsApi.js:1-200](file://backend/src/services/bagsApi.js#L1-L200)

**Section sources**
- [server.js:71-79](file://backend/server.js#L71-L79)
- [routes/index.js:16-24](file://backend/src/routes/index.js#L16-L24)

## Core Components
- Express app and middleware pipeline: Helmet, compression, CORS, body parsing, health check, global error handler, and 404 handling.
- Routes aggregator mounts domain-specific routers under /api, including the new Bags ecosystem routes.
- Domain routers implement endpoints with cache-first patterns, parameter validation, and error propagation to the global handler.
- Services encapsulate external integrations (RPC probing, Validators.app, Solana RPC, Bags API) and internal data access via queries.
- Centralized WebSocket initialization provides real-time communication capabilities across all routes.

**Section sources**
- [server.js:52-79](file://backend/server.js#L52-L79)
- [routes/index.js:16-24](file://backend/src/routes/index.js#L16-L24)
- [websocket/index.js:13-33](file://backend/src/websocket/index.js#L13-L33)
- [middleware/errorHandler.js:44-127](file://backend/src/middleware/errorHandler.js#L44-L127)

## Architecture Overview
The routing system follows a modular, layered architecture with enhanced real-time capabilities:
- Entry point initializes middleware, WebSocket server, and routes.
- Sub-routers define domain endpoints including the new Bags ecosystem.
- Endpoints call services and the data layer with improved field name handling.
- Redis cache is used for fast reads; database is used as fallback.
- Centralized WebSocket provides real-time updates for network and RPC data.
- Global error handler standardizes error responses.

```mermaid
sequenceDiagram
participant Client as "Client"
participant App as "Express App<br/>server.js"
participant Router as "Routes Aggregator<br/>routes/index.js"
participant Bags as "Bags Router<br/>routes/bags.js"
participant BAPI as "Bags API<br/>services/bagsApi.js"
participant R as "Redis<br/>models/redis.js"
Client->>App : GET /api/bags/pools?onlyMigrated=true
App->>Router : route to /bags
Router->>Bags : dispatch GET /pools
Bags->>R : getCache(bags : pools : true)
alt cache hit
R-->>Bags : cached pools
Bags-->>Client : JSON with success flag and data
else cache miss
Bags->>BAPI : getBagsPools(true)
BAPI-->>Bags : pools data
Bags->>R : setCache(bags : pools : true, pools, 60s)
Bags-->>Client : JSON with success flag and data
end
```

**Diagram sources**
- [server.js:71-72](file://backend/server.js#L71-L72)
- [routes/index.js:23](file://backend/src/routes/index.js#L23)
- [routes/bags.js:20-68](file://backend/src/routes/bags.js#L20-L68)
- [services/bagsApi.js:49-81](file://backend/src/services/bagsApi.js#L49-L81)
- [models/redis.js:75-90](file://backend/src/models/redis.js#L75-L90)

## Detailed Component Analysis

### Network Routes
Endpoints:
- GET /api/network/current
  - Purpose: Returns current network status with enhanced field name handling.
  - Cache-first: Attempts Redis; falls back to database.
  - Field transformation: Converts between Redis camelCase format and standardized response format.
  - Authentication: Not required.
  - Response: JSON with status, TPS, slot metrics, epoch info, counts, and timestamp.
  - Error handling: 503 on startup/unavailable; global handler for unexpected errors.

- GET /api/network/history?range=1h|24h|7d
  - Purpose: Returns historical network snapshots for charts.
  - Cache-first: Attempts Redis; falls back to database.
  - Validation: Validates range parameter against allowed values.
  - Authentication: Not required.
  - Response: Array of snapshots.
  - Error handling: Returns empty array on DB failure; logs cache failures as warnings.

**Updated** Enhanced field name handling to support both Redis camelCase format and database snake_case format, ensuring backward compatibility.

```mermaid
flowchart TD
Start(["GET /api/network/current"]) --> TryCache["Try Redis cache"]
TryCache --> CacheHit{"Cache hit?"}
CacheHit --> |Yes| TransformFields["Transform camelCase to standardized format"]
TransformFields --> ReturnCached["Return transformed JSON"]
CacheHit --> |No| QueryDB["Query latest snapshot"]
QueryDB --> DBSuccess{"DB success?"}
DBSuccess --> |No| Return503["Return 503 JSON"]
DBSuccess --> |Yes| ReturnJSON["Return snapshot JSON"]
ReturnCached --> End(["End"])
ReturnJSON --> End
Return503 --> End
```

**Diagram sources**
- [routes/network.js:17-80](file://backend/src/routes/network.js#L17-L80)
- [models/redis.js:75-90](file://backend/src/models/redis.js#L75-L90)
- [models/queries.js:54-62](file://backend/src/models/queries.js#L54-L62)

**Section sources**
- [routes/network.js:17-80](file://backend/src/routes/network.js#L17-L80)
- [routes/network.js:86-133](file://backend/src/routes/network.js#L86-L133)
- [models/cacheKeys.js:8-11](file://backend/src/models/cacheKeys.js#L8-L11)
- [models/redis.js:75-112](file://backend/src/models/redis.js#L75-L112)

### RPC Routes
Endpoints:
- GET /api/rpc/status
  - Purpose: Returns current provider statuses with rolling statistics and a recommendation.
  - Cache-first: Attempts Redis; falls back to database.
  - Rolling stats: Merges latest DB results with stats computed by the prober service.
  - Recommendation: Best provider derived from rolling stats.
  - Response: Providers array with stats, recommendation, and timestamp.
  - Error handling: Returns empty array on DB failure; global handler for unexpected errors.

- GET /api/rpc/:provider/history?range=1h|24h|7d
  - Purpose: Returns health history for a specific provider.
  - Validation: Validates range parameter.
  - Response: Transformed array of health checks.
  - Error handling: Returns empty array on DB failure; global handler for unexpected errors.

```mermaid
sequenceDiagram
participant Client as "Client"
participant RPC as "RPC Router<br/>routes/rpc.js"
participant R as "Redis<br/>models/redis.js"
participant Q as "Queries<br/>models/queries.js"
participant P as "RPC Prober<br/>services/rpcProber.js"
Client->>RPC : GET /api/rpc/status
RPC->>R : getCache(RPC_LATEST)
alt cache hit
R-->>RPC : providers
else cache miss
RPC->>Q : getRpcLatestByProvider()
Q-->>RPC : providers
end
RPC->>P : getAllProviderStats()
P-->>RPC : stats
RPC->>P : getBestProvider()
P-->>RPC : best
RPC-->>Client : {providers, recommendation, timestamp}
```

**Diagram sources**
- [routes/rpc.js:17-88](file://backend/src/routes/rpc.js#L17-L88)
- [models/redis.js:75-90](file://backend/src/models/redis.js#L75-L90)
- [models/queries.js:124-132](file://backend/src/models/queries.js#L124-L132)
- [services/rpcProber.js:140-180](file://backend/src/services/rpcProber.js#L140-L180)

**Section sources**
- [routes/rpc.js:17-88](file://backend/src/routes/rpc.js#L17-L88)
- [routes/rpc.js:94-132](file://backend/src/routes/rpc.js#L94-L132)
- [services/rpcProber.js:11-63](file://backend/src/services/rpcProber.js#L11-L63)
- [services/rpcProber.js:140-180](file://backend/src/services/rpcProber.js#L140-L180)
- [models/cacheKeys.js:9](file://backend/src/models/cacheKeys.js#L9)
- [models/redis.js:75-112](file://backend/src/models/redis.js#L75-L112)

### Validators Routes
Endpoints:
- GET /api/validators/top?limit=1..100
  - Purpose: Returns top validators sorted by score.
  - Cache-first: Attempts Redis; falls back to database.
  - Validation: Clamps limit between 1 and 100.
  - Response: Array of validators.
  - Error handling: Returns empty array on DB failure; global handler for unexpected errors.

- GET /api/validators/:votePubkey
  - Purpose: Returns a single validator's details.
  - Validation: Requires votePubkey parameter.
  - Priority: Try Redis; then Validators.app; finally database.
  - Response: Validator object.
  - Error handling: 404 if not found; global handler for unexpected errors.

```mermaid
flowchart TD
StartV(["GET /api/validators/:votePubkey"]) --> CheckParam["Check votePubkey param"]
CheckParam --> ParamOK{"Provided?"}
ParamOK --> |No| Return400["Return 400 JSON"]
ParamOK --> |Yes| TryCacheV["Try Redis cache by votePubkey"]
TryCacheV --> CacheHitV{"Cache hit?"}
CacheHitV --> |Yes| ReturnCachedV["Return cached validator"]
CacheHitV --> |No| FetchVA["Fetch from Validators.app"]
FetchVA --> FetchOK{"Fetched?"}
FetchOK --> |Yes| CacheSet["Cache result"] --> ReturnVA["Return validator"]
FetchOK --> |No| QueryDBV["Query DB by pubkey"]
QueryDBV --> DBOK{"Found?"}
DBOK --> |No| Return404["Return 404 JSON"]
DBOK --> |Yes| CacheSet2["Cache result"] --> ReturnDB["Return validator"]
Return400 --> EndV(["End"])
Return404 --> EndV
ReturnCachedV --> EndV
ReturnVA --> EndV
ReturnDB --> EndV
```

**Diagram sources**
- [routes/validators.js:52-109](file://backend/src/routes/validators.js#L52-L109)
- [services/validatorsApp.js:186-200](file://backend/src/services/validatorsApp.js#L186-L200)
- [models/queries.js:1-200](file://backend/src/models/queries.js#L1-L200)
- [models/cacheKeys.js:25](file://backend/src/models/cacheKeys.js#L25)

**Section sources**
- [routes/validators.js:17-46](file://backend/src/routes/validators.js#L17-L46)
- [routes/validators.js:52-109](file://backend/src/routes/validators.js#L52-L109)
- [services/validatorsApp.js:115-149](file://backend/src/services/validatorsApp.js#L115-L149)
- [models/cacheKeys.js:11](file://backend/src/models/cacheKeys.js#L11)

### Epoch Routes
Endpoint:
- GET /api/epoch/current
  - Purpose: Returns current epoch information.
  - Cache-first: Attempts Redis; falls back to Solana RPC client.
  - Response: Epoch info with progress and ETA.
  - Error handling: Global handler for unexpected errors.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Epoch as "Epoch Router<br/>routes/epoch.js"
participant R as "Redis<br/>models/redis.js"
participant S as "Solana RPC<br/>services/solanaRpc.js"
Client->>Epoch : GET /api/epoch/current
Epoch->>R : getCache(EPOCH_INFO)
alt cache hit
R-->>Epoch : epochInfo
Epoch-->>Client : JSON with epoch metrics
else cache miss
Epoch->>S : getEpochInfo()
S-->>Epoch : epochInfo
Epoch->>R : setCache(EPOCH_INFO, epochInfo, TTL)
Epoch-->>Client : JSON with epoch metrics
end
```

**Diagram sources**
- [routes/epoch.js:16-59](file://backend/src/routes/epoch.js#L16-L59)
- [models/redis.js:75-112](file://backend/src/models/redis.js#L75-L112)
- [services/solanaRpc.js:124-156](file://backend/src/services/solanaRpc.js#L124-L156)
- [models/cacheKeys.js:10](file://backend/src/models/cacheKeys.js#L10)

**Section sources**
- [routes/epoch.js:16-59](file://backend/src/routes/epoch.js#L16-L59)
- [services/solanaRpc.js:124-156](file://backend/src/services/solanaRpc.js#L124-L156)
- [models/cacheKeys.js:10](file://backend/src/models/cacheKeys.js#L10)

### Alerts Routes
Endpoint:
- GET /api/alerts?limit=1..100
  - Purpose: Returns recent alerts.
  - Validation: Clamps limit between 1 and 100.
  - Response: Array of alerts with normalized fields.
  - Error handling: Returns empty array on DB failure; global handler for unexpected errors.

**Section sources**
- [routes/alerts.js:14-43](file://backend/src/routes/alerts.js#L14-L43)
- [models/queries.js:1-200](file://backend/src/models/queries.js#L1-L200)

### Bags Routes
**New** Comprehensive Bags ecosystem integration providing access to token launch data, liquidity pools, and trading quotes.

Endpoints:
- GET /api/bags/pools?onlyMigrated=true|false
  - Purpose: Returns Bags ecosystem liquidity pools with optional migration filtering.
  - Cache-first: Attempts Redis with dynamic cache key based on filter; falls back to Bags API.
  - TTL: 60 seconds for pool data.
  - Response: JSON with success flag, source indicator, and pool data array.
  - Error handling: Returns 503 with service unavailable message when Bags API is not configured.

- GET /api/bags/launches
  - Purpose: Returns token launch feed from Bags FM.
  - Cache-first: Attempts Redis; falls back to Bags API.
  - TTL: 60 seconds for launch data.
  - Response: JSON with success flag, source indicator, and launch data array.
  - Error handling: Returns 503 with service unavailable message when Bags API is not configured.

- GET /api/bags/fees/:tokenMint
  - Purpose: Returns lifetime fees for a specific token.
  - No caching: Always fetches fresh data from Bags API.
  - Validation: Requires tokenMint parameter.
  - Response: JSON with success flag, token mint address, and lifetime fees in lamports.
  - Error handling: Returns 503 with service unavailable message when Bags API is not configured.

- GET /api/bags/quote
  - Purpose: Returns trading quote for token swaps.
  - No caching: Quotes are time-sensitive and fetched fresh each request.
  - Validation: Requires inputMint, outputMint, and amount parameters.
  - Response: JSON with success flag and quote object containing trade details.
  - Error handling: Returns 503 with service unavailable message when Bags API is not configured.

**Section sources**
- [routes/bags.js:15-202](file://backend/src/routes/bags.js#L15-L202)
- [services/bagsApi.js:13-199](file://backend/src/services/bagsApi.js#L13-L199)

### WebSocket Integration
**Updated** Centralized WebSocket initialization provides real-time updates across all routes.

- Centralized setup: WebSocket server created in server.js and passed to all components.
- Real-time events: Network updates, RPC health checks, and alerts broadcast to connected clients.
- Connection management: Tracks connected clients and handles disconnections gracefully.
- Broadcasting: Supports both global broadcasts and room-specific messaging.

**Section sources**
- [server.js:39-81](file://backend/server.js#L39-L81)
- [websocket/index.js:13-80](file://backend/src/websocket/index.js#L13-L80)
- [jobs/criticalPoller.js:110-113](file://backend/src/jobs/criticalPoller.js#L110-L113)
- [jobs/routinePoller.js:110-112](file://backend/src/jobs/routinePoller.js#L110-L112)

### Route Composition and Nesting
- The routes aggregator mounts sub-routers at /api/network, /api/rpc, /api/validators, /api/epoch, /api/alerts, and /api/bags.
- Nested patterns:
  - RPC: /:provider/history uses a path parameter.
  - Validators: /:votePubkey uses a path parameter.
  - Bags: /:tokenMint uses a path parameter for fee queries.
- Route composition:
  - Each router composes service and data-layer calls.
  - Middleware runs before route handlers.
  - WebSocket integration enables real-time updates.

**Section sources**
- [routes/index.js:16-24](file://backend/src/routes/index.js#L16-L24)
- [routes/rpc.js:94](file://backend/src/routes/rpc.js#L94)
- [routes/validators.js:54](file://backend/src/routes/validators.js#L54)
- [routes/bags.js:130](file://backend/src/routes/bags.js#L130)

## Dependency Analysis
- Express app depends on:
  - Routes aggregator including the new Bags routes.
  - Global error handler and not-found handler.
  - Centralized WebSocket setup.
- Routes depend on:
  - Queries for database access.
  - Redis for caching.
  - Services for external integrations including the new Bags API client.
- Services depend on:
  - Configuration for endpoints and keys.
  - External APIs and Solana web3 connection.
  - WebSocket instance for real-time communication.

```mermaid
graph LR
App["server.js"] --> RoutesIdx["routes/index.js"]
RoutesIdx --> Net["routes/network.js"]
RoutesIdx --> RPC["routes/rpc.js"]
RoutesIdx --> Val["routes/validators.js"]
RoutesIdx --> Epoch["routes/epoch.js"]
RoutesIdx --> Alerts["routes/alerts.js"]
RoutesIdx --> Bags["routes/bags.js"]
Net --> Q["models/queries.js"]
Net --> R["models/redis.js"]
RPC --> Q
RPC --> R
RPC --> Prober["services/rpcProber.js"]
Val --> Q
Val --> R
Val --> VApp["services/validatorsApp.js"]
Epoch --> R
Epoch --> SRPC["services/solanaRpc.js"]
Alerts --> Q
Bags --> BAPI["services/bagsApi.js"]
Bags --> R
```

**Diagram sources**
- [server.js:23-27](file://backend/server.js#L23-L27)
- [routes/index.js:10-15](file://backend/src/routes/index.js#L10-L15)
- [routes/network.js:8-10](file://backend/src/routes/network.js#L8-L10)
- [routes/rpc.js:8-11](file://backend/src/routes/rpc.js#L8-L11)
- [routes/validators.js:8-11](file://backend/src/routes/validators.js#L8-L11)
- [routes/epoch.js:8-10](file://backend/src/routes/epoch.js#L8-L10)
- [routes/alerts.js:8](file://backend/src/routes/alerts.js#L8)
- [routes/bags.js:8](file://backend/src/routes/bags.js#L8)

**Section sources**
- [server.js:23-27](file://backend/server.js#L23-L27)
- [routes/index.js:10-15](file://backend/src/routes/index.js#L10-L15)

## Performance Considerations
- Caching strategy:
  - Redis cache keys are centralized and TTLs are tuned per domain.
  - Cache-first reads reduce database and external API load.
  - Bags routes use 60-second TTL for frequently changing data.
- Parameter validation:
  - Range parameters validated to avoid invalid queries.
  - Limits clamped to safe ranges to prevent heavy loads.
  - Bags routes validate required parameters for API calls.
- Graceful degradation:
  - On Redis failure, routes fall back to database or external services.
  - On DB failure, routes often return empty arrays or minimal responses.
  - Bags routes return 503 when API is not configured.
- External service reliability:
  - RPC prober and Validators.app clients include timeouts and rate limiting.
  - Bags API client includes proper error handling and timeouts.
- Real-time communication:
  - Centralized WebSocket reduces overhead and improves scalability.
  - Event broadcasting optimized for efficient client updates.
- Compression and security:
  - Compression and Helmet applied at the app level to optimize transport and security.

**Section sources**
- [models/cacheKeys.js:42-48](file://backend/src/models/cacheKeys.js#L42-L48)
- [routes/network.js:87-96](file://backend/src/routes/network.js#L87-L96)
- [routes/rpc.js:99-106](file://backend/src/routes/rpc.js#L99-L106)
- [routes/validators.js:19-20](file://backend/src/routes/validators.js#L19-L20)
- [routes/alerts.js:16-17](file://backend/src/routes/alerts.js#L16-L17)
- [routes/bags.js:12-13](file://backend/src/routes/bags.js#L12-L13)
- [models/redis.js:75-112](file://backend/src/models/redis.js#L75-L112)
- [services/rpcProber.js:75-134](file://backend/src/services/rpcProber.js#L75-L134)
- [services/validatorsApp.js:115-149](file://backend/src/services/validatorsApp.js#L115-L149)
- [services/bagsApi.js:14-18](file://backend/src/services/bagsApi.js#L14-L18)
- [server.js:52-59](file://backend/server.js#L52-L59)

## Troubleshooting Guide
- Health check:
  - Endpoint: GET /api/health.
  - Useful for verifying server readiness.
- Error handling:
  - Global handler standardizes responses and logs details.
  - Known error classes: validation, not found, unauthorized, forbidden.
  - Bags routes return 503 when API is not configured.
- Common issues:
  - Redis unavailable: routes continue with DB fallback; cache writes are non-fatal.
  - Database unavailable: routes return empty arrays or 503 where appropriate.
  - Missing parameters: routes return 400 with validation messages.
  - Unknown routes: 404 handled centrally.
  - Bags API not configured: routes return service unavailable messages.
  - WebSocket connection issues: centralized setup handles gracefully with logging.

**Section sources**
- [server.js:62-69](file://backend/server.js#L62-L69)
- [middleware/errorHandler.js:44-127](file://backend/src/middleware/errorHandler.js#L44-L127)
- [routes/network.js:48-61](file://backend/src/routes/network.js#L48-L61)
- [routes/validators.js:56-60](file://backend/src/routes/validators.js#L56-L60)
- [routes/rpc.js:100-106](file://backend/src/routes/rpc.js#L100-L106)
- [routes/network.js:114-117](file://backend/src/routes/network.js#L114-L117)
- [routes/alerts.js:22-25](file://backend/src/routes/alerts.js#L22-L25)
- [routes/bags.js:45-50](file://backend/src/routes/bags.js#L45-L50)
- [websocket/index.js:16-30](file://backend/src/websocket/index.js#L16-L30)

## Conclusion
The InfraWatch routing system is modular, resilient, and performance-conscious with enhanced real-time capabilities. Each domain router encapsulates its endpoints, enforces parameter validation, and leverages Redis caching with robust database and external service fallbacks. The addition of Bags ecosystem routes expands the platform's functionality to include token launch data and trading insights. Centralized WebSocket initialization provides efficient real-time updates across all routes. The global error handler ensures consistent error responses, while the app-level middleware provides security and performance enhancements. This design supports scalable growth and maintainability across network, RPC, validators, epoch, alerts, and the new Bags ecosystem domains.
# Architecture Overview

<cite>
**Referenced Files in This Document**
- [server.js](file://backend/server.js)
- [index.js](file://backend/src/config/index.js)
- [index.js](file://backend/src/websocket/index.js)
- [index.js](file://backend/src/routes/index.js)
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)
- [db.js](file://backend/src/models/db.js)
- [redis.js](file://backend/src/models/redis.js)
- [index.js](file://backend/src/models/cacheKeys.js)
- [index.js](file://backend/src/models/queries.js)
- [index.js](file://backend/src/models/migrate.js)
- [errorHandler.js](file://backend/src/middleware/errorHandler.js)
- [main.jsx](file://frontend/src/main.jsx)
- [App.jsx](file://frontend/src/App.jsx)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [api.js](file://frontend/src/services/api.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)
- [validatorStore.js](file://frontend/src/stores/validatorStore.js)
- [package.json](file://backend/package.json)
- [package.json](file://frontend/package.json)
</cite>

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
This document describes the full-stack architecture of InfraWatch, a real-time Solana infrastructure monitoring dashboard. The system consists of:
- A Node.js/Express backend that exposes REST APIs, orchestrates background jobs, manages real-time updates via WebSocket, and integrates with external Solana RPC providers and third-party analytics APIs.
- A React/Vite frontend that consumes REST endpoints and subscribes to live updates via WebSocket to render dashboards and interactive components.

The architecture follows a microservices-like pattern at the backend where domain-specific services encapsulate data collection and normalization, while the frontend maintains a reactive state model with real-time synchronization.

## Project Structure
The repository is organized into two primary directories:
- backend: Express server, routing, services, jobs, models, WebSocket, and configuration
- frontend: React application with routing, stores, services, and UI components

```mermaid
graph TB
subgraph "Backend"
S["server.js"]
C["src/config/index.js"]
WS["src/websocket/index.js"]
RT["src/routes/index.js"]
SRV1["src/services/solanaRpc.js"]
SRV2["src/services/helius.js"]
SRV3["src/services/validatorsApp.js"]
JOB1["src/jobs/criticalPoller.js"]
JOB2["src/jobs/routinePoller.js"]
MD1["src/models/db.js"]
MD2["src/models/redis.js"]
MERR["src/middleware/errorHandler.js"]
end
subgraph "Frontend"
FE_MAIN["frontend/src/main.jsx"]
FE_APP["frontend/src/App.jsx"]
FE_WS["frontend/src/hooks/useWebSocket.js"]
FE_API["frontend/src/services/api.js"]
FE_STORE1["frontend/src/stores/networkStore.js"]
FE_STORE2["frontend/src/stores/validatorStore.js"]
end
FE_MAIN --> FE_APP
FE_APP --> FE_WS
FE_WS --> FE_STORE1
FE_APP --> FE_STORE2
FE_WS --> FE_API
S --> C
S --> WS
S --> RT
S --> SRV1
S --> SRV2
S --> SRV3
S --> JOB1
S --> JOB2
S --> MD1
S --> MD2
S --> MERR
```

**Diagram sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [index.js](file://backend/src/config/index.js)
- [index.js](file://backend/src/websocket/index.js)
- [index.js](file://backend/src/routes/index.js)
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)
- [db.js](file://backend/src/models/db.js)
- [redis.js](file://backend/src/models/redis.js)
- [errorHandler.js](file://backend/src/middleware/errorHandler.js)
- [main.jsx](file://frontend/src/main.jsx)
- [App.jsx](file://frontend/src/App.jsx)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [api.js](file://frontend/src/services/api.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)
- [validatorStore.js](file://frontend/src/stores/validatorStore.js)

**Section sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [main.jsx](file://frontend/src/main.jsx)

## Core Components
- Backend entrypoint initializes Express, HTTP server, Socket.io, applies middleware, mounts routes, sets up WebSocket, and starts background pollers. It also initializes database and Redis connections and exports the Socket.io instance for use by other modules.
- Configuration module centralizes environment-driven settings for ports, Solana RPC endpoints, external API keys, database and Redis URLs, polling intervals, and CORS origins.
- Services encapsulate domain logic:
  - Solana RPC service: collects network health, TPS, slot info, epoch info, delinquent validators, and calculates congestion metrics.
  - Helius service: fetches priority fee estimates and enhanced TPS data via Helius RPC.
  - Validators.app service: rate-limits and caches validator data, normalizes fields, detects commission changes, and provides aggregated views.
- Jobs implement periodic data collection and broadcasting:
  - Critical poller runs frequently to push near-real-time metrics.
  - Routine poller runs less often to refresh auxiliary data and maintain caches.
- Models handle persistence and caching:
  - Database initialization and migration utilities.
  - Redis initialization and cache key constants.
  - Queries module for database operations.
- Frontend:
  - React application bootstrapped with Vite.
  - Routing with nested routes for dashboard, validators, RPC health, data center map, MEV tracker, bags ecosystem, and alerts.
  - WebSocket hook connects to the backend and synchronizes state.
  - Zustand stores manage network state, history, epoch info, and validator lists with sorting and selection capabilities.
  - Axios-based API client with interceptors for unified request/response handling.

**Section sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [index.js](file://backend/src/config/index.js)
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [index.js](file://backend/src/websocket/index.js)
- [index.js](file://backend/src/routes/index.js)
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)
- [db.js](file://backend/src/models/db.js)
- [redis.js](file://backend/src/models/redis.js)
- [index.js](file://backend/src/models/queries.js)
- [index.js](file://backend/src/models/migrate.js)
- [main.jsx](file://frontend/src/main.jsx)
- [App.jsx](file://frontend/src/App.jsx)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [api.js](file://frontend/src/services/api.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)
- [validatorStore.js](file://frontend/src/stores/validatorStore.js)

## Architecture Overview
InfraWatch employs a layered backend architecture with clear separation of concerns:
- Presentation Layer: Express routes grouped under a single aggregator route.
- Application Layer: Services encapsulate business logic for Solana RPC, Helius, and Validators.app.
- Infrastructure Layer: Database and Redis initialization and utilities.
- Communication Layer: Socket.io for real-time events and HTTP for REST APIs.

```mermaid
graph TB
subgraph "External Systems"
SOL["Solana RPC"]
HElius["Helius API"]
VApp["Validators.app API"]
end
subgraph "Backend"
EX["Express Server"]
RT["Routes"]
SRV1["Solana RPC Service"]
SRV2["Helius Service"]
SRV3["Validators.app Service"]
WS["Socket.io Server"]
DB["PostgreSQL"]
RDS["Redis"]
CRON["Background Jobs"]
end
subgraph "Frontend"
REACT["React App"]
STORE["Zustand Stores"]
WSCLI["Socket.io Client"]
end
REACT --> WSCLI
WSCLI --> WS
REACT --> |"HTTP"| EX
EX --> RT
RT --> SRV1
RT --> SRV2
RT --> SRV3
SRV1 --> SOL
SRV2 --> HElius
SRV3 --> VApp
SRV1 --> DB
SRV3 --> DB
SRV1 --> RDS
SRV3 --> RDS
CRON --> SRV1
CRON --> SRV2
CRON --> SRV3
WS --> |"broadcast"| REACT
```

**Diagram sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [index.js](file://backend/src/config/index.js)
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [index.js](file://backend/src/websocket/index.js)
- [index.js](file://backend/src/routes/index.js)
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)
- [db.js](file://backend/src/models/db.js)
- [redis.js](file://backend/src/models/redis.js)
- [main.jsx](file://frontend/src/main.jsx)
- [App.jsx](file://frontend/src/App.jsx)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)

## Detailed Component Analysis

### Backend Entry Point and Control Flow
The backend entry point initializes middleware, routes, WebSocket, and background jobs, then starts the HTTP server. It logs environment and health-check details and attempts to initialize database and Redis. Graceful shutdown handlers are registered.

```mermaid
sequenceDiagram
participant Proc as "Process"
participant Server as "HTTP Server"
participant Express as "Express App"
participant Routes as "Routes"
participant WS as "Socket.io"
participant Pollers as "Jobs"
Proc->>Server : "listen(port)"
Server->>Express : "apply middleware"
Express->>Routes : "mount /api/*"
Express->>WS : "setupWebSocket(io)"
Express->>Pollers : "startCriticalPoller(io)"
Express->>Pollers : "startRoutinePoller(io)"
Note over Server,WS : "Ready for requests and broadcasts"
```

**Diagram sources**
- [server.js:1-128](file://backend/server.js#L1-L128)
- [index.js](file://backend/src/websocket/index.js)
- [index.js](file://backend/src/routes/index.js)
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)

**Section sources**
- [server.js:1-128](file://backend/server.js#L1-L128)

### Real-Time Communication via WebSocket
The WebSocket module sets up connection listeners, tracks connected clients, and exposes broadcast utilities. The frontend connects using a dedicated hook and updates the network store upon receiving events.

```mermaid
sequenceDiagram
participant FE as "Frontend Client"
participant WSFE as "useWebSocket()"
participant WSSrv as "WebSocket Server"
participant Store as "networkStore"
FE->>WSFE : "initialize hook"
WSFE->>WSSrv : "connect('/socket.io')"
WSSrv-->>WSFE : "connect event"
WSFE->>Store : "setConnected(true)"
WSSrv-->>WSFE : "network : update payload"
WSFE->>Store : "setCurrent(data)"
WSFE->>WSSrv : "disconnect on unmount"
```

**Diagram sources**
- [index.js](file://backend/src/websocket/index.js)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)

**Section sources**
- [index.js](file://backend/src/websocket/index.js)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)

### Background Job Processing
Two pollers orchestrate periodic data collection:
- Critical poller: runs at a short interval to gather and broadcast critical metrics.
- Routine poller: runs at a longer interval to refresh caches and auxiliary data.

```mermaid
flowchart TD
Start(["Start Pollers"]) --> Init["Initialize IO and Services"]
Init --> Critical["Critical Poller Tick"]
Init --> Routine["Routine Poller Tick"]
Critical --> Collect["Collect Metrics<br/>TPS, Slots, Epoch, Delinquent Validators"]
Collect --> Helius["Fetch Priority Fees (optional)"]
Helius --> Merge["Merge Metrics"]
Merge --> Broadcast["Broadcast network:update"]
Routine --> Refresh["Refresh Caches and Aggregates"]
Refresh --> Done(["Idle Until Next Tick"])
Broadcast --> Done
```

**Diagram sources**
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)

**Section sources**
- [criticalPoller.js](file://backend/src/jobs/criticalPoller.js)
- [routinePoller.js](file://backend/src/jobs/routinePoller.js)

### External API Integrations
- Solana RPC: Used via @solana/web3.js to fetch health, TPS, slot info, epoch info, and delinquent validators.
- Helius: Optional provider for priority fee estimates and enhanced TPS data via JSON-RPC.
- Validators.app: Rate-limited API for validator data with caching and normalization.

```mermaid
graph LR
SRV["solanaRpc.js"] --> WEB3["@solana/web3.js"]
SRV --> DB["PostgreSQL"]
SRV --> RDS["Redis"]
HELIUS["helius.js"] --> AX["axios"]
HELIUS --> CFG["config.solana.helius*"]
VAPP["validatorsApp.js"] --> AX2["axios"]
VAPP --> RL["RateLimiter"]
VAPP --> CACHE["Module Cache"]
VAPP --> CFG2["config.validatorsApp.*"]
```

**Diagram sources**
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [index.js](file://backend/src/config/index.js)
- [db.js](file://backend/src/models/db.js)
- [redis.js](file://backend/src/models/redis.js)

**Section sources**
- [solanaRpc.js](file://backend/src/services/solanaRpc.js)
- [helius.js](file://backend/src/services/helius.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)
- [index.js](file://backend/src/config/index.js)

### Frontend State and Real-Time Updates
The frontend uses a WebSocket hook to subscribe to network updates and Zustand stores to manage state. The API client wraps axios with interceptors for unified error handling.

```mermaid
sequenceDiagram
participant Page as "Page Component"
participant Hook as "useWebSocket()"
participant Store as "networkStore"
participant API as "api.js"
participant Router as "App.jsx"
Router->>Page : "render route"
Page->>Hook : "subscribe to WS"
Hook->>Store : "setCurrent(data)"
Page->>API : "fetch initial data"
API-->>Page : "response"
```

**Diagram sources**
- [App.jsx](file://frontend/src/App.jsx)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)
- [api.js](file://frontend/src/services/api.js)

**Section sources**
- [App.jsx](file://frontend/src/App.jsx)
- [useWebSocket.js](file://frontend/src/hooks/useWebSocket.js)
- [networkStore.js](file://frontend/src/stores/networkStore.js)
- [api.js](file://frontend/src/services/api.js)

## Dependency Analysis
The backend depends on Express, Socket.io, PostgreSQL, Redis, and external APIs. The frontend depends on React, React Router, Socket.io client, Recharts, and Zustand.

```mermaid
graph TB
BE_PKG["backend/package.json"]
FE_PKG["frontend/package.json"]
BE_PKG --> EX["express"]
BE_PKG --> IO["socket.io"]
BE_PKG --> PG["pg"]
BE_PKG --> REDIS["ioredis"]
BE_PKG --> WEB3["@solana/web3.js"]
BE_PKG --> AX["axios"]
BE_PKG --> HC["helmet"]
BE_PKG --> CMP["compression"]
BE_PKG --> CRON["node-cron"]
FE_PKG --> RR["react-router-dom"]
FE_PKG --> ZS["zustand"]
FE_PKG --> SL["socket.io-client"]
FE_PKG --> AXF["axios"]
FE_PKG --> RC["recharts"]
FE_PKG --> RL["react-leaflet"]
FE_PKG --> TWC["tailwindcss"]
```

**Diagram sources**
- [package.json](file://backend/package.json)
- [package.json](file://frontend/package.json)

**Section sources**
- [package.json](file://backend/package.json)
- [package.json](file://frontend/package.json)

## Performance Considerations
- Concurrency and Parallelism:
  - Network snapshot collection aggregates multiple RPC calls concurrently to reduce latency.
  - Background jobs run independently with distinct intervals to balance responsiveness and resource usage.
- Caching and Rate Limiting:
  - Validators.app service implements a sliding-window rate limiter and module-level cache to avoid throttling and stale data.
  - Redis can be used for session state and transient metrics; ensure proper key naming and TTL policies.
- Real-Time Scalability:
  - Socket.io supports horizontal scaling with a compatible adapter; consider clustering and shared state for production deployments.
- Database Efficiency:
  - Use prepared statements and connection pooling; keep migrations minimal and safe.
- Frontend Responsiveness:
  - Debounce or throttle frequent UI updates; leverage efficient chart libraries and virtualization for large datasets.

## Troubleshooting Guide
- Health Checks:
  - Use the health endpoint to confirm backend availability and environment details.
- Error Handling:
  - Global error middleware ensures consistent error responses and logging.
- WebSocket Diagnostics:
  - Monitor connection counts and error events; verify client reconnection behavior.
- External API Issues:
  - Validate API keys and endpoints in configuration; monitor timeouts and rate-limit warnings.
- Database/Redis Availability:
  - Initialization failures are logged as warnings; ensure connectivity and credentials are correct.

**Section sources**
- [server.js:62-69](file://backend/server.js#L62-L69)
- [errorHandler.js](file://backend/src/middleware/errorHandler.js)
- [index.js](file://backend/src/websocket/index.js)
- [index.js](file://backend/src/config/index.js)
- [validatorsApp.js](file://backend/src/services/validatorsApp.js)

## Conclusion
InfraWatch’s architecture cleanly separates presentation, application, and infrastructure concerns. The backend’s modular services, robust WebSocket integration, and background job orchestration enable real-time monitoring of Solana infrastructure. The frontend’s reactive stores and routing provide an intuitive user experience. With careful attention to caching, rate limiting, and scalable deployment patterns, the system can evolve to meet growing demands.
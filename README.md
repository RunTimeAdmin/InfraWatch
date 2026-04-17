<p align="center">
  <img src="InfraWatch.png" width="120" alt="InfraWatch Logo" />
</p>

<h1 align="center">InfraWatch</h1>

<p align="center">
  <strong>Real-time Solana Infrastructure Health Monitor for the Bags Ecosystem</strong>
</p>

<p align="center">
  <a href="https://github.com/RunTimeAdmin/InfraWatch/actions/workflows/ci.yml"><img src="https://github.com/RunTimeAdmin/InfraWatch/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/node-20+-green.svg" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/react-18-61dafb.svg" alt="React 18" />
  <img src="https://img.shields.io/badge/Solana-9945ff.svg" alt="Solana" />
  <img src="https://img.shields.io/badge/Socket.io-black.svg" alt="Socket.io" />
</p>

<p align="center">
  <strong><a href="https://infrastructureintel.io">Live Demo: infrastructureintel.io</a></strong>
</p>

---

## What is InfraWatch?

**170+ hackathon teams built apps on Solana infrastructure. Nobody monitors it.**

When RPC endpoints go down, trading bots fail silently. When validators go delinquent, staking rewards evaporate. When network congestion spikes, transactions timeout without warning.

InfraWatch is the operational health dashboard that fills this gap — real-time monitoring of Solana's infrastructure layer, purpose-built for the Bags ecosystem.

---

## Key Features

| Module | Description |
|--------|-------------|
| 🖥️ **War Room Dashboard** | Network status (GREEN/YELLOW/RED), live TPS, slot latency, confirmation time, delinquent validators, congestion score 0-100, epoch progress |
| 📡 **RPC Health Monitor** | Probes 8 providers every 30s (Helius, QuickNode, Triton, Alchemy, Solana Foundation, GenesysGo, Syndica, Ankr), latency P50/P95/P99, uptime %, failover recommendations |
| ✅ **Validator Health** | Real-time delinquency, skip rate, commission tracking, software version, data center location, Jito status, personal watchlists |
| ⚡ **MEV & Jito Tracker** | % stake on Jito validators, tip floor trends, MEV-protected RPC guidance |
| 🗺️ **Data Center Risk Map** | World map of validator locations, stake concentration by ASN, systemic risk scoring |
| 🔗 **Bags Ecosystem Integration** | Live Bags API integration — pool activity, token launches, lifetime fees correlated with network health |
| 🔔 **Alert System** | Bags DM + dashboard notifications for validator delinquency, commission changes, RPC outages, congestion |

---

## Architecture

```
Data Sources (Solana RPC, Helius, Validators.app, Jito, Custom Prober)
         ↓
Backend (Node.js/Express + node-cron: 30s critical / 5min routine)
         ↓
PostgreSQL + Redis Cache
         ↓
REST API + Socket.io WebSocket
         ↓
React Dashboard (Vite + Tailwind v4)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20, Express.js, Socket.io, node-cron |
| Frontend | React 18, Vite, Tailwind CSS v4, Zustand, Recharts |
| Database | PostgreSQL (pg), Redis (ioredis) |
| Blockchain | @solana/web3.js, Helius API, Validators.app API |
| Real-time | Socket.io (WebSocket + polling fallback) |
| Ecosystem | Bags FM API (pools, launches, fees, trade quotes) |

---

## Quick Start

```bash
# Clone
git clone https://github.com/RunTimeAdmin/InfraWatch.git
cd InfraWatch

# Backend
cd backend
cp .env.example .env
npm install
node server.js

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Ports:** Backend runs on `3001`, Frontend on `5173`. Frontend proxies API calls to backend.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 3001) | No |
| `SOLANA_RPC_URL` | Solana mainnet RPC endpoint | No (uses public) |
| `HELIUS_API_KEY` | Helius API key for enhanced data | No |
| `VALIDATORS_APP_API_KEY` | Validators.app API token | No |
| `DATABASE_URL` | PostgreSQL connection string | No |
| `REDIS_URL` | Redis connection string | No |

> **Note:** App runs in graceful degradation mode — works without DB/Redis using in-memory data from live Solana polling.

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/network/current` | Current network health snapshot |
| `GET /api/rpc/status` | All RPC provider status |
| `GET /api/validators/top` | Top validators by score |
| `GET /api/epoch/current` | Current epoch info |
| `GET /api/alerts/recent` | Recent alerts |
| `GET /api/bags/pools` | Bags ecosystem pools and launches |

**WebSocket Events:** `network:update`, `rpc:update`, `alert:new`

---

## Screenshots

*Dashboard screenshots available at the [live demo](https://infrastructureintel.io). Local development screenshots in `docs/screenshots/`.*

---

## Roadmap

- [x] **v0.1 Foundation** — Backend services, war room dashboard, RPC monitor, Bags API integration
- [ ] **v0.2 Validators** — Scoring cards, commission tracker, data center map
- [ ] **v0.3 MEV** — MEV tracker, Bags ecosystem correlation panel
- [ ] **v0.4 Alerts** — Alert engine, notification system, token-gated premium alerts (planned)

---

## License

MIT



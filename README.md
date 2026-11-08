# stellar-bet-backend

REST API, oracle service, and WebSocket server for the StellarBet prediction market platform on Stellar/Soroban.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Oracle Service](#oracle-service)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

---

## Overview

This service is the off-chain backend for StellarBet. It does three things:

- **REST API** — serves markets, bets, liquidity, live scores, schedule, and virtual sports data to the frontend
- **Oracle Scheduler** — polls [The Odds API](https://the-odds-api.com) on a cron schedule, matches settled events to open on-chain markets, and submits results to the `OddsOracle` Soroban contract
- **WebSocket Server** — pushes live odds updates and market settlement events to subscribed clients every 30 seconds

All Soroban contract calls go through a typed wrapper layer (`src/stellar/contracts.ts`) backed by a single RPC client (`src/stellar/client.ts`). The app factory (`src/app.ts`) is separated from the server entry point so it can be imported cleanly in tests.

---

## Architecture

```
The Odds API
     │
     ▼
SportsDataService          (src/oracle/sportsDataService.ts)
     │  polls every ORACLE_POLL_CRON
     ▼
OracleScheduler            (src/oracle/oracleScheduler.ts)
     │  invokeContractMethod
     ├──▶ OddsOracle.report_result()
     └──▶ BettingPool.settle_market()

Frontend ◀──▶ REST API     (src/routes/*)        HTTP  /api/*
Frontend ◀──▶ WebSocket    (src/ws/wsServer.ts)   WS    /ws
                │  pushes every 30s
                └──▶ SportsDataService.getUpcomingMarkets()
```

Soroban calls are either **simulated** (read-only, no fee) or **invoked** (signed by the oracle keypair, polled until confirmed).

---

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- A Stellar testnet account funded via [Friendbot](https://friendbot.stellar.org) to use as the oracle keypair
- An API key from [The Odds API](https://the-odds-api.com) (free tier available) — the server falls back to mock data without one
- Deployed contract addresses from [stellar-bet-contracts](../stellar-bet-contracts)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Start in development mode (ts-node-dev with live reload)
npm run dev

# 4. Or build and run in production
npm run build
npm start
```

The server starts on `http://localhost:3001` by default. WebSocket endpoint is `ws://localhost:3001/ws`.

---

## Configuration

All config is validated at startup against a [Zod](https://zod.dev) schema. The process exits with a descriptive error if required values are missing or malformed.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP server port |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Horizon REST endpoint |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` | Soroban RPC endpoint |
| `CONTRACT_BETTING_POOL` | — | Deployed BettingPool contract address |
| `CONTRACT_ODDS_ORACLE` | — | Deployed OddsOracle contract address |
| `CONTRACT_HOUSE_ESCROW` | — | Deployed HouseEscrow contract address |
| `CONTRACT_BET_TOKEN` | — | Deployed BetToken contract address |
| `ORACLE_SECRET_KEY` | — | Stellar secret key (`S...`) for the oracle reporter account |
| `ORACLE_POLL_CRON` | `*/5 * * * *` | Cron schedule for polling settled results |
| `THE_ODDS_API_KEY` | — | API key from the-odds-api.com |
| `THE_ODDS_API_BASE_URL` | `https://api.the-odds-api.com/v4` | Odds API base URL |
| `SPORTRADAR_API_KEY` | — | Optional: Sportradar premium data key |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allowed origins |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |

> **Never commit a real `ORACLE_SECRET_KEY`.** Use a secrets manager in production.

---

## API Reference

All endpoints return JSON in the shape `{ success: boolean, data?: any, error?: string }`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status, network, timestamp }` |

### Community Markets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/markets/custom` | List all community-created markets, newest first |
| `GET` | `/api/markets/custom/:id` | Single community market |
| `POST` | `/api/markets/custom` | Create a community market (any wallet address) |
| `POST` | `/api/markets/custom/:id/resolve` | Resolve a market — creator only |

**POST `/api/markets/custom` body:**
```json
{
  "creator": "G...",
  "question": "Will Bitcoin hit $150k before end of 2026?",
  "description": "Optional detail",
  "category": "crypto",
  "outcomes": [
    { "label": "Yes", "oddsBps": 18000 },
    { "label": "No",  "oddsBps": 13000 }
  ],
  "closesAt": "2026-12-31T23:59:59Z",
  "tags": ["bitcoin", "crypto"]
}
```

Community market data is persisted to `data/custom-markets.json` and survives server restarts. Seeds are written once when the file does not exist.

### Markets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/markets` | List all on-chain markets |
| `GET` | `/api/markets/live-odds?sport=soccer_epl` | Live h2h odds from The Odds API (falls back to mock data) |
| `GET` | `/api/markets/:id` | Single market by numeric ID |
| `POST` | `/api/markets` | Create a new market (admin) |

**POST `/api/markets` body:**
```json
{
  "externalEventId": "string",
  "sport": "soccer_epl",
  "outcomeCount": 3,
  "closeLedger": 1234567
}
```

### Bets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/bets/:id` | Get a single bet by numeric ID |
| `GET` | `/api/bets/user/:address` | All bets for a Stellar address (56-char) |
| `GET` | `/api/bets/stats/global` | Total bet count and market count |
| `POST` | `/api/bets/estimate` | Estimate payout without placing a bet |

**POST `/api/bets/estimate` body:**
```json
{
  "stakeXlm": 10,
  "oddsBps": 25000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stakeXlm": 10,
    "decimalOdds": 2.5,
    "potentialPayoutXlm": 25,
    "profitXlm": 15,
    "impliedProbabilityPct": 40
  }
}
```

Odds are expressed in **basis points**: `oddsBps / 10000 = decimal odds`. Minimum 1.01x (10100 bps), maximum 50x (500000 bps).

### Liquidity

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/liquidity/stats` | Pool totals: liquidity (XLM), fees (XLM), fee rate |
| `GET` | `/api/liquidity/position/:address` | LP position for a Stellar address |

### Live Scores

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/live` | All live matches (mock data, score ticks on each request) |
| `GET` | `/api/live/:sport` | Live matches filtered by sport slug |

### Schedule

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/schedule` | Full day of matches grouped by competition |
| `GET` | `/api/schedule/featured` | Featured matches only |
| `GET` | `/api/schedule/match/:id` | Single match with all markets |
| `GET` | `/api/schedule/:competition` | Matches filtered by competition slug or country |

### Virtual Sports

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/virtuals` | All virtual games (kickoffIn countdown ticks on each request) |
| `GET` | `/api/virtuals/:category` | Virtual games filtered by category |
| `GET` | `/api/virtuals/aviator/state` | Current Aviator round state |
| `POST` | `/api/virtuals/aviator/crash` | Record a crash point (internal/oracle use) |

---

## Provably Fair Games API

`/api/games` — commit-reveal RNG for all 8 casino games.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/games/commit` | Get a server seed hash commitment before play |
| `POST` | `/api/games/reveal` | Reveal the server seed and derive result bytes |
| `POST` | `/api/games/verify` | Independently verify any past round |
| `GET`  | `/api/games/how-it-works` | Human-readable explanation of the scheme |

**How it works:**

1. `POST /api/games/commit` — body: `{ gameType: 'dice' | 'mines' | 'plinko' | 'hilo' | 'wheel' | 'keno' | 'limbo' | 'aviator' }` → returns `{ gameId, serverSeedHash }`. The server generates a random 256-bit `serverSeed` and returns `sha256(serverSeed)`. The seed cannot be changed after this point.

2. `POST /api/games/reveal` — body: `{ gameId, clientSeed, nonce? }` → returns `{ serverSeed, serverSeedHash, clientSeed, nonce, resultBytes }`. Result is derived as `HMAC-SHA256(serverSeed, clientSeed:nonce)`.

3. `POST /api/games/verify` — body: `{ serverSeed, clientSeed, nonce, resultBytes }` → returns `{ valid, serverSeedHash, resultBytes }`. Independently recomputes the HMAC and confirms it matches.

Game outcomes are derived from `resultBytes` using 4-byte chunks converted to floats in `[0,1)`. The same algorithm runs client-side in `src/lib/gameUtils.ts` so anyone can verify without trusting the server.

---

## WebSocket Protocol

Connect to `ws://localhost:3001/ws`.

On connection the server sends `{ type: "connected", payload: { clientId } }`.

### Client → Server

```jsonc
// Subscribe to a sport or market
{ "type": "subscribe", "payload": { "sport": "soccer_epl" } }
{ "type": "subscribe", "payload": { "marketId": "42" } }

// Unsubscribe
{ "type": "unsubscribe", "payload": { "sport": "soccer_epl" } }

// Keepalive
{ "type": "ping" }
```

### Server → Client

```jsonc
// Odds pushed every 30s for subscribed sports
{ "type": "odds_update", "payload": { "sport": "soccer_epl", "markets": [...], "ts": 1234567890 } }

// Emitted when a market is settled by the oracle
{ "type": "market_settled", "payload": { "marketId": "42", "winningOutcome": 0 } }

// Keepalive response
{ "type": "pong", "payload": { "ts": 1234567890 } }

// Invalid message received
{ "type": "error", "payload": { "message": "Invalid message format" } }
```

---

## Oracle Service

The oracle scheduler (`src/oracle/oracleScheduler.ts`) runs on the `ORACLE_POLL_CRON` schedule (default: every 5 minutes) and also fires once immediately on startup.

**Cycle steps:**

1. For each tracked sport (`soccer_epl`, `soccer_uefa_champs_league`, `basketball_nba`, `soccer_africa_cup_of_nations`), fetch settled results from The Odds API
2. Look up each result's `externalEventId` in the in-memory `eventToMarketMap`
3. Check the on-chain market is still open; skip if already settled
4. Call `OddsOracle.report_result()` with the winning outcome index
5. Call `BettingPool.settle_market()` optimistically (no-ops if already settled by quorum)
6. Remove the event from the tracking map

**Registering a market for oracle tracking:**

When creating a market via `POST /api/markets`, the `externalEventId → marketId` mapping is registered automatically. In production this map should be persisted to a database (currently in-memory only).

**Outcome index convention:** `0 = home win`, `1 = away win`, `2 = draw`

---

## Project Structure

```
src/
├── app.ts                  # Express app factory (imported by tests)
├── config.ts               # Zod-validated environment config
├── index.ts                # Server entry point, graceful shutdown
├── middleware/
│   └── errorHandler.ts     # 404 handler + global error handler
├── oracle/
│   ├── oracleScheduler.ts  # Cron-driven oracle cycle
│   ├── sportsDataService.ts# The Odds API client + normalization
│   ├── mockData.ts         # Mock upcoming markets (no API key fallback)
│   ├── mockFullDay.ts      # Mock full schedule data
│   ├── mockLiveData.ts     # Mock live scores
│   └── mockVirtualData.ts  # Mock virtual sports + Aviator state
├── routes/
│   ├── bets.ts
│   ├── liquidity.ts
│   ├── live.ts
│   ├── markets.ts
│   ├── schedule.ts
│   └── virtuals.ts
├── stellar/
│   ├── client.ts           # Soroban RPC client, simulateContractCall, invokeContractMethod
│   └── contracts.ts        # Typed wrappers: bettingPool, oddsOracle, houseEscrow
└── ws/
    └── wsServer.ts         # WebSocket server, subscription management, odds broadcast
```

---

## Testing

```bash
# Run all tests (single pass, no watch)
npm run test:run

# Run with Jest watch mode
npm test
```

Tests use [Jest](https://jestjs.io) + [Supertest](https://github.com/ladjs/supertest). The app factory pattern (`createApp()`) means the HTTP server can be imported without binding to a port, keeping tests fast and isolated.

---

---

## Roadmap to Mainnet

StellarBet is currently live on Stellar Testnet. The path to mainnet:

**1. Security audit** — Full audit of all four Soroban contracts before real funds are involved.

**2. Oracle decentralisation** — Expand the reporter set with economic incentives and on-chain dispute resolution.

**3. Provably fair server hardening** — Move the in-memory seed store to a persistent, auditable backend before mainnet.

**4. Regulatory review** — Legal sign-off for each target jurisdiction before enabling real-money play.

Testnet is fully functional for community exploration, developer onboarding, and Stellar Wave program participation.

---

## Security

This is **testnet software**. Do not use with real funds until a full security audit is complete. See [SECURITY.md](./SECURITY.md) for responsible disclosure guidelines.

---

## License

MIT

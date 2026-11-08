# Stellar Wave — Pre-drafted Issues

---

## Issue 1 — Persist event-to-market mapping in a database (Medium, 300pts)

**Title:** `Replace in-memory event→market map with persistent storage`

`oracleScheduler.ts` uses a `Map<string, bigint>` in memory. If the process
restarts, all mappings are lost and pending markets never get settled.

**Requirements:**
- Add SQLite (via `better-sqlite3`) or a JSON file store for the mapping
- Persist `registerEventMarketMapping` writes immediately
- On startup, load the persisted map into memory
- Add tests that verify persistence across simulated restarts

---

## Issue 2 — Add Horizon event streaming for real-time settlement detection (Medium, 350pts)

**Title:** `Subscribe to Horizon event stream to detect oracle quorum events`

Instead of polling on a fixed cron, subscribe to the `QUORUM` contract event
emitted by `OddsOracle` via Horizon's Server-Sent Events stream. When the event
fires, immediately trigger `BettingPool.settle_market`.

**Requirements:**
- Use `@stellar/stellar-sdk` `server.operations().stream()` or events API
- Filter for the `OddsOracle` contract address
- Parse `QUORUM` event payload to extract `market_id` and `winning_outcome`
- Trigger settlement call within 1 ledger of event emission
- Graceful reconnect on stream disconnect

---

## Issue 3 — Add admin authentication middleware (Medium, 250pts)

**Title:** `Protect POST /api/markets with admin auth middleware`

Currently anyone can POST to `/api/markets` to create a market. Add a simple
JWT-based admin auth middleware that gates market creation.

**Requirements:**
- `POST /api/markets` requires `Authorization: Bearer <token>` header
- Token is validated against `ADMIN_JWT_SECRET` env var using `jsonwebtoken`
- Invalid/missing token returns `401` with `{ success: false, error: "Unauthorized" }`
- Add middleware unit test with valid and invalid tokens
- Document the auth flow in README

---

## Issue 4 — Add Sportradar as a secondary odds source with fallback (High, 450pts)

**Title:** `Integrate Sportradar API as fallback when TheOddsAPI is unavailable`

Add a second data source adapter (`SporradarAdapter`) and modify
`SportsDataService` to try TheOddsAPI first, then fall back to Sportradar
if the primary returns an error or empty result.

**Requirements:**
- New `src/oracle/sportradarAdapter.ts` following the same interface as TheOddsAPI adapter
- Fallback logic: if primary throws or returns 0 events, try secondary
- Log which source was used for each fetch
- Add mock tests for both adapters and the fallback logic

---

## Issue 5 — WebSocket reconnect and heartbeat (Low, 150pts)

**Title:** `Add server-side ping/heartbeat to detect stale WebSocket connections`

The WebSocket server has no heartbeat. Dead connections accumulate and waste
memory when clients disconnect without a clean close handshake.

**Requirements:**
- Server pings each client every 30 seconds
- If a client doesn't pong within 10 seconds, terminate the connection
- Remove the client from the `clients` map on termination
- Add a test that verifies stale connections are cleaned up
- Log connection/disconnection counts to monitor pressure

---

## Issue 6 — Security hardening and best practices audit (High, 400pts)

**Title:** `Security hardening: input sanitization, header security, and secret handling review`

Full security pass on the API surface:

**Requirements:**
- Audit all `req.params` and `req.body` usage — ensure no SQL/XDR injection vectors
- Verify `helmet()` config covers `Content-Security-Policy` and `X-Frame-Options`
- Ensure `ORACLE_SECRET_KEY` is never present in any log line or response body
- Add integration tests for common attack patterns (oversized body, invalid address format)
- Document any remaining risks in `SECURITY.md`

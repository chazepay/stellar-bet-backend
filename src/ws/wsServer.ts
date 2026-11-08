/**
 * WebSocket Server
 *
 * Streams real-time odds updates and market settlement events to connected clients.
 * Clients subscribe to specific markets or sports.
 *
 * Message protocol:
 *   Client → Server: { type: "subscribe", payload: { sport?: string, marketId?: string } }
 *   Server → Client: { type: "odds_update" | "market_settled" | "error", payload: {...} }
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { sportsDataService, SportKey } from '../oracle/sportsDataService';

interface Client {
  ws: WebSocket;
  subscribedSports: Set<string>;
  subscribedMarkets: Set<string>;
}

const clients = new Map<string, Client>();

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function send(ws: WebSocket, type: string, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

export function createWsServer(httpServer: import('http').Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    const clientId = generateClientId();
    clients.set(clientId, {
      ws,
      subscribedSports: new Set(),
      subscribedMarkets: new Set(),
    });

    console.log(`[WS] Client connected: ${clientId} (total: ${clients.size})`);
    send(ws, 'connected', { clientId });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type: string;
          payload: {
            sport?: string;
            marketId?: string;
          };
        };

        const client = clients.get(clientId);
        if (!client) return;

        if (msg.type === 'subscribe') {
          if (msg.payload.sport) {
            client.subscribedSports.add(msg.payload.sport);
            send(ws, 'subscribed', { sport: msg.payload.sport });
          }
          if (msg.payload.marketId) {
            client.subscribedMarkets.add(msg.payload.marketId);
            send(ws, 'subscribed', { marketId: msg.payload.marketId });
          }
        }

        if (msg.type === 'unsubscribe') {
          if (msg.payload.sport) client.subscribedSports.delete(msg.payload.sport);
          if (msg.payload.marketId)
            client.subscribedMarkets.delete(msg.payload.marketId);
        }

        if (msg.type === 'ping') {
          send(ws, 'pong', { ts: Date.now() });
        }
      } catch {
        send(ws, 'error', { message: 'Invalid message format' });
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`[WS] Client disconnected: ${clientId} (total: ${clients.size})`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Client error ${clientId}:`, err.message);
    });
  });

  return wss;
}

// ─── Broadcast helpers (called by oracle / market events) ────────────────────

export function broadcastOddsUpdate(
  sport: string,
  payload: unknown
): void {
  for (const client of clients.values()) {
    if (client.subscribedSports.has(sport)) {
      send(client.ws, 'odds_update', payload);
    }
  }
}

export function broadcastMarketSettled(
  marketId: string,
  payload: unknown
): void {
  for (const client of clients.values()) {
    if (client.subscribedMarkets.has(marketId)) {
      send(client.ws, 'market_settled', payload);
    }
  }
}

// ─── Periodic odds push ───────────────────────────────────────────────────────

const ODDS_PUSH_INTERVAL_MS = 30_000; // 30 seconds

export function startOddsBroadcast(): void {
  setInterval(async () => {
    if (clients.size === 0) return;

    // Collect all sports currently subscribed to
    const subscribedSports = new Set<string>();
    for (const client of clients.values()) {
      for (const sport of client.subscribedSports) {
        subscribedSports.add(sport);
      }
    }

    for (const sport of subscribedSports) {
      try {
        const markets = await sportsDataService.getUpcomingMarkets(
          sport as SportKey
        );
        broadcastOddsUpdate(sport, { sport, markets, ts: Date.now() });
      } catch (err) {
        console.warn(`[WS] Failed to push odds for ${sport}:`, err);
      }
    }
  }, ODDS_PUSH_INTERVAL_MS);

  console.log(
    `[WS] Odds broadcast started (every ${ODDS_PUSH_INTERVAL_MS / 1000}s)`
  );
}

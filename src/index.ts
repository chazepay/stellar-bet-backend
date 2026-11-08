/**
 * StellarBet Backend — Entry Point
 */

import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { createWsServer, startOddsBroadcast } from './ws/wsServer';
import { startOracleScheduler } from './oracle/oracleScheduler';

async function main(): Promise<void> {
  const app = createApp();
  const server = http.createServer(app);

  // WebSocket server (shares same HTTP port)
  createWsServer(server);
  startOddsBroadcast();

  // Oracle scheduler (polls for sports results and settles markets)
  if (config.NODE_ENV !== 'test') {
    startOracleScheduler();
  }

  server.listen(config.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║         StellarBet Backend Server                ║
╠══════════════════════════════════════════════════╣
║  HTTP:    http://localhost:${config.PORT}                 ║
║  WS:      ws://localhost:${config.PORT}/ws               ║
║  Network: ${config.STELLAR_NETWORK.padEnd(38)}║
║  Env:     ${config.NODE_ENV.padEnd(38)}║
╚══════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

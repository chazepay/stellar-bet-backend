/**
 * Express application factory.
 * Separated from server entry so it can be imported in tests.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import marketsRouter from './routes/markets';
import customMarketsRouter from './routes/customMarkets';
import betsRouter from './routes/bets';
import liquidityRouter from './routes/liquidity';
import liveRouter from './routes/live';
import virtualsRouter from './routes/virtuals';
import scheduleRouter from './routes/schedule';
import gamesRouter from './routes/games';
import { notFound, errorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy blocked: ${origin}`));
        }
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: false }));

  // ── Logging ───────────────────────────────────────────────────────────────
  if (config.NODE_ENV !== 'test') {
    app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      network: config.STELLAR_NETWORK,
      timestamp: new Date().toISOString(),
    });
  });

  // ── API routes ────────────────────────────────────────────────────────────
  app.use('/api/markets', marketsRouter);
  app.use('/api/markets/custom', customMarketsRouter);
  app.use('/api/bets', betsRouter);
  app.use('/api/liquidity', liquidityRouter);
  app.use('/api/live', liveRouter);
  app.use('/api/virtuals', virtualsRouter);
  app.use('/api/schedule', scheduleRouter);
  app.use('/api/games', gamesRouter);

  // ── 404 / error handlers ──────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

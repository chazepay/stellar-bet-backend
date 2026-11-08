/**
 * Live matches router
 * GET /api/live              — all live matches across all sports
 * GET /api/live/:sport       — live matches filtered by sport
 */

import { Router, Request, Response } from 'express';
import { LIVE_MATCHES } from '../oracle/mockLiveData';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  // Simulate live scores drifting slightly each request
  const matches = LIVE_MATCHES.map((m) => ({
    ...m,
    minute: m.status === 'LIVE'
      ? Math.min(m.minute + Math.floor(Math.random() * 2), 90)
      : m.minute,
  }));
  return res.json({ success: true, data: matches, count: matches.length });
});

router.get('/:sport', (req: Request, res: Response) => {
  const { sport } = req.params;
  const matches = LIVE_MATCHES.filter((m) => m.sport === sport || sport === 'all');
  return res.json({ success: true, data: matches, count: matches.length });
});

export default router;

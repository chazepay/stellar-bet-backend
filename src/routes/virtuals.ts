/**
 * Virtual sports + Aviator router
 * GET /api/virtuals                — all virtual games
 * GET /api/virtuals/:category      — filter by category
 * GET /api/virtuals/aviator/state  — current Aviator round state
 * POST /api/virtuals/aviator/crash — record a crash (internal/oracle use)
 */

import { Router, Request, Response } from 'express';
import { VIRTUAL_GAMES } from '../oracle/mockVirtualData';
import { getAviatorState, recordCrash } from '../oracle/mockVirtualData';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  // Tick down kickoffIn so the client sees a live countdown
  const now = Date.now();
  const games = VIRTUAL_GAMES.map((g) => ({
    ...g,
    kickoffIn: Math.max(0, g.kickoffIn - Math.floor((now % 60000) / 1000)),
  }));
  return res.json({ success: true, data: games });
});

router.get('/aviator/state', (_req: Request, res: Response) => {
  return res.json({ success: true, data: getAviatorState() });
});

router.post('/aviator/crash', (req: Request, res: Response) => {
  const { crashPoint } = req.body as { crashPoint?: number };
  if (!crashPoint || typeof crashPoint !== 'number' || crashPoint < 1) {
    return res.status(400).json({ success: false, error: 'Invalid crashPoint' });
  }
  recordCrash(crashPoint);
  return res.json({ success: true, data: getAviatorState() });
});

router.get('/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const games = VIRTUAL_GAMES.filter((g) => g.category === category);
  return res.json({ success: true, data: games });
});

export default router;

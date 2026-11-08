/**
 * Schedule router — full day of matches with all markets
 * GET /api/schedule              — all matches
 * GET /api/schedule/:competition — filter by competition slug
 * GET /api/schedule/match/:id    — single match with all markets
 */

import { Router, Request, Response } from 'express';
import { FULL_DAY_MATCHES } from '../oracle/mockFullDay';

const router = Router();

// Slugify competition name
function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '_');
}

router.get('/', (_req: Request, res: Response) => {
  // Group by competition
  const grouped: Record<string, typeof FULL_DAY_MATCHES> = {};
  for (const match of FULL_DAY_MATCHES) {
    const key = slug(match.competition);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(match);
  }
  return res.json({ success: true, data: FULL_DAY_MATCHES, grouped, count: FULL_DAY_MATCHES.length });
});

router.get('/featured', (_req: Request, res: Response) => {
  const featured = FULL_DAY_MATCHES.filter(m => m.isFeatured);
  return res.json({ success: true, data: featured });
});

router.get('/match/:id', (req: Request, res: Response) => {
  const match = FULL_DAY_MATCHES.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
  return res.json({ success: true, data: match });
});

router.get('/:competition', (req: Request, res: Response) => {
  const comp = req.params.competition.toLowerCase();
  const matches = FULL_DAY_MATCHES.filter(m => slug(m.competition) === comp || m.country.toLowerCase() === comp);
  return res.json({ success: true, data: matches, count: matches.length });
});

export default router;

/**
 * Markets Router
 * GET /api/markets         — list all markets with live odds
 * GET /api/markets/:id     — single market detail
 * POST /api/markets        — create a new market (admin only)
 */

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { bettingPool, Market } from '../stellar/contracts';
import { sportsDataService } from '../oracle/sportsDataService';
import { registerEventMarketMapping } from '../oracle/oracleScheduler';

const router = Router();

// ─── GET /api/markets ─────────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
  try {
    const marketCount = await bettingPool.getMarketCount();
    const markets: Market[] = [];

    for (let i = 0n; i < marketCount; i++) {
      try {
        const market = await bettingPool.getMarket(i);
        markets.push(market);
      } catch {
        // skip missing markets
      }
    }

    return res.json({
      success: true,
      data: markets,
      count: markets.length,
    });
  } catch (err) {
    console.error('[GET /markets]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch markets' });
  }
});

// ─── GET /api/markets/live-odds ───────────────────────────────────────────────

router.get('/live-odds', async (req: Request, res: Response) => {
  const sport = (req.query.sport as string) ?? 'soccer_epl';

  try {
    const markets = await sportsDataService.getUpcomingMarkets(sport as any);
    return res.json({ success: true, data: markets });
  } catch (err) {
    console.error('[GET /markets/live-odds]', err);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to fetch live odds' });
  }
});

// ─── GET /api/markets/:id ─────────────────────────────────────────────────────

router.get(
  '/:id',
  [param('id').isInt({ min: 0 }).withMessage('Market ID must be a non-negative integer')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const market = await bettingPool.getMarket(BigInt(req.params.id));
      return res.json({ success: true, data: market });
    } catch {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
  }
);

// ─── POST /api/markets ────────────────────────────────────────────────────────
// Admin creates a new market linked to an external sports event

router.post(
  '/',
  [
    body('externalEventId').isString().notEmpty(),
    body('sport').isString().notEmpty(),
    body('outcomeCount').isInt({ min: 2, max: 10 }),
    body('closeLedger').isInt({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { externalEventId, sport, outcomeCount, closeLedger } = req.body as {
      externalEventId: string;
      sport: string;
      outcomeCount: number;
      closeLedger: number;
    };

    try {
      // Fetch the event details from odds API to build description
      const upcomingMarkets = await sportsDataService.getUpcomingMarkets(sport as any);
      const event = upcomingMarkets.find(
        (m) => m.externalEventId === externalEventId
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found in sports data provider',
        });
      }

      // In a full implementation this calls BettingPool.create_market via the admin keypair.
      // Returned marketId is a placeholder here — wire to invokeContractMethod.
      const mockMarketId = BigInt(Date.now() % 1_000_000);

      // Register mapping so oracle can settle it when results come in
      registerEventMarketMapping(externalEventId, mockMarketId);

      return res.status(201).json({
        success: true,
        data: {
          marketId: mockMarketId.toString(),
          externalEventId,
          description: event.description,
          outcomes: event.outcomes,
        },
      });
    } catch (err) {
      console.error('[POST /markets]', err);
      return res.status(500).json({ success: false, error: 'Failed to create market' });
    }
  }
);

export default router;

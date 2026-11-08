/**
 * Bets Router
 * GET /api/bets/:id          — get a single bet by ID
 * GET /api/bets/user/:address — all bets for a Stellar address
 * POST /api/bets/estimate    — estimate payout without placing
 */

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { bettingPool } from '../stellar/contracts';

const router = Router();

// ─── GET /api/bets/:id ────────────────────────────────────────────────────────

router.get(
  '/:id',
  [param('id').isInt({ min: 0 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const bet = await bettingPool.getBet(BigInt(req.params.id));
      return res.json({ success: true, data: bet });
    } catch {
      return res.status(404).json({ success: false, error: 'Bet not found' });
    }
  }
);

// ─── GET /api/bets/user/:address ──────────────────────────────────────────────

router.get(
  '/user/:address',
  [param('address').isString().isLength({ min: 56, max: 56 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const betIds = await bettingPool.getUserBets(req.params.address);

      // Fetch full bet objects
      const bets = await Promise.all(
        betIds.map((id) => bettingPool.getBet(id))
      );

      return res.json({ success: true, data: bets, count: bets.length });
    } catch (err) {
      console.error('[GET /bets/user/:address]', err);
      return res
        .status(500)
        .json({ success: false, error: 'Failed to fetch user bets' });
    }
  }
);

// ─── POST /api/bets/estimate ──────────────────────────────────────────────────

router.post(
  '/estimate',
  [
    body('stakeXlm').isFloat({ min: 1 }).withMessage('Minimum stake is 1 XLM'),
    body('oddsBps')
      .isInt({ min: 10100, max: 500000 })
      .withMessage('Odds must be between 1.01x and 50x'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { stakeXlm, oddsBps } = req.body as {
      stakeXlm: number;
      oddsBps: number;
    };

    const stakeStroops = Math.floor(stakeXlm * 10_000_000);
    const potentialPayoutStroops = Math.floor((stakeStroops * oddsBps) / 10_000);
    const potentialPayoutXlm = potentialPayoutStroops / 10_000_000;
    const profitXlm = potentialPayoutXlm - stakeXlm;
    const decimalOdds = oddsBps / 10_000;

    return res.json({
      success: true,
      data: {
        stakeXlm,
        decimalOdds,
        potentialPayoutXlm,
        profitXlm,
        impliedProbabilityPct: parseFloat(((1 / decimalOdds) * 100).toFixed(2)),
      },
    });
  }
);

// ─── GET /api/bets/stats ──────────────────────────────────────────────────────

router.get('/stats/global', async (_req: Request, res: Response) => {
  try {
    const [betCount, marketCount] = await Promise.all([
      bettingPool.getBetCount(),
      bettingPool.getMarketCount(),
    ]);

    return res.json({
      success: true,
      data: {
        totalBets: betCount.toString(),
        totalMarkets: marketCount.toString(),
      },
    });
  } catch (err) {
    console.error('[GET /bets/stats/global]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

export default router;

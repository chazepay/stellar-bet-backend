/**
 * Liquidity Router
 * GET /api/liquidity/stats         — pool stats (total liquidity, fees)
 * GET /api/liquidity/position/:addr — LP position for an address
 */

import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { houseEscrow } from '../stellar/contracts';

const router = Router();

// ─── GET /api/liquidity/stats ─────────────────────────────────────────────────

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalLiquidity, totalFees, feeBps] = await Promise.all([
      houseEscrow.getTotalLiquidity(),
      houseEscrow.getTotalFees(),
      houseEscrow.getFeeBps(),
    ]);

    const totalLiquidityXlm = Number(totalLiquidity) / 10_000_000;
    const totalFeesXlm = Number(totalFees) / 10_000_000;

    return res.json({
      success: true,
      data: {
        totalLiquidityXlm,
        totalFeesXlm,
        feeBps,
        feePercent: feeBps / 100,
      },
    });
  } catch (err) {
    console.error('[GET /liquidity/stats]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch pool stats' });
  }
});

// ─── GET /api/liquidity/position/:address ─────────────────────────────────────

router.get(
  '/position/:address',
  [param('address').isString().isLength({ min: 56, max: 56 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      // Note: LP positions are currently read from the contract via simulateContractCall.
      // This is a stub — wire to houseEscrow.getPosition() once bindings are generated.
      return res.json({
        success: true,
        data: {
          address: req.params.address,
          depositedXlm: 0,
          shares: '0',
          joinedLedger: 0,
        },
      });
    } catch {
      return res
        .status(404)
        .json({ success: false, error: 'No liquidity position found' });
    }
  }
);

export default router;

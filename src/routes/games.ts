/**
 * Games Router — Provably Fair API
 *
 * POST /api/games/commit          — get a server seed hash commitment before play
 * POST /api/games/reveal          — reveal server seed + result bytes after play
 * POST /api/games/verify          — independently verify any past round
 * GET  /api/games/how-it-works    — human-readable explanation of the scheme
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { commit, reveal, verify, GameType } from '../games/provablyFairService';

const router = Router();

const VALID_GAME_TYPES: GameType[] = [
  'dice', 'mines', 'plinko', 'hilo', 'wheel', 'keno', 'limbo', 'aviator',
];

// ─── POST /api/games/commit ───────────────────────────────────────────────────

router.post(
  '/commit',
  [
    body('gameType')
      .isIn(VALID_GAME_TYPES)
      .withMessage(`gameType must be one of: ${VALID_GAME_TYPES.join(', ')}`),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { gameType } = req.body as { gameType: GameType };
      const result = commit(gameType);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[POST /games/commit]', err);
      return res.status(500).json({ success: false, error: 'Failed to generate commitment' });
    }
  }
);

// ─── POST /api/games/reveal ───────────────────────────────────────────────────

router.post(
  '/reveal',
  [
    body('gameId').isUUID().withMessage('gameId must be a valid UUID'),
    body('clientSeed')
      .isString()
      .isLength({ min: 1, max: 128 })
      .withMessage('clientSeed must be 1–128 characters'),
    body('nonce')
      .optional()
      .isInt({ min: 1, max: 100_000 })
      .withMessage('nonce must be an integer 1–100000'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { gameId, clientSeed, nonce = 1 } = req.body as {
        gameId: string;
        clientSeed: string;
        nonce?: number;
      };
      const result = reveal(gameId, clientSeed, nonce);
      return res.json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reveal';
      const status = message === 'Game not found or expired' ? 404 : 500;
      return res.status(status).json({ success: false, error: message });
    }
  }
);

// ─── POST /api/games/verify ───────────────────────────────────────────────────

router.post(
  '/verify',
  [
    body('serverSeed')
      .isString()
      .isLength({ min: 64, max: 64 })
      .withMessage('serverSeed must be a 64-character hex string'),
    body('clientSeed')
      .isString()
      .isLength({ min: 1, max: 128 })
      .withMessage('clientSeed must be 1–128 characters'),
    body('nonce')
      .isInt({ min: 1, max: 100_000 })
      .withMessage('nonce must be an integer 1–100000'),
    body('resultBytes')
      .isString()
      .isLength({ min: 64, max: 64 })
      .withMessage('resultBytes must be a 64-character hex string'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { serverSeed, clientSeed, nonce, resultBytes } = req.body as {
        serverSeed: string;
        clientSeed: string;
        nonce: number;
        resultBytes: string;
      };
      const result = verify(serverSeed, clientSeed, nonce, resultBytes);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[POST /games/verify]', err);
      return res.status(500).json({ success: false, error: 'Verification failed' });
    }
  }
);

// ─── GET /api/games/how-it-works ─────────────────────────────────────────────

router.get('/how-it-works', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      title: 'Provably Fair — How It Works',
      steps: [
        {
          step: 1,
          action: 'POST /api/games/commit',
          description:
            'Before each round the server generates a random 256-bit serverSeed and returns sha256(serverSeed) as a commitment. The server seed cannot be changed after this point.',
        },
        {
          step: 2,
          action: 'POST /api/games/reveal',
          description:
            'After your bet is locked in, submit your own clientSeed (any string you choose). The server reveals the serverSeed and derives the result using HMAC-SHA256(serverSeed, clientSeed:nonce). The result is deterministic — the same inputs always produce the same output.',
        },
        {
          step: 3,
          action: 'POST /api/games/verify',
          description:
            'Independently verify any past round. Provide the revealed serverSeed, your clientSeed, nonce, and the resultBytes. Compute HMAC-SHA256(serverSeed, clientSeed:nonce) yourself and confirm it matches. Also verify sha256(serverSeed) equals the original commitment.',
        },
      ],
      algorithm: 'HMAC-SHA256',
      commitmentAlgorithm: 'SHA-256',
      note: 'The clientSeed is chosen by you, making it impossible for the server to predict or manipulate the result. The sha256 commitment means the server cannot change the serverSeed after you have seen the commitment.',
    },
  });
});

export default router;

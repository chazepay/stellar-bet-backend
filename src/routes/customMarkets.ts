/**
 * Custom Markets Router
 *
 * Lets any user create a bet on anything — sports, crypto, real-world events,
 * or pure fun. The creator defines the question, outcomes, and suggested odds.
 * Other users can then bet on any outcome via the normal betting pool.
 *
 * POST /api/markets/custom             — create a community market
 * GET  /api/markets/custom             — list all community markets
 * GET  /api/markets/custom/:id         — single community market
 * POST /api/markets/custom/:id/resolve — mark winning outcome (creator only)
 */

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomOutcome {
  index: number;
  label: string;
  oddsBps: number;
}

export interface CustomMarket {
  id: string;
  creator: string;
  question: string;
  description: string;
  category: string;
  outcomes: CustomOutcome[];
  totalPool: number;
  status: 'open' | 'resolved' | 'cancelled';
  winningOutcome: number | null;
  createdAt: string;
  closesAt: string;
  tags: string[];
}

// ─── File-based persistence ───────────────────────────────────────────────────

const DB_PATH = path.resolve(process.cwd(), 'data', 'custom-markets.json');

function ensureDataDir(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadMarkets(): Map<string, CustomMarket> {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) return new Map();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const arr = JSON.parse(raw) as CustomMarket[];
    return new Map(arr.map(m => [m.id, m]));
  } catch {
    console.warn('[CustomMarkets] Failed to parse DB file — starting fresh');
    return new Map();
  }
}

function saveMarkets(markets: Map<string, CustomMarket>): void {
  ensureDataDir();
  const arr = Array.from(markets.values());
  fs.writeFileSync(DB_PATH, JSON.stringify(arr, null, 2), 'utf-8');
}

// Load from disk on startup
const customMarkets: Map<string, CustomMarket> = loadMarkets();

// ─── Seed data (only written if DB is empty) ──────────────────────────────────

const SEEDS: CustomMarket[] = [
  {
    id: 'cm_001',
    creator: 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6',
    question: 'Will Bitcoin hit $150k before end of 2026?',
    description: 'BTC has been on a tear. Will it reach a new ATH of $150,000 by December 31, 2026?',
    category: 'crypto',
    outcomes: [
      { index: 0, label: 'Yes — hits $150k', oddsBps: 18000 },
      { index: 1, label: 'No — stays below', oddsBps: 13000 },
    ],
    totalPool: 2400,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    tags: ['bitcoin', 'crypto', 'price'],
  },
  {
    id: 'cm_002',
    creator: 'GBVNNPOFVV2LABZUDNST3NLTLP33SUOA7JNWHYUO35W7K6T2YUZBKJT',
    question: 'Will Nigeria qualify for the 2026 FIFA World Cup?',
    description: 'Super Eagles AFCON campaign is strong. Will they make it to the World Cup in North America?',
    category: 'sports',
    outcomes: [
      { index: 0, label: 'Yes — qualify',    oddsBps: 15000 },
      { index: 1, label: 'No — knocked out', oddsBps: 22000 },
    ],
    totalPool: 5800,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 60).toISOString(),
    tags: ['nigeria', 'football', 'world cup'],
  },
  {
    id: 'cm_003',
    creator: 'GCKFBEIYTKP6RZNMFPBDMVEBUQ57TWG2KZOFKZMMFWB4KWKS7LMRBSA',
    question: 'Elon Musk tweets about Stellar (XLM) before the end of November?',
    description: 'Elon has tweeted about DOGE and BTC. Will XLM get the spotlight before November ends?',
    category: 'entertainment',
    outcomes: [
      { index: 0, label: 'Yes — he tweets it', oddsBps: 45000 },
      { index: 1, label: 'No — radio silence', oddsBps: 11500 },
    ],
    totalPool: 920,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 22).toISOString(),
    tags: ['elon', 'stellar', 'xlm', 'crypto'],
  },
  {
    id: 'cm_004',
    creator: 'GDQJUTQYK2MQX2ZJARTPITJGKKMKJ3QY5FUT42EQRNYINAIY3WSGRQE',
    question: 'Will the next Stellar Soroban upgrade ship before Q1 2027?',
    description: 'Stellar Foundation has been moving fast. Will Soroban see a major protocol upgrade before March 2027?',
    category: 'crypto',
    outcomes: [
      { index: 0, label: 'Yes — ships on time', oddsBps: 16000 },
      { index: 1, label: 'No — delayed',        oddsBps: 20000 },
      { index: 2, label: 'Ships early!',         oddsBps: 55000 },
    ],
    totalPool: 1350,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 120).toISOString(),
    tags: ['stellar', 'soroban', 'dev'],
  },
];

if (customMarkets.size === 0) {
  for (const m of SEEDS) customMarkets.set(m.id, m);
  saveMarkets(customMarkets);
  console.log('[CustomMarkets] Seeded DB with', SEEDS.length, 'markets');
}

// ─── GET /api/markets/custom ──────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  const markets = Array.from(customMarkets.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ success: true, data: markets, count: markets.length });
});

// ─── GET /api/markets/custom/:id ─────────────────────────────────────────────

router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  (req: Request, res: Response) => {
    const market = customMarkets.get(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
    return res.json({ success: true, data: market });
  }
);

// ─── POST /api/markets/custom ─────────────────────────────────────────────────

router.post(
  '/',
  [
    body('creator').isString().isLength({ min: 56, max: 56 }).withMessage('Valid Stellar address required'),
    body('question').isString().trim().isLength({ min: 10, max: 200 }).withMessage('Question must be 10–200 chars'),
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').isIn(['crypto', 'sports', 'politics', 'entertainment', 'other']),
    body('outcomes').isArray({ min: 2, max: 5 }).withMessage('Need 2–5 outcomes'),
    body('outcomes.*.label').isString().trim().isLength({ min: 1, max: 80 }),
    body('outcomes.*.oddsBps').isInt({ min: 10100, max: 10000000 }).withMessage('Odds must be at least 1.01x'),
    body('closesAt').isISO8601().withMessage('closesAt must be a valid ISO date'),
    body('tags').optional().isArray({ max: 5 }),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { creator, question, description, category, outcomes, closesAt, tags } =
      req.body as {
        creator: string;
        question: string;
        description?: string;
        category: string;
        outcomes: Array<{ label: string; oddsBps: number }>;
        closesAt: string;
        tags?: string[];
      };

    if (new Date(closesAt) <= new Date()) {
      return res.status(400).json({ success: false, error: 'closesAt must be in the future' });
    }

    const id = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const market: CustomMarket = {
      id,
      creator,
      question,
      description: description ?? '',
      category,
      outcomes: outcomes.map((o, i) => ({ index: i, label: o.label, oddsBps: o.oddsBps })),
      totalPool: 0,
      status: 'open',
      winningOutcome: null,
      createdAt: new Date().toISOString(),
      closesAt,
      tags: (tags ?? []).map((t: string) => t.toLowerCase().trim()).slice(0, 5),
    };

    customMarkets.set(id, market);
    saveMarkets(customMarkets);

    console.log(`[CustomMarkets] Created: ${id} — "${question}" by ${creator.slice(0, 8)}...`);

    return res.status(201).json({ success: true, data: market });
  }
);

// ─── POST /api/markets/custom/:id/resolve ─────────────────────────────────────

router.post(
  '/:id/resolve',
  [
    param('id').isString().notEmpty(),
    body('creator').isString().isLength({ min: 56, max: 56 }),
    body('winningOutcome').isInt({ min: 0 }),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const market = customMarkets.get(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    const { creator, winningOutcome } = req.body as { creator: string; winningOutcome: number };

    if (market.creator !== creator) {
      return res.status(403).json({ success: false, error: 'Only the creator can resolve this market' });
    }
    if (market.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Market is already resolved or cancelled' });
    }
    if (winningOutcome >= market.outcomes.length) {
      return res.status(400).json({ success: false, error: 'Invalid winning outcome index' });
    }

    market.status = 'resolved';
    market.winningOutcome = winningOutcome;
    customMarkets.set(market.id, market);
    saveMarkets(customMarkets);

    return res.json({ success: true, data: market });
  }
);

export default router;


const router = Router();

// ─── In-memory store (replace with DB / on-chain in production) ───────────────

export interface CustomOutcome {
  index: number;
  label: string;
  oddsBps: number;   // e.g. 20000 = 2.0x
}

export interface CustomMarket {
  id: string;
  creator: string;           // Stellar address
  question: string;          // "Will ETH hit $5k before Dec 2026?"
  description: string;       // optional detail
  category: string;          // "crypto" | "sports" | "politics" | "entertainment" | "other"
  outcomes: CustomOutcome[];
  totalPool: number;         // XLM staked across all outcomes
  status: 'open' | 'resolved' | 'cancelled';
  winningOutcome: number | null;
  createdAt: string;
  closesAt: string;          // ISO timestamp when betting closes
  tags: string[];
}

const customMarkets: Map<string, CustomMarket> = new Map();

// Seed with interesting examples so the page isn't empty
const SEEDS: CustomMarket[] = [
  {
    id: 'cm_001',
    creator: 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6',
    question: 'Will Bitcoin hit $150k before end of 2026?',
    description: 'BTC has been on a tear. Will it reach a new ATH of $150,000 by December 31, 2026?',
    category: 'crypto',
    outcomes: [
      { index: 0, label: 'Yes — hits $150k', oddsBps: 18000 },
      { index: 1, label: 'No — stays below', oddsBps: 13000 },
    ],
    totalPool: 2400,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    tags: ['bitcoin', 'crypto', 'price'],
  },
  {
    id: 'cm_002',
    creator: 'GBVNNPOFVV2LABZUDNST3NLTLP33SUOA7JNWHYUO35W7K6T2YUZBKJT',
    question: 'Will Nigeria qualify for the 2026 FIFA World Cup?',
    description: 'Super Eagles AFCON campaign is strong. Will they make it to the World Cup in North America?',
    category: 'sports',
    outcomes: [
      { index: 0, label: 'Yes — qualify',     oddsBps: 15000 },
      { index: 1, label: 'No — knocked out',  oddsBps: 22000 },
    ],
    totalPool: 5800,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 60).toISOString(),
    tags: ['nigeria', 'football', 'world cup'],
  },
  {
    id: 'cm_003',
    creator: 'GCKFBEIYTKP6RZNMFPBDMVEBUQ57TWG2KZOFKZMMFWB4KWKS7LMRBSA',
    question: 'Elon Musk tweets about Stellar (XLM) before the end of November?',
    description: 'Elon has tweeted about DOGE and BTC. Will XLM get the spotlight before November ends?',
    category: 'entertainment',
    outcomes: [
      { index: 0, label: 'Yes — he tweets it',  oddsBps: 45000 },
      { index: 1, label: 'No — radio silence',  oddsBps: 11500 },
    ],
    totalPool: 920,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 22).toISOString(),
    tags: ['elon', 'stellar', 'xlm', 'crypto'],
  },
  {
    id: 'cm_004',
    creator: 'GDQJUTQYK2MQX2ZJARTPITJGKKMKJ3QY5FUT42EQRNYINAIY3WSGRQE',
    question: 'Will the next Stellar Soroban upgrade ship before Q1 2027?',
    description: 'Stellar Foundation has been moving fast. Will Soroban see a major protocol upgrade before March 2027?',
    category: 'crypto',
    outcomes: [
      { index: 0, label: 'Yes — ships on time', oddsBps: 16000 },
      { index: 1, label: 'No — delayed',        oddsBps: 20000 },
      { index: 2, label: 'Ships early!',         oddsBps: 55000 },
    ],
    totalPool: 1350,
    status: 'open',
    winningOutcome: null,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    closesAt: new Date(Date.now() + 86400000 * 120).toISOString(),
    tags: ['stellar', 'soroban', 'dev'],
  },
];

for (const m of SEEDS) customMarkets.set(m.id, m);

// ─── GET /api/markets/custom ──────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  const markets = Array.from(customMarkets.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ success: true, data: markets, count: markets.length });
});

// ─── GET /api/markets/custom/:id ─────────────────────────────────────────────

router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  (req: Request, res: Response) => {
    const market = customMarkets.get(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
    return res.json({ success: true, data: market });
  }
);

// ─── POST /api/markets/custom ─────────────────────────────────────────────────

router.post(
  '/',
  [
    body('creator').isString().isLength({ min: 56, max: 56 }).withMessage('Valid Stellar address required'),
    body('question').isString().trim().isLength({ min: 10, max: 200 }).withMessage('Question must be 10–200 chars'),
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').isIn(['crypto', 'sports', 'politics', 'entertainment', 'other']),
    body('outcomes').isArray({ min: 2, max: 5 }).withMessage('Need 2–5 outcomes'),
    body('outcomes.*.label').isString().trim().isLength({ min: 1, max: 80 }),
    body('outcomes.*.oddsBps').isInt({ min: 10100, max: 10000000 }).withMessage('Odds must be at least 1.01x'),
    body('closesAt').isISO8601().withMessage('closesAt must be a valid ISO date'),
    body('tags').optional().isArray({ max: 5 }),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { creator, question, description, category, outcomes, closesAt, tags } =
      req.body as {
        creator: string;
        question: string;
        description?: string;
        category: string;
        outcomes: Array<{ label: string; oddsBps: number }>;
        closesAt: string;
        tags?: string[];
      };

    // Reject if closesAt is in the past
    if (new Date(closesAt) <= new Date()) {
      return res.status(400).json({ success: false, error: 'closesAt must be in the future' });
    }

    const id = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const market: CustomMarket = {
      id,
      creator,
      question,
      description: description ?? '',
      category,
      outcomes: outcomes.map((o, i) => ({ index: i, label: o.label, oddsBps: o.oddsBps })),
      totalPool: 0,
      status: 'open',
      winningOutcome: null,
      createdAt: new Date().toISOString(),
      closesAt,
      tags: (tags ?? []).map((t: string) => t.toLowerCase().trim()).slice(0, 5),
    };

    customMarkets.set(id, market);

    console.log(`[CustomMarkets] Created: ${id} — "${question}" by ${creator.slice(0, 8)}...`);

    return res.status(201).json({ success: true, data: market });
  }
);

// ─── POST /api/markets/custom/:id/resolve ─────────────────────────────────────
// Creator resolves their market by picking the winning outcome

router.post(
  '/:id/resolve',
  [
    param('id').isString().notEmpty(),
    body('creator').isString().isLength({ min: 56, max: 56 }),
    body('winningOutcome').isInt({ min: 0 }),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const market = customMarkets.get(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    const { creator, winningOutcome } = req.body as { creator: string; winningOutcome: number };

    if (market.creator !== creator) {
      return res.status(403).json({ success: false, error: 'Only the creator can resolve this market' });
    }

    if (market.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Market is already resolved or cancelled' });
    }

    if (winningOutcome >= market.outcomes.length) {
      return res.status(400).json({ success: false, error: 'Invalid winning outcome index' });
    }

    market.status = 'resolved';
    market.winningOutcome = winningOutcome;
    customMarkets.set(market.id, market);

    return res.json({ success: true, data: market });
  }
);

export default router;

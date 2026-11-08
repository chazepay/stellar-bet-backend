/**
 * Bet estimate endpoint unit tests (no Stellar node required)
 */

import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('POST /api/bets/estimate', () => {
  it('returns correct payout estimate', async () => {
    const res = await request(app)
      .post('/api/bets/estimate')
      .send({ stakeXlm: 10, oddsBps: 20000 }) // 10 XLM at 2.0x
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.stakeXlm).toBe(10);
    expect(res.body.data.decimalOdds).toBe(2);
    expect(res.body.data.potentialPayoutXlm).toBe(20);
    expect(res.body.data.profitXlm).toBe(10);
    expect(res.body.data.impliedProbabilityPct).toBe(50);
  });

  it('rejects stake below 1 XLM', async () => {
    const res = await request(app)
      .post('/api/bets/estimate')
      .send({ stakeXlm: 0.5, oddsBps: 20000 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('rejects odds below 1.01x', async () => {
    const res = await request(app)
      .post('/api/bets/estimate')
      .send({ stakeXlm: 10, oddsBps: 5000 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('rejects odds above 50x', async () => {
    const res = await request(app)
      .post('/api/bets/estimate')
      .send({ stakeXlm: 10, oddsBps: 600000 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.network).toBe('testnet');
  });
});

describe('GET /api/bets/:id validation', () => {
  it('rejects negative bet id', async () => {
    const res = await request(app).get('/api/bets/-1').expect(400);
    expect(res.body.success).toBe(false);
  });
});

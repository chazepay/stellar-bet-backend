/**
 * Mock LIVE match data — in-play games with current scores, minute, and live odds.
 * Simulates the kind of data you'd get from a premium live odds provider.
 */

export interface LiveMatch {
  id: string;
  sport: string;
  sportIcon: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;       // current match minute
  period: string;       // "1st Half", "2nd Half", "Q3", etc.
  status: 'LIVE' | 'HT' | 'FT';
  startedAt: string;    // ISO
  outcomes: Array<{
    name: string;
    oddsBps: number;
    avgDecimalOdds: number;
  }>;
  stats?: {
    homePossession?: number;
    awayPossession?: number;
    homeShots?: number;
    awayShots?: number;
    homeCorners?: number;
    awayCorners?: number;
    homeYellowCards?: number;
    awayYellowCards?: number;
  };
}

function minsAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

export const LIVE_MATCHES: LiveMatch[] = [
  // ── Soccer ──────────────────────────────────────────────────────────────
  {
    id: 'live_001',
    sport: 'soccer_epl',
    sportIcon: '⚽',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 1,
    awayScore: 0,
    minute: 34,
    period: '1st Half',
    status: 'LIVE',
    startedAt: minsAgo(34),
    outcomes: [
      { name: 'Arsenal',  avgDecimalOdds: 1.75, oddsBps: 17500 },
      { name: 'Chelsea',  avgDecimalOdds: 4.20, oddsBps: 42000 },
      { name: 'Draw',     avgDecimalOdds: 3.60, oddsBps: 36000 },
    ],
    stats: {
      homePossession: 58, awayPossession: 42,
      homeShots: 7,  awayShots: 3,
      homeCorners: 4, awayCorners: 2,
      homeYellowCards: 1, awayYellowCards: 2,
    },
  },
  {
    id: 'live_002',
    sport: 'soccer_epl',
    sportIcon: '⚽',
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester City',
    homeScore: 2,
    awayScore: 2,
    minute: 67,
    period: '2nd Half',
    status: 'LIVE',
    startedAt: minsAgo(67),
    outcomes: [
      { name: 'Liverpool',      avgDecimalOdds: 2.90, oddsBps: 29000 },
      { name: 'Manchester City', avgDecimalOdds: 2.70, oddsBps: 27000 },
      { name: 'Draw',           avgDecimalOdds: 2.80, oddsBps: 28000 },
    ],
    stats: {
      homePossession: 45, awayPossession: 55,
      homeShots: 12, awayShots: 14,
      homeCorners: 6,  awayCorners: 7,
      homeYellowCards: 2, awayYellowCards: 1,
    },
  },
  {
    id: 'live_003',
    sport: 'soccer_epl',
    sportIcon: '⚽',
    homeTeam: 'Tottenham',
    awayTeam: 'Newcastle',
    homeScore: 0,
    awayScore: 1,
    minute: 45,
    period: 'HT',
    status: 'HT',
    startedAt: minsAgo(50),
    outcomes: [
      { name: 'Tottenham', avgDecimalOdds: 2.10, oddsBps: 21000 },
      { name: 'Newcastle', avgDecimalOdds: 3.20, oddsBps: 32000 },
      { name: 'Draw',      avgDecimalOdds: 3.00, oddsBps: 30000 },
    ],
    stats: {
      homePossession: 52, awayPossession: 48,
      homeShots: 5, awayShots: 8,
      homeCorners: 3, awayCorners: 5,
    },
  },
  {
    id: 'live_004',
    sport: 'soccer_africa_cup_of_nations',
    sportIcon: '⚽',
    homeTeam: 'Nigeria',
    awayTeam: 'Ghana',
    homeScore: 1,
    awayScore: 1,
    minute: 78,
    period: '2nd Half',
    status: 'LIVE',
    startedAt: minsAgo(78),
    outcomes: [
      { name: 'Nigeria', avgDecimalOdds: 2.60, oddsBps: 26000 },
      { name: 'Ghana',   avgDecimalOdds: 2.80, oddsBps: 28000 },
      { name: 'Draw',    avgDecimalOdds: 2.90, oddsBps: 29000 },
    ],
    stats: {
      homePossession: 49, awayPossession: 51,
      homeShots: 9, awayShots: 10,
      homeCorners: 5, awayCorners: 4,
    },
  },
  // ── Basketball ──────────────────────────────────────────────────────────
  {
    id: 'live_005',
    sport: 'basketball_nba',
    sportIcon: '🏀',
    homeTeam: 'LA Lakers',
    awayTeam: 'Boston Celtics',
    homeScore: 67,
    awayScore: 72,
    minute: 28,
    period: 'Q3',
    status: 'LIVE',
    startedAt: minsAgo(28),
    outcomes: [
      { name: 'LA Lakers',      avgDecimalOdds: 2.40, oddsBps: 24000 },
      { name: 'Boston Celtics', avgDecimalOdds: 1.58, oddsBps: 15800 },
    ],
  },
  {
    id: 'live_006',
    sport: 'basketball_nba',
    sportIcon: '🏀',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Miami Heat',
    homeScore: 88,
    awayScore: 85,
    minute: 38,
    period: 'Q4',
    status: 'LIVE',
    startedAt: minsAgo(38),
    outcomes: [
      { name: 'Golden State Warriors', avgDecimalOdds: 1.70, oddsBps: 17000 },
      { name: 'Miami Heat',            avgDecimalOdds: 2.15, oddsBps: 21500 },
    ],
  },
  // ── Tennis ──────────────────────────────────────────────────────────────
  {
    id: 'live_007',
    sport: 'tennis',
    sportIcon: '🎾',
    homeTeam: 'C. Alcaraz',
    awayTeam: 'N. Djokovic',
    homeScore: 1,
    awayScore: 1,
    minute: 0,
    period: 'Set 3',
    status: 'LIVE',
    startedAt: minsAgo(90),
    outcomes: [
      { name: 'C. Alcaraz',  avgDecimalOdds: 1.85, oddsBps: 18500 },
      { name: 'N. Djokovic', avgDecimalOdds: 2.00, oddsBps: 20000 },
    ],
  },
  // ── MMA ─────────────────────────────────────────────────────────────────
  {
    id: 'live_008',
    sport: 'mma_mixed_martial_arts',
    sportIcon: '🥊',
    homeTeam: 'I. Makhachev',
    awayTeam: 'D. Poirier',
    homeScore: 1,
    awayScore: 0,
    minute: 0,
    period: 'Round 2',
    status: 'LIVE',
    startedAt: minsAgo(10),
    outcomes: [
      { name: 'I. Makhachev', avgDecimalOdds: 1.30, oddsBps: 13000 },
      { name: 'D. Poirier',   avgDecimalOdds: 3.50, oddsBps: 35000 },
    ],
  },
];

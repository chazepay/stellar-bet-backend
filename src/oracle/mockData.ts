/**
 * Mock sports data — used when THE_ODDS_API_KEY is not set.
 * Mirrors the exact shape returned by SportsDataService so the rest of
 * the app works identically with real or mock data.
 */

import { NormalizedMarket, SportKey } from './sportsDataService';

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

const MOCK_MARKETS: Record<string, NormalizedMarket[]> = {
  soccer_epl: [
    {
      externalEventId: 'mock_epl_001',
      sportKey: 'soccer_epl' as SportKey,
      description: 'Arsenal vs Manchester United',
      commenceTime: hoursFromNow(2),
      outcomes: [
        { name: 'Arsenal',          avgDecimalOdds: 2.10, oddsBps: 21000 },
        { name: 'Manchester United', avgDecimalOdds: 3.40, oddsBps: 34000 },
        { name: 'Draw',             avgDecimalOdds: 3.20, oddsBps: 32000 },
      ],
    },
    {
      externalEventId: 'mock_epl_002',
      sportKey: 'soccer_epl' as SportKey,
      description: 'Chelsea vs Liverpool',
      commenceTime: hoursFromNow(4),
      outcomes: [
        { name: 'Chelsea',  avgDecimalOdds: 2.80, oddsBps: 28000 },
        { name: 'Liverpool', avgDecimalOdds: 2.50, oddsBps: 25000 },
        { name: 'Draw',     avgDecimalOdds: 3.10, oddsBps: 31000 },
      ],
    },
    {
      externalEventId: 'mock_epl_003',
      sportKey: 'soccer_epl' as SportKey,
      description: 'Manchester City vs Tottenham',
      commenceTime: hoursFromNow(6),
      outcomes: [
        { name: 'Manchester City', avgDecimalOdds: 1.65, oddsBps: 16500 },
        { name: 'Tottenham',       avgDecimalOdds: 5.50, oddsBps: 55000 },
        { name: 'Draw',            avgDecimalOdds: 3.80, oddsBps: 38000 },
      ],
    },
    {
      externalEventId: 'mock_epl_004',
      sportKey: 'soccer_epl' as SportKey,
      description: 'Newcastle vs Aston Villa',
      commenceTime: hoursFromNow(24),
      outcomes: [
        { name: 'Newcastle',   avgDecimalOdds: 2.20, oddsBps: 22000 },
        { name: 'Aston Villa', avgDecimalOdds: 3.20, oddsBps: 32000 },
        { name: 'Draw',        avgDecimalOdds: 3.00, oddsBps: 30000 },
      ],
    },
    {
      externalEventId: 'mock_epl_005',
      sportKey: 'soccer_epl' as SportKey,
      description: 'Brighton vs West Ham',
      commenceTime: hoursFromNow(28),
      outcomes: [
        { name: 'Brighton',  avgDecimalOdds: 2.00, oddsBps: 20000 },
        { name: 'West Ham',  avgDecimalOdds: 3.75, oddsBps: 37500 },
        { name: 'Draw',      avgDecimalOdds: 3.20, oddsBps: 32000 },
      ],
    },
    {
      externalEventId: 'mock_epl_006',
      sportKey: 'soccer_epl' as SportKey,
      description: 'Everton vs Wolves',
      commenceTime: hoursFromNow(48),
      outcomes: [
        { name: 'Everton', avgDecimalOdds: 2.40, oddsBps: 24000 },
        { name: 'Wolves',  avgDecimalOdds: 3.00, oddsBps: 30000 },
        { name: 'Draw',    avgDecimalOdds: 3.10, oddsBps: 31000 },
      ],
    },
  ],

  soccer_uefa_champs_league: [
    {
      externalEventId: 'mock_ucl_001',
      sportKey: 'soccer_uefa_champs_league' as SportKey,
      description: 'Real Madrid vs Bayern Munich',
      commenceTime: hoursFromNow(3),
      outcomes: [
        { name: 'Real Madrid',  avgDecimalOdds: 2.00, oddsBps: 20000 },
        { name: 'Bayern Munich', avgDecimalOdds: 3.50, oddsBps: 35000 },
        { name: 'Draw',         avgDecimalOdds: 3.40, oddsBps: 34000 },
      ],
    },
    {
      externalEventId: 'mock_ucl_002',
      sportKey: 'soccer_uefa_champs_league' as SportKey,
      description: 'Paris Saint-Germain vs Inter Milan',
      commenceTime: hoursFromNow(5),
      outcomes: [
        { name: 'PSG',        avgDecimalOdds: 1.90, oddsBps: 19000 },
        { name: 'Inter Milan', avgDecimalOdds: 4.00, oddsBps: 40000 },
        { name: 'Draw',       avgDecimalOdds: 3.50, oddsBps: 35000 },
      ],
    },
    {
      externalEventId: 'mock_ucl_003',
      sportKey: 'soccer_uefa_champs_league' as SportKey,
      description: 'Barcelona vs Atletico Madrid',
      commenceTime: hoursFromNow(27),
      outcomes: [
        { name: 'Barcelona',      avgDecimalOdds: 2.10, oddsBps: 21000 },
        { name: 'Atletico Madrid', avgDecimalOdds: 3.60, oddsBps: 36000 },
        { name: 'Draw',           avgDecimalOdds: 3.20, oddsBps: 32000 },
      ],
    },
    {
      externalEventId: 'mock_ucl_004',
      sportKey: 'soccer_uefa_champs_league' as SportKey,
      description: 'Borussia Dortmund vs AC Milan',
      commenceTime: hoursFromNow(51),
      outcomes: [
        { name: 'Borussia Dortmund', avgDecimalOdds: 2.30, oddsBps: 23000 },
        { name: 'AC Milan',          avgDecimalOdds: 3.10, oddsBps: 31000 },
        { name: 'Draw',              avgDecimalOdds: 3.20, oddsBps: 32000 },
      ],
    },
  ],

  soccer_africa_cup_of_nations: [
    {
      externalEventId: 'mock_afcon_001',
      sportKey: 'soccer_africa_cup_of_nations' as SportKey,
      description: 'Nigeria vs Senegal',
      commenceTime: hoursFromNow(1),
      outcomes: [
        { name: 'Nigeria', avgDecimalOdds: 2.50, oddsBps: 25000 },
        { name: 'Senegal', avgDecimalOdds: 2.80, oddsBps: 28000 },
        { name: 'Draw',    avgDecimalOdds: 2.90, oddsBps: 29000 },
      ],
    },
    {
      externalEventId: 'mock_afcon_002',
      sportKey: 'soccer_africa_cup_of_nations' as SportKey,
      description: 'Morocco vs Egypt',
      commenceTime: hoursFromNow(4),
      outcomes: [
        { name: 'Morocco', avgDecimalOdds: 2.20, oddsBps: 22000 },
        { name: 'Egypt',   avgDecimalOdds: 3.10, oddsBps: 31000 },
        { name: 'Draw',    avgDecimalOdds: 3.00, oddsBps: 30000 },
      ],
    },
    {
      externalEventId: 'mock_afcon_003',
      sportKey: 'soccer_africa_cup_of_nations' as SportKey,
      description: 'Ghana vs Ivory Coast',
      commenceTime: hoursFromNow(7),
      outcomes: [
        { name: 'Ghana',        avgDecimalOdds: 2.70, oddsBps: 27000 },
        { name: 'Ivory Coast',  avgDecimalOdds: 2.60, oddsBps: 26000 },
        { name: 'Draw',         avgDecimalOdds: 2.95, oddsBps: 29500 },
      ],
    },
    {
      externalEventId: 'mock_afcon_004',
      sportKey: 'soccer_africa_cup_of_nations' as SportKey,
      description: 'Cameroon vs South Africa',
      commenceTime: hoursFromNow(10),
      outcomes: [
        { name: 'Cameroon',     avgDecimalOdds: 2.10, oddsBps: 21000 },
        { name: 'South Africa', avgDecimalOdds: 3.40, oddsBps: 34000 },
        { name: 'Draw',         avgDecimalOdds: 3.10, oddsBps: 31000 },
      ],
    },
    {
      externalEventId: 'mock_afcon_005',
      sportKey: 'soccer_africa_cup_of_nations' as SportKey,
      description: 'Algeria vs Tunisia',
      commenceTime: hoursFromNow(14),
      outcomes: [
        { name: 'Algeria', avgDecimalOdds: 2.30, oddsBps: 23000 },
        { name: 'Tunisia', avgDecimalOdds: 3.20, oddsBps: 32000 },
        { name: 'Draw',    avgDecimalOdds: 2.90, oddsBps: 29000 },
      ],
    },
  ],

  basketball_nba: [
    {
      externalEventId: 'mock_nba_001',
      sportKey: 'basketball_nba' as SportKey,
      description: 'Los Angeles Lakers vs Golden State Warriors',
      commenceTime: hoursFromNow(3),
      outcomes: [
        { name: 'Los Angeles Lakers',    avgDecimalOdds: 2.10, oddsBps: 21000 },
        { name: 'Golden State Warriors', avgDecimalOdds: 1.75, oddsBps: 17500 },
      ],
    },
    {
      externalEventId: 'mock_nba_002',
      sportKey: 'basketball_nba' as SportKey,
      description: 'Boston Celtics vs Miami Heat',
      commenceTime: hoursFromNow(5),
      outcomes: [
        { name: 'Boston Celtics', avgDecimalOdds: 1.60, oddsBps: 16000 },
        { name: 'Miami Heat',     avgDecimalOdds: 2.35, oddsBps: 23500 },
      ],
    },
    {
      externalEventId: 'mock_nba_003',
      sportKey: 'basketball_nba' as SportKey,
      description: 'Denver Nuggets vs Phoenix Suns',
      commenceTime: hoursFromNow(7),
      outcomes: [
        { name: 'Denver Nuggets', avgDecimalOdds: 1.85, oddsBps: 18500 },
        { name: 'Phoenix Suns',   avgDecimalOdds: 2.00, oddsBps: 20000 },
      ],
    },
    {
      externalEventId: 'mock_nba_004',
      sportKey: 'basketball_nba' as SportKey,
      description: 'Milwaukee Bucks vs Philadelphia 76ers',
      commenceTime: hoursFromNow(26),
      outcomes: [
        { name: 'Milwaukee Bucks',     avgDecimalOdds: 1.70, oddsBps: 17000 },
        { name: 'Philadelphia 76ers',  avgDecimalOdds: 2.15, oddsBps: 21500 },
      ],
    },
    {
      externalEventId: 'mock_nba_005',
      sportKey: 'basketball_nba' as SportKey,
      description: 'Dallas Mavericks vs Oklahoma City Thunder',
      commenceTime: hoursFromNow(30),
      outcomes: [
        { name: 'Dallas Mavericks',      avgDecimalOdds: 2.20, oddsBps: 22000 },
        { name: 'Oklahoma City Thunder', avgDecimalOdds: 1.70, oddsBps: 17000 },
      ],
    },
  ],

  americanfootball_nfl: [
    {
      externalEventId: 'mock_nfl_001',
      sportKey: 'americanfootball_nfl' as SportKey,
      description: 'Kansas City Chiefs vs San Francisco 49ers',
      commenceTime: hoursFromNow(8),
      outcomes: [
        { name: 'Kansas City Chiefs',    avgDecimalOdds: 1.80, oddsBps: 18000 },
        { name: 'San Francisco 49ers',   avgDecimalOdds: 2.05, oddsBps: 20500 },
      ],
    },
    {
      externalEventId: 'mock_nfl_002',
      sportKey: 'americanfootball_nfl' as SportKey,
      description: 'Dallas Cowboys vs Philadelphia Eagles',
      commenceTime: hoursFromNow(11),
      outcomes: [
        { name: 'Dallas Cowboys',      avgDecimalOdds: 2.30, oddsBps: 23000 },
        { name: 'Philadelphia Eagles', avgDecimalOdds: 1.65, oddsBps: 16500 },
      ],
    },
    {
      externalEventId: 'mock_nfl_003',
      sportKey: 'americanfootball_nfl' as SportKey,
      description: 'Buffalo Bills vs Miami Dolphins',
      commenceTime: hoursFromNow(32),
      outcomes: [
        { name: 'Buffalo Bills',  avgDecimalOdds: 1.55, oddsBps: 15500 },
        { name: 'Miami Dolphins', avgDecimalOdds: 2.50, oddsBps: 25000 },
      ],
    },
  ],

  mma_mixed_martial_arts: [
    {
      externalEventId: 'mock_mma_001',
      sportKey: 'mma_mixed_martial_arts' as SportKey,
      description: 'Jon Jones vs Stipe Miocic — UFC Heavyweight',
      commenceTime: hoursFromNow(12),
      outcomes: [
        { name: 'Jon Jones',     avgDecimalOdds: 1.45, oddsBps: 14500 },
        { name: 'Stipe Miocic', avgDecimalOdds: 2.80, oddsBps: 28000 },
      ],
    },
    {
      externalEventId: 'mock_mma_002',
      sportKey: 'mma_mixed_martial_arts' as SportKey,
      description: 'Islam Makhachev vs Dustin Poirier — UFC Lightweight',
      commenceTime: hoursFromNow(15),
      outcomes: [
        { name: 'Islam Makhachev', avgDecimalOdds: 1.35, oddsBps: 13500 },
        { name: 'Dustin Poirier',  avgDecimalOdds: 3.20, oddsBps: 32000 },
      ],
    },
    {
      externalEventId: 'mock_mma_003',
      sportKey: 'mma_mixed_martial_arts' as SportKey,
      description: 'Alex Pereira vs Jamahal Hill — UFC Light Heavyweight',
      commenceTime: hoursFromNow(36),
      outcomes: [
        { name: 'Alex Pereira',  avgDecimalOdds: 1.55, oddsBps: 15500 },
        { name: 'Jamahal Hill',  avgDecimalOdds: 2.55, oddsBps: 25500 },
      ],
    },
  ],
};

/**
 * Returns mock markets for a given sport key.
 * Falls back to EPL if sport not found.
 */
export function getMockMarkets(sportKey: string): NormalizedMarket[] {
  return (
    MOCK_MARKETS[sportKey] ??
    MOCK_MARKETS['soccer_epl'] ??
    []
  );
}

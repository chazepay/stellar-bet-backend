/**
 * Sports Data Service
 *
 * Fetches live odds and settled results from The Odds API.
 * Normalizes data into a common format consumed by the oracle scheduler.
 * https://the-odds-api.com
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { getMockMarkets } from './mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SportKey =
  | 'soccer_epl'
  | 'soccer_uefa_champs_league'
  | 'basketball_nba'
  | 'americanfootball_nfl'
  | 'mma_mixed_martial_arts'
  | 'soccer_africa_cup_of_nations';

export interface OddsOutcome {
  name: string;
  price: number; // decimal odds, e.g. 2.5
}

export interface OddsMarket {
  key: string; // e.g. "h2h"
  outcomes: OddsOutcome[];
}

export interface SportEvent {
  id: string;
  sport_key: SportKey;
  sport_title: string;
  commence_time: string; // ISO8601
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: OddsMarket[];
  }>;
}

export interface NormalizedMarket {
  externalEventId: string;
  sportKey: SportKey;
  description: string; // "Arsenal vs Man Utd"
  commenceTime: Date;
  outcomes: Array<{
    name: string;
    // Average decimal odds across bookmakers
    avgDecimalOdds: number;
    // In basis points for the contract: floor(avgDecimalOdds * 10000)
    oddsBps: number;
  }>;
}

export interface SettledResult {
  externalEventId: string;
  sportKey: SportKey;
  winnerName: string;
  winnerIndex: number; // 0 = home, 1 = away, 2 = draw
  settledAt: Date;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class SportsDataService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: config.THE_ODDS_API_BASE_URL,
      params: { apiKey: config.THE_ODDS_API_KEY },
      timeout: 10_000,
    });
  }

  /**
   * Fetch upcoming events with h2h odds for a given sport.
   * Falls back to mock data when THE_ODDS_API_KEY is not configured.
   */
  async getUpcomingMarkets(
    sportKey: SportKey,
    regions: string = 'us,uk,au'
  ): Promise<NormalizedMarket[]> {
    // Use mock data when no API key is set
    if (!config.THE_ODDS_API_KEY) {
      console.log(`[SportsData] No API key set — returning mock data for ${sportKey}`);
      return getMockMarkets(sportKey);
    }

    const response = await this.http.get<SportEvent[]>(`/sports/${sportKey}/odds`, {
      params: {
        regions,
        markets: 'h2h',
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      },
    });

    const events = response.data;
    return events.map((event) => this.normalizeEvent(event));
  }

  /**
   * Fetch scores/results for recently completed events.
   * Returns empty array when no API key is configured.
   */
  async getSettledResults(
    sportKey: SportKey,
    daysFrom: number = 1
  ): Promise<SettledResult[]> {
    if (!config.THE_ODDS_API_KEY) {
      return []; // nothing to settle in mock mode
    }
    const response = await this.http.get<
      Array<{
        id: string;
        sport_key: SportKey;
        commence_time: string;
        completed: boolean;
        home_team: string;
        away_team: string;
        scores: Array<{ name: string; score: string }> | null;
      }>
    >(`/sports/${sportKey}/scores`, {
      params: { daysFrom },
    });

    const results: SettledResult[] = [];

    for (const event of response.data) {
      if (!event.completed || !event.scores) continue;

      const homeScore = parseInt(
        event.scores.find((s) => s.name === event.home_team)?.score ?? '0',
        10
      );
      const awayScore = parseInt(
        event.scores.find((s) => s.name === event.away_team)?.score ?? '0',
        10
      );

      let winnerIndex: number;
      let winnerName: string;

      if (homeScore > awayScore) {
        winnerIndex = 0;
        winnerName = event.home_team;
      } else if (awayScore > homeScore) {
        winnerIndex = 1;
        winnerName = event.away_team;
      } else {
        // Draw — outcome index 2
        winnerIndex = 2;
        winnerName = 'Draw';
      }

      results.push({
        externalEventId: event.id,
        sportKey: event.sport_key,
        winnerName,
        winnerIndex,
        settledAt: new Date(),
      });
    }

    return results;
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private normalizeEvent(event: SportEvent): NormalizedMarket {
    const outcomes: NormalizedMarket['outcomes'] = [];

    // Aggregate odds across bookmakers for each outcome
    const oddsByOutcome = new Map<string, number[]>();

    for (const bookmaker of event.bookmakers) {
      const h2h = bookmaker.markets.find((m) => m.key === 'h2h');
      if (!h2h) continue;
      for (const outcome of h2h.outcomes) {
        const existing = oddsByOutcome.get(outcome.name) ?? [];
        existing.push(outcome.price);
        oddsByOutcome.set(outcome.name, existing);
      }
    }

    // Build outcomes in consistent order: home, away, (draw if present)
    const orderedNames = [event.home_team, event.away_team, 'Draw'];
    for (const name of orderedNames) {
      const prices = oddsByOutcome.get(name);
      if (!prices || prices.length === 0) continue;

      const avgDecimalOdds =
        prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const oddsBps = Math.floor(avgDecimalOdds * 10_000);

      outcomes.push({ name, avgDecimalOdds, oddsBps });
    }

    return {
      externalEventId: event.id,
      sportKey: event.sport_key,
      description: `${event.home_team} vs ${event.away_team}`,
      commenceTime: new Date(event.commence_time),
      outcomes,
    };
  }
}

export const sportsDataService = new SportsDataService();

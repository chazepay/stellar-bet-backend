/**
 * SportsDataService unit tests — mocked HTTP responses
 */

import axios from 'axios';
import { SportsDataService } from '../oracle/sportsDataService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SportsDataService', () => {
  let service: SportsDataService;

  const mockAxiosInstance = {
    get: jest.fn(),
  };

  beforeEach(() => {
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    service = new SportsDataService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUpcomingMarkets', () => {
    it('normalizes home/away/draw odds correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: [
          {
            id: 'evt_001',
            sport_key: 'soccer_epl',
            sport_title: 'EPL',
            commence_time: '2026-08-10T15:00:00Z',
            home_team: 'Arsenal',
            away_team: 'Man Utd',
            bookmakers: [
              {
                key: 'bet365',
                title: 'Bet365',
                markets: [
                  {
                    key: 'h2h',
                    outcomes: [
                      { name: 'Arsenal', price: 2.1 },
                      { name: 'Man Utd', price: 3.5 },
                      { name: 'Draw', price: 3.2 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const markets = await service.getUpcomingMarkets('soccer_epl');
      expect(markets).toHaveLength(1);

      const market = markets[0];
      expect(market.externalEventId).toBe('evt_001');
      expect(market.description).toBe('Arsenal vs Man Utd');
      expect(market.outcomes).toHaveLength(3);

      const arsenalOutcome = market.outcomes.find((o) => o.name === 'Arsenal');
      expect(arsenalOutcome?.avgDecimalOdds).toBe(2.1);
      expect(arsenalOutcome?.oddsBps).toBe(21000); // floor(2.1 * 10000)
    });
  });

  describe('getSettledResults', () => {
    it('identifies home win correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: [
          {
            id: 'evt_002',
            sport_key: 'soccer_epl',
            commence_time: '2026-08-05T15:00:00Z',
            completed: true,
            home_team: 'Liverpool',
            away_team: 'Chelsea',
            scores: [
              { name: 'Liverpool', score: '3' },
              { name: 'Chelsea', score: '1' },
            ],
          },
        ],
      });

      const results = await service.getSettledResults('soccer_epl');
      expect(results).toHaveLength(1);
      expect(results[0].winnerIndex).toBe(0); // home win
      expect(results[0].winnerName).toBe('Liverpool');
    });

    it('identifies draw correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: [
          {
            id: 'evt_003',
            sport_key: 'soccer_epl',
            commence_time: '2026-08-05T15:00:00Z',
            completed: true,
            home_team: 'Spurs',
            away_team: 'Everton',
            scores: [
              { name: 'Spurs', score: '1' },
              { name: 'Everton', score: '1' },
            ],
          },
        ],
      });

      const results = await service.getSettledResults('soccer_epl');
      expect(results[0].winnerIndex).toBe(2); // draw
      expect(results[0].winnerName).toBe('Draw');
    });

    it('skips incomplete events', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: [
          {
            id: 'evt_004',
            sport_key: 'soccer_epl',
            commence_time: '2026-08-12T15:00:00Z',
            completed: false,
            home_team: 'Newcastle',
            away_team: 'Wolves',
            scores: null,
          },
        ],
      });

      const results = await service.getSettledResults('soccer_epl');
      expect(results).toHaveLength(0);
    });
  });
});

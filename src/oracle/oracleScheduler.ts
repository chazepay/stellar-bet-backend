/**
 * Oracle Scheduler
 *
 * Runs on a cron schedule to:
 * 1. Fetch settled sports results from the data provider
 * 2. Match settled events to open on-chain markets
 * 3. Submit oracle reports to the OddsOracle contract
 * 4. Call settle_market on BettingPool once oracle quorum is reached
 *
 * This service runs entirely server-side and never requires user interaction.
 */

import cron from 'node-cron';
import { config } from '../config';
import { sportsDataService, SportKey, SettledResult } from './sportsDataService';
import { oddsOracle, bettingPool, Market } from '../stellar/contracts';

// In-memory map of externalEventId → on-chain marketId
// In production this should be persisted to a database
const eventToMarketMap = new Map<string, bigint>();

export function registerEventMarketMapping(
  externalEventId: string,
  marketId: bigint
): void {
  eventToMarketMap.set(externalEventId, marketId);
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

const TRACKED_SPORTS: SportKey[] = [
  'soccer_epl',
  'soccer_uefa_champs_league',
  'basketball_nba',
  'soccer_africa_cup_of_nations',
];

let isRunning = false;

async function runOracleCycle(): Promise<void> {
  if (isRunning) {
    console.log('[Oracle] Previous cycle still running, skipping');
    return;
  }
  isRunning = true;

  try {
    console.log(`[Oracle] Cycle started at ${new Date().toISOString()}`);

    for (const sport of TRACKED_SPORTS) {
      await processSport(sport);
    }

    console.log('[Oracle] Cycle complete');
  } catch (err) {
    console.error('[Oracle] Cycle error:', err);
  } finally {
    isRunning = false;
  }
}

async function processSport(sport: SportKey): Promise<void> {
  let results: SettledResult[];

  try {
    results = await sportsDataService.getSettledResults(sport, 1);
  } catch (err) {
    console.warn(`[Oracle] Failed to fetch results for ${sport}:`, err);
    return;
  }

  for (const result of results) {
    const marketId = eventToMarketMap.get(result.externalEventId);
    if (marketId === undefined) {
      // Event not tracked on-chain
      continue;
    }

    await submitOracleReport(marketId, result);
  }
}

async function submitOracleReport(
  marketId: bigint,
  result: SettledResult
): Promise<void> {
  try {
    // Check market is still open before reporting
    const market: Market = await bettingPool.getMarket(marketId);
    if (!market.is_open || market.winning_outcome >= 0) {
      console.log(`[Oracle] Market ${marketId} already settled, skipping`);
      eventToMarketMap.delete(result.externalEventId);
      return;
    }

    console.log(
      `[Oracle] Reporting result for market ${marketId}: ` +
        `outcome=${result.winnerIndex} (${result.winnerName})`
    );

    const { txHash } = await oddsOracle.reportResult(
      marketId,
      result.winnerIndex,
      'THEODDS',
      result.externalEventId
    );

    console.log(`[Oracle] Report submitted. tx=${txHash}`);

    // After reporting, check if quorum was reached and settle the pool
    // The OddsOracle contract emits a QUORUM event when threshold is met.
    // Here we optimistically call settle_market (it will no-op if already settled).
    await bettingPool.settleMarket(marketId, result.winnerIndex);
    console.log(`[Oracle] Market ${marketId} settlement submitted`);

    // Remove from tracking map
    eventToMarketMap.delete(result.externalEventId);
  } catch (err) {
    console.error(`[Oracle] Failed to submit report for market ${marketId}:`, err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function startOracleScheduler(): void {
  const schedule = config.ORACLE_POLL_CRON;

  if (!cron.validate(schedule)) {
    throw new Error(`Invalid cron schedule: ${schedule}`);
  }

  cron.schedule(schedule, runOracleCycle);
  console.log(`[Oracle] Scheduler started with cron: ${schedule}`);

  // Run immediately on startup (don't wait for first interval)
  runOracleCycle().catch(console.error);
}

// Export for manual triggering (e.g. admin endpoint)
export { runOracleCycle };

/**
 * Typed wrappers around all StellarBet Soroban contract methods.
 * These mirror the Rust contract interfaces in stellar-bet-contracts.
 */

import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { CONTRACT_IDS } from '../config';
import { invokeContractMethod, simulateContractCall } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BetStatus = 'Open' | 'Won' | 'Lost' | 'Cancelled' | 'PendingSettlement';

export interface Bet {
  id: bigint;
  bettor: string;
  market_id: bigint;
  outcome_index: number;
  stake_xlm: bigint;
  odds_bps: number;
  potential_payout: bigint;
  status: BetStatus;
  created_ledger: number;
  settled_ledger: number;
}

export interface Market {
  id: bigint;
  description: string;
  sport: string;
  outcome_count: number;
  total_pool: bigint;
  winning_outcome: number; // -1 = unsettled
  is_open: boolean;
  start_ledger: number;
  close_ledger: number;
}

export interface LiquidityPosition {
  provider: string;
  deposited: bigint;
  shares: bigint;
  joined_ledger: number;
}

// ─── BettingPool ──────────────────────────────────────────────────────────────

export const bettingPool = {
  async getBet(betId: bigint): Promise<Bet> {
    const result = await simulateContractCall(
      CONTRACT_IDS.bettingPool,
      'get_bet',
      [nativeToScVal(betId, { type: 'u64' })]
    );
    return result as Bet;
  },

  async getMarket(marketId: bigint): Promise<Market> {
    const result = await simulateContractCall(
      CONTRACT_IDS.bettingPool,
      'get_market',
      [nativeToScVal(marketId, { type: 'u64' })]
    );
    return result as Market;
  },

  async getBetCount(): Promise<bigint> {
    const result = await simulateContractCall(
      CONTRACT_IDS.bettingPool,
      'get_bet_count',
      []
    );
    return result as bigint;
  },

  async getMarketCount(): Promise<bigint> {
    const result = await simulateContractCall(
      CONTRACT_IDS.bettingPool,
      'get_market_count',
      []
    );
    return result as bigint;
  },

  async getUserBets(userAddress: string): Promise<bigint[]> {
    const result = await simulateContractCall(
      CONTRACT_IDS.bettingPool,
      'get_user_bets',
      [new Address(userAddress).toScVal()]
    );
    return result as bigint[];
  },

  async settleMarket(
    marketId: bigint,
    winningOutcome: number
  ): Promise<{ txHash: string }> {
    const { txHash } = await invokeContractMethod(
      CONTRACT_IDS.bettingPool,
      'settle_market',
      [
        nativeToScVal(marketId, { type: 'u64' }),
        nativeToScVal(winningOutcome, { type: 'u32' }),
      ]
    );
    return { txHash };
  },
};

// ─── OddsOracle ───────────────────────────────────────────────────────────────

export const oddsOracle = {
  async reportResult(
    marketId: bigint,
    outcome: number,
    dataSource: string,
    externalEventId: string
  ): Promise<{ txHash: string }> {
    const { txHash } = await invokeContractMethod(
      CONTRACT_IDS.oddsOracle,
      'report_result',
      [
        // reporter is the oracle keypair — auth handled by invokeContractMethod
        new Address(
          (await import('./client')).getOracleKeypair().publicKey()
        ).toScVal(),
        nativeToScVal(marketId, { type: 'u64' }),
        nativeToScVal(outcome, { type: 'u32' }),
        nativeToScVal(dataSource, { type: 'symbol' }),
        nativeToScVal(Buffer.from(externalEventId), { type: 'bytes' }),
      ]
    );
    return { txHash };
  },

  async isReporter(address: string): Promise<boolean> {
    const result = await simulateContractCall(
      CONTRACT_IDS.oddsOracle,
      'is_reporter',
      [new Address(address).toScVal()]
    );
    return result as boolean;
  },
};

// ─── HouseEscrow ──────────────────────────────────────────────────────────────

export const houseEscrow = {
  async getTotalLiquidity(): Promise<bigint> {
    const result = await simulateContractCall(
      CONTRACT_IDS.houseEscrow,
      'get_total_liquidity',
      []
    );
    return result as bigint;
  },

  async getTotalFees(): Promise<bigint> {
    const result = await simulateContractCall(
      CONTRACT_IDS.houseEscrow,
      'get_total_fees',
      []
    );
    return result as bigint;
  },

  async getFeeBps(): Promise<number> {
    const result = await simulateContractCall(
      CONTRACT_IDS.houseEscrow,
      'get_fee_bps',
      []
    );
    return result as number;
  },
};

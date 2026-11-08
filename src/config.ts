import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Stellar
  STELLAR_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  STELLAR_HORIZON_URL: z
    .string()
    .url()
    .default('https://horizon-testnet.stellar.org'),
  STELLAR_RPC_URL: z
    .string()
    .url()
    .default('https://soroban-testnet.stellar.org'),

  // Contracts
  CONTRACT_BETTING_POOL: z.string().default(''),
  CONTRACT_ODDS_ORACLE: z.string().default(''),
  CONTRACT_HOUSE_ESCROW: z.string().default(''),
  CONTRACT_BET_TOKEN: z.string().default(''),

  // Oracle
  ORACLE_SECRET_KEY: z.string().default(''),
  ORACLE_POLL_CRON: z.string().default('*/5 * * * *'),

  // Sports APIs
  THE_ODDS_API_KEY: z.string().default(''),
  THE_ODDS_API_BASE_URL: z
    .string()
    .url()
    .default('https://api.the-odds-api.com/v4'),
  SPORTRADAR_API_KEY: z.string().default(''),
  SPORTRADAR_BASE_URL: z.string().default(''),

  // CORS / Rate limiting
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
  throw new Error('Invalid environment configuration');
}

export const config = parsed.data;

export const CONTRACT_IDS = {
  bettingPool: config.CONTRACT_BETTING_POOL,
  oddsOracle: config.CONTRACT_ODDS_ORACLE,
  houseEscrow: config.CONTRACT_HOUSE_ESCROW,
  betToken: config.CONTRACT_BET_TOKEN,
} as const;

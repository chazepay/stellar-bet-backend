/**
 * Provably Fair Service
 *
 * Implements a standard commit-reveal scheme:
 *
 *   1. Client calls POST /api/games/commit
 *      → Server generates a random serverSeed, stores it, returns sha256(serverSeed)
 *
 *   2. Client submits its own clientSeed + the gameId
 *      → Server calls POST /api/games/reveal
 *      → Server derives result from HMAC-SHA256(serverSeed, clientSeed + ":" + nonce)
 *      → Returns the serverSeed (now revealed), clientSeed, result bytes
 *
 *   3. Anyone can call POST /api/games/verify
 *      → Pass serverSeed + clientSeed + nonce to independently confirm the result
 *
 * The serverSeed is stored in memory keyed by gameId (UUID). In production this
 * would be a database with TTL, but for a testnet demo in-memory is fine.
 */

import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GameType = 'dice' | 'mines' | 'plinko' | 'hilo' | 'wheel' | 'keno' | 'limbo' | 'aviator';

export interface CommitResponse {
  gameId: string;
  serverSeedHash: string; // sha256(serverSeed) — revealed after the round
}

export interface RevealResponse {
  gameId: string;
  serverSeed: string;     // now revealed
  serverSeedHash: string; // sha256(serverSeed) — client can verify it matches the commit
  clientSeed: string;
  nonce: number;
  resultBytes: string;    // hex — raw HMAC output used to derive game result
}

export interface VerifyResponse {
  valid: boolean;
  serverSeedHash: string;
  resultBytes: string;
}

// ─── In-memory store ──────────────────────────────────────────────────────────

interface PendingGame {
  serverSeed: string;
  serverSeedHash: string;
  gameType: GameType;
  createdAt: number;
}

const pendingGames = new Map<string, PendingGame>();

// Expire games after 30 minutes to prevent unbounded growth
const GAME_TTL_MS = 30 * 60 * 1000;

function purgeExpired() {
  const now = Date.now();
  for (const [id, game] of pendingGames) {
    if (now - game.createdAt > GAME_TTL_MS) pendingGames.delete(id);
  }
}

// ─── Core cryptographic helpers ───────────────────────────────────────────────

/** SHA-256 hash of input, returned as hex string */
function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Derive result bytes from serverSeed + clientSeed + nonce using HMAC-SHA256.
 * This is the same algorithm used by Stake, BC.Game, and most provably fair casinos.
 */
export function deriveResultBytes(serverSeed: string, clientSeed: string, nonce: number): Buffer {
  const message = `${clientSeed}:${nonce}`;
  return crypto.createHmac('sha256', serverSeed).update(message).digest();
}

/**
 * Convert result bytes into a float in [0, 1) using the first 4 bytes.
 * Multiple floats can be derived by using byte offsets (offset=0,4,8,...).
 */
export function bytesToFloat(bytes: Buffer, offset = 0): number {
  const n = bytes.readUInt32BE(offset % (bytes.length - 3));
  return n / 0x100000000; // divide by 2^32
}

/**
 * Derive up to 8 independent floats from a single HMAC output.
 * Used for multi-reveal games (Mines, Keno, Plinko, HiLo deck).
 */
export function deriveFloats(serverSeed: string, clientSeed: string, nonce: number, count: number): number[] {
  // For more than 8 floats we chain: round 0 uses nonce, round 1 uses nonce+1, etc.
  const floats: number[] = [];
  let currentNonce = nonce;
  while (floats.length < count) {
    const bytes = deriveResultBytes(serverSeed, clientSeed, currentNonce);
    for (let offset = 0; offset <= 28 && floats.length < count; offset += 4) {
      floats.push(bytesToFloat(bytes, offset));
    }
    currentNonce++;
  }
  return floats;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Step 1: Generate a server seed, store it, return the hash commitment.
 */
export function commit(gameType: GameType): CommitResponse {
  purgeExpired();
  const gameId = crypto.randomUUID();
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = sha256(serverSeed);

  pendingGames.set(gameId, {
    serverSeed,
    serverSeedHash,
    gameType,
    createdAt: Date.now(),
  });

  return { gameId, serverSeedHash };
}

/**
 * Step 2: Reveal the server seed for a completed game.
 * The client provides their own clientSeed and a nonce (default 1).
 * Returns the revealed seed + raw result bytes for client verification.
 */
export function reveal(gameId: string, clientSeed: string, nonce = 1): RevealResponse {
  const game = pendingGames.get(gameId);
  if (!game) throw new Error('Game not found or expired');

  pendingGames.delete(gameId);

  const resultBytes = deriveResultBytes(game.serverSeed, clientSeed, nonce);

  return {
    gameId,
    serverSeed: game.serverSeed,
    serverSeedHash: game.serverSeedHash,
    clientSeed,
    nonce,
    resultBytes: resultBytes.toString('hex'),
  };
}

/**
 * Step 3: Verify — anyone can check that serverSeed + clientSeed + nonce
 * produces the claimed resultBytes, and that sha256(serverSeed) matches the
 * published commitment.
 */
export function verify(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  expectedResultBytes: string,
): VerifyResponse {
  const computedHash = sha256(serverSeed);
  const computedBytes = deriveResultBytes(serverSeed, clientSeed, nonce);
  const computedHex = computedBytes.toString('hex');
  const valid = computedHex === expectedResultBytes;

  return {
    valid,
    serverSeedHash: computedHash,
    resultBytes: computedHex,
  };
}

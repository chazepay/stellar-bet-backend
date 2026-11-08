/**
 * Stellar / Soroban RPC client singleton.
 * Wraps @stellar/stellar-sdk for contract invocations and Horizon queries.
 */

import {
  Contract,
  Keypair,
  Networks,
  rpc as StellarRpc,
  SorobanDataBuilder,
  Transaction,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';

import { config } from '../config';

// ── Network passphrase ────────────────────────────────────────────────────────

export const NETWORK_PASSPHRASE =
  config.STELLAR_NETWORK === 'mainnet'
    ? Networks.PUBLIC
    : Networks.TESTNET;

// ── RPC Server ────────────────────────────────────────────────────────────────

export const rpcServer = new StellarRpc.Server(config.STELLAR_RPC_URL, {
  allowHttp: config.NODE_ENV !== 'production',
});

// ── Oracle keypair (server-side signer) ───────────────────────────────────────

let _oracleKeypair: Keypair | null = null;

export function getOracleKeypair(): Keypair {
  if (!_oracleKeypair) {
    if (!config.ORACLE_SECRET_KEY) {
      throw new Error('ORACLE_SECRET_KEY is not set');
    }
    _oracleKeypair = Keypair.fromSecret(config.ORACLE_SECRET_KEY);
  }
  return _oracleKeypair;
}

// ── Contract call helpers ─────────────────────────────────────────────────────

/**
 * Simulate a Soroban contract read (no transaction needed).
 */
export async function simulateContractCall(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<unknown> {
  const contract = new Contract(contractId);
  const keypair = getOracleKeypair();
  const account = await rpcServer.getAccount(keypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await rpcServer.simulateTransaction(tx);
  if (StellarRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  const result = (simResult as StellarRpc.Api.SimulateTransactionSuccessResponse)
    .result;
  if (!result) return null;
  return scValToNative(result.retval);
}

/**
 * Invoke a Soroban contract method and submit the transaction.
 * Returns the transaction hash.
 */
export async function invokeContractMethod(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
  keypair: Keypair = getOracleKeypair()
): Promise<{ txHash: string; result: unknown }> {
  const contract = new Contract(contractId);
  const account = await rpcServer.getAccount(keypair.publicKey());

  // Build transaction
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate to get footprint
  const simResult = await rpcServer.simulateTransaction(tx);
  if (StellarRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  // Assemble and sign
  const preparedTx = StellarRpc.assembleTransaction(
    tx,
    simResult as StellarRpc.Api.SimulateTransactionSuccessResponse
  ).build();

  preparedTx.sign(keypair);

  // Submit
  const sendResult = await rpcServer.sendTransaction(preparedTx);
  if (sendResult.status === 'ERROR') {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult)}`);
  }

  // Poll for confirmation
  const txHash = sendResult.hash;
  let getResult = await rpcServer.getTransaction(txHash);
  let attempts = 0;
  const MAX_ATTEMPTS = 20;

  while (
    getResult.status === StellarRpc.Api.GetTransactionStatus.NOT_FOUND &&
    attempts < MAX_ATTEMPTS
  ) {
    await new Promise((res) => setTimeout(res, 1500));
    getResult = await rpcServer.getTransaction(txHash);
    attempts++;
  }

  if (getResult.status === StellarRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed on-chain: ${txHash}`);
  }

  let returnValue: unknown = null;
  if (
    getResult.status === StellarRpc.Api.GetTransactionStatus.SUCCESS &&
    getResult.returnValue
  ) {
    returnValue = scValToNative(getResult.returnValue);
  }

  return { txHash, result: returnValue };
}

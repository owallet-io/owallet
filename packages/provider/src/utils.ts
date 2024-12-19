import {
  Connection,
  Finality,
  GetVersionedTransactionConfig,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { decode, encode } from "bs58";
export const SOL_DEV = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
export const SOL_MAIN = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
export const CHAIN_ID_SOL = SOL_MAIN;
export const RPC_SOL_DEV = "https://api.devnet.solana.com";
export const RPC_SOL_MAIN = "https://swr.xnftdata.com/rpc-proxy/";
export const RPC_SOL = RPC_SOL_MAIN;
export const deserializeTransaction = (
  serializedTx: string
): VersionedTransaction => {
  return VersionedTransaction.deserialize(decode(serializedTx));
};

export const deserializeLegacyTransaction = (serializedTx: string) => {
  return Transaction.from(decode(serializedTx));
};
export const DEFAULT_PRIORITY_FEE = 50000;
export const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000;

export async function confirmTransaction(
  c: Connection,
  txSig: string,
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
): Promise<ReturnType<(typeof c)["getParsedTransaction"]>> {
  return new Promise(async (resolve, reject) => {
    setTimeout(
      () =>
        reject(new Error(`30 second timeout: unable to confirm transaction`)),
      30000
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const config = {
      // Support confirming Versioned Transactions
      maxSupportedTransactionVersion: 0,
      ...(typeof commitmentOrConfig === "string"
        ? {
            commitment: commitmentOrConfig,
          }
        : commitmentOrConfig),
    };

    let tx = await c.getParsedTransaction(txSig, config);
    while (tx === null) {
      tx = await c.getParsedTransaction(txSig, config);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    resolve(tx);
  });
}

export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction
): tx is VersionedTransaction => {
  return "version" in tx;
};

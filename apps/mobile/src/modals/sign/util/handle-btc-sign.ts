import {
  SignBtcInteractionData,
  SignBtcInteractionStore,
} from "@owallet/stores-core";
import Transport from "@ledgerhq/hw-transport";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { OWalletError } from "@owallet/router";
import * as bitcoin from "bitcoinjs-lib";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from "./ledger-types";
import Btc from "@ledgerhq/hw-app-btc";
import { PubKeySecp256k1 } from "@owallet/crypto";

import { serialize, TransactionTypes } from "@ethersproject/transactions";
import { LedgerUtils } from "@utils/ledger";
import { Transaction } from "@ledgerhq/hw-app-btc/lib/types";
import { buidTx } from "@owallet/common";

export const handleBtcPreSignByLedger = async (
  interactionData: NonNullable<SignBtcInteractionStore["waitingData"]>,
  signingMessage: Uint8Array,
  getTransport: () => Promise<Transport>,
  keyDerivation: "84" | "44",
  utxos: any,
  inputs: any,
  outputs: any
): Promise<string | undefined> => {
  const appData = interactionData.data.keyInsensitive;
  if (!appData) {
    throw new Error("Invalid ledger app data");
  }
  if (typeof appData !== "object") {
    throw new Error("Invalid ledger app data");
  }
  if (!appData["bip44Path"] || typeof appData["bip44Path"] !== "object") {
    throw new Error("Invalid ledger app data");
  }

  const bip44Path = appData["bip44Path"] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  const publicKey = Buffer.from(
    (appData[`Bitcoin${keyDerivation}`] as any)["pubKey"],
    "hex"
  );
  if (publicKey.length === 0) {
    throw new Error("Invalid ledger app data");
  }

  return connectAndSignBtcWithLedger(
    getTransport,
    publicKey,
    bip44Path,
    signingMessage,
    utxos,
    keyDerivation,
    inputs,
    outputs
  );
};

export const connectAndSignBtcWithLedger = async (
  getTransport: () => Promise<Transport>,
  expectedPubKey: Buffer,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  message: Uint8Array,
  utxos: any,
  keyDerivation: "84" | "44",
  inputs,
  outputs
): Promise<string> => {
  let transport: Transport;

  try {
    transport = await getTransport();
  } catch (e) {
    throw new OWalletError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }
  let btcApp = new Btc(transport);

  try {
    await btcApp.getWalletPublicKey(`${keyDerivation}'/0'/'0/0/0`);
  } catch (e) {
    // Device is locked
    if (e?.message.includes("(0x6b0c)")) {
      throw new OWalletError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
    } else if (
      // User is in home sceen or other app.
      e?.message.includes("(0x6511)") ||
      e?.message.includes("(0x6e00)")
    ) {
      // Do nothing
    } else {
      await transport.close();

      throw e;
    }
  }

  transport = await LedgerUtils.tryAppOpen(transport, "Bitcoin");
  btcApp = new Btc(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await btcApp.getWalletPublicKey(
        `${keyDerivation}'/0'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
        {
          format: keyDerivation === "84" ? "bech32" : "legacy",
          verify: false,
        }
      );
      pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, "hex"));
    } catch (e) {
      throw new OWalletError(
        ErrModuleLedgerSign,
        ErrFailedGetPublicKey,
        e.message || e.toString()
      );
    }

    if (
      Buffer.from(new PubKeySecp256k1(expectedPubKey).toBytes()).toString(
        "hex"
      ) !== Buffer.from(pubKey.toBytes()).toString("hex")
    ) {
      throw new OWalletError(
        ErrModuleLedgerSign,
        ErrPublicKeyUnmatched,
        "Public key unmatched"
      );
    }

    try {
      const keyPair = bitcoin.ECPair.fromPublicKey(expectedPubKey);
      console.log(keyPair, "keyPair");
      const { psbt } = buidTx(keyPair, message, inputs, outputs);
      const inputsData: Array<
        [Transaction, number, string | null, number | null]
      > = utxos.map(({ hex, txid, vout }) => {
        if (!hex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${txid})`);
        }
        const utxoTx = bitcoin.Transaction.fromHex(hex);
        const splittedTx = btcApp.splitTransaction(hex, utxoTx.hasWitnesses());
        return [splittedTx, vout, null, null];
      });
      console.log(inputsData, "inputsData");
      const associatedKeysets = utxos.map(
        (tx) => `${keyDerivation}'/0'/0'/0/0`
      );
      console.log(associatedKeysets, "associatedKeysets");
      const newTxHex = psbt.data.globalMap.unsignedTx
        .toBuffer()
        .toString("hex");
      console.log(newTxHex, "newTxHex");
      const newTx: Transaction = btcApp.splitTransaction(
        newTxHex,
        keyDerivation === "84"
      );
      console.log(newTx, "newTx");
      const outputScriptHex = btcApp
        .serializeTransactionOutputs(newTx)
        .toString("hex");
      const extraData =
        keyDerivation === "44"
          ? {
              // no additionals - similar to https://github.com/shapeshift/hdwallet/blob/a61234eb83081a4de54750b8965b873b15803a03/packages/hdwallet-ledger/src/bitcoin.ts#L222
              additionals: [],
              segwit: false,
              useTrustedInputForSegwit: false,
            }
          : {
              segwit: true,
              useTrustedInputForSegwit: true,
              additionals: ["bech32"],
            };
      const txHex = await btcApp.createPaymentTransactionNew({
        inputs: inputsData,
        associatedKeysets,
        outputScriptHex,
        ...extraData,
      });

      return txHex;
    } catch (e) {
      if (e?.message.includes("(0x6985)")) {
        throw new OWalletError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      }

      throw new OWalletError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        e.message || e.toString()
      );
    }
  } finally {
    await transport.close();
  }
};

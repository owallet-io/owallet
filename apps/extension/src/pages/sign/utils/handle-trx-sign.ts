import { SignTronInteractionStore } from "@owallet/stores-core";
import Transport from "@ledgerhq/hw-transport";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { OWalletError } from "@owallet/router";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
  LedgerOptions,
} from "./ledger-types";
import Trx from "@ledgerhq/hw-app-trx";
import { LedgerUtils } from "../../../utils";
import { PubKeySecp256k1 } from "@owallet/crypto";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";

export const handleTronPreSignByLedger = async (
  interactionData: NonNullable<SignTronInteractionStore["waitingData"]>,
  signingMessage: string,
  options?: LedgerOptions
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

  const publicKey = Buffer.from((appData["Tron"] as any)["pubKey"], "hex");
  if (publicKey.length === 0) {
    throw new Error("Invalid ledger app data");
  }

  return connectAndSignTrxWithLedger(
    !!options?.useWebHID,
    publicKey,
    bip44Path,
    signingMessage
  );
};

export const connectAndSignTrxWithLedger = async (
  useWebHID: boolean,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  message: string
): Promise<string> => {
  let transport: Transport;
  try {
    transport = useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new OWalletError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  let trxApp = new Trx(transport);

  // Ensure that the keplr can connect to ethereum app on ledger.
  // getAppConfiguration() works even if the ledger is on screen saver mode.
  // To detect the screen saver mode, we should request the address before using.
  try {
    await trxApp.getAddress(`m/44'/195'/'0/0/0`);
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

  transport = await LedgerUtils.tryAppOpen(transport, "Tron");
  trxApp = new Trx(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await trxApp.getAddress(
        `m/44'/195'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
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
      const trxSignature = await trxApp.signTransaction(
        `44'/195'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
        message,
        []
      );
      return trxSignature;
    } catch (e) {
      if (e?.message.includes("(0x6985)")) {
        throw new OWalletError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      }
      console.log(" e.message", e.message, e.toString());

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

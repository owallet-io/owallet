import { SignEthereumInteractionStore } from "@owallet/stores-core";
import { EthSignType } from "@owallet/types";
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
import Eth from "@ledgerhq/hw-app-eth";
import { LedgerUtils } from "../../../utils";
import { PubKeySecp256k1 } from "@owallet/crypto";
import {
  domainHash,
  EIP712MessageValidator,
  messageHash,
} from "@owallet/background";
import { serialize, TransactionTypes } from "@ethersproject/transactions";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";

export const handleEthereumPreSignByLedger = async (
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>,
  signingMessage: Uint8Array,
  options?: LedgerOptions
): Promise<Uint8Array | undefined> => {
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

  const publicKey = Buffer.from((appData["Ethereum"] as any)["pubKey"], "hex");
  if (publicKey.length === 0) {
    throw new Error("Invalid ledger app data");
  }

  return connectAndSignEthWithLedger(
    !!options?.useWebHID,
    publicKey,
    bip44Path,
    signingMessage,
    interactionData.data.signType
  );
};

export const connectAndSignEthWithLedger = async (
  useWebHID: boolean,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  message: Uint8Array,
  signType: EthSignType
): Promise<Uint8Array> => {
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

  let ethApp = new Eth(transport);

  // Ensure that the keplr can connect to ethereum app on ledger.
  // getAppConfiguration() works even if the ledger is on screen saver mode.
  // To detect the screen saver mode, we should request the address before using.
  try {
    await ethApp.getAddress(`m/44'/60'/'0/0/0`);
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

  transport = await LedgerUtils.tryAppOpen(transport, "Ethereum");
  ethApp = new Eth(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await ethApp.getAddress(
        `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
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

    if (signType === EthSignType.EIP712) {
      // Pre validate the eip712 message to separate the error case.
      await EIP712MessageValidator.validateAsync(
        JSON.parse(Buffer.from(message).toString())
      );
    }

    try {
      switch (signType) {
        case EthSignType.MESSAGE: {
          return ethSignatureToBytes(
            await ethApp.signPersonalMessage(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
              Buffer.from(message).toString("hex")
            )
          );
        }
        case EthSignType.TRANSACTION: {
          const tx = JSON.parse(Buffer.from(message).toString());
          const isEIP1559 = !!tx.maxFeePerGas || !!tx.maxPriorityFeePerGas;
          if (isEIP1559) {
            tx.type = TransactionTypes.eip1559;
          }
          const rlpArray = serialize(tx).replace("0x", "");

          return ethSignatureToBytes(
            await ethApp.signTransaction(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
              rlpArray
            )
          );
        }
        case EthSignType.EIP712: {
          const data = await EIP712MessageValidator.validateAsync(
            JSON.parse(Buffer.from(message).toString())
          );

          // Unfortunately, signEIP712Message not works on ledger yet.
          return ethSignatureToBytes(
            await ethApp.signEIP712HashedMessage(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
              //@ts-ignore
              domainHash(data),
              //@ts-ignore
              messageHash(data)
            )
          );
        }
        default:
          throw new Error("Invalid sign type");
      }
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

function ethSignatureToBytes(signature: {
  v: number | string;
  r: string;
  s: string;
}): Uint8Array {
  // Validate signature.r is hex encoded
  const r = Buffer.from(signature.r, "hex");
  // Validate signature.s is hex encoded
  const s = Buffer.from(signature.s, "hex");

  // Must be 32 bytes
  if (r.length !== 32 || s.length !== 32) {
    throw new Error("Unable to process signature: malformed fields");
  }

  const v =
    typeof signature.v === "string" ? parseInt(signature.v, 16) : signature.v;

  if (!Number.isInteger(v)) {
    throw new Error("Unable to process signature: malformed fields");
  }

  return Buffer.concat([
    r,
    s,
    // Make v 27 or 28 (EIP-155) to support all clients
    Buffer.from([v === 0 || (v !== 1 && v % 2 === 1) ? 27 : 28]),
  ]);
}

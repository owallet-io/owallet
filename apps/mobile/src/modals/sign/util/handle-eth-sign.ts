import { SignEthereumInteractionStore } from "@owallet/stores-core";
enum EthSignType {
  MESSAGE = "message",
  TRANSACTION = "transaction",
  EIP712 = "eip-712",
}
import Transport from "@ledgerhq/hw-transport";
import { OWalletError } from "@owallet/router";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from "./ledger-types";
import Eth from "@ledgerhq/hw-app-eth";
import { PubKeySecp256k1 } from "@owallet/crypto";
import {
  domainHash,
  EIP712MessageValidator,
  messageHash,
} from "@owallet/background";
import { serialize, TransactionTypes } from "@ethersproject/transactions";

import { LedgerUtils } from "@utils/ledger";

export const handleEthereumPreSignByLedger = async (
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>,
  signingMessage: Uint8Array,
  getTransport: () => Promise<Transport>
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
    getTransport,
    publicKey,
    bip44Path,
    signingMessage,
    interactionData.data.signType
  );
};

export const connectAndSignEthWithLedger = async (
  getTransport: () => Promise<Transport>,
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
    transport = await getTransport();
  } catch (e) {
    throw new OWalletError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  let ethApp = new Eth(transport);

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
          const data: any = await EIP712MessageValidator.validateAsync(
            JSON.parse(Buffer.from(message).toString())
          );

          // Unfortunately, signEIP712Message not works on ledger yet.
          return ethSignatureToBytes(
            await ethApp.signEIP712HashedMessage(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
              domainHash(data),
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

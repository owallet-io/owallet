import {
  connectAndSignEIP712WithLedger,
  connectAndSignWithLedger,
} from "./cosmos-ledger-sign";
import { SignInteractionStore } from "@owallet/stores-core";
import { SignDocWrapper } from "@owallet/cosmos";

import { LedgerOptions } from "./ledger-types";

export type PreSignOptions = LedgerOptions;

export const handleCosmosPreSign = async (
  interactionData: NonNullable<SignInteractionStore["waitingData"]>,
  signDocWrapper: SignDocWrapper,
  options?: PreSignOptions
): Promise<Uint8Array | undefined> => {
  switch (interactionData.data.keyType) {
    case "ledger": {
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

      if ("eip712" in interactionData.data && interactionData.data.eip712) {
        const publicKey = Buffer.from(
          (appData["Ethereum"] as any)["pubKey"],
          "hex"
        );
        if (publicKey.length === 0) {
          throw new Error("Invalid ledger app data");
        }

        return await connectAndSignEIP712WithLedger(
          (options as LedgerOptions).useWebHID,
          publicKey,
          bip44Path,
          signDocWrapper.aminoSignDoc,
          interactionData.data.eip712
        );
      }

      let ledgerApp = "Cosmos";
      let publicKey = new Uint8Array(0);

      if (appData["Terra"]) {
        ledgerApp = "Terra";
        publicKey = Buffer.from((appData["Terra"] as any)["pubKey"], "hex");
      } else if (appData["Secret"]) {
        ledgerApp = "Secret";
        publicKey = Buffer.from((appData["Secret"] as any)["pubKey"], "hex");
      } else {
        publicKey = Buffer.from((appData["Cosmos"] as any)["pubKey"], "hex");
      }

      if (publicKey.length === 0) {
        throw new Error("Invalid ledger app data");
      }

      if (!signDocWrapper) {
        throw new Error("Sign doc not found");
      }

      return await connectAndSignWithLedger(
        (options as LedgerOptions).useWebHID,
        ledgerApp,
        publicKey,
        bip44Path,
        signDocWrapper.aminoSignDoc
      );
    }

    default:
      return;
  }
};

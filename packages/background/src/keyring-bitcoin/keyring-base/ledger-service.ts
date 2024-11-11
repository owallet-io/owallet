import { Buffer } from "buffer/";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { OWalletError } from "@owallet/router";
import { ChainInfo } from "@owallet/types";
import { KeyRingBtc } from "../../keyring";
import { PlainObject, Vault } from "../../vault";

export class KeyRingBtcLedgerService implements KeyRingBtc {
  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "ledger";
  }

  createKeyRingVault(
    pubKey: Uint8Array,
    app: string,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    return Promise.resolve({
      insensitive: {
        [app]: {
          pubKey: Buffer.from(pubKey).toString("hex"),
        },
        bip44Path,
      },
      sensitive: {},
    });
  }

  getPubKey(
    vault: Vault,
    _coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 {
    let app = "Bitcoin44";
    if (!vault.insensitive[app]) {
      throw new OWalletError(
        "keyring",
        901,
        "No Bitcoin public key. Initialize Bitcoin app on Ledger by selecting the chain in the extension"
      );
    }

    if (!vault.insensitive[app]) {
      throw new Error(`Ledger is not initialized for ${app}`);
    }

    const bytes = Buffer.from(
      (vault.insensitive[app] as any)["pubKey"] as string,
      "hex"
    );
    return new PubKeySecp256k1(bytes);
  }
  getPubKeyBip84(
    vault: Vault,
    _coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 {
    let app = "Bitcoin84";
    if (!vault.insensitive[app]) {
      throw new OWalletError(
        "keyring",
        901,
        "No Bitcoin public key. Initialize Bitcoin app on Ledger by selecting the chain in the extension"
      );
    }

    if (!vault.insensitive[app]) {
      throw new Error(`Ledger is not initialized for ${app}`);
    }

    const bytes = Buffer.from(
      (vault.insensitive[app] as any)["pubKey"] as string,
      "hex"
    );
    return new PubKeySecp256k1(bytes);
  }

  sign(): string {
    throw new Error(
      "Ledger can't sign message in background. You should provide the signature from frontend."
    );
  }
}

import { Buffer } from "buffer/";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { OWalletError } from "@owallet/router";
import { ChainInfo } from "@owallet/types";
import { KeyRingSvm } from "../../keyring";
import { PlainObject, Vault, VaultService } from "../../vault";
import { KeyRingLedgerService } from "../../keyring-ledger";
import { PublicKey } from "@solana/web3.js";

export class KeyRingSvmLedgerService implements KeyRingSvm {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringService: KeyRingLedgerService
  ) {}

  supportedKeyRingType(): string {
    return this.baseKeyringService.supportedKeyRingType();
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
    return this.baseKeyringService.createKeyRingVault(pubKey, app, bip44Path);
  }

  getPubKey(vault: Vault, _coinType: number, chainInfo: ChainInfo): PublicKey {
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
    // return new PubKeySecp256k1(bytes);
    return;
  }

  sign(): string {
    throw new Error(
      "Ledger can't sign message in background. You should provide the signature from frontend."
    );
  }
}

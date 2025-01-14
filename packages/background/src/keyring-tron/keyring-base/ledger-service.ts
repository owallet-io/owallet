import { KeyRingTron } from "../../keyring";
import { PlainObject, Vault, VaultService } from "../../vault";
import { KeyRingLedgerService } from "../../keyring-ledger";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { OWalletError } from "@owallet/router";
import { Buffer } from "buffer";

export class KeyRingTronLedgerService implements KeyRingTron {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringLedgerService: KeyRingLedgerService
  ) {}

  supportedKeyRingType(): string {
    return this.baseKeyringLedgerService.supportedKeyRingType();
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
    return this.baseKeyringLedgerService.createKeyRingVault(
      pubKey,
      app,
      bip44Path
    );
  }

  getPubKey(vault: Vault, _coinType: number): PubKeySecp256k1 {
    let app = "Tron";
    if (!vault.insensitive[app]) {
      throw new OWalletError(
        "keyring",
        901,
        "No Tron public key. Initialize Tron app on Ledger by selecting the chain in the extension"
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

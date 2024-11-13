import { KeyRingTron } from "../../keyring";
import { PlainObject, Vault, VaultService } from "../../vault";
import { KeyRingLedgerService } from "../../keyring-ledger";
import { ChainInfo } from "@owallet/types";
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

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 {
    return this.baseKeyringLedgerService.getPubKey(vault, coinType, chainInfo);
  }

  sign(): string {
    throw new Error(
      "Ledger can't sign message in background. You should provide the signature from frontend."
    );
  }
}

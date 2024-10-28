import { Buffer } from "buffer/";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { KeyRingPrivateKeyService } from "../../keyring-private-key";
import { PlainObject, Vault, VaultService } from "../../vault";
import { HDKey } from "@owallet/common";
import { KeyRing } from "../../keyring";
import { ChainInfo } from "@owallet/types";

export class KeyRingTronPrivateKeyService implements KeyRing {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringService: KeyRingPrivateKeyService
  ) {}

  supportedKeyRingType(): string {
    return this.baseKeyringService.supportedKeyRingType();
  }

  createKeyRingVault(privateKey: Uint8Array): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    return this.baseKeyringService.createKeyRingVault(privateKey);
  }

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 {
    return this.baseKeyringService.getPubKey(vault, coinType, chainInfo);
  }

  sign(
    vault: Vault,
    _coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    // const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
    //     "privateKey"
    //     ] as string;
    // const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));
    //
    // let digest = new Uint8Array();
    // switch (digestMethod) {
    //     case "sha256":
    //         digest = Hash.sha256(data);
    //         break;
    //     case "keccak256":
    //         digest = Hash.keccak256(data);
    //         break;
    //     default:
    //         throw new Error(`Unknown digest method: ${digestMethod}`);
    // }
    //
    // return privateKey.signDigest32(digest);
    return;
  }
}

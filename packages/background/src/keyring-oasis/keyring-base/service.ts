import { Buffer } from "buffer/";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { Vault, VaultService } from "../../vault";
import { AnalyticsService } from "../../analytics";
import { KeyRing } from "../../keyring";
import { makeObservable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import { ChainInfo } from "@owallet/types";
import { ChainsService } from "../../chains";
// import {KeyRingPrivateKeyService} from "../../../keyring-private-key";

export class KeyRingOasisBaseService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRings: KeyRing[]
  ) {
    makeObservable(this);
  }

  // getPubKeySelected(chainId: string): Promise<PubKeySecp256k1> {
  //   return this.getPubKey(chainId, this.selectedVaultId);
  // }

  getPubKey(chainId: string, vaultId: string): Promise<Uint8Array> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    const coinType = (() => {
      if (vault.insensitive[coinTypeTag]) {
        return vault.insensitive[coinTypeTag] as number;
      }

      return chainInfo.bip44.coinType;
    })();

    return this.getPubKeyWithVault(vault, coinType, chainInfo);
  }
  getPubKeyWithVault(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): Promise<Uint8Array> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.getPubKey(vault, coinType, chainInfo) as Uint8Array
    );
  }
  protected getVaultKeyRing(vault: Vault): KeyRing {
    for (const keyRing of this.keyRings) {
      if (vault.insensitive["keyRingType"] === keyRing.supportedKeyRingType()) {
        return keyRing;
      }
    }

    throw new Error("Unsupported keyRing vault");
  }
  // getPubKey(vault: Vault): Uint8Array {
  //   const publicKeyBytes = Buffer.from(
  //     vault.insensitive["publicKey"] as string,
  //     "hex"
  //   );
  //
  //   return new Uint8Array(publicKeyBytes);
  // }

  // sign(
  //   vault: Vault,
  //   _coinType: number,
  //   data: Uint8Array,
  //   digestMethod: "sha256" | "keccak256"
  // ): {
  //   readonly r: Uint8Array;
  //   readonly s: Uint8Array;
  //   readonly v: number | null;
  // } {
  //   const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
  //     "privateKey"
  //   ] as string;
  //   const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));
  //
  //   let digest = new Uint8Array();
  //   switch (digestMethod) {
  //     case "sha256":
  //       digest = Hash.sha256(data);
  //       break;
  //     case "keccak256":
  //       digest = Hash.keccak256(data);
  //       break;
  //     default:
  //       throw new Error(`Unknown digest method: ${digestMethod}`);
  //   }
  //
  //   return privateKey.signDigest32(digest);
  // }
}

import { Vault, VaultService } from "../../vault";
import { KeyRing } from "../../keyring";
import { makeObservable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import { ChainInfo } from "@owallet/types";
import { ChainsService } from "../../chains";
import { PubKeySecp256k1 } from "@owallet/crypto";

export class KeyRingBtcBaseService {
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

  getPubKey(chainId: string, vaultId: string): Promise<PubKeySecp256k1> {
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
  getPubKeyBip84(chainId: string, vaultId: string): Promise<PubKeySecp256k1> {
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

      return chainInfo.bip84.coinType;
    })();

    return this.getPubKeyBip84WithVault(vault, coinType, chainInfo);
  }

  getPubKeyWithVault(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }
    if (!chainInfo.features.includes("gen-address")) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.getPubKey(vault, coinType, chainInfo) as PubKeySecp256k1
    );
  }
  getPubKeyBip84WithVault(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }
    if (!chainInfo.features.includes("gen-address")) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.getPubKeyBip84(vault, coinType, chainInfo) as PubKeySecp256k1
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
}

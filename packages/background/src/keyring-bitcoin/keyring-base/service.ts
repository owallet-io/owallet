import { Vault, VaultService } from "../../vault";
import { KeyRing, KeyRingBtc } from "../../keyring";
import { makeObservable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import { ChainInfo } from "@owallet/types";
import { ChainsService } from "../../chains";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { types } from "@oasisprotocol/client";

export class KeyRingBtcBaseService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRings: KeyRingBtc[]
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
  protected getVaultKeyRing(vault: Vault): KeyRingBtc {
    for (const keyRing of this.keyRings) {
      if (vault.insensitive["keyRingType"] === keyRing.supportedKeyRingType()) {
        return keyRing;
      }
    }

    throw new Error("Unsupported keyRing vault");
  }
  async sign(
    chainId: string,
    vaultId: string,
    data: Uint8Array,
    inputs: any,
    outputs: any,
    signType: "legacy" | "bech32"
  ): Promise<string> {
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

    return await this.signWithVault(
      vault,
      coinType,
      data,
      inputs,
      outputs,
      signType,
      chainInfo
    );
  }

  async signWithVault(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    //TODO: need check type inputs/outputs
    inputs: any,
    outputs: any,
    signType: "legacy" | "bech32",
    chainInfo: ChainInfo
  ): Promise<string> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.sign(vault, coinType, data, inputs, outputs, signType, chainInfo)
    );
  }
}

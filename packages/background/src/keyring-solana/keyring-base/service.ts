import { Vault, VaultService } from "../../vault";
import { KeyRingSvm } from "../../keyring";
import { makeObservable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import { ChainInfo } from "@owallet/types";
import { ChainsService } from "../../chains";
import { PublicKey } from "@solana/web3.js";

export class KeyRingSvmBaseService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRings: KeyRingSvm[]
  ) {
    makeObservable(this);
  }

  getPubKey(chainId: string, vaultId: string): Promise<PublicKey> {
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
  ): Promise<PublicKey> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }
    if (!chainInfo.features.includes("gen-address")) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(keyRing.getPubKey(vault, coinType, chainInfo));
  }
  protected getVaultKeyRing(vault: Vault): KeyRingSvm {
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

    // return Promise.resolve(
    //   keyRing.sign(vault, coinType, data, inputs, outputs, signType, chainInfo)
    // );
    return;
  }
}

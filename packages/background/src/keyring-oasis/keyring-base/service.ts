import { Buffer } from "buffer/";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { Vault, VaultService } from "../../vault";
import { AnalyticsService } from "../../analytics";
import { KeyRingOasis } from "../../keyring";
import { makeObservable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import { ChainInfo, TransactionType } from "@owallet/types";
import { ChainsService } from "../../chains";
import { types } from "@oasisprotocol/client";
import { TW } from "@owallet/common";
// import {KeyRingPrivateKeyService} from "../../../keyring-private-key";

export class KeyRingOasisBaseService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRings: KeyRingOasis[]
  ) {
    makeObservable(this);
  }

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

    return Promise.resolve(keyRing.getPubKey(vault, coinType, chainInfo));
  }
  protected getVaultKeyRing(vault: Vault): KeyRingOasis {
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
    data: Uint8Array
  ): Promise<types.SignatureSigned> {
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

    const signature = await this.signWithVault(
      vault,
      coinType,
      data,
      chainInfo
    );

    return signature;
  }

  async signWithVault(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    chainInfo: ChainInfo
  ): Promise<types.SignatureSigned> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(keyRing.sign(vault, coinType, data, chainInfo));
  }
}

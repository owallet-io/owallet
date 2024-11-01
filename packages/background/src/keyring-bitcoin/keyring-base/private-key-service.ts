import { Buffer } from "buffer/";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { KeyRingPrivateKeyService } from "../../keyring-private-key";
import { Vault, VaultService } from "../../vault";
import { compileMemo, HDKey, signSignatureBtc } from "@owallet/common";
import { KeyRing, KeyRingBtc } from "../../keyring";
import { ChainInfo } from "@owallet/types";
import * as bitcoin from "bitcoinjs-lib";
export class KeyRingBtcPrivateKeyService implements KeyRingBtc {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringService: KeyRingPrivateKeyService
  ) {}
  supportedKeyRingType(): string {
    return this.baseKeyringService.supportedKeyRingType();
  }
  createKeyRingVault(privateKey: Uint8Array) {
    return this.baseKeyringService.createKeyRingVault(privateKey);
  }

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 {
    if (!chainInfo?.features.includes("gen-address")) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const publicKeyBytes = Buffer.from(
      vault.insensitive["publicKey"] as string,
      "hex"
    );

    return new PubKeySecp256k1(publicKeyBytes);
  }
  sign(
    vault: Vault,
    _coinType: number,
    data: Uint8Array,
    inputs: any,
    outputs: any,
    _signType: "legacy" | "bech32"
  ): string {
    const keyPair = this.getKeyPair(vault);
    return signSignatureBtc(keyPair, data, inputs, outputs);
  }
  private getKeyPair(vault: Vault) {
    const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
      "privateKey"
    ] as string;
    const privateKey = Buffer.from(privateKeyText, "hex");
    if (!privateKey) throw Error("Private Key is not Empty");
    //@ts-ignore
    return bitcoin.ECPair.fromPrivateKey(privateKey);
  }
}

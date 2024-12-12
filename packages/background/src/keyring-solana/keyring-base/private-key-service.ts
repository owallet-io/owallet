import { PubKeySecp256k1 } from "@owallet/crypto";
import { KeyRingPrivateKeyService } from "../../keyring-private-key";
import { Vault, VaultService } from "../../vault";
import { KeyRingSvm } from "../../keyring";
import { ChainInfo } from "@owallet/types";
import { PublicKey } from "@solana/web3.js";
export class KeyRingSvmPrivateKeyService implements KeyRingSvm {
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

  getPubKey(vault: Vault, _coinType: number, chainInfo: ChainInfo): PublicKey {
    throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    // if (!chainInfo?.features.includes("gen-address")) {
    //   throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    // }
    // const publicKeyBytes = Buffer.from(
    //   vault.insensitive["publicKey"] as string,
    //   "hex"
    // );
    //
    // return new PubKeySecp256k1(publicKeyBytes);
  }
  sign(vault: Vault, _coinType: number, data: string): string {
    return;
    // const keyPair = this.getKeyPair(vault);
    // return signSignatureBtc(keyPair, data, inputs, outputs);
  }
  // private getKeyPair(vault: Vault) {
  //   const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
  //     "privateKey"
  //   ] as string;
  //   const privateKey = Buffer.from(privateKeyText, "hex");
  //   if (!privateKey) throw Error("Private Key is not Empty");
  //   //@ts-ignore
  //   return bitcoin.ECPair.fromPrivateKey(privateKey);
  // }
}

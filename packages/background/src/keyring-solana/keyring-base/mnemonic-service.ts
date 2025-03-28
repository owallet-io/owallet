import { Buffer } from "buffer/";
import { KeyRingMnemonicService } from "../../keyring-mnemonic";
import { Vault, VaultService } from "../../vault";
import { KeyRingSvm } from "../../keyring";
import { ChainInfo } from "@owallet/types";
import { Mnemonic } from "@owallet/crypto";
import { PublicKey } from "@solana/web3.js";
import { decode, encode } from "bs58";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
import nacl from "tweetnacl";
export class KeyRingSvmMnemonicService implements KeyRingSvm {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringService: KeyRingMnemonicService
  ) {}
  supportedKeyRingType(): string {
    return this.baseKeyringService.supportedKeyRingType();
  }
  createKeyRingVault(
    mnemonic: string,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ) {
    return this.baseKeyringService.createKeyRingVault(mnemonic, bip44Path);
  }

  getPubKey(vault: Vault, coinType: number, chainInfo: ChainInfo): PublicKey {
    if (
      !chainInfo?.features.includes("gen-address") ||
      !chainInfo?.chainId.startsWith("solana")
    ) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const bip44Path = this.getBIP44PathFromVault(vault);

    const tag = `pubKey-m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;
    if (vault.insensitive[tag]) {
      const pubKey = vault.insensitive[tag] as string;
      return new PublicKey(pubKey);
    }
    const keypair = this.getKeyPair(vault, coinType);
    const pubKey = keypair.publicKey;
    const pubKeyText = pubKey.toBase58();
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });

    return pubKey;
  }

  sign(vault: Vault, coinType: number, txMsg: string): string {
    if (!txMsg) throw Error("tx Not Empty");
    const keypair = this.getKeyPair(vault, coinType);
    const tx = Buffer.from(decode(txMsg));
    return encode(nacl.sign.detached(new Uint8Array(tx), keypair.secretKey));
  }

  protected getBIP44PathFromVault(vault: Vault): {
    account: number;
    change: number;
    addressIndex: number;
  } {
    return vault.insensitive["bip44Path"] as {
      account: number;
      change: number;
      addressIndex: number;
    };
  }
  protected getKeyPair(vault: Vault, coinType: number) {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const hdPath = `m/44'/${coinType}'/${bip44Path.addressIndex}'/${bip44Path.account}'`;
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const mnemonic = decrypted["mnemonic"] as string | undefined;
    if (!mnemonic || !coinType) {
      throw new Error("mnemonic is null");
    }
    return Mnemonic.generateWalletSolanaFromSeed(mnemonic, hdPath);
  }
}

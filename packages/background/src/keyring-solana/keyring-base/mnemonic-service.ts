import { Buffer } from "buffer/";
import { KeyRingMnemonicService } from "../../keyring-mnemonic";
import { Vault, VaultService } from "../../vault";
import { signSignatureBtc } from "@owallet/common";
import { KeyRingSvm } from "../../keyring";
import { ChainInfo } from "@owallet/types";
import { Mnemonic, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { PublicKey } from "@solana/web3.js";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

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

    // const privKey = this.getPrivKey(vault, coinType, 44);
    //
    const keypair = this.getKeyPair(vault);
    const pubKey = keypair.publicKey;
    const pubKeyText = pubKey.toBase58();
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });

    return pubKey;
  }

  sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    inputs: any,
    outputs: any,
    signType: "legacy" | "bech32"
  ): string {
    // const keyPair = this.getKeyPair(vault, coinType, signType);
    // return signSignatureBtc(keyPair, data, inputs, outputs);
    return;
  }
  // protected getPrivKey(
  //   vault: Vault,
  //   coinType: number,
  //   keyDerivation: number = 84
  // ): PrivKeySecp256k1 {
  //   const bip44Path = this.getBIP44PathFromVault(vault);
  //
  //   const decrypted = this.vaultService.decrypt(vault.sensitive);
  //   const masterSeedText = decrypted["masterSeedText"] as string | undefined;
  //   if (!masterSeedText) {
  //     throw new Error("masterSeedText is null");
  //   }
  //
  //   const masterSeed = Buffer.from(masterSeedText, "hex");
  //   return new PrivKeySecp256k1(
  //     Mnemonic.generatePrivateKeyFromMasterSeed(
  //       masterSeed,
  //       `m/${keyDerivation}'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
  //     )
  //   );
  // }

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
  protected getKeyPair(vault: Vault) {
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const mnemonic = decrypted["mnemonic"] as string | undefined;
    if (!mnemonic) {
      throw new Error("mnemonic is null");
    }
    return Mnemonic.generateWalletSolanaFromSeed(mnemonic);
  }
}

import { Buffer } from "buffer/";
import { KeyRingMnemonicService } from "../../keyring-mnemonic";
import { Vault, VaultService } from "../../vault";
import { HDKey, uint2hex } from "@owallet/common";
import { KeyRing } from "../../keyring";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

export class KeyRingOasisMnemonicService implements KeyRing {
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

  async getPubKey(vault: Vault, coinType: number): Promise<Uint8Array> {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const tag = `pubKey-m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    if (vault.insensitive[tag]) {
      return Buffer.from(vault.insensitive[tag] as string, "hex");
    }
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const mnemonicText = decrypted["mnemonic"] as string | undefined;
    if (!mnemonicText) {
      throw new Error("mnemonicText is null");
    }
    const keyPair = await HDKey.getAccountSigner(mnemonicText as string);
    const pubKeyText = Buffer.from(keyPair.publicKey).toString("hex");
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });
    return keyPair.publicKey;
  }
  sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    // const privKey = this.getPrivKey(vault, coinType);
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
    // return privKey.signDigest32(digest);
    return;
  }

  protected async getPrivKey(
    vault: Vault,
    coinType: number
  ): Promise<Uint8Array> {
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const mnemonicText = decrypted["mnemonic"] as string | undefined;
    if (!mnemonicText) {
      throw new Error("mnemonicText is null");
    }
    const keyPair = await HDKey.getAccountSigner(mnemonicText as string);
    return keyPair.secretKey;
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
}

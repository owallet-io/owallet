import { Buffer } from "buffer/";
import { KeyRingMnemonicService } from "../../keyring-mnemonic";
import { Vault, VaultService } from "../../vault";
import {
  getOasisNic,
  HDKey,
  OasisTransaction,
  parseRoseStringToBigNumber,
  signerFromPrivateKey,
  TW,
  uint2hex,
} from "@owallet/common";
import { KeyRingOasis } from "../../keyring";
import { ChainInfo, TransactionType } from "@owallet/types";
import * as oasis from "@oasisprotocol/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

export class KeyRingOasisMnemonicService implements KeyRingOasis {
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

  async getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): Promise<Uint8Array> {
    if (
      !chainInfo?.features.includes("gen-address") ||
      !chainInfo?.features.includes("oasis")
    ) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }

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
  async sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    chainInfo: ChainInfo
  ): Promise<oasis.types.SignatureSigned> {
    const parsedData = JSON.parse(Buffer.from(data).toString());
    const { amount, to } = parsedData;
    const privKey = await this.getPrivKey(vault);
    const signer = signerFromPrivateKey(privKey);
    const bigIntAmount = BigInt(parseRoseStringToBigNumber(amount).toString());
    console.log(bigIntAmount, to, "bigIntAmount");
    if (!chainInfo.grpc || !chainInfo.features.includes("oasis"))
      throw Error("Not found Oasis chain");
    const nic = getOasisNic(chainInfo.grpc);
    const chainContext = await nic.consensusGetChainContext();

    const tw = await OasisTransaction.buildTransfer(
      nic,
      signer,
      to,
      bigIntAmount
    );

    await OasisTransaction.sign(chainContext, signer, tw);
    return tw.signedTransaction;
  }

  protected async getPrivKey(
    vault: Vault
    // coinType: number
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

import { Buffer } from "buffer/";
import { KeyRingMnemonicService } from "../../keyring-mnemonic";
import { Vault, VaultService } from "../../vault";
import {
  DEFAULT_FEE_LIMIT_TRON,
  HDKey,
  TronWebProvider,
} from "@owallet/common";
import { KeyRingTron } from "../../keyring";
import { ChainInfo } from "@owallet/types";
import TronWeb from "tronweb";
import { Mnemonic, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

export class KeyRingTronMnemonicService implements KeyRingTron {
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
  ): Promise<PubKeySecp256k1> {
    if (!chainInfo?.features.includes("tron")) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    return this.baseKeyringService.getPubKey(vault, coinType, chainInfo);
  }

  async sign(
    vault: Vault,
    coinType: number,
    data: string,
    chainInfo: ChainInfo
  ): Promise<unknown> {
    if (!chainInfo?.features.includes("tron")) {
      throw new Error(`${chainInfo.chainId} not support sign from base`);
    }
    const parsedData = JSON.parse(JSON.parse(data));

    const privKey = await this.getPrivKey(vault, coinType);

    const tronWeb = TronWebProvider(chainInfo.rpc);
    let transaction: any;
    if (parsedData?.contractAddress) {
      transaction = (
        await tronWeb.transactionBuilder.triggerSmartContract(
          parsedData?.contractAddress,
          "transfer(address,uint256)",
          {
            callValue: 0,
            feeLimit: parsedData?.feeLimit ?? DEFAULT_FEE_LIMIT_TRON,
            userFeePercentage: 100,
            shouldPollResponse: false,
          },
          [
            { type: "address", value: parsedData.recipient },
            { type: "uint256", value: parsedData.amount },
          ],
          parsedData.address
        )
      ).transaction;
    } else {
      transaction = await tronWeb.transactionBuilder.sendTrx(
        parsedData.recipient,
        parsedData.amount,
        parsedData.address
      );
    }

    const transactionSign = TronWeb.utils.crypto.signTransaction(
      privKey.toBytes(),
      {
        txID: transaction.txID,
      }
    );

    transaction.signature = [transactionSign?.signature?.[0]];
    const receipt = await tronWeb.trx.sendRawTransaction(transaction);

    return receipt;
  }

  protected async getPrivKey(
    vault: Vault,
    coinType: number
  ): Promise<PrivKeySecp256k1> {
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const masterSeedText = decrypted["mnemonic"] as string | undefined;
    const bip44Path = this.getBIP44PathFromVault(vault);

    if (!masterSeedText) {
      throw new Error("masterSeedText is null");
    }

    const privKey = Mnemonic.generateWalletFromMnemonic(
      masterSeedText,
      `m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
    );

    return new PrivKeySecp256k1(privKey);
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

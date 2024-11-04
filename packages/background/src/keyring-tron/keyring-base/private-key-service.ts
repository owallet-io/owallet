import { Buffer } from 'buffer/';
import { PrivKeySecp256k1 } from '@owallet/crypto';
import { KeyRingPrivateKeyService } from '../../keyring-private-key';
import { PlainObject, Vault, VaultService } from '../../vault';
import { DEFAULT_FEE_LIMIT_TRON, HDKey, TronWebProvider } from '@owallet/common';
import { KeyRingTron } from '../../keyring';
import { ChainInfo } from '@owallet/types';
import TronWeb from 'tronweb';

export class KeyRingTronPrivateKeyService implements KeyRingTron {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringService: KeyRingPrivateKeyService
  ) {}

  supportedKeyRingType(): string {
    return this.baseKeyringService.supportedKeyRingType();
  }

  createKeyRingVault(privateKey: Uint8Array): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    return this.baseKeyringService.createKeyRingVault(privateKey);
  }

  async getPubKey(vault: Vault, coinType: number, chainInfo: ChainInfo): Promise<Uint8Array> {
    if (!chainInfo?.features.includes('gen-address')) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const bip44Path = this.getBIP44PathFromVault(vault);

    const tag = `pubKey-m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    if (vault.insensitive[tag]) {
      return Buffer.from(vault.insensitive[tag] as string, 'hex');
    }
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const mnemonicText = decrypted['mnemonic'] as string | undefined;
    if (!mnemonicText) {
      throw new Error('mnemonicText is null');
    }
    const keyPair = await HDKey.getAccountSigner(mnemonicText as string);
    const pubKeyText = Buffer.from(keyPair.publicKey).toString('hex');
    this.vaultService.setAndMergeInsensitiveToVault('keyRing', vault.id, {
      [tag]: pubKeyText
    });
    return keyPair.publicKey;
  }

  async sign(vault: Vault, coinType: number, data: string, chainInfo: ChainInfo): Promise<unknown> {
    const parsedData = JSON.parse(JSON.parse(data));

    const privateKeyText = this.vaultService.decrypt(vault.sensitive)['privateKey'] as string;
    const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, 'hex'));

    const tronWeb = TronWebProvider(chainInfo.rpc);
    let transaction: any;
    if (parsedData?.contractAddress) {
      transaction = (
        await tronWeb.transactionBuilder.triggerSmartContract(
          parsedData?.contractAddress,
          'transfer(address,uint256)',
          {
            callValue: 0,
            feeLimit: parsedData?.feeLimit ?? DEFAULT_FEE_LIMIT_TRON,
            userFeePercentage: 100,
            shouldPollResponse: false
          },
          [
            { type: 'address', value: parsedData.recipient },
            { type: 'uint256', value: parsedData.amount }
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

    const transactionSign = TronWeb.utils.crypto.signTransaction(privateKey.toBytes(), {
      txID: transaction.txID
    });

    transaction.signature = [transactionSign?.signature?.[0]];

    const receipt = await tronWeb.trx.sendRawTransaction(transaction);

    return receipt;
  }

  protected getBIP44PathFromVault(vault: Vault): {
    account: number;
    change: number;
    addressIndex: number;
  } {
    return vault.insensitive['bip44Path'] as {
      account: number;
      change: number;
      addressIndex: number;
    };
  }
}

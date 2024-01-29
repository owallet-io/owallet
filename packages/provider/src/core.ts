import {
  ChainInfo,
  OWallet as IOWallet,
  Ethereum as IEthereum,
  TronWeb as ITronWeb,
  Bitcoin as IBitcoin,
  Oasis as IOasis,
  OWalletIntereactionOptions,
  OWalletMode,
  OWalletSignOptions,
  Key,
  EthereumMode,
  RequestArguments,
  TronWebMode,
  BitcoinMode,
  ChainInfoWithoutEndpoints,
  DefaultMode
} from '@owallet/types';
import { BACKGROUND_PORT, MessageRequester } from '@owallet/router';
import { BroadcastMode, AminoSignResponse, StdSignDoc, StdTx, OfflineSigner, StdSignature } from '@cosmjs/launchpad';

import {
  EnableAccessMsg,
  GetKeyMsg,
  SuggestChainInfoMsg,
  SuggestTokenMsg,
  SendTxMsg,
  RequestEthereumMsg,
  GetSecret20ViewingKey,
  RequestSignAminoMsg,
  GetPubkeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
  GetTxEncryptionKeyMsg,
  RequestVerifyADR36AminoSignDoc,
  RequestSignEthereumTypedDataMsg,
  SignEthereumTypedDataObject,
  RequestSignDecryptDataMsg,
  RequestSignReEncryptDataMsg,
  RequestPublicKeyMsg,
  RequestSignEIP712CosmosTxMsg_v0
} from '@owallet/background';
import { SecretUtils } from 'secretjs/types/enigmautils';

import { OWalletEnigmaUtils } from './enigma';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from './cosmjs';
import deepmerge from 'deepmerge';
import Long from 'long';
import { Buffer } from 'buffer';
import {
  RequestSignBitcoinMsg,
  GetChainInfosWithoutEndpointsMsg,
  GetDefaultAddressTronMsg,
  RequestSignDirectMsg,
  RequestSignEthereumMsg,
  RequestSignTronMsg,
  RequestSendRawTransactionMsg,
  TriggerSmartContractMsg,
  RequestSignOasisMsg,
  RequestTxBuilderOasisMsg,
  GetDefaultAddressOasisMsg
} from './msgs';
import { ChainIdEnum } from '@owallet/common';
import { Signer } from '@oasisprotocol/client/dist/signature';

export class OWallet implements IOWallet {
  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: OWalletIntereactionOptions = {};

  constructor(
    public readonly version: string,
    public readonly mode: OWalletMode,
    protected readonly requester: MessageRequester
  ) {}

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    const msg = new GetChainInfosWithoutEndpointsMsg();
    return (await this.requester.sendMessage(BACKGROUND_PORT, msg)).chainInfos;
  }

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === 'string') {
      chainIds = [chainIds];
    }

    await this.requester.sendMessage(BACKGROUND_PORT, new EnableAccessMsg(chainIds));
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    const msg = new SuggestChainInfoMsg(chainInfo);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getKey(chainId: string): Promise<Key> {
    const msg = new GetKeyMsg(chainId);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async sendTx(chainId: string, tx: StdTx | Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    const msg = new SendTxMsg(chainId, tx, mode);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions = {}
  ): Promise<AminoSignResponse> {
    const msg = new RequestSignAminoMsg(
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async experimentalSignEIP712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions?: OWalletSignOptions
  ): Promise<AminoSignResponse> {
    const msg = new RequestSignEIP712CosmosTxMsg_v0(
      chainId,
      signer,
      eip712,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  // then here to sign
  async signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    signOptions: OWalletSignOptions = {}
  ): Promise<DirectSignResponse> {
    const msg = new RequestSignDirectMsg(
      chainId,
      signer,
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber ? signDoc.accountNumber.toString() : null
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );

    const response = await this.requester.sendMessage(BACKGROUND_PORT, msg);

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: Long.fromString(response.signed.accountNumber)
      },
      signature: response.signature
    };
  }

  async signAndBroadcastTron(chainId: string, data: object): Promise<{}> {
    const msg = new RequestSignTronMsg(chainId, data);

    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    let isADR36WithString = false;
    if (typeof data === 'string') {
      data = Buffer.from(data).toString('base64');
      isADR36WithString = true;
    } else {
      data = Buffer.from(data).toString('base64');
    }

    const signDoc = {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: {
        gas: '0',
        amount: []
      },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer,
            data
          }
        }
      ],
      memo: ''
    };

    const msg = new RequestSignAminoMsg(chainId, signer, signDoc, {
      isADR36WithString
    });
    return (await this.requester.sendMessage(BACKGROUND_PORT, msg)).signature;
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }

    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new RequestVerifyADR36AminoSignDoc(chainId, signer, data, signature)
    );
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
  }

  async getOfflineSignerAuto(chainId: string): Promise<OfflineSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    if (key.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this);
    }
    return new CosmJSOfflineSigner(chainId, this);
  }

  async suggestToken(chainId: string, contractAddress: string, viewingKey?: string): Promise<void> {
    const msg = new SuggestTokenMsg(chainId, contractAddress, viewingKey);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getSecret20ViewingKey(chainId: string, contractAddress: string): Promise<string> {
    const msg = new GetSecret20ViewingKey(chainId, contractAddress);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await this.requester.sendMessage(BACKGROUND_PORT, new GetPubkeyMsg(chainId));
  }

  async getEnigmaTxEncryptionKey(chainId: string, nonce: Uint8Array): Promise<Uint8Array> {
    return await this.requester.sendMessage(BACKGROUND_PORT, new GetTxEncryptionKeyMsg(chainId, nonce));
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.requester.sendMessage(BACKGROUND_PORT, new ReqeustEncryptMsg(chainId, contractCodeHash, msg));
  }

  async enigmaDecrypt(chainId: string, ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    if (!ciphertext || ciphertext.length === 0) {
      return new Uint8Array();
    }

    return await this.requester.sendMessage(BACKGROUND_PORT, new RequestDecryptMsg(chainId, ciphertext, nonce));
  }

  getEnigmaUtils(chainId: string): SecretUtils {
    if (this.enigmaUtils.has(chainId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.enigmaUtils.get(chainId)!;
    }

    const enigmaUtils = new OWalletEnigmaUtils(chainId, this);
    this.enigmaUtils.set(chainId, enigmaUtils);
    return enigmaUtils;
  }
}

export class Ethereum implements IEthereum {
  constructor(
    public readonly version: string,
    public readonly mode: EthereumMode,
    public initChainId: string,
    protected readonly requester: MessageRequester
  ) {
    this.initChainId = initChainId;
  }

  async request(args: RequestArguments): Promise<any> {
    if (args.method === 'wallet_switchEthereumChain') {
      let tmpChainId = this.initChainId;
      if (args.chainId === '0x1') {
        // 0x1 is not valid chain id, so we set default chain id = 0x01 (eth)
        tmpChainId = ChainIdEnum.Ethereum;
      } else {
        tmpChainId = args.chainId;
      }
      this.initChainId = tmpChainId;
      const msg = new RequestEthereumMsg(tmpChainId, args.method, args.params);
      return await this.requester.sendMessage(BACKGROUND_PORT, msg);
    } else if (args.method === 'eth_sendTransaction') {
      const msg = new RequestSignEthereumMsg(args.chainId ?? this.initChainId, args.params?.[0]);
      const { rawTxHex } = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      return rawTxHex;
    } else {
      const msg = new RequestEthereumMsg(args.chainId ?? this.initChainId, args.method, args.params);
      return await this.requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }

  async signAndBroadcastEthereum(chainId: string, data: object): Promise<{ rawTxHex: string }> {
    const msg = new RequestSignEthereumMsg(chainId, data);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    const msg = new SuggestChainInfoMsg(chainInfo);

    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signEthereumTypeData(chainId: string, data: SignEthereumTypedDataObject): Promise<any> {
    try {
      const msg = new RequestSignEthereumTypedDataMsg(chainId, data);
      const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);

      return result;
    } catch (error) {
      console.log(error, 'error on send message!!!!!!!!!!!!!!!');
    }
  }

  async signAndBroadcastTron(chainId: string, data: object): Promise<{ rawTxHex: string } | any> {
    const msg = new RequestSignTronMsg(chainId, data);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getPublicKey(chainId: string): Promise<object> {
    const msg = new RequestPublicKeyMsg(chainId);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signDecryptData(chainId: string, data: object): Promise<object> {
    const msg = new RequestSignDecryptDataMsg(chainId, data);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  // thang2
  async signReEncryptData(chainId: string, data: object): Promise<object> {
    const msg = new RequestSignReEncryptDataMsg(chainId, data);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  // async sign()
  // async asyncRequest(): Promise<void> {
  //   console.log('');
  // }
  // async getKey(chainId: string): Promise<Key> {
  //   const msg = new GetKeyMsg(chainId);
  //   return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  // }
}

export class TronWeb implements ITronWeb {
  constructor(
    public readonly version: string,
    public readonly mode: EthereumMode,
    public initChainId: string,
    protected readonly requester: MessageRequester
  ) {
    this.initChainId = initChainId;
  }

  async sign(transaction: object): Promise<object> {
    const msg = new RequestSignTronMsg(ChainIdEnum.TRON, transaction);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async sendRawTransaction(transaction: {
    raw_data: any;
    raw_data_hex: string;
    txID: string;
    visible?: boolean;
  }): Promise<object> {
    const msg = new RequestSendRawTransactionMsg(ChainIdEnum.TRON, transaction);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getDefaultAddress(): Promise<object> {
    const msg = new GetDefaultAddressTronMsg(ChainIdEnum.TRON);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async triggerSmartContract(
    address,
    functionSelector,
    options,
    parameters,
    issuerAddress
  ): Promise<{
    result: any;
    transaction: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    };
  }> {
    const msg = new TriggerSmartContractMsg(ChainIdEnum.TRON, {
      address,
      functionSelector,
      options,
      parameters,
      issuerAddress
    });
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}
export class Bitcoin implements IBitcoin {
  constructor(
    public readonly version: string,
    public readonly mode: BitcoinMode,
    protected readonly requester: MessageRequester
  ) {}
  async signAndBroadcast(chainId: string, data: object): Promise<{ rawTxHex: string }> {
    const msg = new RequestSignBitcoinMsg(chainId, data);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
  async getKey(chainId: string): Promise<Key> {
    const msg = new GetKeyMsg(chainId);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}

export class Oasis implements IOasis {
  constructor(
    public readonly version: string,
    public readonly mode: DefaultMode,
    public initChainId: string,
    protected readonly requester: MessageRequester
  ) {
    this.initChainId = initChainId;
  }

  async signOasis(transaction: string): Promise<object> {
    const msg = new RequestSignOasisMsg(ChainIdEnum.Oasis, transaction);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async txBuilderOasis(amount: bigint, to: string): Promise<object> {
    const msg = new RequestTxBuilderOasisMsg(ChainIdEnum.Oasis, { amount, to });
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getDefaultOasisAddress(): Promise<unknown> {
    const msg = new GetDefaultAddressOasisMsg(ChainIdEnum.Oasis);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}

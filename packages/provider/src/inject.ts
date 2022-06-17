import {
  ChainInfo,
  OWallet,
  OWallet as IOWallet,
  Ethereum,
  Ethereum as IEthereum,
  OWalletIntereactionOptions,
  OWalletMode,
  OWalletSignOptions,
  Key,
  EthereumMode,
  RequestArguments,
} from '@owallet/types';
import { Result, JSONUint8Array } from '@owallet/router';
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineSigner,
  StdSignature,
} from '@cosmjs/launchpad';
import { SecretUtils } from 'secretjs/types/enigmautils';

import { OWalletEnigmaUtils } from './enigma';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from './cosmjs';
import deepmerge from 'deepmerge';
import Long from 'long';
import { NAMESPACE, NAMESPACE_ETHEREUM } from './constants';

export interface ProxyRequest {
  type: 'proxy-request';
  id: string;
  namespace: string;
  method: keyof OWallet | Ethereum | string;
  args: any[];
}

export interface ProxyRequestResponse {
  type: 'proxy-request-response';
  id: string;
  namespace: string;
  result: Result | undefined;
}

/**
 * InjectedOWallet would be injected to the webpage.
 * In the webpage, it can't request any messages to the extension because it doesn't have any API related to the extension.
 * So, to request some methods of the extension, this will proxy the request to the content script that is injected to webpage on the extension level.
 * This will use `window.postMessage` to interact with the content script.
 */
export class InjectedOWallet implements IOWallet {
  static startProxy(
    owallet: IOWallet,
    eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener('message', fn),
        postMessage: (message) =>
          window.postMessage(message, window.location.origin),
      },
    parseMessage?: (message: any) => any
  ) {
    eventListener.addMessageListener(async (e: any) => {
      const message: ProxyRequest = parseMessage
        ? parseMessage(e.data)
        : e.data;

      // filter proxy-request by namespace
      if (
        !message ||
        message.type !== 'proxy-request' ||
        message.namespace !== NAMESPACE
      ) {
        return;
      }

      try {
        if (!message.id) {
          throw new Error('Empty id');
        }

        if (message.method === 'version') {
          throw new Error('Version is not function');
        }

        if (message.method === 'mode') {
          throw new Error('Mode is not function');
        }

        if (message.method === 'defaultOptions') {
          throw new Error('DefaultOptions is not function');
        }

        if (
          !owallet[message.method as keyof OWallet] ||
          typeof owallet[message.method as keyof OWallet] !== 'function'
        ) {
          throw new Error(`Invalid method: ${message.method}`);
        }

        if (message.method === 'getOfflineSigner') {
          throw new Error("GetOfflineSigner method can't be proxy request");
        }

        if (message.method === 'getOfflineSignerOnlyAmino') {
          throw new Error(
            "GetOfflineSignerOnlyAmino method can't be proxy request"
          );
        }

        if (message.method === 'getOfflineSignerAuto') {
          throw new Error("GetOfflineSignerAuto method can't be proxy request");
        }

        if (message.method === 'getEnigmaUtils') {
          throw new Error("GetEnigmaUtils method can't be proxy request");
        }

        const result =
          message.method === 'signDirect'
            ? await (async () => {
              console.log(
                'before sign docs ???????????????????????????????????????'
              );

              const receivedSignDoc: {
                bodyBytes?: Uint8Array | null;
                authInfoBytes?: Uint8Array | null;
                chainId?: string | null;
                accountNumber?: string | null;
              } = message.args[2];

              const result = await owallet.signDirect(
                message.args[0],
                message.args[1],
                {
                  bodyBytes: receivedSignDoc.bodyBytes,
                  authInfoBytes: receivedSignDoc.authInfoBytes,
                  chainId: receivedSignDoc.chainId,
                  accountNumber: receivedSignDoc.accountNumber
                    ? Long.fromString(receivedSignDoc.accountNumber)
                    : null,
                },
                message.args[3]
              );

              return {
                signed: {
                  bodyBytes: result.signed.bodyBytes,
                  authInfoBytes: result.signed.authInfoBytes,
                  chainId: result.signed.chainId,
                  accountNumber: result.signed.accountNumber.toString(),
                },
                signature: result.signature,
              };
            })()
            : await owallet[message.method as any](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...JSONUint8Array.unwrap(message.args)
            );

        const proxyResponse: ProxyRequestResponse = {
          type: 'proxy-request-response',
          namespace: NAMESPACE,
          id: message.id,
          result: {
            return: JSONUint8Array.wrap(result),
          },
        };

        window.postMessage(proxyResponse, window.location.origin);
      } catch (e) {
        const proxyResponse: ProxyRequestResponse = {
          type: 'proxy-request-response',
          namespace: NAMESPACE,
          id: message.id,
          result: {
            error: e.message || e.toString(),
          },
        };

        window.postMessage(proxyResponse, window.location.origin);
      }
    });
  }

  protected requestMethod(method: keyof IOWallet, args: any[]): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join('');

    const proxyMessage: ProxyRequest = {
      type: 'proxy-request',
      namespace: NAMESPACE,
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {

      console.log("IN REQUEST METHOD RECEIVE RESPONSE OF OWALLET????????");

      const receiveResponse = (e: MessageEvent) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== 'proxy-request-response') {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        window.removeEventListener("message", receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error('Result is null'));
          return;
        }

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result.return);
      };

      window.addEventListener("message", receiveResponse);

      window.postMessage(proxyMessage, window.location.origin);
    });
  }

  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: OWalletIntereactionOptions = {};

  constructor(
    public readonly version: string,
    public readonly mode: OWalletMode,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener('message', fn),
        removeMessageListener: (fn: (e: any) => void) =>
          window.removeEventListener('message', fn),
        postMessage: (message) =>
          window.postMessage(message, window.location.origin),
      },
    protected readonly parseMessage?: (message: any) => any
  ) { }

  async enable(chainIds: string | string[]): Promise<void> {
    await this.requestMethod('enable', [chainIds]);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    await this.requestMethod('experimentalSuggestChain', [chainInfo]);
  }

  async getKey(chainId: string): Promise<Key> {
    return await this.requestMethod('getKey', [chainId]);
  }

  async sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    return await this.requestMethod('sendTx', [chainId, tx, mode]);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions = {}
  ): Promise<AminoSignResponse> {
    return await this.requestMethod('signAmino', [
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
  }

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
    const result = await this.requestMethod('signDirect', [
      chainId,
      signer,
      // We can't send the `Long` with remaing the type.
      // Receiver should change the `string` to `Long`.
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);

    const signed: {
      bodyBytes: Uint8Array;
      authInfoBytes: Uint8Array;
      chainId: string;
      accountNumber: string;
    } = result.signed;

    console.log('accountNumber', signed);

    return {
      signed: {
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        chainId: signed.chainId,
        // We can't send the `Long` with remaing the type.
        // Sender should change the `Long` to `string`.
        accountNumber: Long.fromString(signed.accountNumber),
      },
      signature: result.signature,
    };
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return await this.requestMethod('signArbitrary', [chainId, signer, data]);
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return await this.requestMethod('verifyArbitrary', [
      chainId,
      signer,
      data,
      signature,
    ]);
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
  }

  async getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    if (key.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this);
    }
    return new CosmJSOfflineSigner(chainId, this);
  }

  async suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void> {
    return await this.requestMethod('suggestToken', [
      chainId,
      contractAddress,
      viewingKey,
    ]);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return await this.requestMethod('getSecret20ViewingKey', [
      chainId,
      contractAddress,
    ]);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await this.requestMethod('getEnigmaPubKey', [chainId]);
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod('getEnigmaTxEncryptionKey', [
      chainId,
      nonce,
    ]);
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.requestMethod('enigmaEncrypt', [
      chainId,
      contractCodeHash,
      msg,
    ]);
  }

  async enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod('enigmaDecrypt', [
      chainId,
      ciphertext,
      nonce,
    ]);
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

export class InjectedEthereum implements Ethereum {

  // we use this chain id for chain id switching from user
  public static chainId: string;

  static startProxy(
    ethereum: Ethereum,
    eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener('message', fn),
        postMessage: (message) =>
          window.postMessage(message, window.location.origin),
      },
    parseMessage?: (message: any) => any
  ) {

    // listen method when inject send to
    eventListener.addMessageListener(async (e: MessageEvent) => {
      const message: ProxyRequest = parseMessage
        ? parseMessage(e.data)
        : e.data;

      // filter proxy-request by namespace
      if (
        !message ||
        message.type !== 'proxy-request' ||
        message.namespace !== NAMESPACE_ETHEREUM
      ) {
        return;
      }

      try {
        if (!message.id) {
          throw new Error('Empty id');
        }

        if (message.method === 'version') {
          throw new Error('Version is not function');
        }

        if (message.method === 'mode') {
          throw new Error('Mode is not function');
        }

        if (message.method === 'chainId') {
          throw new Error('chain id is not function');
        }

        // TODO: eth_sendTransaction is special case. Other case => pass through custom request RPC without signing
        var result: any;
        const chainId = message.args[1] ? message.args[1] : this.chainId ? this.chainId : ethereum.chainId;

        switch (message.method) {
          case 'eth_sendTransaction' as any:
            result = await (async () => {

              console.log("message before signing raw ethereum xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx: ", message.args)

              const { rawTxHex } = await ethereum.signAndBroadcastEthereum(
                chainId,
                message.args[0][0] // TODO: is this okay to assume that we only need the first item of the params?
              );

              console.log("raw tx hex after START PROXY: ", rawTxHex); // this is the transaction hash already

              return rawTxHex;
            })()
            break;
          case 'eth_chainId' as any:
            result = chainId;
            break;
          case 'wallet_switchEthereumChain' as any:
            const param = message.args[0][0];
            if (param && typeof param === 'string') this.chainId = message.args[0][0];
            else throw new Error(`Chain Id: ${param} is invalid`);
            break;
          default:
            result = await ethereum.request({ method: message.method as string, params: message.args[0], chainId })
            break;
        }

        const proxyResponse: ProxyRequestResponse = {
          type: 'proxy-request-response',
          namespace: NAMESPACE_ETHEREUM,
          id: message.id,
          result: {
            return: JSONUint8Array.wrap(result),
          },
        };

        eventListener.postMessage(proxyResponse);

      } catch (e) {
        const proxyResponse: ProxyRequestResponse = {
          type: 'proxy-request-response',
          namespace: NAMESPACE_ETHEREUM,
          id: message.id,
          result: {
            error: e.message || e.toString(),
          },
        };

        eventListener.postMessage(proxyResponse);
      }
    });
  }

  protected requestMethod(method: keyof IEthereum | string, args: any[]): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join('');

    const proxyMessage: ProxyRequest = {
      type: 'proxy-request',
      namespace: NAMESPACE_ETHEREUM,
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {

      const receiveResponse = (e: MessageEvent) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        console.log("proxy response: ", proxyResponse)


        if (!proxyResponse || proxyResponse.type !== 'proxy-request-response') {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);
        const result = JSONUint8Array.unwrap(proxyResponse.result);


        if (!result) {
          reject(new Error('Result is null'));
          return;
        }

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);
      this.eventListener.postMessage(proxyMessage);
    });
  }

  public chainId: string;

  constructor(
    public readonly version: string,
    public readonly mode: EthereumMode,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener('message', fn),
        removeMessageListener: (fn: (e: any) => void) =>
          window.removeEventListener('message', fn),
        postMessage: (message) =>
          window.postMessage(message, window.location.origin),
      },
    protected readonly parseMessage?: (message: any) => any
  ) { }

  // async send(): Promise<void> {
  //   console.log('console.log send');
  // }

  // THIS IS THE ENTRYPOINT OF THE INJECTED ETHEREUM WHEN USER CALLS window.ethereum.request
  async request(args: RequestArguments): Promise<any> {
    console.log(`arguments: ${JSON.stringify(args)}`);
    return await this.requestMethod(args.method as string, [args.params, args.chainId]); // TODO: how to collect chain id, signer & rpc?
  }

  async signAndBroadcastEthereum(chainId: string, data: object): Promise<{ rawTxHex: string }> {
    console.log('console.log sign');
    return { rawTxHex: "" }
  }

  // async asyncRequest(): Promise<void> {
  //   console.log('console.log asyncRequest');
  //   alert('console.log asyncRequest');
  // }

  // async getKey(chainId: string): Promise<Key> {
  //   return await this.requestMethod('getKey', [chainId]);
  // }
}

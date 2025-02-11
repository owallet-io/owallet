import {
  ChainInfo,
  EthSignType,
  OWallet,
  OWallet as IOWallet,
  OWalletIntereactionOptions,
  OWalletMode,
  OWalletSignOptions,
  Key,
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  OfflineAminoSigner,
  StdSignature,
  StdTx,
  DirectSignResponse,
  OfflineDirectSigner,
  ICNSAdr36Signatures,
  ChainInfoWithoutEndpoints,
  SecretUtils,
  SettledResponses,
  DirectAuxSignResponse,
  IEthereumProvider,
  EIP6963EventNames,
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  IOasisProvider,
  IBitcoinProvider,
  ITronProvider,
  TransactionType,
  RequestArguments,
  TransactionBtcType,
  ISolanaProvider,
} from "@owallet/types";
import {
  Result,
  JSONUint8Array,
  EthereumProviderRpcError,
} from "@owallet/router";
import { OWalletEnigmaUtils } from "./enigma";
import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { OWalletCoreTypes } from "./core-types";
import EventEmitter from "events";
import { types } from "@oasisprotocol/client";
import { ChainIdEVM } from "@owallet/types";
import {
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { encode, decode } from "bs58";
// import {CHAIN_ID_SOL} from "@owallet/common";
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
// import {isReactNative, isWeb} from "@owallet/common";
import { initialize } from "@oraichain/owallet-wallet-standard";

// initialize(owallet.solana as any);
export interface ProxyRequest {
  type: "proxy-request";
  id: string;
  method: keyof (OWallet & OWalletCoreTypes);
  args: any[];
  ethereumProviderMethod?: keyof IEthereumProvider;
  oasisProviderMethod?: keyof IOasisProvider;
  tronProviderMethod?: keyof ITronProvider;
  solanaProviderMethod?: keyof ISolanaProvider;
  bitcoinProviderMethod?: keyof IBitcoinProvider;
}

export interface ProxyRequestResponse {
  type: "proxy-request-response";
  id: string;
  result: Result | undefined;
}

function defineUnwritablePropertyIfPossible(o: any, p: string, value: any) {
  const descriptor = Object.getOwnPropertyDescriptor(o, p);

  if (!descriptor || descriptor.writable) {
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(o, p, {
        value,
        writable: false,
      });
    } else {
      o[p] = value;
    }
  } else {
    console.warn(
      `Failed to inject ${p} from OWallet. Probably, other wallet is trying to intercept OWallet`
    );
  }
}

function defineWritablePropertyIfPossible(o: any, p: string, value: any) {
  const descriptor = Object.getOwnPropertyDescriptor(o, p);

  if (!descriptor || descriptor.writable) {
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(o, p, {
        value,
        writable: true,
      });
    } else {
      o[p] = value;
    }
  } else {
    console.warn(
      `Failed to inject ${p} from OWallet. Probably, other wallet is trying to intercept OWallet`
    );
  }
}

export function injectOWalletToWindow(owallet: IOWallet): void {
  import("@oraichain/owallet-wallet-standard")
    .then(({ initialize }) => {
      initialize(owallet.solana as any);
    })
    .catch((error) => {
      console.error(
        "Failed to load @oraichain/owallet-wallet-standard:",
        error
      );
    });
  defineUnwritablePropertyIfPossible(window, "owallet", owallet);
  defineUnwritablePropertyIfPossible(window, "keplr", owallet);
  defineUnwritablePropertyIfPossible(window, "owalletSolana", owallet.solana);
  defineUnwritablePropertyIfPossible(window, "bitcoin", owallet.bitcoin);
  const descriptor = Object.getOwnPropertyDescriptor(window, "ethereum");

  if (!descriptor) {
    defineWritablePropertyIfPossible(window, "ethereum", owallet.ethereum);
  }
  defineUnwritablePropertyIfPossible(window, "eth_owallet", owallet.ethereum);
  defineUnwritablePropertyIfPossible(window, "tronWeb", owallet.tron);
  defineUnwritablePropertyIfPossible(window, "tronLink", owallet.tron);
  defineUnwritablePropertyIfPossible(window, "tronWeb_owallet", owallet.tron);
  defineUnwritablePropertyIfPossible(window, "tronLink_owallet", owallet.tron);
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSigner",
    owallet.getOfflineSigner
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSignerOnlyAmino",
    owallet.getOfflineSignerOnlyAmino
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSignerAuto",
    owallet.getOfflineSignerAuto
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getEnigmaUtils",
    owallet.getEnigmaUtils
  );
}

/**
 * InjectedOWallet would be injected to the webpage.
 * In the webpage, it can't request any messages to the extension because it doesn't have any API related to the extension.
 * So, to request some methods of the extension, this will proxy the request to the content script that is injected to webpage on the extension level.
 * This will use `window.postMessage` to interact with the content script.
 */
export class InjectedOWallet implements IOWallet, OWalletCoreTypes {
  static startProxy(
    owallet: IOWallet & OWalletCoreTypes,
    eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    parseMessage?: (message: any) => any
  ): () => void {
    const fn = async (e: any) => {
      const message: ProxyRequest = parseMessage
        ? parseMessage(e.data)
        : e.data;
      if (!message || message.type !== "proxy-request") {
        return;
      }

      console.log("message.method", message.method);

      try {
        if (!message.id) {
          throw new Error("Empty id");
        }

        if (message.method.startsWith("protected")) {
          throw new Error("Rejected");
        }

        if (message.method === "version") {
          throw new Error("Version is not function");
        }

        if (message.method === "mode") {
          throw new Error("Mode is not function");
        }

        if (message.method === "defaultOptions") {
          throw new Error("DefaultOptions is not function");
        }

        if (
          !owallet[message.method] ||
          (message.method !== "ethereum" &&
            message.method !== "tron" &&
            message.method !== "bitcoin" &&
            message.method !== "oasis" &&
            message.method !== "solana" &&
            typeof owallet[message.method] !== "function")
        ) {
          console.log(`Invalid method: ${message.method}`);

          throw new Error(`Invalid method: ${message.method}`);
        }

        if (message.method === "getOfflineSigner") {
          throw new Error("GetOfflineSigner method can't be proxy request");
        }

        if (message.method === "getOfflineSignerOnlyAmino") {
          throw new Error(
            "GetOfflineSignerOnlyAmino method can't be proxy request"
          );
        }

        if (message.method === "getOfflineSignerAuto") {
          throw new Error("GetOfflineSignerAuto method can't be proxy request");
        }

        if (message.method === "getEnigmaUtils") {
          throw new Error("GetEnigmaUtils method can't be proxy request");
        }

        const method = message.method;
        const result = await (async () => {
          if (method === "signDirect") {
            return await (async () => {
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
            })();
          }

          if (method === "signDirectAux") {
            return await (async () => {
              const receivedSignDoc: {
                bodyBytes?: Uint8Array | null;
                publicKey?: {
                  typeUrl: string;
                  value: Uint8Array;
                } | null;
                chainId?: string | null;
                accountNumber?: string | null;
                sequence?: string | null;
              } = message.args[2];

              const result = await owallet.signDirectAux(
                message.args[0],
                message.args[1],
                {
                  bodyBytes: receivedSignDoc.bodyBytes,
                  publicKey: receivedSignDoc.publicKey,
                  chainId: receivedSignDoc.chainId,
                  accountNumber: receivedSignDoc.accountNumber
                    ? Long.fromString(receivedSignDoc.accountNumber)
                    : null,
                  sequence: receivedSignDoc.sequence
                    ? Long.fromString(receivedSignDoc.sequence)
                    : null,
                },
                message.args[3]
              );

              return {
                signed: {
                  bodyBytes: result.signed.bodyBytes,
                  publicKey: result.signed.publicKey,
                  chainId: result.signed.chainId,
                  accountNumber: result.signed.accountNumber.toString(),
                  sequence: result.signed.sequence.toString(),
                },
                signature: result.signature,
              };
            })();
          }

          if (method === "ethereum") {
            const ethereumProviderMethod = message.ethereumProviderMethod;

            //@ts-ignore
            if (ethereumProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }

            if (ethereumProviderMethod === "chainId") {
              throw new Error("chainId is not function");
            }

            if (ethereumProviderMethod === "selectedAddress") {
              throw new Error("selectedAddress is not function");
            }

            if (ethereumProviderMethod === "networkVersion") {
              throw new Error("networkVersion is not function");
            }

            if (ethereumProviderMethod === "isOWallet") {
              throw new Error("isOWallet is not function");
            }

            if (ethereumProviderMethod === "isMetaMask") {
              throw new Error("isMetaMask is not function");
            }

            if (
              ethereumProviderMethod === undefined ||
              typeof owallet.ethereum[ethereumProviderMethod] !== "function"
            ) {
              throw new Error(
                //@ts-ignore
                `${message?.ethereumProviderMethod} is not function or invalid Ethereum provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);
            if (ethereumProviderMethod === "request") {
              return await owallet.ethereum.request(
                typeof messageArgs === "string"
                  ? JSON.parse(messageArgs)
                  : messageArgs
              );
            }

            return await owallet.ethereum[ethereumProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          } else if (method === "oasis") {
            const oasisProviderMethod = message.oasisProviderMethod;

            //@ts-ignore
            if (oasisProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }
            if (
              oasisProviderMethod === undefined ||
              typeof owallet.oasis[oasisProviderMethod] !== "function"
            ) {
              throw new Error(
                //@ts-ignore
                `${message?.oasisProviderMethod} is not function or invalid Oasis provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);

            return await owallet.oasis[oasisProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          } else if (method === "bitcoin") {
            const bitcoinProviderMethod = message.bitcoinProviderMethod;

            //@ts-ignore
            if (bitcoinProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }
            if (
              bitcoinProviderMethod === undefined ||
              typeof owallet.bitcoin[bitcoinProviderMethod] !== "function"
            ) {
              throw new Error(
                //@ts-ignore
                `${message?.bitcoinProviderMethod} is not function or invalid Oasis provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);

            return await owallet.bitcoin[bitcoinProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          } else if (method === "solana") {
            const solanaProviderMethod = message.solanaProviderMethod;

            //@ts-ignore
            if (solanaProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }
            if (
              solanaProviderMethod === undefined ||
              typeof owallet.solana[solanaProviderMethod] !== "function"
            ) {
              throw new Error(
                //@ts-ignore
                `${message?.solanaProviderMethod} is not function or invalid Oasis provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return await owallet.solana[solanaProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          } else if (method === "tron") {
            const tronProviderMethod = message.tronProviderMethod;

            console.log("tronProviderMethod", tronProviderMethod);

            //@ts-ignore
            if (tronProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }
            if (
              tronProviderMethod === undefined ||
              typeof owallet.tron[tronProviderMethod] !== "function"
            ) {
              console.log(
                "tronProviderMethod",
                tronProviderMethod,
                typeof owallet.tron[tronProviderMethod]
              );

              throw new Error(
                //@ts-ignore
                `${message?.tronProviderMethod} is not function or invalid Tron provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);

            // @ts-ignore
            return await owallet.tron[tronProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          }

          console.log("owallet[method]", method);

          return await owallet[method](
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...JSONUint8Array.unwrap(message.args)
          );
        })();

        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            return: JSONUint8Array.wrap(result),
          },
        };

        eventListener.postMessage(proxyResponse);
      } catch (e) {
        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            error:
              e.code && !e.module
                ? {
                    code: e.code,
                    message: e.message,
                    data: e.data,
                  }
                : e.message || e.toString(),
          },
        };

        eventListener.postMessage(proxyResponse);
      }
    };

    eventListener.addMessageListener(fn);

    return () => {
      eventListener.removeMessageListener(fn);
    };
  }

  protected requestMethod(
    method: keyof (IOWallet & OWalletCoreTypes),
    args: any[]
  ): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
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

  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: OWalletIntereactionOptions = {};
  public isOwallet: boolean = true;

  constructor(
    public readonly version: string,
    public readonly mode: OWalletMode,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any,
    protected readonly eip6963ProviderInfo?: EIP6963ProviderInfo
  ) {
    // Freeze fields/method except for "defaultOptions"
    // Intentionally, "defaultOptions" can be mutated to allow a webpage to change the options with cosmjs usage.
    // Freeze fields
    const fieldNames = Object.keys(this);
    for (const fieldName of fieldNames) {
      if (fieldName !== "defaultOptions") {
        Object.defineProperty(this, fieldName, {
          value: (this as any)[fieldName],
          writable: false,
        });
      }

      // If field is "eventListener", try to iterate one-level deep.
      if (fieldName === "eventListener") {
        const fieldNames = Object.keys(this.eventListener);
        for (const fieldName of fieldNames) {
          Object.defineProperty(this.eventListener, fieldName, {
            value: (this.eventListener as any)[fieldName],
            writable: false,
          });
        }
      }
    }
    // Freeze methods
    const methodNames = Object.getOwnPropertyNames(InjectedOWallet.prototype);
    for (const methodName of methodNames) {
      if (
        methodName !== "constructor" &&
        typeof (this as any)[methodName] === "function"
      ) {
        Object.defineProperty(this, methodName, {
          value: (this as any)[methodName].bind(this),
          writable: false,
        });
      }
    }
  }

  async ping(): Promise<void> {
    await this.requestMethod("ping", []);
  }

  async enable(chainIds: string | string[]): Promise<void> {
    await this.requestMethod("enable", [chainIds]);
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    await this.requestMethod("disable", [chainIds]);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    if (chainInfo.hideInUI) {
      throw new Error("hideInUI is not allowed");
    }

    if (
      chainInfo.features?.includes("stargate") ||
      chainInfo.features?.includes("no-legacy-stdTx")
    ) {
      console.warn(
        "“stargate”, “no-legacy-stdTx” feature has been deprecated. The launchpad is no longer supported, thus works without the two features. We would keep the aforementioned two feature for a while, but the upcoming update would potentially cause errors. Remove the two feature."
      );
    }

    await this.requestMethod("experimentalSuggestChain", [chainInfo]);
  }

  async getKey(chainId: string): Promise<Key> {
    return await this.requestMethod("getKey", [chainId]);
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await this.requestMethod("getKeysSettled", [chainIds]);
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    if (!("length" in tx)) {
      console.warn(
        "Do not send legacy std tx via `sendTx` API. We now only support protobuf tx. The usage of legeacy std tx would throw an error in the near future."
      );
    }

    return await this.requestMethod("sendTx", [chainId, tx, mode]);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions = {}
  ): Promise<AminoSignResponse> {
    return await this.requestMethod("signAmino", [
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
    const result = await this.requestMethod("signDirect", [
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

  async signDirectAux(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      publicKey?: {
        typeUrl: string;
        value: Uint8Array;
      } | null;
      chainId?: string | null;
      accountNumber?: Long | null;
      sequence?: Long | null;
    },
    signOptions: Exclude<
      OWalletSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    > = {}
  ): Promise<DirectAuxSignResponse> {
    const result = await this.requestMethod("signDirectAux", [
      chainId,
      signer,
      // We can't send the `Long` with remaing the type.
      // Receiver should change the `string` to `Long`.
      {
        bodyBytes: signDoc.bodyBytes,
        publicKey: signDoc.publicKey,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
        sequence: signDoc.sequence ? signDoc.sequence.toString() : null,
      },
      deepmerge(
        {
          preferNoSetMemo: this.defaultOptions.sign?.preferNoSetMemo,
        },
        signOptions
      ),
    ]);

    const signed: {
      bodyBytes: Uint8Array;
      publicKey?: {
        typeUrl: string;
        value: Uint8Array;
      } | null;
      chainId: string;
      accountNumber: string;
      sequence: string;
    } = result.signed;

    return {
      signed: {
        bodyBytes: signed.bodyBytes,
        publicKey: signed.publicKey || undefined,
        chainId: signed.chainId,
        // We can't send the `Long` with remaing the type.
        // Sender should change the `Long` to `string`.
        accountNumber: Long.fromString(signed.accountNumber),
        sequence: Long.fromString(signed.sequence),
      },
      signature: result.signature,
    };
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return await this.requestMethod("signArbitrary", [chainId, signer, data]);
  }

  signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    return this.requestMethod("signICNSAdr36", [
      chainId,
      contractAddress,
      owner,
      username,
      addressChainIds,
    ]);
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return await this.requestMethod("verifyArbitrary", [
      chainId,
      signer,
      data,
      signature,
    ]);
  }

  getOfflineSigner(
    chainId: string,
    signOptions?: OWalletSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this, signOptions);
  }

  getOfflineSignerOnlyAmino(
    chainId: string,
    signOptions?: OWalletSignOptions
  ): OfflineAminoSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this, signOptions);
  }

  async getOfflineSignerAuto(
    chainId: string,
    signOptions?: OWalletSignOptions
  ): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    if (key.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this, signOptions);
    }
    return new CosmJSOfflineSigner(chainId, this, signOptions);
  }

  async suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void> {
    return await this.requestMethod("suggestToken", [
      chainId,
      contractAddress,
      viewingKey,
    ]);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return await this.requestMethod("getSecret20ViewingKey", [
      chainId,
      contractAddress,
    ]);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await this.requestMethod("getEnigmaPubKey", [chainId]);
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod("getEnigmaTxEncryptionKey", [
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
    return await this.requestMethod("enigmaEncrypt", [
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
    return await this.requestMethod("enigmaDecrypt", [
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

  async experimentalSignEIP712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions = {}
  ): Promise<AminoSignResponse> {
    return await this.requestMethod("experimentalSignEIP712CosmosTx_v0", [
      chainId,
      signer,
      eip712,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
  }

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    return await this.requestMethod("getChainInfosWithoutEndpoints", []);
  }

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    return await this.requestMethod("getChainInfoWithoutEndpoints", [chainId]);
  }

  __core__getAnalyticsId(): Promise<string> {
    return this.requestMethod("__core__getAnalyticsId", []);
  }

  async changeKeyRingName({
    defaultName,
    editable = true,
  }: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string> {
    return await this.requestMethod("changeKeyRingName", [
      { defaultName, editable },
    ]);
  }

  async __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod(
      "__core__privilageSignAminoWithdrawRewards",
      [chainId, signer, signDoc]
    );
  }

  async __core__privilageSignAminoDelegate(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod("__core__privilageSignAminoDelegate", [
      chainId,
      signer,
      signDoc,
    ]);
  }

  async signEthereum(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array> {
    return await this.requestMethod("signEthereum", [
      chainId,
      signer,
      data,
      type,
    ]);
  }

  async sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string> {
    return await this.requestMethod("sendEthereumTx", [chainId, tx]);
  }

  async suggestERC20(chainId: string, contractAddress: string): Promise<void> {
    return await this.requestMethod("suggestERC20", [chainId, contractAddress]);
  }

  async __core__webpageClosed(): Promise<void> {
    return await this.requestMethod("__core__webpageClosed", []);
  }

  public readonly ethereum = new EthereumProvider(
    () => this,
    this.eventListener,
    this.parseMessage,
    this.eip6963ProviderInfo
  );
  public readonly oasis = new OasisProvider(
    () => this,
    this.eventListener,
    this.parseMessage
  );
  public readonly solana = new SolanaProvider(
    () => this,
    this.eventListener,
    this.parseMessage
  );
  public readonly bitcoin = new BitcoinProvider(
    () => this,
    this.eventListener,
    this.parseMessage
  );
  public readonly tron = new TronProvider(
    () => this,
    this.eventListener,
    this.parseMessage
  );
}

class EthereumProvider extends EventEmitter implements IEthereumProvider {
  // It must be in the hexadecimal format used in EVM-based chains, not the format used in Tendermint nodes.
  chainId: string | null = null;
  // It must be in the decimal format of chainId.
  networkVersion: string | null = null;

  selectedAddress: string | null = null;

  isOWallet = true;
  isMetaMask = true;
  // This duplicate field is for compatibility with OraiDex that use isOwallet with misspelling.
  isOwallet = true;

  protected _isConnected = false;
  protected _currentChainId: string | null = null;

  constructor(
    protected readonly injectedOWallet: () => InjectedOWallet,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any,
    protected readonly eip6963ProviderInfo?: EIP6963ProviderInfo
  ) {
    super();

    this._initProviderState();

    window.addEventListener("keplr_keystorechange", async () => {
      if (this._currentChainId) {
        const chainInfo = await injectedOWallet().getChainInfoWithoutEndpoints(
          this._currentChainId
        );

        if (chainInfo) {
          const selectedAddress = (
            await injectedOWallet().getKey(this._currentChainId)
          ).ethereumHexAddress;
          this._handleAccountsChanged(selectedAddress);
        }
      }
    });

    window.addEventListener("owallet_chainChanged", (event) => {
      const origin = (event as CustomEvent).detail.origin;

      if (origin === window.location.origin) {
        const evmChainId = (event as CustomEvent).detail.evmChainId;
        this._handleChainChanged(evmChainId);
      }
    });

    window.addEventListener("owallet_ethSubscription", (event: Event) => {
      const origin = (event as CustomEvent).detail.origin;
      const providerId = (event as CustomEvent).detail.providerId;

      if (
        origin === window.location.origin &&
        providerId === this.eip6963ProviderInfo?.uuid
      ) {
        const data = (event as CustomEvent).detail.data;
        this.emit("message", {
          type: "eth_subscription",
          data,
        });
      }
    });

    if (this.eip6963ProviderInfo) {
      const announceEvent = new CustomEvent<EIP6963ProviderDetail>(
        EIP6963EventNames.Announce,
        {
          detail: Object.freeze({
            info: this.eip6963ProviderInfo,
            provider: this,
          }),
        }
      );
      window.addEventListener(EIP6963EventNames.Request, () =>
        window.dispatchEvent(announceEvent)
      );
      window.dispatchEvent(announceEvent);
    }
  }

  protected _requestMethod = async (
    method: keyof IEthereumProvider,
    args: Record<string, any>
  ): Promise<any> => {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method: "ethereum",
      args: JSONUint8Array.wrap(args),
      ethereumProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          const error = result.error;
          reject(
            error.code && !error.module
              ? new EthereumProviderRpcError(
                  error.code,
                  error.message,
                  error.data
                )
              : new Error(error)
          );
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  };

  protected _initProviderState = async () => {
    // const descriptor = Object.getOwnPropertyDescriptor(window, "keplr");

    // if (descriptor) {
    //   return;
    // }

    const initialProviderState = await this._requestMethod("request", {
      method: "keplr_initProviderState",
    });

    if (initialProviderState) {
      const { currentEvmChainId, currentChainId, selectedAddress } =
        initialProviderState;

      if (
        currentChainId != null &&
        currentEvmChainId != null &&
        selectedAddress != null
      ) {
        this._handleConnect(currentEvmChainId);
        this._handleChainChanged(currentEvmChainId);
        this._currentChainId = currentChainId;
        this._handleAccountsChanged(selectedAddress);
      }
    }
  };

  protected _handleConnect = async (evmChainId: number) => {
    if (!this._isConnected) {
      this._isConnected = true;

      const evmChainIdHexString = `0x${evmChainId.toString(16)}`;

      this.emit("connect", { chainId: evmChainIdHexString });
    }
  };

  protected _handleDisconnect = async () => {
    if (this._isConnected) {
      await this._requestMethod("request", {
        method: "owallet_disconnect",
      });

      this._isConnected = false;
      this.chainId = null;
      this.selectedAddress = null;
      this.networkVersion = null;

      this.emit("disconnect");
    }
  };

  protected _handleChainChanged = async (evmChainId: number) => {
    const evmChainIdHexString = `0x${evmChainId.toString(16)}`;
    if (evmChainIdHexString !== this.chainId) {
      this.chainId = evmChainIdHexString;
      this.networkVersion = evmChainId.toString(10);

      this.emit("chainChanged", evmChainIdHexString);
    }
  };

  protected _handleAccountsChanged = async (selectedAddress: string) => {
    if (this.selectedAddress !== selectedAddress) {
      this.selectedAddress = selectedAddress;

      this.emit("accountsChanged", [selectedAddress]);
    }
  };

  isConnected(): boolean {
    return this._isConnected;
  }

  request = async <T = unknown>({
    method,
    params,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    chainId?: string;
  }): Promise<T> => {
    if (typeof method !== "string") {
      throw new Error("Invalid paramater: `method` must be a string");
    }

    if (!this._isConnected) {
      await this._initProviderState();
    }

    if (method === "eth_accounts") {
      return (this.selectedAddress ? [this.selectedAddress] : []) as T;
    }

    return await this._requestMethod("request", {
      method,
      params,
      providerId: this.eip6963ProviderInfo?.uuid,
      chainId,
    });
  };

  enable = async (): Promise<string[]> => {
    return (await this.request({
      method: "eth_requestAccounts",
    })) as string[];
  };

  net_version = async (): Promise<string> => {
    return (await this.request({
      method: "net_version",
    })) as string;
  };
}

class SolanaProvider extends EventEmitter implements ISolanaProvider {
  isOWallet = true;

  constructor(
    protected readonly injectedOWallet: () => InjectedOWallet,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any
  ) {
    super();
    window.addEventListener("keplr_keystorechange", async () => {
      await this.connect({ onlyIfTrusted: true, reconnect: true });
    });
  }

  protected _requestMethod = async (
    method: keyof ISolanaProvider,
    args: Record<string, any>
  ): Promise<any> => {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method: "solana",
      args: JSONUint8Array.wrap(args),
      solanaProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          const error = result.error;
          reject(new Error(error));
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  };

  async getKey(chainId: string): Promise<Key> {
    return await this._requestMethod("getKey", [chainId]);
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await this._requestMethod("getKeysSettled", [chainIds]);
  }

  publicKey: PublicKey | null;
  protected _isConnected: boolean;

  protected _connectWallet(publicKey: string) {
    this._isConnected = true;
    this.publicKey = new PublicKey(publicKey);
    this.emit("connect", { publicKey });
  }

  connect = async (options?: {
    onlyIfTrusted?: boolean;
    reconnect?: boolean;
  }): Promise<any> => {
    if (this.publicKey && !options?.reconnect) {
      return { publicKey: this.publicKey };
    }
    const { publicKey } = await this._requestMethod("connect", [options]);
    this._connectWallet(publicKey);
    if (options?.onlyIfTrusted) {
      this.emit("accountChanged", new PublicKey(publicKey));
    }
    return { publicKey: new PublicKey(publicKey) };
  };
  disconnect = async (): Promise<void> => {
    this.publicKey = null;
    this.emit("disconnect");
  };

  signTransaction = async <T extends Transaction | VersionedTransaction>(
    tx: T,
    publicKey?: PublicKey,
    connection?: Connection
  ): Promise<T> => {
    if (!this.publicKey) {
      await this.connect();
    }
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    const txStr = encode(tx.serialize({ requireAllSignatures: false }));

    const result = await this._requestMethod("signTransaction", [
      {
        publicKey: publicKey ?? this.publicKey,
        tx: txStr,
        customConnection: connection,
      },
    ]);
    const solanaRes = VersionedTransaction.deserialize(
      decode(result.signedTx)
    ) as T;
    console.warn(solanaRes);
    return solanaRes;
  };

  signIn = async (input?: SolanaSignInInput): Promise<SolanaSignInOutput> => {
    try {
      const response = await this._requestMethod("signIn", [input ?? {}]);
      this._connectWallet(response.publicKey);
      const { OWalletSolanaWalletAccount } = await import(
        "@oraichain/owallet-wallet-standard"
      );
      return {
        account: new OWalletSolanaWalletAccount({
          address: response.publicKey,
          publicKey: new PublicKey(response.publicKey).toBuffer(),
        }),
        signedMessage: decode(response.signedMessage),
        signature: decode(response.signature),
      };
    } catch (e) {
      console.error("Failed to load @oraichain/owallet-wallet-standard:", e);
    }
  };

  signAndSendTransaction = async <T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }> => {
    return this.sendAndConfirm(transaction, [], options);
  };

  sendAndConfirm = async <T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    options?: ConfirmOptions,
    connection?: Connection,
    publicKey?: PublicKey
  ): Promise<{ signature: TransactionSignature }> => {
    if (!this.publicKey) {
      await this.connect();
    }
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    const txStr = encode(tx.serialize({ requireAllSignatures: false }));
    const solanaResponse = await this._requestMethod("signAndSendTransaction", [
      {
        publicKey: publicKey ?? this.publicKey,
        tx: txStr,
        signers,
        options,
        customConnection: connection,
      },
    ]);

    return { signature: solanaResponse };
  };

  signMessage = async (
    msg: Uint8Array,
    publicKey?: PublicKey
  ): Promise<{ signature: Uint8Array }> => {
    if (!this.publicKey) {
      await this.connect();
    }
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    const solanaResponse = await this._requestMethod("signMessage", [
      {
        publicKey: publicKey ?? this.publicKey,
        message: msg,
      },
    ]);
    return { signature: solanaResponse };
  };

  signAllTransactions = async <T extends Transaction | VersionedTransaction>(
    txs: Array<T>,
    publicKey?: PublicKey,
    connection?: Connection
  ): Promise<Array<T>> => {
    if (!this.publicKey) {
      await this.connect();
    }
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    const txsStrs = txs.map((tx) =>
      encode(tx.serialize({ requireAllSignatures: false }))
    );
    const signatures = await this._requestMethod("signAllTransactions", [
      {
        publicKey: publicKey ?? this.publicKey,
        txs: txsStrs,
        customConnection: connection,
      },
    ]);
    const txsRs = signatures.map(({ signedTx }, i) =>
      VersionedTransaction.deserialize(decode(signedTx))
    );
    return txsRs as T[];
  };
}

class OasisProvider extends EventEmitter implements IOasisProvider {
  constructor(
    protected readonly injectedOWallet: () => InjectedOWallet,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any
  ) {
    super();
  }

  protected _requestMethod = async (
    method: keyof IOasisProvider,
    args: Record<string, any>
  ): Promise<any> => {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method: "oasis",
      args: JSONUint8Array.wrap(args),
      oasisProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          const error = result.error;
          reject(new Error(error));
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  };

  async getKey(chainId: string): Promise<Key> {
    return await this._requestMethod("getKey", [chainId]);
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await this._requestMethod("getKeysSettled", [chainIds]);
  }

  async sign(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: TransactionType
  ): Promise<types.SignatureSigned> {
    return await this._requestMethod("sign", [chainId, signer, data, type]);
  }

  async sendTx(
    chainId: string,
    signedTx: types.SignatureSigned
  ): Promise<string> {
    return await this._requestMethod("sendTx", [chainId, signedTx]);
  }
}

class BitcoinProvider extends EventEmitter implements IBitcoinProvider {
  constructor(
    protected readonly injectedOWallet: () => InjectedOWallet,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any
  ) {
    super();
  }

  protected _requestMethod = async (
    method: keyof IBitcoinProvider,
    args: Record<string, any>
  ): Promise<any> => {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method: "bitcoin",
      args: JSONUint8Array.wrap(args),
      bitcoinProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          const error = result.error;
          reject(new Error(error));
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  };

  getKey = async (chainId: string): Promise<Key> => {
    return await this._requestMethod("getKey", [chainId]);
  };

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await this._requestMethod("getKeysSettled", [chainIds]);
  }

  sign = async (
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: TransactionBtcType
  ): Promise<string> => {
    return await this._requestMethod("sign", [chainId, signer, data, type]);
  };
  sendTx = async (chainId: string, signedTx: string): Promise<string> => {
    return await this._requestMethod("sendTx", [chainId, signedTx]);
  };
}

class TronProvider extends EventEmitter implements ITronProvider {
  isOwallet = true;

  constructor(
    protected readonly injectedOWallet: () => InjectedOWallet,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any
  ) {
    super();
  }

  protected _requestMethod = async (
    method: keyof ITronProvider,
    args: Record<string, any>
  ): Promise<any> => {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method: "tron",
      args: JSONUint8Array.wrap(args),
      tronProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          const error = result.error;
          reject(new Error(error));
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  };

  trx = {
    sign: async (transaction: object): Promise<object> => {
      return await this._requestMethod("sign", [ChainIdEVM.TRON, transaction]);
    },
    sendRawTransaction: async (transaction: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    }): Promise<object> => {
      return await this._requestMethod("sendRawTransaction", [
        ChainIdEVM.TRON,
        transaction,
      ]);
    },
  };

  transactionBuilder = {
    triggerSmartContract: async (
      address: string,
      functionSelector: string,
      options: object,
      parameters: any[],
      issuerAddress: string
    ): Promise<any> => {
      if (!address || !functionSelector || !issuerAddress) {
        throw new Error(
          "You need to provide enough data address,functionSelector and issuerAddress"
        );
      }

      const parametersConvert = parameters.map((par) =>
        par.type === "uint256"
          ? { type: "uint256", value: par.value && par.value.toString() }
          : par
      );

      return await this._requestMethod("triggerSmartContract", [
        address,
        functionSelector,
        options,
        parametersConvert,
        issuerAddress,
      ]);
    },
  };

  async getKey(chainId: string): Promise<Key> {
    return await this._requestMethod("getKey", [chainId]);
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await this._requestMethod("getKeysSettled", [chainIds]);
  }

  sendRawTransaction(transaction: {
    raw_data: any;
    raw_data_hex: string;
    txID: string;
    visible?: boolean;
  }): Promise<object> {
    return this._requestMethod("sendRawTransaction", [transaction]);
  }

  triggerSmartContract(
    address: string,
    functionSelector: string,
    options: object,
    parameters: any[],
    issuerAddress: string
  ): Promise<any> {
    return this._requestMethod("triggerSmartContract", [
      address,
      functionSelector,
      options,
      parameters,
      issuerAddress,
    ]);
  }

  async sign(chainId: string, data: object): Promise<any> {
    return await this._requestMethod("sign", [chainId, data]);
  }

  async sendTx(
    chainId: string,
    signedTx: types.SignatureSigned
  ): Promise<string> {
    return await this._requestMethod("sendTx", [chainId, signedTx]);
  }

  async tron_requestAccounts(): Promise<SettledResponses<Key>> {
    const result = await this._requestMethod("tron_requestAccounts", []);
    localStorage.setItem("tronWeb.defaultAddress", JSON.stringify(result));
    return result;
  }

  async request(args: RequestArguments): Promise<any> {
    return await this._requestMethod(
      args.method as keyof ITronProvider,
      args.params ? [args.params, args.chainId] : [[]]
    );
  }
}

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
  DefaultMode,
  SettledResponses,
} from "@owallet/types";
import {
  BACKGROUND_PORT,
  MessageRequester,
  sendSimpleMessage,
} from "@owallet/router";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineSigner,
  StdSignature,
} from "@cosmjs/launchpad";

import {
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
  RequestSignEIP712CosmosTxMsg_v0,
  GetKeySettledMsg,
} from "@owallet/background";
import { SecretUtils } from "@owallet/types";

import { OWalletEnigmaUtils } from "./enigma";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { Buffer } from "buffer";
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
} from "./msgs";
import { ChainIdEnum } from "@owallet/common";
// import { Signer } from '@oasisprotocol/client/dist/signature';

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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {}
      )
        .then(resolve)
        .catch(reject)
        .finally(() => {
          f = true;
        });

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    }) as any;

    // return (await this.requester.sendMessage(BACKGROUND_PORT, msg)).chainInfos;
  }

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission",
        "enable-access",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });

    // await this.requester.sendMessage(BACKGROUND_PORT, new EnableAccessMsg(chainIds));
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    const msg = new SuggestChainInfoMsg(chainInfo);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainInfo,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getKey(chainId: string): Promise<Key> {
    const msg = new GetKeyMsg(chainId);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    const msg = new GetKeySettledMsg(chainIds);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    const msg = new SendTxMsg(chainId, tx, mode);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          tx,
          mode,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          signer,
          signDoc,
          signOptions: deepmerge(this.defaultOptions.sign ?? {}, signOptions),
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          signer,
          eip712,
          signDoc,
          signOptions: deepmerge(this.defaultOptions.sign ?? {}, signOptions),
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
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
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );

    // const response = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    const response = new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          signer,
          signDoc: {
            bodyBytes: signDoc.bodyBytes,
            authInfoBytes: signDoc.authInfoBytes,
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber
              ? signDoc.accountNumber.toString()
              : null,
          },
          signOptions: deepmerge(this.defaultOptions.sign ?? {}, signOptions),
        }
      )
        .then((response) => {
          if (!response) throw Error("Transaction Rejected!");
          console.log("response 1", response);
          const res = {
            signed: {
              bodyBytes: response.signed.bodyBytes,
              authInfoBytes: response.signed.authInfoBytes,
              chainId: response.signed.chainId,
              accountNumber: Long.fromString(response.signed.accountNumber),
            },
            signature: response.signature,
          };

          console.log("res", res);

          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    }) as any;
    if (!response) throw Error("Transaction Rejected!");
    console.log("response 2", response);
    return response;
  }

  async signAndBroadcastTron(chainId: string, data: object): Promise<{}> {
    const msg = new RequestSignTronMsg(chainId, data);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          data,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    let isADR36WithString = false;
    if (typeof data === "string") {
      data = Buffer.from(data).toString("base64");
      isADR36WithString = true;
    } else {
      data = Buffer.from(data).toString("base64");
    }

    const signDoc = {
      chain_id: "",
      account_number: "0",
      sequence: "0",
      fee: {
        gas: "0",
        amount: [],
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer,
            data,
          },
        },
      ],
      memo: "",
    };

    const msg = new RequestSignAminoMsg(chainId, signer, signDoc, {
      isADR36WithString,
    });
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          signer,
          signDoc,
          signOptions: {
            isADR36WithString,
          },
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return (await this.requester.sendMessage(BACKGROUND_PORT, msg)).signature;
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    if (typeof data === "string") {
      data = Buffer.from(data);
    }
    const msg = new RequestVerifyADR36AminoSignDoc(
      chainId,
      signer,
      data,
      signature
    );
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          signer,
          data,
          signature,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(
    //   BACKGROUND_PORT,
    //   new RequestVerifyADR36AminoSignDoc(chainId, signer, data, signature)
    // );
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
    const msg = new SuggestTokenMsg(chainId, contractAddress, viewingKey);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          contractAddress,
          viewingKey,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    const msg = new GetSecret20ViewingKey(chainId, contractAddress);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          contractAddress,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    const msg = new GetPubkeyMsg(chainId);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, new GetPubkeyMsg(chainId));
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    const msg = new GetTxEncryptionKeyMsg(chainId, nonce);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          nonce,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, new GetTxEncryptionKeyMsg(chainId, nonce));
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    const msgs = new ReqeustEncryptMsg(chainId, contractCodeHash, msg);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msgs.route(),
        msgs.type(),
        {
          chainId,
          contractCodeHash,
          msg,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, new ReqeustEncryptMsg(chainId, contractCodeHash, msg));
  }

  async enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    if (!ciphertext || ciphertext.length === 0) {
      return new Uint8Array();
    }
    const msg = new RequestDecryptMsg(chainId, ciphertext, nonce);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          ciphertext,
          nonce,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, new RequestDecryptMsg(chainId, ciphertext, nonce));
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

  // IMPORTANT: protected로 시작하는 method는 InjectedKeplr.startProxy()에서 injected 쪽에서 event system으로도 호출할 수 없도록 막혀있다.
  //            protected로 시작하지 않는 method는 injected keplr에 없어도 event system을 통하면 호출 할 수 있다.
  //            이를 막기 위해서 method 이름을 protected로 시작하게 한다.
  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;
    // 이 provider가 content script 위에서 동작하고 있는지 아닌지 구분해야한다.
    // content script일때만 side panel을 열도록 시도해볼 가치가 있다.
    // 근데 js 자체적으로 api등을 통해서는 이를 알아낼 방법이 없다.
    // extension 상에서 content script에서 keplr provider proxy를 시작하기 전에 window에 밑의 field를 알아서 주입하는 방식으로 처리한다.
    if (
      typeof window !== "undefined" &&
      (window as any).__keplr_content_script === true
    ) {
      isInContentScript = true;
    }

    if (isInContentScript) {
      const isEnabled = await sendSimpleMessage<{
        enabled: boolean;
      }>(
        this.requester,
        BACKGROUND_PORT,
        "side-panel",
        "GetSidePanelEnabledMsg",
        {}
      );

      if (isEnabled.enabled) {
        try {
          // IMPORTANT: "tryOpenSidePanelIfEnabled"는 다른 msg system과 아예 분리되어있고 다르게 동작한다.
          //            router-extension package의 src/router/extension.ts에 있는 주석을 참고할 것.
          return await sendSimpleMessage(
            this.requester,
            BACKGROUND_PORT,
            "router-extension/src/router/extension.ts",
            "tryOpenSidePanelIfEnabled",
            {}
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
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
    if (args.method === "wallet_switchEthereumChain") {
      let tmpChainId = this.initChainId;
      if (args.chainId === "0x1") {
        // 0x1 is not valid chain id, so we set default chain id = 0x01 (eth)
        tmpChainId = ChainIdEnum.Ethereum;
      } else {
        tmpChainId = args.chainId;
      }
      this.initChainId = tmpChainId;
      const msg = new RequestEthereumMsg(tmpChainId, args.method, args.params);
      return new Promise((resolve, reject) => {
        let f = false;
        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          msg.route(),
          msg.type(),
          {
            chainId: args.chainId ?? this.initChainId,
            method: args.method,
            params: args.params,
          }
        )
          .then((res) => {
            resolve(res);
          })
          .catch(reject)
          .finally(() => (f = true));

        setTimeout(() => {
          if (!f) {
            this.protectedTryOpenSidePanelIfEnabled();
          }
        }, 100);
      });
      // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
    } else if (args.method === "eth_sendTransaction") {
      const msg = new RequestSignEthereumMsg(
        args.chainId ?? this.initChainId,
        args.params?.[0]
      );
      // const { rawTxHex } = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      // return rawTxHex;

      const response = new Promise((resolve, reject) => {
        let f = false;
        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          msg.route(),
          msg.type(),
          {
            chainId: args.chainId ?? this.initChainId,
            data: args.params?.[0],
          }
        )
          .then((res) => {
            resolve(res);
          })
          .catch(reject)
          .finally(() => (f = true));

        setTimeout(() => {
          if (!f) {
            this.protectedTryOpenSidePanelIfEnabled();
          }
        }, 100);
      }) as any;
      return response?.rawTxHex ?? "";
    } else if (args.method === "eth_signTypedData_v4") {
      // const msg = new RequestSignEthereumMsg(args.chainId ?? this.initChainId, args.params?.[0]);
      const msg = new RequestSignEthereumTypedDataMsg(
        args.chainId,
        args.params
      );
      // const { result } = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      const response = new Promise((resolve, reject) => {
        let f = false;
        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          msg.route(),
          msg.type(),
          {
            chainId: args.chainId,
            data: args.params,
          }
        )
          .then((res) => {
            resolve(res);
          })
          .catch(reject)
          .finally(() => (f = true));

        setTimeout(() => {
          if (!f) {
            this.protectedTryOpenSidePanelIfEnabled();
          }
        }, 100);
      });
      return response;
    } else {
      const msg = new RequestEthereumMsg(
        args.chainId ?? this.initChainId,
        args.method,
        args.params
      );
      return new Promise((resolve, reject) => {
        let f = false;
        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          msg.route(),
          msg.type(),
          {
            chainId: args.chainId ?? this.initChainId,
            method: args.method,
            params: args.params,
          }
        )
          .then((res) => {
            resolve(res);
          })
          .catch(reject)
          .finally(() => (f = true));

        setTimeout(() => {
          if (!f) {
            this.protectedTryOpenSidePanelIfEnabled();
          }
        }, 100);
      });
      // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }

  async signAndBroadcastTron(chainId: string, data: object): Promise<{}> {
    const msg = new RequestSignTronMsg(chainId, data);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          data,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signAndBroadcastEthereum(
    chainId: string,
    data: object
  ): Promise<{ rawTxHex: string }> {
    const msg = new RequestSignEthereumMsg(chainId, data);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          data,
        }
      )
        .then((res) => {
          console.log("res", res);
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    const msg = new SuggestChainInfoMsg(chainInfo);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainInfo,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signEthereumTypeData(
    chainId: string,
    data: SignEthereumTypedDataObject
  ): Promise<any> {
    try {
      const msg = new RequestSignEthereumTypedDataMsg(chainId, data);
      // const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
      const response = new Promise((resolve, reject) => {
        let f = false;
        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          msg.route(),
          msg.type(),
          {
            chainId,
            data,
          }
        )
          .then((res) => {
            resolve(res);
          })
          .catch(reject)
          .finally(() => (f = true));

        setTimeout(() => {
          if (!f) {
            this.protectedTryOpenSidePanelIfEnabled();
          }
        }, 100);
      });
      return response;
      // return result;
    } catch (error) {
      console.log(error, "error on send message!!!!!!!!!!!!!!!");
    }
  }

  async getPublicKey(chainId: string): Promise<object> {
    const msg = new RequestPublicKeyMsg(chainId);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signDecryptData(chainId: string, data: object): Promise<object> {
    const msg = new RequestSignDecryptDataMsg(chainId, data);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          data,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signReEncryptData(chainId: string, data: object): Promise<object> {
    const msg = new RequestSignReEncryptDataMsg(chainId, data);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          data: data,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  // async sign()
  // async asyncRequest(): Promise<void> {
  //   console.log('');
  // }
  // async getKey(chainId: string): Promise<Key> {
  //   const msg = new GetKeyMsg(chainId);
  //   return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  // }

  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;

    if (
      typeof window !== "undefined" &&
      (window as any).__keplr_content_script === true
    ) {
      isInContentScript = true;
    }

    if (isInContentScript) {
      const isEnabled = await sendSimpleMessage<{
        enabled: boolean;
      }>(
        this.requester,
        BACKGROUND_PORT,
        "side-panel",
        "GetSidePanelEnabledMsg",
        {}
      );

      if (isEnabled.enabled) {
        try {
          return await sendSimpleMessage(
            this.requester,
            BACKGROUND_PORT,
            "router-extension/src/router/extension.ts",
            "tryOpenSidePanelIfEnabled",
            {}
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId: ChainIdEnum.TRON,
          data: transaction,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async sendRawTransaction(transaction: {
    raw_data: any;
    raw_data_hex: string;
    txID: string;
    visible?: boolean;
  }): Promise<object> {
    const msg = new RequestSendRawTransactionMsg(ChainIdEnum.TRON, transaction);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId: ChainIdEnum.TRON,
          data: transaction,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getDefaultAddress(): Promise<object> {
    const msg = new GetDefaultAddressTronMsg(ChainIdEnum.TRON);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId: ChainIdEnum.TRON,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
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
      issuerAddress,
    });

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId: ChainIdEnum.TRON,
          data: {
            address,
            functionSelector,
            options,
            parameters,
            issuerAddress,
          },
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;

    if (
      typeof window !== "undefined" &&
      (window as any).__keplr_content_script === true
    ) {
      isInContentScript = true;
    }

    if (isInContentScript) {
      const isEnabled = await sendSimpleMessage<{
        enabled: boolean;
      }>(
        this.requester,
        BACKGROUND_PORT,
        "side-panel",
        "GetSidePanelEnabledMsg",
        {}
      );

      if (isEnabled.enabled) {
        try {
          return await sendSimpleMessage(
            this.requester,
            BACKGROUND_PORT,
            "router-extension/src/router/extension.ts",
            "tryOpenSidePanelIfEnabled",
            {}
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
}
export class Bitcoin implements IBitcoin {
  constructor(
    public readonly version: string,
    public readonly mode: BitcoinMode,
    protected readonly requester: MessageRequester
  ) {}
  async signAndBroadcast(
    chainId: string,
    data: object
  ): Promise<{ rawTxHex: string }> {
    const msg = new RequestSignBitcoinMsg(chainId, data);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
          data,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
  async getKey(chainId: string): Promise<Key> {
    const msg = new GetKeyMsg(chainId);
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId,
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;

    if (
      typeof window !== "undefined" &&
      (window as any).__keplr_content_script === true
    ) {
      isInContentScript = true;
    }

    if (isInContentScript) {
      const isEnabled = await sendSimpleMessage<{
        enabled: boolean;
      }>(
        this.requester,
        BACKGROUND_PORT,
        "side-panel",
        "GetSidePanelEnabledMsg",
        {}
      );

      if (isEnabled.enabled) {
        try {
          return await sendSimpleMessage(
            this.requester,
            BACKGROUND_PORT,
            "router-extension/src/router/extension.ts",
            "tryOpenSidePanelIfEnabled",
            {}
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
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

  async signOasis(amount: bigint, to: string): Promise<any> {
    const msg = new RequestSignOasisMsg(ChainIdEnum.Oasis, { amount, to });
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        msg.route(),
        msg.type(),
        {
          chainId: ChainIdEnum.Oasis,
          data: {
            amount,
            to,
          },
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
    // return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;

    if (
      typeof window !== "undefined" &&
      (window as any).__keplr_content_script === true
    ) {
      isInContentScript = true;
    }

    if (isInContentScript) {
      const isEnabled = await sendSimpleMessage<{
        enabled: boolean;
      }>(
        this.requester,
        BACKGROUND_PORT,
        "side-panel",
        "GetSidePanelEnabledMsg",
        {}
      );

      if (isEnabled.enabled) {
        try {
          return await sendSimpleMessage(
            this.requester,
            BACKGROUND_PORT,
            "router-extension/src/router/extension.ts",
            "tryOpenSidePanelIfEnabled",
            {}
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
}

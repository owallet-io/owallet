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
          if (
            !ignoreGestureFailure &&
            e.message &&
            e.message.includes("in response to a user gesture")
          ) {
            if (!document.getElementById("__open_owallet_side_panel__")) {
              const sidePanelPing = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "interaction",
                "ping-content-script-tab-has-opened-side-panel",
                {}
              );

              // 유저가 직접 side panel을 이미 열어논 상태일 수 있다.
              // 이 경우는 무시하도록 한다.
              if (sidePanelPing) {
                return;
              }

              const isOWalletLocked = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "keyring",
                "GetIsLockedMsg",
                {}
              );

              // extension에서 `web_accessible_resources`에 추가된 파일은 이렇게 접근이 가능함
              const fontUrl = chrome.runtime.getURL(
                "/assets/Inter-SemiBold.ttf"
              );
              const fontFaceAndKeyFrames = `
                @font-face {
                  font-family: 'SpaceGrotesk-Regular';
                  src: url('${fontUrl}') format('truetype');
                  font-weight: 600;
                  font-style: normal;
                }

                @keyframes slide-left {
                  0% {
                    transform: translateY(0%) translateX(100%);
                  }
                  100% {
                    transform: translateY(0%) translateX(0);
                  }
                }
                    
                @keyframes tada {
                  0% {
                    transform: scale3d(1, 1, 1);
                  }
                  10%, 20% {
                    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
                  }
                  30%, 50%, 70%, 90% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
                  }
                  40%, 60%, 80% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
                  }
                  100% {
                    transform: scale3d(1, 1, 1);
                  }
                }
                  
            `;

              const isLightMode = true;

              const styleElement = document.createElement("style");
              styleElement.appendChild(
                document.createTextNode(fontFaceAndKeyFrames)
              );
              document.head.appendChild(styleElement);

              const button = document.createElement("div");
              button.id = "__open_owallet_side_panel__";
              button.style.boxSizing = "border-box";
              button.style.animation = "slide-left 0.5s forwards";
              button.style.position = "fixed";
              button.style.right = "1.5rem";
              button.style.top = "1.5rem";
              button.style.padding = "1rem 1.75rem 1rem 0.75rem";
              button.style.zIndex = "2147483647";
              button.style.borderRadius = "1rem";
              button.style.display = "flex";
              button.style.alignItems = "center";

              button.style.fontFamily = "SpaceGrotesk-Regular";
              button.style.fontWeight = "600";

              // button.style.cursor = "pointer";
              button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // if (isLightMode) {
              //   button.style.boxShadow =
              //     "0px 0px 15.5px 0px rgba(0, 0, 0, 0.20)";
              // }
              // button.addEventListener("mouseover", () => {
              //   button.style.background = isLightMode ? "#F2F2F6" : "#242428";
              // });
              // button.addEventListener("mouseout", () => {
              //   button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // });

              // const megaphoneWrapper = document.createElement("div");
              // megaphoneWrapper.style.boxSizing = "border-box";
              // megaphoneWrapper.style.display = "flex";
              // megaphoneWrapper.style.position = "absolute";
              // megaphoneWrapper.style.left = "-10px";
              // megaphoneWrapper.style.top = "-10px";
              // megaphoneWrapper.style.padding = "6.5px 6px 5.5px";
              // megaphoneWrapper.style.borderRadius = "255px";
              // megaphoneWrapper.style.background = "#FC8441";
              //
              // const megaphone = document.createElement("img");
              // const megaphoneUrl = chrome.runtime.getURL(
              //   "/assets/megaphone.svg"
              // );
              // megaphone.src = megaphoneUrl;
              // megaphone.style.width = "1.25rem";
              // megaphone.style.height = "1.25rem";
              // megaphone.style.animation = "tada 1s infinite";
              // megaphoneWrapper.appendChild(megaphone);

              const arrowTop = document.createElement("div");
              arrowTop.style.boxSizing = "border-box";
              arrowTop.style.transform = "translateY(-0.65rem)";
              arrowTop.style.marginRight = "0.35rem";
              arrowTop.innerHTML = `
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 29.7522C25.1484 31.0691 16.7109 27.1184 18.6093 18.3391C20.5078 9.55979 25.5703 11.5351 26.414 12.852C27.2578 14.1689 28.3125 22.2898 15.8672 19.2171C5.9109 16.7589 7.15625 6.04811 8 1M8 1L14 8M8 1L1 7.5" stroke="${
                      isLightMode ? "#2C4BE2" : "#72747B"
                    }"/>
                </svg>
              `;

              const owalletLogoWrap = document.createElement("div");
              owalletLogoWrap.style.boxSizing = "border-box";
              owalletLogoWrap.style.position = "relative";
              owalletLogoWrap.style.marginRight = "1rem";
              const owalletLogo = document.createElement("img");
              const owalletLogoUrl =
                "https://play-lh.googleusercontent.com/6bFRl07spL_18Qq_ipWbiI_h22UvXYFRArDPd0W8SSfE0XCHlae8KH-XhVw1OopySnc=s96-rw";
              owalletLogo.src = owalletLogoUrl;
              owalletLogo.style.boxSizing = "border-box";
              owalletLogo.style.width = "3rem";
              owalletLogo.style.height = "3rem";
              owalletLogoWrap.appendChild(owalletLogo);

              const logoClickCursor = document.createElement("img");
              const logoClickCursorUrl = chrome.runtime.getURL(
                "assets/icon-click-cursor.png"
              );
              logoClickCursor.src = logoClickCursorUrl;
              logoClickCursor.style.boxSizing = "border-box";
              logoClickCursor.style.position = "absolute";
              logoClickCursor.style.right = "-0.2rem";
              logoClickCursor.style.bottom = "-0.2rem";
              logoClickCursor.style.aspectRatio = "78/98";
              logoClickCursor.style.height = "1.375rem";
              owalletLogoWrap.appendChild(logoClickCursor);

              const mainText = document.createElement("span");
              mainText.style.boxSizing = "border-box";
              mainText.style.fontSize = "1rem";
              mainText.style.color = isLightMode ? "#020202" : "#FEFEFE";
              mainText.textContent = isOWalletLocked
                ? "Unlock OWallet to proceed"
                : "Open OWallet to approve request(s)";

              button.appendChild(arrowTop);
              button.appendChild(owalletLogoWrap);
              button.appendChild(mainText);
              // button.appendChild(arrowLeftOpenWrapper);

              // 버튼을 추가하기 전에 한 번 더 이미 추가된 버튼이 있는지 확인
              const hasAlready = document.getElementById(
                "__open_owallet_side_panel__"
              );

              if (!hasAlready) {
                let removed = false;
                // 유저가 이 button이 아니라 다른 방식(직접 작업줄의 아이콘을 눌러서 등등)으로 side panel을 열수도 있다.
                // 이 경우를 감지해서 side panel이 열렸으면 자동으로 이 버튼이 삭제되도록 한다.
                const intervalId = setInterval(() => {
                  sendSimpleMessage<boolean>(
                    this.requester,
                    BACKGROUND_PORT,
                    "interaction",
                    "ping-content-script-tab-has-opened-side-panel",
                    {}
                  ).then((sidePanelPing) => {
                    if (sidePanelPing) {
                      clearInterval(intervalId);
                      if (!removed) {
                        button.remove();
                        removed = true;
                      }
                    }
                  });
                }, 300);

                document.body.appendChild(button);
              }
            }
          }
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
          if (
            !ignoreGestureFailure &&
            e.message &&
            e.message.includes("in response to a user gesture")
          ) {
            if (!document.getElementById("__open_owallet_side_panel__")) {
              const sidePanelPing = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "interaction",
                "ping-content-script-tab-has-opened-side-panel",
                {}
              );

              // 유저가 직접 side panel을 이미 열어논 상태일 수 있다.
              // 이 경우는 무시하도록 한다.
              if (sidePanelPing) {
                return;
              }

              const isOWalletLocked = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "keyring",
                "GetIsLockedMsg",
                {}
              );

              // extension에서 `web_accessible_resources`에 추가된 파일은 이렇게 접근이 가능함
              const fontUrl = chrome.runtime.getURL(
                "/assets/Inter-SemiBold.ttf"
              );
              const fontFaceAndKeyFrames = `
                @font-face {
                  font-family: 'SpaceGrotesk-Regular';
                  src: url('${fontUrl}') format('truetype');
                  font-weight: 600;
                  font-style: normal;
                }

                @keyframes slide-left {
                  0% {
                    transform: translateY(0%) translateX(100%);
                  }
                  100% {
                    transform: translateY(0%) translateX(0);
                  }
                }
                    
                @keyframes tada {
                  0% {
                    transform: scale3d(1, 1, 1);
                  }
                  10%, 20% {
                    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
                  }
                  30%, 50%, 70%, 90% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
                  }
                  40%, 60%, 80% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
                  }
                  100% {
                    transform: scale3d(1, 1, 1);
                  }
                }
                  
            `;

              const isLightMode = true;

              // 폰트와 애니메이션을 위한 스타일 요소를 head에 추가
              const styleElement = document.createElement("style");
              styleElement.appendChild(
                document.createTextNode(fontFaceAndKeyFrames)
              );
              document.head.appendChild(styleElement);

              const button = document.createElement("div");
              button.id = "__open_owallet_side_panel__";
              button.style.boxSizing = "border-box";
              button.style.animation = "slide-left 0.5s forwards";
              button.style.position = "fixed";
              button.style.right = "1.5rem";
              button.style.top = "1.5rem";
              button.style.padding = "1rem 1.75rem 1rem 0.75rem";
              button.style.zIndex = "2147483647"; // 페이지 상의 다른 요소보다 버튼이 위에 오도록 함
              button.style.borderRadius = "1rem";
              button.style.display = "flex";
              button.style.alignItems = "center";

              button.style.fontFamily = "SpaceGrotesk-Regular";
              button.style.fontWeight = "600";

              // button.style.cursor = "pointer";
              button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // if (isLightMode) {
              //   button.style.boxShadow =
              //     "0px 0px 15.5px 0px rgba(0, 0, 0, 0.20)";
              // }
              // button.addEventListener("mouseover", () => {
              //   button.style.background = isLightMode ? "#F2F2F6" : "#242428";
              // });
              // button.addEventListener("mouseout", () => {
              //   button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // });

              // const megaphoneWrapper = document.createElement("div");
              // megaphoneWrapper.style.boxSizing = "border-box";
              // megaphoneWrapper.style.display = "flex";
              // megaphoneWrapper.style.position = "absolute";
              // megaphoneWrapper.style.left = "-10px";
              // megaphoneWrapper.style.top = "-10px";
              // megaphoneWrapper.style.padding = "6.5px 6px 5.5px";
              // megaphoneWrapper.style.borderRadius = "255px";
              // megaphoneWrapper.style.background = "#FC8441";
              //
              // const megaphone = document.createElement("img");
              // const megaphoneUrl = chrome.runtime.getURL(
              //   "/assets/megaphone.svg"
              // );
              // megaphone.src = megaphoneUrl;
              // megaphone.style.width = "1.25rem";
              // megaphone.style.height = "1.25rem";
              // megaphone.style.animation = "tada 1s infinite";
              // megaphoneWrapper.appendChild(megaphone);

              const arrowTop = document.createElement("div");
              arrowTop.style.boxSizing = "border-box";
              arrowTop.style.transform = "translateY(-0.65rem)";
              arrowTop.style.marginRight = "0.35rem";
              arrowTop.innerHTML = `
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 29.7522C25.1484 31.0691 16.7109 27.1184 18.6093 18.3391C20.5078 9.55979 25.5703 11.5351 26.414 12.852C27.2578 14.1689 28.3125 22.2898 15.8672 19.2171C5.9109 16.7589 7.15625 6.04811 8 1M8 1L14 8M8 1L1 7.5" stroke="${
                      isLightMode ? "#2C4BE2" : "#72747B"
                    }"/>
                </svg>
              `;

              const owalletLogoWrap = document.createElement("div");
              owalletLogoWrap.style.boxSizing = "border-box";
              owalletLogoWrap.style.position = "relative";
              owalletLogoWrap.style.marginRight = "1rem";
              const owalletLogo = document.createElement("img");
              const owalletLogoUrl =
                "https://play-lh.googleusercontent.com/6bFRl07spL_18Qq_ipWbiI_h22UvXYFRArDPd0W8SSfE0XCHlae8KH-XhVw1OopySnc=s96-rw";
              owalletLogo.src = owalletLogoUrl;
              owalletLogo.style.boxSizing = "border-box";
              owalletLogo.style.width = "3rem";
              owalletLogo.style.height = "3rem";
              owalletLogoWrap.appendChild(owalletLogo);

              const logoClickCursor = document.createElement("img");
              const logoClickCursorUrl = chrome.runtime.getURL(
                "assets/icon-click-cursor.png"
              );
              logoClickCursor.src = logoClickCursorUrl;
              logoClickCursor.style.boxSizing = "border-box";
              logoClickCursor.style.position = "absolute";
              logoClickCursor.style.right = "-0.2rem";
              logoClickCursor.style.bottom = "-0.2rem";
              logoClickCursor.style.aspectRatio = "78/98";
              logoClickCursor.style.height = "1.375rem";
              owalletLogoWrap.appendChild(logoClickCursor);

              const mainText = document.createElement("span");
              mainText.style.boxSizing = "border-box";
              // mainText.style.maxWidth = "9.125rem";
              mainText.style.fontSize = "1rem";
              mainText.style.color = isLightMode ? "#020202" : "#FEFEFE";
              mainText.textContent = isOWalletLocked
                ? "Unlock OWallet to proceed"
                : "Open OWallet to approve request(s)";

              // const arrowLeftOpenWrapper = document.createElement("div");
              // arrowLeftOpenWrapper.style.boxSizing = "border-box";
              // arrowLeftOpenWrapper.style.display = "flex";
              // arrowLeftOpenWrapper.style.alignItems = "center";
              // arrowLeftOpenWrapper.style.padding = "0.5rem 0.75rem";
              //
              // arrowLeftOpenWrapper.innerHTML = `
              // <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              //   <path d="M13 5L6.25 11.75L13 18.5" stroke=${
              //     isLightMode ? "#1633C0" : "#566FEC"
              //   } stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              //   <path d="M19.3333 5L12.5833 11.75L19.3333 18.5" stroke=${
              //     isLightMode ? "#1633C0" : "#566FEC"
              //   }  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              // </svg>`;
              //
              // const openText = document.createElement("span");
              // openText.style.boxSizing = "border-box";
              // openText.style.fontSize = "1rem";
              // openText.style.color = isLightMode ? "#1633C0" : "#566FEC";
              // openText.textContent = "OPEN";
              //
              // arrowLeftOpenWrapper.appendChild(openText);

              // button.appendChild(megaphoneWrapper);
              button.appendChild(arrowTop);
              button.appendChild(owalletLogoWrap);
              button.appendChild(mainText);
              // button.appendChild(arrowLeftOpenWrapper);

              // 버튼을 추가하기 전에 한 번 더 이미 추가된 버튼이 있는지 확인
              const hasAlready = document.getElementById(
                "__open_owallet_side_panel__"
              );

              if (!hasAlready) {
                let removed = false;
                // 유저가 이 button이 아니라 다른 방식(직접 작업줄의 아이콘을 눌러서 등등)으로 side panel을 열수도 있다.
                // 이 경우를 감지해서 side panel이 열렸으면 자동으로 이 버튼이 삭제되도록 한다.
                const intervalId = setInterval(() => {
                  sendSimpleMessage<boolean>(
                    this.requester,
                    BACKGROUND_PORT,
                    "interaction",
                    "ping-content-script-tab-has-opened-side-panel",
                    {}
                  ).then((sidePanelPing) => {
                    if (sidePanelPing) {
                      clearInterval(intervalId);
                      if (!removed) {
                        button.remove();
                        removed = true;
                      }
                    }
                  });
                }, 300);

                document.body.appendChild(button);
              }
            }
          }
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
          if (
            !ignoreGestureFailure &&
            e.message &&
            e.message.includes("in response to a user gesture")
          ) {
            if (!document.getElementById("__open_owallet_side_panel__")) {
              const sidePanelPing = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "interaction",
                "ping-content-script-tab-has-opened-side-panel",
                {}
              );

              if (sidePanelPing) {
                return;
              }

              const isOWalletLocked = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "keyring",
                "GetIsLockedMsg",
                {}
              );

              const fontUrl = chrome.runtime.getURL(
                "/assets/Inter-SemiBold.ttf"
              );
              const fontFaceAndKeyFrames = `
                @font-face {
                  font-family: 'SpaceGrotesk-Regular';
                  src: url('${fontUrl}') format('truetype');
                  font-weight: 600;
                  font-style: normal;
                }

                @keyframes slide-left {
                  0% {
                    transform: translateY(0%) translateX(100%);
                  }
                  100% {
                    transform: translateY(0%) translateX(0);
                  }
                }
                    
                @keyframes tada {
                  0% {
                    transform: scale3d(1, 1, 1);
                  }
                  10%, 20% {
                    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
                  }
                  30%, 50%, 70%, 90% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
                  }
                  40%, 60%, 80% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
                  }
                  100% {
                    transform: scale3d(1, 1, 1);
                  }
                }
                  
            `;

              const isLightMode = true;

              const styleElement = document.createElement("style");
              styleElement.appendChild(
                document.createTextNode(fontFaceAndKeyFrames)
              );
              document.head.appendChild(styleElement);

              const button = document.createElement("div");
              button.id = "__open_owallet_side_panel__";
              button.style.boxSizing = "border-box";
              button.style.animation = "slide-left 0.5s forwards";
              button.style.position = "fixed";
              button.style.right = "1.5rem";
              button.style.top = "1.5rem";
              button.style.padding = "1rem 1.75rem 1rem 0.75rem";
              button.style.zIndex = "2147483647";
              button.style.borderRadius = "1rem";
              button.style.display = "flex";
              button.style.alignItems = "center";

              button.style.fontFamily = "SpaceGrotesk-Regular";
              button.style.fontWeight = "600";

              button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";

              const arrowTop = document.createElement("div");
              arrowTop.style.boxSizing = "border-box";
              arrowTop.style.transform = "translateY(-0.65rem)";
              arrowTop.style.marginRight = "0.35rem";
              arrowTop.innerHTML = `
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 29.7522C25.1484 31.0691 16.7109 27.1184 18.6093 18.3391C20.5078 9.55979 25.5703 11.5351 26.414 12.852C27.2578 14.1689 28.3125 22.2898 15.8672 19.2171C5.9109 16.7589 7.15625 6.04811 8 1M8 1L14 8M8 1L1 7.5" stroke="${
                      isLightMode ? "#2C4BE2" : "#72747B"
                    }"/>
                </svg>
              `;

              const owalletLogoWrap = document.createElement("div");
              owalletLogoWrap.style.boxSizing = "border-box";
              owalletLogoWrap.style.position = "relative";
              owalletLogoWrap.style.marginRight = "1rem";
              const owalletLogo = document.createElement("img");
              const owalletLogoUrl =
                "https://play-lh.googleusercontent.com/6bFRl07spL_18Qq_ipWbiI_h22UvXYFRArDPd0W8SSfE0XCHlae8KH-XhVw1OopySnc=s96-rw";
              owalletLogo.src = owalletLogoUrl;
              owalletLogo.style.boxSizing = "border-box";
              owalletLogo.style.width = "3rem";
              owalletLogo.style.height = "3rem";
              owalletLogoWrap.appendChild(owalletLogo);

              const logoClickCursor = document.createElement("img");
              const logoClickCursorUrl = chrome.runtime.getURL(
                "assets/icon-click-cursor.png"
              );
              logoClickCursor.src = logoClickCursorUrl;
              logoClickCursor.style.boxSizing = "border-box";
              logoClickCursor.style.position = "absolute";
              logoClickCursor.style.right = "-0.2rem";
              logoClickCursor.style.bottom = "-0.2rem";
              logoClickCursor.style.aspectRatio = "78/98";
              logoClickCursor.style.height = "1.375rem";
              owalletLogoWrap.appendChild(logoClickCursor);

              const mainText = document.createElement("span");
              mainText.style.boxSizing = "border-box";
              // mainText.style.maxWidth = "9.125rem";
              mainText.style.fontSize = "1rem";
              mainText.style.color = isLightMode ? "#020202" : "#FEFEFE";
              mainText.textContent = isOWalletLocked
                ? "Unlock OWallet to proceed"
                : "Open OWallet to approve request(s)";

              button.appendChild(arrowTop);
              button.appendChild(owalletLogoWrap);
              button.appendChild(mainText);

              const hasAlready = document.getElementById(
                "__open_owallet_side_panel__"
              );

              if (!hasAlready) {
                let removed = false;

                const intervalId = setInterval(() => {
                  sendSimpleMessage<boolean>(
                    this.requester,
                    BACKGROUND_PORT,
                    "interaction",
                    "ping-content-script-tab-has-opened-side-panel",
                    {}
                  ).then((sidePanelPing) => {
                    if (sidePanelPing) {
                      clearInterval(intervalId);
                      if (!removed) {
                        button.remove();
                        removed = true;
                      }
                    }
                  });
                }, 300);

                document.body.appendChild(button);
              }
            }
          }
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
          if (
            !ignoreGestureFailure &&
            e.message &&
            e.message.includes("in response to a user gesture")
          ) {
            if (!document.getElementById("__open_owallet_side_panel__")) {
              const sidePanelPing = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "interaction",
                "ping-content-script-tab-has-opened-side-panel",
                {}
              );

              if (sidePanelPing) {
                return;
              }

              const isOWalletLocked = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "keyring",
                "GetIsLockedMsg",
                {}
              );

              const fontUrl = chrome.runtime.getURL(
                "/assets/Inter-SemiBold.ttf"
              );
              const fontFaceAndKeyFrames = `
                @font-face {
                  font-family: 'SpaceGrotesk-Regular';
                  src: url('${fontUrl}') format('truetype');
                  font-weight: 600;
                  font-style: normal;
                }

                @keyframes slide-left {
                  0% {
                    transform: translateY(0%) translateX(100%);
                  }
                  100% {
                    transform: translateY(0%) translateX(0);
                  }
                }
                    
                @keyframes tada {
                  0% {
                    transform: scale3d(1, 1, 1);
                  }
                  10%, 20% {
                    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
                  }
                  30%, 50%, 70%, 90% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
                  }
                  40%, 60%, 80% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
                  }
                  100% {
                    transform: scale3d(1, 1, 1);
                  }
                }
                  
            `;

              const isLightMode = true;

              const styleElement = document.createElement("style");
              styleElement.appendChild(
                document.createTextNode(fontFaceAndKeyFrames)
              );
              document.head.appendChild(styleElement);

              const button = document.createElement("div");
              button.id = "__open_owallet_side_panel__";
              button.style.boxSizing = "border-box";
              button.style.animation = "slide-left 0.5s forwards";
              button.style.position = "fixed";
              button.style.right = "1.5rem";
              button.style.top = "1.5rem";
              button.style.padding = "1rem 1.75rem 1rem 0.75rem";
              button.style.zIndex = "2147483647";
              button.style.borderRadius = "1rem";
              button.style.display = "flex";
              button.style.alignItems = "center";

              button.style.fontFamily = "SpaceGrotesk-Regular";
              button.style.fontWeight = "600";

              // button.style.cursor = "pointer";
              button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // if (isLightMode) {
              //   button.style.boxShadow =
              //     "0px 0px 15.5px 0px rgba(0, 0, 0, 0.20)";
              // }
              // button.addEventListener("mouseover", () => {
              //   button.style.background = isLightMode ? "#F2F2F6" : "#242428";
              // });
              // button.addEventListener("mouseout", () => {
              //   button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // });

              // const megaphoneWrapper = document.createElement("div");
              // megaphoneWrapper.style.boxSizing = "border-box";
              // megaphoneWrapper.style.display = "flex";
              // megaphoneWrapper.style.position = "absolute";
              // megaphoneWrapper.style.left = "-10px";
              // megaphoneWrapper.style.top = "-10px";
              // megaphoneWrapper.style.padding = "6.5px 6px 5.5px";
              // megaphoneWrapper.style.borderRadius = "255px";
              // megaphoneWrapper.style.background = "#FC8441";
              //
              // const megaphone = document.createElement("img");
              // const megaphoneUrl = chrome.runtime.getURL(
              //   "/assets/megaphone.svg"
              // );
              // megaphone.src = megaphoneUrl;
              // megaphone.style.width = "1.25rem";
              // megaphone.style.height = "1.25rem";
              // megaphone.style.animation = "tada 1s infinite";
              // megaphoneWrapper.appendChild(megaphone);

              const arrowTop = document.createElement("div");
              arrowTop.style.boxSizing = "border-box";
              arrowTop.style.transform = "translateY(-0.65rem)";
              arrowTop.style.marginRight = "0.35rem";
              arrowTop.innerHTML = `
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 29.7522C25.1484 31.0691 16.7109 27.1184 18.6093 18.3391C20.5078 9.55979 25.5703 11.5351 26.414 12.852C27.2578 14.1689 28.3125 22.2898 15.8672 19.2171C5.9109 16.7589 7.15625 6.04811 8 1M8 1L14 8M8 1L1 7.5" stroke="${
                      isLightMode ? "#2C4BE2" : "#72747B"
                    }"/>
                </svg>
              `;

              const owalletLogoWrap = document.createElement("div");
              owalletLogoWrap.style.boxSizing = "border-box";
              owalletLogoWrap.style.position = "relative";
              owalletLogoWrap.style.marginRight = "1rem";
              const owalletLogo = document.createElement("img");
              const owalletLogoUrl =
                "https://play-lh.googleusercontent.com/6bFRl07spL_18Qq_ipWbiI_h22UvXYFRArDPd0W8SSfE0XCHlae8KH-XhVw1OopySnc=s96-rw";
              owalletLogo.src = owalletLogoUrl;
              owalletLogo.style.boxSizing = "border-box";
              owalletLogo.style.width = "3rem";
              owalletLogo.style.height = "3rem";
              owalletLogoWrap.appendChild(owalletLogo);

              const logoClickCursor = document.createElement("img");
              const logoClickCursorUrl = chrome.runtime.getURL(
                "assets/icon-click-cursor.png"
              );
              logoClickCursor.src = logoClickCursorUrl;
              logoClickCursor.style.boxSizing = "border-box";
              logoClickCursor.style.position = "absolute";
              logoClickCursor.style.right = "-0.2rem";
              logoClickCursor.style.bottom = "-0.2rem";
              logoClickCursor.style.aspectRatio = "78/98";
              logoClickCursor.style.height = "1.375rem";
              owalletLogoWrap.appendChild(logoClickCursor);

              const mainText = document.createElement("span");
              mainText.style.boxSizing = "border-box";
              // mainText.style.maxWidth = "9.125rem";
              mainText.style.fontSize = "1rem";
              mainText.style.color = isLightMode ? "#020202" : "#FEFEFE";
              mainText.textContent = isOWalletLocked
                ? "Unlock OWallet to proceed"
                : "Open OWallet to approve request(s)";

              // const arrowLeftOpenWrapper = document.createElement("div");
              // arrowLeftOpenWrapper.style.boxSizing = "border-box";
              // arrowLeftOpenWrapper.style.display = "flex";
              // arrowLeftOpenWrapper.style.alignItems = "center";
              // arrowLeftOpenWrapper.style.padding = "0.5rem 0.75rem";
              //
              // arrowLeftOpenWrapper.innerHTML = `
              // <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              //   <path d="M13 5L6.25 11.75L13 18.5" stroke=${
              //     isLightMode ? "#1633C0" : "#566FEC"
              //   } stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              //   <path d="M19.3333 5L12.5833 11.75L19.3333 18.5" stroke=${
              //     isLightMode ? "#1633C0" : "#566FEC"
              //   }  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              // </svg>`;
              //
              // const openText = document.createElement("span");
              // openText.style.boxSizing = "border-box";
              // openText.style.fontSize = "1rem";
              // openText.style.color = isLightMode ? "#1633C0" : "#566FEC";
              // openText.textContent = "OPEN";
              //
              // arrowLeftOpenWrapper.appendChild(openText);

              // button.appendChild(megaphoneWrapper);
              button.appendChild(arrowTop);
              button.appendChild(owalletLogoWrap);
              button.appendChild(mainText);
              // button.appendChild(arrowLeftOpenWrapper);

              const hasAlready = document.getElementById(
                "__open_owallet_side_panel__"
              );

              if (!hasAlready) {
                let removed = false;

                const intervalId = setInterval(() => {
                  sendSimpleMessage<boolean>(
                    this.requester,
                    BACKGROUND_PORT,
                    "interaction",
                    "ping-content-script-tab-has-opened-side-panel",
                    {}
                  ).then((sidePanelPing) => {
                    if (sidePanelPing) {
                      clearInterval(intervalId);
                      if (!removed) {
                        button.remove();
                        removed = true;
                      }
                    }
                  });
                }, 300);

                document.body.appendChild(button);
              }
            }
          }
        }
      }
    }
  }
}

//@ts-nocheck
import {
  ChainInfo,
  EthSignType,
  OWallet as IOWallet,
  OWalletIntereactionOptions,
  OWalletMode,
  OWalletSignOptions,
  Key,
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineAminoSigner,
  StdSignature,
  DirectSignResponse,
  OfflineDirectSigner,
  ICNSAdr36Signatures,
  ChainInfoWithoutEndpoints,
  SecretUtils,
  SettledResponses,
  DirectAuxSignResponse,
  IEthereumProvider,
  IOasisProvider,
  IBitcoinProvider,
  ITronProvider,
  TransactionType,
  TransactionBtcType,
  ISolanaProvider,
} from "@owallet/types";
import {
  BACKGROUND_PORT,
  MessageRequester,
  sendSimpleMessage,
} from "@owallet/router";

import { OWalletEnigmaUtils } from "./enigma";

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { Buffer } from "buffer/";
import { OWalletCoreTypes } from "./core-types";
import EventEmitter from "events";
import { ChainIdEVM, TW } from "@owallet/types";
import { types } from "@oasisprotocol/client";
import {
  Commitment,
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

import { encode, decode } from "bs58";
import { SolanaSignInInput } from "@solana/wallet-standard-features";
import {
  CHAIN_ID_SOL,
  confirmTransaction,
  deserializeTransaction,
  isVersionedTransaction,
  RPC_SOL,
} from "./utils";

export class OWallet implements IOWallet, OWalletCoreTypes {
  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: OWalletIntereactionOptions = {};

  constructor(
    public readonly version: string,
    public readonly mode: OWalletMode,
    protected readonly requester: MessageRequester
  ) {}

  async ping(): Promise<void> {
    await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "chains",
      "owallet-ping",
      {}
    );
  }

  enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
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
  }

  async isEnabled(chainIds: string | string[]): Promise<boolean> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "permission-interactive",
      "is-enabled-access",
      {
        chainIds,
      }
    );
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "disable-access",
        {
          chainIds: chainIds ?? [],
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
  }

  async experimentalSuggestChain(
    chainInfo: ChainInfo & {
      // Legacy
      gasPriceStep?: {
        readonly low: number;
        readonly average: number;
        readonly high: number;
      };
    }
  ): Promise<void> {
    if (chainInfo.hideInUI) {
      throw new Error("hideInUI is not allowed");
    }

    if (chainInfo.gasPriceStep) {
      // Gas price step in ChainInfo is legacy format.
      // Try to change the recent format for backward-compatibility.
      const gasPriceStep = { ...chainInfo.gasPriceStep };
      for (const feeCurrency of chainInfo.feeCurrencies) {
        if (!feeCurrency.gasPriceStep) {
          (
            feeCurrency as {
              gasPriceStep?: {
                readonly low: number;
                readonly average: number;
                readonly high: number;
              };
            }
          ).gasPriceStep = gasPriceStep;
        }
      }
      delete chainInfo.gasPriceStep;

      console.warn(
        "The `gasPriceStep` field of the `ChainInfo` has been moved under `feeCurrencies`. This is automatically handled as of right now, but the upcoming update would potentially cause errors."
      );
    }

    if ((chainInfo as any).coinType) {
      console.warn(
        "The `coinType` field of the `ChainInfo` is removed. This is automatically handled as of right now, but the upcoming update would potentially cause errors."
      );
      delete (chainInfo as any).coinType;
    }

    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "need-suggest-chain-info-interaction",
        {
          chainInfo,
        }
      ).then((needInteraction) => {
        if (!needInteraction) {
          f = true;
        }

        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          "chains",
          "suggest-chain-info",
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
    });
  }

  async getKey(chainId: string): Promise<Key> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "get-cosmos-key",
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
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "get-cosmos-keys-settled",
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
  }

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "get-chain-infos-without-endpoints",
        {}
      )
        .then((r) => resolve(r.chainInfos))
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "get-chain-info-without-endpoints",
        {
          chainId,
        }
      )
        .then((r) => resolve(r.chainInfo))
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    await this.enable(chainId);

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "background-tx",
      "send-tx-to-background",
      {
        chainId,
        tx,
        mode,
      }
    );
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: OWalletSignOptions = {}
  ): Promise<AminoSignResponse> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "request-cosmos-sign-amino",
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "request-cosmos-sign-direct",
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
        .then((r) =>
          resolve({
            signed: {
              bodyBytes: r.signed.bodyBytes,
              authInfoBytes: r.signed.authInfoBytes,
              chainId: r.signed.chainId,
              accountNumber: Long.fromString(r.signed.accountNumber),
            },
            signature: r.signature,
          })
        )
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "request-cosmos-sign-direct-aux",
        {
          chainId,
          signer,
          signDoc: {
            bodyBytes: signDoc.bodyBytes,
            publicKey: signDoc.publicKey,
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber
              ? signDoc.accountNumber.toString()
              : null,
            sequence: signDoc.sequence ? signDoc.sequence.toString() : null,
          },
          signOptions: deepmerge(
            {
              preferNoSetMemo: this.defaultOptions.sign?.preferNoSetMemo,
            },
            signOptions
          ),
        }
      )
        .then((r) =>
          resolve({
            signed: {
              bodyBytes: r.signed.bodyBytes,
              publicKey: r.signed.publicKey,
              chainId: r.signed.chainId,
              accountNumber: Long.fromString(r.signed.accountNumber),
              sequence: Long.fromString(r.signed.sequence),
            },
            signature: r.signature,
          })
        )
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "request-cosmos-sign-amino-adr-36",
        {
          chainId,
          signer,
          data: typeof data === "string" ? Buffer.from(data) : data,
          signOptions: {
            isADR36WithString: typeof data === "string",
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

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "verify-cosmos-sign-amino-adr-36",
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
  }

  async sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string> {
    await this.enable(chainId);

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "background-tx-ethereum",
      "send-ethereum-tx-to-background",
      {
        chainId,
        tx,
      }
    );
  }

  async signEthereum(
    chainId: string,
    signer: string,
    message: string | Uint8Array,
    signType: EthSignType
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-ethereum",
        "request-sign-ethereum",
        {
          chainId,
          signer,
          message: typeof message === "string" ? Buffer.from(message) : message,
          signType,
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
  }

  async signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "request-icns-adr-36-signatures-v2",
        {
          chainId,
          contractAddress,
          owner,
          username,
          addressChainIds,
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "token-cw20",
        "SuggestTokenMsg",
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
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "token-cw20",
        "get-secret20-viewing-key",
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
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "get-pubkey-msg",
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
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "get-tx-encryption-key-msg",
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
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "request-encrypt-msg",
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
  }

  async enigmaDecrypt(
    chainId: string,
    cipherText: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    if (!cipherText || cipherText.length === 0) {
      return new Uint8Array();
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "request-decrypt-msg",
        {
          chainId,
          cipherText,
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "request-sign-eip-712-cosmos-tx-v0",
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
  }

  async __core__getAnalyticsId(): Promise<string> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "analytics",
      "get-analytics-id",
      {}
    );
  }

  async changeKeyRingName({
    defaultName,
    editable = true,
  }: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-v2",
        "change-keyring-name-interactive",
        {
          defaultName,
          editable,
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
  }

  async __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "PrivilegeCosmosSignAminoWithdrawRewards",
      {
        chainId,
        signer,
        signDoc,
      }
    );
  }

  async __core__privilageSignAminoDelegate(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "PrivilegeCosmosSignAminoDelegate",
      {
        chainId,
        signer,
        signDoc,
      }
    );
  }

  async suggestERC20(chainId: string, contractAddress: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "token-erc20",
        "SuggestERC20TokenMsg",
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
  }

  async __core__webpageClosed(): Promise<void> {
    await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "interaction",
      "injected-webpage-closed",
      {}
    );
  }

  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;

    if (
      typeof window !== "undefined" &&
      (window as any).__owallet_content_script === true
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

              const owalletThemeOption = await sendSimpleMessage<
                "light" | "dark" | "auto"
              >(
                this.requester,
                BACKGROUND_PORT,
                "settings",
                "GetThemeOptionMsg",
                {}
              );

              const fontUrl = chrome.runtime.getURL(
                "/assets/SpaceGrotesk-SemiBold.ttf"
              );
              const fontFaceAndKeyFrames = `
                @font-face {
                  font-family: 'SpaceGrotesk-SemiBold';
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

              const isLightMode =
                owalletThemeOption === "auto"
                  ? !window.matchMedia("(prefers-color-scheme: dark)").matches
                  : owalletThemeOption === "light";

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
              button.style.padding = "0rem 1.75rem 0rem 0.75rem";
              button.style.zIndex = "2147483647";
              button.style.borderRadius = "1rem";
              button.style.display = "flex";
              button.style.alignItems = "center";

              button.style.fontFamily = "SpaceGrotesk-SemiBold";
              button.style.fontWeight = "600";

              button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";

              // const arrowTop = document.createElement("div");
              // arrowTop.style.boxSizing = "border-box";
              // arrowTop.style.transform = "translateY(-0.65rem)";
              // arrowTop.style.marginRight = "0.35rem";
              // arrowTop.innerHTML = `
              //   <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              //       <path d="M30 29.7522C25.1484 31.0691 16.7109 27.1184 18.6093 18.3391C20.5078 9.55979 25.5703 11.5351 26.414 12.852C27.2578 14.1689 28.3125 22.2898 15.8672 19.2171C5.9109 16.7589 7.15625 6.04811 8 1M8 1L14 8M8 1L1 7.5" stroke="${
              //         isLightMode ? "#2C4BE2" : "#72747B"
              //       }"/>
              //   </svg>
              // `;

              const owalletLogoWrap = document.createElement("div");
              owalletLogoWrap.style.boxSizing = "border-box";
              owalletLogoWrap.style.position = "relative";
              owalletLogoWrap.style.paddingTop = "10px";
              const owalletLogo = document.createElement("img");
              const owalletLogoUrl = "https://owallet.io/svg/logo_owallet.svg";
              owalletLogo.src = owalletLogoUrl;
              owalletLogo.style.boxSizing = "border-box";
              owalletLogoWrap.appendChild(owalletLogo);

              const mainText = document.createElement("span");
              mainText.style.boxSizing = "border-box";
              mainText.style.fontSize = "1rem";
              mainText.style.color = isLightMode ? "#020202" : "#FEFEFE";
              mainText.textContent = isOWalletLocked
                ? "Unlock OWallet to proceed"
                : "Open OWallet to approve request";

              // button.appendChild(arrowTop);
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

  public readonly ethereum = new EthereumProvider(this, this.requester);
  public readonly oasis = new OasisProvider(this, this.requester);
  public readonly tron = new TronProvider(this, this.requester);
  public readonly bitcoin = new BitcoinProvider(this, this.requester);
  public readonly solana = new SolanaProvider(this, this.requester);
}

class EthereumProvider extends EventEmitter implements IEthereumProvider {
  chainId: string | null = null;
  selectedAddress: string | null = null;
  networkVersion: string | null = null;

  isOWallet: boolean = true;
  isMetaMask: boolean = true;

  constructor(
    protected readonly owallet: OWallet,
    protected readonly requester: MessageRequester
  ) {
    super();
  }

  protected async protectedEnableAccess(): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access-for-evm",
        {}
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  isConnected(): boolean {
    return true;
  }

  async request<T = unknown>({
    method,
    params,
    providerId,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    providerId?: string;
    chainId?: string;
  }): Promise<T> {
    if (typeof method !== "string") {
      throw new Error("Invalid paramater: `method` must be a string");
    }

    if (method !== "owallet_initProviderState") {
      await this.protectedEnableAccess();
    }

    if (method === "wallet_switchEthereumChain" && !isNaN(Number(chainId))) {
      if (chainId.startsWith("0x")) {
        this.chainId = `eip155:${parseInt(chainId, 16)}`;
      } else {
        this.chainId = chainId;
      }
    }
    let currentChainId = chainId ?? this.chainId;

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-ethereum",
        "request-json-rpc-to-evm",
        {
          method,
          params,
          providerId,
          chainId: currentChainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f && sidePanelOpenNeededJSONRPCMethods.includes(method)) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  /**
   * Legacy methods
   */

  async enable(): Promise<string[]> {
    return await this.request({ method: "eth_requestAccounts" });
  }

  async net_version(): Promise<string> {
    return await this.request({ method: "net_version" });
  }
}

class OasisProvider extends EventEmitter implements IOasisProvider {
  constructor(
    protected readonly owallet: OWallet,
    protected readonly requester: MessageRequester
  ) {
    super();
  }

  protected async protectedEnableAccess(): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access-for-evm",
        {}
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async getKey(chainId: string): Promise<Key> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-oasis",
        "get-oasis-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      // setTimeout(() => {
      //   if (!f) {
      //     this.protectedTryOpenSidePanelIfEnabled();
      //   }
      // }, 100);
    });
  }

  async sendTx(
    chainId: string,
    signedTx: types.SignatureSigned
  ): Promise<string> {
    await this.owallet.enable(chainId);

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "background-tx-oasis",
      "send-oasis-tx-to-background",
      {
        chainId,
        signedTx,
      }
    );
  }

  async sign(
    chainId: string,
    signer: string,
    message: string | Uint8Array,
    signType: TransactionType
  ): Promise<types.SignatureSigned> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-oasis",
        "request-sign-oasis",
        {
          chainId,
          signer,
          message: typeof message === "string" ? Buffer.from(message) : message,
          signType,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-oasis",
        "get-oasis-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }
}

class BitcoinProvider extends EventEmitter implements IBitcoinProvider {
  constructor(
    protected readonly owallet: OWallet,
    protected readonly requester: MessageRequester
  ) {
    super();
  }

  async getKey(chainId: string): Promise<Key> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "get-btc-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "get-btc-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async sendTx(chainId: string, signedTx: string): Promise<string> {
    await this.owallet.enable(chainId);

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "background-tx-btc",
      "send-btc-tx-to-background",
      {
        chainId,
        signedTx,
      }
    );
  }

  async sign(
    chainId: string,
    signer: string,
    message: string | Uint8Array,
    signType: TransactionBtcType
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-btc",
        "request-sign-btc",
        {
          chainId,
          signer,
          message: typeof message === "string" ? Buffer.from(message) : message,
          signType,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }
}

class SolanaProvider extends EventEmitter implements ISolanaProvider {
  private connection: Connection;
  publicKey: PublicKey | null;

  constructor(
    protected readonly owallet: OWallet,
    protected readonly requester: MessageRequester
  ) {
    super();

    this.connection = new Connection(RPC_SOL, "confirmed");
  }

  async getKey(chainId: string): Promise<Key> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-svm",
        "get-svm-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-svm",
        "get-svm-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async connect(options?: {
    onlyIfTrusted?: boolean;
    reconnect?: boolean;
  }): Promise<{ publicKey: PublicKey }> {
    const chainId = CHAIN_ID_SOL;
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-svm",
        "connect-svm",
        {
          chainId,
          silent: options?.onlyIfTrusted,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  public async signAllTransactions<
    T extends Transaction | VersionedTransaction
  >(request: {
    publicKey: PublicKey;
    txs: T[];
    signers?: Signer[];
    customConnection?: Connection;
    commitment?: Commitment;
  }): Promise<T[]> {
    const publicKey = request.publicKey;

    const txStrs = await Promise.all(
      request.txs.map(async (tx) => {
        const txDecoded = deserializeTransaction(tx);
        const preparedTx = await this.prepareTransaction({
          publicKey: request.publicKey,
          tx: txDecoded,
          signers: request.signers,
          customConnection: request.customConnection,
          commitment: request.commitment,
        });
        return encode(preparedTx.serialize({ requireAllSignatures: false }));
      })
    );

    const signatures = await new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-svm",
        "request-sign-all-transaction-svm",
        {
          chainId: CHAIN_ID_SOL,
          signer: publicKey,
          txs: txStrs,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });

    if (!signatures) {
      throw Error("Transaction Rejected");
    }

    return signatures;
    // const signatures = await sendSimpleMessage(
    //   this.requester,
    //   BACKGROUND_PORT,
    //   "keyring-svm",
    //   "request-sign-all-transaction-svm",
    //   {
    //     chainId: CHAIN_ID_SOL,
    //     signer: publicKey,
    //     txs: txStrs,
    //   }
    // );
    // if (!signatures) {
    //   throw Error("Transaction Rejected");
    // }

    // return signatures;
  }

  public async signAndSendTransaction<
    T extends Transaction | VersionedTransaction
  >(request: {
    publicKey: PublicKey;
    tx: T;
    customConnection?: Connection;
    signers?: Signer[];
    options?: SendOptions | ConfirmOptions;
  }): Promise<string> {
    const options = request.options;
    const commitment =
      options && "commitment" in options ? options.commitment : undefined;
    const finality = commitment === "finalized" ? "finalized" : "confirmed";

    const signature = await this.send({
      ...request,
      options: {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
        ...request.options,
      },
    });
    await confirmTransaction(this.connection, signature, finality);
    return signature;
  }

  public async send<T extends Transaction | VersionedTransaction>(request: {
    publicKey: PublicKey;
    tx: T;
    customConnection?: Connection;
    signers?: Signer[];
    options?: SendOptions | ConfirmOptions;
  }): Promise<string> {
    // const tx = request.tx;
    const tx =
      typeof request.tx === "string"
        ? deserializeTransaction(request.tx)
        : request.tx;
    const signers = request.signers;
    const publicKey = request.publicKey;
    const options = request.options;
    const connection = request.customConnection ?? this.connection;
    const commitment =
      options && "commitment" in options ? options.commitment : undefined;

    const result = await this.signTransaction({
      tx,
      signers,
      publicKey,
      customConnection: request.customConnection,
      commitment,
    });
    const signedTx = VersionedTransaction.deserialize(
      //@ts-ignore
      decode(result.signedTx)
    ) as T;
    const serializedTransaction = signedTx.serialize();
    return connection.sendRawTransaction(serializedTransaction, options);
  }

  public async signIn(input?: SolanaSignInInput): Promise<{
    signedMessage: string;
    signature: string;
    publicKey: string;
    connectionUrl: string;
  }> {
    if (!input) throw Error("Transaction Rejected");
    const result = await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-svm",
      "request-sign-in-svm",
      {
        chainId: CHAIN_ID_SOL,
        inputs: input,
      }
    );
    if (!result) {
      throw Error("Transaction Rejected");
    }
    return result;
  }

  async disconnect(): Promise<void> {
    //TODO: need handle
    return;
  }

  public async signTransaction<
    T extends Transaction | VersionedTransaction
  >(request: {
    publicKey: PublicKey;
    tx: T;
    signers?: Signer[];
    customConnection?: Connection;
    commitment?: Commitment;
  }): Promise<T> {
    const publicKey = request.publicKey;
    console.log(request, "tx core");
    const tx =
      typeof request.tx === "string"
        ? deserializeTransaction(request.tx)
        : request.tx;
    const preparedTx = await this.prepareTransaction({
      ...request,
      tx,
    });
    const txStr = encode(preparedTx.serialize({ requireAllSignatures: false }));

    const result = await new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-svm",
        "request-sign-transaction-svm",
        {
          chainId: CHAIN_ID_SOL,
          signer: publicKey,
          tx: txStr,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });

    // const result = await sendSimpleMessage(
    //   this.requester,
    //   BACKGROUND_PORT,
    //   "keyring-svm",
    //   "request-sign-transaction-svm",
    //   {
    //     chainId: CHAIN_ID_SOL,
    //     signer: publicKey,
    //     tx: txStr,
    //   }
    // );
    if (!result?.signature || !result?.signedTx) {
      throw Error("Transaction Rejected");
    }
    return result;
  }

  public async signMessage(request: {
    publicKey: PublicKey;
    message: Uint8Array;
  }): Promise<Uint8Array> {
    // const svmResponse = await sendSimpleMessage(
    //   this.requester,
    //   BACKGROUND_PORT,
    //   "keyring-svm",
    //   "request-sign-message-svm",
    //   {
    //     chainId: CHAIN_ID_SOL,
    //     signer: request.publicKey,
    //     message: encode(request.message),
    //   }
    // );
    // return decode(svmResponse.signedMessage);

    const svmResponse = await new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-svm",
        "request-sign-message-svm",
        {
          chainId: CHAIN_ID_SOL,
          signer: request.publicKey,
          message: encode(request.message),
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });

    return decode(svmResponse.signedMessage);
  }

  private async prepareTransaction<
    T extends Transaction | VersionedTransaction
  >(request: {
    publicKey: PublicKey;
    tx: T;
    signers?: Signer[];
    commitment?: Commitment;
    customConnection?: Connection;
  }): Promise<T> {
    const publicKey = request.publicKey;
    const signers = request.signers;
    const connection = request.customConnection ?? this.connection;
    const commitment = request.commitment;
    const tx = request.tx;
    if (!isVersionedTransaction(tx)) {
      if (signers) {
        signers.forEach((s: Signer) => {
          tx.partialSign(s);
        });
      }
      if (!tx.feePayer) {
        tx.feePayer = publicKey;
      }
      if (!tx.recentBlockhash) {
        const { blockhash } = await connection.getLatestBlockhash(commitment);
        tx.recentBlockhash = blockhash;
      }
    } else {
      if (signers) {
        tx.sign(signers);
      }
    }
    return tx;
  }
}

class TronProvider extends EventEmitter implements ITronProvider {
  constructor(
    protected readonly owallet: OWallet,
    protected readonly requester: MessageRequester
  ) {
    super();
  }

  async getKey(chainId: string): Promise<Key> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "get-trx-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "get-trx-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async tron_requestAccounts(): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "request-get-tron-address",
        {}
      )
        .then((res) => {
          console.log("res", res);

          resolve(res);
        })
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async sendTx(chainId: string, signedTx: unknown): Promise<string> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "background-tx-tron",
        "send-tron-tx-to-background",
        {
          chainId,
          signedTx,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async sign(chainId: string, data: object | string): Promise<any> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "request-sign-tron",
        {
          chainId,
          data: JSON.stringify(data),
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async sendRawTransaction(transaction): Promise<any> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "request-send-raw-transaction",
        {
          data: JSON.stringify(transaction),
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async triggerSmartContract(
    address: any,
    functionSelector: string,
    options: object,
    parameters: any[],
    issuerAddress: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "trigger-smart-contract",
        {
          chainId: ChainIdEVM.TRON,
          data: JSON.stringify({
            address,
            functionSelector,
            parameters,
            issuerAddress,
            options,
          }),
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  protected async protectedEnableAccess(): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access-for-evm",
        {}
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }

  async request<T = unknown>({
    method,
    params,
    providerId,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    providerId?: string;
    chainId?: string;
  }): Promise<T> {
    if (typeof method !== "string") {
      throw new Error("Invalid paramater: `method` must be a string");
    }

    if (method !== "owallet_initProviderState") {
      await this.protectedEnableAccess();
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-tron",
        "request-json-rpc-to-evm",
        {
          method,
          params,
          providerId,
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f && sidePanelOpenNeededJSONRPCMethods.includes(method)) {
          this.owallet.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
    });
  }
}

const sidePanelOpenNeededJSONRPCMethods = [
  "eth_sendTransaction",
  "personal_sign",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "wallet_addEthereumChain",
  "wallet_switchEthereumChain",
  "wallet_watchAsset",
];

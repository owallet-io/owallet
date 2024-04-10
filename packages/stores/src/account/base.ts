import { StdFeeEthereum } from "./../common/types";

import "reflect-metadata";
import {
  action,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import {
  AppCurrency,
  OWallet,
  OWalletSignOptions,
  Ethereum,
  TronWeb,
  Bitcoin,
  AminoSignResponse,
  AddressBtcType,
} from "@owallet/types";
import { DeepReadonly, Mutable } from "utility-types";
import bech32, { fromWords } from "bech32";
import { ChainGetter } from "../common";
import { QueriesSetBase, QueriesStore } from "../query";
import {
  DenomHelper,
  toGenerator,
  fetchAdapter,
  EVMOS_NETWORKS,
  TxRestCosmosClient,
  OwalletEvent,
  sortObjectByKey,
  escapeHTML,
  findLedgerAddress,
  ChainIdEnum,
  isBase58,
  getBase58Address,
  getEvmAddress,
  TxRestTronClient,
} from "@owallet/common";
import Web3 from "web3";
import ERC20_ABI from "human-standard-token-abi";
import {
  BroadcastMode,
  makeSignDoc,
  makeStdTx,
  Msg,
  StdFee,
  StdTx,
} from "@cosmjs/launchpad";
import { StdSignDoc } from "@owallet/types";
import {
  BaseAccount,
  EthermintChainIdHelper,
  TendermintTxTracer,
} from "@owallet/cosmos";
import Axios, { AxiosInstance } from "axios";
import { Buffer } from "buffer";
import Long from "long";
import { Any } from "@owallet/proto-types/google/protobuf/any";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "@owallet/proto-types/cosmos/tx/v1beta1/tx";
import { ExtensionOptionsWeb3Tx } from "@owallet/proto-types/ethermint/types/v1/web3";
import { SignMode } from "@owallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "@owallet/proto-types/cosmos/crypto/secp256k1/keys";

import { ETH } from "@hanchon/ethermint-address-converter";
// can use this request from mobile ?
import { request } from "@owallet/background";
import { AddressesLedger } from "@owallet/types";
import { wallet } from "@owallet/bitcoin";
import TronWebProvider from "tronweb";
import { getEip712TypedDataBasedOnChainId } from "./utils";

export interface Coin {
  readonly denom: string;
  readonly amount: string;
}

export enum WalletStatus {
  NotInit = "NotInit",
  Loading = "Loading",
  Loaded = "Loaded",
  NotExist = "NotExist",
  Rejected = "Rejected",
}

export type ExtraOptionSendToken = {
  type: string;
  from?: string;
  contract_addr: string;
  token_id?: string;
  recipient?: string;
  amount?: string;
  confirmedBalance?: number;
  utxos?: any[];
  blacklistedUtxos?: any[];
  feeRate?: number;
};

export interface MsgOpt {
  readonly type: string;
  readonly gas: number;
}

/*
  If the chain has "no-legacy-stdTx" feature, we should send the tx based on protobuf.
  Expectedly, the sign doc should be formed as animo-json regardless of the tx type (animo or proto).
*/
export type AminoMsgsOrWithProtoMsgs = {
  aminoMsgs?: Msg[];
  protoMsgs?: Any[] | undefined;

  // Add rlp types data if you need to support ethermint with ledger.
  // Must include `MsgValue`.
  rlpTypes?: Record<
    string,
    Array<{
      name: string;
      type: string;
    }>
  >;
};

export interface AccountSetOpts<MsgOpts> {
  readonly prefetching: boolean;
  readonly suggestChain: boolean;
  readonly suggestChainFn?: (
    owallet: OWallet,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ) => Promise<void>;
  readonly autoInit: boolean;
  readonly preTxEvents?: {
    onBroadcastFailed?: (e?: Error) => void;
    onBroadcasted?: (txHash: Uint8Array) => void;
    onFulfill?: (tx: any) => void;
  };
  readonly getOWallet: () => Promise<OWallet | undefined>;
  readonly getBitcoin: () => Promise<Bitcoin | undefined>;
  readonly getEthereum: () => Promise<Ethereum | undefined>;
  readonly getTronWeb: () => Promise<TronWeb | undefined>;
  readonly msgOpts: MsgOpts;
  readonly wsObject?: new (
    url: string,
    protocols?: string | string[]
  ) => WebSocket;
}

export class AccountSetBase<MsgOpts, Queries> {
  @observable
  protected _walletVersion: string | undefined = undefined;

  @observable
  protected _walletStatus: WalletStatus = WalletStatus.NotInit;

  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";
  @observable
  protected _legacyAddress: string = "";
  @observable
  protected _addressType: AddressBtcType = AddressBtcType.Bech32;
  @observable
  protected _address: Uint8Array = null;

  @observable
  protected _isNanoLedger: boolean = false;

  @observable
  protected _isSendingMsg: string | boolean = false;

  public broadcastMode: "sync" | "async" | "block" = "sync";

  protected pubKey: Uint8Array;

  protected hasInited = false;

  protected sendTokenFns: ((
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: ExtraOptionSendToken
  ) => Promise<boolean>)[] = [];

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<QueriesSetBase & Queries>,
    protected readonly opts: AccountSetOpts<MsgOpts>
  ) {
    makeObservable(this);

    this.pubKey = new Uint8Array();

    if (opts.autoInit) {
      this.init();
    }
  }

  getOWallet(): Promise<OWallet | undefined> {
    return this.opts.getOWallet();
  }

  getEthereum(): Promise<Ethereum | undefined> {
    return this.opts.getEthereum();
  }

  getBitcoin(): Promise<Bitcoin | undefined> {
    return this.opts.getBitcoin();
  }

  getTronWeb(): Promise<TronWeb | undefined> {
    return this.opts.getTronWeb();
  }

  get msgOpts(): MsgOpts {
    return this.opts.msgOpts;
  }

  registerSendTokenFn(
    fn: (
      amount: string,
      currency: AppCurrency,
      recipient: string,
      memo: string,
      stdFee: Partial<StdFee | StdFeeEthereum>,
      signOptions?: OWalletSignOptions,
      onTxEvents?:
        | ((tx: any) => void)
        | {
            onBroadcasted?: (txHash: Uint8Array) => void;
            onFulfill?: (tx: any) => void;
          }
    ) => Promise<boolean>
  ) {
    this.sendTokenFns.push(fn);
  }

  protected async enable(owallet: OWallet, chainId: string): Promise<void> {
    const chainInfo = this.chainGetter.getChain(chainId);

    if (this.opts.suggestChain) {
      if (this.opts.suggestChainFn) {
        await this.opts.suggestChainFn(owallet, chainInfo);
      } else {
        await this.suggestChain(owallet, chainInfo);
      }
    }
    await owallet.enable(chainId);
  }

  protected async suggestChain(
    owallet: OWallet,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ): Promise<void> {
    await owallet.experimentalSuggestChain(chainInfo.raw);
  }

  protected async evmSuggestChain(
    ethereum: Ethereum,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ): Promise<void> {
    await ethereum.experimentalSuggestChain(chainInfo.raw);
  }

  private readonly handleInit = () => this.init();

  @flow
  public *init() {
    // If wallet status is not exist, there is no need to try to init because it always fails.

    if (this.walletStatus === WalletStatus.NotExist) {
      return;
    }

    // If the store has never been initialized, add the event listener.
    if (!this.hasInited) {
      // If key store in the owallet extension is changed, this event will be dispatched.
      this.eventListener.addEventListener(
        "keplr_keystorechange",
        this.handleInit
      );
    }
    this.hasInited = true;

    // Set wallet status as loading whenever try to init.
    this._walletStatus = WalletStatus.Loading;

    const owallet = yield* toGenerator(this.getOWallet());
    if (!owallet) {
      this._walletStatus = WalletStatus.NotExist;
      return;
    }

    this._walletVersion = owallet.version;

    try {
      yield this.enable(owallet, this.chainId);
    } catch (e) {
      console.log(e);
      this._walletStatus = WalletStatus.Rejected;
      return;
    }

    const key = yield* toGenerator(owallet.getKey(this.chainId));

    this._bech32Address = key.bech32Address;
    this._address = key.address;
    this._isNanoLedger = key.isNanoLedger;
    this._name = key.name;
    this.pubKey = key.pubKey;
    this._legacyAddress = key.legacyAddress;
    // Set the wallet status as loaded after getting all necessary infos.
    this._walletStatus = WalletStatus.Loaded;
  }

  @action
  public disconnect(): void {
    this._walletStatus = WalletStatus.NotInit;
    this.hasInited = false;
    this.eventListener.removeEventListener(
      "keplr_keystorechange",
      this.handleInit
    );
    this._bech32Address = "";
    this._name = "";
    this._legacyAddress = "";
    this._addressType = AddressBtcType.Bech32;
    this._address = null;
    this.pubKey = new Uint8Array(0);
  }

  @action
  public setAddressTypeBtc(type: AddressBtcType): void {
    this._addressType = type;
  }

  get walletVersion(): string | undefined {
    return this._walletVersion;
  }

  get address(): Uint8Array | null {
    return this._address;
  }

  @computed
  get isReadyToSendMsgs(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  getAddressDisplay(
    keyRingLedgerAddresses: AddressesLedger,
    toDisplay: boolean = true
  ): string {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const { networkType } = chainInfo;
    if (this._isNanoLedger) {
      if (networkType !== "cosmos") {
        const address = findLedgerAddress(
          keyRingLedgerAddresses,
          chainInfo,
          this.addressType
        );
        if (
          this.chainId === ChainIdEnum.TRON &&
          isBase58(address) &&
          !toDisplay
        ) {
          return getEvmAddress(address);
        }
        return address;
      }
    }
    if (networkType === "evm") {
      if (!!this.hasEvmosHexAddress) {
        if (this.chainId === ChainIdEnum.TRON && toDisplay) {
          return getBase58Address(this.evmosHexAddress);
        }

        return this.evmosHexAddress;
      } else if (this.bech32Address?.startsWith("oasis")) {
        return this.bech32Address;
      }
    } else if (networkType === "bitcoin") {
      return this.btcAddress;
    }
    return this._bech32Address;
  }

  async sendMsgs(
    type: string | "unknown",
    msgs:
      | AminoMsgsOrWithProtoMsgs
      | (() => Promise<AminoMsgsOrWithProtoMsgs> | AminoMsgsOrWithProtoMsgs),
    memo: string = "",
    fee: StdFee,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: {
      type: string;
      contract_addr: string;
      token_id?: string;
      recipient?: string;
      amount?: string;
      to?: string;
    }
  ) {
    runInAction(() => {
      this._isSendingMsg = type;
    });

    let txHash: Uint8Array;
    try {
      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        this.broadcastMode
      );

      txHash = result?.txHash;
      if (!txHash) throw Error("Transaction Rejected");
    } catch (e: any) {
      runInAction(() => {
        this._isSendingMsg = false;
      });

      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(e);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (this.opts.preTxEvents?.onBroadcasted) {
      this.opts.preTxEvents.onBroadcasted(txHash);
    }
    if (onBroadcasted) {
      onBroadcasted(txHash);
    }
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const restApi = chainInfo?.rest;
    const restConfig = chainInfo?.restConfig;
    const txRestCosmos = new TxRestCosmosClient(restApi, restConfig);
    const txHashRoot = Buffer.from(txHash).toString("hex");
    try {
      const tx = await txRestCosmos.fetchTxPoll(txHashRoot);
      // After sending tx, the balances is probably changed due to the fee.
      for (const feeAmount of fee.amount) {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.bech32Address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      // Always add the tx hash data.
      //@ts-ignore
      if (tx && !tx.hash) {
        //@ts-ignore
        tx.hash = Buffer.from(txHash).toString("hex");
      }
      if (this.opts.preTxEvents?.onFulfill) {
        this.opts.preTxEvents.onFulfill(tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
      OwalletEvent.txHashEmit(txHashRoot, tx);
    } catch (error) {
      console.log(error, "error");
      OwalletEvent.txHashEmit(txHashRoot, null);
    } finally {
      runInAction(() => {
        this._isSendingMsg = false;
      });
    }

    // const txTracer = new TendermintTxTracer(
    //   this.chainGetter.getChain(this.chainId).rpc,
    //   "/websocket",
    //   {
    //     wsObject: this.opts.wsObject,
    //   }
    // );
    // txTracer.traceTx(txHash).then((tx) => {
    //   txTracer.close();
    //
    //   runInAction(() => {
    //     this._isSendingMsg = false;
    //   });
    //
    //   // After sending tx, the balances is probably changed due to the fee.
    //   for (const feeAmount of fee.amount) {
    //     const bal = this.queries.queryBalances
    //       .getQueryBech32Address(this.bech32Address)
    //       .balances.find(
    //         (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
    //       );
    //
    //     if (bal) {
    //       bal.fetch();
    //     }
    //   }
    //
    //   // Always add the tx hash data.
    //   if (tx && !tx.hash) {
    //     tx.hash = Buffer.from(txHash).toString("hex");
    //   }
    //
    //   if (this.opts.preTxEvents?.onFulfill) {
    //     this.opts.preTxEvents.onFulfill(tx);
    //   }
    //
    //   if (onFulfill) {
    //     onFulfill(tx);
    //   }
    // });
  }

  async sendTronToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    address: string,
    onTxEvents?: {
      onBroadcasted?: (txHash: Uint8Array) => void;
      onFulfill?: (tx: any) => void;
    },
    tokenTrc20?: object
  ) {
    try {
      runInAction(() => {
        this._isSendingMsg = "send";
      });
      const ethereum = (await this.getEthereum())!;
      const tx = await ethereum.signAndBroadcastTron(this.chainId, {
        amount,
        currency,
        recipient,
        address,
        tokenTrc20,
      });
      if (!tx?.txid) throw Error("Transaction Rejected");
      if (onTxEvents?.onBroadcasted) {
        onTxEvents?.onBroadcasted(tx.txid);
      }

      // After sending tx, the balances is probably changed due to the fee.
      this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.evmosHexAddress)
        .fetch();
      //@ts-ignore
      this.queriesStore
        .get(this.chainId)
        .tron.queryAccount.getQueryWalletAddress(
          getBase58Address(this.evmosHexAddress)
        )
        .waitFreshResponse();

      if (this.opts.preTxEvents?.onFulfill) {
        this.opts.preTxEvents.onFulfill({
          ...tx,
          code: 0,
        });
      }

      if (onTxEvents?.onFulfill) {
        onTxEvents?.onFulfill({
          ...tx,
          code: 0,
        });
      }
      OwalletEvent.txHashEmit(tx.txid, {
        ...tx,
        code: 0,
      });
      // }
    } catch (error) {
      // OwalletEvent.txHashEmit(txId, null);
      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(error);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        //@ts-ignore
        onTxEvents.onBroadcastFailed(error);
      }
      console.log(error, "error");
      runInAction(() => {
        this._isSendingMsg = false;
      });
      throw error;
    } finally {
      runInAction(() => {
        this._isSendingMsg = false;
      });
    }
  }

  async sendEvmMsgs(
    type: string | "unknown",
    msgs: Msg,
    memo: string = "",
    fee: StdFeeEthereum,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    runInAction(() => {
      this._isSendingMsg = type;
    });

    let txHash: string;

    try {
      if (msgs.type === "erc20") {
        const { value } = msgs;
        const provider = this.chainGetter.getChain(this.chainId).rpc;
        const web3 = new Web3(provider);
        const contract = new web3.eth.Contract(
          // @ts-ignore
          ERC20_ABI,
          value.contract_addr,
          { from: value.from }
        );
        let data = contract.methods
          .transfer(value.recipient, value.amount)
          .encodeABI();

        let txObj = {
          gas: web3.utils.toHex(value.gas),
          to: value.contract_addr,
          value: "0x0", // Must be 0x0, maybe this field is not in use while send erc20 tokens, but still need
          from: value.from,
          data,
        };

        const result = await this.broadcastErc20EvmMsgs(txObj, fee);

        txHash = result.txHash;
      } else {
        const result = await this.broadcastEvmMsgs(msgs, fee, signOptions);
        txHash = result.txHash;
      }
      if (!txHash) throw Error("Transaction Rejected");
    } catch (e: any) {
      runInAction(() => {
        this._isSendingMsg = false;
      });

      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(e);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;

    let onFulfill: ((tx: any) => void) | undefined;
    console.log(txHash, "result result");
    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    const rpc = this.chainGetter.getChain(this.chainId).rest;

    runInAction(() => {
      this._isSendingMsg = false;
    });
    if (this.opts.preTxEvents?.onBroadcasted) {
      //@ts-ignore
      this.opts.preTxEvents.onBroadcasted(txHash);
    }
    if (onBroadcasted) {
      //@ts-ignore
      onBroadcasted(txHash);
    }

    if (this.chainId === ChainIdEnum.Oasis) {
      console.log(txHash, "txHash");
      if (this.opts.preTxEvents?.onFulfill) {
        this.opts.preTxEvents.onFulfill(txHash);
      }

      if (onFulfill) {
        onFulfill(txHash);
      }
      return;
    }
    const sleep = (milliseconds) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    const waitForPendingTransaction = async (
      rpc,
      txHash,
      onFulfill,
      count = 0
    ) => {
      if (count > 10) {
        OwalletEvent.txHashEmit(txHash, { code: 1 });
        return;
      }

      try {
        let expectedBlockTime = 3000;
        let transactionReceipt = null;
        let retryCount = 0;
        while (!transactionReceipt) {
          // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await request(rpc, "eth_getTransactionReceipt", [
            txHash,
          ]);
          console.log(transactionReceipt, "tran receipt");

          retryCount += 1;
          if (retryCount === 10) break;
          await sleep(expectedBlockTime);
        }

        OwalletEvent.txHashEmit(txHash, { code: 0 });

        if (this.opts.preTxEvents?.onFulfill) {
          this.opts.preTxEvents.onFulfill(transactionReceipt);
        }

        if (onFulfill) {
          onFulfill(transactionReceipt);
        }
      } catch (error) {
        await sleep(3000);
        waitForPendingTransaction(rpc, txHash, onFulfill, count + 1);
      }
    };

    waitForPendingTransaction(rpc, txHash, onFulfill);
  }

  async sendBtcMsgs(
    type: string | "unknown",
    msgs: any,
    memo: string = "",
    fee: StdFee,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: ExtraOptionSendToken
  ) {
    runInAction(() => {
      this._isSendingMsg = type;
    });

    let txHash: string;

    try {
      const result = await this.broadcastBtcMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        extraOptions
      );
      txHash = result?.txHash;
      if (!txHash) throw Error("Transaction Rejected");
    } catch (e: any) {
      console.log("🚀 ~ file: base.ts:644 ~ AccountSetBase<MsgOpts, ~ e:", e);
      runInAction(() => {
        this._isSendingMsg = false;
      });

      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(e);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (this.opts.preTxEvents?.onFulfill && txHash) {
      this.opts.preTxEvents.onFulfill(txHash);
    }

    if (onFulfill && txHash) {
      onFulfill(txHash);
    }
  }

  async sendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = "",
    stdFee: Partial<StdFee | StdFeeEthereum> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: ExtraOptionSendToken
  ) {
    for (let i = 0; i < this.sendTokenFns.length; i++) {
      const fn = this.sendTokenFns[i];

      if (
        await fn(
          amount,
          currency,
          recipient,
          memo,
          stdFee,
          signOptions,
          onTxEvents,
          extraOptions
        )
      ) {
        return;
      }
    }

    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    throw new Error(`Unsupported type of currency (${denomHelper.type})`);
  }

  validateChainId(chainId: string): number {
    // chain id example: kawaii_6886-1. If chain id input is already a number in string => parse it immediately
    if (isNaN(parseInt(chainId))) {
      const firstSplit = chainId.split("_")[1];
      if (firstSplit) {
        const chainId = parseInt(firstSplit.split("-")[0]);
        return chainId;
      }
      throw new Error("Invalid chain id. Please try again");
    }
    return parseInt(chainId);
  }

  protected async processSignedTxCosmos(
    msgs: AminoMsgsOrWithProtoMsgs,
    fee: StdFee,
    memo: string = "",
    owallet: any,
    signOptions?: OWalletSignOptions
  ) {
    const isDirectSign = !msgs.aminoMsgs || msgs.aminoMsgs.length === 0;
    const aminoMsgs: Msg[] = msgs.aminoMsgs || [];
    const protoMsgs: Any[] = msgs.protoMsgs;

    if (!protoMsgs || protoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }
    const chainIsInjective = this.chainId.startsWith("injective");
    if (!aminoMsgs || aminoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }
    if (!isDirectSign) {
      if (!aminoMsgs || !protoMsgs || aminoMsgs.length !== protoMsgs.length) {
        throw new Error("The length of aminoMsgs and protoMsgs are different");
      }
    }
    if (
      this.hasNoLegacyStdFeature() &&
      (!protoMsgs || protoMsgs.length === 0)
    ) {
      throw new Error(
        "Chain can't send legecy stdTx. But, proto any type msgs are not provided"
      );
    }

    const coinType = this.chainGetter.getChain(this.chainId).bip44.coinType;

    const account = await BaseAccount.fetchFromRest(
      this.instance,
      this.bech32Address,
      true
    );

    // const signDocAmino = makeSignDoc(aminoMsgs, fee, this.chainId, memo, account.getAccountNumber().toString(), account.getSequence().toString());
    const useEthereumSign =
      this.chainGetter
        .getChain(this.chainId)
        .features?.includes("eth-key-sign") === true;

    const eip712Signing = useEthereumSign && this.isNanoLedger;
    if (eip712Signing && isDirectSign) {
      throw new Error("EIP712 signing is not supported for proto signing");
    }
    if (eip712Signing && !msgs.rlpTypes) {
      throw new Error(
        "RLP types information is needed for signing tx for ethermint chain with ledger"
      );
    }

    const signDocRaw: StdSignDoc = {
      chain_id: this.chainId,
      account_number: account.getAccountNumber().toString(),
      sequence: account.getSequence().toString(),
      fee: fee,
      msgs: aminoMsgs,
      memo: escapeHTML(memo),
    };

    if (eip712Signing) {
      if (chainIsInjective) {
        // Due to injective's problem, it should exist if injective with ledger.
        // There is currently no effective way to handle this in keplr. Just set a very large number.
        (signDocRaw as Mutable<StdSignDoc>).timeout_height =
          Number.MAX_SAFE_INTEGER.toString();
      } else {
        // If not injective (evmos), they require fee payer.
        // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
        //      That means this part is not standard.
        (signDocRaw as Mutable<StdSignDoc>).fee = {
          ...signDocRaw.fee,
          feePayer: this.bech32Address,
        };
      }
    }

    // Should use bind to avoid "this" problem
    let signAmino = owallet.signAmino.bind(owallet);

    // Should use bind to avoid "this" problem
    let experimentalSignEIP712CosmosTx_v0 =
      owallet.experimentalSignEIP712CosmosTx_v0.bind(owallet);

    const signDocAmino = sortObjectByKey(signDocRaw);
    const signResponse: AminoSignResponse = await (async () => {
      if (!eip712Signing) {
        return await signAmino(
          this.chainId,
          this.bech32Address,
          signDocAmino,
          signOptions
        );
      }
      return await experimentalSignEIP712CosmosTx_v0(
        this.chainId,
        this.bech32Address,
        getEip712TypedDataBasedOnChainId(this.chainId, msgs),
        signDocAmino,
        signOptions
      );
    })();
    if (!signResponse) throw Error("Transaction Rejected!");
    const signDoc = {
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: protoMsgs,
          memo: signResponse.signed.memo,
          timeoutHeight: signResponse.signed.timeout_height,
          extensionOptions: eip712Signing
            ? [
                {
                  typeUrl: (() => {
                    if (chainIsInjective) {
                      return "/injective.types.v1beta1.ExtensionOptionsWeb3Tx";
                    }

                    return "/ethermint.types.v1.ExtensionOptionsWeb3Tx";
                  })(),
                  value: ExtensionOptionsWeb3Tx.encode(
                    ExtensionOptionsWeb3Tx.fromPartial({
                      typedDataChainId: EthermintChainIdHelper.parse(
                        this.chainId
                      ).ethChainId.toString(),
                      feePayer: !chainIsInjective
                        ? signResponse.signed.fee.feePayer
                        : undefined,
                      feePayerSig: !chainIsInjective
                        ? Buffer.from(
                            signResponse.signature.signature,
                            "base64"
                          )
                        : undefined,
                    })
                  ).finish(),
                },
              ]
            : undefined,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              typeUrl: (() => {
                if (!chainIsInjective && coinType === 60) {
                  return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
                }
                if (chainIsInjective) {
                  return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
                }
                return "/cosmos.crypto.secp256k1.PubKey";
              })(),
              value: PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  "base64"
                ),
              }).finish(),
            },
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: signResponse.signed.sequence,
          },
        ],
        fee: Fee.fromPartial({
          amount: signResponse.signed.fee.amount as Coin[],
          gasLimit: Long.fromString(signResponse.signed.fee.gas),
          payer:
            eip712Signing && !chainIsInjective
              ? // Fee delegation feature not yet supported. But, for eip712 ethermint signing, we must set fee payer.
                signResponse.signed.fee.feePayer
              : undefined,
        }),
      }).finish(),
      accountNumber: Long.fromString(signResponse.signed.account_number),
      chainId: this.chainId,
    };

    const signedTx = TxRaw.encode({
      bodyBytes: signDoc.bodyBytes, // has to collect body bytes & auth info bytes since OWallet overrides data when signing
      authInfoBytes: signDoc.authInfoBytes,
      signatures:
        !eip712Signing || chainIsInjective
          ? [Buffer.from(signResponse.signature.signature, "base64")]
          : [new Uint8Array(0)],
    }).finish();
    return signedTx;
  }

  // TODO; do we have to add a new broadcast msg for Ethereum? -- Update: Added done
  // Return the tx hash.
  protected async broadcastMsgs(
    msgs: AminoMsgsOrWithProtoMsgs,
    fee: StdFee,
    memo: string = "",
    signOptions?: OWalletSignOptions,
    mode: "block" | "async" | "sync" = "async"
  ): Promise<{
    txHash: Uint8Array;
  }> {
    if (this.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const owallet = (await this.getOWallet())!;

    let sendTx = owallet.sendTx.bind(owallet);
    const signedTx = await this.processSignedTxCosmos(
      msgs,
      fee,
      memo,
      owallet,
      signOptions
    );
    return {
      txHash: await sendTx(this.chainId, signedTx, mode as BroadcastMode),
    };
  }

  protected async broadcastBtcMsgs(
    msgs: any,
    fee: StdFee,
    memo: string = "",
    signOptions?: OWalletSignOptions,
    extraOptions?: ExtraOptionSendToken
  ): Promise<{
    txHash: string;
  }> {
    try {
      if (this.walletStatus !== WalletStatus.Loaded) {
        throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const bitcoin = (await this.getBitcoin())!;

      const signResponse = await bitcoin.signAndBroadcast(this.chainId, {
        memo,
        fee,
        address: this.btcAddress,
        msgs,
        ...extraOptions,
      });

      return {
        txHash: signResponse?.rawTxHex,
      };
    } catch (error) {
      console.log("Error on broadcastMsgs: ", error);
      throw error;
    }
  }

  // Return the tx hash.
  protected async broadcastEvmMsgs(
    msgs: Msg,
    fee: StdFeeEthereum,
    signOptions?: OWalletSignOptions
  ): Promise<{
    txHash: string;
  }> {
    try {
      if (this.walletStatus !== WalletStatus.Loaded) {
        throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
      }
      console.log("🚀 ~ AccountSetBase<MsgOpts, ~ fee:", fee);
      if (Object.values(msgs).length === 0) {
        throw new Error("There is no msg to send");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ethereum = (await this.getEthereum())!;

      let toAddress = msgs.value.to_address;
      if (EVMOS_NETWORKS.includes(signOptions.chainId)) {
        const decoded = bech32.decode(toAddress);
        toAddress =
          "0x" + Buffer.from(bech32.fromWords(decoded.words)).toString("hex");
      }
      const message = {
        // TODO: need to check kawaii cosmos
        to: toAddress,
        value: "0x" + parseInt(msgs.value.amount[0].amount).toString(16),
        gas: fee.gas,
        gasPrice: fee.gasPrice,
      };

      const signResponse = await ethereum.signAndBroadcastEthereum(
        this.chainId,
        message
      );

      return {
        txHash: signResponse?.rawTxHex,
      };
    } catch (error) {
      console.log("Error on broadcastEvmMsgs: ", error);
      throw Error(error);
    }
  }

  protected async broadcastErc20EvmMsgs(
    msgs: object,
    fee: StdFeeEthereum
  ): Promise<{
    txHash: string;
  }> {
    try {
      if (this.walletStatus !== WalletStatus.Loaded) {
        throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
      }

      if (Object.values(msgs).length === 0) {
        throw new Error("There is no msg to send");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ethereum = (await this.getEthereum())!;

      const signResponse = await ethereum.signAndBroadcastEthereum(
        this.chainId,
        {
          ...msgs,
          type: "erc20",
          gas: fee.gas,
          gasPrice: fee.gasPrice,
        }
      );

      return {
        txHash: signResponse?.rawTxHex,
      };
    } catch (error) {
      console.log("Error on broadcastErc20Msgs: ", error);
    }
  }

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
      adapter: fetchAdapter,
    });
  }

  get walletStatus(): WalletStatus {
    return this._walletStatus;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get legacyAddress(): string {
    return this._legacyAddress;
  }

  @computed
  get addressType(): AddressBtcType {
    return this._addressType;
  }

  @computed
  get btcAddress(): string {
    if (this._addressType === AddressBtcType.Legacy) {
      return this.legacyAddress;
    }
    return this._bech32Address;
  }

  @computed
  get allBtcAddresses(): { bech32: string; legacy: string } {
    return { bech32: this._bech32Address, legacy: this.legacyAddress };
  }

  get isNanoLedger(): boolean {
    return this._isNanoLedger;
  }

  get isSendingMsg(): string | boolean {
    return this._isSendingMsg;
  }

  get hasEvmosHexAddress(): boolean {
    return this.bech32Address?.startsWith("evmos");
  }

  get evmosHexAddress(): string {
    // here
    if (!this.bech32Address) return;
    if (!this.hasEvmosHexAddress) return;
    const address = Buffer.from(
      fromWords(bech32.decode(this.bech32Address).words)
    );
    return ETH.encoder(address);
  }

  protected get queries(): DeepReadonly<QueriesSetBase & Queries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes("no-legacy-stdTx")
    );
  }
}

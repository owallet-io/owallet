import { StdFeeEthereum } from './../common/types';

// import Web3 from 'web3';
import 'reflect-metadata';
import {
  action,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction
} from 'mobx';
import {
  AppCurrency,
  OWallet,
  OWalletSignOptions,
  Ethereum
} from '@owallet/types';
import { DeepReadonly } from 'utility-types';
import bech32, { fromWords } from 'bech32';
import { ChainGetter } from '../common';
import { QueriesSetBase, QueriesStore } from '../query';
import { DenomHelper, toGenerator } from '@owallet/common';
import {
  BroadcastMode,
  makeSignDoc,
  makeStdTx,
  Msg,
  MsgSend,
  StdFee,
  StdTx
} from '@cosmjs/launchpad';
import {
  BaseAccount,
  cosmos,
  google,
  TendermintTxTracer
} from '@owallet/cosmos';
import Axios, { AxiosInstance } from 'axios';
import { Buffer } from 'buffer';
import Long from 'long';
import ICoin = cosmos.base.v1beta1.ICoin;
import SignMode = cosmos.tx.signing.v1beta1.SignMode;

import { ETH } from '@hanchon/ethermint-address-converter';
import { request } from '@owallet/background/build/tx';

export enum WalletStatus {
  NotInit = 'NotInit',
  Loading = 'Loading',
  Loaded = 'Loaded',
  NotExist = 'NotExist',
  Rejected = 'Rejected'
}

export interface MsgOpt {
  readonly type: string;
  readonly gas: number;
}

/*
  If the chain has "no-legacy-stdTx" feature, we should send the tx based on protobuf.
  Expectedly, the sign doc should be formed as animo-json regardless of the tx type (animo or proto).
*/
type AminoMsgsOrWithProtoMsgs =
  | Msg[]
  | {
      aminoMsgs: Msg[];
      protoMsgs?: google.protobuf.IAny[];
    };

export interface AccountSetOpts<MsgOpts> {
  readonly prefetching: boolean;
  readonly suggestChain: boolean;
  readonly suggestChainFn?: (
    owallet: OWallet,
    chainInfo: ReturnType<ChainGetter['getChain']>
  ) => Promise<void>;
  readonly autoInit: boolean;
  readonly preTxEvents?: {
    onBroadcastFailed?: (e?: Error) => void;
    onBroadcasted?: (txHash: Uint8Array) => void;
    onFulfill?: (tx: any) => void;
  };
  readonly getOWallet: () => Promise<OWallet | undefined>;
  readonly getEthereum: () => Promise<Ethereum | undefined>;
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
  protected _name: string = '';

  @observable
  protected _bech32Address: string = '';

  @observable
  protected _isSendingMsg: string | boolean = false;

  public broadcastMode: 'sync' | 'async' | 'block' = 'sync';

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
        }
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
    chainInfo: ReturnType<ChainGetter['getChain']>
  ): Promise<void> {
    await owallet.experimentalSuggestChain(chainInfo.raw);
  }

  protected async evmSuggestChain(
    ethereum: Ethereum,
    chainInfo: ReturnType<ChainGetter['getChain']>
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
        'keplr_keystorechange',
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
    this._name = key.name;
    this.pubKey = key.pubKey;

    // Set the wallet status as loaded after getting all necessary infos.
    this._walletStatus = WalletStatus.Loaded;
  }

  @action
  public disconnect(): void {
    this._walletStatus = WalletStatus.NotInit;
    this.hasInited = false;
    this.eventListener.removeEventListener(
      'keplr_keystorechange',
      this.handleInit
    );
    this._bech32Address = '';
    this._name = '';
    this.pubKey = new Uint8Array(0);
  }

  get walletVersion(): string | undefined {
    return this._walletVersion;
  }

  @computed
  get isReadyToSendMsgs(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ''
    );
  }

  // get here 11
  async sendMsgs(
    type: string | 'unknown',
    msgs:
      | AminoMsgsOrWithProtoMsgs
      | (() => Promise<AminoMsgsOrWithProtoMsgs> | AminoMsgsOrWithProtoMsgs),
    memo: string = '',
    fee: StdFee,
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

    let txHash: Uint8Array;

    try {
      if (typeof msgs === 'function') {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        this.broadcastMode
      );
      txHash = result.txHash;
    } catch (e: any) {
      runInAction(() => {
        this._isSendingMsg = false;
      });

      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(e);
      }

      if (
        onTxEvents &&
        'onBroadcastFailed' in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === 'function') {
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

    const txTracer = new TendermintTxTracer(
      this.chainGetter.getChain(this.chainId).rpc,
      '/websocket',
      {
        wsObject: this.opts.wsObject
      }
    );
    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      runInAction(() => {
        this._isSendingMsg = false;
      });

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
      if (tx && !tx.hash) {
        tx.hash = Buffer.from(txHash).toString('hex');
      }

      if (this.opts.preTxEvents?.onFulfill) {
        this.opts.preTxEvents.onFulfill(tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }

  async sendEvmMsgs(
    type: string | 'unknown',
    msgs: Msg,
    memo: string = '',
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
    console.log('FEE in SEND EVM: ', fee);

    try {
      const result = await this.broadcastEvmMsgs(msgs, fee);
      txHash = result.txHash;
    } catch (e: any) {
      runInAction(() => {
        this._isSendingMsg = false;
      });

      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(e);
      }

      if (
        onTxEvents &&
        'onBroadcastFailed' in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === 'function') {
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

    const sleep = (milliseconds) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    const waitForPendingTransaction = async (
      rpc,
      txHash,
      onFulfill,
      count = 0
    ) => {
      if (count > 10) return;

      try {
        let expectedBlockTime = 3000;
        let transactionReceipt = null;
        let retryCount = 0;
        while (!transactionReceipt) {
          // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await request(rpc, 'eth_getTransactionReceipt', [
            txHash
          ]);
          console.log(
            '🚀 ~ file: base.ts ~ lin ~ transactionReceipt',
            transactionReceipt
          );
          retryCount += 1;
          if (retryCount === 10) break;
          await sleep(expectedBlockTime);
        }

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

    // if (this.opts.preTxEvents?.onFulfill) {
    //   this.opts.preTxEvents.onFulfill(txInfo);
    // }

    // if (onFulfill) {
    //   onFulfill(txInfo);
    // }

    // const txTracer = new TendermintTxTracer(
    //   this.chainGetter.getChain(this.chainId).rpc,
    //   '/websocket',
    //   {
    //     wsObject: this.opts.wsObject
    //   }
    // );

    // txTracer.traceTx(txHash).then((tx) => {
    //   txTracer.close();

    //   runInAction(() => {
    //     this._isSendingMsg = false;
    //   });

    //   // After sending tx, the balances is probably changed due to the fee.
    //   // for (const feeAmount of fee.amount) {
    //   //   const queryEvmBalance = this.queries.queryEvmBalances.getQueryBalance(this.evmosHexAddress)

    //   //   if (queryEvmBalance) {
    //   //     queryEvmBalance.fetch();
    //   //   }
    //   // }

    //   // Always add the tx hash data.
    //   if (tx && !tx.hash) {
    //     tx.hash = Buffer.from(txHash).toString('hex');
    //   }

    //   if (this.opts.preTxEvents?.onFulfill) {
    //     this.opts.preTxEvents.onFulfill(tx);
    //   }

    //   if (onFulfill) {
    //     onFulfill(tx);
    //   }
    // });
  }

  async sendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = '',
    stdFee: Partial<StdFee | StdFeeEthereum> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
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
          onTxEvents
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
      const firstSplit = chainId.split('_')[1];
      if (firstSplit) {
        const chainId = parseInt(firstSplit.split('-')[0]);
        return chainId;
      }
      throw new Error('Invalid chain id. Please try again');
    }
    return parseInt(chainId);
  }

  // TODO; do we have to add a new broadcast msg for Ethereum? -- Update: Added done
  // Return the tx hash.
  protected async broadcastMsgs(
    msgs: Msg[],
    fee: StdFee,
    memo: string = '',
    signOptions?: OWalletSignOptions,
    mode: 'block' | 'async' | 'sync' = 'async'
  ): Promise<{
    txHash: Uint8Array;
  }> {
    try {
      if (this.walletStatus !== WalletStatus.Loaded) {
        throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
      }

      let aminoMsgs: Msg[];
      let protoMsgs: google.protobuf.IAny[] | undefined;
      if ('aminoMsgs' in msgs) {
        aminoMsgs = msgs.aminoMsgs;
        protoMsgs = msgs.protoMsgs;
      } else {
        aminoMsgs = msgs;
      }

      if (aminoMsgs.length === 0) {
        throw new Error('There is no msg to send');
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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const owallet = (await this.getOWallet())!;

      let signedTx: Uint8Array | StdTx;

      const account = await BaseAccount.fetchFromRest(
        this.instance,
        this.bech32Address,
        true
      );

      if (this.hasNoLegacyStdFeature()) {
        const key = await owallet.getKey(this.chainId);

        const signDoc = {
          bodyBytes: cosmos.tx.v1beta1.TxBody.encode({
            messages: protoMsgs,
            memo
          }).finish(),
          authInfoBytes: cosmos.tx.v1beta1.AuthInfo.encode({
            signerInfos: [
              {
                publicKey: {
                  type_url:
                    coinType === 60
                      ? '/ethermint.crypto.v1.ethsecp256k1.PubKey'
                      : '/cosmos.crypto.secp256k1.PubKey',
                  value: cosmos.crypto.secp256k1.PubKey.encode({
                    key: key.pubKey
                  }).finish()
                },
                modeInfo: {
                  single: {
                    mode: SignMode.SIGN_MODE_DIRECT
                  }
                },
                sequence: Long.fromString(account.getSequence().toString())
              }
            ],
            fee: {
              amount: fee.amount as ICoin[],
              gasLimit: Long.fromString(fee.gas)
            }
          }).finish(),
          accountNumber: Long.fromString(account.getAccountNumber().toString()),
          chainId: this.chainId
        };

        const signResponse = await owallet.signDirect(
          this.chainId,
          this.bech32Address,
          signDoc,
          signOptions
        );

        signedTx = cosmos.tx.v1beta1.TxRaw.encode({
          bodyBytes: signResponse.signed.bodyBytes, // has to collect body bytes & auth info bytes since OWallet overrides data when signing
          authInfoBytes: signResponse.signed.authInfoBytes,
          signatures: [Buffer.from(signResponse.signature.signature, 'base64')]
        }).finish();
      } else {
        const signDoc = makeSignDoc(
          aminoMsgs,
          fee,
          this.chainId,
          memo,
          account.getAccountNumber().toString(),
          account.getSequence().toString()
        );
        const signResponse = await owallet.signAmino(
          this.chainId,
          this.bech32Address,
          signDoc,
          signOptions
        );

        signedTx = makeStdTx(signResponse.signed, signResponse.signature);
      }

      return {
        txHash: await owallet.sendTx(
          this.chainId,
          signedTx,
          mode as BroadcastMode
        )
      };
    } catch (error) {
      console.log('Error on broadcastMsgs: ', error);
    }
  }

  // Return the tx hash.
  protected async broadcastEvmMsgs(
    msgs: Msg,
    fee: StdFeeEthereum
  ): Promise<{
    txHash: string;
  }> {
    try {
      if (this.walletStatus !== WalletStatus.Loaded) {
        throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
      }

      if (Object.values(msgs).length === 0) {
        throw new Error('There is no msg to send');
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ethereum = (await this.getEthereum())!;
      console.log('Amino Msgs: ', msgs);

      const message = {
        to: msgs.value.to_address,
        value: '0x' + parseInt(msgs.value.amount[0].amount).toString(16),
        gas: fee.gas,
        gasPrice: fee.gasPrice
      };

      console.log(
        '🚀 ~ file: base.ts ~ line 749 ~ AccountSetBase<MsgOpts, ~ message',
        message
      );

      const signResponse = await ethereum.signAndBroadcastEthereum(
        this.chainId,
        message
      );

      return {
        txHash: signResponse.rawTxHex
      };
    } catch (error) {
      console.log('Error on broadcastMsgs: ', error);
    }
  }

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rest
      },
      ...chainInfo.restConfig,
      adapter: fetchAdapter
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

  get isSendingMsg(): string | boolean {
    return this._isSendingMsg;
  }

  get hasEvmosHexAddress(): boolean {
    return this.bech32Address.startsWith('evmos');
  }

  get evmosHexAddress(): string {
    if (!this.bech32Address) return;
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
      chainInfo.features.includes('no-legacy-stdTx')
    );
  }
}

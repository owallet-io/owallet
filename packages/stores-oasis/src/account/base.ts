import { ChainGetter } from "@owallet/stores";
import {
  AppCurrency,
  EthTxReceipt,
  OWallet,
  TransactionType,
} from "@owallet/types";
import { action, flow, makeObservable, observable } from "mobx";
import { AccountOasisSharedContext } from "./context";
import {
  API,
  DenomHelper,
  Network,
  retry,
  urlTxHistory,
} from "@owallet/common";
import { simpleFetch } from "@owallet/simple-fetch";
import { ResDetailAllTx } from "@owallet/types-legacy";

export interface UnsignedOasisTransaction {
  amount: string;
  to: string;
  coinMinimalDenom: string;
  chainId: string;
}

export class OasisAccountBase {
  @observable
  protected _isSendingTx: boolean = false;
  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";
  @observable
  protected _ethereumHexAddress: string = "";
  @observable
  protected _isNanoLedger: boolean = false;
  @observable
  protected _isKeystone: boolean = false;
  protected _pubKey: Uint8Array;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly sharedContext: AccountOasisSharedContext,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    makeObservable(this);
    this._pubKey = new Uint8Array();
    this.init();
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get pubKey(): Uint8Array {
    return this._pubKey.slice();
  }

  protected hasInited = false;

  get isNanoLedger(): boolean {
    return this._isNanoLedger;
  }

  private readonly handleInit = () => this.init();

  @flow
  public *init() {
    if (!this.hasInited) {
      // If key store in the owallet extension is changed, this event will be dispatched.
      this.eventListener.addEventListener(
        "keplr_keystorechange",
        this.handleInit
      );
    }
    this.hasInited = true;
    yield this.sharedContext.getKey(this.chainId, (res) => {
      if (res.status === "fulfilled") {
        const key = res.value;
        this._bech32Address = key.bech32Address;
        this._ethereumHexAddress = key.ethereumHexAddress;
        this._isNanoLedger = key.isNanoLedger;
        this._isKeystone = key.isKeystone;
        this._name = key.name;
        this._pubKey = key.pubKey;
      } else {
        // Caught error loading key
        // Reset properties, and set status to Rejected
        this._bech32Address = "";
        this._ethereumHexAddress = "";
        this._isNanoLedger = false;
        this._isKeystone = false;
        this._name = "";
        this._pubKey = new Uint8Array(0);
      }
    });
  }

  get addressDisplay(): string {
    return this._bech32Address;
  }

  @action
  public disconnect(): void {
    this.hasInited = false;
    this.eventListener.removeEventListener(
      "keplr_keystorechange",
      this.handleInit
    );
    this._bech32Address = "";
    this._ethereumHexAddress = "";
    this._isNanoLedger = false;
    this._isKeystone = false;
    this._name = "";
    this._pubKey = new Uint8Array(0);
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }
  makeSendTokenTx({
    currency,
    amount,
    to,
  }: {
    currency: AppCurrency;
    amount: string;
    to: string;
  }): UnsignedOasisTransaction {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const isOasis = chainInfo.features.includes("oasis");
    if (!isOasis) {
      throw new Error("No Oasis chain info provided");
    }
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx: UnsignedOasisTransaction = (() => {
      switch (denomHelper.type) {
        default:
          return {
            chainId: chainInfo.chainId,
            to,
            amount,
            coinMinimalDenom: currency.coinMinimalDenom,
          };
      }
    })();

    return unsignedTx;
  }
  async sendTx(
    sender: string,
    unsignedTx: UnsignedOasisTransaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: EthTxReceipt) => void;
    }
  ) {
    try {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      const oasisInfo = chainInfo.grpc;
      if (!oasisInfo || !chainInfo.features.includes("oasis")) {
        throw new Error("No Oasis info provided");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const owallet = (await this.getOWallet())!;
      const signedTx = await owallet.oasis.sign(
        this.chainId,
        sender,
        JSON.stringify(unsignedTx),
        TransactionType.StakingTransfer
      );
      const txHash = await owallet.oasis.sendTx(this.chainId, signedTx);
      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(txHash);
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            // const { status, data } = await simpleFetch(`https://www.oasisscan.com/v2/mainnet/chain/transactions?page=1&size=5&height=&address=${this.bech32Address}`)
            // console.log(data,"data oasis");
            // if (data && status === 200) {
            //     onTxEvents?.onFulfill?.(data);
            //     resolve();
            // }

            reject();
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 500,
          maxWaitMsAfterError: 4000,
        }
      );

      return txHash;
    } catch (e) {
      if (onTxEvents?.onBroadcastFailed) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }
  }
}

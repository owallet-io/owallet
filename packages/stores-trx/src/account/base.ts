import { ChainGetter } from "@owallet/stores";
import { AppCurrency, OWallet, TransactionType } from "@owallet/types";
import { action, flow, makeObservable, observable } from "mobx";
import { AccountTrxSharedContext } from "./context";
import { DenomHelper, getBase58Address, retry } from "@owallet/common";
import { simpleFetch } from "@owallet/simple-fetch";

export interface UnsignedTrxTransaction {
  address: string;
  amount: string;
  recipient: string;
  coinMinimalDenom: string;
  chainId: string;
  contractAddress?: string;
}

export class TrxAccountBase {
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
    protected readonly sharedContext: AccountTrxSharedContext,
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
    return this.base58Address;
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
  get ethereumHexAddress(): string {
    return this._ethereumHexAddress;
  }
  get base58Address(): string {
    return getBase58Address(this._ethereumHexAddress);
  }
  get isSendingTx(): boolean {
    return this._isSendingTx;
  }

  makeSendTokenTx({
    address,
    currency,
    amount,
    recipient,
    contractAddress,
  }: {
    address: string;
    currency: AppCurrency;
    amount: string;
    recipient: string;
    contractAddress?: string;
  }): UnsignedTrxTransaction {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx: UnsignedTrxTransaction = (() => {
      switch (denomHelper.type) {
        default:
          return {
            address,
            chainId: chainInfo.chainId,
            recipient,
            amount,
            coinMinimalDenom: currency.coinMinimalDenom,
            contractAddress,
          };
      }
    })();

    return unsignedTx;
  }

  async sendTx(
    unsignedTx: UnsignedTrxTransaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: any) => void;
    }
  ) {
    try {
      const owallet = (await this.getOWallet())!;
      const signedTx = await owallet.tron.sign(
        this.chainId,
        JSON.stringify(unsignedTx)
      );
      const txHash = await owallet.tron.sendTx(this.chainId, signedTx as any);
      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(txHash);
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            try {
              const { status, data } = await simpleFetch(
                `https://tronscan.org/#/transaction/${txHash}`
              );
              if (data && status === 200) {
                resolve();
              }
            } catch (error) {
              reject();
              console.log("error", error);
              throw error;
            }
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

import { ChainGetter } from "@owallet/stores";
import {
  AppCurrency,
  EthTxReceipt,
  // ItemSvmScan,
  OWallet,
  TransactionType,
} from "@owallet/types";
import { action, flow, makeObservable, observable } from "mobx";
import { AccountSvmSharedContext } from "./context";
import {
  API,
  DenomHelper,
  Network,
  retry,
  urlTxHistory,
} from "@owallet/common";
import { simpleFetch } from "@owallet/simple-fetch";
// import { ListSvmScan } from "@owallet/types";

export interface UnsignedSvmTransaction {
  amount: string;
  to: string;
  coinMinimalDenom: string;
  chainId: string;
}

export class SvmAccountBase {
  @observable
  protected _isSendingTx: boolean = false;
  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";
  @observable
  protected _base58Address: string = "";
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
    protected readonly sharedContext: AccountSvmSharedContext,
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
        this._base58Address = key.base58Address;
        this._ethereumHexAddress = key.ethereumHexAddress;
        this._isNanoLedger = key.isNanoLedger;
        this._isKeystone = key.isKeystone;
        this._name = key.name;
        this._pubKey = key.pubKey;
      } else {
        // Caught error loading key
        // Reset properties, and set status to Rejected
        this._bech32Address = "";
        this._base58Address = "";
        this._ethereumHexAddress = "";
        this._isNanoLedger = false;
        this._isKeystone = false;
        this._name = "";
        this._pubKey = new Uint8Array(0);
      }
    });
  }

  get addressDisplay(): string {
    return this._base58Address;
  }
  get base58Address(): string {
    return this._base58Address;
  }
  @action
  public disconnect(): void {
    this.hasInited = false;
    this.eventListener.removeEventListener(
      "keplr_keystorechange",
      this.handleInit
    );
    this._bech32Address = "";
    this._base58Address = "";
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
  }): UnsignedSvmTransaction {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const isSvm = chainInfo.features.includes("oasis");
    if (!isSvm) {
      throw new Error("No Svm chain info provided");
    }
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx: UnsignedSvmTransaction = (() => {
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
    unsignedTx: UnsignedSvmTransaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: any) => void;
    }
  ) {
    // try {
    //   const chainInfo = this.chainGetter.getChain(this.chainId);
    //   const oasisInfo = chainInfo.grpc;
    //   if (!oasisInfo || !chainInfo.features.includes("oasis")) {
    //     throw new Error("No Svm info provided");
    //   }
    //
    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   const owallet = (await this.getOWallet())!;
    //   const signedTx = await owallet.oasis.sign(
    //     this.chainId,
    //     sender,
    //     JSON.stringify(unsignedTx),
    //     TransactionType.StakingTransfer
    //   );
    //   const txHash = await owallet.oasis.sendTx(this.chainId, signedTx);
    //   if (!txHash) {
    //     throw new Error("No tx hash responded");
    //   }
    //
    //   if (onTxEvents?.onBroadcasted) {
    //     onTxEvents.onBroadcasted(txHash);
    //   }
    //
    //   retry(
    //     () => {
    //       return new Promise<void>(async (resolve, reject) => {
    //         const { status, data } = await simpleFetch<ListSvmScan>(
    //           `https://www.oasisscan.com/v2/mainnet/chain/transactions?page=1&size=5&height=&address=${this.addressDisplay}`
    //         );
    //         if (data && status === 200) {
    //           if (!data.data?.list) return;
    //           for (const itemList of data.data?.list) {
    //             if (!itemList?.txHash) return;
    //             if (itemList?.txHash === txHash && itemList.status) {
    //               onTxEvents?.onFulfill?.(itemList);
    //               resolve();
    //             }
    //           }
    //         }
    //         reject();
    //       });
    //     },
    //     {
    //       maxRetries: 10,
    //       waitMsAfterError: 500,
    //       maxWaitMsAfterError: 4000,
    //     }
    //   );
    //
    //   return txHash;
    // } catch (e) {
    //   if (onTxEvents?.onBroadcastFailed) {
    //     onTxEvents.onBroadcastFailed(e);
    //   }
    //
    //   throw e;
    // }
  }
}

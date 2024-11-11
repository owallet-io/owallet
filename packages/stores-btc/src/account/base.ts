import { ChainGetter, WalletStatus } from "@owallet/stores";
import {
  AppCurrency,
  OWallet,
  TransactionBtcType,
  UnsignedBtcTransaction,
} from "@owallet/types";
import { action, flow, makeObservable, observable } from "mobx";
import { AccountBtcSharedContext } from "./context";
import { validate } from "bitcoin-address-validation";
import { DenomHelper } from "@owallet/common";

export class BtcAccountBase {
  @observable
  protected _isSendingTx: boolean = false;
  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";
  @observable
  protected _ethereumHexAddress: string = "";
  @observable
  protected _btcLegacyAddress: string = "";
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
    protected readonly sharedContext: AccountBtcSharedContext,
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

  static isBtcAddress(address: string): boolean {
    if (!address) return false;
    return validate(address);
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get btcLegacyAddress(): string {
    return this._btcLegacyAddress;
  }

  get addressDisplay(): string {
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
        console.log(key, "key btc");
        this._bech32Address = key.bech32Address;
        this._ethereumHexAddress = key.ethereumHexAddress;
        this._isNanoLedger = key.isNanoLedger;
        this._isKeystone = key.isKeystone;
        this._name = key.name;
        this._pubKey = key.pubKey;
        this._btcLegacyAddress = key.btcLegacyAddress;
      } else {
        // Caught error loading key
        // Reset properties, and set status to Rejected
        this._bech32Address = "";
        this._ethereumHexAddress = "";
        this._isNanoLedger = false;
        this._isKeystone = false;
        this._name = "";
        this._pubKey = new Uint8Array(0);
        this._btcLegacyAddress = "";
      }
    });
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

  makeSendTokenTx({
    currency,
    amount,
    to,
    memo,
    sender,
  }: {
    currency: AppCurrency;
    amount: string;
    to: string;
    memo: string;
    sender: string;
  }): UnsignedBtcTransaction {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const isBtc = chainInfo.features.includes("btc");
    if (!isBtc) {
      throw new Error("No BTC chain info provided");
    }
    return {
      chainId: chainInfo.chainId,
      to,
      amount,
      coinMinimalDenom: currency.coinMinimalDenom,
      memo,
      sender,
    };
  }

  async sendTx(
    sender: string,
    unsignedTx: UnsignedBtcTransaction,
    signType: TransactionBtcType,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: any) => void;
    }
  ) {
    try {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (!chainInfo.features.includes("btc")) {
        throw new Error("No BTC info provided");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const owallet = (await this.getOWallet())!;
      const signedTx = await owallet.bitcoin.sign(
        this.chainId,
        sender,
        JSON.stringify(unsignedTx),
        signType
      );
      console.log(signedTx, "signedTx");
      const txHash = await owallet.bitcoin.sendTx(this.chainId, signedTx);
      console.log(txHash, "txHash");
      // const txHash = "";
      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(txHash);
      }

      // retry(
      //     () => {
      //       return new Promise<void>(async (resolve, reject) => {
      //         const { status, data } = await simpleFetch<ListOasisScan>(
      //             `https://www.oasisscan.com/v2/mainnet/chain/transactions?page=1&size=5&height=&address=${this.addressDisplay}`
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
      // );

      return txHash;
    } catch (e) {
      if (onTxEvents?.onBroadcastFailed) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }
}

import { ChainGetter, WalletStatus } from "@owallet/stores";
import { OWallet } from "@owallet/types";
import { action, flow, makeObservable, observable } from "mobx";
import { AccountBtcSharedContext } from "./context";
import { validate } from "bitcoin-address-validation";
import { getAddress as getEthAddress } from "@ethersproject/address";
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

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }
}

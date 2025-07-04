import { action, computed, flow, get, makeObservable, observable } from "mobx";
import { AppCurrency, OWallet, SupportedPaymentType } from "@owallet/types";
import { ChainGetter } from "../chain";
import { DenomHelper, getBase58Address, toGenerator } from "@owallet/common";
import { MakeTxResponse } from "./types";
import { AccountSharedContext } from "./context";

export enum WalletStatus {
  NotInit = "NotInit",
  Loading = "Loading",
  Loaded = "Loaded",
  NotExist = "NotExist",
  Rejected = "Rejected",
}

export interface MsgOpt {
  readonly type: string;
  readonly gas: number;
}

export interface AccountSetOpts {
  readonly suggestChain: boolean;
  readonly suggestChainFn?: (
    owallet: OWallet,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ) => Promise<void>;
  readonly autoInit: boolean;
}

export class AccountSetBase {
  @observable
  protected _walletVersion: string | undefined = undefined;

  @observable
  protected _walletStatus: WalletStatus = WalletStatus.NotInit;

  @observable.ref
  protected _rejectionReason: Error | undefined = undefined;

  @observable
  protected _name: string = "";

  @observable
  protected _btcLegacyAddress: string = "";

  @observable
  protected _bech32Address: string = "";
  @observable
  protected _ethereumHexAddress: string = "";
  @observable
  protected _starknetHexAddress: string = "";
  @observable
  protected _bitcoinAddress:
    | {
        bech32Address: string;
        paymentType: SupportedPaymentType;
        masterFingerprintHex?: string;
        derivationPath?: string;
      }
    | undefined = undefined;
  @observable
  protected _isNanoLedger: boolean = false;
  @observable
  protected _isKeystone: boolean = false;

  @observable
  protected _txTypeInProgress: string = "";

  protected _pubKey: Uint8Array;

  protected hasInited = false;

  protected makeSendTokenTxFns: ((
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) => MakeTxResponse | undefined)[] = [];

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly sharedContext: AccountSharedContext,
    protected readonly opts: AccountSetOpts
  ) {
    makeObservable(this);

    this._pubKey = new Uint8Array();

    if (opts.autoInit) {
      this.init();
    }
  }

  getOWallet(): Promise<OWallet | undefined> {
    return this.sharedContext.getOWallet();
  }

  registerMakeSendTokenFn(
    fn: (
      amount: string,
      currency: AppCurrency,
      recipient: string
    ) => MakeTxResponse | undefined
  ) {
    this.makeSendTokenTxFns.push(fn);
  }

  protected async enable(chainId: string): Promise<void> {
    const modularChainInfo = this.chainGetter.getModularChain(chainId);

    if ("cosmos" in modularChainInfo) {
      if (this.opts.suggestChain) {
        const owallet = await this.sharedContext.getOWallet();
        if (this.opts.suggestChainFn) {
          await this.sharedContext.suggestChain(async () => {
            if (owallet && this.opts.suggestChainFn) {
              await this.opts.suggestChainFn(
                owallet,
                this.chainGetter.getChain(chainId)
              );
            }
          });
        } else {
          await this.sharedContext.suggestChain(async () => {
            if (owallet) {
              await owallet.experimentalSuggestChain(
                this.chainGetter.getChain(chainId).embedded
              );
            }
          });
        }
      }
    }
    await this.sharedContext.enable(chainId);
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

    const owallet = yield* toGenerator(this.sharedContext.getOWallet());
    if (!owallet) {
      this._walletStatus = WalletStatus.NotExist;
      return;
    }

    this._walletVersion = owallet.version;

    try {
      yield this.enable(this.chainId);
    } catch (e) {
      console.log(e);
      this._walletStatus = WalletStatus.Rejected;
      this._rejectionReason = e;
      return;
    }

    const isBitcoin =
      "bitcoin" in this.chainGetter.getModularChain(this.chainId);

    yield this.sharedContext.getKeyMixed(
      this.chainId,
      false,
      isBitcoin,
      (res) => {
        if (res.status === "fulfilled") {
          const key = res.value;
          if ("bech32Address" in key) {
            this._bech32Address = key.bech32Address;
            this._ethereumHexAddress = key.ethereumHexAddress;
            this._starknetHexAddress = "";
            this._isNanoLedger = key.isNanoLedger;
            this._isKeystone = key.isKeystone;
            this._name = key.name;
            this._pubKey = key.pubKey;
          } else if ("paymentType" in key) {
            this._bech32Address = "";
            this._ethereumHexAddress = "";
            this._starknetHexAddress = "";
            this._btcLegacyAddress = "";
            this._bitcoinAddress = {
              bech32Address: key.address,
              paymentType: key.paymentType,
              masterFingerprintHex: key.masterFingerprintHex,
              derivationPath: key.derivationPath,
            };
            this._isNanoLedger = key.isNanoLedger;
            this._isKeystone = false;
            this._name = key.name;
            this._pubKey = key.pubKey;
          } else {
            this._bech32Address = "";
            this._ethereumHexAddress = "";
            this._starknetHexAddress = key.hexAddress;
            this._isNanoLedger = key.isNanoLedger;
            this._isKeystone = false;
            this._name = key.name;
            this._pubKey = key.pubKey;
          }

          // Set the wallet status as loaded after getting all necessary infos.
          this._walletStatus = WalletStatus.Loaded;
        } else {
          // Caught error loading key
          // Reset properties, and set status to Rejected
          this._bech32Address = "";
          this._ethereumHexAddress = "";
          this._starknetHexAddress = "";
          this._isNanoLedger = false;
          this._isKeystone = false;
          this._name = "";
          this._pubKey = new Uint8Array(0);

          this._walletStatus = WalletStatus.Rejected;
          this._rejectionReason = res.reason;
        }

        if (this._walletStatus !== WalletStatus.Rejected) {
          // Reset previous rejection error message
          this._rejectionReason = undefined;
        }
      }
    );
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
    this._ethereumHexAddress = "";
    this._starknetHexAddress = "";
    this._isNanoLedger = false;
    this._isKeystone = false;
    this._name = "";
    this._pubKey = new Uint8Array(0);
    this._rejectionReason = undefined;
  }

  get walletVersion(): string | undefined {
    return this._walletVersion;
  }

  @computed
  get isReadyToSendTx(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  get btcLegacyAddress(): string {
    return this._btcLegacyAddress;
  }

  /**
   * @deprecated Use `isReadyToSendTx`
   */
  @computed
  get isReadyToSendMsgs(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  makeSendTokenTx(
    amount: string,
    currency: AppCurrency,
    recipient: string
  ): MakeTxResponse {
    for (let i = 0; i < this.makeSendTokenTxFns.length; i++) {
      const fn = this.makeSendTokenTxFns[i];

      const res = fn(amount, currency, recipient);
      if (res) {
        return res;
      }
    }

    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    throw new Error(`Unsupported type of currency (${denomHelper.type})`);
  }

  get walletStatus(): WalletStatus {
    return this._walletStatus;
  }

  get rejectionReason(): Error | undefined {
    return this._rejectionReason;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get base58Address(): string {
    return getBase58Address(this._ethereumHexAddress);
  }

  get pubKey(): Uint8Array {
    return this._pubKey.slice();
  }

  get addressDisplay(): string {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (
      this.chainId?.includes("eip155") &&
      !chainInfo.features?.includes("base58-address")
    ) {
      return this._ethereumHexAddress;
    } else if (chainInfo.features?.includes("base58-address")) {
      return this.base58Address;
    }
    return this._bech32Address;
  }

  get isNanoLedger(): boolean {
    return this._isNanoLedger;
  }

  get isKeystone(): boolean {
    return this._isKeystone;
  }

  /**
   * Returns the tx type in progress waiting to be committed.
   * If there is no tx type in progress, this returns an empty string ("").
   */
  get txTypeInProgress(): string {
    return this._txTypeInProgress;
  }

  /**
   * @deprecated Use `txTypeInProgress`
   */
  get isSendingMsg(): string | boolean {
    return this.txTypeInProgress;
  }

  get hasEthereumHexAddress(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.evm != null ||
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign")
    );
  }

  get ethereumHexAddress(): string {
    return this._ethereumHexAddress;
  }

  get starknetHexAddress(): string {
    return this._starknetHexAddress;
  }

  get bitcoinAddress():
    | {
        bech32Address: string;
        paymentType: SupportedPaymentType;
        masterFingerprintHex?: string;
        derivationPath?: string;
      }
    | undefined {
    return this._bitcoinAddress;
  }
}

export class AccountSetBaseSuper extends AccountSetBase {
  constructor(...params: ConstructorParameters<typeof AccountSetBase>) {
    super(...params);

    makeObservable(this);
  }

  @action
  setTxTypeInProgress(type: string): void {
    this._txTypeInProgress = type;
  }
}

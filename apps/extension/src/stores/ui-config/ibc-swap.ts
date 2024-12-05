import { KVStore, PrefixKVStore } from "@owallet/common";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { ChainStore } from "../chain";
import { computedFn } from "mobx-utils";
import { IChainInfoImpl } from "@owallet/stores";
import { AppCurrency } from "@owallet/types";

export class IBCSwapConfig {
  protected readonly kvStore: KVStore;

  @observable
  protected _lastAmountInChainId: string = "";
  @observable
  protected _lastAmountInMinimalDenom: string = "";
  @observable
  protected _lastAmountOutChainId: string = "";
  @observable
  protected _lastAmountOutMinimalDenom: string = "";

  @observable
  protected _lastSlippage: string = "0.5";
  @observable
  protected _lastSlippageIsCustom: boolean = false;

  constructor(kvStore: KVStore, protected readonly chainStore: ChainStore) {
    this.kvStore = new PrefixKVStore(kvStore, "ibc-swap");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<{
      lastAmountInChainId: string;
      lastAmountInMinimalDenom: string;
      lastAmountOutChainId: string;
      lastAmountOutMinimalDenom: string;
    }>("ibc-swap-amount-in-out-info");
    if (saved) {
      runInAction(() => {
        if (saved.lastAmountInChainId) {
          this._lastAmountInChainId = saved.lastAmountInChainId;
        }
        if (saved.lastAmountInMinimalDenom) {
          this._lastAmountInMinimalDenom = saved.lastAmountInMinimalDenom;
        }
        if (saved.lastAmountOutChainId) {
          this._lastAmountOutChainId = saved.lastAmountOutChainId;
        }
        if (saved.lastAmountOutMinimalDenom) {
          this._lastAmountOutMinimalDenom = saved.lastAmountOutMinimalDenom;
        }
      });
    }

    const savedSlippage = await this.kvStore.get<{
      lastSlippage: string;
      lastSlippageIsCustom: boolean;
    }>("ibc-swap-slippage");
    if (savedSlippage) {
      runInAction(() => {
        if (savedSlippage.lastSlippage != null) {
          this._lastSlippage = savedSlippage.lastSlippage;
        }
        if (savedSlippage.lastSlippageIsCustom != null) {
          this._lastSlippageIsCustom = savedSlippage.lastSlippageIsCustom;
        }
      });
    }

    autorun(() => {
      this.kvStore.set("ibc-swap-amount-in-out-info", {
        lastAmountInChainId: this._lastAmountInChainId,
        lastAmountInMinimalDenom: this._lastAmountInMinimalDenom,
        lastAmountOutChainId: this._lastAmountOutChainId,
        lastAmountOutMinimalDenom: this._lastAmountOutMinimalDenom,
      });
    });

    autorun(() => {
      this.kvStore.set("ibc-swap-slippage", {
        lastSlippage: this._lastSlippage,
        lastSlippageIsCustom: this._lastSlippageIsCustom,
      });
    });
  }

  getAmountInChainInfo = computedFn((): IChainInfoImpl => {
    if (
      this._lastAmountInChainId &&
      this.chainStore.hasChain(this._lastAmountInChainId) &&
      this.chainStore.isEnabledChain(this._lastAmountInChainId)
    ) {
      return this.chainStore.getChain(this._lastAmountInChainId);
    }

    return this.chainStore.chainInfosInUI[0];
  });

  @action
  setAmountInChainId(chainId: string) {
    this._lastAmountInChainId = chainId;
  }

  getAmountInCurrency = computedFn((): AppCurrency => {
    if (this._lastAmountInMinimalDenom) {
      const currency = this.getAmountInChainInfo().findCurrency(
        this._lastAmountInMinimalDenom
      );
      if (currency) {
        return currency;
      }
    }

    return this.getAmountInChainInfo().currencies[0];
  });

  @action
  setAmountInMinimalDenom(denom: string) {
    this._lastAmountInMinimalDenom = denom;
  }

  getAmountOutChainInfo = computedFn((): IChainInfoImpl => {
    if (
      this._lastAmountOutChainId &&
      this.chainStore.hasChain(this._lastAmountOutChainId)
    ) {
      return this.chainStore.getChain(this._lastAmountOutChainId);
    }

    if (this.getAmountInChainInfo().chainIdentifier !== "osmosis") {
      const findIndex = this.chainStore.chainInfosInUI.findIndex(
        (c) => c.chainIdentifier === "osmosis"
      );
      if (findIndex >= 0) {
        return this.chainStore.chainInfosInUI[findIndex];
      }
    }

    if (this.chainStore.chainInfosInUI.length >= 2) {
      return this.chainStore.chainInfosInUI[1];
    }

    const find = this.chainStore.chainInfos.find((chainInfo) => {
      return (
        chainInfo.chainIdentifier !==
        this.getAmountInChainInfo().chainIdentifier
      );
    });
    if (find) {
      return find;
    }
    return this.chainStore.chainInfos[0];
  });

  @action
  setAmountOutChainId(chainId: string) {
    this._lastAmountOutChainId = chainId;
  }

  getAmountOutCurrency = computedFn((): AppCurrency => {
    if (this._lastAmountOutMinimalDenom) {
      return this.getAmountOutChainInfo().forceFindCurrency(
        this._lastAmountOutMinimalDenom
      );
    }

    return this.getAmountOutChainInfo().currencies[0];
  });

  @action
  setAmountOutMinimalDenom(denom: string) {
    this._lastAmountOutMinimalDenom = denom;
  }

  get slippage(): string {
    return this._lastSlippage;
  }

  @action
  setSlippage(slippage: string) {
    this._lastSlippage = slippage;
  }

  get slippageIsCustom(): boolean {
    return this._lastSlippageIsCustom;
  }

  @action
  setSlippageIsCustom(isCustom: boolean) {
    this._lastSlippageIsCustom = isCustom;
  }

  get slippageIsValid(): boolean {
    const trim = this.slippage.trim();

    if (trim === "") {
      return false;
    }

    const num = parseFloat(trim);
    if (Number.isNaN(num)) {
      return false;
    }

    return num >= 0;
  }

  get slippageNum(): number {
    const trim = this.slippage.trim();
    return parseFloat(trim);
  }

  async removeStatesWhenErrorOccurredDuringRendering() {
    await this.kvStore.set("ibc-swap-amount-in-out-info", null);
    await this.kvStore.set("ibc-swap-slippage", null);
  }
}

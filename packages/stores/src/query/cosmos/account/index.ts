import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { AuthAccount } from "./types";
import { computed, makeObservable } from "mobx";
import { BaseAccount } from "@owallet/cosmos";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryAccountInner extends ObservableChainQuery<AuthAccount> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/auth/v1beta1/accounts/${bech32Address}`
    );

    makeObservable(this);
  }

  @computed
  get sequence(): string {
    if (!this.response) {
      return "0";
    }

    try {
      const account = BaseAccount.fromProtoJSON(
        this.response.data,
        this.bech32Address
      );
      return account.getSequence().toString();
    } catch {
      return "0";
    }
  }
}

export class ObservableQueryAccount extends ObservableChainQueryMap<AuthAccount> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address) => {
      return new ObservableQueryAccountInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(bech32Address: string): ObservableQueryAccountInner {
    return this.get(bech32Address) as ObservableQueryAccountInner;
  }
}

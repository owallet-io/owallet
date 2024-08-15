import { ChainStore } from "../chain";
import {
  AccountStore,
  AccountWithAll,
  ChainInfoInner,
  CoinGeckoPriceStore,
  KeyRingStore,
  QueriesStore,
  QueriesWrappedTron,
  QueryError,
} from "@owallet/stores";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { computed, makeObservable, action } from "mobx";
import {
  ChainIdEnum,
  DenomHelper,
  getOasisAddress,
  MapChainIdToNetwork,
} from "@owallet/common";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@owallet/cosmos";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { ChainInfoWithEmbed } from "@owallet/background";
import { BinarySortArray } from "./sort";

export interface ViewToken {
  //TODO: need check type for chain info
  chainInfo: ChainInfo;
  token: CoinPretty;
  price: PricePretty | undefined;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export interface RawToken {
  currency: AppCurrency;
  amount: string;
}

export interface RawChainInfo {
  chainId: ChainIdEnum & string;
  chainName: string;
  chainImage: string;
}

export interface ViewRawToken {
  chainInfo: RawChainInfo;
  token: RawToken;
  price: string;
}

export interface ViewTokenData {
  tokens: ViewRawToken[];
  totalBalance: string;
  chainInfo: RawChainInfo;
}

interface ViewChainAddress {
  chainInfo: ChainInfoInner<ChainInfoWithEmbed>;
  address: string;
}

/**
 * Create huge queries.
 * Because it is huge, it was created separately to separate the logic.
 * However, as the name suggests, it creates a huge query, so it should be used only when absolutely necessary.
 * If you need a specific balance, you should not take all the balances and find and use only one of them.
 * Use only when absolutely necessary
 */
export class HugeQueriesStore {
  protected static zeroDec = new Dec(0);

  protected balanceBinarySort: BinarySortArray<ViewToken>;
  protected delegationBinarySort: BinarySortArray<ViewToken>;
  protected unbondingBinarySort: BinarySortArray<{
    viewToken: ViewToken;
    completeTime: string;
  }>;
  protected claimableRewardsBinarySort: BinarySortArray<ViewToken>;
  constructor(
    protected readonly chainStore: ChainStore,
    //TODO: need check type for queriesStore and accountStore
    public readonly queriesStore: QueriesStore<QueriesWrappedTron>,
    public readonly accountStore: AccountStore<AccountWithAll>,
    protected readonly priceStore: CoinGeckoPriceStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);
  }

  // Key: {chainIdentifier}/{coinMinimalDenom}
  @computed
  protected get allKnownBalancesMap(): Map<string, ViewToken> {
    const map = new Map<string, ViewToken>();

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyRingStore.keyRingLedgerAddresses,
        false
      );

      if (address === "") {
        continue;
      }

      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryBalance = queries.queryBalances.getQueryBech32Address(address);
      const currencies = [...chainInfo.currencies];

      if (chainInfo.stakeCurrency) {
        currencies.push(chainInfo.stakeCurrency);
      }

      this.setCurrencyIntoMap(currencies, map, queryBalance, chainInfo);
    }

    return map;
  }

  mapStakeCurrencyBalance(currency, map, queryBalance, chainInfo) {
    const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
      currency.coinMinimalDenom
    }`;

    const balance = queryBalance.stakable?.balance;

    map.set(key, {
      chainInfo,
      token: balance,
      price: currency.coinGeckoId
        ? this.priceStore.calculatePrice(balance)
        : undefined,
      isFetching: queryBalance.stakable.isFetching,
      error: queryBalance.stakable.error,
    });
  }

  mapNonStakeCurrencyBalance(currency, map, queryBalance, chainInfo) {
    const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
      currency.coinMinimalDenom
    }`;

    const balance = queryBalance.getBalance(currency);

    if (balance) {
      map.set(key, {
        chainInfo,
        token: balance.balance,
        price: currency.coinGeckoId
          ? this.priceStore.calculatePrice(balance.balance)
          : undefined,
        isFetching: balance.isFetching,
        error: balance.error,
      });
    }
  }

  protected setCurrencyIntoMap(currencies, map, queryBalance, chainInfo) {
    for (const currency of currencies) {
      const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
        currency.coinMinimalDenom
      }`;

      if (!map.has(key)) {
        if (
          chainInfo.stakeCurrency?.coinMinimalDenom ===
          currency.coinMinimalDenom
        ) {
          this.mapStakeCurrencyBalance(currency, map, queryBalance, chainInfo);
        } else {
          this.mapNonStakeCurrencyBalance(
            currency,
            map,
            queryBalance,
            chainInfo
          );
        }
      }
    }
  }

  @computed
  get allKnownBalances(): ViewToken[] {
    return Array.from(this.allKnownBalancesMap.values());
  }

  protected sortByPrice = (a: ViewToken, b: ViewToken) => {
    const aPrice =
      this.priceStore.calculatePrice(a.token)?.toDec() ??
      HugeQueriesStore.zeroDec;
    const bPrice =
      this.priceStore.calculatePrice(b.token)?.toDec() ??
      HugeQueriesStore.zeroDec;

    if (aPrice.equals(bPrice)) {
      return 0;
    } else if (aPrice.gt(bPrice)) {
      return -1;
    } else {
      return 1;
    }
  };

  @computed
  get getAllChainMap(): Map<string, ViewChainAddress> {
    const map = new Map<string, ViewChainAddress>();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyRingStore.keyRingLedgerAddresses,
        false
      );
      map.set(chainInfo.chainId, {
        address,
        chainInfo,
      });
    }
    return map;
  }

  @computed
  get getAllAddrByChain(): Record<string, string> {
    const data: Record<string, string> = {};
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyRingStore.keyRingLedgerAddresses
      );
      const mapChainNetwork = MapChainIdToNetwork[chainInfo.chainId];
      if (!mapChainNetwork) continue;
      data[mapChainNetwork] =
        chainInfo.chainId === ChainIdEnum.OasisSapphire ||
        chainInfo.chainId === ChainIdEnum.OasisEmerald
          ? getOasisAddress(address)
          : address;
    }
    return data;
  }

  @computed
  get setupDoneAllChain(): boolean {
    const allChainMap = Array.from([...this.getAllChainMap.entries()]);
    if (allChainMap.length == this.chainStore.chainInfosInUI.length)
      return true;
    return false;
  }

  getAllBalances = computedFn((allowIBCToken: boolean): ViewToken[] => {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          !allowIBCToken &&
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          continue;
        }

        const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
          currency.coinMinimalDenom
        }`;
        const viewToken = this.allKnownBalancesMap.get(key);
        if (viewToken) {
          res.push(viewToken);
        }
      }
    }
    return res.sort(this.sortByPrice);
  });

  filterLowBalanceTokens = computedFn(
    (viewTokens: ViewToken[]): ViewToken[] => {
      return viewTokens.filter((viewToken) => {
        // Hide the unknown ibc tokens.
        if (
          "paths" in viewToken.token.currency &&
          !viewToken.token.currency.originCurrency
        ) {
          return false;
        }

        // If currency has coinGeckoId, hide the low price tokens (under $1)
        if (viewToken.token.currency.coinGeckoId != null) {
          return (
            this.priceStore
              .calculatePrice(viewToken.token, "usd")
              ?.toDec()
              .gte(new Dec("1")) ?? false
          );
        }

        // Else, hide the low balance tokens (under 0.001)
        return viewToken.token.toDec().gte(new Dec("0.001"));
      });
    }
  );

  @computed
  get stakables(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      if (!chainInfo.stakeCurrency) {
        continue;
      }
      const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
        chainInfo.stakeCurrency.coinMinimalDenom
      }`;
      const viewToken = this.allKnownBalancesMap.get(key);
      if (viewToken) {
        res.push(viewToken);
      }
    }
    return res.sort(this.sortByPrice);
  }

  @computed
  get notStakbles(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        if (
          currency.coinMinimalDenom ===
          chainInfo.stakeCurrency?.coinMinimalDenom
        ) {
          continue;
        }
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          continue;
        }

        const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
          currency.coinMinimalDenom
        }`;
        const viewToken = this.allKnownBalancesMap.get(key);
        if (viewToken) {
          res.push(viewToken);
        }
      }
    }
    return res.sort(this.sortByPrice);
  }

  @computed
  get ibcTokens(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
            currency.coinMinimalDenom
          }`;
          const viewToken = this.allKnownBalancesMap.get(key);
          if (viewToken) {
            res.push(viewToken);
          }
        }
      }
    }
    return res.sort(this.sortByPrice);
  }

  @computed
  get delegations(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryDelegation =
        queries.cosmos.queryDelegations.getQueryBech32Address(
          account.bech32Address
        );

      if (!queryDelegation.total) {
        continue;
      }

      res.push({
        chainInfo,
        token: queryDelegation.total,
        price: this.priceStore.calculatePrice(queryDelegation.total),
        isFetching: queryDelegation.isFetching,
        error: queryDelegation.error,
      });
    }
    return res.sort(this.sortByPrice);
  }

  @computed
  get unbondings(): {
    viewToken: ViewToken;
    completeTime: string;
  }[] {
    const res: {
      viewToken: ViewToken;
      completeTime: string;
    }[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
          account.bech32Address
        );

      for (const unbonding of queryUnbonding.unbondings) {
        for (const entry of unbonding.entries) {
          if (!chainInfo.stakeCurrency) {
            continue;
          }
          const balance = new CoinPretty(
            chainInfo.stakeCurrency,
            entry.balance
          );
          res.push({
            viewToken: {
              chainInfo,
              token: balance,
              price: this.priceStore.calculatePrice(balance),
              isFetching: queryUnbonding.isFetching,
              error: queryUnbonding.error,
            },
            completeTime: entry.completion_time,
          });
        }
      }
    }
    return res;
  }
  @action
  protected updateClaimableRewards(): void {
    const prevKeyMap = new Map(
      this.claimableRewardsBinarySort.indexForKeyMap()
    );

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      );

      if (
        queryRewards.stakableReward &&
        queryRewards.stakableReward.toDec().gt(new Dec(0))
      ) {
        const key = `${chainInfo.chainId}/${account.bech32Address}`;
        prevKeyMap.delete(key);
        this.claimableRewardsBinarySort.pushAndSort(key, {
          chainInfo,
          token: queryRewards.stakableReward,
          price: this.priceStore.calculatePrice(queryRewards.stakableReward),
          isFetching: queryRewards.isFetching,
          error: queryRewards.error,
        });
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.claimableRewardsBinarySort.remove(removedKey);
    }
  }

  @computed
  get claimableRewards(): ReadonlyArray<ViewToken> {
    return this.claimableRewardsBinarySort.arr;
  }
}

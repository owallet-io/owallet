import {
  AccountStore,
  AccountWithAll,
  ChainInfoInner,
  CoinGeckoPriceStore,
  CosmosQueries,
  KeyRingStore,
  QueriesStore,
  QueriesWrappedTron,
  // IAccountStore,
  // IChainInfoImpl,
  // IQueriesStore,
  QueryError,
} from "@owallet/stores";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { computed, makeObservable } from "mobx";
import {
  ChainIdEnum,
  DenomHelper,
  getOasisAddress,
  MapChainIdToNetwork,
} from "@owallet/common";
import { computedFn } from "mobx-utils";
import { ChainIdHelper } from "@owallet/cosmos";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { ChainStore } from "../chain";
import { ChainInfoWithEmbed } from "@owallet/background";

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
  chainImage: RawChainInfo;
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
 * 거대한 쿼리를 만든다.
 * 거대하기 때문에 로직을 분리하기 위해서 따로 만들었다.
 * 근데 이름그대로 거대한 쿼리를 만들기 때문에 꼭 필요할때만 써야한다.
 * 특정 밸런스가 필요하다고 여기서 balance를 다 가져와서 그 중에 한개만 찾아서 쓰고 그러면 안된다.
 * 꼭 필요할때만 쓰자
 */
export class HugeQueriesStore {
  protected static zeroDec = new Dec(0);

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

    for (const chainInfo of this.chainStore.chainInfos) {
      const account = this.getAccount(chainInfo.chainId);
      const address = this.getAddress(account);
      if (address === "") {
        continue;
      }

      const queryBalance = this.getQueryBalance(chainInfo.chainId, address);
      const currencies = this.getCurrencies(chainInfo);

      this.addBalancesToMap(map, chainInfo, queryBalance, currencies);
    }

    return map;
  }

  private getAccount(chainId: string): any {
    return this.accountStore.getAccount(chainId);
  }

  private getAddress(account: any): string {
    return account.getAddressDisplay(
      this.keyRingStore.keyRingLedgerAddresses,
      false
    );
  }

  private getQueryBalance(chainId: string, address: string): any {
    const queries = this.queriesStore.get(chainId);
    return queries.queryBalances.getQueryBech32Address(address);
  }

  private getCurrencies(chainInfo: ChainInfo): any[] {
    const currencies = [...chainInfo.currencies];
    if (chainInfo.stakeCurrency) {
      currencies.push(chainInfo.stakeCurrency);
    }
    return currencies;
  }

  private addBalancesToMap(
    map: Map<string, ViewToken>,
    chainInfo: ChainInfo,
    queryBalance: any,
    currencies: any[]
  ): void {
    for (const currency of currencies) {
      const key = `${ChainIdHelper.parse(chainInfo.chainId).identifier}/${
        currency.coinMinimalDenom
      }`;
      if (!map.has(key)) {
        this.addCurrencyToMap(map, key, chainInfo, queryBalance, currency);
      }
    }
  }

  private addCurrencyToMap(
    map: Map<string, ViewToken>,
    key: string,
    chainInfo: ChainInfo,
    queryBalance: any,
    currency: any
  ): void {
    if (
      chainInfo.stakeCurrency?.coinMinimalDenom === currency.coinMinimalDenom
    ) {
      const balance = queryBalance.stakable?.balance;
      if (balance) {
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
    } else {
      const balance = queryBalance.getBalance(currency);
      if (balance && this.shouldIncludeBalance(balance.balance, currency)) {
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
  }

  private shouldIncludeBalance(balance: any, currency: any): boolean {
    return !(
      balance.toDec().equals(HugeQueriesStore.zeroDec) &&
      new DenomHelper(currency.coinMinimalDenom).type === "native"
    );
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
    if (allChainMap.length == this.chainStore.chainInfos.length) return true;
    return false;
  }

  getAllBalances = computedFn((allowIBCToken: boolean): ViewToken[] => {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfos) {
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
    for (const chainInfo of this.chainStore.chainInfos) {
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
}

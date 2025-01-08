import { ChainStore } from "../chain";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  AccountStore,
  QueriesStore,
  QueryError,
  QueriesWrappedTron,
  AccountWithAll,
  KeyRingStore,
} from "@owallet/stores";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { action, autorun, computed } from "mobx";
import {
  ChainIdEnum,
  DenomHelper,
  getOasisAddress,
  MapChainIdToNetwork,
} from "@owallet/common";
import { computedFn } from "mobx-utils";
import { BinarySortArray } from "./sort";
import { ChainInfo } from "@owallet/types";
import { ChainIdHelper } from "@owallet/cosmos";

interface ViewToken {
  chainInfo: ChainInfo;
  token: CoinPretty;
  price: PricePretty | undefined;
  isFetching: boolean;
  error: QueryError<any> | undefined;
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

  protected balanceBinarySort: BinarySortArray<ViewToken>;
  protected delegationBinarySort: BinarySortArray<ViewToken>;
  protected unbondingBinarySort: BinarySortArray<{
    viewToken: ViewToken;
    completeTime: string;
  }>;
  protected claimableRewardsBinarySort: BinarySortArray<ViewToken>;

  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: QueriesStore<QueriesWrappedTron>,
    protected readonly accountStore: AccountStore<AccountWithAll>,
    protected readonly priceStore: CoinGeckoPriceStore,
    protected readonly keyringStore: KeyRingStore
  ) {
    let balanceDisposal: (() => void) | undefined;
    this.balanceBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        balanceDisposal = autorun(() => {
          this.updateBalances();
        });
      },
      () => {
        if (balanceDisposal) {
          balanceDisposal();
        }
      }
    );
    let delegationDisposal: (() => void) | undefined;
    this.delegationBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        delegationDisposal = autorun(() => {
          this.updateDelegations();
        });
      },
      () => {
        if (delegationDisposal) {
          delegationDisposal();
        }
      }
    );
    let unbondingDisposal: (() => void) | undefined;
    this.unbondingBinarySort = new BinarySortArray<{
      viewToken: ViewToken;
      completeTime: string;
    }>(
      (a, b) => {
        return this.sortByPrice(a.viewToken, b.viewToken);
      },
      () => {
        unbondingDisposal = autorun(() => {
          this.updateUnbondings();
        });
      },
      () => {
        if (unbondingDisposal) {
          unbondingDisposal();
        }
      }
    );
    let claimableRewardsDisposal: (() => void) | undefined;
    this.claimableRewardsBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        claimableRewardsDisposal = autorun(() => {
          this.updateClaimableRewards();
        });
      },
      () => {
        if (claimableRewardsDisposal) {
          claimableRewardsDisposal();
        }
      }
    );
  }

  @action
  protected updateBalances() {
    const keysUsed = new Map<string, boolean>();
    const prevKeyMap = new Map(this.balanceBinarySort.indexForKeyMap());

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const mainCurrency = chainInfo.stakeCurrency || chainInfo.currencies[0];
      const address = account.getAddressDisplay(
        this.keyringStore.keyRingLedgerAddresses,
        false
      );
      if (!address) {
        continue;
      }

      const queries = this.queriesStore.get(chainInfo.chainId);

      const currencies = [...chainInfo.currencies];
      if (chainInfo.stakeCurrency) {
        currencies.push(chainInfo.stakeCurrency);
      }
      for (const currency of currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        const isERC20 = denomHelper.type === "erc20";
        const isMainCurrency =
          mainCurrency.coinMinimalDenom === currency.coinMinimalDenom;

        const queryBalance =
          queries.queryBalances.getQueryBech32Address(address);
        // const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
        const key = `${chainInfo.chainId}/${currency.coinMinimalDenom}`;
        if (!keysUsed.get(key)) {
          if (
            chainInfo.stakeCurrency?.coinMinimalDenom ===
            currency.coinMinimalDenom
          ) {
            const balance = queryBalance.stakable?.balance;

            if (!balance) {
              continue;
            }
            // If the balance is zero, don't show it.
            // 다시 제로 일때 보여주기 위해서 아래코드를 주석처리함
            // if (balance.toDec().equals(HugeQueriesStore.zeroDec)) {
            //   continue;
            // }

            keysUsed.set(key, true);
            prevKeyMap.delete(key);
            this.balanceBinarySort.pushAndSort(key, {
              chainInfo,
              token: balance,
              price: currency.coinMinimalDenom
                ? this.priceStore.calculatePrice(balance)
                : undefined,
              isFetching: queryBalance.stakable.isFetching,
              error: queryBalance.stakable.error,
            });
          } else {
            const balance = queryBalance.getBalance(currency);
            if (balance) {
              if (balance.balance.toDec().equals(HugeQueriesStore.zeroDec)) {
                const denomHelper = new DenomHelper(currency.coinMinimalDenom);
                // If the balance is zero and currency is "native" or "erc20", don't show it.
                if (
                  denomHelper.type === "native" ||
                  denomHelper.type === "erc20"
                ) {
                  // However, if currency is native currency and not ibc, and same with currencies[0],
                  // just show it as 0 balance.
                  if (
                    chainInfo.currencies.length > 0 &&
                    chainInfo.currencies[0].coinMinimalDenom ===
                      currency.coinMinimalDenom &&
                    !currency.coinMinimalDenom.startsWith("ibc/")
                  ) {
                    // 위의 if 문을 뒤집기(?) 귀찮아서 그냥 빈 if-else로 처리한다...
                  } else {
                    continue;
                  }
                }
              }

              keysUsed.set(key, true);
              prevKeyMap.delete(key);
              this.balanceBinarySort.pushAndSort(key, {
                chainInfo,
                token: balance.balance,
                price: currency.coinMinimalDenom
                  ? this.priceStore.calculatePrice(balance.balance)
                  : undefined,
                isFetching: balance.isFetching,
                error: balance.error,
              });
            }
          }
        }
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.balanceBinarySort.remove(removedKey);
    }
  }

  @computed
  get allKnownBalances(): ReadonlyArray<ViewToken> {
    return this.balanceBinarySort.arr;
  }

  getAllBalances = computedFn(
    (allowIBCToken: boolean): ReadonlyArray<ViewToken> => {
      const keys: Map<string, boolean> = new Map();
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
          // const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
          const key = `${chainInfo.chainId}/${currency.coinMinimalDenom}`;
          keys.set(key, true);
        }
      }
      return this.balanceBinarySort.arr.filter((viewToken) => {
        const key = viewToken[BinarySortArray.SymbolKey];
        return keys.get(key);
      });
    }
  );

  filterLowBalanceTokens = computedFn(
    (viewTokens: ReadonlyArray<ViewToken>): ViewToken[] => {
      return viewTokens.filter((viewToken) => {
        // Hide the unknown ibc tokens.
        if (
          "paths" in viewToken.token.currency &&
          !viewToken.token.currency.originCurrency
        ) {
          return false;
        }

        // If currency has coinGeckoId, hide the low price tokens (under $1)
        if (viewToken.token.currency.coinMinimalDenom != null) {
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
  filterBalanceTokensByChain = computedFn(
    (viewTokens: ReadonlyArray<ViewToken>, chainId: string): ViewToken[] => {
      return viewTokens.filter((viewToken) => {
        // Hide the unknown ibc tokens.
        if (
          "paths" in viewToken.token.currency &&
          !viewToken.token.currency.originCurrency
        ) {
          return false;
        }

        return viewToken.chainInfo.chainId === chainId;
      });
    }
  );

  @computed
  get stakables(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      if (!chainInfo.stakeCurrency) {
        continue;
      }
      // const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
      const key = `${chainInfo.chainId}/${chainInfo.stakeCurrency.coinMinimalDenom}`;
      keys.set(key, true);
    }
    return this.balanceBinarySort.arr.filter((viewToken) => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @computed
  get notStakbles(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
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
        // const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
        const key = `${chainInfo.chainId}/${currency.coinMinimalDenom}`;
        keys.set(key, true);
      }
    }
    return this.balanceBinarySort.arr.filter((viewToken) => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @computed
  get ibcTokens(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          // const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
          const key = `${chainInfo.chainId}/${currency.coinMinimalDenom}`;
          keys.set(key, true);
        }
      }
    }
    return this.balanceBinarySort.arr.filter((viewToken) => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @action
  protected updateDelegations(): void {
    const prevKeyMap = new Map(this.delegationBinarySort.indexForKeyMap());

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyringStore.keyRingLedgerAddresses,
        false
      );
      if (!address) {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryDelegation =
        queries.cosmos.queryDelegations.getQueryBech32Address(address);
      if (!queryDelegation.total) {
        continue;
      }

      const key = `${chainInfo.chainId}/${address}`;
      prevKeyMap.delete(key);
      this.delegationBinarySort.pushAndSort(key, {
        chainInfo,
        token: queryDelegation.total,
        price: this.priceStore.calculatePrice(queryDelegation.total),
        isFetching: queryDelegation.isFetching,
        error: queryDelegation.error,
      });
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.delegationBinarySort.remove(removedKey);
    }
  }

  @computed
  get delegations(): ReadonlyArray<ViewToken> {
    return this.delegationBinarySort.arr;
  }

  @action
  protected updateUnbondings(): void {
    const prevKeyMap = new Map(this.unbondingBinarySort.indexForKeyMap());

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyringStore.keyRingLedgerAddresses,
        false
      );
      if (!address) {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(address);

      for (let i = 0; i < queryUnbonding.unbondings.length; i++) {
        const unbonding = queryUnbonding.unbondings[i];
        for (let j = 0; j < unbonding.entries.length; j++) {
          const entry = unbonding.entries[j];
          if (!chainInfo.stakeCurrency) {
            continue;
          }
          const balance = new CoinPretty(
            chainInfo.stakeCurrency,
            entry.balance
          );

          const key = `${chainInfo.chainId}/${address}/${i}/${j}`;
          prevKeyMap.delete(key);
          this.unbondingBinarySort.pushAndSort(key, {
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

    for (const removedKey of prevKeyMap.keys()) {
      this.unbondingBinarySort.remove(removedKey);
    }
  }

  @computed
  get unbondings(): ReadonlyArray<{
    viewToken: ViewToken;
    completeTime: string;
  }> {
    return this.unbondingBinarySort.arr;
  }

  @action
  protected updateClaimableRewards(): void {
    const prevKeyMap = new Map(
      this.claimableRewardsBinarySort.indexForKeyMap()
    );

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyringStore.keyRingLedgerAddresses,
        false
      );
      if (!address) {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryRewards =
        queries.cosmos.queryRewards.getQueryBech32Address(address);

      if (
        queryRewards.stakableReward &&
        queryRewards.stakableReward.toDec().gt(new Dec(0))
      ) {
        const key = `${chainInfo.chainId}/${address}`;
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
  get getAllAddrByChain(): Record<string, string> {
    const data: Record<string, string> = {};
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const address = account.getAddressDisplay(
        this.keyringStore.keyRingLedgerAddresses
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
  get claimableRewards(): ReadonlyArray<ViewToken> {
    return this.claimableRewardsBinarySort.arr;
  }

  protected sortByPrice(a: ViewToken, b: ViewToken): number {
    const aPrice = a.price?.toDec() ?? HugeQueriesStore.zeroDec;
    const bPrice = b.price?.toDec() ?? HugeQueriesStore.zeroDec;

    if (aPrice.equals(bPrice)) {
      return 0;
    } else if (aPrice.gt(bPrice)) {
      return -1;
    } else {
      return 1;
    }
  }
}

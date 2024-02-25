import { computed, makeObservable, override } from 'mobx';
import { DenomHelper, KVStore } from '@owallet/common';
import { ChainGetter } from '../../common';
import { CoinPretty, Int } from '@owallet/unit';
import { BalanceRegistry, BalanceRegistryType, ObservableQueryBalanceInner } from '../balances';
import { Erc20ContractBalance } from './types';
import { ObservableCosmwasmContractChainQuery } from './contract-query';

export class ObservableQueryErc20Balance extends ObservableCosmwasmContractChainQuery<Erc20ContractBalance> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly bech32Address: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      balance: { address: bech32Address }
    });
  }

  protected canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== '';
  }
}

export class ObservableQueryErc20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryErc20Balance: ObservableQueryErc20Balance;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      // No need to set the url at initial.
      '',
      denomHelper
    );

    makeObservable(this);

    this.queryErc20Balance = new ObservableQueryErc20Balance(
      kvStore,
      chainId,
      chainGetter,
      denomHelper.contractAddress,
      bech32Address
    );
  }

  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryErc20Balance`.
  protected canFetch(): boolean {
    return false;
  }

  @override
  *fetch() {
    yield this.queryErc20Balance.fetch();
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find((cur) => cur.coinMinimalDenom === denom);

    // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.queryErc20Balance.response || !this.queryErc20Balance.response.data.balance) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(this.queryErc20Balance.response.data.balance));
  }
}

export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
  readonly type: BalanceRegistryType = 'erc20';

  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === 'erc20') {
      return new ObservableQueryErc20BalanceInner(this.kvStore, chainId, chainGetter, denomHelper, bech32Address);
    }
  }
}

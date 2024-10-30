import { ChainGetter, HasMapStore, ObservableQuery, QuerySharedContext } from '@owallet/stores';
import { Int } from '@owallet/unit';
import { computed, makeObservable } from 'mobx';

export interface ChainParameters {
  tronParameters: TronParameter[];
}

export interface TronParameter {
  key: string;
  value: number;
}

export class ObservableChainQuery<T = unknown, E = unknown> extends ObservableQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(sharedContext: QuerySharedContext, chainId: string, chainGetter: ChainGetter, url: string) {
    const chainInfo = chainGetter.getChain(chainId);

    super(sharedContext, chainInfo.rest, url);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableQueryChainParameterTronInner extends ObservableChainQuery<ChainParameters> {
  constructor(sharedContext: QuerySharedContext, chainId: string, chainGetter: ChainGetter) {
    super(sharedContext, chainId, chainGetter, `/api/chainparameters`);

    makeObservable(this);
  }

  @computed
  get bandwidthPrice(): Int {
    if (!this.response?.data?.tronParameters) {
      return new Int(1000);
    }
    const price = this.response.data.tronParameters.find(({ key }) => key === 'getTransactionFee');
    if (!price) return new Int(1000);
    return new Int(price.value);
  }
  @computed
  get energyPrice(): Int {
    if (!this.response?.data?.tronParameters) {
      return new Int(420);
    }
    const price = this.response.data.tronParameters.find(({ key }) => key === 'getEnergyFee');
    if (!price) return new Int(420);
    return new Int(price.value);
  }
}

export class ObservableQueryChainParameterTron extends HasMapStore<ObservableQueryChainParameterTronInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((key: string) => {
      return new ObservableQueryChainParameterTronInner(this.sharedContext, this.chainId, this.chainGetter);
    });
  }

  getQueryChainParameters(): ObservableQueryChainParameterTronInner {
    return new ObservableQueryChainParameterTronInner(this.sharedContext, this.chainId, this.chainGetter);
  }
}

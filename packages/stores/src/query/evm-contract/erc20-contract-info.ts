import { Erc20ContractTokenInfo } from './types';
import { KVStore } from '@owallet/common';
import { ObservableChainQueryMap } from '../chain-query';
import { ChainGetter } from '../../common';
import { computed } from 'mobx';
import { ObservableCosmwasmContractChainQuery } from './contract-query';

export class ObservableQueryErc20ContactInfoInner extends ObservableCosmwasmContractChainQuery<Erc20ContractTokenInfo> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly contractAddress: string) {
    super(kvStore, chainId, chainGetter, contractAddress, { token_info: {} });
  }

  @computed
  get tokenInfo(): Erc20ContractTokenInfo | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return this.response?.data?.token_info_response ?? this.response?.data;
  }
}

export class ObservableQueryErc20ContractInfo extends ObservableChainQueryMap<Erc20ContractTokenInfo> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryErc20ContactInfoInner(this.kvStore, this.chainId, this.chainGetter, contractAddress);
    });
  }

  getQueryContract(contractAddress: string): ObservableQueryErc20ContactInfoInner {
    return this.get(contractAddress) as ObservableQueryErc20ContactInfoInner;
  }
}

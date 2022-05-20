import { Erc20ContractTokenInfo, Result } from './types';
import { KVStore } from '@owallet/common';
import { ObservableChainQueryMap } from '../chain-query';
import { ChainGetter } from '../../common';
import { computed } from 'mobx';
import { ObservableEvmContractChainQuery } from './contract-query';

export class ObservableQueryErc20ContactInfoInner extends ObservableEvmContractChainQuery<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: '0x18160ddd'
        },
        'latest'
      ],
      id: 'erc20-total-supply'
    });
  }

  @computed
  get tokenInfo(): Erc20ContractTokenInfo | undefined {
    if (!this.response?.data) {
      return undefined;
    }

    const chainInfo = this.chainGetter.getChain(this._chainId);
    const currency = chainInfo.currencies.find((curency) =>
      curency.coinMinimalDenom.startsWith(`erc20:${this.contractAddress}`)
    );

    return {
      decimals: currency.coinDecimals,
      name: currency.coinMinimalDenom.split(':').pop(),
      symbol: currency.coinDenom,
      total_supply: BigInt(this.response.data.result).toString()
    };
  }
}

export class ObservableQueryErc20ContractInfo extends ObservableChainQueryMap<Result> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryErc20ContactInfoInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryErc20ContactInfoInner {
    return this.get(contractAddress) as ObservableQueryErc20ContactInfoInner;
  }
}

import { ObservableChainQuery } from '../../chain-query';
import { MintingInflation } from './types';
import { KVStore, getUrlV1Beta } from '@owallet/common';
import { ChainGetter } from '../../../common';
import { autorun } from 'mobx';

export class ObservableQueryMintingInfation extends ObservableChainQuery<MintingInflation> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, '/minting/inflation');
    autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);

      if (chainInfo.features && chainInfo.features.includes('ibc-go')) {
        this.setUrl(`/cosmos/mint/v1beta1/inflation`);
      }
    });
  }
}

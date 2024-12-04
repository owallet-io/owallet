import { IChainStore } from '@owallet/stores';
import { ChainInfo } from '@owallet/types';

export interface InternalChainStore<C extends ChainInfo = ChainInfo> extends IChainStore<C> {
  isInChainInfosInListUI(chainId: string): boolean;
}

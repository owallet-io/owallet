import { ChainInfoInner } from '@owallet/stores';
import { Txs } from '../abstract/txs';
import { ChainInfo } from '@owallet/types';

export class TxsCosmos extends Txs {
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
  }
  getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): ResTxsInfo[] {
    return;
  }
  getTxsByHash(txHash: string): ResTxsInfo {
    return;
  }
}

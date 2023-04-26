import { ChainInfoInner } from '@owallet/stores';
import { Txs } from '../abstract/txs';
import { ChainInfo } from '@owallet/types';
import { API } from '@src/common/api';

export class TxsCosmos extends Txs {
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      const query = [
        `message.sender='${params?.addressAccount}'`,
        params?.action !== 'All' ? `message.action='${params?.action}'` : ''
      ];
      const data = await API.getTxsLcdCosmos(
        this.currentChain.rest,
        this.txsHelper.removeEmptyElements(query),
        page,
        current_page * 10
        // this.infoApi.API_KEY
      );

      //   return Promise.resolve({
      //     total_page: 0,
      //     result: data,
      //     current_page
      //   });

      const rsConverted = this.txsHelper.cleanDataCosmosToStandFormat(
        data.tx_responses,
        this.currentChain,
        params?.addressAccount
      );
      return Promise.resolve({
        result: rsConverted,
        current_page,
        total_page: Math.ceil(parseInt(data?.pagination?.total) / page) || 1
      });
    } catch (error) {
      console.log('error: ', error);
      return Promise.reject(error);
    }
  }
  getTxsByHash(txHash: string): ResTxsInfo {
    return;
  }
}

import { Txs } from '../abstract/txs';
import { ChainInfoInner } from '@owallet/stores';
import { ChainInfo } from '@owallet/types';
import { API } from '../../../common/api';
import { ChainIdEnum } from '../enums';

export class TxsEth extends Txs {
  // private readonly
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.urlApi = this.txsHelper.BASE_API_TXS_URL[ChainIdEnum.Ethereum];
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): ResTxsInfo[] {
    try {
      const rs = await API.get(
        `/api/account/tokens?address=${params?.addressAccount}&start=${current_page}&limit=${page}`,
        { baseURL: this.urlApi }
      );
      console.log('rs: ', rs);
      return Promise.resolve(rs?.data);
    } catch (error) {
      Promise.reject(error);
    }
    return;
  }
  getTxsByHash(txHash: string): ResTxsInfo {
    return;
  }
}

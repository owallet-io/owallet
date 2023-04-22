import { Txs } from '../abstract/txs';

import { ChainInfoInner } from '@owallet/stores';
import { ChainInfo } from '@owallet/types';
import { API } from '@src/common/api';
import { ChainIdEnum } from '../helpers/txs-enums';

export class TxsBsc extends Txs {
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.urlApi = this.txsHelper.INFO_API_EVM[ChainIdEnum.BNBChain].BASE_URL;
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<ResTxsInfo[]> {
    try {
      const rs = await API.get(
        `/api?module=account&action=txlist&address=${
          params?.addressAccount
        }&startblock=0&endblock=99999999&page=${current_page}&offset=${page}&sort=desc&apikey=${
          this.txsHelper.INFO_API_EVM[ChainIdEnum.BNBChain].API_KEY
        }`,
        { baseURL: this.urlApi }
      );
      if (rs?.data?.status === '1') {
        console.log('rs1: ', rs?.data?.result);
        return Promise.resolve(rs?.data?.result);
      }
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

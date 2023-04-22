import { Txs } from '../abstract/txs';
import { ChainInfoInner } from '@owallet/stores';
import { ChainInfo } from '@owallet/types';
import { API } from '../../../common/api';
import { ChainIdEnum } from '../helpers/txs-enums';

export class TxsEth extends Txs {
  // private readonly
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.urlApi = this.txsHelper.INFO_API_EVM[ChainIdEnum.Ethereum].BASE_URL;
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<ResTxs> {
    try {
      const rs = await API.get(
        `/api?module=account&action=txlist&address=${
          params?.addressAccount
        }&startblock=0&endblock=99999999&sort=desc&page=${current_page}&offset=${page}&apikey=${
          this.txsHelper.INFO_API_EVM[ChainIdEnum.Ethereum].API_KEY
        }`,
        { baseURL: this.urlApi }
      );
      const data: txsEthAndBscResult = rs.data;
      if (data?.status === '1') {
        // console.log('rs1: ', data?.result);
        const dataConverted = this.txsHelper.cleanDataResToStandFormat(
          data.result,
          this.currentChain,
          params?.addressAccount
        );
        console.log('dataConverted: ', dataConverted);

        return Promise.resolve(dataConverted);
      }
      console.log('rs2: ', data?.result);
    //   return Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
    return;
  }
  getTxsByHash(txHash: string): ResTxsInfo {
    return;
  }
}

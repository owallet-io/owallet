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
  async getTotalPage(
    params: ParamsFilterReqTxs,
    page: number
  ): Promise<number> {
    try {
      const rs = await API.get(
        `/api?module=account&action=txlist&address=${
          params?.addressAccount
        }&startblock=0&endblock=99999999&sort=desc&apikey=${
          this.txsHelper.INFO_API_EVM[ChainIdEnum.Ethereum].API_KEY
        }`,
        { baseURL: this.urlApi }
      );
      const data: txsEthAndBscResult = rs.data;
      if (data?.status === '1' && data.result?.length > 0) {
        return Promise.resolve(data.result?.length / page);
      }
      return Promise.resolve(0);
    } catch (error) {
      Promise.reject(error);
    }
  }

  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      const totalPage = await this.getTotalPage(params, page);
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
        const rsConverted = this.txsHelper.cleanDataEthAndBscResToStandFormat(
          data.result,
          this.currentChain,
          params?.addressAccount,
          current_page,
          totalPage
        );
        console.log('dataConverted: ', rsConverted);

        return Promise.resolve(rsConverted);
      }
      console.log('rs2: ', data?.result);
      return Promise.resolve({
        total_page: 0,
        result: [],
        current_page
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

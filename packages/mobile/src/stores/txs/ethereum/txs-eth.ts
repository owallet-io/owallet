import { Txs } from '../abstract/txs';
import { ChainInfoInner } from '@owallet/stores';
import { ChainInfo } from '@owallet/types';
import { API } from '../../../common/api';
import { ChainIdEnum } from '../helpers/txs-enums';

export class TxsEth extends Txs {
  // private readonly
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.infoApi = this.txsHelper.INFO_API_EVM[ChainIdEnum.Ethereum];
  }
  async getTotalPage(
    params: ParamsFilterReqTxs,
    page: number
  ): Promise<number> {
    try {
      const rs = await API.getTotalTxsEthAndBscPage(
        this.infoApi.BASE_URL,
        params?.addressAccount,
        this.infoApi.API_KEY
      );

      if (rs.result?.length > 0) {
        return Promise.resolve(Math.ceil(rs.result?.length / page));
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
      const data = await API.getTxsEthAndBsc(
        this.infoApi.BASE_URL,
        params?.addressAccount,
        current_page,
        page,
        this.infoApi.API_KEY
      );

      if (data?.status === '1') {
        const rsConverted = this.txsHelper.cleanDataEthAndBscResToStandFormat(
          data.result,
          this.currentChain,
          params?.addressAccount
        );
        return Promise.resolve({
          result: rsConverted,
          current_page,
          total_page: totalPage
        });
      }
      return Promise.resolve({
        total_page: 0,
        result: [],
        current_page
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async getTxsByHash(txHash: string, item?: ResTxsInfo): Promise<ResTxsInfo> {
    try {
        if(item && txHash){
            return Promise.resolve(item)
        }
        return Promise.reject('Not found item or txHash');
    } catch (error) {
       return  Promise.reject(error);
    }
  }
}

import { Txs } from "../abstract/txs";

import { ChainInfoInner } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
import { API } from "@src/common/api";
import { ChainIdEnum } from "@owallet/common";

export class TxsBsc extends Txs {
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.infoApi = this.txsHelper.INFO_API_EVM[ChainIdEnum.BNBChain];
  }
  async getTotalPageByToken(
    params: ParamsFilterReqTxs,
    page: number
  ): Promise<number> {
    try {
      const rs = await API.getTotalTxsEthAndBscPageByToken(
        this.infoApi.BASE_URL,
        params?.addressAccount,
        params?.token,
        this.infoApi.API_KEY
      );
      if (rs.result?.length > 0) {
        return Promise.resolve(Math.ceil(rs.result?.length / page));
      }
      return Promise.resolve(0);
    } catch (error) {
      throw new Error(error);
    }
  }
  async getTxsByToken(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    const totalPage = await this.getTotalPageByToken(params, page);
    const data = await API.getTxsEthAndBscByToken(
      this.infoApi.BASE_URL,
      params?.token,
      params?.addressAccount,
      current_page,
      page,
      this.infoApi.API_KEY
    );
    const rsConverted =
      this.txsHelper.cleanDataEthAndBscResByTokenToStandFormat(
        data.result,
        this.currentChain,
        params?.addressAccount
      );
    return Promise.resolve({
      result: rsConverted,
      current_page,
      total_page: totalPage || 1,
    });
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
      throw new Error(error);
    }
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      if (params?.token) {
        return this.getTxsByToken(page, current_page, params);
      }
      const totalPage = await this.getTotalPage(params, page);
      const data = await API.getTxsEthAndBsc(
        this.infoApi.BASE_URL,
        params?.addressAccount,
        current_page + 1,
        page,
        this.infoApi.API_KEY
      );

      if (data?.status === "1") {
        const rsConverted = this.txsHelper.cleanDataEthAndBscResToStandFormat(
          data.result,
          this.currentChain,
          params?.addressAccount
        );
        return Promise.resolve({
          result: rsConverted,
          current_page,
          total_page: totalPage,
        });
      }
      return Promise.resolve({
        total_page: 0,
        result: [],
        current_page,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
  getTxsByHash(
    txHash: string,
    addressAccount?: string
  ): Promise<Partial<ResTxsInfo>> {
    return;
  }
}

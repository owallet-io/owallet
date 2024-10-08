import { Txs } from "../abstract/txs";

import { ChainInfoInner } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
import { API } from "@src/common/api";
import { ChainIdEnum } from "@owallet/common";
import { Address } from "@owallet/crypto";

export class TxsTron extends Txs {
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.infoApi = this.txsHelper.INFO_API_EVM[ChainIdEnum.TRON];
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      const data = await API.getTxsTron(
        this.infoApi.BASE_URL,
        params?.addressAccount,
        current_page * page,
        page
      );

      if (data?.data && data?.total && page) {
        const rsConverted = this.txsHelper.cleanDataTronResToStandFormat(
          data.data,
          this.currentChain,
          params?.addressAccount
        );
        return Promise.resolve({
          result: rsConverted,
          current_page,
          total_page: Math.ceil(data?.total / page),
        });
      }
      return Promise.resolve({
        total_page: 0,
        result: [],
        current_page,
      });
    } catch (error) {
      console.log("error: ", error);
      return Promise.reject(error);
    }
  }
  getTxsByHash(txHash: string): ResTxsInfo {
    return;
  }
}

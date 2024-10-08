import { ChainInfoInner } from "@owallet/stores";
import { Txs } from "../abstract/txs";
import { ChainInfo } from "@owallet/types";
import { API } from "@src/common/api";
import { ChainIdEnum } from "@owallet/common";

export class TxsCosmos extends Txs {
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
  }
  async getTxsByToken(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    const query = `message.sender='${params?.addressAccount}'${
      this.currentChain.chainId == ChainIdEnum.Osmosis
        ? ""
        : ` AND transfer.amount CONTAINS '${params?.token}'`
    }`;
    const data = await API.getTxsRpcCosmos(
      this.currentChain.rpc,
      query,
      page,
      current_page
    );
    const rsConverted = this.txsHelper.cleanDataRpcCosmosToStandFormat(
      data.txs,
      this.currentChain,
      params?.addressAccount
    );
    return Promise.resolve({
      result: rsConverted,
      current_page,
      total_page: Math.ceil(parseInt(data?.total_count) / page) || 1,
    });
  }

  async getReceiveTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      if (params?.token) {
        return this.getTxsByToken(page, current_page, params);
      }
      const queryReceive = [
        `transfer.recipient='${params?.addressAccount}'`,
        params?.action !== "All" ? `message.action='${params?.action}'` : "",
      ];
      const dataRecipient = await API.getTxsLcdCosmos(
        this.currentChain.rest,
        this.txsHelper.removeEmptyElements(queryReceive),
        page,
        current_page * page
      );

      // const rs = await Promise.all([dataSender, dataRecipient]);
      const rsConverted = this.txsHelper.cleanDataCosmosToStandFormat(
        dataRecipient.tx_responses,
        this.currentChain,
        params?.addressAccount
      );
      return Promise.resolve({
        result: rsConverted,
        current_page,
        total_page:
          Math.ceil(parseInt(dataRecipient?.pagination?.total) / page) || 1,
      });
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
      const querySender = [
        `message.sender='${params?.addressAccount}'`,
        params?.action !== "All" ? `message.action='${params?.action}'` : "",
      ];
      const dataSender = await API.getTxsLcdCosmos(
        this.currentChain.rest,
        this.txsHelper.removeEmptyElements(querySender),
        page,
        current_page * page
      );

      // const rs = await Promise.all([dataSender, dataRecipient]);
      const rsConverted = this.txsHelper.cleanDataCosmosToStandFormat(
        dataSender.tx_responses,
        this.currentChain,
        params?.addressAccount
      );
      return Promise.resolve({
        result: rsConverted,
        current_page,
        total_page:
          Math.ceil(parseInt(dataSender?.pagination?.total) / page) || 1,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
  async getTxsByHash(
    txHash: string,
    addressAccount?: string
  ): Promise<Partial<ResTxsInfo>> {
    try {
      const txs = await API.getTxsByLCD<ResDetailLcdCosmos>({
        method: `/txs/${txHash}`,
        url: this.currentChain.rest,
      });
      return this.txsHelper.handleItemCosmos(
        txs?.tx_response,
        this.currentChain,
        addressAccount
      );
    } catch (error) {
      throw new Error(error);
    }
  }
  async getAllMethodActionTxs(
    addressAccount?: string
  ): Promise<Partial<ResTxs>> {
    try {
      const query = [`message.sender='${addressAccount}'`];
      const data = await API.getTxsLcdCosmos(
        this.currentChain.rest,
        query,
        100,
        1
      );
      return Promise.resolve({
        result: data?.tx_responses,
        total_page: 1,
        current_page: 1,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}

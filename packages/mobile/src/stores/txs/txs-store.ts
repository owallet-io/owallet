import { observable, action, makeObservable, computed } from "mobx";
import { Txs } from "./abstract/txs";
import { TxsEVM } from "./ethereum/txs-evm";
import { TxsCosmos } from "./cosmos/txs-cosmos";
import { ChainInfoInner } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
import { ChainIdEnum, NetworkEnum } from "@owallet/common";
import { TxsBitcoin } from "./bitcoin/txs-bitcoin";
export class TxsStore extends Txs {
  @observable
  public readonly txsEvm: TxsEVM;
  @observable
  public readonly txsBitcoin: TxsBitcoin;
  @observable
  public readonly txsCosmos: TxsCosmos;
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    makeObservable(this);
    this.txsEvm = new TxsEVM(current_chain);
    this.txsCosmos = new TxsCosmos(current_chain);
    this.txsBitcoin = new TxsBitcoin(current_chain);
  }

  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      if (this.networkType === NetworkEnum.Cosmos) {
        return await this.txsCosmos.getTxs(page, current_page, params);
      } else if (this.networkType === NetworkEnum.Evm) {
        return await this.txsEvm.getTxs(page, current_page, params);
      } else if (this.networkType === NetworkEnum.Bitcoin) {
        return await this.txsBitcoin.getTxs(page, current_page, params);
      }
      return;
    } catch (error) {
      console.log("error: ", error);
    }
  }
  async getTxsByHash(
    txHash: string,
    addressAccount?: string
  ): Promise<Partial<ResTxsInfo>> {
    try {
      if (this.networkType === NetworkEnum.Cosmos) {
        return await this.txsCosmos.getTxsByHash(txHash, addressAccount);
      } else if (this.networkType === NetworkEnum.Evm) {
        return this.txsEvm.getTxsByHash(txHash);
      }
      return;
    } catch (error) {
      console.log("error: ", error);
    }
  }
  async getReceiveTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      if (this.networkType === NetworkEnum.Cosmos) {
        return await this.txsCosmos.getReceiveTxs(page, current_page, params);
      }
      return;
    } catch (error) {
      console.log("error: ", error);
    }
  }
  async getAllMethodActionTxs(
    addressAccount?: string
  ): Promise<Partial<ResTxs>> {
    try {
      if (this.networkType === NetworkEnum.Cosmos) {
        return await this.txsCosmos.getAllMethodActionTxs(addressAccount);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}

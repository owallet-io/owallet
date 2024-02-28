import { ChainInfoInner } from "@owallet/stores";
import { Txs } from "../abstract/txs";
import { ChainInfo } from "@owallet/types";
import { TxsBsc } from "./txs-bsc";
import { TxsEth } from "./txs-eth";
import { TxsTron } from "./txs-tron";
import { TxsKawaii } from "./txs-kawaii";
import { ChainIdEnum } from "@owallet/common";
import { TxsCosmos } from "../cosmos/txs-cosmos";

export class TxsEVM extends Txs {
  protected readonly txsBsc: TxsBsc;
  protected readonly txsEth: TxsEth;
  protected readonly txsTron: TxsTron;
  protected readonly txsKawaii: TxsKawaii;
  protected readonly txsCosmos: TxsCosmos;
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.txsBsc = new TxsBsc(current_chain);
    this.txsEth = new TxsEth(current_chain);
    this.txsTron = new TxsTron(current_chain);
    this.txsCosmos = new TxsCosmos(current_chain);
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      switch (this.chainId) {
        case ChainIdEnum.Ethereum:
          return await this.txsEth.getTxs(page, current_page, params);
        case ChainIdEnum.BNBChain:
          return await this.txsBsc.getTxs(page, current_page, params);
        case ChainIdEnum.TRON:
          return await this.txsTron.getTxs(page, current_page, {
            ...params,
            addressAccount: params?.addressAccount,
          });
        default:
          break;
      }
      return;
    } catch (error) {
      console.log("error: ", error);
    }
  }

  async getAllMethodActionTxs(
    addressAccount?: string
  ): Promise<Partial<ResTxs>> {
    return Promise.resolve({} as ResTxs);
  }

  getTxsByHash(
    txHash: string,
    addressAccount?: string
  ): Promise<Partial<ResTxsInfo>> {
    switch (this.chainId) {
      case ChainIdEnum.Ethereum:
        return this.txsEth.getTxsByHash(txHash);
      case ChainIdEnum.BNBChain:
        return this.txsBsc.getTxsByHash(txHash);
      //   case ChainIdEnum.KawaiiEvm:
      //     return this.txsKawaii.getTxsByHash(txHash);
      //   case ChainIdEnum.TRON:
      //     return this.txsTron.getTxsByHash(txHash);
      default:
        break;
    }
    return;
  }
}

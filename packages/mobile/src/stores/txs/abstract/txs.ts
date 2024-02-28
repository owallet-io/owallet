import { ChainInfoInner } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
import { TxsHelper } from "../helpers/txs-helper";

export abstract class Txs {
  public readonly currentChain: ChainInfoInner<ChainInfo>;
  public readonly networkType: string;
  public readonly txsHelper: TxsHelper;
  public infoApi: IInfoApi;
  public readonly chainId: string;
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    this.currentChain = current_chain;
    this.networkType = current_chain?.networkType;
    this.chainId = current_chain?.chainId;
    this.txsHelper = new TxsHelper();
  }
  abstract getTxsByHash(
    txHash: string,
    addressAccount?: string
  ): Promise<Partial<ResTxsInfo>>;
  abstract getAllMethodActionTxs(
    addressAccount?: string
  ): Promise<Partial<ResTxs>>;
  abstract getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>>;
}

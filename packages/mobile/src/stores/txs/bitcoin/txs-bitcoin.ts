import { ChainInfoInner } from "@owallet/stores";
import { Txs } from "../abstract/txs";
import { ChainInfo } from "@owallet/types";
import { ChainIdEnum } from "@owallet/common";
import { Address } from "@owallet/crypto";
import { TxsBtcTestNet } from "./txs-btc-test";
import { TxsBtc } from "./txs-btc-main";

export class TxsBitcoin extends Txs {
  protected readonly txsBtcTest: TxsBtcTestNet;
  protected readonly txsBtc: TxsBtc;
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.txsBtcTest = new TxsBtcTestNet(current_chain);
    this.txsBtc = new TxsBtc(current_chain);
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      switch (this.chainId) {
        case ChainIdEnum.BitcoinTestnet:
          return await this.txsBtcTest.getTxs(page, current_page, params);
        case ChainIdEnum.Bitcoin:
          return await this.txsBtc.getTxs(page, current_page, params);
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
      //   case ChainIdEnum.Ethereum:
      //     return this.txsEth.getTxsByHash(txHash);
      //   case ChainIdEnum.BNBChain:
      //     return this.txsBsc.getTxsByHash(txHash);
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

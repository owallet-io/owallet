import { ChainInfoInner } from '@owallet/stores';
import { Txs } from '../abstract/txs';
import { ChainInfo } from '@owallet/types';
import { TxsBsc } from './txs-bsc';
import { TxsEth } from './txs-eth';
import { TxsTron } from './txs-tron';
import { TxsKawaii } from './txs-kawaii';
import { ChainIdEnum } from '../helpers/txs-enums';

export class TxsEVM extends Txs {
  protected readonly txsBsc: TxsBsc;
  protected readonly txsEth: TxsEth;
  protected readonly txsTron: TxsTron;
  protected readonly txsKawaii: TxsKawaii;
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    console.log('current_chain: ', current_chain);
    this.txsBsc = new TxsBsc(current_chain);
    this.txsEth = new TxsEth(current_chain);
    this.txsTron = new TxsTron(current_chain);
    this.txsKawaii = new TxsKawaii(current_chain);
  }
  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>>{
    try {
        console.log('this.chainId: ', this.chainId);

      switch (this.chainId) {
        case ChainIdEnum.Ethereum:
          return await this.txsEth.getTxs(page, current_page, params);
        case ChainIdEnum.BNBChain:
          return await this.txsBsc.getTxs(page, current_page, params);
        case ChainIdEnum.KawaiiEvm:
          return await this.txsKawaii.getTxs(page, current_page, params);
        case ChainIdEnum.TRON:
          return await this.txsTron.getTxs(page, current_page, params);
        default:
          break;
      }
      return;
    } catch (error) {
      console.log('error: ', error);
    }
  }
  getTxsByHash(txHash: string): ResTxsInfo {
    switch (this.chainId) {
      case ChainIdEnum.Ethereum:
        return this.txsEth.getTxsByHash(txHash);
      case ChainIdEnum.BNBChain:
        return this.txsBsc.getTxsByHash(txHash);
      case ChainIdEnum.KawaiiEvm:
        return this.txsKawaii.getTxsByHash(txHash);
      case ChainIdEnum.TRON:
        return this.txsTron.getTxsByHash(txHash);
      default:
        break;
    }
    return;
  }
}

import { Txs } from '../abstract/txs';
import { ChainInfoInner } from '@owallet/stores';
import { ChainInfo } from '@owallet/types';
import { API } from '../../../common/api';
import { ChainIdEnum } from '../helpers/txs-enums';

export class TxsBtcTestNet extends Txs {
  // private readonly
  constructor(current_chain: ChainInfoInner<ChainInfo>) {
    super(current_chain);
    this.infoApi = this.txsHelper.INFO_API_BITCOIN[ChainIdEnum.BitcoinTestnet];
  }

  async getTxs(
    page: number,
    current_page: number,
    params: ParamsFilterReqTxs
  ): Promise<Partial<ResTxs>> {
    try {
      const data = await API.getTxsBitcoin(
        this.infoApi.BASE_URL,
        params?.addressAccount
      );

      if (data?.txs?.length > 0) {
        const rsConverted = this.txsHelper.cleanDataBtcResToStandFormat(
          data?.txs,
          this.currentChain,
          params?.addressAccount
        );
        console.log("🚀 ~ file: txs-btc-test.ts:31 ~ TxsBtcTestNet ~ rsConverted:", rsConverted)
        console.log(
          '🚀 ~ file: txs-btc-test.ts:32 ~ TxsBtcTestNet ~ params?.addressAccount:',
          params?.addressAccount
        );
        console.log(
          '🚀 ~ file: txs-btc-test.ts:28 ~ TxsBtcTestNet ~ data?.txs:',
          data?.txs
        );
        console.log(
          '🚀 ~ file: txs-btc-test.ts:30 ~ TxsBtcTestNet ~ this.currentChain:',
          this.currentChain
        );
        return Promise.resolve({
          result: rsConverted,
          current_page: 0,
          total_page: data?.txs?.length
        });
      }
      return Promise.resolve({
        total_page: 0,
        result: [],
        current_page: 0
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

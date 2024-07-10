import { ResBalanceEvm, TokenInfo } from "@owallet/types";
import { urlTxHistory } from "../utils";
import { fetchRetry } from "./api.utils";
import { AxiosRequestConfig, AxiosResponse } from "axios";

export class API {
  static async getMultipleTokenInfo({ tokenAddresses }, config?: any) {
    const url = `${urlTxHistory}v1/token-info/by-addresses?tokenAddresses=${tokenAddresses}`;
    return fetchRetry(url, config) as Promise<TokenInfo[]>;
  }

  static async getAllBalancesNativeCosmos({ address, baseUrl }, config?: any) {
    const url = `${baseUrl}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
    return fetchRetry(url, config);
  }

  static async getAllBalancesEvm({ address, network }, config?: any) {
    const url = `${urlTxHistory}raw-tx-history/all/balances?network=${network}&address=${address}`;
    return fetchRetry(url, config) as Promise<ResBalanceEvm>;
  }
  static async getBtcBalance({ address, baseUrl }, config?: any) {
    const url = `${baseUrl}/address/${address}/utxo`;
    return fetchRetry(url, config);
  }
  static async getTokenInfo({ tokenAddress, network }, config?: any) {
    const url = `${urlTxHistory}v1/token-info/${network}/${tokenAddress}`;
    return fetchRetry(url, config);
  }
  static async getTxsAllNetwork(
    { addrByNetworks, offset, limit = 1 },
    config?: any
  ) {
    const url = `${urlTxHistory}v1/txs-history/?addrByNetworks=${addrByNetworks}&limit=${limit}&offset=${offset}`;
    return fetchRetry(url, config);
  }
}

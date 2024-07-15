import { handleError, parseObjectToQueryString } from "@src/utils/helper";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import moment from "moment";
import { Network } from "@tatumio/tatum";
import { ChainIdEnum, CosmosNetwork, OasisNetwork } from "@owallet/common";
import {
  CosmosItem,
  ResTxsCosmos,
} from "@src/screens/transactions/cosmos/types";
import {
  ResBalanceEvm,
  ResDetailAllTx,
  TokenInfo,
  TxsAllNetwork,
} from "@src/screens/transactions/all-network/all-network.types";
import { fetchRetry, urlTxHistory } from "@src/common/constants";

export const API = {
  post: (path: string, params: any, config: AxiosRequestConfig) => {
    return axios.post(path, params, config);
  },
  put: (path: string, params: any, config: AxiosRequestConfig) => {
    return axios.put(path, params, config);
  },
  patch: (path: string, params: any, config: AxiosRequestConfig) => {
    return axios.patch(path, params, config);
  },
  get: (path: string, config: AxiosRequestConfig) => {
    return axios.get(path, config);
  },
  delete: (path: string, config: AxiosRequestConfig) => {
    return axios.delete(path, config);
  },
  requestRpc: async (
    { method, params, url },
    config: AxiosRequestConfig = null
  ) => {
    try {
      const rpcConfig = {
        method,
        params,
        id: 1,
        jsonrpc: "2.0",
      };
      retryWrapper(axios, { retry_time: 3 });
      const rs = await axios.post(url, rpcConfig, config);
      if (rs?.data?.result) {
        return Promise.resolve(rs?.data?.result);
      }
      return Promise.resolve(rs?.data);
    } catch (error) {
      handleError(error, url, method);

      return Promise.reject(error);
    }
  },

  getByLCD: async ({ lcdUrl, prefix, method, params = null }) => {
    try {
      retryWrapper(axios, { retry_time: 3 });
      const qs = params ? parseObjectToQueryString(params) : "";
      const url = `${prefix}${method}${qs}`;
      console.log(url, "url lcd");
      const rs = await API.get(url, { baseURL: lcdUrl });
      return Promise.resolve(rs?.data);
    } catch (error) {
      handleError(error, lcdUrl, method);
      return Promise.reject(error);
    }
  },
  getTxsByLCD: async <T>({
    url,
    params = null,
    prefix = "/cosmos/tx/v1beta1",
    method = "/txs",
  }): Promise<T> => {
    try {
      const rs = await API.getByLCD({
        lcdUrl: url,
        prefix,
        method,
        params,
      });
      return Promise.resolve(rs);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTxsByRPC: async ({ url, params = null, method = "tx_search" }) => {
    try {
      const rs = await API.requestRpc({
        url: url,
        params,
        method,
      });
      return Promise.resolve(rs);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTxsLcdCosmos: async (
    url,
    query,
    perPage = 10,
    currentPage = 1
  ): Promise<ResLcdCosmos> => {
    try {
      const rs = await API.getTxsByLCD<ResLcdCosmos>({
        url,
        params: {
          events: query,
          ["pagination.count_total"]: true,
          ["pagination.limit"]: perPage,
          ["pagination.offset"]: currentPage,
          order_by: "2",
        },
      });
      return Promise.resolve(rs);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTxsEthAndBscByToken: async (
    url,
    contractAddress,
    addressAcc,
    current_page,
    page,
    apiKey
  ): Promise<ResTxsEthAndBscByToken> => {
    try {
      const rs = await API.get(
        `/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${addressAcc}&sort=desc&page=${current_page}&offset=${page}&apikey=${apiKey}`,
        { baseURL: url }
      );
      return Promise.resolve(rs?.data);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTxsRpcCosmos: async (
    url,
    query,
    perPage = 10,
    currentPage = 1
  ): Promise<ResTxsRpcCosmos> => {
    try {
      const rs = await API.getTxsByRPC({
        url,
        params: {
          query,
          page: `${currentPage}`,
          per_page: `${perPage}`,
          order_by: "desc",
        },
      });
      return Promise.resolve(rs);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTotalTxsEthAndBscPage: async (url, addressAcc, apiKey) => {
    try {
      const rs = await API.get(
        `/api?module=account&action=txlist&address=${addressAcc}&sort=desc&apikey=${apiKey}`,
        {
          baseURL: url,
        }
      );
      const data: txsEthAndBscResult = rs.data;
      if (data?.status === "1") {
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    } catch (error) {
      handleError(
        error,
        `${url}/api?module=account&action=txlist&address=${addressAcc}&sort=desc&apikey=${apiKey}`,
        "getTotalTxsEthAndBscPage"
      );
      return Promise.reject(error);
    }
  },
  getTotalTxsEthAndBscPageByToken: async (
    url,
    addressAcc,
    contractAddress,
    apiKey
  ): Promise<ResTxsEthAndBscByToken> => {
    try {
      const rs = await API.get(
        `/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${addressAcc}&&apikey=${apiKey}`,
        { baseURL: url }
      );
      const data: ResTxsEthAndBscByToken = rs.data;
      if (data?.status === "1") {
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    } catch (error) {
      handleError(
        error,
        `${url}/api?module=account&action=txlist&address=${addressAcc}&sort=desc&apikey=${apiKey}`,
        "getTotalTxsEthAndBscPage"
      );
      return Promise.reject(error);
    }
  },
  getTxsEthAndBsc: async (url, addressAccount, current_page, page, apiKey) => {
    try {
      const rs = await API.get(
        `/api?module=account&action=txlist&address=${addressAccount}&sort=desc&page=${current_page}&offset=${page}&apikey=${apiKey}`,
        { baseURL: url }
      );
      const data: txsEthAndBscResult = rs.data;
      if (data?.status === "1") {
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    } catch (error) {
      handleError(
        error,
        `${url}/api?module=account&action=txlist&address=${addressAccount}&sort=desc&page=${current_page}&offset=${page}&apikey=${apiKey}`,
        "getTxsEthAndBsc"
      );
      return Promise.reject(error);
    }
  },
  checkStatusTxBitcoinTestNet: async (url: string, txHash: string) => {
    try {
      const rs = await API.get(`/api/tx/${txHash}/status`, {
        baseURL: url,
      });

      return Promise.reject(rs?.data);
    } catch (error) {
      handleError(
        error,
        `${url}/api/tx/${txHash}/status`,
        "checkStatusBitcoinTestNet"
      );
      return Promise.reject(error);
    }
  },
  getTxsBitcoin: async (url, addressAccount) => {
    try {
      const rs = await API.get(`/address/${addressAccount}/txs`, {
        baseURL: url,
      });
      const data: txBitcoinResult[] = rs.data;
      return Promise.resolve(data);
    } catch (error) {
      handleError(error, `/address/${addressAccount}/txs`, "getTxsBitcoin");
      return Promise.reject(error);
    }
  },
  getCountTxsBitcoin: async (url, addressAccount) => {
    try {
      const rs = await API.get(`/address/${addressAccount}`, {
        baseURL: url,
      });
      const data: InfoAddressBtc = rs.data;
      return Promise.resolve(data);
    } catch (error) {
      handleError(error, `/address/${addressAccount}`, "getCountTxsBitcoin");
      return Promise.reject(error);
    }
  },

  getTxsTron: async (url, addressAccount, current_page, page) => {
    try {
      const rs = await API.get(
        `/api/transaction?sort=-timestamp&count=true&limit=${page}&start=${current_page}&address=${addressAccount}`,
        { baseURL: url }
      );
      const data: ResDataTxsTron = rs.data;
      if (data?.data) {
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    } catch (error) {
      handleError(
        error,
        `${url}/api/transaction?sort=-timestamp&count=true&limit=${page}&start=${current_page}&address=${addressAccount}`,
        "getTxsTron"
      );
      return Promise.reject(error);
    }
  },
  getHistory: (
    { address, offset = 0, limit = 10, isRecipient, isAll = false },
    config: AxiosRequestConfig
  ) => {
    let url = `cosmos/tx/v1beta1/txs?events=message.sender%3D%27${address}%27&pagination.offset=${offset}&pagination.limit=${limit}&orderBy=2`;
    if (isAll) {
      return API.get(url, config);
    }
    if (isRecipient) {
      url = url.replace(
        `events=message.sender`,
        `events=message.action%3D'send'&events=transfer.recipient`
      );
    } else {
      url += `&events=message.action%3D%27send%27`;
    }
    return API.get(url, config);
  },

  getTransactions: (
    { address, page = 1, limit = 10, type = "native" },
    config: AxiosRequestConfig
  ) => {
    let url = `/v1/txs-account/${address}?limit=${limit}&page_id=${page}`;
    if (type === "cw20") {
      url = `/v1/ow20_smart_contracts/${address}?limit=${limit}&page_id=${page}`;
    }
    return API.get(url, config);
  },

  getNews: ({ page = 1, limit = 10 }, config: AxiosRequestConfig) => {
    const url = `api/v1/news/list`;
    const params = {
      page,
      size: limit,
    };
    return API.post(url, params, config);
  },

  getTronAccountInfo: ({ address }, config: AxiosRequestConfig) => {
    const url = `v1/accounts/${address}`;
    return API.get(url, config);
  },

  getMarketChartRange: (
    { id, from, to }: { id: string; from?: number; to?: number },
    config: AxiosRequestConfig
  ) => {
    if (!to) {
      to = moment().unix();
    }
    if (!from) {
      from = moment().subtract(1, "days").unix();
    }

    const url = `/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
    return API.get(url, config);
  },
  getMarketChart: (
    { id, unit, days }: { id: string; unit?: string; days?: string },
    config: AxiosRequestConfig
  ) => {
    const url = `/coins/${id}/market_chart?vs_currency=${unit}&days=${days}`;
    return API.get(url, config);
  },

  getCoinInfo: ({ id }: { id: string }, config: AxiosRequestConfig) => {
    const url = `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    return API.get(url, config);
  },
  getCoinSimpleInfo: (
    { id, time }: { id: string; time: string },
    config: AxiosRequestConfig
  ) => {
    const url = `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=${time}`;
    return API.get(url, config);
  },

  getNFTs: ({ address }, config: AxiosRequestConfig) => {
    const url = `assets?size=12&offset=0&filter=%7B%22accountAddress%22:%22${address}%22,%22nftStatuses%22:[2]%7D&sort=%7B%22updatedAt%22:%22DESC%22%7D`;
    return API.get(url, config);
  },

  getNFTOwners: ({ token_id }, config: AxiosRequestConfig) => {
    const url = `assets/${token_id}/owners?size=10&offset=0`;
    return API.get(url, config);
  },
  getValidatorList: ({}, config: AxiosRequestConfig) => {
    const url = `v1/validators?limit=100`;
    return API.get(url, config);
  },
  getValidatorOraichainDetail: (
    { validatorAddress },
    config: AxiosRequestConfig
  ) => {
    const url = `v1/validator/${validatorAddress}`;
    return API.get(url, config);
  },
  subcribeToTopic: ({ topic, subcriber }, config: AxiosRequestConfig) => {
    const url = `api/v1/topics`;
    return API.post(url, { topic, subcriber }, config);
  },
  unsubcribeTopic: ({ topic, subcriber }, config: AxiosRequestConfig) => {
    const url = `api/v1/topics`;
    return API.put(url, { topic, subcriber }, config);
  },
  saveTokenInfos: ({ tokesInfos, address }, config: AxiosRequestConfig) => {
    const url = `account/${address}`;
    return API.post(url, { tokens: tokesInfos }, config);
  },
  saveHistory: ({ infos, address }, config: AxiosRequestConfig) => {
    const url = `history/${address}`;
    return API.post(url, { ...infos }, config);
  },
  getYesterdayAssets: ({ address, time }, config: AxiosRequestConfig) => {
    const url = `account/${address}?time=${time}`;
    return API.get(url, config);
  },
  getWalletHistory: (
    { address, offset, limit },
    config: AxiosRequestConfig
  ) => {
    const url = `query-history/${address}?offset=${offset}&limit=${limit}`;
    return API.get(url, config);
  },
  getGroupHistory: (
    { address, offset, limit = 1 },
    config: AxiosRequestConfig
  ) => {
    const url = `history/${address}?offset=${offset}&limit=${limit}`;
    return API.get(url, config);
  },
  getEvmTxs: (
    { address, offset, limit = 1, network = Network.ETHEREUM },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/evm/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config);
  },
  getBtcTxs: (
    { address, offset, limit = 1, network = Network.BITCOIN },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/btc/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config);
  },
  getOasisTxs: (
    { address, offset, limit = 1, network = OasisNetwork.MAINNET },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/oasis/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config);
  },
  getCosmosTxs: (
    { address, offset, limit = 1, network = ChainIdEnum.CosmosHub },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/cosmos/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config) as Promise<AxiosResponse<ResTxsCosmos>>;
  },
  getTxsAllNetwork: (
    { addrByNetworks, offset, limit = 1 },
    config: AxiosRequestConfig
  ) => {
    const url = `v1/txs-history/?addrByNetworks=${addrByNetworks}&limit=${limit}&offset=${offset}`;
    return API.get(url, config) as Promise<AxiosResponse<TxsAllNetwork>>;
  },
  getTxsByToken: (
    { tokenAddr, userAddr, network, offset, limit = 1 },
    config: AxiosRequestConfig
  ) => {
    const url = `v1/txs-history/by-token?userAddr=${userAddr}&network=${network}&tokenAddr=${tokenAddr}&limit=${limit}&offset=${offset}`;
    return API.get(url, config) as Promise<AxiosResponse<TxsAllNetwork>>;
  },
  getOraichainTxs: async (
    { address, offset, limit = 1, network = CosmosNetwork.ORAICHAIN },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/oraichain/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config);
  },
  getTronTxs: (
    { address, offset, limit = 1, network = Network.TRON },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/tron/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config);
  },
  getDetailTx: (
    { hash, network = Network.ETHEREUM },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/all/tx-detail/${hash}?network=${network}`;
    return API.get(url, config);
  },
  getDetailAllTx: ({ hash, network }, config: AxiosRequestConfig) => {
    const url = `v1/txs-history/tx-detail/?network=${network}&txhash=${hash}`;
    return API.get(url, config) as Promise<AxiosResponse<ResDetailAllTx>>;
  },
  getAllBalancesEvm: ({ address, network }, config?: AxiosRequestConfig) => {
    const url = `${urlTxHistory}raw-tx-history/all/balances?network=${network}&address=${address}`;
    return fetchRetry(url, config) as Promise<ResBalanceEvm>;
  },
  getAllBalancesNativeCosmos: (
    { address, baseUrl },
    config?: AxiosRequestConfig
  ) => {
    const url = `${baseUrl}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
    return fetchRetry(url, config);
  },
  getMultipleTokenInfo: ({ tokenAddresses }, config?: AxiosRequestConfig) => {
    const url = `${urlTxHistory}v1/token-info/by-addresses?tokenAddresses=${tokenAddresses}`;
    return fetchRetry(url, config) as Promise<TokenInfo[]>;
  },
  getTokenInfo: ({ tokenAddress, network }, config?: AxiosRequestConfig) => {
    const url = `${urlTxHistory}v1/token-info/${network}/${tokenAddress}`;
    return fetchRetry(url, config) as Promise<TokenInfo>;
  },
  getDetailOasisTx: (
    { hash, network = OasisNetwork.MAINNET },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/oasis/tx-detail/${hash}?network=${network}`;
    return API.get(url, config);
  },
  getDetailCosmosTx: (
    { hash, network = ChainIdEnum.CosmosHub },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/cosmos/tx-detail/${hash}?network=${network}`;
    return API.get(url, config) as Promise<AxiosResponse<CosmosItem>>;
  },
  getDetailOraichainTx: async (
    { hash, network = CosmosNetwork.ORAICHAIN },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/oraichain/tx-detail/${hash}`;
    return API.get(url, config);
  },
  getDetailTronTx: (
    { hash, network = Network.TRON },
    config: AxiosRequestConfig
  ) => {
    const url = `raw-tx-history/tron/tx-detail/${hash}`;
    console.log(url, "url");
    return API.get(url, config);
  },
  getHistoryDetail: ({ id }, config: AxiosRequestConfig) => {
    const url = `history-detail/${id}?`;
    return API.get(url, config);
  },
  getCoingeckoCoins: ({}, config: AxiosRequestConfig) => {
    const url = `coins/list`;
    return API.get(url, config);
  },
  getCoingeckoImageURL: (
    { contractAddress, id },
    config: AxiosRequestConfig
  ) => {
    const url = `coins/${id}/contract/${contractAddress}`;
    return API.get(url, config);
  },
};
const retryWrapper = (axios, options) => {
  const max_time = 1;
  let counter = 0;
  axios.interceptors.response.use(null, (error) => {
    /** @type {import('axios').AxiosRequestConfig} */
    const config = error.config;
    // you could defined status you want to retry, such as 503
    // if (counter < max_time && error.response.status === retry_status_code) {
    if (
      (counter < max_time && error.response.status === 400) ||
      (counter < max_time && error.response.status === 502)
    ) {
      counter++;
      return new Promise((resolve) => {
        resolve(axios(config));
      });
    }
    return Promise.reject(error);
  });
};

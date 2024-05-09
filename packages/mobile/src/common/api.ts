import { handleError, parseObjectToQueryString } from "@src/utils/helper";
import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { Network } from "@tatumio/tatum";
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
      let rpcConfig = {
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
      let qs = params ? parseObjectToQueryString(params) : "";
      let url = `${prefix}${method}${qs}`;
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
    let url = `api/v1/news/list`;
    let params = {
      page,
      size: limit,
    };
    return API.post(url, params, config);
  },

  getTronAccountInfo: ({ address }, config: AxiosRequestConfig) => {
    let url = `v1/accounts/${address}`;
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

    let url = `/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
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
    let url = `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    return API.get(url, config);
  },
  getCoinSimpleInfo: (
    { id, time }: { id: string; time: string },
    config: AxiosRequestConfig
  ) => {
    let url = `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=${time}`;
    return API.get(url, config);
  },

  getNFTs: ({ address }, config: AxiosRequestConfig) => {
    let url = `assets?size=12&offset=0&filter=%7B%22accountAddress%22:%22${address}%22,%22nftStatuses%22:[2]%7D&sort=%7B%22updatedAt%22:%22DESC%22%7D`;
    return API.get(url, config);
  },

  getNFTOwners: ({ token_id }, config: AxiosRequestConfig) => {
    let url = `assets/${token_id}/owners?size=10&offset=0`;
    return API.get(url, config);
  },
  getValidatorList: ({}, config: AxiosRequestConfig) => {
    let url = `v1/validators?limit=100`;
    return API.get(url, config);
  },
  subcribeToTopic: ({ topic, subcriber }, config: AxiosRequestConfig) => {
    let url = `api/v1/topics`;
    return API.post(url, { topic, subcriber }, config);
  },
  unsubcribeTopic: ({ topic, subcriber }, config: AxiosRequestConfig) => {
    let url = `api/v1/topics`;
    return API.put(url, { topic, subcriber }, config);
  },
  saveTokenInfos: ({ tokesInfos, address }, config: AxiosRequestConfig) => {
    let url = `account/${address}`;
    return API.post(url, { tokens: tokesInfos }, config);
  },
  saveHistory: ({ infos, address }, config: AxiosRequestConfig) => {
    let url = `history/${address}`;
    return API.post(url, { ...infos }, config);
  },
  getYesterdayAssets: ({ address, time }, config: AxiosRequestConfig) => {
    let url = `account/${address}?time=${time}`;
    return API.get(url, config);
  },
  getWalletHistory: (
    { address, offset, limit },
    config: AxiosRequestConfig
  ) => {
    let url = `query-history/${address}?offset=${offset}&limit=${limit}`;
    return API.get(url, config);
  },
  getGroupHistory: (
    { address, offset, limit = 1 },
    config: AxiosRequestConfig
  ) => {
    let url = `history/${address}?offset=${offset}&limit=${limit}`;
    return API.get(url, config);
  },
  getEvmTxs: (
    { address, offset, limit = 1, network = Network.ETHEREUM },
    config: AxiosRequestConfig
  ) => {
    let url = `raw-tx-history/evm/${address}?network=${network}&limit=${limit}&offset=${offset}`;
    return API.get(url, config);
  },
  getDetailTx: (
    { hash, network = Network.ETHEREUM },
    config: AxiosRequestConfig
  ) => {
    let url = `raw-tx-history/all/tx-detail/${hash}?network=${network}`;
    return API.get(url, config);
  },
  getHistoryDetail: ({ id }, config: AxiosRequestConfig) => {
    let url = `history-detail/${id}?`;
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

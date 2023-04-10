import { handleError } from '@src/utils/helper';
import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
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
        jsonrpc: '2.0'
      };
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
  getBlockResultByHeight: async ({
    height,
    rpcUrl = 'https://rpc.orai.io'
  }) => {
    try {
      const rs = await API.requestRpc({
        url: rpcUrl,
        method: 'block',
        params: {
          height
        }
      });
      return Promise.resolve(rs);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTransactionsByAddress: async ({
    address,
    page = '1',
    per_page = '10',
    order_by = 'desc',
    match_events = true,
    prove = true,
    rpcUrl = 'https://rpc.orai.io'
  }) => {
    try {
      const rs = await API.requestRpc({
        url: rpcUrl,
        params: {
          query: `message.sender='${address}'`,
          page,
          per_page,
          order_by,
          prove,
          match_events
        },
        method: 'tx_search'
      });
      return Promise.resolve(rs);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTransactionsByToken: async ({
    address,
    page = '1',
    per_page = '10',
    order_by = 'desc',
    match_events = true,
    prove = true,
    rpcUrl = 'https://rpc.orai.io',
    token
  }) => {
    try {
      const rs = await API.requestRpc({
        url: rpcUrl,
        params: {
          query: `message.sender='${address}' AND transfer.amount contains '${token}'`,
          page,
          per_page,
          order_by,
          prove,
          match_events
        },
        method: 'tx_search'
      });
      return Promise.resolve(rs);
    } catch (error) {
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
    { address, page = 1, limit = 10, type = 'native' },
    config: AxiosRequestConfig
  ) => {
    let url = `/v1/txs-account/${address}?limit=${limit}&page_id=${page}`;
    if (type === 'cw20') {
      url = `/v1/ow20_smart_contracts/${address}?limit=${limit}&page_id=${page}`;
    }
    return API.get(url, config);
  },

  getNews: ({ page = 1, limit = 10 }, config: AxiosRequestConfig) => {
    let url = `api/v1/news/list`;
    let params = {
      page,
      size: limit
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
      from = moment().subtract(1, 'days').unix();
    }

    let url = `/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
    return API.get(url, config);
  },

  getCoinInfo: ({ id }: { id: string }, config: AxiosRequestConfig) => {
    let url = `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
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
  }
};

import axios, { AxiosRequestConfig } from 'axios';

export const API = {
  post: (path: string, params: any, config: AxiosRequestConfig) => {
    return axios.post(path, params, config);
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
  }
};

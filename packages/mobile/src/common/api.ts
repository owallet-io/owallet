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
    { address, offset = 0, limit = 10, isRecipient },
    config: AxiosRequestConfig
  ) => {
    // new version to show other token transactions
    // let url = `cosmos/tx/v1beta1/txs?events=wasm.from%3D'${address}'&pagination.offset=${offset}&pagination.limit=${limit}&orderBy=2`;
    // old version that show all transactions
    let url = `cosmos/tx/v1beta1/txs?events=message.sender%3D%27${address}%27&pagination.offset=${offset}&pagination.limit=${limit}&orderBy=2`;

    if (isRecipient) {
      url = url.replace(
        // new version
        // 'events=wasm.from',
        // `events=wasm.to`,
        // old version
        `events=message.sender`,
        `events=message.action%3D'send'&events=transfer.recipient`
      );
    } else {
      // new version
      // url += `&events=wasm.action%3D%27transfer%27`;
      // old version
      url += `&events=message.action%3D%27send%27`;
    }
    return API.get(url, config);
  }
};

// Example usage
// return API.get(`cosmos/bank/v1beta1/balances/${address}`, config);

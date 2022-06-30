import axios from 'axios';

const domain = 'http://192.168.68.97:3000/'; // Example domain

export const API = {
  post: (path, params, config) => {
    const { customDomain } = config || {};
    return axios.post(
      (customDomain ? customDomain : domain) + path,
      params,
      config
    );
  },
  patch: (path, params, config) => {
    const { customDomain } = config || {};
    return axios.patch(
      (customDomain ? customDomain : domain) + path,
      params,
      config
    );
  },
  get: (path, config) => {
    const { customDomain } = config || {};
    const url = (customDomain ? customDomain : domain) + path;
    return axios.get(url, config);
  },
  delete: (path, config) => {
    const { customDomain } = config || {};
    const url = (customDomain ? customDomain : domain) + path;
    return axios.delete(url, config);
  }
};

// Example usage
// return API.get(`cosmos/bank/v1beta1/balances/${address}`, config);

import Web3 from 'web3';

export const Web3Provider = (baseUrl: string = 'https://rpc.ankr.com/eth'): Web3 => {
  return new Web3(new Web3.providers.HttpProvider(baseUrl));
};

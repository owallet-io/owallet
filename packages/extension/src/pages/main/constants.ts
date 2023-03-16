export const TRON_ID = '0x2b6653dc';
export const TRON_BIP39_PATH_PREFIX = "m/44'/195'";
export const BIP44_PATH_PREFIX = "m/44'";
export const TRON_BIP39_PATH_INDEX_0 = TRON_BIP39_PATH_PREFIX + "/0'/0/0";

import { Base58 } from '@ethersproject/basex';
import { sha256 } from '@ethersproject/sha2';

export const getEvmAddress = (base58Address) =>
  '0x' + Buffer.from(Base58.decode(base58Address)).slice(1, -4).toString('hex');

export const getBase58Address = (address) => {
  console.log({
    address
  });
  const evmAddress = '0x41' + (address ? address.substring(2) : '');
  const hash = sha256(sha256(evmAddress));
  const checkSum = hash.substring(2, 10);
  return Base58.encode(evmAddress + checkSum);
};

export const TRC20_LIST = [
  {
    contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    tokenName: 'USDC',
    coinDenom: 'USDC',
    coinGeckoId: 'usd-coin',
    coinImageUrl:
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    coinDecimals: 6,
    type: 'trc20'
  },
  {
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    tokenName: 'USDT',
    coinDenom: 'USDT',
    coinDecimals: 6,
    coinGeckoId: 'tether',
    coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    type: 'trc20'
  },
  {
    contractAddress: 'TGjgvdTWWrybVLaVeFqSyVqJQWjxqRYbaK',
    tokenName: 'USDD',
    coinDenom: 'USDD',
    coinDecimals: 6,
    coinGeckoId: 'usdd',
    coinImageUrl:
      'https://s2.coinmarketcap.com/static/img/coins/64x64/19891.png',
    type: 'trc20'
  },
  {
    contractAddress: 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL',
    tokenName: 'USDJ',
    coinDenom: 'USDJ',
    coinDecimals: 6,
    coinGeckoId: 'usdj',
    coinImageUrl:
      'https://s2.coinmarketcap.com/static/img/coins/64x64/5446.png',
    type: 'trc20'
  },
  {
    contractAddress: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3',
    tokenName: 'JST',
    coinDenom: 'JST',
    coinDecimals: 6,
    coinGeckoId: 'just',
    coinImageUrl:
      'https://s2.coinmarketcap.com/static/img/coins/64x64/5488.png',
    type: 'trc20'
  },
  {
    contractAddress: 'TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt',
    tokenName: 'SUNOLD',
    coinDenom: 'SUNOLD',
    coinDecimals: 6,
    coinGeckoId: 'sun',
    coinImageUrl:
      'https://s2.coinmarketcap.com/static/img/coins/64x64/6990.png',
    type: 'trc20'
  }
];

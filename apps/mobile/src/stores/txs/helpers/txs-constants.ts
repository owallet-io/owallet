const cw20Info = {
  coinDecimals: 6,
  prefix: 'cw20'
};
const bep20Info = {
  coinDecimals: 18,
  prefix: 'bep20'
};
const erc20Info = {
  coinDecimals: 18,
  prefix: 'erc20'
};
const trc20Info = {
  coinDecimals: 18,
  prefix: 'trc20'
};
export const currenciesData = {
  ['inj'.toUpperCase()]: {
    coinDecimals: 18,
    coinDenom: 'INJ',
    coinMinimalDenom: 'inj',
    prefix: 'cw20'
  },
  ['ibc/49D820DFDE9F885D7081725A58202ABA2F465CAEE4AFBC683DFB79A8E013E83E'.toUpperCase()]: {
    coinDecimals: 18,
    coinDenom: 'INJ',
    coinMinimalDenom: 'ibc/49D820DFDE9F885D7081725A58202ABA2F465CAEE4AFBC683DFB79A8E013E83E',
    prefix: 'cw20'
  },
  ['orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'INJ',
    coinMinimalDenom: 'orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49'
  },
  ['orai'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'ORAI',
    coinMinimalDenom: 'orai'
  },
  ['orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'AIRI',
    coinMinimalDenom: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg'
  },
  ['orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'ORAIX',
    coinMinimalDenom: 'orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge'
  },
  ['orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'USDT',
    coinMinimalDenom: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh'
  },
  ['orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd'.toUpperCase()]: {
    coinDecimals: 6,
    ...cw20Info,
    coinMinimalDenom: 'orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd'
  },
  ['orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'KWT',
    coinMinimalDenom: 'orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5'
  },
  ['orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'MILKY',
    coinMinimalDenom: 'orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw'
  },
  ['oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 ORAI',
    coinMinimalDenom: 'oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0'
  },
  ['oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 AIRI',
    coinMinimalDenom: 'oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F'
  },
  ['oraib0x257a8d1E03D17B8535a182301f15290F11674b53'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 KWT',
    coinMinimalDenom: 'oraib0x257a8d1E03D17B8535a182301f15290F11674b53'
  },
  ['oraib0x55d398326f99059fF775485246999027B3197955'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 USDT',
    coinMinimalDenom: 'oraib0x55d398326f99059fF775485246999027B3197955'
  },
  ['oraib0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 MILKY',
    coinMinimalDenom: 'oraib0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717'
  },
  ['eth-mainnet0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ERC20 USDC',
    coinMinimalDenom: 'eth-mainnet0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  ['eth-mainnet0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ERC20 MILKY',
    coinMinimalDenom: 'eth-mainnet0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75'
  },
  ['eth-mainnet0x4c11249814f11b9346808179cf06e71ac328c1b5'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ERC20 ORAI',
    coinMinimalDenom: 'eth-mainnet0x4c11249814f11b9346808179cf06e71ac328c1b5'
  },
  ['trontrx-mainnet0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18'.toUpperCase()]: {
    ...trc20Info,
    coinDenom: 'TRC20 TRX',
    coinMinimalDenom: 'trontrx-mainnet0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18'
  },

  ['trontrx-mainnet0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C'.toUpperCase()]: {
    ...trc20Info,
    coinDenom: 'TRC20 USDT',
    coinMinimalDenom: 'trontrx-mainnet0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C'
  },
  ['tron-mainnet0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C'.toUpperCase()]: {
    ...trc20Info,
    coinDenom: 'TRC20 USDT',
    coinMinimalDenom: 'tron-mainnet0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C'
  },
  ['uatom'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'ATOM',
    coinMinimalDenom: 'uatom'
  },
  ['uosmo'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'OSMO',
    coinMinimalDenom: 'uosmo'
  },
  ['uion'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'ION',
    coinMinimalDenom: 'uion'
  },
  ['ujuno'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'JUNO',
    coinMinimalDenom: 'ujuno'
  },
  ['bnb'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BNB',
    coinMinimalDenom: 'bnb'
  },
  ['0x41E76b3b0Da96c14c4575d9aE96d73Acb6a0B903'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ORAI',
    coinMinimalDenom: '0x41E76b3b0Da96c14c4575d9aE96d73Acb6a0B903'
  },
  ['0x7e2a35c746f2f7c240b664f1da4dd100141ae71f'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'AIRI',
    coinMinimalDenom: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f'
  },
  ['0x9da6e8a2065d5f09b9994ebc330a962721069a68'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'KWT',
    coinMinimalDenom: '0x9da6e8a2065d5f09b9994ebc330a962721069a68'
  },
  ['eth'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ETH',
    coinMinimalDenom: 'eth'
  },
  ['0x4c11249814f11b9346808179cf06e71ac328c1b5'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ORAI',
    coinMinimalDenom: '0x4c11249814f11b9346808179cf06e71ac328c1b5'
  },
  ['0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'ORAI',
    coinMinimalDenom: '0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0'
  },
  ['0x257a8d1e03d17b8535a182301f15290f11674b53'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'KWT',
    coinMinimalDenom: '0x257a8d1e03d17b8535a182301f15290f11674b53'
  },
  ['trx'.toUpperCase()]: {
    ...trc20Info,
    coinDenom: 'TRX',
    coinMinimalDenom: 'trx'
  },
  ['TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8'.toUpperCase()]: {
    ...trc20Info,
    coinDenom: 'USDC',
    coinMinimalDenom: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8'
  },
  ['TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'.toUpperCase()]: {
    ...trc20Info,
    coinDenom: 'USDT',
    coinMinimalDenom: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  },
  ['oraie'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ORAIE',
    coinMinimalDenom: 'oraie'
  },
  ['uoraib'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'ORAIB',
    coinMinimalDenom: 'uoraib'
  },
  ['ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'ATOM',
    coinMinimalDenom: 'ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78'
  },
  ['ibc/9C4DCD21B48231D0BC2AC3D1B74A864746B37E4292694C93C617324250D002FC'.toUpperCase()]: {
    ...cw20Info,
    coinDenom: 'OSMOSIS',
    coinMinimalDenom: 'ibc/9C4DCD21B48231D0BC2AC3D1B74A864746B37E4292694C93C617324250D002FC'
  },
  ['ibc/C458B4CC4F5581388B9ACB40774FDFBCEDC77A7F7CDFB112B469794AF86C4A69'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 AIRI',
    coinMinimalDenom: 'ibc/C458B4CC4F5581388B9ACB40774FDFBCEDC77A7F7CDFB112B469794AF86C4A69'
  },
  ['ibc/E8B5509BE79025DD7A572430204271D3061A535CC66A3A28FDEC4573E473F32F'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 USDT',
    coinMinimalDenom: 'ibc/E8B5509BE79025DD7A572430204271D3061A535CC66A3A28FDEC4573E473F32F'
  },
  ['ibc/4F7464EEE736CCFB6B444EB72DE60B3B43C0DD509FFA2B87E05D584467AAE8C8'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 KWT',
    coinMinimalDenom: 'ibc/4F7464EEE736CCFB6B444EB72DE60B3B43C0DD509FFA2B87E05D584467AAE8C8'
  },
  ['ibc/E12A2298AC40011C79F02F26C324BD54DF20F4B2904CB9028BFDEDCFAA89B906'.toUpperCase()]: {
    ...bep20Info,
    coinDenom: 'BEP20 MILKY',
    coinMinimalDenom: 'ibc/E12A2298AC40011C79F02F26C324BD54DF20F4B2904CB9028BFDEDCFAA89B906'
  },
  ['ibc/E8734BEF4ECF225B71825BC74DE30DCFF3644EAC9778FFD4EF9F94369B6C8377'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'KWT',
    coinMinimalDenom: 'ibc/E8734BEF4ECF225B71825BC74DE30DCFF3644EAC9778FFD4EF9F94369B6C8377'
  },
  ['ibc/81ACD1F7F5380CAA3F590C58C699FBD408B8792F694888D7256EEAF564488FAB'.toUpperCase()]: {
    ...erc20Info,
    coinDenom: 'MILKY',
    coinMinimalDenom: 'ibc/81ACD1F7F5380CAA3F590C58C699FBD408B8792F694888D7256EEAF564488FAB'
  }
};
export const defaultCoin = {
  coinDecimals: 6,
  coinDenom: '',
  coinMinimalDenom: ''
};

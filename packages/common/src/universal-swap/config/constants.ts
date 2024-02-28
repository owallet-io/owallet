import { ethers } from "ethers";
/* oraiswap:unit */
export const ORAI = "orai";
export const UAIRI = "uAIRI";
export const AIRI = "AIRI";
export const ATOM = "ATOM";
export const OSMO = "OSMO";
export const LP = "LP";
export const KWT = "oraie";
export const MILKY = "milky";
export const STABLE_DENOM = "usdt";
export const TRON_DENOM = "trx";

// estimate fee
export const GAS_ESTIMATION_SWAP_DEFAULT = 580000;
export const GAS_ESTIMATION_BRIDGE_DEFAULT = 200000;
export const MULTIPLIER = 1.6;
export const HIGH_GAS_PRICE = 0.007;

export const SEC_PER_YEAR = 60 * 60 * 24 * 365;

// commission_rate pool
export const COMMISSION_RATE = "0.003";

/* network:settings */
export const IBC_TRANSFER_TIMEOUT = 3600;
export const AXIOS_THROTTLE_THRESHOLD = 2000;
export const AXIOS_TIMEOUT = 10000;

// bsc and eth information
export const ETHEREUM_SCAN = "https://etherscan.io";
export const BSC_SCAN = "https://bscscan.com";
export const TRON_SCAN = "https://tronscan.org";
export const KWT_SCAN = "https://scan.kawaii.global";

export const ORAI_BRIDGE_UDENOM = "uoraib";
export const ORAI_BRIDGE_EVM_DENOM_PREFIX = "oraib";
export const ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX = "eth-mainnet";
export const ORAI_BRIDGE_EVM_TRON_DENOM_PREFIX = "trontrx-mainnet";
export const ORAI_BRIDGE_EVM_FEE = "1";
export const ORAI_BRIDGE_CHAIN_FEE = "1";

export const ORAI_BSC_CONTRACT = "0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0";
export const AIRI_BSC_CONTRACT = "0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F";
export const USDT_BSC_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_TRON_CONTRACT = "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C";
export const WRAP_TRON_TRX_CONTRACT =
  "0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18";
export const KWT_BSC_CONTRACT = "0x257a8d1E03D17B8535a182301f15290F11674b53";
export const MILKY_BSC_CONTRACT = "0x6fE3d0F096FC932A905accd1EB1783F6e4cEc717";

// erc20 contracts
export const ORAI_ETH_CONTRACT = "0x4c11249814f11b9346808179Cf06e71ac328c1b5";
export const USDC_ETH_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const MILKY_ERC_CONTRACT = "0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75";
export const KWT_DENOM = ORAI_BRIDGE_EVM_DENOM_PREFIX + KWT_BSC_CONTRACT;
export const MILKY_DENOM = ORAI_BRIDGE_EVM_DENOM_PREFIX + MILKY_BSC_CONTRACT;

// websocket consts
export const WEBSOCKET_RECONNECT_ATTEMPTS = 5;
export const WEBSOCKET_RECONNECT_INTERVAL = 20000;

// asset info token
export const ORAI_INFO = {
  native_token: {
    denom: ORAI,
  },
};

export const ORAIX_INFO = {
  token: {
    contract_addr: process.env.REACT_APP_ORAIX_CONTRACT,
  },
};

export const ORAIXOCH_INFO = {
  token: {
    contract_addr: process.env.REACT_APP_XOCH_CONTRACT,
  },
};

// slippage swap
export const OPTIONS_SLIPPAGE = [1, 3, 5];
export const DEFAULT_SLIPPAGE = OPTIONS_SLIPPAGE[0];
export const DEFAULT_MANUAL_SLIPPAGE = 2.5;

export const WRAP_BNB_CONTRACT = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

export const WRAP_ETH_CONTRACT = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// create cw20 token
export const CODE_ID_CW20 = 761;
export const CW20_DECIMALS = 6;

// type switch wallet between keplr and owallet
export type WalletType = "keplr" | "owallet";

// hardcode this to improve performance
export const proxyContractInfo: {
  [x: string]: { wrapNativeAddr: string; routerAddr: string };
} = {
  "0x01": {
    wrapNativeAddr: ethers.utils.getAddress(WRAP_ETH_CONTRACT),
    routerAddr: ethers.utils.getAddress(
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    ), // uniswap router
  },
  "0x38": {
    wrapNativeAddr: ethers.utils.getAddress(WRAP_BNB_CONTRACT),
    routerAddr: ethers.utils.getAddress(
      "0x10ED43C718714eb63d5aA57B78B54704E256024E"
    ), // pancakeswap router
  },
};

export const swapEvmRoutes: {
  [network: string]: {
    [pair: string]: string[];
  };
} = {
  "0x38": {
    [`${WRAP_BNB_CONTRACT}-${USDT_BSC_CONTRACT}`]: [
      WRAP_BNB_CONTRACT,
      USDT_BSC_CONTRACT,
    ],
    [`${WRAP_BNB_CONTRACT}-${USDT_TRON_CONTRACT}`]: [
      WRAP_BNB_CONTRACT,
      USDT_BSC_CONTRACT,
    ],
    [`${WRAP_BNB_CONTRACT}-${ORAI_BSC_CONTRACT}`]: [
      WRAP_BNB_CONTRACT,
      ORAI_BSC_CONTRACT,
    ],
    [`${WRAP_BNB_CONTRACT}-${AIRI_BSC_CONTRACT}`]: [
      WRAP_BNB_CONTRACT,
      AIRI_BSC_CONTRACT,
    ],
    [`${USDT_BSC_CONTRACT}-${AIRI_BSC_CONTRACT}`]: [
      USDT_BSC_CONTRACT,
      WRAP_BNB_CONTRACT,
      AIRI_BSC_CONTRACT,
    ],
    [`${USDT_BSC_CONTRACT}-${ORAI_BSC_CONTRACT}`]: [
      USDT_BSC_CONTRACT,
      WRAP_BNB_CONTRACT,
      ORAI_BSC_CONTRACT,
    ],
    [`${ORAI_BSC_CONTRACT}-${AIRI_BSC_CONTRACT}`]: [
      ORAI_BSC_CONTRACT,
      WRAP_BNB_CONTRACT,
      AIRI_BSC_CONTRACT,
    ],
  },
  "0x01": {
    [`${WRAP_ETH_CONTRACT}-${USDC_ETH_CONTRACT}`]: [
      WRAP_ETH_CONTRACT,
      USDC_ETH_CONTRACT,
    ],
    [`${WRAP_ETH_CONTRACT}-${ORAI_ETH_CONTRACT}`]: [
      WRAP_ETH_CONTRACT,
      ORAI_ETH_CONTRACT,
    ],
  },
};

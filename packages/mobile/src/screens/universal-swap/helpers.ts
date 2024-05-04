import { TypeTextAndCustomizeComponent } from "./types";
import {
  Networks,
  BSC_SCAN,
  ETHEREUM_SCAN,
  TRON_SCAN,
  KWT_SCAN,
  network,
  NetworkChainId,
  PAIRS_CHART,
} from "@oraichain/oraidex-common";
import { showToast } from "@src/utils/helper";
import { API } from "@src/common/api";

export const checkFnComponent = (
  titleRight: TypeTextAndCustomizeComponent,
  Element: React.ReactNode
) => {
  if (!!titleRight) {
    if (typeof titleRight === "string") {
      return Element;
    } else if (typeof titleRight === "function") {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};

export const handleSaveTokenInfos = async (address, tokenInfos) => {
  await API.saveTokenInfos(
    {
      address,
      tokesInfos: tokenInfos,
    },
    {
      baseURL: "https://staging.owallet.dev/",
    }
  );
};

export const floatToPercent = (value: number): number => {
  return Number(value) * 100;
};

export const handleErrorSwap = (message: string) => {
  let formatedMessage = message;
  if (message.includes("of undefined")) {
    formatedMessage = "Transaction Rejected!";
  }
  showToast({
    message: formatedMessage,
    type: "danger",
  });
};

export const getTransactionUrl = (
  chainId: NetworkChainId | string,
  transactionHash: string
) => {
  switch (Number(chainId)) {
    case Networks.bsc:
      return `${BSC_SCAN}/tx/${transactionHash}`;
    case Networks.mainnet:
      return `${ETHEREUM_SCAN}/tx/${transactionHash}`;
    case Networks.tron:
      return `${TRON_SCAN}/#/transaction/${transactionHash.replace(/^0x/, "")}`;
    default:
      // raw string
      switch (chainId) {
        case "kawaii_6886-1":
          return `${KWT_SCAN}/tx/${transactionHash}`;
        case "Oraichain":
          return `${network.explorer}/txs/${transactionHash}`;
      }
      return null;
  }
};

export enum PairAddress {
  AIRI_ORAI = "orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep",
  ORAIX_ORAI = "orai1m6q5k5nr2eh8q0rdrf57wr7phk7uvlpg7mwfv5",
  ATOM_ORAI = "orai1jf74ry4m0jcy9emsaudkhe7vte9l8qy8enakvs",
  USDT_ORAI = "orai1c5s03c3l336dgesne7dylnmhszw8554tsyy9yt",
  KWT_ORAI = "orai1ynmd2cemryhcwtjq3adhcwayrm89l2cr4tws4v",
  OSMO_ORAI = "orai1d37artrk4tkhz2qyjmaulc2jzjkx7206tmpfug",
  MILKY_USDT = "orai1hr2l03ep6p9lwdkuqu5253fgpzc40xcpwymjfc",
  SCORAI_ORAI = "orai15aunrryk5yqsrgy0tvzpj7pupu62s0t2n09t0dscjgzaa27e44esefzgf8",
  USDC_ORAI = "orai19ttg0j7w5kr83js32tmwnwxxdq9rkmw4m3d7mn2j2hkpugwwa4tszwsnkg",
  WTRX_ORAI = "orai103ya8qkcf3vg4nksqquy0v5pvnugjtlt0uxpfh0fkuqge2a6k4aqwurg22",
  SCATOM_ATOM = "orai16ltg2c8u9styus3dgql64mpupvtclxt9xdzvz0slx3pnrycxpm3qw75c5x",
  INJ_ORAI = "orai1le7w5dmd23ky8f6zgtgfnpdv269qs6ezgr839sm8kj24rwaqqnrs58wf4u",
  USDC_ORAIX = "orai1n4edv5h86rawzrvhy8lmrmnnmmherxnhuwqnk3yuvt0wgclh75usyn3md6",
  ORAI_WETH = "orai10jgd0l4l0p2h7ugpk2lz64wpefjxc0h7evnlxf76a3fspdplarnsl9ma4j",
  ORAI_BTC = "orai1fv5kwdv4z0gvp75ht378x8cg2j7prlywa0g35qmctez9q8u4xryspn6lrd",
  NTMPI_USDC = "orai1yemx80gvcw05trjehy94rl4jz5dqjf2qxhks6258uvxd5s0m7h2quavx0g",
  OCH_ORAI = "orai1d3f3e3j400hxse5z8vxxnxdwmvljs7mh8xa3wp3spe8g4ngnc3cqx8scs3",
}

// smart route swap
export const findKeyByValue = (obj, value: string) =>
  Object.keys(obj).find((key) => obj[key] === value);

export const findTokenInfo = (token, flattenTokens) => {
  return flattenTokens.find(
    (t) =>
      t.contractAddress?.toUpperCase() === token?.toUpperCase() ||
      t.denom.toUpperCase() === token?.toUpperCase()
  );
};

const DefaultIcon =
  "https://assets.coingecko.com/coins/images/12931/standard/orai.png?1696512718";

export const findBaseTokenIcon = (
  coinGeckoId,
  flattenTokensWithIcon,
  isLightMode
) => {
  const baseToken = flattenTokensWithIcon.find(
    (token) => token.coinGeckoId === coinGeckoId
  );
  return baseToken
    ? isLightMode
      ? baseToken.IconLight
      : baseToken.Icon
    : DefaultIcon;
};

export const getPairInfo = (
  path,
  flattenTokens,
  flattenTokensWithIcon,
  isLightMode
) => {
  const pairKey = findKeyByValue(PairAddress, path.poolId);
  const [tokenInKey, tokenOutKey] = pairKey.split("_");
  let infoPair: any = PAIRS_CHART.find((pair) => {
    let convertedArraySymbols = pair.symbols.map((symbol) =>
      symbol.toUpperCase()
    );
    return (
      convertedArraySymbols.includes(tokenInKey) &&
      convertedArraySymbols.includes(tokenOutKey)
    );
  });
  const tokenIn = infoPair?.assets?.find(
    (info) => info.toUpperCase() !== path.tokenOut.toUpperCase()
  );
  const tokenOut = path.tokenOut;

  infoPair = {
    ...infoPair,
    tokenIn: tokenIn,
    tokenOut: tokenOut,
  };

  const TokenInIcon = findBaseTokenIcon(
    findTokenInfo(tokenIn, flattenTokens)?.coinGeckoId,
    flattenTokensWithIcon,
    isLightMode
  );
  const TokenOutIcon = findBaseTokenIcon(
    findTokenInfo(tokenOut, flattenTokens)?.coinGeckoId,
    flattenTokensWithIcon,
    isLightMode
  );

  return { infoPair, TokenInIcon, TokenOutIcon, pairKey };
};

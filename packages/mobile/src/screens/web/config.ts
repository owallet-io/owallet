import { ImageSourcePropType } from "react-native";

export const InjectedProviderUrl =
  process.env.INJECTED_PROVIDER_URL ||
  "https://static.orai.io/injected-provider-merge.bundle.js";

export type DAppInfo = {
  name: string;
  uri: string;
  logo?: ImageSourcePropType;
};

const oraiLogo = require("../../assets/image/webpage/orai_logo.png");
// const aiRight = require('../../assets/image/webpage/airight_logo.png');

export const DAppInfos: DAppInfo[] = [
  {
    name: "Oraidex",
    uri: "https://oraidex.io",
    logo: oraiLogo,
  },
  {
    name: "Orderbook",
    uri: "https://orderbook.orai.io",
    logo: oraiLogo,
  },
  // {
  //
  //   name: 'Oraidex',
  //   uri: '192.168.0.147',
  //   logo: oraiLogo
  // },
  // {
  //   name: 'Staging Oraidex',
  //   uri: 'https://staging.oraidex.io',
  //   logo: oraiLogo
  // },
  // {
  //   name: 'Staging V2 Oraidex',
  //   uri: 'https://staging-v2.oraidex.io/',
  //   logo: oraiLogo
  // },
  // {
  //   name: 'Local V2 Oraidex',
  //   uri: 'http://192.168.1.85:3000',
  //   logo: oraiLogo
  // },
  {
    name: "Osmosis",
    uri: "https://app.osmosis.zone",
    logo: require("../../assets/image/webpage/osmosis_logo.png"),
  },
  {
    name: "Oraiscan testnet",
    uri: "https://testnet.scan.orai.io",
    logo: oraiLogo,
  },
  {
    name: "Oraiscan",
    uri: "https://scan.orai.io",
    logo: oraiLogo,
  },
  // {
  //   name: 'Balcony Subnet',
  //   uri: 'https://bignft.web.app',
  //   logo: balconyLogo,
  // },
  // {
  //
  //   name: 'Balcony Subnet',
  //   uri: 'https://re.bignft.app',
  //   logo: balconyLogo
  // },
  {
    name: "OraiDEX Info",
    uri: "https://info.oraidex.io",
    logo: oraiLogo,
  },
  // {
  //
  //   name: 'Balcony Subnet EVM',
  //   uri: 'https://staging-big-nft.web.app/properties',
  //   logo: balconyLogo
  // },
  {
    name: "Orchai App",
    uri: "https://app.orchai.io",
    logo: oraiLogo,
  },
  {
    name: "Orchai App Staging",
    uri: "https://app-staging.orchai.io",
    logo: oraiLogo,
  },
  {
    name: "Kawaii App Staging",
    uri: "https://owallet-kawaii.web.app",
    logo: oraiLogo,
  },
  {
    name: "Kawaii App",
    uri: "https://owallet-kawaii.firebaseapp.com",
    logo: oraiLogo,
  },
  {
    name: "aiRight",
    uri: "https://airight.io",
    logo: oraiLogo,
  },
  {
    name: "aiRight",
    uri: "https://mainnet-airight-staging.web.app",
    logo: oraiLogo,
  },
];

if (__DEV__) {
  DAppInfos.unshift({
    name: "Oraidex",
    uri: InjectedProviderUrl,
    logo: oraiLogo,
  });
}

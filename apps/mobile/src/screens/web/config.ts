import { ImageSourcePropType } from "react-native";

export const InjectedProviderUrl =
  "https://static.orai.io/injected-provider-keyring.bundle.js";
// export const InjectedProviderUrl =
//   "http://192.168.10.92:8080/injected-provider.bundle.js?k=1";

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
    uri: "https://app.oraidex.io",
    logo: oraiLogo,
  },
  // {
  //   name: "Oraidex Dev",
  //   uri: "https://develop-v3.oraiswap-frontend.pages.dev",
  //   logo: oraiLogo,
  // },
  {
    name: "Multisig",
    uri: "https://multisig.orai.io",
    logo: oraiLogo,
  },
  {
    name: "Homebase",
    uri: "https://hub.orai.io",
    logo: oraiLogo,
  },
  {
    name: "Orderbook",
    uri: "https://orderbook.oraidex.io",
    logo: oraiLogo,
  },
  {
    name: "Futures",
    uri: "https://futures.oraidex.io",
    logo: oraiLogo,
  },
  {
    name: "Osmosis",
    uri: "https://app.osmosis.zone",
    logo: require("../../assets/image/webpage/osmosis_logo.png"),
  },
  {
    name: "Oraiscan",
    uri: "https://scan.orai.io",
    logo: oraiLogo,
  },
  {
    name: "Orchai App",
    uri: "https://app.orchai.io",
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
  // {
  //   name: "aiRight",
  //   uri: "https://airight.io",
  //   logo: oraiLogo,
  // },
];

if (__DEV__) {
  DAppInfos.unshift({
    name: "Oraidex",
    uri: InjectedProviderUrl,
    logo: oraiLogo,
  });
}

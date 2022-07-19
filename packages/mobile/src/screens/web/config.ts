import { ImageSourcePropType } from 'react-native';

export const InjectedProviderUrl =
  process.env.INJECTED_PROVIDER_URL || 'https://owallet-provider.oraidex.io';

export type DAppInfo = {
  id: number;
  name: string;
  uri: string;
  logo?: ImageSourcePropType;
};

export const oraiLogo = require('../../assets/image/webpage/orai_logo.png');
const balconyLogo = require('../../assets/image/webpage/balcony.png');

export const DAppInfos: DAppInfo[] = [
  {
    id: 1,
    name: 'Oraidex',
    uri: 'https://oraidex.io',
    logo: oraiLogo
  },
  {
    id: 2,
    name: 'Oraidex',
    uri: 'https://staging.oraidex.io',
    logo: oraiLogo
  },
  {
    id: 3,
    name: 'Osmosis',
    uri: 'https://app.osmosis.zone',
    logo: require('../../assets/image/webpage/osmosis_logo.png')
  },
  {
    id: 4,
    name: 'Oraiscan testnet',
    uri: 'https://testnet.scan.orai.io',
    logo: oraiLogo
  },
  {
    id: 5,
    name: 'Oraiscan',
    uri: 'https://scan.orai.io',
    logo: oraiLogo
  },
  // {
  //   name: 'Balcony Subnet',
  //   uri: 'https://bignft.web.app',
  //   logo: balconyLogo,
  // },
  // {
  //   id: 6,
  //   name: 'Balcony Subnet',
  //   uri: 'https://re.bignft.app',
  //   logo: balconyLogo
  // },
  {
    id: 7,
    name: 'OraiDEX Info',
    uri: 'https://info.oraidex.io',
    logo: oraiLogo
  }
];

if (__DEV__) {
  DAppInfos.unshift({
    id: 1,
    name: 'Oraidex',
    uri: InjectedProviderUrl,
    logo: oraiLogo
  });
}

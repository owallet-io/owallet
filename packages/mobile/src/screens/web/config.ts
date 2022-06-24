import { ImageSourcePropType } from 'react-native';
import { INJECTED_PROVIDER_URL } from '@env';

export const InjectedProviderUrl =
  INJECTED_PROVIDER_URL || 'https://owallet-provider.oraidex.io';

export type DAppInfo = {
  name: string;
  uri: string;
  logo?: ImageSourcePropType;
};

const oraiLogo = require('../../assets/image/webpage/orai_logo.png');
const balconyLogo = require('../../assets/image/webpage/balcony.png');

export const DAppInfos: DAppInfo[] = [
  {
    name: 'Oraidex',
    uri: 'https://oraidex.io',
    logo: oraiLogo
  },
  {
    name: 'Oraidex',
    uri: 'https://staging.oraidex.io',
    logo: oraiLogo
  },
  {
    name: 'Osmosis',
    uri: 'https://app.osmosis.zone',
    logo: require('../../assets/image/webpage/osmosis_logo.png')
  },
  {
    name: 'Oraiscan testnet',
    uri: 'https://testnet.scan.orai.io',
    logo: oraiLogo
  },
  // {
  //   name: 'Balcony Subnet',
  //   uri: 'https://bignft.web.app',
  //   logo: balconyLogo,
  // },
  {
    name: 'Balcony Subnet',
    uri: 'https://re.bignft.app',
    logo: balconyLogo
  }
];

if (__DEV__) {
  DAppInfos.unshift({
    name: 'Oraidex',
    uri: InjectedProviderUrl,
    logo: oraiLogo
  });
}

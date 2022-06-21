import { ImageSourcePropType } from 'react-native';
import { INJECTED_PROVIDER_URL } from 'react-native-dotenv';

export const InjectedProviderUrl =
  INJECTED_PROVIDER_URL || 'https://owallet-provider.web.app';

export type DAppInfo = {
  name: string;
  uri: string;
  thumbnail: ImageSourcePropType;
  logo?: ImageSourcePropType;
};

const oraiLogo = require('../../assets/image/webpage/orai_logo.png');
const balconyLogo = require('../../assets/image/webpage/balcony.png');
const oraiThumbnail = require('../../assets/image/webpage/bgoraidex.png');
export const DAppInfos: DAppInfo[] = [
  {
    name: 'Oraidex',
    thumbnail: oraiThumbnail,
    uri: 'https://oraidex.io',
    logo: oraiLogo
  },
  {
    name: 'Oraidex',
    thumbnail: oraiThumbnail,
    uri: 'https://staging.oraidex.io',
    logo: oraiLogo
  },
  {
    name: 'Osmosis',
    thumbnail: require('../../assets/image/webpage/bgomosis.png'),
    uri: 'https://app.osmosis.zone',
    logo: require('../../assets/image/webpage/osmosis_logo.png')
  },
  {
    name: 'Oraiscan testnet',
    thumbnail: oraiThumbnail,
    uri: 'https://testnet.scan.orai.io',
    logo: oraiLogo
  },
  // {
  //   name: 'Balcony Subnet',
  //   thumbnail: balconyLogo,
  //   uri: 'https://bignft.web.app',
  //   logo: balconyLogo,
  // },
  {
    name: 'Balcony Subnet',
    thumbnail: balconyLogo,
    uri: 'https://re.bignft.app',
    logo: balconyLogo
  }
];

if (__DEV__ && INJECTED_PROVIDER_URL) {
  DAppInfos.push({
    name: 'Oraidex',
    thumbnail: oraiThumbnail,
    uri: INJECTED_PROVIDER_URL,
    logo: oraiLogo
  });
}

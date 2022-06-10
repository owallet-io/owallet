import { ImageSourcePropType } from 'react-native';

export const ORAIDEX_DEV_URL = 'http://192.168.68.92:3000';
// export const ORAIDEX_DEV_URL = "https://staging.oraidex.io";

export type DAppInfo = {
  name: string;
  uri: string;
  thumbnail: ImageSourcePropType;
  logo?: ImageSourcePropType;
};

export const DAppInfos: DAppInfo[] = [
  {
    name: 'Oraidex',
    thumbnail: require('../../assets/image/webpage/bgoraidex.png'),
    uri: __DEV__ ? ORAIDEX_DEV_URL : 'https://oraidex.io',
    logo: require('../../assets/image/webpage/orai_logo.png')
  },
  {
    name: 'Osmosis',
    thumbnail: require('../../assets/image/webpage/bgomosis.png'),
    uri: 'https://app.osmosis.zone',
    logo: require('../../assets/image/webpage/osmosis_logo.png')
  }
];
 
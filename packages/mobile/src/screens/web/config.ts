import { ImageSourcePropType } from 'react-native';
import { ORAIDEX_DEV_URL } from 'react-native-dotenv';

export const OraiDexUrl = ORAIDEX_DEV_URL || 'https://staging.oraidex.io';

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
    uri: __DEV__ ? OraiDexUrl : 'https://oraidex.io',
    logo: require('../../assets/image/webpage/orai_logo.png')
  },
  {
    name: 'Osmosis',
    thumbnail: require('../../assets/image/webpage/bgomosis.png'),
    uri: 'https://app.osmosis.zone',
    logo: require('../../assets/image/webpage/osmosis_logo.png')
  }
];
 
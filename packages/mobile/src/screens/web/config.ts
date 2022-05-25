import { ImageSourcePropType } from 'react-native';

export type DAppInfo = {
  name: string;
  uri: string;
  thumbnail: ImageSourcePropType;
};

export const DAppInfos: DAppInfo[] = [
  {
    name: 'Oraidex',
    thumbnail: require('../../assets/image/webpage/oraidex.png'),
    uri: 'http://192.168.0.198:3000'
  },
  {
    name: 'Osmosis',
    thumbnail: require('../../assets/image/webpage/osmosis.png'),
    uri: 'https://app.osmosis.zone'
  }
];

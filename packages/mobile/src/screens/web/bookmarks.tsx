import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useStyle } from '../../styles';
import { BrowserSectionTitle } from './components/section-title';
import { RemoveIcon } from '../../components/icon';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const BrowserSection: FunctionComponent<{}> = ({}) => {
  const style = useStyle();
  return (
    <React.Fragment>
      <View
        style={style.flatten([
          'width-full',
          'height-66',
          'flex-row',
          'justify-between',
          'items-center',
          'padding-20'
        ])}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '500',
            color: '#1C1C1E'
          }}
        >
          Bookmarks
        </Text>
      </View>
      <View
        style={style.flatten([
          'height-1',
          'margin-x-20',
          'background-color-border-white'
        ])}
      />
    </React.Fragment>
  );
};

export const BookMarks: FunctionComponent<any> = () => {
  const style = useStyle();
  const [isOpenSetting] = useState(false);
  useEffect(() => {}, []);
  return (
    <View
      style={style.flatten(['flex-column', 'justify-between', 'height-full'])}
    >
      <View style={{ opacity: isOpenSetting ? 0.8 : 1 }}>
        <BrowserSectionTitle title="All bookmarks" />
        <View
          style={style.flatten([
            'height-full',
            'background-color-white',
            'margin-y-24'
          ])}
        >
          <BrowserSection />
          <View style={style.flatten(['height-full', 'padding-20'])}>
            {[
              {
                label: 'Oraidex',
                uri: 'https://oraidex.io',
                logo: (
                  <Image
                    style={{
                      width: 20,
                      height: 20
                    }}
                    source={require('../../assets/image/webpage/oraidex_icon.png')}
                    fadeDuration={0}
                  />
                )
              },
              {
                label: 'Osmosis Trade',
                uri: 'https://app.osmosis.zone',
                logo: (
                  <Image
                    style={{
                      width: 20,
                      height: 22
                    }}
                    source={require('../../assets/image/webpage/osmosis_icon.png')}
                    fadeDuration={0}
                  />
                )
              }
            ].map((e) => (
              <TouchableOpacity
                style={style.flatten([
                  'height-44',
                  'margin-bottom-20',
                  'flex-row',
                  'items-center',
                  'justify-between'
                ])}
              >
                <View style={style.flatten(['flex-row'])}>
                  <View style={style.flatten(['padding-top-5'])}>{e.logo}</View>
                  <View style={style.flatten(['padding-x-15'])}>
                    <Text style={style.flatten(['subtitle2'])}>{e.label}</Text>
                    <Text style={{ color: '#636366', fontSize: 14 }}>
                      {e.uri}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <RemoveIcon />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

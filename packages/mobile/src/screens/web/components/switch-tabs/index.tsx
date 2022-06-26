import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
import { useStore } from '../../../../stores';
import { DAppInfos } from '../../config';

const oraiLogo = require('../../../../assets/image/webpage/orai_logo.png');

const COLOR_PRIMARY = '#39A0FF';
const COLOR_WHITE = '#fff';
const DEVICE_WIDTH = Dimensions.get('window').width;

const DIMENSION_PADDING_MEDIUM = 16;
const DIMENSION_PADDING_SMALL = 8;
const DIMENSION_RADIUS_LARGE = 12;

const perspective = 1000;
const rotateX = -Math.PI / 6;
const z = 150 * Math.sin(Math.abs(rotateX));

export const SwtichTab: FunctionComponent<{ onPressItem: Function }> = ({
  onPressItem,
}) => {
  const { browserStore } = useStore();

  const onPressDelete = (item) => () => {
    // ReduxDispatcher(removeTab(item));
  };

  const onPress = (item) => () => {
    onPressItem(item);
    // ReduxDispatcher(setTabDefault(item));
  };

  const renderItem = (item, index) => {
    // const isSelect = item.id === currentTab?.id;
    const isSelect = index % 2 === 0;
    return (
      <TouchableWithoutFeedback
        onPress={onPress(item)}
        style={{ padding: DIMENSION_PADDING_MEDIUM }}
      >
        <View key={index} style={styles.wrapItem}>
          <View
            style={[
              styles.wrapContent,
              {
                borderColor: isSelect ? COLOR_PRIMARY : COLOR_WHITE,
              },
            ]}
          >
            <View
              style={[
                styles.wrapTitle,
                {
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <Text
                style={{ flex: 1, fontWeight: 'bold', color: '#fff' }}
                numberOfLines={1}
              >
                {item?.name ?? (item?.uri || 'New tab')}
              </Text>
              <TouchableOpacity>
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.webview,
                { justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <Image
                source={oraiLogo}
                style={{
                  width: DEVICE_WIDTH / 5,
                  height: DEVICE_WIDTH / 5,
                }}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderContent = () => {
    // if (!tabs?.length) {
    //   return (
    //     <View paddingHorizontal={DIMENSION_PADDING_MEDIUM} center full>
    //       <Text bold size={18}>
    //         No Open Tabs
    //       </Text>
    //       <Text style={{ marginTop: DIMENSION_PADDING_SMALL }}>
    //         To browse the decentralized web, add a new tab
    //       </Text>
    //     </View>
    //   );
    // }
    return (
      <ScrollView
        contentContainerStyle={{
          padding: DIMENSION_PADDING_MEDIUM,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {DAppInfos.map(renderItem)}
      </ScrollView>
    );
  };

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  webview: { width: '100%', height: 100 },
  wrapItem: {
    marginTop: -DIMENSION_PADDING_MEDIUM,
    overflow: 'hidden',
    padding: 4,
    borderRadius: DIMENSION_RADIUS_LARGE,
    transform: [
      {
        perspective,
      },
      {
        rotateX: `${rotateX}rad`,
      },
      {
        scale: perspective / (perspective - z),
      },
    ],
  },
  wrapTitle: {
    paddingHorizontal: DIMENSION_PADDING_MEDIUM,
    paddingVertical: DIMENSION_PADDING_SMALL,
    backgroundColor: COLOR_PRIMARY,
  },
  wrapContent: {
    borderRadius: DIMENSION_RADIUS_LARGE,
    overflow: 'hidden',
    marginHorizontal: DIMENSION_PADDING_MEDIUM,
    borderWidth: 3,
  },
});

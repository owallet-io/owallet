import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@src/components/text';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../../../stores';
import { observer } from 'mobx-react-lite';
import { getDomainFromUrl, _keyExtract } from '../../../../utils/helper';
import { colors, spacing } from '../../../../themes';
import { XIcon } from '../../../../components/icon';
import { useNavigation } from '@react-navigation/native';

// const oraiLogo = require('../../../../assets/image/webpage/orai_logo.png');
const COLOR_PRIMARY = colors['primary-surface-default'];
const COLOR_PRIMARY_LIGHT = colors['primary-100'];
const DEVICE_WIDTH = Dimensions.get('window').width;
const DIMENSION_PADDING_MEDIUM = 16;
const DIMENSION_PADDING_SMALL = 8;

export const SwtichTab: FunctionComponent<{
  onPressItem: Function;
}> = observer(({ onPressItem }) => {
  const { browserStore } = useStore();
  const [tabs, setTabs] = useState([]);
  const navigation = useNavigation();

  const onPressDelete = item => () => {
    browserStore.removeTab(item);
    const tmpTabs = [...tabs];
    const rTabIndex = tabs.findIndex(t => t.id === item.id);
    if (rTabIndex > -1) {
      tmpTabs.splice(rTabIndex, 1);
    }
    setTabs(tmpTabs);
    if (tmpTabs.length < 1) {
      navigation.navigate('Browser', {});
    }
  };

  const onPress = item => () => {
    onPressItem(item);
    browserStore.updateSelectedTab(item);
  };

  useEffect(() => {
    setTabs(browserStore.getTabs);
    navigation.setOptions({
      headerShown: false
    });
    return () => {
      navigation.setOptions({
        headerShown: true
      });
    };
  }, []);

  const renderItem = ({ item, index }) => {
    const isSelect = item.id === browserStore.getSelectedTab?.id;

    return (
      <View style={styles.wrapContent}>
        <View
          key={index}
          style={[
            styles.wrapItem,
            {
              borderColor: isSelect ? COLOR_PRIMARY : COLOR_PRIMARY_LIGHT
            }
          ]}
        >
          <View
            style={[
              styles.wrapTitle,
              {
                backgroundColor: isSelect ? COLOR_PRIMARY : COLOR_PRIMARY_LIGHT
              }
            ]}
          >
            <Text style={{ flex: 1, fontWeight: 'bold', color: '#fff' }} numberOfLines={1}>
              {item?.name ?? (item?.uri || 'New tab')}
            </Text>
            <TouchableOpacity onPress={onPressDelete(item)}>
              <XIcon color={colors['white']} />
            </TouchableOpacity>
          </View>
          <TouchableWithoutFeedback onPress={onPress(item)}>
            <View style={[styles.webview]}>
              <Image
                source={{
                  uri: `https://www.google.com/s2/favicons?sz=64&domain_url=${getDomainFromUrl(item.uri)}`
                }}
                style={{
                  width: DEVICE_WIDTH / 5,
                  height: DEVICE_WIDTH / 5
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (tabs.length < 1) {
      return (
        <View style={styles.emptyTab}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>No Open Tabs</Text>
          <Text style={{ marginTop: DIMENSION_PADDING_SMALL }}>To browse the decentralized web, add a new tab</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={tabs}
        numColumns={2}
        keyExtractor={_keyExtract}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: DIMENSION_PADDING_MEDIUM,
          paddingBottom: 100
        }}
        horizontal={false}
      />
    );
  };

  return (
    <View
      style={{
        paddingTop: 40
      }}
    >
      {renderContent()}
      {browserStore.getTabs.length > 0 ? (
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            alignItems: 'center',
            alignSelf: 'center'
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: colors['primary-surface-default'],
              borderRadius: spacing['8'],
              marginLeft: 8,
              marginRight: 8
            }}
            onPress={() => {
              browserStore.updateTabs([]);
              setTabs([]);
              navigation.navigate('Browser', {});
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: spacing['6'],
                paddingBottom: spacing['6'],
                paddingLeft: spacing['12'],
                paddingRight: spacing['12']
              }}
            >
              <XIcon color={colors['primary-text']} />
              <Text
                style={{
                  lineHeight: spacing['20'],
                  color: colors['primary-text'],
                  paddingLeft: spacing['6'],
                  fontWeight: '700'
                }}
              >
                {'Close all tab'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  webview: { height: 165, justifyContent: 'center', alignItems: 'center' },
  wrapItem: {
    borderRadius: 8,
    borderWidth: 1
  },
  wrapTitle: {
    paddingHorizontal: DIMENSION_PADDING_MEDIUM,
    paddingVertical: DIMENSION_PADDING_SMALL,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  wrapContent: {
    width: '46%',
    height: 210,
    marginHorizontal: spacing['8'],
    marginVertical: spacing['8'],
    borderRadius: spacing['8']
  },
  emptyTab: {
    paddingHorizontal: DIMENSION_PADDING_MEDIUM,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40
  }
});

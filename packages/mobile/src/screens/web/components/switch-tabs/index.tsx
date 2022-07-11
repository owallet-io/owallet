import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { CText as Text } from '../../../../components/text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../../../stores';
import { observer } from 'mobx-react-lite';
import { oraiLogo } from '../../config';

const COLOR_PRIMARY = '#39A0FF';
const COLOR_WHITE = '#fff';
const DEVICE_WIDTH = Dimensions.get('window').width;

const DIMENSION_PADDING_MEDIUM = 16;
const DIMENSION_PADDING_SMALL = 8;
const DIMENSION_RADIUS_LARGE = 12;

const perspective = 1000;
const rotateX = -Math.PI / 6;
const z = 150 * Math.sin(Math.abs(rotateX));

export const SwtichTab: FunctionComponent<{ onPressItem: Function }> = observer(
  ({ onPressItem }) => {
    const { browserStore } = useStore();
    const [tabs, setTabs] = useState([]);

    const onPressDelete = (item) => () => {
      browserStore.removeTab(item);
      const tmpTabs = [...tabs];
      const rTabIndex = tabs.findIndex((t) => t.id === item.id);
      if (rTabIndex > -1) {
        tmpTabs.splice(rTabIndex, 1);
      }
      setTabs(tmpTabs);
    };

    const onPress = (item) => () => {
      onPressItem(item);
      browserStore.updateSelectedTab(item);
    };

    useEffect(() => {
      setTabs(browserStore.getTabs);
    }, []);

    const renderItem = (item, index) => {
      const isSelect = item.id === browserStore.getSelectedTab?.id;
      return (
        <View style={{ padding: DIMENSION_PADDING_MEDIUM }}>
          <View key={index} style={styles.wrapItem}>
            <View
              style={[
                styles.wrapContent,
                {
                  borderColor: isSelect ? COLOR_PRIMARY : COLOR_WHITE
                }
              ]}
            >
              <View
                style={[
                  styles.wrapTitle,
                  {
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }
                ]}
              >
                <Text
                  style={{ flex: 1, fontWeight: 'bold', color: '#fff' }}
                  numberOfLines={1}
                >
                  {item?.name ?? (item?.uri || 'New tab')}
                </Text>
                <TouchableOpacity onPress={onPressDelete(item)}>
                  <Text>X</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.webview,
                  { justifyContent: 'center', alignItems: 'center' }
                ]}
              >
                <TouchableWithoutFeedback
                  style={[styles.webview]}
                  onPress={onPress(item)}
                >
                  <Image
                    source={oraiLogo}
                    style={{
                      width: DEVICE_WIDTH / 5,
                      height: DEVICE_WIDTH / 5
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </View>
      );
    };

    const renderContent = () => {
      if (tabs.length < 1) {
        return (
          <View
            style={{
              paddingHorizontal: DIMENSION_PADDING_MEDIUM,
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 40
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              No Open Tabs
            </Text>
            <Text style={{ marginTop: DIMENSION_PADDING_SMALL }}>
              To browse the decentralized web, add a new tab
            </Text>
          </View>
        );
      }
      return (
        <ScrollView
          contentContainerStyle={{
            padding: DIMENSION_PADDING_MEDIUM,
            paddingBottom: 100
          }}
          showsVerticalScrollIndicator={false}
        >
          {tabs.map(renderItem)}
        </ScrollView>
      );
    };

    return (
      <View
        style={{
          paddingTop: 40,
          width: '100%',
          height: '100%'
        }}
      >
        {renderContent()}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  webview: { width: '100%', height: 100 },
  wrapItem: {
    marginTop: -DIMENSION_PADDING_MEDIUM,
    overflow: 'hidden',
    padding: 4,
    borderRadius: DIMENSION_RADIUS_LARGE,
    transform: [
      {
        perspective
      },
      {
        rotateX: `${rotateX}rad`
      },
      {
        scale: perspective / (perspective - z)
      }
    ]
  },
  wrapTitle: {
    paddingHorizontal: DIMENSION_PADDING_MEDIUM,
    paddingVertical: DIMENSION_PADDING_SMALL,
    backgroundColor: COLOR_PRIMARY
  },
  wrapContent: {
    borderRadius: DIMENSION_RADIUS_LARGE,
    overflow: 'hidden',
    marginHorizontal: DIMENSION_PADDING_MEDIUM,
    borderWidth: 3
  }
});

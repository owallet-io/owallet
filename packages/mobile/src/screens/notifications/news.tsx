import React, { FunctionComponent, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { CText as Text } from '../../components/text';
import { colors, metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';

const data = [
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  },
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  },
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  },
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  },
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  },
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  },
  {
    label: 'OraiDEX is now ready for Ledger users with full options',
    content:
      'Claim ORAIX using Ledger x #OWallet extension. Bridge $ATOM from CosmosHub to Oraichain network using Advanced IBC Transfers; ',
    time: 'Wed 28, 2022',
    img: ''
  }
];

export const NewsTab: FunctionComponent<{}> = () => {
  const [loading, setLoading] = useState(false);
  const _handleRefresh = () => {
    console.log('refresh');
  };

  const _renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          padding: 8,
          flexDirection: 'row',
          backgroundColor: '#F3F1F5',
          marginVertical: 8,
          borderRadius: 8
        }}
      >
        <View>
          {/* <FastImage  /> */}
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 8,
              backgroundColor: colors['primary']
            }}
          />
        </View>
        <View style={{ paddingLeft: 12, maxWidth: '75%' }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 16
            }}
            numberOfLines={2}
          >
            {item.label}
          </Text>
          <Text
            style={{
              color: colors['blue-300'],
              paddingTop: 8
            }}
            numberOfLines={3}
          >
            {item.content}
          </Text>
          <Text
            style={{
              color: colors['blue-300'],
              paddingTop: 8,
              fontWeight: '700'
            }}
          >
            {item.time}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ height: metrics.screenHeight }}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          paddingBottom: metrics.screenHeight / 4.2
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtract}
          data={data}
          renderItem={_renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={_handleRefresh} />
          }
          ListFooterComponent={<View style={{ height: spacing['12'] }} />}
          ListEmptyComponent={
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: metrics.screenHeight / 4
              }}
            >
              <Text
                style={{
                  ...typography.subtitle1,
                  color: colors['gray-300']
                }}
              >
                {'Comming Soon!'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

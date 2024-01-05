import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, CardBody, OWBox } from '../../components/card';
import { StyleSheet, View, ViewStyle, Image } from 'react-native';
// import { CText as Text } from '../../components/text';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useSmartNavigation } from '../../navigation.provider';
import { metrics, spacing, typography } from '../../themes';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme } from '@src/themes/theme-provider';
import { TRC20_LIST, _keyExtract } from '../../utils/helper';
import { RightArrowIcon } from '../../components/icon';
import { API } from '../../common/api';
import FastImage from 'react-native-fast-image';
import { VectorCharacter } from '../../components/vector-character';
import Big from 'big.js';
import { Text } from '@src/components/text';
import { OWEmpty } from '@src/components/empty';
import { getBase58Address } from '@owallet/common';

const size = 44;
const imageScale = 0.54;
const USDT_DEFAULT_PRICE = 1;

export const TronTokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [tokens, setTokens] = useState([]);
  const { colors } = useTheme();
  const styles = styling(colors);

  const smartNavigation = useSmartNavigation();
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getTronAccountInfo(
          {
            address
          },
          {
            baseURL: chainStore.current.rpc
            // baseURL: 'https://nile.trongrid.io/' // TRON testnet
          }
        );

        if (res.data?.data.length > 0) {
          if (res.data?.data[0].trc20) {
            const tokenArr = [];
            TRC20_LIST.map(tk => {
              let token = res.data?.data[0].trc20.find(t => tk.contractAddress in t);
              if (token) {
                tokenArr.push({ ...tk, amount: token[tk.contractAddress] });
              }
            });

            setTokens(tokenArr);
          }
        }
      } catch (error) {}
    })();
  }, [account.evmosHexAddress, keyRingStore.keyRingLedgerAddresses]);

  const _renderFlatlistItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.containerToken}
        onPress={() => {
          smartNavigation.navigateSmart('SendTron', { item });
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: size,
              height: size,
              borderRadius: spacing['6'],
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: colors['red-10'],
              marginRight: 12
            }}
          >
            {item?.coinImageUrl ? (
              <FastImage
                style={{
                  width: size * imageScale,
                  height: size * imageScale,
                  backgroundColor: colors['gray-10']
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: item.coinImageUrl
                }}
              />
            ) : (
              <VectorCharacter char={item.coinDenom} height={Math.floor(size * 0.35)} color="black" />
            )}
          </View>
          <View
            style={{
              justifyContent: 'space-between'
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                color: colors['gray-300'],
                fontWeight: '700'
              }}
            >
              {item.coinDenom}({item.contractAddress})
            </Text>
            <Text
              style={{
                ...typography.subtitle2,
                color: colors['primary-text'],
                fontWeight: '700'
              }}
            >
              {`${new Big(parseInt(item.amount)).div(new Big(10).pow(6).toFixed(6))} ${item.coinDenom}`}
            </Text>

            <Text
              style={{
                ...typography.subtitle3,
                color: colors['text-black-low'],
                marginBottom: spacing['4']
              }}
            >
              $
              {`${
                item?.amount
                  ? (
                      parseFloat(new Big(parseInt(item.amount)).div(new Big(10).pow(6).toFixed(6)).toString()) *
                      Number(priceStore?.getPrice(item.coinGeckoId) ?? USDT_DEFAULT_PRICE)
                    ).toFixed(6)
                  : 0
              }` || '$0'}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 0.5,
            justifyContent: 'center',
            alignItems: 'flex-end'
          }}
        >
          <RightArrowIcon height={10} color={colors['gray-150']} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={containerStyle}>
      <OWBox
        style={{
          marginBottom: spacing['24']
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center'
            // width: metrics.screenWidth - 64,
            // marginHorizontal: spacing['32']
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center'
              // marginTop: spacing['12']
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500'
                // color: colors['gray-900']
              }}
            >
              {'Tokens'}
            </Text>
          </View>
        </View>

        <CardBody>
          {tokens.length > 0 ? (
            <FlatList
              data={tokens}
              renderItem={_renderFlatlistItem}
              keyExtractor={_keyExtract}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <OWEmpty />
          )}
        </CardBody>
      </OWBox>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    textLoadMore: {
      ...typography['h7'],
      color: colors['primary-surface-default']
    },
    containerBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors['gray-50'],
      width: metrics.screenWidth - 48,
      height: spacing['40'],
      paddingVertical: spacing['10'],
      borderRadius: spacing['12']
    },
    sectionHeader: {
      ...typography.h7,
      color: colors['gray-800'],
      marginBottom: spacing['8'],
      marginRight: spacing['10']
    },
    flatListItem: {
      backgroundColor: colors['gray-50'],
      borderRadius: spacing['12'],
      width: (metrics.screenWidth - 60) / 2,
      marginRight: spacing['12'],
      padding: spacing['12']
    },
    itemPhoto: {
      // width: (metrics.screenWidth - 84) / 2,
      height: (metrics.screenWidth - 84) / 2,
      borderRadius: 10,
      marginHorizontal: 'auto',
      width: (metrics.screenWidth - 84) / 2
    },
    itemText: {
      ...typography.h7,
      color: colors['gray-900'],
      fontWeight: '700'
    },
    transactionListEmpty: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    containerToken: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing['4'],
      marginVertical: spacing['8'],
      paddingTop: spacing['10'],
      paddingBottom: spacing['10']
    }
  });

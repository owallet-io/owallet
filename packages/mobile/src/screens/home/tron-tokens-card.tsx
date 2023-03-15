import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/card';
import { StyleSheet, View, ViewStyle, Image } from 'react-native';
import { CText as Text } from '../../components/text';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useSmartNavigation } from '../../navigation.provider';
import { colors, metrics, spacing, typography } from '../../themes';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { getBase58Address, TRC20_LIST, _keyExtract } from '../../utils/helper';
import { RightArrowIcon } from '../../components/icon';
import { API } from '../../common/api';
import FastImage from 'react-native-fast-image';
import { VectorCharacter } from '../../components/vector-character';
import Big from 'big.js';

const size = 44;
const imageScale = 0.54;

export const TronTokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [tokens, setTokens] = useState([]);

  const smartNavigation = useSmartNavigation();

  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getTronAccountInfo(
          {
            address: getBase58Address(account.evmosHexAddress)
          },
          {
            baseURL: 'https://api.trongrid.io/'
          }
        );

        if (res.data?.data.length > 0) {
          if (res.data?.data[0].trc20) {
            const tokenArr = [];
            TRC20_LIST.map(tk => {
              let token = res.data?.data[0].trc20.find(
                t => tk.contractAddress in t
              );
              tokenArr.push({ ...tk, amount: token[tk.contractAddress] });
            });

            setTokens(tokenArr);
          }
        }
      } catch (error) {}
    })();
  }, [account.evmosHexAddress]);

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
              <VectorCharacter
                char={item.coinDenom}
                height={Math.floor(size * 0.35)}
                color="black"
              />
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
                color: colors['gray-900'],
                fontWeight: '700'
              }}
            >
              {`${new Big(parseInt(item.amount)).div(
                new Big(10).pow(6).toFixed(6)
              )} ${item.coinDenom}`}
            </Text>

            {/* <Text
              style={{
                ...typography.subtitle3,
                color: colors['text-black-low'],
                marginBottom: spacing['4']
              }}
            >
              {priceBalance?.toString() || '$0'}
            </Text> */}
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
      <Card
        style={{
          paddingTop: spacing['8'],
          paddingBottom: spacing['14'],
          borderRadius: spacing['24'],
          backgroundColor: colors['white']
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: metrics.screenWidth - 64,
            marginHorizontal: spacing['32']
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: spacing['12']
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: colors['gray-900']
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
            <View style={styles.transactionListEmpty}>
              <Image
                source={require('../../assets/image/not_found.png')}
                resizeMode="contain"
                height={142}
                width={142}
              />
              <Text
                style={{
                  ...typography.subtitle2,
                  color: colors['gray-300'],
                  marginTop: spacing['8']
                }}
              >
                {`No result found`}
              </Text>
            </View>
          )}
        </CardBody>
      </Card>
    </View>
  );
});

const styles = StyleSheet.create({
  textLoadMore: {
    ...typography['h7'],
    color: colors['purple-700']
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

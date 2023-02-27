import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Card, CardBody } from '../../components/card';
import { SectionList, StyleSheet, View, ViewStyle, Image } from 'react-native';
import { CText as Text } from '../../components/text';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TokenItem } from '../tokens/components/token-item';
import { useSmartNavigation } from '../../navigation.provider';
import { RectButton } from '../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../themes';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import {
  capitalizedText,
  convertAmount,
  formatContractAddress,
  _keyExtract
} from '../../utils/helper';
import { DownArrowIcon } from '../../components/icon';
import { API } from '../../common/api';
import ProgressiveImage from '../../components/progessive-image';
import { useTheme } from '@react-navigation/native';

// hard code data to test UI
// const nftsData = [
//   {
//     title: 'ERC-721',
//     data: [
//       {
//         uri: 'https://picsum.photos/id/1002/200',
//         title: 'The Empire State Building',
//         oraiPrice: '49.14 ORAI'
//       },
//       {
//         uri: 'https://picsum.photos/id/1002/200',
//         title: 'The Empire State Building',
//         oraiPrice: '49.14 ORAI'
//       },
//       {
//         uri: 'https://picsum.photos/id/1002/200',
//         title: 'The Empire State Building',
//         oraiPrice: '49.14 ORAI'
//       }
//     ]
//   },
//   {
//     title: 'ERC-1155',
//     data: [
//       {
//         uri: 'https://picsum.photos/id/1002/200',
//         title: 'The Empire State Building',
//         oraiPrice: '49.14 ORAI'
//       },
//       {
//         uri: 'https://picsum.photos/id/1002/200',
//         title: 'The Empire State Building',
//         oraiPrice: '49.14 ORAI'
//       },
//       {
//         uri: 'https://picsum.photos/id/1002/200',
//         title: 'The Empire State Building',
//         oraiPrice: '49.14 ORAI'
//       }
//     ]
//   }
// ];

export const TokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [nfts, setNFTs] = useState([]);
  const { colors } = useTheme();
  const styles = styling(colors);
  const smartNavigation = useSmartNavigation();
  const [index, setIndex] = useState<number>(0);
  // const [price, setPrice] = useState<object>({});
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? account.evmosHexAddress
        : account.bech32Address
    );

  const tokens = queryBalances.balances.concat(
    queryBalances.nonNativeBalances,
    queryBalances.positiveNativeUnstakables
  );

  const unique = useMemo(() => {
    const uniqTokens = [];
    tokens.map(token =>
      uniqTokens.filter(
        ut => ut.balance.currency.coinDenom == token.balance.currency.coinDenom
      ).length > 0
        ? null
        : uniqTokens.push(token)
    );
    return uniqTokens;
  }, [
    chainStore.current.chainId,
    account.bech32Address,
    account.evmosHexAddress
  ]);

  // const listTokens = tokens.map((e) => e.balance.currency.coinGeckoId);

  // const config = {
  //   customDomain: 'https://api.coingecko.com/'
  // };
  // const getPriceCoinGecko = async () => {
  //   return await API.get(
  //     `api/v3/simple/price?ids=${listTokens.join(',')}&vs_currencies=usd`,
  //     config
  //   );
  // };
  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getNFTs(
          {
            address: account.bech32Address
          },
          {
            baseURL: 'https://api.airight.io/'
          }
        );

        setNFTs(res.data.items);
      } catch (error) {}
    })();
  }, [account.bech32Address]);

  const _renderFlatlistItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.flatListItem}
        onPress={() => {
          smartNavigation.navigateSmart('Nfts.Detail', { item });
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ProgressiveImage
            source={{
              uri: item.picture ?? item.url
            }}
            style={styles.itemPhoto}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginTop: spacing['12'],
            alignItems: 'flex-start'
          }}
        >
          <Text style={styles.itemText}>
            {item.name.length > 11
              ? formatContractAddress(item.name)
              : item.name}
          </Text>

          {item.version === 1 ? (
            <Text
              style={{
                ...styles.itemText,
                color: colors['gray-300']
              }}
            >
              {item.offer
                ? `${convertAmount(item.offer.amount)} ${item.offer.denom}`
                : ''}
            </Text>
          ) : item.offer ? (
            <View>
              <Text
                style={{
                  ...styles.itemText,
                  color: colors['gray-300']
                }}
              >
                From {convertAmount(item.offer?.lowestPrice)}{' '}
                {item.offer?.denom}
              </Text>
              <Text
                style={{
                  ...styles.itemText,
                  color: colors['gray-300']
                }}
              >
                To {convertAmount(item.offer?.highestPrice)} {item.offer?.denom}
              </Text>
            </View>
          ) : null}
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
          backgroundColor: colors['primary']
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
          {['Tokens', 'NFTs'].map((title: string, i: number) => (
            <View key={i}>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: spacing['12']
                }}
                onPress={() => {
                  setIndex(i);
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color:
                      index === i ? colors['primary-text'] : colors['gray-300']
                  }}
                >
                  {title}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  width: 100,
                  height: 2,
                  marginTop: 8,
                  backgroundColor:
                    index === i ? colors['border'] : colors['primary']
                }}
              />
            </View>
          ))}
        </View>

        {index === 0 ? (
          <CardBody>
            {unique.slice(0, 3).map(token => {
              const priceBalance = priceStore.calculatePrice(token.balance);
              return (
                <TokenItem
                  key={token.currency?.coinMinimalDenom}
                  chainInfo={{
                    stakeCurrency: chainStore.current.stakeCurrency,
                    networkType: chainStore.current.networkType
                  }}
                  balance={token.balance}
                  priceBalance={priceBalance}
                />
              );
            })}
          </CardBody>
        ) : (
          <CardBody>
            {nfts.length > 0 ? (
              <SectionList
                stickySectionHeadersEnabled={false}
                sections={[
                  {
                    title: 'NFTs',
                    data: nfts
                  }
                ]}
                renderSectionHeader={({ section }) => {
                  {
                    return (
                      <>
                        <View
                          style={{
                            marginTop: spacing['12'],
                            flexDirection: 'row'
                          }}
                        >
                          <Text style={styles.sectionHeader}>
                            {section.title}
                          </Text>
                          <DownArrowIcon color={colors['black']} height={12} />
                        </View>

                        <FlatList
                          horizontal
                          data={section.data}
                          renderItem={_renderFlatlistItem}
                          keyExtractor={_keyExtract}
                          showsHorizontalScrollIndicator={false}
                        />
                      </>
                    );
                  }
                }}
                renderItem={() => <View />}
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
        )}

        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors['primary']
          }}
        >
          <RectButton
            style={styles.containerBtn}
            onPress={() => {
              if (index === 0) {
                smartNavigation.navigateSmart('Tokens', {});
              } else {
                smartNavigation.navigateSmart('Nfts', { nfts });
              }
            }}
          >
            <Text style={styles.textLoadMore}>
              {capitalizedText('view all')}
            </Text>
          </RectButton>
        </View>
      </Card>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
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
    }
  });

import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { SectionList, StyleSheet, View, ViewStyle } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native';
import { API } from '../../common/api';
import { CardBody, OWBox } from '../../components/card';
import ProgressiveImage from '../../components/progessive-image';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { metrics, spacing, typography } from '../../themes';
import {
  capitalizedText,
  convertAmount,
  _keyExtract,
  checkImageURL
} from '../../utils/helper';
import { TokenItem } from '../tokens/components/token-item';
import { SoulboundNftInfoResponse } from './types';
import { useSoulbound } from '../nfts/hooks/useSoulboundNft';
import images from '@src/assets/images';

export const TokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  refreshDate: number;
}> = observer(({ containerStyle, refreshDate }) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const { colors } = useTheme();
  const [nfts, setNFTs] = useState([]);

  const [tokens, setTokens] = useState([]);
  const styles = styling(colors);
  const smartNavigation = useSmartNavigation();
  const [index, setIndex] = useState<number>(0);
  const { tokenIds, soulboundNft } = useSoulbound(
    chainStore.current.chainId,
    account,
    chainStore.current.rpc
  );
  // const [price, setPrice] = useState<object>({});
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? account.evmosHexAddress
        : account.bech32Address
    );

  useEffect(() => {
    const queryTokens = queryBalances.balances.concat(
      queryBalances.nonNativeBalances,
      queryBalances.positiveNativeUnstakables
    );

    const uniqTokens = [];
    queryTokens.map((token) =>
      uniqTokens.filter(
        (ut) =>
          ut.balance.currency.coinDenom == token.balance.currency.coinDenom
      ).length > 0
        ? null
        : uniqTokens.push(token)
    );
    setTokens(uniqTokens);
  }, [
    chainStore.current.chainId,
    account.bech32Address,
    account.evmosHexAddress,
    refreshDate
  ]);

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
        style={styles.ContainerBtnNft}
        onPress={() => onDetail(item)}
      >
        <View
          style={[styles.wrapViewNft, { backgroundColor: colors['box-nft'] }]}
        >
          <ProgressiveImage
            source={{
              uri: item.picture ?? item.url
            }}
            style={styles.containerImgNft}
            resizeMode="cover"
            styleContainer={styles.containerImgNft}
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginTop: spacing['12'],
              alignItems: 'flex-start'
            }}
          >
            <Text style={styles.itemText} numberOfLines={1}>
              {item?.name}
            </Text>
            {item.version === 1 ? (
              <Text
                style={{
                  ...styles.itemText,
                  color: colors['gray-300']
                }}
                numberOfLines={1}
              >
                {item.offer
                  ? `${convertAmount(item?.offer?.amount)} ${item.offer.denom}`
                  : '0 $'}
              </Text>
            ) : item.offer ? (
              <View>
                <Text
                  style={{
                    ...styles.itemText,
                    color: colors['gray-300']
                  }}
                  numberOfLines={1}
                >
                  From: {convertAmount(item.offer?.lowestPrice)}{' '}
                  {item.offer?.denom}
                </Text>
                <Text
                  style={{
                    ...styles.itemText,
                    color: colors['gray-300']
                  }}
                  numberOfLines={1}
                >
                  To: {convertAmount(item.offer?.highestPrice)}{' '}
                  {item.offer?.denom}
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  ...styles.itemText,
                  color: colors['gray-300']
                }}
                numberOfLines={1}
              >
                0 $
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onActiveType = (i) => {
    setIndex(i);
  };
  const onDetail = (item) => {
    smartNavigation.navigateSmart('Nfts.Detail', { item });
  };
  const _renderFlatlistOrchai = ({
    item,
    index
  }: {
    item: SoulboundNftInfoResponse;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.ContainerBtnNft}
        onPress={() => {
          smartNavigation.navigateSmart('Nfts.Detail', {
            item: {
              name: item.extension.name,
              id: tokenIds[index],
              picture: item.extension.image
            }
          });
          return;
        }}
      >
        <View
          style={[styles.wrapViewNft, { backgroundColor: colors['box-nft'] }]}
        >
          <ProgressiveImage
            source={
              checkImageURL(item?.extension?.image)
                ? {
                    uri: item?.extension?.image
                  }
                : images.empty_img
            }
            style={styles.containerImgNft}
            resizeMode="cover"
            styleContainer={styles.containerImgNft}
          />
          <Text
            weight="700"
            variant="body2"
            numberOfLines={1}
            style={styles.titleNft}
          >
            {item?.extension?.name}
          </Text>
          <Text variant="body2" numberOfLines={2} style={styles.subTextNft}>
            {item?.extension?.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const _renderSectionHeader = ({ section }) => {
    {
      return (
        <View
          style={{
            paddingBottom: 10
          }}
        >
          {section.data?.length > 0 ? (
            <>
              <View
                style={{
                  marginTop: spacing['12'],
                  flexDirection: 'row'
                }}
              >
                <Text style={styles.sectionHeader}>{section.title}</Text>
                {/* <DownArrowIcon color={colors['text-title-login']} height={12} /> */}
              </View>

              <FlatList
                horizontal
                data={section.data}
                renderItem={
                  section.type == 'aiRight'
                    ? _renderFlatlistItem
                    : _renderFlatlistOrchai
                }
                keyExtractor={_keyExtract}
                showsHorizontalScrollIndicator={false}
              />
            </>
          ) : null}
        </View>
      );
    }
  };
  return (
    <View style={containerStyle}>
      <OWBox
        style={{
          paddingTop: 12
        }}
      >
        <View style={styles.wrapHeaderTitle}>
          {['Tokens', 'NFTs'].map((title: string, i: number) => (
            <View key={i}>
              <OWButton
                type="link"
                onPress={() => onActiveType(i)}
                label={title}
                textStyle={{
                  color:
                    index === i ? colors['primary-text'] : colors['gray-300'],
                  fontWeight: '700'
                }}
                style={{
                  width: '90%',
                  borderBottomColor:
                    index === i ? colors['primary-text'] : colors['primary'],
                  borderBottomWidth: 2
                }}
              />
            </View>
          ))}
        </View>
        {index === 0 ? (
          <CardBody>
            {tokens?.length > 0 ? (
              tokens.slice(0, 3).map((token) => {
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
              })
            ) : (
              <OWEmpty />
            )}
          </CardBody>
        ) : (
          <CardBody
            style={{
              padding: 0
            }}
          >
            {!nfts.length && !soulboundNft.length ? (
              <OWEmpty />
            ) : (
              <SectionList
                stickySectionHeadersEnabled={false}
                sections={[
                  {
                    title: 'NFTs',
                    data: nfts,
                    type: 'aiRight'
                  },
                  {
                    title: 'SoulBound NFTs',
                    data: soulboundNft,
                    type: 'orChai'
                  }
                ]}
                renderSectionHeader={_renderSectionHeader}
                renderItem={() => <View />}
              />
            )}
          </CardBody>
        )}

        <OWButton
          label={capitalizedText('view all')}
          size="medium"
          type="secondary"
          onPress={() => {
            if (index === 0) {
              smartNavigation.navigateSmart('Tokens', {});
            } else {
              smartNavigation.navigateSmart('Nfts', { nfts });
            }
          }}
        />
      </OWBox>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    titleNft: {
      paddingTop: 12
    },
    subTextNft: {
      textAlign: 'justify'
    },
    containerImgNft: {
      borderRadius: 6,
      width: 128,
      height: 128
    },
    itemImg: {
      width: 128,
      height: 128
    },
    wrapViewNft: {
      padding: 12,
      width: 150,
      height: 222,
      borderRadius: spacing['12']
    },
    ContainerBtnNft: {
      margin: 12,
      marginLeft: 0
    },
    wrapHeaderTitle: {
      flexDirection: 'row',
      marginHorizontal: spacing['page-pad']
    },
    textLoadMore: {
      ...typography['h7'],
      color: colors['colored-label']
    },
    containerBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors['primary-background'],
      width: metrics.screenWidth - 48,
      height: spacing['40'],
      paddingVertical: spacing['10'],
      borderRadius: spacing['12']
    },
    sectionHeader: {
      ...typography.h7,
      // color: colors['gray-800'],
      marginBottom: spacing['8'],
      marginRight: spacing['10']
    },
    flatListItem: {
      backgroundColor: colors['sub-nft'],
      borderRadius: spacing['12'],
      width: (metrics.screenWidth - 60) / 2,
      marginRight: spacing['12'],
      padding: spacing['12']
    },
    itemPhoto: {
      // width: (metrics.screenWidth - 84) / 2,
      height: (metrics.screenWidth - 84) / 2,
      borderRadius: 6,
      // marginHorizontal: 'auto',
      width: (metrics.screenWidth - 84) / 2
    },
    itemText: {
      ...typography.h7,
      // color: colors['gray-900'],
      fontWeight: '700'
    },
    transactionListEmpty: {
      justifyContent: 'center',
      alignItems: 'center'
    }
  });

import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { CardBody, OWBox } from '../../components/card';
import ProgressiveImage from '../../components/progessive-image';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { metrics, spacing, typography } from '../../themes';
import { capitalizedText, getOasisInfo, _keyExtract } from '../../utils/helper';
import { TokenItem } from '../tokens/components/token-item';
import { SoulboundNftInfoResponse } from './types';
import { useSoulbound } from '../nfts/hooks/useSoulboundNft';
import OWFlatList from '@src/components/page/ow-flat-list';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ChainIdEnum } from '@owallet/common';
import { RightArrowIcon } from '@src/components/icon';
import { VectorCharacter } from '@src/components/vector-character';
import FastImage from 'react-native-fast-image';
import Big from 'big.js';

const size = 44;
const imageScale = 0.54;

export const TokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  refreshDate: number;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore, accountStore, priceStore, keyRingStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const { colors } = useTheme();

  const styles = styling(colors);
  const smartNavigation = useSmartNavigation();
  const [index, setIndex] = useState<number>(0);
  const [oasisBalance, setOasisBalance] = useState<string>('0');
  const { tokenIds, soulboundNft, isLoading } = useSoulbound(
    chainStore.current.chainId,
    account,
    chainStore.current.rpc
  );

  const queries = queriesStore.get(chainStore.current.chainId);
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const queryBalances = queries.queryBalances.getQueryBech32Address(address);

  const getOasisBalance = async () => {
    try {
      const { amount } = await getOasisInfo(chainStore.current.chainId);
      setOasisBalance(amount);
    } catch (err) {
      console.log('err getOasisInfo', err);
    }
  };

  useEffect(() => {
    if (chainStore.current.chainId === ChainIdEnum.Oasis) {
      getOasisBalance();
    }
  }, [chainStore, account.bech32Address]);

  // TODO: Add sorting rule
  const tokens = queryBalances.positiveBalances.slice(0, 3);

  const onActiveType = i => {
    setIndex(i);
  };

  const renderOasisToken = () => {
    if (chainStore.current.chainId === ChainIdEnum.Oasis) {
      const item = chainStore.current.stakeCurrency;
      return (
        <TouchableOpacity
          style={styles.containerToken}
          onPress={() => {
            smartNavigation.navigateSmart('SendOasis', {
              currency: chainStore.current.stakeCurrency.coinMinimalDenom,
              maxAmount: oasisBalance
            });
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
                {chainStore.current.chainName}
              </Text>
              <Text
                style={{
                  ...typography.subtitle2,
                  color: colors['primary-text'],
                  fontWeight: '700'
                }}
              >
                {`${Number(Number(oasisBalance).toFixed(6))} ${item.coinDenom}`}
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
                  oasisBalance && priceStore?.getPrice(item.coinGeckoId)
                    ? (
                        parseFloat(new Big(parseInt(oasisBalance)).toString()) *
                        Number(priceStore?.getPrice(item.coinGeckoId))
                      ).toFixed(6)
                    : 0
                }` || '$--'}
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
    }
  };

  const renderTokens = () => {
    if (ChainIdEnum.Oasis === chainStore.current.chainId) {
      return renderOasisToken();
    } else {
      if (tokens?.length > 0) {
        return tokens.slice(0, 3).map((token, index) => {
          const priceBalance = priceStore.calculatePrice(token.balance);
          return (
            <TokenItem
              key={index?.toString()}
              chainInfo={{
                stakeCurrency: chainStore.current.stakeCurrency,
                networkType: chainStore.current.networkType,
                chainId: chainStore.current.chainId
              }}
              balance={token.balance}
              priceBalance={priceBalance}
            />
          );
        });
      } else {
        return <OWEmpty />;
      }
    }
  };

  const _renderFlatlistOrchai = ({ item, index }: { item: SoulboundNftInfoResponse; index: number }) => {
    return (
      <TouchableOpacity
        style={styles.ContainerBtnNft}
        onPress={() => {
          smartNavigation.navigateSmart('Nfts.Detail', {
            item: {
              name: item.extension.name,
              id: tokenIds[index],
              picture: item.token_uri
            }
          });
          return;
        }}
      >
        <View style={[styles.wrapViewNft, { backgroundColor: colors['box-nft'] }]}>
          <ProgressiveImage
            source={{
              uri: item.token_uri
            }}
            style={styles.containerImgNft}
            resizeMode="cover"
            styleContainer={styles.containerImgNft}
          />
          <Text weight="700" variant="body2" numberOfLines={1} style={styles.titleNft}>
            {item?.extension?.name}
          </Text>
          <Text variant="body2" numberOfLines={2} style={styles.subTextNft}>
            {item?.extension?.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
                  color: index === i ? colors['primary-text'] : colors['gray-300'],
                  fontWeight: '700'
                }}
                style={{
                  width: '90%',
                  borderBottomColor: index === i ? colors['primary-text'] : colors['primary'],
                  borderBottomWidth: 2
                }}
              />
            </View>
          ))}
        </View>
        {index === 0 ? (
          <CardBody>{renderTokens()}</CardBody>
        ) : (
          <CardBody
            style={{
              padding: 0
            }}
          >
            <View
              style={{
                paddingBottom: 10
              }}
            >
              <OWFlatList
                horizontal
                contentContainerStyle={
                  !soulboundNft?.length && {
                    flex: 1,
                    justifyContent: 'center'
                  }
                }
                containerSkeletonStyle={{
                  flexDirection: 'row'
                }}
                data={soulboundNft}
                renderItem={_renderFlatlistOrchai}
                keyExtractor={_keyExtract}
                SkeletonComponent={<SkeletonNft />}
                loading={isLoading}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </CardBody>
        )}
        {tokens.length > 0 ? (
          <OWButton
            label={capitalizedText('view all')}
            size="medium"
            type="secondary"
            onPress={() => {
              if (index === 0) {
                smartNavigation.navigateSmart('Tokens', {});
              } else {
                smartNavigation.navigateSmart('Nfts', null);
              }
            }}
          />
        ) : null}
      </OWBox>
    </View>
  );
});
export const SkeletonNft = () => {
  const { colors } = useTheme();
  return (
    <SkeletonPlaceholder
      highlightColor={colors['skeleton']}
      backgroundColor={colors['background-item-list']}
      borderRadius={12}
    >
      <SkeletonPlaceholder.Item
        width={150}
        padding={12}
        height={200}
        margin={12}
        marginLeft={0}
      ></SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
const styling = colors =>
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
    },
    containerToken: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing['4'],
      marginVertical: spacing['8'],
      paddingTop: spacing['10']
    }
  });

import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FlatList, TouchableOpacity, StyleSheet, View } from 'react-native';
import { metrics, spacing, typography } from '../../themes';
import { convertAmount, _keyExtract, checkImageURL } from '../../utils/helper';
import { PageWithViewInBottomTabView } from '../../components/page';
import { useSmartNavigation } from '../../navigation.provider';
import ProgressiveImage from '../../components/progessive-image';
import { useTheme } from '@src/themes/theme-provider';
import { Text } from '@src/components/text';
import { OWBox } from '@src/components/card';
import { OWSubTitleHeader } from '@src/components/header';
import { OWEmpty } from '@src/components/empty';
import { OWButton } from '@src/components/button';
import { SoulboundNftInfoResponse } from '../home/types';
import { useStore } from '@src/stores';
import { useSoulbound } from './hooks/useSoulboundNft';
import images from '@src/assets/images';

export const NftsScreen: FunctionComponent = observer((props) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [index, setIndex] = useState<number>(0);
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);
  const { tokenIds, soulboundNft } = useSoulbound(
    chainStore.current.chainId,
    account,
    chainStore.current.rpc
  );
  const { nfts } = props.route?.params;
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

  const _renderFlatlistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.flatListItem}
      onPress={() => {
        smartNavigation.navigateSmart('Nfts.Detail', { item });
      }}
    >
      <View>
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
      </View>
    </TouchableOpacity>
  );
  const onActiveType = (i) => {
    setIndex(i);
  };
  return (
    <PageWithViewInBottomTabView>
      <OWSubTitleHeader title="My NFTs" />
      <OWBox
        style={{
          flex: 1,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingTop: 0
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          {['NFTs', 'SoulBound NFTs'].map((title: string, i: number) => (
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
                  width: (metrics.screenWidth - 35) / 2,
                  alignSelf: 'center',
                  borderBottomColor:
                    index === i ? colors['primary-text'] : colors['primary'],
                  borderBottomWidth: 2
                }}
              />
            </View>
          ))}
        </View>

        <View
          style={{
            flex: 1,
            padding: 10
          }}
        >
          <FlatList
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            data={index == 0 ? nfts : soulboundNft}
            renderItem={
              index == 0 ? _renderFlatlistItem : _renderFlatlistOrchai
            }
            keyExtractor={_keyExtract}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<OWEmpty />}
          />
        </View>
      </OWBox>
    </PageWithViewInBottomTabView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors['primary'],
      borderRadius: spacing['24']
    },
    containerTab: {},
    title: {
      ...typography.h3,
      fontWeight: '700',
      textAlign: 'center',
      color: colors['primary-text'],
      marginTop: spacing['12'],
      marginBottom: spacing['12']
    },
    containerBtn: {
      backgroundColor: colors['purple-700'],
      borderRadius: spacing['8'],
      marginHorizontal: spacing['24'],
      paddingVertical: spacing['16'],
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing['12']
    },
    flatListItem: {
      backgroundColor: colors['sub-nft'],
      borderRadius: spacing['12'],
      paddingVertical: spacing['8']
    },
    itemPhoto: {
      width: (metrics.screenWidth - 120) / 2,
      height: (metrics.screenWidth - 120) / 2,
      borderRadius: spacing['6']
    },
    containerCollection: {
      marginHorizontal: spacing['24'],
      marginTop: spacing['32']
    },
    containerSectionTitle: {
      flexDirection: 'row',
      marginBottom: spacing['16']
    },
    transactionListEmpty: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 200
    },
    ContainerBtnNft: {
      margin: 12,
      marginLeft: 0
    },
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
    itemText: {
      ...typography.h7,
      // color: colors['gray-900'],
      fontWeight: '700'
    }
  });

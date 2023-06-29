import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  SectionList
} from 'react-native';
import { metrics, spacing, typography } from '../../themes';
import {
  convertAmount,
  formatContractAddress,
  _keyExtract
} from '../../utils/helper';
import { DownArrowIcon } from '../../components/icon';
import {
  PageWithViewInBottomTabView,
  PageWithView
} from '../../components/page';
import Accordion from 'react-native-collapsible/Accordion';
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
import * as cosmwasm from '@cosmjs/cosmwasm-stargate';
export const NftsScreen: FunctionComponent = observer((props) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [index, setIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState([0]);
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [soulboundNft, setSoulboundNft] = useState<SoulboundNftInfoResponse[]>(
    []
  );

  const { nfts } = props.route?.params;
  useEffect(() => {
    getAllToken();
  }, [chainStore.current.chainId]);

  const onDetail = (item) => {
    smartNavigation.navigateSmart('Nfts.Detail', { item });
  };
  const getAllToken = async () => {
    const owallet = await accountStore
      .getAccount(chainStore.current.chainId)
      .getOWallet();

    if (!owallet) {
      throw new Error("Can't get the owallet API");
    }
    const wallet = owallet.getOfflineSigner(chainStore.current.chainId);

    const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(
      chainStore.current.rpc,
      wallet
    );

    let tokensInfoPromise: Promise<any>[] = [];
    try {
      const { tokens } = await client.queryContractSmart(
        'orai1wa7ruhstx6x35td5kc60x69a49enw8f2rwlr8a7vn9kaw9tmgwqqt5llpe',
        {
          tokens: {
            limit: 10,
            owner: account.bech32Address.toString(),
            start_after: '0'
          }
        }
      );
      if (!tokens || !tokens?.length) {
        setSoulboundNft([]);
        throw new Error('NFT is empty');
      }

      for (let i = 0; i < tokens.length; i++) {
        const qsContract = client.queryContractSmart(
          'orai1wa7ruhstx6x35td5kc60x69a49enw8f2rwlr8a7vn9kaw9tmgwqqt5llpe',
          {
            nft_info: {
              token_id: tokens[i]
            }
          }
        );
        tokensInfoPromise.push(qsContract);
      }
      if (!tokensInfoPromise?.length) {
        setSoulboundNft([]);
        throw new Error('NFT is empty');
      }
      const tokensInfo: SoulboundNftInfoResponse[] = await Promise.all(
        tokensInfoPromise
      );
      if (!tokensInfo?.length) {
        setSoulboundNft([]);
        throw new Error('NFT is empty');
      }
      console.log('tokensInfo: ', tokensInfo);

      setSoulboundNft(tokensInfo);
    } catch (error) {
      console.log('error: ', error);
      setSoulboundNft([]);
    }
  };
  const _renderFlatlistOrchai = ({
    item
  }: {
    item: SoulboundNftInfoResponse;
  }) => {
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
              uri: item?.extension?.animation_url
            }}
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

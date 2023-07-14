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
  _keyExtract,
  checkImageURL
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
import images from '@src/assets/images';
import { useSoulbound } from './hooks/useSoulboundNft';
import OWFlatList from '@src/components/page/ow-flat-list';
import { SkeletonNft } from '../home/tokens-card';
export const NftsScreen: FunctionComponent = observer((props) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [index, setIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState([0]);
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);
  const { tokenIds, soulboundNft, isLoading } = useSoulbound(
    chainStore.current.chainId,
    account,
    chainStore.current.rpc
  );

  // const { nfts } = props.route?.params;
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
        onPress={() =>
          onDetail({
            name: item.extension.name,
            id: tokenIds[index],
            picture: item.extension.image
          })
        }
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

  return (
    <PageWithView>
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
            flex: 1,
            padding: 10
          }}
        >
          <OWFlatList
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            data={soulboundNft}
            renderItem={_renderFlatlistOrchai}
            loading={isLoading}
            SkeletonComponent={<SkeletonNft />}
            keyExtractor={_keyExtract}
            containerSkeletonStyle={{
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}
            skeletonStyle={{
              flexBasis: '50%'
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </OWBox>
    </PageWithView>
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

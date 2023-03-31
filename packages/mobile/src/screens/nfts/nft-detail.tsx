import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';

import { useSmartNavigation } from '../../navigation.provider';
import { DenomHelper, EthereumEndpoint } from '@owallet/common';
import { metrics, spacing, typography } from '../../themes';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { convertAmount, _keyExtract } from '../../utils/helper';
import { QuantityIcon } from '../../components/icon';
import LinearGradient from 'react-native-linear-gradient';
import { SendDashboardIcon } from '../../components/icon/button';
import {
  TransactionItem,
  TransactionSectionTitle
} from '../transactions/components';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { API } from '../../common/api';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSendTxConfig } from '@owallet/hooks';
import ProgressiveImage from '../../components/progessive-image';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { OWBox } from '@src/components/card';
import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import OWIcon from '@src/components/ow-icon/ow-icon';

const ORAI = 'oraichain-token';
const AIRI = 'airight';

const commonDenom = { ORAI, AIRI };

export const NftDetailScreen: FunctionComponent = observer((props) => {
  const smartNavigation = useSmartNavigation();
  const { chainStore, accountStore, queriesStore, modalStore } = useStore();
  const { colors } = useTheme();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();
  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const [loading, setLoading] = useState(false);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts['send'],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const { item } = props.route?.params;

  const _onPressTransfer = async () => {
    smartNavigation.navigateSmart('TransferNFT', {
      nft: {
        ...item,
        quantity: item?.version === 1 ? 1 : owner?.availableQuantity
      }
    });
  };

  const [prices, setPrices] = useState({});
  const [owner, setOwner] = useState<any>({});
  const styles = styling();
  useEffect(() => {
    (async function get() {
      try {
        const res = await API.get(
          `api/v3/simple/price?ids=${[ORAI, AIRI].join(',')}&vs_currencies=usd`,
          {
            baseURL: 'https://api.coingecko.com/'
          }
        );
        setPrices(res.data);
      } catch (error) {}
    })();
  }, []);

  useEffect(() => {
    (async function get() {
      try {
        setLoading(true);
        const res = await API.getNFTOwners(
          {
            token_id: item.id
          },
          {
            baseURL: 'https://api.airight.io/'
          }
        );

        const currentOwner = res.data.find(
          (d) => d.ownerAddress === account.bech32Address
        );
        setLoading(false);
        setOwner(currentOwner);
      } catch (error) {}
    })();
  }, []);

  return (
    <PageWithScrollViewInBottomTabView>
      <View style={styles.container}>
        <OWBox type="gradient">
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                ...typography.h5,
                color: colors['white'],
                fontWeight: '700'
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              style={{
                ...typography.h7,
                color: colors['purple-400'],
                fontWeight: '700'
              }}
            >
              {`#${item.id}`}
            </Text>
          </View>

          <View style={styles.containerImage}>
            <ProgressiveImage
              source={{
                uri: item.picture ?? item.url
              }}
              style={{
                width: metrics.screenWidth - 110,
                height: metrics.screenWidth - 110,
                borderRadius: spacing['6']
              }}
              resizeMode="contain"
            />
            <View
              style={{
                marginTop: spacing['12'],
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <View>
                <Text
                  style={{
                    ...typography.h6,
                    fontWeight: '700'
                  }}
                >
                  {item.version === 1
                    ? `${convertAmount(item.offer?.amount)} ${
                        item.offer?.denom ?? ''
                      }`
                    : `${convertAmount(item.offer?.lowestPrice)} ${
                        item.offer?.denom ?? ''
                      }`}
                </Text>

                <Text
                  style={{
                    ...typography.h7,
                    color: colors['gray-500'],
                    fontWeight: '700'
                  }}
                >{`$ ${
                  item.offer?.amount
                    ? item.offer.amount *
                      10 ** -6 *
                      prices[commonDenom[item.offer.denom]]?.usd
                    : 0
                }`}</Text>
              </View>

              <View style={styles.containerQuantity}>
                <View
                  style={{
                    marginTop: spacing['6']
                  }}
                >
                  <QuantityIcon size={24} color={colors['gray-150']} />
                </View>
                <Text
                  style={{
                    color: colors['gray-150']
                  }}
                >
                  {item.version === 1 ? 1 : owner?.availableQuantity}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.containerBtn}>
            {loading ? <ActivityIndicator /> : null}
            {item?.version === 1 && item?.offer != null
              ? ['Transfer'].map((e, i) => (
                  <OWButton
                    key={`transfer-1-${1}`}
                    label="Transfer"
                    size="small"
                    fullWidth={false}
                    icon={
                      <OWIcon color={colors['white']} size={20} name="send" />
                    }
                    onPress={_onPressTransfer}
                  />
                ))
              : null}
            {item?.version === 2 && owner?.availableQuantity > 0
              ? ['Transfer'].map((e, i) => (
                  <OWButton
                    key={`transfer-2-${i}`}
                    label="Transfer"
                    size="small"
                    fullWidth={false}
                    icon={
                      <OWIcon color={colors['white']} size={20} name="send" />
                    }
                    onPress={_onPressTransfer}
                  />
                ))
              : null}
          </View>
        </OWBox>
      </View>

      <View
        style={{
          backgroundColor: colors['background-box'],
          borderRadius: spacing['24'],
          paddingBottom: spacing['24'],
          height: metrics.screenHeight / 2
        }}
      >
        <TransactionSectionTitle title={'Transaction list'} />
        <FlatList
          data={[]}
          renderItem={({ item, index }) => (
            <TransactionItem
              containerStyle={{
                backgroundColor: colors['background-item-list']
              }} // customize item transaction
              type={'native'}
              item={item}
              key={index}
              address={''}
            />
          )}
          keyExtractor={_keyExtract}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View
              style={{
                height: 12
              }}
            />
          )}
          ListEmptyComponent={<OWEmpty />}
        />
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      marginHorizontal: spacing['24'],
      marginBottom: spacing['12']
    },
    containerImage: {
      marginTop: spacing['8'],
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors['background-box'],
      paddingHorizontal: 12,
      borderRadius: spacing['12'],
      padding: spacing['8'],
      marginBottom: spacing['24']
    },
    containerQuantity: {
      backgroundColor: colors['blue/Border-50'],
      borderRadius: spacing['6'],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50%',
      paddingHorizontal: 6
    },
    containerBtn: {
      display: 'flex',
      flexDirection: 'row',
      paddingTop: spacing['6'],
      paddingLeft: spacing[22],
      paddingRight: spacing['22'],
      justifyContent: 'center'
      // paddingBottom: spacing['24']
    },
    btn: {
      backgroundColor: colors['purple-700'],
      borderRadius: spacing['8'],
      marginLeft: 10,
      marginRight: 10
    },
    btnTransfer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing['6'],
      paddingBottom: spacing['6'],
      paddingLeft: spacing['12'],
      paddingRight: spacing['12']
    },
    transactionListEmpty: {
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
};

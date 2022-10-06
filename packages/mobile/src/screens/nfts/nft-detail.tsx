import React, {
  FunctionComponent,
  // ReactElement,
  useEffect,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import {
  StyleSheet,
  View,
  // ViewStyle,
  Image,
  ActivityIndicator
  // TouchableWithoutFeedback,
  // Keyboard
} from 'react-native';
import { Text } from '@rneui/base';
// import { CoinPretty } from '@owallet/unit';
import { useSmartNavigation } from '../../navigation.provider';
// import { Currency } from '@owallet/types';
// import { TokenSymbol } from '../../components/token-symbol';
import { DenomHelper, EthereumEndpoint } from '@owallet/common';
// import { Bech32Address } from '@owallet/cosmos';
import { colors, metrics, spacing, typography } from '../../themes';
// import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import {
  convertAmount,
  // formatContractAddress,
  _keyExtract
} from '../../utils/helper';
import {
  QuantityIcon
  // SendIcon,
  // TransactionMinusIcon
} from '../../components/icon';
import LinearGradient from 'react-native-linear-gradient';
import {
  // BuyIcon,
  // DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button';
import {
  TransactionItem,
  TransactionSectionTitle
} from '../transactions/components';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { API } from '../../common/api';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSendTxConfig } from '@owallet/hooks';
import ProgressiveImage from '../../components/progessive-image';

const ORAI = 'oraichain-token';
const AIRI = 'airight';

const commonDenom = { ORAI, AIRI };

export const NftDetailScreen: FunctionComponent = observer(props => {
  const smartNavigation = useSmartNavigation();
  const { chainStore, accountStore, queriesStore, modalStore } = useStore();
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
        quantity: item.version === 1 ? 1 : owner.availableQuantity
      }
    });
  };

  const [prices, setPrices] = useState({});
  const [owner, setOwner] = useState<any>({});

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
          d => d.ownerAddress === account.bech32Address
        );
        setLoading(false);
        setOwner(currentOwner);
      } catch (error) {}
    })();
  }, []);

  return (
    <PageWithScrollViewInBottomTabView>
      <View style={styles.container}>
        <LinearGradient
          colors={['#161532', '#5E499A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderTopLeftRadius: spacing['11'],
            borderTopRightRadius: spacing['11'],
            borderBottomLeftRadius: spacing['11'],
            borderBottomRightRadius: spacing['11']
          }}
        >
          <View
            style={{
              marginTop: spacing['24'],
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
                    color: colors['gray-900'],
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
            {item.version === 1 && item.offer != null
              ? ['Transfer'].map((e, i) => (
                  <TouchableOpacity
                    style={{
                      ...styles.btn
                    }}
                    onPress={() => _onPressTransfer()}
                  >
                    <View style={{ ...styles.btnTransfer }}>
                      <SendDashboardIcon />
                      <Text
                        style={{
                          ...typography['h7'],
                          lineHeight: spacing['20'],
                          color: colors['white'],
                          paddingLeft: spacing['6'],
                          fontWeight: '700'
                        }}
                      >
                        {`Transfer`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              : null}
            {item.version === 2 && owner.availableQuantity > 0
              ? ['Transfer'].map((e, i) => (
                  <TouchableOpacity
                    style={{
                      ...styles.btn
                    }}
                    onPress={() => _onPressTransfer()}
                  >
                    <View style={{ ...styles.btnTransfer }}>
                      <SendDashboardIcon />
                      <Text
                        style={{
                          ...typography['h7'],
                          lineHeight: spacing['20'],
                          color: colors['white'],
                          paddingLeft: spacing['6'],
                          fontWeight: '700'
                        }}
                      >
                        {`Transfer`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              : null}
          </View>
        </LinearGradient>
      </View>

      <View
        style={{
          backgroundColor: colors['white'],
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
          ListEmptyComponent={
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
          }
        />

        {/* <TouchableOpacity
          style={{
            backgroundColor: colors['purple-900'],
            borderRadius: spacing['8'],
            marginHorizontal: spacing['24'],
            paddingVertical: spacing['16'],
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing['12']
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <TransactionMinusIcon size={18} color={colors['white']} />
            <Text
              style={{
                ...typography.h6,
                color: colors['white'],
                fontWeight: '700',
                marginLeft: spacing['10']
              }}
            >
              View all transactions
            </Text>
          </View>
        </TouchableOpacity> */}
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: spacing['0.5'],
    borderColor: colors['gray-100'],
    borderRadius: spacing['12'],
    marginHorizontal: spacing['24'],
    marginVertical: spacing['12']
  },
  containerImage: {
    marginTop: spacing['8'],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors['white'],
    marginHorizontal: 22,
    borderRadius: spacing['12'],
    padding: spacing['8'],
    marginBottom: spacing['24']
  },
  containerQuantity: {
    backgroundColor: colors['red-50'],
    borderRadius: spacing['6'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%'
  },
  containerBtn: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: spacing['6'],
    paddingLeft: spacing[22],
    paddingRight: spacing['22'],
    justifyContent: 'center',
    paddingBottom: spacing['24']
  },
  btn: {
    backgroundColor: colors['purple-900'],
    borderWidth: 0.5,
    borderRadius: spacing['8'],
    borderColor: colors['transparent'],
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

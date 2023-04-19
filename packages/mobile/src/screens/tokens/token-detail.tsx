import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Animated, StyleSheet, View } from 'react-native';
import { useSmartNavigation } from '../../navigation.provider';
import { TokenSymbol } from '../../components/token-symbol';
import { metrics, spacing, typography } from '../../themes';
import { _keyExtract, delay } from '../../utils/helper';
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button';
import { PageWithView } from '../../components/page';
import { navigate } from '../../router/root';
import { API } from '../../common/api';
import { useLoadingScreen } from '../../providers/loading-screen';
import { AddressQRCodeModal } from '../home/components';
import { TokenSymbolEVM } from '../../components/token-symbol/token-symbol-evm';
import { useTheme } from '@src/themes/theme-provider';
import { OWBox } from '@src/components/card';
import { OWButton } from '@src/components/button';
import OWTransactionItem from '../transactions/components/items/transaction-item';
import OWFlatList from '@src/components/page/ow-flat-list';
import { Text } from '@src/components/text';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '@src/common/constants';
import { Skeleton } from '@rneui/themed';
import OWButtonIcon from '@src/components/button/ow-button-icon';

export const TokenDetailScreen: FunctionComponent = observer((props) => {
  const { chainStore, queriesStore, accountStore, modalStore } = useStore();
  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loadMore, setLoadMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const styles = styling(colors);

  const {
    amountBalance,
    balanceCoinDenom,
    priceBalance,
    balanceCoinFull,
    balanceCurrency
  } = props?.route?.params ?? {};
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? account.evmosHexAddress
        : account.bech32Address
    );

  const tokens = queryBalances.balances
    .concat(
      queryBalances.nonNativeBalances,
      queryBalances.positiveNativeUnstakables
    )
    .slice(0, 2);

  const page = useRef(1);
  const [data, setData] = useState([]);
  const hasMore = useRef(true);
  const perPage = 10;
  const fetchData = useCallback(
    async (url, params, isLoadMore = false) => {
      try {
        if (hasMore.current) {
          if (!isLoadMore) {
            setLoading(true);
          }
          const rs = await API.getTxs(
            url,
            `message.sender='${params?.address}' AND transfer.amount CONTAINS '${params?.denom}'`
          );

          const newData = isLoadMore ? [...data, ...rs?.txs] : rs?.txs;
          hasMore.current = rs?.txs?.length === perPage;
          page.current = page.current + 1;
          if (page.current === rs?.total_count / perPage) {
            hasMore.current = false;
          }
          if (rs?.txs.length < 1) {
            hasMore.current = false;
          }
          // console.log('newData: ', newData);
          setData(newData);
          setAllLoading();
        } else {
          setAllLoading();
        }
      } catch (error) {
        setAllLoading();
      }
    },
    [data]
  );
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
  };
  useEffect(() => {
    refreshData();
    return () => {
      setData([]);
    };
  }, [chainStore?.current?.rest, account?.bech32Address]);
  const _onPressReceiveModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current
      })
    );
  };

  const _onPressBtnMain = (name) => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      smartNavigation.navigateSmart('Send', {
        currency:
          balanceCoinFull ??
          balanceCoinDenom ??
          chainStore.current.stakeCurrency.coinMinimalDenom
      });
    }
  };

  const RenderBtnMain = ({ name }) => {
    let icon: ReactElement;
    switch (name) {
      case 'Buy':
        icon = <BuyIcon />;
        break;
      case 'Receive':
        icon = <DepositIcon />;
        break;
      case 'Send':
        icon = <SendDashboardIcon />;
        break;
    }
    return (
      <OWButton
        size="small"
        type="primary"
        onPress={() => _onPressBtnMain(name)}
        icon={icon}
        label={name}
        fullWidth={false}
      />
    );
  };
  const onEndReached = useCallback(() => {
    if (page.current !== 1) {
      setLoadMore(true);
      fetchData(
        chainStore?.current?.rpc,
        {
          address: account?.bech32Address,
          denom:
            balanceCurrency?.contractAddress ||
            balanceCurrency?.coinMinimalDenom
        },
        true
      );
    }
  }, [account?.bech32Address, data]);
  const onTransactionDetail = (item) => {
    console.log('item: ', item);
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.TransactionDetail,
      params: {
        txHash: item?.hash
      }
    });
    return;
  };
  const renderItem = ({ item, index }) => {
    return (
      <OWTransactionItem
        key={`item-${index}`}
        onPress={() => onTransactionDetail(item)}
        data={item}
      />
    );
  };
  const refreshData = useCallback(() => {
    page.current = 1;
    hasMore.current = true;
    fetchData(
      chainStore?.current?.rpc,
      {
        address: account?.bech32Address,
        denom:
          balanceCurrency?.contractAddress || balanceCurrency?.coinMinimalDenom
      },
      false
    );
  }, [chainStore?.current?.rest, account?.bech32Address]);
  const onRefresh = () => {
    setRefreshing(true);
    refreshData();
  };
  const onTransactions = () => {
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.Transactions
    });
    return;
  };

  return (
    <PageWithView>
      <View style={styles.containerBox}>
        <OWBox type="gradient">
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {chainStore.current.networkType === 'evm' ? (
              <TokenSymbolEVM
                size={44}
                chainInfo={{
                  stakeCurrency: chainStore.current.stakeCurrency
                }}
                currency={tokens?.[0]?.balance?.currency}
                imageScale={0.54}
              />
            ) : (
              <TokenSymbol
                size={44}
                chainInfo={{
                  stakeCurrency: chainStore.current.stakeCurrency
                }}
                currency={tokens?.[0]?.balance?.currency}
                imageScale={0.54}
              />
            )}

            <View
              style={{
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  ...typography.h3,
                  color: colors['white'],
                  marginTop: spacing['8'],
                  fontWeight: '800'
                }}
              >
                {`${amountBalance} ${balanceCoinDenom}`}
              </Text>
              <Text
                style={{
                  ...typography.h6,
                  color: colors['purple-400']
                }}
              >
                {`${priceBalance?.toString() ?? '$0'}`}
              </Text>
            </View>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              paddingTop: spacing['6'],
              justifyContent: 'space-around'
            }}
          >
            {['Buy', 'Receive', 'Send'].map((e, i) => (
              <RenderBtnMain key={i} name={e} />
            ))}
          </View>
        </OWBox>
      </View>
      <OWBox style={styles.containerListTransaction}>
        <View style={styles.containerTitleList}>
          <Text>Transaction List</Text>
          <OWButton
            type="link"
            size="medium"
            fullWidth={false}
            label="View all"
            onPress={onTransactions}
          />
        </View>

        <OWFlatList
          data={data}
          onEndReached={onEndReached}
          renderItem={renderItem}
          loadMore={loadMore}
          onRefresh={onRefresh}
          loading={loading}
          refreshing={refreshing}
        />
      </OWBox>
    </PageWithView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerListTransaction: {
      flex: 1,
      paddingTop: 10
    },
    containerTitleList: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 0,
      marginTop: 0
    },
    containerBox: {
      marginHorizontal: 24
    },
    containerToken: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing['4'],
      marginVertical: spacing['8'],
      paddingTop: spacing['18'],
      paddingBottom: spacing['18']
    },
    transactionListEmpty: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    fixedScroll: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0
    }
  });

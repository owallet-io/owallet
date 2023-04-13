import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageWithView } from '@src/components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { API } from '@src/common/api';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
import {
  _keyExtract,
  addTimeProperty,
  removeEmptyElements
} from '@src/utils/helper';
import crashlytics from '@react-native-firebase/crashlytics';
import { OWBox } from '@src/components/card';
import { spacing } from '@src/themes';
import { OWEmpty } from '@src/components/empty';
import { useLoadingScreen } from '@src/providers/loading-screen';
import OWTransactionItem from './components/items/transaction-item';
import OWIcon from '@src/components/ow-icon/ow-icon';
import TypeModal from './components/type-modal';
import TokenModal, { getCoinDenom } from './components/token-modal';
import images from '@src/assets/images';
import { SCREENS, defaultAll } from '@src/common/constants';
import { navigate } from '@src/router/root';
import { useNavigation } from '@react-navigation/native';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore, modalStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);
  const [dataType, setDataType] = useState([]);
  const loadingScreen = useLoadingScreen();
  const [loadMore, setLoadMore] = useState(false);
  const page = useRef(1);
  const navigation = useNavigation();
  const [activeType, setActiveType] = useState(defaultAll);
  const [activeCoin, setActiveCoin] = useState(defaultAll);
  const hasMore = useRef(true);
  const perPage = 10;
  const fetchData = useCallback(
    async (url, params, isLoadMore = false) => {
      try {
        crashlytics().log('transactions - history - fetchData');
        if (!isLoadMore) {
          getTypeAction(url, params);
        }
        if (hasMore.current) {
          const query = [
            `message.sender='${params?.address}'`,
            params?.action !== 'All'
              ? `message.action='${params?.action}'`
              : '',
            params?.token !== 'All'
              ? `transfer.amount CONTAINS '${params?.token?.toLowerCase()}'`
              : ''
          ];
          const events = removeEmptyElements(query);
          const rs = await requestData(isLoadMore, events, url);
          const newData = isLoadMore
            ? [...data, ...rs?.tx_responses]
            : rs?.tx_responses;
          hasMore.current = rs?.txs?.length === perPage;
          page.current = page.current + 1;
          if (page.current === rs?.pagination?.total / perPage) {
            hasMore.current = false;
          }
          if (rs?.txs.length < 1) {
            hasMore.current = false;
          }
          setData(newData);
          setLoadMore(false);
          loadingScreen.setIsLoading(false);
        } else {
          setLoadMore(false);
        }
      } catch (error) {
        crashlytics().recordError(error);
        setLoadMore(false);
        loadingScreen.setIsLoading(false);
      }
    },
    [data]
  );
  const getTypeAction = async (url, params) => {
    try {
      const types = await API.getTransactionsByLCD({
        lcdUrl: url,
        params: {
          events: [`message.sender='${params?.address}'`],
          ['pagination.count_total']: true,
          ['pagination.limit']: 100,
          ['pagination.offset']: 1,
          order_by: 'ORDER_BY_DESC'
        }
      });
      setDataType(types);
    } catch (error) {}
  };
  const requestData = async (isLoadMore, query, url) => {
    try {
      if (!isLoadMore) {
        await loadingScreen.openAsync();
        const data: any = await API.getTransactionsByLCD({
          lcdUrl: url,
          params: {
            events: query,
            ['pagination.count_total']: true,
            ['pagination.limit']: perPage,
            ['pagination.offset']: 1,
            order_by: 'ORDER_BY_DESC'
          }
        });
        return data;
      } else {
        return await API.getTransactionsByLCD({
          lcdUrl: url,
          params: {
            events: query,
            ['pagination.count_total']: true,
            ['pagination.limit']: perPage,
            ['pagination.offset']: page.current,
            order_by: 'ORDER_BY_DESC'
          }
        });
      }
    } catch (error) {
      loadingScreen.setIsLoading(false);
    }
  };
  const { colors } = useTheme();
  useEffect(() => {
    refreshData({ activeType: defaultAll, activeCoin: defaultAll });
    return () => {
      setData([]);
    };
  }, [chainStore?.current?.rest, account?.bech32Address]);
  const refreshData = useCallback(
    ({ activeType, activeCoin }) => {
      page.current = 1;
      hasMore.current = true;
      fetchData(
        chainStore?.current?.rest,
        {
          address: account?.bech32Address,
          action: activeType?.value,
          token: activeCoin?.value
            ? activeCoin?.value
            : getCoinDenom(activeCoin)
        },
        false
      );
    },
    [chainStore?.current?.rest, account?.bech32Address]
  );
  const styles = styling();
  const onActionType = useCallback(
    (item) => {
      setActiveType(item);
      modalStore.close();
      refreshData({
        activeType: item,
        activeCoin: activeCoin
      });
    },
    [activeCoin]
  );

  const onType = useCallback(() => {
    modalStore.setOpen();
    modalStore.setChildren(
      <TypeModal
        actionType={onActionType}
        active={activeType?.value}
        transactions={dataType?.tx_responses}
      />
    );
  }, [activeType, dataType]);
  const onEndReached = useCallback(() => {
    if (page.current !== 1) {
      setLoadMore(true);
      fetchData(
        chainStore?.current?.rest,
        {
          address: account?.bech32Address,
          action: activeType?.value,
          token: activeCoin?.value
            ? activeCoin?.value
            : getCoinDenom(activeCoin)
        },
        true
      );
    }
  }, [account?.bech32Address, data, activeCoin, activeType]);
  const onRefresh = () => {
    setActiveType(defaultAll);
    setActiveCoin(defaultAll);
    refreshData({ activeType: defaultAll, activeCoin: defaultAll });
  };
  const onTransactionDetail = (item) => {
    navigation.navigate(SCREENS.TransactionDetail, {
      txHash: item?.txhash ? item?.txhash : item?.hash
    });
    return;
  };
  const renderItem = ({ item, index }) => {
    return (
      <OWTransactionItem
        key={`item-${index}`}
        onPress={() => onTransactionDetail(item)}
        time={item?.timestamp}
        data={item}
      />
    );
  };

  const onActionCoin = useCallback(
    (item) => {
      setActiveCoin(item);
      modalStore.close();
      refreshData({
        activeType: activeType,
        activeCoin: item
      });
    },
    [activeType]
  );
  const onCoin = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      <TokenModal
        onActionCoin={onActionCoin}
        active={
          activeCoin?.value ? activeCoin?.value : getCoinDenom(activeCoin)
        }
      />
    );
  };
  return (
    <PageWithView>
      <OWBox style={styles.container}>
        <View style={styles.containerFilter}>
          <View style={styles.containerType}>
            <Text color="#8C93A7">Type</Text>
            <TouchableOpacity onPress={onType} style={styles.typeInput}>
              <Text variant="body2">{activeType?.label}</Text>
              <View>
                <OWIcon name="down" size={15} color={colors['primary-text']} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.containerCoin}>
            <Text color="#8C93A7">Coin</Text>
            <TouchableOpacity onPress={onCoin} style={styles.coinInput}>
              <Text variant="body2">
                {activeCoin?.label
                  ? activeCoin?.label
                  : getCoinDenom(activeCoin)}
              </Text>
              <View>
                <OWIcon name="down" size={15} color={colors['primary-text']} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          ListEmptyComponent={<OWEmpty />}
          data={data}
          keyExtractor={_keyExtract}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          onEndReached={onEndReached}
          ListFooterComponent={
            <View style={styles.footer}>
              {loadMore ? <ActivityIndicator /> : null}
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
        />
      </OWBox>
    </PageWithView>
  );
});

export default HistoryTransactionsScreen;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    footer: {
      height: 20
    },
    container: {
      flex: 1
    },
    containerFilter: {
      flexDirection: 'row',
      paddingBottom: spacing['page-pad']
    },
    containerCoin: {
      flex: 1,
      paddingLeft: 8
    },
    containerType: {
      flex: 1,
      paddingRight: 8
    },
    typeInput: {
      borderWidth: 0.5,
      borderColor: colors['border-input-login'],
      height: 39,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 4
    },
    coinInput: {
      borderWidth: 0.5,
      borderColor: colors['border-input-login'],
      height: 39,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 4
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing['page-pad'],
      height: 65,
      backgroundColor: colors['background-item-list'],
      marginVertical: 8,
      alignItems: 'center',
      borderRadius: 8
    }
  });
};

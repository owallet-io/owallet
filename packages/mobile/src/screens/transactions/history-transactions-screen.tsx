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
import ButtonFilter from './components/button-filter';
import OWFlatList from '@src/components/page/ow-flat-list';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore, modalStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [loading, setLoading] = useState(false);
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
            params?.action !== 'All' ? `message.action='${params?.action}'` : ''
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
          setLoading(false);
        } else {
          setLoadMore(false);
          setLoading(false);
        }
      } catch (error) {
        crashlytics().recordError(error);
        setLoadMore(false);
        setLoading(false);
      }
    },
    [data]
  );
  const getTypeAction = async (url, params) => {
    try {
      const types = await API.getTxs(
        url,
        [`message.sender='${params?.address}'`],
        100
      );
      setDataType(types);
    } catch (error) {}
  };
  const requestData = async (isLoadMore, query, url) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        const data: any = await API.getTxs(url, query, perPage, 1);
        return data;
      } else {
        return await API.getTxs(url, query, perPage, page?.current);
      }
    } catch (error) {
      setLoading(false);
    }
  };
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
        activeCoin?.value !== 'All'
          ? chainStore?.current?.rpc
          : chainStore?.current?.rest,
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
  // const onCoin = () => {
  //   modalStore.setOpen();
  //   modalStore.setChildren(
  //     <TokenModal
  //       onActionCoin={onActionCoin}
  //       active={
  //         activeCoin?.value ? activeCoin?.value : getCoinDenom(activeCoin)
  //       }
  //     />
  //   );
  // };
  return (
    <PageWithView>
      <OWBox style={styles.container}>
        <View style={styles.containerFilter}>
          <ButtonFilter
            label={'Type'}
            onPress={onType}
            value={activeType?.label}
          />
          {/* <ButtonFilter
            label={'Coin'}
            onPress={onCoin}
            value={
              activeCoin?.label ? activeCoin?.label : getCoinDenom(activeCoin)
            }
          /> */}
        </View>
        <OWFlatList
          data={data}
          onEndReached={onEndReached}
          renderItem={renderItem}
          loadMore={loadMore}
          loading={loading}
          onRefresh={onRefresh}
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
      paddingBottom: spacing['page-pad'],
      justifyContent: 'space-between'
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

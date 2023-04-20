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
  delay,
  limitString,
  removeEmptyElements
} from '@src/utils/helper';
import crashlytics from '@react-native-firebase/crashlytics';
import { OWBox } from '@src/components/card';
import { metrics, spacing } from '@src/themes';
import { OWEmpty } from '@src/components/empty';
import { useLoadingScreen } from '@src/providers/loading-screen';
import OWTransactionItem from './components/items/transaction-item';
import OWIcon from '@src/components/ow-icon/ow-icon';
import TypeModal from './components/type-modal';
import TokenModal, { getCoinDenom } from './components/token-modal';

import { SCREENS, defaultAll } from '@src/common/constants';
import { navigate } from '@src/router/root';
import { useNavigation } from '@react-navigation/native';
import ButtonFilter from './components/button-filter';
import OWFlatList from '@src/components/page/ow-flat-list';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { Animated } from 'react-native';
import { Skeleton } from '@rneui/themed';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore, modalStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingType, setLoadingType] = useState(false);
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
        if (!isLoadMore && !params?.isActiveType) {
          getTypeAction(url, params);
        } else if (!isLoadMore && params?.isActiveType) {
          setRefreshing(true);
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
          setAllLoading();
        } else {
          setAllLoading();
        }
      } catch (error) {
        crashlytics().recordError(error);
        setAllLoading();
      }
    },
    [data, dataType]
  );
  const getTypeAction = async (url, params) => {
    try {
      setLoadingType(true);
      const types = await API.getTxs(
        url,
        [`message.sender='${params?.address}'`],
        100
      );
      setLoadingType(false);
      setDataType(types);
    } catch (error) {
      setLoadingType(false);
    }
  };
  const requestData = async (isLoadMore, query, url) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        const data: any = await API.getTxs(url, query, perPage, 1);
        return data;
      } else {
        return await API.getTxs(url, query, perPage, (page?.current - 1) * 10);
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
    ({ activeType, activeCoin, isActiveType }) => {
      page.current = 1;
      hasMore.current = true;
      fetchData(
        activeCoin?.value !== 'All'
          ? chainStore?.current?.rpc
          : chainStore?.current?.rest,
        {
          address: account?.bech32Address,
          action: activeType?.value,
          isActiveType,
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
        activeCoin: activeCoin,
        isActiveType: true
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
    // setRefreshing(true);
    setActiveType(defaultAll);
    setActiveCoin(defaultAll);
    refreshData({
      activeType: defaultAll,
      activeCoin: defaultAll,
      isActiveType: true
    });
  };
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
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
          {loadingType ? (
            <SkeletonTypeBtn />
          ) : (
            dataType?.txs &&
            dataType?.txs?.length > 0 && (
              <ButtonFilter
                label={'Type'}
                onPress={onType}
                value={limitString(activeType?.label,15)}
              />
            )
          )}

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
          refreshing={refreshing}
        />
      </OWBox>
    </PageWithView>
  );
});

export default HistoryTransactionsScreen;

const SkeletonTypeBtn = () => {
  const { colors } = useTheme();
  return (
    <View>
      <Skeleton
        animation="pulse"
        width={60}
        height={15}
        style={{
          borderRadius: 12,
          backgroundColor: colors['background-item-list'],
          marginBottom: 5
        }}
        skeletonStyle={{
          backgroundColor: colors['skeleton']
        }}
      />
      <Skeleton
        animation="pulse"
        width={metrics.screenWidth / 2 - 30}
        height={40}
        style={{
          borderRadius: 12,
          backgroundColor: colors['background-item-list']
          // marginVertical: 8
        }}
        skeletonStyle={{
          backgroundColor: colors['skeleton']
        }}
      />
    </View>
  );
};
const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    fixedScroll: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0
    },
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

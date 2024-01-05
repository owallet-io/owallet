import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageWithView } from '@src/components/page';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
import { _keyExtract, limitString } from '@src/utils/helper';
import crashlytics from '@react-native-firebase/crashlytics';
import { OWBox } from '@src/components/card';
import { metrics, spacing } from '@src/themes';
import OWTransactionItem from './components/items/transaction-item';
import { SCREENS, defaultAll } from '@src/common/constants';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import OWFlatList from '@src/components/page/ow-flat-list';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ChainIdEnum } from '@owallet/common';
import TypeModal from './components/type-modal';
import ButtonFilter from './components/button-filter';
import { TendermintTxTracer } from '@owallet/cosmos';
import { OWButtonPage } from '@src/components/button';
import { Text } from '@src/components/text';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore, txsStore, modalStore, keyRingStore } = useStore();
  const { colors } = useTheme();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const addressDisplay = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const [data, setData] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingType, setLoadingType] = useState(false);
  const page = useRef(0);
  const [activePage, setActivePage] = useState(chainStore.current?.networkType === 'cosmos' ? 1 : 0);
  const navigation = useNavigation();
  const [activeType, setActiveType] = useState(defaultAll);

  const hasMore = useRef(true);
  const perPage = 10;
  const txs = txsStore(
    chainStore.current.chainId === ChainIdEnum.KawaiiEvm
      ? chainStore.getChain(ChainIdEnum.KawaiiCosmos)
      : chainStore.current
  );

  const fetchData = useCallback(
    async (params, isLoadMore = false) => {
      try {
        crashlytics().log('transactions - history - fetchData');
        if (!isLoadMore && !params?.isActiveType) {
          getTypeAction();
        } else if (!isLoadMore && params?.isActiveType) {
          setRefreshing(true);
        }

        if (hasMore.current) {
          const rs = await requestData(
            isLoadMore,
            {
              addressAccount: params?.address,
              action: params?.action
            },
            params?.activePage
          );

          const newData = isLoadMore ? [...data, ...rs.result] : rs?.result;
          // hasMore.current = rs.result?.length === perPage;
          page.current = rs?.current_page + 1;
          if (rs?.current_page === rs?.total_page) {
            hasMore.current = false;
          }
          if (rs.result?.length < 1) {
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
  const getTypeAction = async () => {
    try {
      if (chainStore?.current?.chainId === ChainIdEnum?.KawaiiEvm || chainStore?.current?.networkType === 'cosmos') {
        setLoadingType(true);
        const types = await txs.getAllMethodActionTxs(addressDisplay);
        setLoadingType(false);
        setDataType(types?.result);
      }
    } catch (error) {
      setLoadingType(false);
    }
  };
  const requestData = async (isLoadMore, params, activePage) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        if (activePage === 0) {
          return await txs.getTxs(perPage, 0, params);
        } else if (activePage === 1) {
          return await txs.getReceiveTxs(perPage, 0, params);
        }
      } else {
        if (activePage === 0) {
          return await txs.getTxs(perPage, page.current, params);
        } else if (activePage === 1) {
          return await txs.getReceiveTxs(perPage, page.current, params);
        }
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData({ activeType: defaultAll, activePage });
    return () => {
      setData([]);
    };
  }, [activePage]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const chainInfo = chainStore.getChain(chainStore.current.chainId);
    let msgTracer: TendermintTxTracer | undefined;
    if (isFocused && chainInfo?.networkType == 'cosmos') {
      msgTracer = new TendermintTxTracer(chainInfo?.rpc, '/websocket');
      msgTracer
        .subscribeMsgByAddress(addressDisplay)
        .then(tx => {
          onRefresh();
        })
        .catch(e => {
          console.log(`Failed to trace the tx ()`, e);
        });
    }
    return () => {
      if (msgTracer) {
        msgTracer.close();
      }
    };
  }, [chainStore, isFocused, data]);

  const refreshData = useCallback(
    ({ activeType, isActiveType, activePage }) => {
      page.current = 0;
      hasMore.current = true;
      fetchData(
        {
          address: addressDisplay,
          action: activeType?.value,
          isActiveType,
          activePage
        },
        false
      );
    },
    [chainStore.current.networkType, addressDisplay]
  );
  const styles = styling();
  const onActionType = useCallback(
    item => {
      setActiveType(item);
      modalStore.close();
      refreshData({
        activeType: item,
        isActiveType: true,
        activePage
      });
    },
    [activePage]
  );

  const onType = useCallback(() => {
    modalStore.setOptions();
    modalStore.setChildren(<TypeModal actionType={onActionType} active={activeType?.value} transactions={dataType} />);
  }, [activeType, dataType]);
  const onEndReached = useCallback(() => {
    if (page.current !== 0 && data.length > 0) {
      setLoadMore(true);
      fetchData(
        {
          address: addressDisplay,
          action: activeType?.value,
          activePage
        },
        false
      );
      return;
    }
  }, [data, activeType, activePage]);
  const onRefresh = useCallback(() => {
    // setRefreshing(true);
    setActiveType(defaultAll);
    refreshData({
      activeType: defaultAll,
      isActiveType: true,
      activePage
    });
  }, [activePage]);
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
  };
  const onTransactionDetail = (item?: ResTxsInfo) => {
    navigation.navigate(SCREENS.STACK.Others, {
      screen: SCREENS.TransactionDetail,
      params: {
        txHash: item?.txHash,
        item
      }
    });
    return;
  };
  const renderItem = ({ item, index }) => {
    return (
      <OWTransactionItem key={`item-${index + 1}-${index}`} onPress={() => onTransactionDetail(item)} item={item} />
    );
  };
  const handleCheckFilter = useMemo(() => {
    if (loadingType) {
      return <SkeletonTypeBtn />;
    } else if (dataType && dataType?.length > 0) {
      return <ButtonFilter label={'Type'} onPress={onType} value={limitString(activeType?.label, 15)} />;
    }
    return null;
  }, [activeType, dataType, loadingType]);

  return (
    <PageWithView>
      {chainStore?.current?.networkType === 'cosmos' || chainStore?.current?.chainId === ChainIdEnum?.KawaiiEvm ? (
        <View style={[styles.containerBtnPage, { backgroundColor: colors['background-box'], borderRadius: 16 }]}>
          {['Transfer', 'Receive'].map((title: string, i: number) => (
            <TouchableOpacity
              key={i}
              style={{
                width: (metrics.screenWidth - 60) / 2,
                alignItems: 'center',
                paddingVertical: spacing['12'],
                backgroundColor: activePage === i ? colors['primary-surface-default'] : colors['background-box'],
                borderRadius: spacing['12']
              }}
              onPress={() => {
                setActivePage(i);
                setActiveType(defaultAll);
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: activePage === i ? colors['white'] : colors['gray-300']
                }}
              >
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <OWBox
        style={[
          styles.container,
          (chainStore?.current?.networkType === 'cosmos' ||
            chainStore?.current?.chainId === ChainIdEnum?.KawaiiEvm) && {
            marginTop: 0
          }
        ]}
      >
        <View style={styles.containerFilter}>{handleCheckFilter}</View>
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
      <SkeletonPlaceholder
        highlightColor={colors['skeleton']}
        backgroundColor={colors['background-item-list']}
        borderRadius={12}
      >
        <SkeletonPlaceholder.Item width={60} height={15} marginBottom={5}></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
      <SkeletonPlaceholder
        highlightColor={colors['skeleton']}
        backgroundColor={colors['background-item-list']}
        borderRadius={12}
      >
        <SkeletonPlaceholder.Item width={metrics.screenWidth / 2 - 30} height={40}></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};
const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    containerBtnPage: {
      flexDirection: 'row',
      // justifyContent: 'space-around',
      marginVertical: 20,
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginHorizontal: 24
    },
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

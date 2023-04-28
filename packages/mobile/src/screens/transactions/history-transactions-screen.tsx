import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { PageWithView } from '@src/components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { API } from '@src/common/api';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
import { _keyExtract, limitString } from '@src/utils/helper';
import crashlytics from '@react-native-firebase/crashlytics';
import { OWBox } from '@src/components/card';
import { metrics, spacing } from '@src/themes';
import OWTransactionItem from './components/items/transaction-item';
import { SCREENS, defaultAll } from '@src/common/constants';
import { useNavigation } from '@react-navigation/native';
import OWFlatList from '@src/components/page/ow-flat-list';
import { Skeleton } from '@rneui/themed';
import { ChainIdEnum, NetworkEnum } from '@src/stores/txs/helpers/txs-enums';
import TypeModal from './components/type-modal';
import ButtonFilter from './components/button-filter';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore, txsStore, modalStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingType, setLoadingType] = useState(false);
  const page = useRef(0);
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
          const rs = await requestData(isLoadMore, {
            addressAccount: params?.address,
            action: params?.action
          });
          const newData = isLoadMore ? [...data, ...rs.result] : rs?.result;
          hasMore.current = rs.result?.length === perPage;
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
      if (
        chainStore?.current?.chainId === ChainIdEnum?.KawaiiEvm ||
        chainStore?.current?.networkType === 'cosmos'
      ) {
        setLoadingType(true);
        const types = await txs.getAllMethodActionTxs(account?.bech32Address);
        setLoadingType(false);
        setDataType(types?.result);
      }
    } catch (error) {
      setLoadingType(false);
    }
  };
  const requestData = async (isLoadMore, params) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        return await txs.getTxs(perPage, 0, params);
      } else {
        return await txs.getTxs(perPage, page.current, params);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData({ activeType: defaultAll });
    return () => {
      setData([]);
    };
  }, []);
  const refreshData = useCallback(
    ({ activeType, isActiveType }) => {
      page.current = 0;
      hasMore.current = true;
      fetchData(
        {
          address:
            chainStore.current.networkType === 'evm'
              ? account.evmosHexAddress
              : account.bech32Address,
          action: activeType?.value,
          isActiveType
        },
        false
      );
    },
    [
      chainStore.current.networkType,
      account?.bech32Address,
      account.evmosHexAddress
    ]
  );
  const styles = styling();
  const onActionType = useCallback((item) => {
    setActiveType(item);
    modalStore.close();
    refreshData({
      activeType: item,
      isActiveType: true
    });
  }, []);

  const onType = useCallback(() => {
    modalStore.setOpen();
    modalStore.setChildren(
      <TypeModal
        actionType={onActionType}
        active={activeType?.value}
        transactions={dataType}
      />
    );
  }, [activeType, dataType]);
  const onEndReached = useCallback(() => {
    if (page.current !== 0) {
      setLoadMore(true);
      fetchData(
        {
          address:
            chainStore.current.networkType === 'evm'
              ? account.evmosHexAddress
              : account.bech32Address,
          action: activeType?.value
        },
        true
      );
    }
  }, [data, activeType]);
  const onRefresh = () => {
    // setRefreshing(true);
    setActiveType(defaultAll);
    refreshData({
      activeType: defaultAll,
      isActiveType: true
    });
  };
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
      <OWTransactionItem
        key={`item-${index + 1}-${index}`}
        onPress={() => onTransactionDetail(item)}
        item={item}
      />
    );
  };
  const handleCheckFilter = useMemo(() => {
    if (loadingType) {
      return <SkeletonTypeBtn />;
    } else if (dataType && dataType?.length > 0) {
      return (
        <ButtonFilter
          label={'Type'}
          onPress={onType}
          value={limitString(activeType?.label, 15)}
        />
      );
    }
    return null;
  }, [activeType, dataType, loadingType]);
  return (
    <PageWithView>
      <OWBox style={styles.container}>
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

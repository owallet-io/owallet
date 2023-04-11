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
import { _keyExtract, addTimeProperty } from '@src/utils/helper';
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
import { defaultAll } from '@src/common/constants';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore, modalStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);

  const [dataType, setDataType] = useState([]);
  const loadingScreen = useLoadingScreen();
  const [loadMore, setLoadMore] = useState(false);
  const page = useRef(1);
  
  const [activeType, setActiveType] = useState(defaultAll);
  const [activeCoin, setActiveCoin] = useState(defaultAll);
  const hasMore = useRef(true);
  const perPage = 10;
  const fetchData = useCallback(
    async (rpc, params, isLoadMore = false) => {
      try {
        crashlytics().log('transactions - history - fetchData');
        if (hasMore.current) {
          const query = `message.sender='${params?.address}'${
            params?.action !== 'All'
              ? ` AND message.action='${params?.action}'`
              : ''
          }${
            params?.token !== 'All'
              ? ` AND transfer.amount CONTAINS '${params?.token?.toLowerCase()}'`
              : ''
          }`;
          const rs = await requestData(isLoadMore, query, rpc, params);
          const txsNew = await getBlockByHeight(rs?.txs, rpc);
          const newData = isLoadMore ? [...data, ...txsNew] : txsNew;
          hasMore.current = rs?.txs?.length === perPage;
          page.current = page.current + 1;
          if (page.current === rs?.total_count / perPage) {
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
  const requestData = async (isLoadMore, query, rpc, params) => {
    try {
      if (!isLoadMore) {
        await loadingScreen.openAsync();
        const data = await Promise.all([
          API.getTransactionsByAddress({
            rpcUrl: rpc,
            page: '1',
            per_page: `${perPage}`,
            query
          }),
          API.getTransactionsByAddress({
            rpcUrl: rpc,
            page: '1',
            per_page: '100',
            query: `message.sender='${params?.address}'`
          })
        ]);
        setDataType(data[1]);
        return data[0];
      } else {
        return await API.getTransactionsByAddress({
          rpcUrl: rpc,
          page: `${page.current}`,
          per_page: `${perPage}`,
          query
        });
      }
    } catch (error) {
      console.log('error: ', error);
      loadingScreen.setIsLoading(false);
    }
  };
  const getBlockByHeight = async (txs, rpc) => {
    try {
      let arrPromises = [];
      if (txs.length > 0) {
        for (let i = 0; i < txs.length; i++) {
          const height = txs[i]?.height;
          if (height) {
            arrPromises.push(
              API.getBlockResultByHeight({
                height,
                rpcUrl: rpc
              })
            );
          }
        }
        const rsBlock = await Promise.all(arrPromises);
        const newData = addTimeProperty(rsBlock, txs);
        return newData;
      }
      return [];
    } catch (error) {
      loadingScreen.setIsLoading(false);
      setLoadMore(false);
    }
  };
  const { colors } = useTheme();
  useEffect(() => {
    refreshData();
    return () => {
      setData([]);
    };
  }, [chainStore?.current?.rpc, account?.bech32Address]);
  const refreshData = useCallback(() => {
    page.current = 1;
    hasMore.current = true;
    fetchData(
      chainStore?.current?.rpc,
      {
        address: account?.bech32Address,
        action: activeType?.value,
        token: activeCoin?.value ? activeCoin?.value : getCoinDenom(activeCoin)
      },
      false
    );
  }, [
    chainStore?.current?.rpc,
    account?.bech32Address,
    activeType,
    activeCoin
  ]);
  const styles = styling();
  const onActionType = (item) => {
    setActiveType(item);
    modalStore.close();
  };
  useEffect(() => {
    refreshData();

    return () => {};
  }, [activeType, activeCoin]);

  const onType = useCallback(() => {
    modalStore.setOpen();
    modalStore.setChildren(
      <TypeModal
        actionType={onActionType}
        active={activeType?.value}
        transactions={dataType?.txs}
      />
    );
  }, [activeType, dataType]);
  const onEndReached = useCallback(() => {
    setLoadMore(true);
    fetchData(
      chainStore?.current?.rpc,
      {
        address: account?.bech32Address,
        action: activeType?.value,
        token: activeCoin?.value ? activeCoin?.value : getCoinDenom(activeCoin)
      },
      true
    );
  }, [account?.bech32Address, data]);
  const onRefresh = () => {
    setActiveType(defaultActiveType);
    refreshData();
  };
  const renderItem = ({ item, index }) => {
    return <OWTransactionItem time={item?.time} data={item} />;
  };
  const onActionCoin = (item) => {
    modalStore.close();
    setActiveCoin(item);
  };
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
      <OWBox
        style={{
          flex: 1
        }}
      >
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
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadMore ? (
              <View>
                <ActivityIndicator />
              </View>
            ) : null
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

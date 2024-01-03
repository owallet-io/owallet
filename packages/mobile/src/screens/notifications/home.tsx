import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { API } from '../../common/api';
import crashlytics from '@react-native-firebase/crashlytics';
import { useIsFocused } from '@react-navigation/core';
import { TendermintTxTracer } from '@owallet/cosmos';
import { NewsTab } from '../transactions/news';
import { TransactionItem, TransactionSectionTitle } from '../transactions/components';
import { Text } from '@src/components/text';
export const NotificationScreen: FunctionComponent = () => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [indexParent, setIndexParent] = useState<number>(0);
  const [indexChildren, setIndexChildren] = useState<number>(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const smartNavigation = useSmartNavigation();
  const page = useRef(1);
  const hasMore = useRef(true);
  const fetchData = async (isLoadMore = false) => {
    crashlytics().log('transactions - home - fetchData');
    // const isRecipient = indexChildren === 1;
    // const isAll = indexChildren === 0;
    try {
      const res = await API.getTransactions(
        {
          address: account.bech32Address,
          page: page.current,
          limit: 10,
          type: indexChildren === 0 ? 'native' : 'cw20'
        },
        // { baseURL: chainStore.current.rest }
        { baseURL: 'https://api.scan.orai.io' }
      );

      const value = res.data?.data || [];
      let newData = isLoadMore ? [...data, ...value] : value;
      hasMore.current = value?.length === 10;
      page.current = res.data?.page?.page_id + 1;
      if (page.current === res.data?.page.total_page) {
        hasMore.current = false;
      }
      setData(newData);
      setLoading(false);
      setLoadMore(false);
    } catch (error) {
      crashlytics().recordError(error);
      setLoading(false);
      setLoadMore(false);
      console.error(error);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    const chainInfo = chainStore.getChain(chainStore.current.chainId);
    let msgTracer: TendermintTxTracer | undefined;

    if (isFocused) {
      msgTracer = new TendermintTxTracer(chainInfo?.rpc ?? chainInfo?.rest, '/websocket');
      msgTracer
        .subscribeMsgByAddress(account.bech32Address)
        .then(tx => {
          page.current = 1;
          setTimeout(() => {
            fetchData();
          }, 1500);
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

  useEffect(() => {
    page.current = 1;
    fetchData();
  }, [indexChildren]);

  const _renderItem = useCallback(
    ({ item, index }) => {
      return (
        <TransactionItem
          loading={loading}
          type={indexChildren === 0 ? 'native' : 'cw20'}
          address={account.bech32Address}
          item={item}
          key={index}
          onPress={() =>
            smartNavigation.navigateSmart('Transactions.Detail', {
              item: {
                ...item,
                address: account.bech32Address
              },
              type: indexChildren === 0 ? 'native' : 'cw20'
            })
          }
          containerStyle={{
            backgroundColor: colors['gray-10']
          }} // customize item transaction
        />
      );
    },
    [indexChildren, loading]
  );

  const _handleRefresh = () => {
    page.current = 1;
    setLoading(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors['white'],
          borderRadius: spacing['12'],
          height: 56,
          marginVertical: spacing['12'],
          marginHorizontal: spacing['24'],
          paddingHorizontal: spacing['8']
        }}
      >
        {['Transactions', 'News'].map((title: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={{
              ...styles.tabSelected,
              width: (metrics.screenWidth - 60) / 2,
              alignItems: 'center',
              paddingVertical: spacing['12'],
              backgroundColor: indexParent === i ? colors['primary-surface-default'] : colors['transparent'],
              borderRadius: spacing['12']
            }}
            onPress={() => {
              setIndexParent(i);
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: indexParent === i ? colors['white'] : colors['gray-300']
              }}
            >
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {indexParent == 0 && (
        <View
          style={{
            backgroundColor: colors['white'],
            borderRadius: spacing['24']
          }}
        >
          <View
            style={{
              marginTop: spacing['12'],
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* {['Transactions', 'News'].map((title: string, i: number) => (
              <TouchableOpacity
                key={i}
                style={{
                  ...styles.tabSelected,
                  width: (metrics.screenWidth - 60) / 2,
                  alignItems: 'center',
                  paddingVertical: spacing['12']
                }}
                onPress={() => {
                  setData([]);
                  setLoading(true);
                  setIndexChildren(i);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color:
                      indexChildren === i
                        ? colors['gray-900']
                        : colors['gray-300']
                  }}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            ))} */}
          </View>
          <TransactionSectionTitle
            title={'Transfer list'}
            containerStyle={{
              paddingTop: spacing['4']
            }}
            onPress={() => {
              page.current = 1;
              setLoading(true);
              fetchData();
            }}
          />
          <View style={styles.transactionList}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={_keyExtract}
                data={data}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={_handleRefresh} />}
                renderItem={_renderItem}
                onEndReached={() => {
                  setLoadMore(true);
                  fetchData(true);
                }}
                ListFooterComponent={<View style={{ height: spacing['12'] }} />}
                ListEmptyComponent={
                  <View style={styles.transactionListEmpty}>
                    <Text
                      style={{
                        ...typography.subtitle1,
                        color: colors['gray-300'],
                        marginTop: spacing['8']
                      }}
                    >
                      {'Not found transaction'}
                    </Text>
                  </View>
                }
              />
            )}

            {loadMore ? (
              <View>
                <ActivityIndicator />
              </View>
            ) : null}
          </View>
        </View>
      )}
      {indexParent == 1 && <NewsTab />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors['gray-50'],
    marginBottom: spacing['20']
  },
  tabBarHeader: {
    backgroundColor: colors['white'],
    display: 'flex',
    flexDirection: 'row',
    width: metrics.screenWidth,
    justifyContent: 'space-around',
    height: spacing['44']
  },
  tabText: {
    ...typography.body2,
    fontWeight: 'normal'
  },
  tabSelected: {},
  transactionList: {
    height: metrics.screenHeight / 1.5
  },
  transactionListEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: metrics.screenHeight / 4
  }
});

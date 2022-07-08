import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { CText as Text } from '../../components/text';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TransactionSectionTitle, TransactionItem } from './components';
import { colors, metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { API } from '../../common/api';
import crashlytics from '@react-native-firebase/crashlytics';

export const Transactions: FunctionComponent = () => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [indexParent, setIndexParent] = useState<number>(0);
  const [indexChildren, setIndexChildren] = useState<number>(0);
  const [data, setData] = useState([]);
  const smartNavigation = useSmartNavigation();
  const offset = useRef(0);
  const hasMore = useRef(true);
  const fetchData = async (isLoadMore = false) => {
    crashlytics().log('transactions - home - fetchData');
    const isRecipient = indexChildren === 2;
    try {
      const res = await API.getHistory(
        {
          address: account.bech32Address,
          offset: 0,
          isRecipient
        },
        { baseURL: chainStore.current.rest }
      );

      const value = res.data?.tx_responses || [];
      const total = res?.data?.pagination?.total;
      let newData = isLoadMore ? [...data, ...value] : value;
      hasMore.current = value?.length === 10;
      offset.current = newData.length;
      if (total && offset.current === Number(total)) {
        hasMore.current = false;
      }
      setData(newData);
    } catch (error) {
      crashlytics().recordError(error);
      console.error(error);
    }
  };

  useEffect(() => {
    offset.current = 0;
    fetchData();
  }, [account.bech32Address, indexChildren]);

  const _renderItem = ({ item, index }) => {
    return (
      <TransactionItem
        address={account.bech32Address}
        item={item}
        key={index}
        onPress={() => smartNavigation.navigateSmart('Transactions.Detail', {})}
        containerStyle={{
          backgroundColor: colors['gray-10']
        }} // customize item transaction
      />
    );
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
              backgroundColor:
                indexParent === i
                  ? colors['purple-900']
                  : colors['transparent'],
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
          {['All', 'Transfer', 'Receive'].map((title: string, i: number) => (
            <TouchableOpacity
              key={i}
              style={{
                ...styles.tabSelected,
                width: (metrics.screenWidth - 60) / 3,
                alignItems: 'center',
                paddingVertical: spacing['12']
              }}
              onPress={() => {
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
          ))}
        </View>
        <TransactionSectionTitle
          title={'Transfer list'}
          containerStyle={{
            paddingTop: spacing['4']
          }}
        />
        <View style={styles.transactionList}>
          <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={_keyExtract}
            data={data}
            renderItem={_renderItem}
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
        </View>
      </View>
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

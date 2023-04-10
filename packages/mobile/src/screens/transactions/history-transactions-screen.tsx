import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageWithView } from '@src/components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { API, source } from '@src/common/api';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
import {
  _keyExtract,
  capitalizedText,
  convertAmount,
  formatAmount,
  formatContractAddress,
  get,
  getValueTransactionHistory,
  limitString
} from '@src/utils/helper';
import crashlytics from '@react-native-firebase/crashlytics';
import { OWSubTitleHeader } from '@src/components/header';
import { OWBox } from '@src/components/card';
import { spacing } from '@src/themes';
import { OWButton } from '@src/components/button';
import { TouchableOpacity as TouchGesture } from 'react-native-gesture-handler';
import Big from 'big.js';
import { OWEmpty } from '@src/components/empty';
import moment from 'moment';
import { useLoadingScreen } from '@src/providers/loading-screen';
import OWTransactionItem from './components/items/transaction-item';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);
  const loadingScreen = useLoadingScreen();
  const [loading, setLoading] = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const page = useRef(1);
  const hasMore = useRef(true);
  const perPage = 10;
  const fetchData = useCallback(
    async (rpc, address, isLoadMore = false) => {
      crashlytics().log('transactions - home - fetchData');

      try {
        if (hasMore.current) {
          if (loading) {
            await loadingScreen.openAsync();
          }
          const rs = await API.getTransactionsByAddress({
            rpcUrl: rpc,
            address,
            page: `${page.current}`,
            per_page: `${perPage}`
          });

          if (loading) {
            setData(rs?.txs);
          }
          const txsNew = await getBlockByHeight(rs?.txs, rpc);
          const newData = isLoadMore ? [...data, ...txsNew] : txsNew;
          loadingScreen.setIsLoading(false);
          setLoading(false);
          setData(newData);
          setLoadMore(false);
          hasMore.current = txsNew?.length === perPage;
          page.current += 1;

          if (page.current === rs?.total_count / perPage) {
            hasMore.current = false;
          }

          if (txsNew.length < 1) {
            hasMore.current = false;
          }
        } else {
          setLoading(false);
          setLoadMore(false);
        }
      } catch (error) {
        crashlytics().recordError(error);
        setLoadMore(false);
        setLoading(false);
        loadingScreen.setIsLoading(false);
      }
    },
    [data, loading]
  );
  const getBlockByHeight = async (txs, rpc) => {
    try {
      if (txs.length > 0) {
        for (let i = 0; i < txs.length; i++) {
          const height = txs[i]?.height;
          if (height) {
            const rsBlockResult = await API.getBlockResultByHeight({
              height,
              rpcUrl: rpc
            });
            txs[i].time = rsBlockResult?.block?.header?.time;
          }
        }
        return txs;
      }
      return [];
    } catch (error) {
      loadingScreen.setIsLoading(false);
    }
  };
  const { colors } = useTheme();
  useEffect(() => {
    page.current = 1;
    hasMore.current = true;
    setLoading(true);
    fetchData(chainStore?.current?.rpc, account?.bech32Address, true);
    return () => {
      setData([]);
    };
  }, [chainStore?.current?.rpc, account]);

  const styles = styling();
  return (
    <PageWithView>
      <OWSubTitleHeader title="Transactions" />
      <OWBox
        style={{
          flex: 1
        }}
      >
        <FlatList
          ListEmptyComponent={<OWEmpty />}
          data={data}
          keyExtractor={_keyExtract}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            return <OWTransactionItem time={item?.time} data={item} />;
          }}
          onEndReached={() => {
            setLoadMore(true);
            setLoading(false);
            fetchData(chainStore?.current?.rpc, account?.bech32Address, true);
          }}
        />
        {loadMore ? (
          <View>
            <ActivityIndicator />
          </View>
        ) : null}
      </OWBox>
    </PageWithView>
  );
});

export default HistoryTransactionsScreen;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
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

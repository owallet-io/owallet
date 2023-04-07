import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { PageWithView } from '@src/components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { API } from '@src/common/api';
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
import {
  TITLE_TYPE_ACTIONS_COSMOS_HISTORY,
  TYPE_ACTIONS_COSMOS_HISTORY
} from '@src/common/constants';
import { OWSubTitleHeader } from '@src/components/header';
import { OWBox } from '@src/components/card';
import { spacing } from '@src/themes';
import { OWButton } from '@src/components/button';
import { TouchableOpacity as TouchGesture } from 'react-native-gesture-handler';
import Big from 'big.js';

const HistoryTransactionsScreen = observer(() => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [data, setData] = useState([]);
  const fetchData = async (rpc, address) => {
    try {
      const rs = await API.getTransactionsByAddress({
        rpcUrl: rpc,
        address,
        page: '1',
        per_page: '50',
        order_by: 'asc'
      });
      setData(rs?.data?.result?.txs);
      //   console.log(rs?.data?.result?.txs, 'rssssss');
    } catch (error) {}
  };
  const { colors } = useTheme();
  useEffect(() => {
    fetchData(chainStore?.current?.rpc, account?.bech32Address);
    return () => {
      setData([]);
    };
  }, [chainStore?.current?.rpc, account]);

  const styles = styling();
  return (
    <PageWithView>
      <OWSubTitleHeader title="Transactions" />
      <OWBox>
        <FlatList
          data={data}
          keyExtractor={_keyExtract}
          renderItem={({ index, item }) => {
            console.log('item: ', item);
            const {
              eventType,
              status,
              countEvent,
              amount,
              denom,
              isRecipient
            } = getValueTransactionHistory({
              item,
              address: account?.bech32Address
            });

            return (
              <TouchableWithoutFeedback>
                <View style={styles.item}>
                  <View>
                    <Text>{formatContractAddress(item?.hash)}</Text>
                    <Text
                      variant="body1"
                      typo="bold"
                      color={colors['orange-800']}
                      style={{
                        paddingTop: 8,
                        textTransform: 'uppercase'
                      }}
                    >
                      {(amount && formatAmount(amount)) || '--'} {denom}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'flex-end'
                    }}
                  >
                    {!!eventType ? (
                      <OWButton
                        label={
                          isRecipient
                            ? TITLE_TYPE_ACTIONS_COSMOS_HISTORY['receive']
                            : limitString(eventType,15)
                        }
                        size="small"
                        disabled
                        style={{
                          backgroundColor: 'transparent',
                          height: 25
                        }}
                        textStyle={{
                          color: colors['purple-700']
                        }}
                        type="secondary"
                        fullWidth={false}
                      />
                    ) : (
                      <Text typo="bold" color={colors['purple-700']}>
                        --
                      </Text>
                    )}

                    <Text
                      style={{
                        paddingTop: 8
                      }}
                      color={colors['blue-600']}
                    >
                      Wed 28, 2022
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            );
          }}
        />
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

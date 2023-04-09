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
import { OWEmpty } from '@src/components/empty';
import moment from 'moment';

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
        per_page: '10'
      });
      let txs = rs?.txs;
      if (txs.length > 0) {
        for (let i = 0; i < txs.length; i++) {
          const height = txs[i]?.height;
          if (height) {
            const rsBlockResult = await API.getBlockResultByHeight({
              height,
              rpcUrl: rpc
            });
            txs[i].time = rsBlockResult?.block?.header?.time;
            // console.log(rsBlockResult, 'rsBlockResult');
          }
        }
      }
      setData(rs?.txs);
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
          ListEmptyComponent={<OWEmpty />}
          data={data}
          keyExtractor={_keyExtract}
          renderItem={({ index, item }) => {
            const {
              eventType,
              status,
              countEvent,
              amount,
              denom,
              isRecipient,
              isPlus,
              isMinus
            } = getValueTransactionHistory({
              item,
              address: account?.bech32Address
            });

            return (
              <TouchableOpacity>
                <View style={styles.item}>
                  <View>
                    <Text color="#8C93A7" size={12}>
                      {formatContractAddress(item?.hash, 5)}
                    </Text>
                    <Text
                      variant="body1"
                      typo="bold"
                      weight={'500'}
                      size={15}
                      color={
                        isPlus
                          ? colors['green-500']
                          : isMinus
                          ? colors['orange-800']
                          : colors['title-modal-login-failed']
                      }
                      style={{
                        paddingTop: 8,
                        textTransform: 'uppercase'
                      }}
                    >
                      {`${
                        amount && formatAmount(amount) && isPlus
                          ? '+'
                          : isMinus && amount && formatAmount(amount)
                          ? '-'
                          : ''
                      }${(amount && formatAmount(amount)) || '--'}`}{' '}
                      {denom}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'flex-end'
                    }}
                  >
                    {!!eventType ? (
                      <Text
                        variant="body2"
                        typo="regular"
                        color={colors['title-modal-login-failed']}
                      >
                        <Text color={colors['purple-700']}>
                          {countEvent > 0 ? `+${countEvent}` : null}
                        </Text>{' '}
                        {isRecipient
                          ? TITLE_TYPE_ACTIONS_COSMOS_HISTORY['receive']
                          : limitString(eventType, 20)}
                      </Text>
                    ) : (
                      <Text>--</Text>
                    )}

                    <Text
                      style={{
                        paddingTop: 8
                      }}
                      color={colors['blue-600']}
                    >
                      {item?.time && moment(item?.time).format('LL')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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

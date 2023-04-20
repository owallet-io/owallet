import { RefreshControl, StyleSheet, View } from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { PageWithScrollView } from '@src/components/page';

import TransactionBox from './components/transaction-box';
import ItemReceivedToken from './components/item-received-token';
import { useTheme } from '@src/themes/theme-provider';
import ItemDetail from './components/item-details';
import { API } from '@src/common/api';
import { useRoute } from '@react-navigation/native';
import {
  caculatorFee,
  capitalizedText,
  formatAmount,
  formatContractAddress,
  getDataFromDataEvent,
  getCurrencyByMinimalDenom,
  getValueFromDataEvents,
  getValueTransactionHistory,
  limitString,
  numberWithCommas
} from '@src/utils/helper';
import { useStore } from '@src/stores';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { DenomHelper } from '@owallet/common';
const TransactionDetailScreen = observer(() => {
  const params = useRoute().params;
  const txHash = params?.txHash;
  const { chainStore, queriesStore, accountStore } = useStore();
  const [data, setData] = useState();
  const [refreshing, setIsRefreshing] = useState(false);
  const { colors } = useTheme();
  useEffect(() => {
    getDetailByHash(txHash, chainStore?.current?.rest);
    return () => {};
  }, []);
  const refreshData = () => {
    setIsRefreshing(true);
    getDetailByHash(txHash, chainStore?.current?.rest);
  };
  const getDetailByHash = async (txHash, rest) => {
    try {
      const txs = await API.getTxsByLCD({
        method: `/txs/${txHash}`,
        url: rest
      });
      setIsRefreshing(false);
      setData(txs?.tx_response);
    } catch (error) {
      console.log('error: ', error);
      setIsRefreshing(false);
    }
  };

  const account = accountStore.getAccount(chainStore.current.chainId);

  const { status, countEvent, dataEvents } = getValueTransactionHistory({
    item: data,
    address: account?.bech32Address
  });
  const itemEvents = getValueFromDataEvents(dataEvents);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const gasPrice = data?.tx?.auth_info?.fee?.amount[0]?.amount;
  const denomFee = data?.tx?.auth_info?.fee?.amount[0]?.denom;
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? accountInfo.evmosHexAddress
        : accountInfo.bech32Address
    );

  const tokens = queryBalances.balances;
  return (
    <PageWithScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      refreshControl={
        <RefreshControl tintColor={colors['text-title-login']} onRefresh={refreshData} refreshing={refreshing} />
      }
    >
      <TransactionBox label={'Infomation'}>
        <ItemReceivedToken
          label="Transaction hash"
          valueProps={{
            color: colors['purple-700']
          }}
          valueDisplay={formatContractAddress(txHash)}
          value={txHash}
        />
        <ItemDetail
          label="Status"
          value={status ? capitalizedText(status) : '--'}
          iconComponent={
            <OWIcon
              size={12}
              color={
                status === 'success'
                  ? colors['green-500']
                  : colors['orange-800']
              }
              name={status === 'success' ? 'check_stroke' : 'close_shape'}
            />
          }
          valueProps={{
            color:
              status === 'success' ? colors['green-500'] : colors['orange-800']
          }}
        />
        <ItemDetail label="Block height" value={data?.height} />
        <ItemDetail label="Memo" value={data?.tx?.body?.memo} />
        <ItemDetail
          label="Gas (used/ wanted)"
          value={`${numberWithCommas(data?.gas_used)}/${numberWithCommas(
            data?.gas_wanted
          )}`}
        />
        <ItemDetail
          label="Fee"
          value={`${caculatorFee(gasPrice, data?.gas_used)} ${
            (denomFee && denomFee.toUpperCase()) || ''
          }`}
        />
        <ItemDetail
          label="Time"
          borderBottom={false}
          value={moment(data?.timestamp).format('MMMM D, YYYY (hh:mm:ss)')}
        />

        {/* <ItemDetail label="View on Scan" borderBottom={false} /> */}
      </TransactionBox>

      {itemEvents?.value?.map((itemEv, inEv) => (
        <TransactionBox
          key={`tsbox-${inEv}`}
          label={`Transaction detail ${
            itemEv?.eventType ? `(${itemEv?.eventType || ''})` : ''
          }`}
        >
          {itemEv?.dataTransfer?.map((itemDataTrans, inDtTransfer) => (
            <View key={`itemEv-${inDtTransfer}`}>
              {itemDataTrans?.sender && (
                <ItemReceivedToken
                  valueDisplay={formatContractAddress(
                    typeof itemDataTrans?.sender === 'string'
                      ? itemDataTrans?.sender
                      : itemDataTrans?.sender?.value
                  )}
                  value={
                    typeof itemDataTrans?.sender === 'string'
                      ? itemDataTrans?.sender
                      : itemDataTrans?.sender?.value
                  }
                  label="From"
                />
              )}
              {itemDataTrans?.recipient && (
                <ItemReceivedToken
                  valueDisplay={formatContractAddress(
                    typeof itemDataTrans?.recipient === 'string'
                      ? itemDataTrans?.recipient
                      : itemDataTrans?.recipient?.value
                  )}
                  value={
                    typeof itemDataTrans?.recipient === 'string'
                      ? itemDataTrans?.recipient
                      : itemDataTrans?.recipient?.value
                  }
                  label="To"
                />
              )}

              {itemDataTrans?.amountValue && (
                <ItemReceivedToken
                  label="Amount"
                  btnCopy={false}
                  borderBottom={
                    inEv == itemEvents?.value?.length - 1 &&
                    inDtTransfer == itemEv?.dataTransfer?.length - 1
                      ? false
                      : true
                  }
                  value={itemDataTrans?.amountValue}
                  valueProps={{
                    color: itemDataTrans?.isPlus
                      ? colors['green-500']
                      : itemDataTrans?.isMinus
                      ? colors['orange-800']
                      : colors['title-modal-login-failed']
                  }}
                  valueDisplay={`${
                    itemDataTrans?.isPlus
                      ? '+'
                      : itemDataTrans?.isMinus
                      ? '-'
                      : ''
                  }${
                    formatAmount(
                      itemDataTrans?.amountValue,
                      itemDataTrans?.denom,
                      tokens
                    ) || '--'
                  } ${
                    limitString(
                      getCurrencyByMinimalDenom(tokens, itemDataTrans?.denom)
                        ?.coinDenom || itemDataTrans?.denom,
                      25
                    ) || ''
                  }`}
                />
              )}
            </View>
          ))}
        </TransactionBox>
      ))}
    </PageWithScrollView>
  );
});

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20
  }
});

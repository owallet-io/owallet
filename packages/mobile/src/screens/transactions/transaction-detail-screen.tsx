import { StyleSheet, View } from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { PageWithScrollView } from '@src/components/page';

import TransactionBox from './components/transaction-box';
import ItemReceivedToken from './components/item-received-token';
import { useTheme } from '@src/themes/theme-provider';
import ItemDetail from './components/item-details';
import { API } from '@src/common/api';
import { useRoute } from '@react-navigation/native';
import {
  capitalizedText,
  formatAmount,
  formatContractAddress,
  getValueTransactionHistory,
  numberWithCommas
} from '@src/utils/helper';
import { useStore } from '@src/stores';
import moment from 'moment';
const TransactionDetailScreen = () => {
  const params = useRoute().params;
  const txHash = params?.txHash;
  const [data, setData] = useState();
  console.log('data: ', data);
  const { colors } = useTheme();
  useEffect(() => {
    getDetailByHash(txHash);
    return () => {};
  }, []);
  const getDetailByHash = async (txHash) => {
    try {
      const txs = await API.getTransactionsByLCD({ method: `/txs/${txHash}` });
      setData(txs?.tx_response);
    } catch (error) {
      console.log('error: ', error);
    }
  };
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const {
    eventType,
    status,
    countEvent,
    amount,
    denom,
    isRecipient,
    isPlus,
    isMinus,
    recipient,
    sender
  } = getValueTransactionHistory({
    item: data,
    address: account?.bech32Address
  });
  return (
    <PageWithScrollView style={styles.container}>
      <TransactionBox label={'Received token'}>
        <ItemReceivedToken
          valueDisplay={formatContractAddress(sender)}
          value={sender}
          label="From"
        />
        <ItemReceivedToken
          valueDisplay={formatContractAddress(recipient)}
          value={recipient}
          label="To"
        />
        <ItemReceivedToken
          label="Transaction hash"
          valueProps={{
            color: colors['purple-700']
          }}
          valueDisplay={formatContractAddress(txHash)}
          value={txHash}
        />
        <ItemReceivedToken
          label="Amount"
          borderBottom={false}
          btnCopy={false}
          value={amount}
          valueProps={{
            color: isPlus
              ? colors['green-500']
              : isMinus
              ? colors['orange-800']
              : colors['title-modal-login-failed']
          }}
          valueDisplay={`${
            amount && formatAmount(amount) && isPlus
              ? '+'
              : isMinus && amount && formatAmount(amount)
              ? '-'
              : ''
          }${(amount && formatAmount(amount)) || '--'} ${denom || ''}`}
        />
      </TransactionBox>
      <TransactionBox label={'Detail'}>
        <ItemDetail
          label="Result"
          value={capitalizedText(status)}
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
        <ItemDetail label="Fee" value="Test" />
        <ItemDetail
          label="Time"
          value={moment(data?.timestamp).format('MMMM D, YYYY (hh:mm:ss)')}
        />

        <ItemDetail label="View on Scan" borderBottom={false} />
      </TransactionBox>
    </PageWithScrollView>
  );
};

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20
  }
});

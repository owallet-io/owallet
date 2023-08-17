import { StyleSheet, Text, View } from 'react-native';
import React, { FunctionComponent, useCallback } from 'react';
import { TextInput } from '@src/components/input';
import { OWButton } from '@src/components/button';
import { PageWithScrollView } from '@src/components/page';
import { createTransaction } from '@owallet/bitcoin';
export const SendBtcScreen: FunctionComponent = ({ amount }) => {
    const onSend = useCallback(async () => {
      // await createTransaction({
      //   address: 'hieu',
      //   transactionFee: 1,
      //   amount: 12,
      //   confirmedBalance: 1000,
      //   utxos: [],
      //   blacklistedUtxos: [],
      //   changeAddress: 'toan',
      //   mnemonic: '',
      //   selectedCrypto: 'bitcoinTestnet',
      //   message: ''
      // });
    }, []);
  return (
    <PageWithScrollView>
      <TextInput label="Amount" placeholder="1000 BTC" />
      <TextInput label="Recipe" placeholder="1000 BTC" />
      <OWButton label="Send" onPress={onSend} />
    </PageWithScrollView>
  );
};

const styles = StyleSheet.create({});

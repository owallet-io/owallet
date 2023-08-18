import { StyleSheet, Text, View } from 'react-native';
import React, { FunctionComponent, useCallback } from 'react';
import {
  AddressInput,
  AmountInput,
  CurrencySelector,
  MemoInput,
  TextInput
} from '@src/components/input';
import { OWButton } from '@src/components/button';
import { PageWithScrollView } from '@src/components/page';
import { createTransaction } from '@owallet/bitcoin';
import { OWSubTitleHeader } from '@src/components/header';
import { OWBox } from '@src/components/card';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '@src/stores';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { spacing } from '@src/themes';
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
  const { chainStore, accountStore, queriesStore, analyticsStore, sendStore } =
    useStore();
  const chainId = chainStore?.current?.chainId;
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts['send'],
    account.bech32Address,
    queries.queryBalances,
    null,
    null,
    null,
    queries.bitcoin.queryBitcoinBalance
  );
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <PageWithScrollView backgroundColor={colors['background']}>
      <View style={{ marginBottom: 99 }}>
        <OWSubTitleHeader title="Send" />
        <OWBox>
          <CurrencySelector
            label="Select a token"
            placeHolder="Select Token"
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            containerStyle={styles.containerStyle}
            selectorContainerStyle={{
              backgroundColor: colors['background-box']
            }}
          />
          <AddressInput
            placeholder="Enter receiving address"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
          />
          <AmountInput
            placeholder="ex. 1000 BTC"
            label="Amount"
            allowMax={true}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
          />

          <MemoInput
            label="Memo (Optional)"
            placeholder="Type your memo here"
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <OWButton label="Send" />
        </OWBox>
      </View>
    </PageWithScrollView>
  );
};

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    sendInputRoot: {
      paddingHorizontal: spacing['20'],
      paddingVertical: spacing['24'],
      backgroundColor: colors['primary'],
      borderRadius: 24
    },
    sendlabelInput: {
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 22,
      color: colors['sub-primary-text'],
      marginBottom: spacing['8']
    },
    containerStyle: {
      backgroundColor: colors['background-box']
    }
  });

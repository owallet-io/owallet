import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { EthereumEndpoint } from '@owallet/common';
import { PageWithScrollView } from '../../components/page';
import { StyleSheet, View } from 'react-native';
import { Dec, DecUtils } from '@owallet/unit';
import { Wallet } from '@ethersproject/wallet';
import { Mnemonic, PrivKeySecp256k1 } from '@owallet/crypto';
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  TextInput
} from '../../components/input';
import { Button } from '../../components/button';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSmartNavigation } from '../../navigation.provider';
import { Buffer } from 'buffer';
import { colors, spacing } from '../../themes';
import { CText as Text } from '../../components/text';
import { Toggle } from '../../components/toggle';
import { PasswordInputModal } from '../../modals/password-input/modal';
import TronWeb from 'tronweb';
import {
  BIP44_PATH_PREFIX,
  getBase58Address,
  TRON_BIP39_PATH_INDEX_0,
  TRON_BIP39_PATH_PREFIX
} from '../../utils/helper';

const styles = StyleSheet.create({
  sendInputRoot: {
    paddingHorizontal: spacing['20'],
    paddingVertical: spacing['24'],
    backgroundColor: colors['white'],
    borderRadius: 24
  },
  sendlabelInput: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: colors['gray-900'],
    marginBottom: spacing['8']
  }
});

export const SendTronScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,

    keyRingStore
  } = useStore();

  const selected = keyRingStore?.multiKeyStoreInfo.find(
    keyStore => keyStore?.selected
  );

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reveiveAddress, setReceiveAddress] = useState('');
  const [customFee, setCustomFee] = useState(false);
  const [loading, setLoading] = useState(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const smartNavigation = useSmartNavigation();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  let tronWeb;
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts['send'],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(cur => {
        if (cur.type === 'cw20') {
          return cur.coinDenom == route.params.currency;
        }
        if (cur.coinDenom === route.params.currency) {
          return cur.coinDenom === route.params.currency;
        }
        return cur.coinMinimalDenom == route.params.currency;
      });

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route?.params?.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();
  // ?? sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView>
      <View style={{ marginBottom: 99 }}>
        <View style={{ alignItems: 'center', marginVertical: spacing['16'] }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 24,
              lineHeight: 34
            }}
          >
            Send
          </Text>
        </View>
        <View style={styles.sendInputRoot}>
          <CurrencySelector
            label="Select a token"
            placeHolder="Select Token"
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
          />
          <TextInput
            placeholder="Enter receiving address"
            label="Send to"
            labelStyle={styles.sendlabelInput}
            value={reveiveAddress}
            onChange={({ nativeEvent: { eventCount, target, text } }) =>
              setReceiveAddress(text)
            }
            autoCorrect={false}
            autoCapitalize="none"
            autoCompleteType="off"
          />
          <AmountInput
            placeholder="ex. 1000 ORAI"
            label="Amount"
            allowMax={chainStore.current.networkType !== 'evm' ? true : false}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
          />

          {chainStore.current.networkType !== 'evm' ? (
            <View
              style={{
                flexDirection: 'row',
                paddingBottom: 24,
                alignItems: 'center'
              }}
            >
              <Toggle
                on={customFee}
                onChange={value => {
                  setCustomFee(value);
                  if (!value) {
                    if (
                      sendConfigs.feeConfig.feeCurrency &&
                      !sendConfigs.feeConfig.fee
                    ) {
                      sendConfigs.feeConfig.setFeeType('average');
                    }
                  }
                }}
              />
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 16,
                  lineHeight: 34,
                  paddingHorizontal: 8
                }}
              >
                Custom Fee
              </Text>
            </View>
          ) : null}

          {customFee && chainStore.current.networkType !== 'evm' ? (
            <TextInput
              label="Fee"
              placeholder="Type your Fee here"
              keyboardType={'numeric'}
              labelStyle={styles.sendlabelInput}
              onChangeText={text => {
                const fee = new Dec(Number(text.replace(/,/g, '.'))).mul(
                  DecUtils.getTenExponentNInPrecisionRange(6)
                );

                sendConfigs.feeConfig.setManualFee({
                  amount: fee.roundUp().toString(),
                  denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom
                });
              }}
            />
          ) : chainStore.current.networkType !== 'evm' ? (
            <FeeButtons
              label="Transaction Fee"
              gasLabel="gas"
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              labelStyle={styles.sendlabelInput}
            />
          ) : null}

          <MemoInput
            label="Memo (Optional)"
            placeholder="Type your memo here"
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <Button
            text="Send"
            size="large"
            style={{
              backgroundColor: colors['purple-900'],
              borderRadius: 8
            }}
            onPress={async () => {
              setIsOpenModal(true);
            }}
          />
        </View>
        <PasswordInputModal
          isOpen={isOpenModal}
          paragraph={'Do not reveal your mnemonic to anyone'}
          close={() => setIsOpenModal(false)}
          title={'Confirm Password'}
          disabled={!account.isReadyToSendMsgs || loading}
          onEnterPassword={async password => {
            setLoading(true);
            const index = keyRingStore.multiKeyStoreInfo.findIndex(
              keyStore => keyStore.selected
            );

            let privateKey;

            if (index >= 0) {
              const privateData = await keyRingStore.showKeyRing(
                index,
                password
              );
              console.log('privateData', privateData);

              if (privateData.split(' ').length > 1) {
                privateKey = Mnemonic.generateWalletFromMnemonic(
                  privateData,
                  BIP44_PATH_PREFIX +
                    `/${
                      selected?.bip44HDPath?.coinType ??
                      chainStore?.current?.bip44?.coinType
                    }'/${selected?.bip44HDPath?.account}'/${
                      selected?.bip44HDPath?.change
                    }/${selected?.bip44HDPath?.addressIndex}`
                );
              } else {
                privateKey = privateData;
              }

              console.log('privateKey', privateKey);

              if (privateKey) {
                try {
                  tronWeb = new TronWeb({
                    fullHost: 'https://api.trongrid.io',
                    headers: {
                      'x-api-key': 'e2e3f401-2137-409c-b821-bd8c29f2141c'
                    },
                    privateKey: Buffer.from(privateKey).toString('hex')
                  });

                  const tradeobj = await tronWeb.transactionBuilder.sendTrx(
                    reveiveAddress,
                    new Dec(
                      Number(
                        (sendConfigs.amountConfig.amount ?? '0').replace(
                          /,/g,
                          '.'
                        )
                      )
                    ).mul(DecUtils.getTenExponentNInPrecisionRange(6)),
                    getBase58Address(account.evmosHexAddress)
                  );

                  const signedtxn = await tronWeb.trx.sign(
                    tradeobj,
                    Buffer.from(privateKey).toString('hex')
                  );
                  const receipt = await tronWeb.trx.sendRawTransaction(
                    signedtxn
                  );
                  smartNavigation.pushSmart('TxSuccessResult', {});
                  console.log('sent tron tradeobj', tradeobj.raw_data_hex);
                  console.log('sent tron receipt', receipt);
                  setLoading(false);
                } catch (err) {
                  console.log('send tron err', err);
                  setLoading(false);
                  smartNavigation.pushSmart('TxFailedResult', {
                    chainId: chainStore.current.chainId,
                    txHash: ''
                  });
                }
              }
            }
          }}
        />
      </View>
    </PageWithScrollView>
  );
});

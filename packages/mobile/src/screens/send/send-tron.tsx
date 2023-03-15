import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { EthereumEndpoint } from '@owallet/common';
import { PageWithScrollView } from '../../components/page';
import { StyleSheet, View } from 'react-native';
import { Dec, DecUtils } from '@owallet/unit';
import { Mnemonic } from '@owallet/crypto';
import {
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
  FAILED,
  SUCCESS
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

export const SendTronScreen: FunctionComponent = observer(props => {
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
  const [receiveAddress, setReceiveAddress] = useState('');
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
          item?: {
            amount: string;
            coinDecimals: number;
            coinDenom: string;
            coinGeckoId: string;
            coinImageUrl: string;
            contractAddress: string;
            tokenName: string;
            type?: string;
          };
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
      setReceiveAddress(route?.params?.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

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
          <TextInput
            label="Token"
            labelStyle={styles.sendlabelInput}
            value={route?.params?.item?.coinDenom ?? 'TRX'}
            editable={false}
          />
          <TextInput
            placeholder="Enter receiving address"
            label="Send to"
            labelStyle={styles.sendlabelInput}
            value={receiveAddress}
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
          paragraph={'Please confirm your password'}
          close={() => setIsOpenModal(false)}
          title={'Confirm Password'}
          disabled={loading}
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

              if (privateKey) {
                try {
                  tronWeb = new TronWeb({
                    fullHost: 'https://api.trongrid.io',
                    // fullHost: 'https://nile.trongrid.io', // TRON testnet
                    headers: {
                      'x-api-key': process.env.X_API_KEY
                    },
                    privateKey: Buffer.from(privateKey).toString('hex')
                  });

                  if (route?.params?.item?.type === 'trc20') {
                    // Send TRC20
                    // Get TRC20 contract
                    const { abi } = await tronWeb.trx.getContract(
                      route?.params?.item.contractAddress
                    );

                    const contract = tronWeb.contract(
                      abi.entrys,
                      route?.params?.item.contractAddress
                    );

                    const balance = await contract.methods
                      .balanceOf(getBase58Address(account.evmosHexAddress))
                      .call();

                    console.log('balance:', balance.toString());
                    if (balance > 0) {
                      const resp = await contract.methods
                        .transfer(
                          receiveAddress,
                          Number(
                            (sendConfigs.amountConfig.amount ?? '0').replace(
                              /,/g,
                              '.'
                            )
                          ) * Math.pow(10, 6)
                        )
                        .send({
                          feeLimit: 50_000_000, // Fee limit is required while send TRC20 in TRON network, 50_000_000 SUN is equal to 50 TRX maximun fee
                          callValue: 0
                        });

                      smartNavigation.pushSmart('TxPendingResult', {
                        txHash: resp,
                        chainId: chainStore.current.chainId,
                        tronWeb: tronWeb
                      });
                    } else {
                      setIsOpenModal(true);
                      alert('Not enough balance to send');
                    }
                  } else {
                    // Send TRX
                    const tradeobj = await tronWeb.transactionBuilder.sendTrx(
                      receiveAddress,
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
                    smartNavigation.pushSmart('TxSuccessResult', {
                      txHash: receipt.txid
                    });
                    console.log('sent tron tradeobj', tradeobj.raw_data_hex);
                    console.log('sent tron receipt', receipt);
                    setLoading(false);
                  }
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

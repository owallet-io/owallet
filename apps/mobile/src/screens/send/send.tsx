import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { EmptyAddressError, EmptyAmountError, useSendTxConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { EthereumEndpoint, OwalletEvent, toAmount, TxRestCosmosClient } from '@owallet/common';
import { StyleSheet, View, TouchableOpacity, ScrollView, InteractionManager } from 'react-native';
import { AddressInput, CurrencySelector, MemoInput } from '../../components/input';
import { OWButton } from '../../components/button';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { metrics, spacing } from '../../themes';
import OWText from '@src/components/text/ow-text';
import OWCard from '@src/components/card/ow-card';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { NewAmountInput } from '@src/components/input/amount-input';
import { PageWithBottom } from '@src/components/page/page-with-bottom';
import { fromBase64 } from '@cosmjs/encoding';
import { FeeModal } from '@src/modals/fee';
import { CoinPretty, Dec, Int } from '@owallet/unit';
import { DownArrowIcon } from '@src/components/icon';
import { capitalizedText, showToast } from '@src/utils/helper';
import { Buffer } from 'buffer';
import { tracking } from '@src/utils/tracking';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { coin, StdFee } from '@cosmjs/amino';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from '@owallet/proto-types/cosmos/bank/v1beta1/tx';
import { API } from '@src/common/api';
const { coins } = require('@cosmjs/amino');
import { encodePubkey, makeAuthInfoBytes, makeSignDoc, TxBodyEncodeObject } from '@cosmjs/proto-signing';
import { encodeSecp256k1Pubkey, makeSignDoc as makeSignDocAmino } from '@cosmjs/amino';
import { TxBody } from '@owallet/proto-types/cosmos/tx/v1beta1/tx';
import { Any } from '@owallet/proto-types/google/protobuf/any';
import { TendermintTxTracer } from '@owallet/cosmos';
import { navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
import { OWHeaderTitle } from '@components/header';
import { CosmosMsgOpts } from '@owallet/stores';

export const NewSendScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    keyRingStore,
    modalStore,
    priceStore,
    universalSwapStore,
    appInitStore
  } = useStore();

  const { colors } = useTheme();
  const styles = styling(colors);
  const [balance, setBalance] = useState<CoinPretty>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gasMsgSend, setGasMsgSend] = useState<CosmosMsgOpts['send']>();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
          contractAddress?: string;
          denom?: string;
        }
      >,
      string
    >
  >();

  const chainId = route?.params?.chainId ? route?.params?.chainId : chainStore?.current?.chainId;

  const chainInfo = chainStore.getChain(chainId);

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    //@ts-ignore
    gasMsgSend || account.msgOpts.send,
    address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    tracking(`Send ${chainStore.current.chainName} Screen`);
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(cur => {
        if (
          cur?.coinMinimalDenom
            ?.toLowerCase()
            ?.includes(route?.params?.contractAddress?.toLowerCase() || route?.params?.denom?.toLowerCase())
        )
          return true;
        if (cur.coinDenom?.toLowerCase() === route.params.currency?.toLowerCase()) {
          return true;
        }
        //@ts-ignore
        if (cur?.coinGeckoId?.toLowerCase()?.includes(route?.params?.coinGeckoId?.toLowerCase())) return true;
        return cur.coinMinimalDenom?.toLowerCase() == route.params.currency?.toLowerCase();
      });

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route?.params?.currency, sendConfigs.amountConfig, route?.params?.contractAddress]);

  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Dec(sendConfigs.amountConfig.getAmountPrimitive().amount)
  );

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType('average');
    }
    if (appInitStore.getInitApp.feeOption) {
      sendConfigs.feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
    }
  }, [sendConfigs.feeConfig, appInitStore.getInitApp.feeOption]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(<FeeModal vertical={true} sendConfigs={sendConfigs} colors={colors} />);
  };
  const recipientError = sendConfigs.recipientConfig.getError();
  const isRecipientError: boolean = useMemo(() => {
    if (recipientError) {
      if (recipientError.constructor == EmptyAddressError) return false;
      return true;
    }
  }, [recipientError]);

  const amountError = sendConfigs.amountConfig.getError();
  const isAmountError: boolean = useMemo(() => {
    if (amountError) {
      if (amountError.constructor == EmptyAmountError) return false;
      return true;
    }
  }, [amountError]);
  const sendOraiBtc = async () => {
    try {
      setIsLoading(true);
      // @ts-ignore
      const signer = await window.owallet.getOfflineSignerAuto(chainStore.current.chainId);
      const [{ address, pubkey }] = await signer.getAccounts();
      const res = await API.getInfoAccOraiBtc({ address: account.bech32Address }, { baseURL: chainStore.current.rest });
      const sequence = res.data.result.value.sequence;

      const msgSend = MsgSend.fromPartial({
        fromAddress: address,
        toAddress: sendConfigs.recipientConfig.recipient,
        amount: [sendConfigs.amountConfig.getAmountPrimitive()]
      });
      const msgAny = Any.fromPartial({
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: MsgSend.encode(msgSend).finish()
      });
      const fee: StdFee = {
        amount: coins(0, 'uoraibtc'),
        gas: '200000'
      };
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey: encodePubkey(encodeSecp256k1Pubkey(pubkey)), sequence }],
        fee.amount,
        Number(fee.gas),
        undefined,
        undefined
      );
      const txBody = TxBody.fromPartial({
        messages: [msgAny],
        memo: ''
      });

      const txBodyBytes = TxBody.encode(txBody).finish();
      const accountNumber = 0;
      const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);

      const { signature, signed } = await (await account.getOWallet()).signDirect(chainId, address, signDoc);

      const txRaw = TxRaw.fromPartial({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [fromBase64(signature.signature)]
      });
      const txBytes = TxRaw.encode(txRaw).finish();
      const tmClient = await Tendermint37Client.connect(chainStore.current.rpc);
      const result = await tmClient.broadcastTxSync({
        tx: txBytes
      });
      if (result?.code == 0) {
        setIsLoading(false);
        navigate(SCREENS.TxPendingResult, {
          txHash: Buffer.from(result?.hash).toString('hex'),
          data: {
            memo: sendConfigs.memoConfig.memo,
            from: address,
            type: 'send',
            to: sendConfigs.recipientConfig.recipient,
            amount: sendConfigs.amountConfig.getAmountPrimitive(),
            fee: sendConfigs.feeConfig.toStdFee(),
            currency: sendConfigs.amountConfig.sendCurrency
          }
        });
      }
    } catch (error) {
      if (error?.message?.includes("'signature' of undefined")) return;
      showToast({
        type: 'danger',
        message: error?.message || JSON.stringify(error)
      });
      console.log('[ERR]', error);
    } finally {
      setIsLoading(false);
    }
  };
  const submitSend = async () => {
    if (account.isReadyToSendMsgs && txStateIsValid) {
      try {
        if (chainStore?.current?.chainId === 'oraibtc-mainnet-1') {
          sendOraiBtc();
          return;
        }
        await account.sendToken(
          sendConfigs.amountConfig.amount,
          sendConfigs.amountConfig.sendCurrency,
          sendConfigs.recipientConfig.recipient,
          sendConfigs.memoConfig.memo,
          sendConfigs.feeConfig.toStdFee(),
          {
            preferNoSetFee: true,
            preferNoSetMemo: true,
            networkType: chainStore.current.networkType,
            chainId: chainStore.current.chainId
          },

          {
            onFulfill: tx => {},
            onBroadcasted: async txHash => {
              analyticsStore.logEvent('Send token tx broadcasted', {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                feeType: sendConfigs.feeConfig.feeType
              });
              tracking(`Send ${sendConfigs.amountConfig.sendCurrency} - ${chainStore.current.chainName}`);
              universalSwapStore.updateTokenReload([
                {
                  ...sendConfigs.amountConfig.sendCurrency,
                  chainId: chainStore.current.chainId,
                  networkType: 'cosmos'
                }
              ]);
              if (chainInfo.raw?.txExplorer?.txUrl === '') {
                account.setIsSendingMsgs(false);
              }
              navigate(SCREENS.TxPendingResult, {
                txHash: Buffer.from(txHash).toString('hex'),
                data: {
                  memo: sendConfigs.memoConfig.memo,
                  from: address,
                  type: 'send',
                  to: sendConfigs.recipientConfig.recipient,
                  amount: sendConfigs.amountConfig.getAmountPrimitive(),
                  fee: sendConfigs.feeConfig.toStdFee(),
                  currency: sendConfigs.amountConfig.sendCurrency
                }
              });
            }
          }
        );
      } catch (e) {
        if (e?.message === 'Request rejected') {
          return;
        }
      }
    }
  };
  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType('average');
    }
    return;
  }, [sendConfigs.feeConfig]);

  const isReadyBalance = queries.queryBalances
    .getQueryBech32Address(address)
    .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency).isReady;
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (isReadyBalance && sendConfigs.amountConfig.sendCurrency && address) {
        const balance = queries.queryBalances
          .getQueryBech32Address(address)
          .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency);
        setBalance(balance);
      }
    });
  }, [isReadyBalance, address, sendConfigs.amountConfig.sendCurrency]);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <OWHeaderTitle title={'Send'} subTitle={chainStore.current?.chainName} />
    });
  }, [chainStore.current?.chainName]);
  const estimatePrice = priceStore.calculatePrice(amount)?.toString();
  const simulateTx = async () => {
    try {
      const simulateTx = await account.cosmos.simulateTx(
        [
          {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: MsgSend.encode({
              fromAddress: account.bech32Address,
              toAddress: sendConfigs.recipientConfig.recipient,
              amount: [sendConfigs.amountConfig.getAmountPrimitive()]
            }).finish()
          }
        ],
        {
          amount: sendConfigs.feeConfig.toStdFee()?.amount ?? []
        },
        sendConfigs.memoConfig.memo
      );
      console.log(simulateTx, 'simulateTx');
      if (!simulateTx?.gasUsed) {
        setGasMsgSend(null);
        return;
      }
      setGasMsgSend({
        native: {
          type: 'cosmos-sdk/MsgSend',
          gas: Math.floor(simulateTx?.gasUsed * 1.3)
        }
      });
    } catch (error) {
      setGasMsgSend(null);
      console.error('SimulateTx Estimate Error', error);
    }
  };
  useEffect(() => {
    if (!txStateIsValid) return;
    simulateTx();
    return () => {};
  }, [sendConfigs.amountConfig.amount, sendConfigs.recipientConfig.recipient, txStateIsValid]);
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid || isLoading}
          loading={account.isSendingMsg === 'send' || isLoading}
          onPress={submitSend}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32
            }
          ]}
          textStyle={styles.txtBtnSend}
        />
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
          <OWCard
            type="normal"
            style={[
              isRecipientError ? styles.errorBorder : null,
              {
                backgroundColor: colors['neutral-surface-card']
              }
            ]}
          >
            <OWText color={colors['neutral-text-title']}>Recipient</OWText>

            <AddressInput
              colors={colors}
              placeholder="Enter address"
              label=""
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
              containerStyle={{
                marginBottom: 12
              }}
              inputContainerStyle={styles.inputContainerAddress}
            />
          </OWCard>
          <OWCard
            style={[
              {
                paddingTop: 22,
                backgroundColor: colors['neutral-surface-card']
              },
              isAmountError && styles.errorBorder
            ]}
            type="normal"
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <View>
                <OWText style={{ paddingTop: 8 }}>
                  Balance: {balance?.trim(true)?.maxDecimals(6)?.hideDenom(true)?.toString() || '0'}
                </OWText>
                <CurrencySelector
                  chainId={chainStore.current.chainId}
                  type="new"
                  label="Select a token"
                  placeHolder="Select Token"
                  amountConfig={sendConfigs.amountConfig}
                  labelStyle={styles.sendlabelInput}
                  containerStyle={styles.containerStyle}
                  selectorContainerStyle={{
                    backgroundColor: colors['neutral-surface-card']
                  }}
                />
              </View>
              <View
                style={{
                  alignItems: 'flex-end',
                  flex: 1
                }}
              >
                <NewAmountInput
                  colors={colors}
                  inputContainerStyle={{
                    borderWidth: 0,
                    width: metrics.screenWidth / 2.3
                  }}
                  amountConfig={sendConfigs.amountConfig}
                  placeholder={'0.0'}
                />
              </View>
            </View>
            <View style={styles.containerEstimatePrice}>
              <OWIcon name="tdesign_swap" size={16} />
              <OWText style={{ paddingLeft: 4 }} color={colors['neutral-text-body']}>
                {estimatePrice}
              </OWText>
            </View>
          </OWCard>
          <OWCard
            style={{
              backgroundColor: colors['neutral-surface-card']
            }}
            type="normal"
          >
            <View style={styles.containerFee}>
              <OWText color={colors['neutral-text-title']} weight="600" size={16}>
                Transaction fee
              </OWText>
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={_onPressFee}>
                <OWText color={colors['primary-text-action']} weight="600" size={16}>
                  {capitalizedText(sendConfigs.feeConfig.feeType)}:{' '}
                  {priceStore.calculatePrice(sendConfigs.feeConfig.fee)?.toString()}{' '}
                </OWText>
                <DownArrowIcon height={11} color={colors['primary-text-action']} />
              </TouchableOpacity>
            </View>

            <OWText color={colors['neutral-text-title']}>Memo</OWText>

            <MemoInput
              label=""
              placeholder="Required if send to CEX"
              inputContainerStyle={styles.inputContainerMemo}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
            />
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});
const styling = colors =>
  StyleSheet.create({
    txtBtnSend: {
      fontSize: 16,
      fontWeight: '600',
      color: colors['neutral-text-action-on-dark-bg']
    },
    inputContainerAddress: {
      backgroundColor: colors['neutral-surface-card'],
      borderWidth: 0,
      paddingHorizontal: 0
    },
    containerEstimatePrice: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center'
    },
    containerFee: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: colors['neutral-border-default'],
      borderBottomWidth: 1,
      paddingVertical: 16,
      marginBottom: 8
    },
    sendInputRoot: {
      paddingHorizontal: spacing['20'],
      paddingVertical: spacing['24'],
      backgroundColor: colors['primary'],
      borderRadius: 24
    },
    sendlabelInput: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: colors['neutral-text-body']
    },
    inputContainerMemo: {
      backgroundColor: colors['neutral-surface-card'],
      borderWidth: 0,
      paddingHorizontal: 0
    },
    containerStyle: {
      backgroundColor: colors['neutral-surface-bg2']
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999
    },
    errorBorder: {
      borderWidth: 2,
      borderColor: colors['error-border-default']
    }
  });

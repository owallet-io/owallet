import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGasSimulator, useSendMixedIBCTransferConfig, useTxConfigsValidate } from '@owallet/hooks';
import { useStore } from '../../stores';
import { ChainIdEnum, DenomHelper, EthereumEndpoint, ICNSInfo } from '@owallet/common';
import { InteractionManager, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CoinPretty, Dec, DecUtils } from '@owallet/unit';
import { AddressInput, CurrencySelector } from '../../components/input';
import { OWButton } from '../../components/button';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { metrics, spacing } from '../../themes';
import OWCard from '@src/components/card/ow-card';
import OWText from '@src/components/text/ow-text';
import { NewAmountInput } from '@src/components/input/amount-input';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { DownArrowIcon } from '@src/components/icon';
import { PageWithBottom } from '@src/components/page/page-with-bottom';
import { FeeModal } from '@src/modals/fee';
import { capitalizedText } from '@src/utils/helper';
import { goBack, navigate } from '@src/router/root';
import { useFocusAfterRouting } from '@src/hooks/use-focus';
import { AsyncKVStore } from '@src/common';
import { RNMessageRequesterInternal } from '@src/router';
import { BACKGROUND_PORT, Message } from '@owallet/router';
import { LogAnalyticsEventMsg, SendTxAndRecordMsg } from '@owallet/background';
import { ChainIdHelper } from '@owallet/cosmos';
import { amountToAmbiguousAverage } from '@src/utils/helper/amount-to-ambiguous-string';
import { FeeControl } from '@src/components/input/fee-control';

enum EthTxStatus {
  Success = '0x1',
  Failure = '0x0'
}

export const SendEvmNewScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, ethereumAccountStore, queriesStore, priceStore } = useStore();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
          contractAddress?: string;
        }
      >,
      string
    >
  >();
  const { colors } = useTheme();
  const styles = styling(colors);
  const addressRef = useFocusAfterRouting();

  const initialChainId = route.params['chainId'];
  const initialCoinMinimalDenom = route.params['coinMinimalDenom'];
  const initialRecipientAddress = route.params['recipientAddress'];

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);
  const isEvmChain = chainStore.isEvmChain(chainId);
  const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainId);
  const coinMinimalDenom = initialCoinMinimalDenom || chainInfo.currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
  const isErc20 = new DenomHelper(currency.coinMinimalDenom).type === 'erc20';

  const [isIBCTransfer, setIsIBCTransfer] = useState(false);
  const [isIBCTransferDestinationModalOpen, setIsIBCTransferDestinationModalOpen] = useState(false);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      goBack();
    }
  }, [goBack, initialChainId, initialCoinMinimalDenom]);

  const [isEvmTx, setIsEvmTx] = useState(isErc20);

  const account = accountStore.getAccount(chainId);
  const ethereumAccount = ethereumAccountStore.getAccount(chainId);

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = isEvmTx ? account.ethereumHexAddress : account.bech32Address;
  const balance = isEvmTx
    ? queryBalances.getQueryEthereumHexAddress(sender).getBalance(currency)
    : queryBalances.getQueryBech32Address(sender).getBalance(currency);

  const sendConfigs = useSendMixedIBCTransferConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    // TODO: 이 값을 config 밑으로 빼자
    isEvmTx ? 21000 : 300000,
    isIBCTransfer,
    {
      allowHexAddressToBech32Address:
        !isEvmChain && !isEvmTx && !chainStore.getChain(chainId).chainId.startsWith('injective'),
      allowHexAddressOnly: isEvmTx,
      icns: ICNSInfo,
      computeTerraClassicTax: true
    }
  );
  sendConfigs.amountConfig.setCurrency(currency);

  const gasSimulatorKey = useMemo(() => {
    const txType: 'evm' | 'cosmos' = isEvmTx ? 'evm' : 'cosmos';

    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom);

      if (denomHelper.type !== 'native') {
        if (denomHelper.type === 'erc20') {
          // XXX: This logic causes gas simulation to run even if `gasSimulatorKey` is the same, it needs to be figured out why.
          const amountHexDigits = BigInt(sendConfigs.amountConfig.amount[0].toCoin().amount).toString(16).length;
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}/${amountHexDigits}`;
        }

        if (denomHelper.type === 'cw20') {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return `${txType}/${denomHelper.type}`;
      }
    }

    return `${txType}/native`;
  }, [isEvmTx, sendConfigs.amountConfig.amount, sendConfigs.amountConfig.currency]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.send/send'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    isIBCTransfer ? `ibc/${gasSimulatorKey}` : gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error('Send currency not set');
      }

      if (isIBCTransfer) {
        if (
          sendConfigs.channelConfig.uiProperties.loadingState === 'loading-block' ||
          sendConfigs.channelConfig.uiProperties.error != null
        ) {
          throw new Error('Not ready to simulate tx');
        }
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState === 'loading-block' ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState === 'loading-block' ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error('Not ready to simulate tx');
      }

      const denomHelper = new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom);
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === 'secret20') {
        throw new Error('Simulating secret wasm not supported');
      }

      if (isIBCTransfer) {
        return account.cosmos.makePacketForwardIBCTransferTx(
          accountStore,
          sendConfigs.channelConfig.channels,
          sendConfigs.amountConfig.amount[0].toDec().toString(),
          sendConfigs.amountConfig.amount[0].currency,
          sendConfigs.recipientConfig.recipient
        );
      }

      if (isEvmTx) {
        return {
          simulate: () =>
            ethereumAccount.simulateGasForSendTokenTx({
              currency: sendConfigs.amountConfig.amount[0].currency,
              amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
              sender: sendConfigs.senderConfig.sender,
              recipient: sendConfigs.recipientConfig.recipient
            })
        };
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  useEffect(() => {
    if (chainStore.getChain(chainId).hasFeature('feemarket')) {
      // feemarket 이상하게 만들어서 simulate하면 더 적은 gas가 나온다 귀찮아서 대충 처리.
      gasSimulator.setGasAdjustmentValue('1.6');
    }
  }, [chainId, chainStore, gasSimulator]);

  useEffect(() => {
    if (isEvmChain) {
      const sendingDenomHelper = new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom);
      const isERC20 = sendingDenomHelper.type === 'erc20';
      const isSendingNativeToken =
        sendingDenomHelper.type === 'native' &&
        (chainInfo.stakeCurrency?.coinMinimalDenom ?? chainInfo.currencies[0].coinMinimalDenom) ===
          sendingDenomHelper.denom;
      const newIsEvmTx =
        isEVMOnlyChain ||
        (sendConfigs.recipientConfig.isRecipientEthereumHexAddress && (isERC20 || isSendingNativeToken));

      const newSenderAddress = newIsEvmTx ? account.ethereumHexAddress : account.bech32Address;

      sendConfigs.senderConfig.setValue(newSenderAddress);
      setIsEvmTx(newIsEvmTx);
      ethereumAccount.setIsSendingTx(false);
    }
  }, [
    account,
    ethereumAccount,
    isEvmChain,
    isEVMOnlyChain,
    sendConfigs.amountConfig.currency.coinMinimalDenom,
    sendConfigs.recipientConfig.isRecipientEthereumHexAddress,
    sendConfigs.senderConfig,
    chainInfo.stakeCurrency?.coinMinimalDenom,
    chainInfo.currencies
  ]);

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom).type === 'secret20'
    ) {
      gasSimulator.forceDisable(new Error('error.simulating-secret-20-not-supported'));
      sendConfigs.gasConfig.setValue(250000);
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [gasSimulator, sendConfigs.amountConfig.currency, sendConfigs.gasConfig]);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator
  });

  const [isIBCRecipientSetAuto, setIsIBCRecipientSetAuto] = useState(false);
  const [ibcRecipientAddress, setIBCRecipientAddress] = useState('');

  useEffect(() => {
    if (!isIBCTransfer || sendConfigs.recipientConfig.value !== ibcRecipientAddress) {
      setIsIBCRecipientSetAuto(false);
    }
  }, [ibcRecipientAddress, sendConfigs.recipientConfig.value, isIBCTransfer]);

  const [ibcChannelFluent, setIBCChannelFluent] = useState<
    | {
        destinationChainId: string;
        originDenom: string;
        originChainId: string;

        channels: {
          portId: string;
          channelId: string;

          counterpartyChainId: string;
        }[];
      }
    | undefined
  >(undefined);

  const historyType = isIBCTransfer ? 'basic-send/ibc' : 'basic-send';

  const [isSendingIBCToken, setIsSendingIBCToken] = useState(false);
  useEffect(() => {
    if (!isIBCTransfer) {
      if (
        new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom).type === 'native' &&
        sendConfigs.amountConfig.currency.coinMinimalDenom.startsWith('ibc/')
      ) {
        setIsSendingIBCToken(true);
        return;
      }
    }

    setIsSendingIBCToken(false);
  }, [isIBCTransfer, sendConfigs.amountConfig.currency]);

  const onSubmit = async () => {
    if (!txConfigsValidate.interactionBlocked) {
      try {
        if (isEvmTx) {
          ethereumAccount.setIsSendingTx(true);
          const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = sendConfigs.feeConfig.getEIP1559TxFees(
            sendConfigs.feeConfig.type
          );

          const unsignedTx = ethereumAccount.makeSendTokenTx({
            currency: sendConfigs.amountConfig.amount[0].currency,
            amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
            to: sendConfigs.recipientConfig.recipient,
            gasLimit: sendConfigs.gasConfig.gas,
            maxFeePerGas: maxFeePerGas?.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
            gasPrice: gasPrice?.toString()
          });
          await ethereumAccount.sendEthereumTx(sender, unsignedTx, {
            onFulfill: txReceipt => {
              queryBalances.getQueryEthereumHexAddress(sender).balances.forEach(balance => {
                if (
                  balance.currency.coinMinimalDenom === coinMinimalDenom ||
                  sendConfigs.feeConfig.fees.some(
                    fee => fee.currency.coinMinimalDenom === balance.currency.coinMinimalDenom
                  )
                ) {
                  balance.fetch();
                }
              });
              queryBalances.getQueryBech32Address(account.bech32Address).balances.forEach(balance => {
                if (
                  balance.currency.coinMinimalDenom === coinMinimalDenom ||
                  sendConfigs.feeConfig.fees.some(
                    fee => fee.currency.coinMinimalDenom === balance.currency.coinMinimalDenom
                  )
                ) {
                  balance.fetch();
                }
              });
            }
          });
          ethereumAccount.setIsSendingTx(false);
        } else {
          const tx = isIBCTransfer
            ? accountStore
                .getAccount(chainId)
                .cosmos.makePacketForwardIBCTransferTx(
                  accountStore,
                  sendConfigs.channelConfig.channels,
                  sendConfigs.amountConfig.amount[0].toDec().toString(),
                  sendConfigs.amountConfig.amount[0].currency,
                  sendConfigs.recipientConfig.recipient
                )
            : accountStore
                .getAccount(chainId)
                .makeSendTokenTx(
                  sendConfigs.amountConfig.amount[0].toDec().toString(),
                  sendConfigs.amountConfig.amount[0].currency,
                  sendConfigs.recipientConfig.recipient
                );

          await tx.send(
            sendConfigs.feeConfig.toStdFee(),
            sendConfigs.memoConfig.memo,
            {
              preferNoSetFee: true,
              preferNoSetMemo: true,
              sendTx: async (chainId, tx, mode) => {
                let msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                  historyType,
                  chainId,
                  sendConfigs.recipientConfig.chainId,
                  tx,
                  mode,
                  false,
                  sendConfigs.senderConfig.sender,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.amountConfig.amount.map(amount => {
                    return {
                      amount: DecUtils.getTenExponentN(amount.currency.coinDecimals).mul(amount.toDec()).toString(),
                      denom: amount.currency.coinMinimalDenom
                    };
                  }),
                  sendConfigs.memoConfig.memo
                );
                if (isIBCTransfer) {
                  if (msg instanceof SendTxAndRecordMsg) {
                    msg = msg.withIBCPacketForwarding(sendConfigs.channelConfig.channels, {
                      currencies: chainStore.getChain(chainId).currencies
                    });
                  } else {
                    throw new Error('Invalid message type');
                  }
                }
                return await new RNMessageRequesterInternal().sendMessage(BACKGROUND_PORT, msg);
              }
            },
            {
              onBroadcasted: async () => {
                chainStore.enableVaultsWithCosmosAddress(
                  sendConfigs.recipientConfig.chainId,
                  sendConfigs.recipientConfig.recipient
                );

                if (!isIBCTransfer) {
                  const inCurrencyPrice = await priceStore.waitCalculatePrice(
                    sendConfigs.amountConfig.amount[0],
                    'usd'
                  );

                  const params: Record<string, number | string | boolean | number[] | string[] | undefined> = {
                    denom: sendConfigs.amountConfig.amount[0].currency.coinMinimalDenom,
                    commonDenom: (() => {
                      const currency = sendConfigs.amountConfig.amount[0].currency;
                      if ('paths' in currency && currency.originCurrency) {
                        return currency.originCurrency.coinDenom;
                      }
                      return currency.coinDenom;
                    })(),
                    chainId: sendConfigs.recipientConfig.chainId,
                    chainIdentifier: ChainIdHelper.parse(sendConfigs.recipientConfig.chainId).identifier,
                    inAvg: amountToAmbiguousAverage(sendConfigs.amountConfig.amount[0])
                  };
                  if (inCurrencyPrice) {
                    params['inFiatAvg'] = amountToAmbiguousAverage(inCurrencyPrice);
                  }
                  new RNMessageRequesterInternal().sendMessage(
                    BACKGROUND_PORT,
                    new LogAnalyticsEventMsg('send', params)
                  );
                } else if (ibcChannelFluent != null) {
                  const pathChainIds = [chainId].concat(
                    ...ibcChannelFluent.channels.map(channel => channel.counterpartyChainId)
                  );
                  const intermediateChainIds: string[] = [];
                  if (pathChainIds.length > 2) {
                    intermediateChainIds.push(...pathChainIds.slice(1, -1));
                  }

                  const inCurrencyPrice = await priceStore.waitCalculatePrice(
                    sendConfigs.amountConfig.amount[0],
                    'usd'
                  );

                  const params: Record<string, number | string | boolean | number[] | string[] | undefined> = {
                    originDenom: ibcChannelFluent.originDenom,
                    originCommonDenom: (() => {
                      const currency = chainStore
                        .getChain(ibcChannelFluent.originChainId)
                        .forceFindCurrency(ibcChannelFluent.originDenom);
                      if ('paths' in currency && currency.originCurrency) {
                        return currency.originCurrency.coinDenom;
                      }
                      return currency.coinDenom;
                    })(),
                    originChainId: ibcChannelFluent.originChainId,
                    originChainIdentifier: ChainIdHelper.parse(ibcChannelFluent.originChainId).identifier,
                    sourceChainId: chainId,
                    sourceChainIdentifier: ChainIdHelper.parse(chainId).identifier,
                    destinationChainId: ibcChannelFluent.destinationChainId,
                    destinationChainIdentifier: ChainIdHelper.parse(ibcChannelFluent.destinationChainId).identifier,
                    pathChainIds,
                    pathChainIdentifiers: pathChainIds.map(chainId => ChainIdHelper.parse(chainId).identifier),
                    intermediateChainIds,
                    intermediateChainIdentifiers: intermediateChainIds.map(
                      chainId => ChainIdHelper.parse(chainId).identifier
                    ),
                    isToOrigin: ibcChannelFluent.destinationChainId === ibcChannelFluent.originChainId,
                    inAvg: amountToAmbiguousAverage(sendConfigs.amountConfig.amount[0])
                  };
                  if (inCurrencyPrice) {
                    params['inFiatAvg'] = amountToAmbiguousAverage(inCurrencyPrice);
                  }
                  new RNMessageRequesterInternal().sendMessage(
                    BACKGROUND_PORT,
                    new LogAnalyticsEventMsg('ibc_send', params)
                  );
                }
              },
              onFulfill: (tx: any) => {}
            }
          );
        }
      } catch (e) {
        if (e?.message === 'Request rejected') {
          return;
        }

        if (isEvmTx) {
          ethereumAccount.setIsSendingTx(false);
        }

        console.log(e);
      }
    }
  };

  console.log('balance 2', balance?.balance);

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send EVM"
          disabled={txConfigsValidate.interactionBlocked}
          loading={
            isEvmTx
              ? ethereumAccount.isSendingTx
              : accountStore.getAccount(chainId).isSendingMsg === (!isIBCTransfer ? 'send' : 'ibcTransfer')
          }
          onPress={onSubmit}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32
            }
          ]}
          textStyle={{
            fontSize: 16,
            fontWeight: '600',
            color: colors['neutral-text-action-on-dark-bg']
          }}
        />
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
          <OWCard
            type="normal"
            style={[
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
              inputContainerStyle={{
                backgroundColor: colors['neutral-surface-card'],
                borderWidth: 0,
                paddingHorizontal: 0
              }}
            />
          </OWCard>
          <OWCard
            style={[
              {
                paddingTop: 22,
                backgroundColor: colors['neutral-surface-card']
              }
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
                  Balance:{' '}
                  {(balance?.balance ?? new CoinPretty(currency, '0'))
                    ?.trim(true)
                    ?.maxDecimals(6)
                    ?.hideDenom(true)
                    ?.toString() || '0'}
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
                  alignItems: 'flex-end'
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
            <View
              style={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              {/* <OWIcon name="tdesign_swap" size={16} />
              <OWText style={{ paddingLeft: 4 }} color={colors['neutral-text-body']}>
                {priceStore.calculatePrice(amount).toString()}
              </OWText> */}
            </View>
          </OWCard>
          <OWCard
            style={{
              backgroundColor: colors['neutral-surface-card']
            }}
            type="normal"
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomColor: colors['neutral-border-default'],
                borderBottomWidth: 1,
                paddingVertical: 16,
                marginBottom: 8
              }}
            >
              {/* <OWText color={colors['neutral-text-title']} weight="600" size={16}>
                Transaction fee
              </OWText> */}
              <FeeControl
                senderConfig={sendConfigs.senderConfig}
                feeConfig={sendConfigs.feeConfig}
                gasConfig={sendConfigs.gasConfig}
                gasSimulator={gasSimulator}
              />
              {/* <TouchableOpacity style={{ flexDirection: 'row' }} onPress={_onPressFee}>
                <OWText color={colors['primary-text-action']} weight="600" size={16}>
                  {capitalizedText(sendConfigs.feeConfig.feeType)}:{' '}
                  {priceStore.calculatePrice(sendConfigs.feeConfig.fee)?.toString()}{' '}
                </OWText>
                <DownArrowIcon height={11} color={colors['primary-text-action']} />
              </TouchableOpacity> */}
            </View>
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});
const styling = colors =>
  StyleSheet.create({
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

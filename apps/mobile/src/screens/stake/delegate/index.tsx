import { ChainIdEnum, EthereumEndpoint, toAmount } from '@owallet/common';
import { useDelegateTxConfig, useGasSimulator, useTxConfigsValidate } from '@owallet/hooks';
import { Staking } from '@owallet/stores';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import OWCard from '@src/components/card/ow-card';
import { AlertIcon, DownArrowIcon } from '@src/components/icon';
import { PageWithBottom } from '@src/components/page/page-with-bottom';
import OWText from '@src/components/text/ow-text';
import { ValidatorThumbnail } from '@src/components/thumbnail';
import { useTheme } from '@src/themes/theme-provider';
import { capitalizedText, computeTotalVotingPower, formatPercentage, showToast } from '@src/utils/helper';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, InteractionManager } from 'react-native';
import { OWButton } from '../../../components/button';

import { useStore } from '../../../stores';
import { metrics, spacing, typography } from '../../../themes';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { NewAmountInput } from '@src/components/input/amount-input';
import { FeeModal } from '@src/modals/fee';
import { CoinPretty, Dec, Int } from '@owallet/unit';
import { API } from '@src/common/api';
import { initPrice } from '@src/screens/home/hooks/use-multiple-assets';
import { tracking } from '@src/utils/tracking';
import { makeStdTx } from '@cosmjs/amino';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { goBack, navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
import { OWHeaderTitle } from '@components/header';
import { AsyncKVStore } from '@src/common';
import { LoadingSpinner } from '@components/spinner';
import { FeeControl } from '@components/input/fee-control';
export const DelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();
  useEffect(() => {
    tracking(`Delegate Screen`);

    return () => {};
  }, []);

  const validatorAddress = route.params.validatorAddress;
  const {
    chainStore,
    accountStore,
    queriesStore,
    // analyticsStore,
    priceStore,
    modalStore,
    keyRingStore,
    appInitStore
  } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const initialChainId = route.params['chainId'] || chainStore.current['chainId'];
  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  // const [validatorDetail, setValidatorDetail] = useState();
  // const [validators, setValidators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const sendConfigs = useDelegateTxConfig(
  //   chainStore,
  //   chainId,
  //   account.msgOpts["delegate"].gas,
  //   account.bech32Address,
  //   queries.queryBalances,
  //   EthereumEndpoint
  // );
  const sender = account.bech32Address;
  const unbondingPeriodDay = queries.cosmos.queryStakingParams.response
    ? queries.cosmos.queryStakingParams.unbondingTimeSec / (3600 * 24)
    : 21;
  const chainInfo = chainStore.getChain(chainId);
  const sendConfigs = useDelegateTxConfig(chainStore, queriesStore, chainId, sender, validatorAddress, 300000);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <OWHeaderTitle title={'Stake'} subTitle={chainStore.current?.chainName} />
    });
  }, [chainStore.current?.chainName]);
  useEffect(() => {
    if (!initialChainId) {
      goBack();
    }
  }, [initialChainId]);
  useEffect(() => {
    if (sendConfigs.feeConfig.type !== 'manual') {
      sendConfigs.feeConfig.setFee({
        type: sendConfigs.feeConfig.type,
        currency: chainInfo.stakeCurrency
      });
    } else {
      sendConfigs.feeConfig.setFee({
        type: 'average',
        currency: chainInfo.stakeCurrency
      });
    }
  }, [chainInfo.stakeCurrency]);
  // useEffect(() => {
  //   InteractionManager.runAfterInteractions(() => {
  //     if (chainId !== ChainIdEnum.Oraichain) return;
  //     (async () => {
  //       try {
  //         const res = await Promise.all([
  //           API.getValidatorOraichainDetail(
  //             {
  //               validatorAddress: validatorAddress,
  //             },
  //             {
  //               baseURL: "https://api.scan.orai.io",
  //             }
  //           ),
  //           API.getValidatorList(
  //             {},
  //             {
  //               baseURL: "https://api.scan.orai.io",
  //             }
  //           ),
  //         ]);
  //         if (res[0].status !== 200) return;
  //         setValidatorDetail(res[0].data);
  //         if (res[1].status !== 200) return;
  //         setValidators(res[1].data.data);
  //       } catch (error) {}
  //     })();
  //   });
  // }, [chainId, validatorAddress]);
  // useEffect(() => {
  //   if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
  //     sendConfigs.feeConfig.setFeeType("average");
  //   }
  //   return;
  // }, [sendConfigs.feeConfig]);
  // const [balance, setBalance] = useState<CoinPretty>(null);
  // const address = account.getAddressDisplay(
  //   keyRingStore.keyRingLedgerAddresses
  // );
  // const isReadyBalance = queries.queryBalances
  //   .getQueryBech32Address(address)
  //   .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency).isReady;
  // useEffect(() => {
  //   InteractionManager.runAfterInteractions(() => {
  //     if (isReadyBalance && sendConfigs.amountConfig.sendCurrency && address) {
  //       const balance = queries.queryBalances
  //         .getQueryBech32Address(address)
  //         .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency);
  //       setBalance(balance);
  //     }
  //   });
  // }, [isReadyBalance, address, sendConfigs.amountConfig.sendCurrency]);

  // useEffect(() => {
  //   sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  // }, [sendConfigs.recipientConfig, validatorAddress]);

  // useEffect(() => {
  //   if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
  //     sendConfigs.feeConfig.setFeeType("average");
  //   }
  //   if (appInitStore.getInitApp.feeOption) {
  //     sendConfigs.feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
  //   }
  // }, [sendConfigs.feeConfig, appInitStore.getInitApp.feeOption]);

  // const sendConfigError =
  //   (chainId === "oraibtc-mainnet-1"
  //     ? null
  //     : sendConfigs.recipientConfig.getError()) ??
  //   sendConfigs.amountConfig.getError() ??
  //   sendConfigs.memoConfig.getError() ??
  //   sendConfigs.gasConfig.getError() ??
  //   sendConfigs.feeConfig.getError();
  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.stake.delegate/delegate'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    'native',
    () => {
      return account.cosmos.makeDelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator
  });
  const txStateIsValid = txConfigsValidate.interactionBlocked;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);

  const validator = bondedValidators.getValidator(validatorAddress);

  const thumbnail = bondedValidators.getValidatorThumbnail(validatorAddress);
  const balance = queries.queryBalances.getQueryBech32Address(sender).getBalanceFromCurrency(chainInfo.stakeCurrency);
  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(<FeeModal vertical={true} sendConfigs={sendConfigs} colors={colors} />);
  };

  // const totalVotingPower = useMemo(
  //   () => computeTotalVotingPower(validators),
  //   [validators]
  // );
  // const currentVotingPower = parseFloat(validatorDetail?.voting_power || 0);
  // const percentage =
  //   chainId === ChainIdEnum.Oraichain
  //     ? formatPercentage(currentVotingPower / totalVotingPower, 2)
  //     : 0;
  // const amount = new CoinPretty(
  //     chainInfo.stakeCurrency || chainInfo.currencies[0],
  //   new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  // );

  // const stakeOraiBtc = async () => {
  //   try {
  //     setIsLoading(true);
  //     const res = await API.getInfoAccOraiBtc(
  //       { address: account.bech32Address },
  //       { baseURL: chainStore.current.rest }
  //     );
  //     const sequence = res.data.result.value.sequence;
  //     const signDoc = {
  //       account_number: "0",
  //       chain_id: chainId,
  //       fee: {
  //         gas: "10000",
  //         amount: [{ amount: "0", denom: "uoraibtc" }],
  //       },
  //       memo: "",
  //       msgs: [
  //         {
  //           type: "cosmos-sdk/MsgDelegate",
  //           value: {
  //             amount: sendConfigs.amountConfig.getAmountPrimitive(),
  //             delegator_address: address,
  //             validator_address: sendConfigs.recipientConfig.recipient,
  //           },
  //         },
  //       ],
  //       sequence: sequence,
  //     };
  //     //@ts-ignore
  //     const signature = await window.owallet.signAmino(
  //       chainId,
  //       account.bech32Address,
  //       signDoc
  //     );
  //     const tx = makeStdTx(signDoc, signature.signature);
  //     const tmClient = await Tendermint37Client.connect(chainStore.current.rpc);
  //     const result = await tmClient.broadcastTxSync({
  //       tx: Uint8Array.from(Buffer.from(JSON.stringify(tx))),
  //     });
  //     if (result?.code === 0 || result?.code == null) {
  //       setIsLoading(false);
  //       navigate(SCREENS.TxPendingResult, {
  //         txHash: Buffer.from(result?.hash).toString("hex"),
  //         data: {
  //           type: "stake",
  //           wallet: account.bech32Address,
  //           validator: sendConfigs.recipientConfig.recipient,
  //           amount: sendConfigs.amountConfig.getAmountPrimitive(),
  //           fee: sendConfigs.feeConfig.toStdFee(),
  //           currency: sendConfigs.amountConfig.sendCurrency,
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     if (error?.message?.includes("'signature' of undefined")) return;
  //     showToast({
  //       type: "danger",
  //       message: `Failed to Stake: ${error?.message || JSON.stringify(error)}`,
  //     });
  //     console.log(error, "error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Stake"
          disabled={!account.isReadyToSendMsgs || txStateIsValid}
          loading={account.isSendingMsg === 'send'}
          onPress={async () => {
            if (!txConfigsValidate.interactionBlocked) {
              const tx = account.cosmos.makeDelegateTx(
                sendConfigs.amountConfig.amount[0].toDec().toString(),
                sendConfigs.recipientConfig.recipient
              );
              try {
                // if (chainId === "oraibtc-mainnet-1") {
                //   stakeOraiBtc();
                //   return;
                // }

                await tx.send(
                  sendConfigs.feeConfig.toStdFee(),
                  sendConfigs.memoConfig.memo,
                  {
                    preferNoSetFee: true,
                    preferNoSetMemo: true
                  },
                  {
                    onFulfill: (tx: any) => {
                      if (tx.code != null && tx.code !== 0) {
                        console.log(tx);
                        showToast({
                          type: 'danger',
                          message: 'Your transaction Failed'
                        });
                        return;
                      }
                      showToast({
                        type: 'success',
                        message: 'Transaction Successful'
                      });
                    },
                    onBroadcasted: txHash => {
                      navigate(SCREENS.TxPendingResult, {
                        chainId: initialChainId,
                        txHash: Buffer.from(txHash).toString('hex'),
                        data: {
                          type: 'stake',
                          wallet: account.bech32Address,
                          validator: sendConfigs.recipientConfig.recipient,
                          amount: sendConfigs.amountConfig.amount[0],
                          fee: sendConfigs.feeConfig.fees[0]
                        }
                      });
                    }
                  }
                );
              } catch (e) {
                if (e?.message.toLowerCase().includes('rejected')) {
                  return;
                } else if (e?.message.includes('Cannot read properties of undefined')) {
                  return;
                } else {
                  console.log(e);

                  showToast({
                    message: JSON.stringify(e),
                    type: 'danger'
                  });
                }
              }
            }
          }}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32
            }
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: '600',
            color: colors['neutral-text-action-on-dark-bg']
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {validator ? (
          <View>
            <OWCard
              style={{
                backgroundColor: colors['neutral-surface-card']
              }}
            >
              <OWText style={{ paddingBottom: 8 }} color={colors['neutral-text-title']}>
                Validator
              </OWText>
              <View
                style={{
                  flexDirection: 'row'
                }}
              >
                <View
                  style={{
                    backgroundColor: colors['neutral-icon-on-dark'],
                    borderRadius: 999
                  }}
                >
                  <ValidatorThumbnail size={20} url={thumbnail} />
                </View>

                <OWText style={{ paddingLeft: 8 }} color={colors['neutral-text-title']} weight="500">
                  {validator?.description.moniker}
                </OWText>
              </View>
            </OWCard>
            <OWCard
              style={{
                paddingTop: 22,
                backgroundColor: colors['neutral-surface-card']
              }}
              type="normal"
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                <View style={{}}>
                  <OWText style={{ paddingTop: 8 }}>
                    Balance : {balance?.trim(true)?.maxDecimals(6)?.hideDenom(true)?.toString() || '0'}
                  </OWText>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: colors['neutral-surface-action3'],
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      maxWidth: metrics.screenWidth / 4.5,
                      marginTop: 12,
                      alignItems: 'center'
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors['neutral-surface-action'],
                        borderRadius: 999
                      }}
                    >
                      <OWIcon
                        type="images"
                        source={{
                          uri: chainStore.current.stakeCurrency?.coinImageUrl
                        }}
                        style={{
                          borderRadius: 999
                        }}
                        size={16}
                      />
                    </View>
                    <OWText style={{ paddingLeft: 4 }} weight="600" size={14}>
                      {chainStore.current.stakeCurrency.coinDenom}
                    </OWText>
                  </View>
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
                      width: metrics.screenWidth / 2.3,
                      marginBottom: 8
                    }}
                    amountConfig={sendConfigs.amountConfig}
                    maxBalance={balance?.trim(true)?.maxDecimals(6)?.hideDenom(true)?.toString() || '0'}
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
                <OWIcon name="tdesign_swap" size={16} color={colors['neutral-text-body']} />
                <OWText style={{ paddingLeft: 4 }} color={colors['neutral-text-body']} size={14}>
                  {(sendConfigs.amountConfig.amount[0]
                    ? priceStore.calculatePrice(sendConfigs.amountConfig.amount[0])
                    : initPrice
                  )?.toString()}
                </OWText>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  borderRadius: 12,
                  backgroundColor: colors['warning-surface-subtle'],
                  padding: 12,
                  marginTop: 8
                }}
              >
                <AlertIcon color={colors['warning-text-body']} size={16} />
                <OWText style={{ paddingLeft: 8 }} weight="600" size={14}>
                  {`When you unstake, a ${unbondingPeriodDay}-day cooldown period is required before your stake returns to your wallet.`}
                </OWText>
              </View>
            </OWCard>
            <OWCard
              style={{
                backgroundColor: colors['neutral-surface-card']
              }}
              type="normal"
            >
              <FeeControl
                senderConfig={sendConfigs.senderConfig}
                feeConfig={sendConfigs.feeConfig}
                gasConfig={sendConfigs.gasConfig}
                gasSimulator={gasSimulator}
              />
            </OWCard>
          </View>
        ) : null}
      </ScrollView>
    </PageWithBottom>
  );
});

const styling = colors =>
  StyleSheet.create({
    page: {
      padding: spacing['page']
    },
    containerStaking: {
      borderRadius: spacing['24'],
      backgroundColor: colors['primary'],
      marginBottom: spacing['24']
    },
    containerBtn: {
      backgroundColor: colors['primary-surface-default'],
      marginLeft: spacing['24'],
      marginRight: spacing['24'],
      borderRadius: spacing['8'],
      marginTop: spacing['20'],
      paddingVertical: spacing['16']
    },
    textBtn: {
      ...typography.h6,
      color: colors['white'],
      fontWeight: '700'
    },
    sendlabelInput: {
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 22,
      color: colors['gray-900'],
      marginBottom: spacing['8']
    },
    textNormal: {
      ...typography.h7,
      color: colors['gray-600']
    },
    listLabel: {
      paddingVertical: 16,
      borderBottomColor: colors['neutral-border-default'],
      borderBottomWidth: 1
    },
    title: {
      color: colors['neutral-text-body']
    },
    topSubInfo: {
      backgroundColor: colors['neutral-surface-bg2'],
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 4,
      marginTop: 4,
      marginRight: 8,
      flexDirection: 'row'
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
      marginLeft: 12
    },
    label: {
      fontWeight: '600',
      textAlign: 'center',
      marginTop: spacing['6'],
      color: colors['neutral-text-title']
    },
    percentBtn: {
      backgroundColor: colors['primary-surface-default'],
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4
    }
  });

import { toAmount, ValidatorThumbnails } from '@owallet/common';
import { useUndelegateTxConfig } from '@owallet/hooks';
import { BondStatus } from '@owallet/stores';
import { CoinPretty, Dec, DecUtils, Int } from '@owallet/unit';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import OWCard from '@src/components/card/ow-card';

import { AlertIcon, DownArrowIcon } from '@src/components/icon';
import { NewAmountInput } from '@src/components/input/amount-input';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { PageWithBottom } from '@src/components/page/page-with-bottom';
import OWText from '@src/components/text/ow-text';
import { useTheme } from '@src/themes/theme-provider';
import { capitalizedText, showToast } from '@src/utils/helper';
import { Buffer } from 'buffer';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OWButton } from '../../../components/button';

import { ValidatorThumbnail } from '../../../components/thumbnail';

import { useStore } from '../../../stores';
import { metrics, spacing } from '../../../themes';
import { FeeModal } from '@src/modals/fee';
import { tracking } from '@src/utils/tracking';
import { makeStdTx } from '@cosmjs/amino';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { API } from '@src/common/api';
import { navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
import { OWHeaderTitle } from '@components/header';

export const UndelegateScreen: FunctionComponent = observer(() => {
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
  tracking(`Undelegate Screen`);
  const validatorAddress = route.params.validatorAddress;

  const { chainStore, modalStore, accountStore, queriesStore, analyticsStore, priceStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);

  const [isLoading, setIsLoading] = useState(false);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const chainInfo = chainStore.getChain(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <OWHeaderTitle title={'UnStake'} subTitle={chainStore.current?.chainName} />
    });
  }, [chainStore.current?.chainName]);
  const validator =
    queries.cosmos.queryValidators.getQueryStatus(BondStatus.Bonded).getValidator(validatorAddress) ||
    queries.cosmos.queryValidators.getQueryStatus(BondStatus.Unbonding).getValidator(validatorAddress) ||
    queries.cosmos.queryValidators.getQueryStatus(BondStatus.Unbonded).getValidator(validatorAddress);

  const validatorThumbnail = validator
    ? queries.cosmos.queryValidators.getQueryStatus(BondStatus.Bonded).getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators.getQueryStatus(BondStatus.Unbonding).getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators.getQueryStatus(BondStatus.Unbonded).getValidatorThumbnail(validatorAddress)
    : undefined;

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts['undelegate'].gas,
    account.bech32Address,
    queries.queryBalances,
    queries.cosmos.queryDelegations,
    validatorAddress
  );
  const amount = new CoinPretty(
    chainStore.current.feeCurrencies[0],
    new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  );
  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    (chainStore.current.chainId === 'oraibtc-mainnet-1' ? null : sendConfigs.recipientConfig.getError()) ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType('average');
    }
    if (appInitStore.getInitApp.feeOption) {
      sendConfigs.feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
    }
  }, [sendConfigs.feeConfig, appInitStore.getInitApp.feeOption]);
  const unstakeOraiBtc = async () => {
    try {
      setIsLoading(true);
      const res = await API.getInfoAccOraiBtc({ address: account.bech32Address }, { baseURL: chainStore.current.rest });

      const sequence = res.data.result.value.sequence;
      const signDoc = {
        account_number: '0',
        chain_id: chainStore.current.chainId,
        fee: {
          gas: '10000',
          amount: [{ amount: '0', denom: 'uoraibtc' }]
        },
        memo: '',
        msgs: [
          {
            type: 'cosmos-sdk/MsgUndelegate',
            value: {
              amount: sendConfigs.amountConfig.getAmountPrimitive(),
              delegator_address: account.bech32Address,
              validator_address: sendConfigs.recipientConfig.recipient
            }
          }
        ],
        sequence: sequence
      };
      //@ts-ignore
      const signature = await window.owallet.signAmino(chainStore.current.chainId, account.bech32Address, signDoc);
      const tx = makeStdTx(signDoc, signature.signature);
      const tmClient = await Tendermint37Client.connect(chainStore.current.rpc);
      const result = await tmClient.broadcastTxSync({
        tx: Uint8Array.from(Buffer.from(JSON.stringify(tx)))
      });

      if (result?.code === 0 || result?.code == null) {
        setIsLoading(false);
        if (chainInfo.raw?.txExplorer?.txUrl === '') {
          account.setIsSendingMsgs(false);
        }
        navigate(SCREENS.TxPendingResult, {
          txHash: Buffer.from(result?.hash).toString('hex'),
          from: 'stake',
          data: {
            type: 'unstake',
            wallet: account.bech32Address,
            validator: sendConfigs.recipientConfig.recipient,
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
        message: `Failed to UnDelegate: ${error?.message || JSON.stringify(error)}`
      });
      console.log(error, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  const isDisable = !account.isReadyToSendMsgs || !txStateIsValid || isLoading;
  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(<FeeModal vertical={true} sendConfigs={sendConfigs} colors={colors} />);
  };
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          type="danger"
          label="Unstake"
          disabled={isDisable}
          loading={account.isSendingMsg === 'undelegate' || isLoading}
          onPress={async () => {
            if (account.isReadyToSendMsgs && txStateIsValid) {
              try {
                if (chainStore.current.chainId === 'oraibtc-mainnet-1') {
                  unstakeOraiBtc();
                  return;
                }
                await account.cosmos.sendUndelegateMsg(
                  sendConfigs.amountConfig.amount,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.memoConfig.memo,
                  sendConfigs.feeConfig.toStdFee(),
                  {
                    preferNoSetMemo: true,
                    preferNoSetFee: true
                  },
                  {
                    onFulfill: tx => {
                      console.log(tx, 'TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!');
                    },
                    onBroadcasted: txHash => {
                      analyticsStore.logEvent('Undelegate tx broadcasted', {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        validatorName: validator?.description.moniker,
                        feeType: sendConfigs.feeConfig.feeType
                      });
                      tracking(
                        `Undelegate`,
                        `chainName=${chainStore.current.chainName};validatorName=${
                          validator?.description.moniker ?? '...'
                        };`
                      );
                      navigate(SCREENS.TxPendingResult, {
                        txHash: Buffer.from(txHash).toString('hex'),
                        data: {
                          type: 'unstake',
                          wallet: account.bech32Address,
                          validator: sendConfigs.recipientConfig.recipient,
                          amount: sendConfigs.amountConfig.getAmountPrimitive(),
                          fee: sendConfigs.feeConfig.toStdFee(),
                          currency: sendConfigs.amountConfig.sendCurrency
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
        {/*<PageHeader*/}
        {/*  title="Unstake"*/}
        {/*  subtitle={chainStore.current.chainName}*/}
        {/*  colors={colors}*/}
        {/*  onPress={async () => {}}*/}
        {/*/>*/}
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
                  <ValidatorThumbnail size={20} url={validatorThumbnail} />
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
                    Staked : {staked.trim(true).shrink(true).maxDecimals(6).toString()}
                  </OWText>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: colors['neutral-surface-action3'],
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      maxWidth: metrics.screenWidth / 4.5,
                      marginTop: 12
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 999,
                        justifyContent: 'center'
                      }}
                    >
                      <OWIcon
                        style={{
                          borderRadius: 999
                        }}
                        type="images"
                        source={{
                          uri: sendConfigs.amountConfig.sendCurrency?.coinImageUrl
                        }}
                        size={16}
                      />
                    </View>
                    <OWText style={{ paddingLeft: 4 }} weight="600" size={14}>
                      {sendConfigs.amountConfig.sendCurrency?.coinDenom}
                    </OWText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'flex-end',
                    marginBottom: -12
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
                    maxBalance={staked.trim(true).shrink(true).maxDecimals(6).toString().split(' ')[0]}
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
                <OWIcon name="tdesign_swap" size={16} />
                <OWText style={{ paddingLeft: 4 }} color={colors['neutral-text-body']} size={14}>
                  {priceStore.calculatePrice(amount)?.toString()}
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
                  {`When you unstake, a 14-day cooldown period is required before your stake returns to your wallet.`}
                </OWText>
              </View>
            </OWCard>
            <OWCard
              style={{
                backgroundColor: colors['neutral-surface-card']
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderBottomColor: colors['neutral-border-default'],
                  borderBottomWidth: 1,
                  paddingVertical: 16
                }}
              >
                <OWText color={colors['neutral-text-title']} weight="600">
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
            </OWCard>
          </View>
        ) : null}
      </ScrollView>
    </PageWithBottom>
  );
});

const styling = colors =>
  StyleSheet.create({
    containerStaking: {
      borderRadius: spacing['24'],
      backgroundColor: colors['primary'],
      marginBottom: spacing['24']
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

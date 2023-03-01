import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PageWithScrollViewInBottomTabView } from '../../../components/page';
import { RouteProp, useRoute, useTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../../stores';
import { useDelegateTxConfig } from '@owallet/hooks';
import { EthereumEndpoint } from '@owallet/common';
import {
  AmountInput,
  FeeButtons,
  MemoInput,
  TextInput
} from '../../../components/input';
import { Button } from '../../../components/button';
import { useSmartNavigation } from '../../../navigation.provider';
import { BondStatus } from '@owallet/stores';
import { spacing, typography } from '../../../themes';
import { CText as Text } from '../../../components/text';
import { Toggle } from '../../../components/toggle';
import { Dec, DecUtils } from '@owallet/unit';

// import { RectButton } from '../../../components/rect-button';
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import { DownArrowIcon } from '../../../components/icon';
// import { StakeAdvanceModal } from '../components/stake-advance';

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

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [customFee, setCustomFee] = useState(false);

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts['delegate'].gas,
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);

  // const _onOpenStakeModal = () => {
  //   modalStore.setOpen();
  //   modalStore.setChildren(
  //     StakeAdvanceModal({
  //       config: sendConfigs
  //     })
  //   );
  // };

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors['background']}>
      <Text
        style={{
          ...styles.title,
          color: colors['primary-text']
        }}
      >
        Staking
      </Text>

      <View
        style={{
          ...styles.containerStaking,
          padding: spacing['24']
        }}
      >
        <AmountInput label={'Amount'} amountConfig={sendConfigs.amountConfig} />
        <MemoInput
          label={'Memo (Optional)'}
          memoConfig={sendConfigs.memoConfig}
        />

        {/* Need to some custom fee here */}

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
              paddingHorizontal: 8,
              color: colors['primary-text']
            }}
          >
            Custom Fee
          </Text>
        </View>

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
            label="Fee"
            gasLabel="gas"
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
          />
        ) : null}

        {/* <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
          onPress={_onOpenStakeModal}
        >
          <Text
            style={{
              ...typography.h7,
              color: colors['purple-900'],
              marginRight: 4
            }}
          >{`Advance options`}</Text>
          <DownArrowIcon color={colors['purple-900']} height={10} />
        </TouchableOpacity> */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing['16'],
            paddingTop: spacing['4']
          }}
        >
          <View>
            <Text
              style={{
                ...styles.textNormal,
                marginBottom: spacing['4'],
                color: colors['sub-primary-text']
              }}
            >{`Gas limit`}</Text>
            {/* Gas limit now fixed at 0.00004 ORAI for every transactions */}
            <Text
              style={{
                ...styles.textNormal,
                color: colors['sub-primary-text']
              }}
            >{`200000`}</Text>
          </View>
          <View />
        </View>
      </View>
      <Button
        containerStyle={{
          marginHorizontal: spacing['20'],
          backgroundColor: colors['purple-900'],
          marginBottom: 20
        }}
        underlayColor={colors['purple-400']}
        text="Stake"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === 'delegate'}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            try {
              await account.cosmos.sendDelegateMsg(
                sendConfigs.amountConfig.amount,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                sendConfigs.feeConfig.toStdFee(),
                {
                  preferNoSetMemo: true,
                  preferNoSetFee: true
                },
                {
                  onBroadcasted: txHash => {
                    analyticsStore.logEvent('Delegate tx broadcasted', {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      validatorName: validator?.description.moniker ?? '...',
                      feeType: sendConfigs.feeConfig.feeType
                    });
                    smartNavigation.pushSmart('TxPendingResult', {
                      txHash: Buffer.from(txHash).toString('hex')
                    });
                  }
                }
              );
            } catch (e) {
              if (e?.message === 'Request rejected') {
                return;
              }
              if (e?.message.includes('Cannot read properties of undefined')) {
                return;
              }
              console.log(e);
              smartNavigation.navigate('Home', {});
            }
          }
        }}
      />
    </PageWithScrollViewInBottomTabView>
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
      backgroundColor: colors['purple-900'],
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
    title: {
      ...typography.h3,
      fontWeight: '700',
      textAlign: 'center',
      color: colors['gray-900'],
      marginTop: spacing['12'],
      marginBottom: spacing['12']
    }
  });

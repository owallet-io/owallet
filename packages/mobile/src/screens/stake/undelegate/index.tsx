import React, { FunctionComponent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useStore } from '../../../stores';
import { useStyle } from '../../../styles';
import { useUndelegateTxConfig } from '@owallet/hooks';
import {
  PageWithScrollView,
  PageWithScrollViewInBottomTabView
} from '../../../components/page';
import { AmountInput, FeeButtons, MemoInput } from '../../../components/input';
import { View } from 'react-native';
import { CText as Text } from '../../../components/text';
import { Button } from '../../../components/button';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { BondStatus } from '@owallet/stores';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { Buffer } from 'buffer';
import { useSmartNavigation } from '../../../navigation.provider';
import { colors, spacing } from '../../../themes';
import { ValidatorThumbnails } from '@owallet/common';

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

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const validator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const validatorThumbnail = validator
    ? queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Bonded)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonding)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonded)
        .getValidatorThumbnail(validatorAddress) ||
      ValidatorThumbnails[validatorAddress]
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

  const isDisable = !account.isReadyToSendMsgs || !txStateIsValid;

  return (
    <PageWithScrollViewInBottomTabView
      style={style.flatten(['padding-x-page'])}
      contentContainerStyle={style.get('flex-grow-1')}
    >
      <View style={style.flatten(['height-page-pad'])} />
      <View
        style={{
          marginBottom: spacing['12'],
          borderRadius: spacing['8'],
          backgroundColor: colors['white']
        }}
      >
        <CardBody>
          <View style={style.flatten(['flex-row', 'items-center'])}>
            <ValidatorThumbnail
              style={style.flatten(['margin-right-12'])}
              size={36}
              url={validatorThumbnail}
            />
            <Text style={style.flatten(['h6', 'color-text-black-high'])}>
              {validator ? validator.description.moniker : '...'}
            </Text>
          </View>
          <CardDivider
            style={style.flatten([
              'margin-x-0',
              'margin-top-8',
              'margin-bottom-15'
            ])}
          />
          <View style={style.flatten(['flex-row', 'items-center'])}>
            <Text
              style={style.flatten(['subtitle2', 'color-text-black-medium'])}
            >
              Staked
            </Text>
            <View style={style.get('flex-1')} />
            <Text style={style.flatten(['body2', 'color-text-black-medium'])}>
              {staked.trim(true).shrink(true).maxDecimals(6).toString()}
            </Text>
          </View>
        </CardBody>
      </View>
      {/*
        // The recipient validator is selected by the route params, so no need to show the address input.
        <AddressInput
          label="Recipient"
          recipientConfig={sendConfigs.recipientConfig}
        />
      */}
      {/*
      Undelegate tx only can be sent with just stake currency. So, it is not needed to show the currency selector because the stake currency is one.
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      */}
      <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
      <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
      <Button
        text="Unstake"
        size="large"
        style={{
          backgroundColor: isDisable ? colors['disabled'] : colors['purple-900']
        }}
        underlayColor={colors['purple-400']}
        disabled={isDisable}
        loading={account.isSendingMsg === 'undelegate'}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            try {
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
                    console.log(
                      tx,
                      'TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!'
                    );
                  },
                  onBroadcasted: txHash => {
                    analyticsStore.logEvent('Undelegate tx broadcasted', {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      validatorName: validator?.description.moniker,
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
              if (smartNavigation.canGoBack) {
                smartNavigation.goBack();
              } else {
                smartNavigation.navigateSmart('Home', {});
              }
            }
          }
        }}
      />
      <View style={style.flatten(['height-page-pad'])} />
    </PageWithScrollViewInBottomTabView>
  );
});

import React, { FunctionComponent, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStyle } from '../../styles';
import { useGetFeeTron, useSendTronTxConfig } from '@owallet/hooks';
import { Column, Columns } from '../../components/column';
import { Text, View } from 'react-native';
import { Gutter } from '../../components/gutter';
import { Box } from '../../components/box';
import { XAxis } from '../../components/axis';
import { CloseIcon } from '../../components/icon';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Buffer } from 'buffer/';
import { registerModal } from '@src/modals/base';
import { OWButton } from '@components/button';
import OWText from '@components/text/ow-text';
import OWIcon from '@components/ow-icon/ow-icon';
import { SignTronInteractionStore } from '@owallet/stores-core';
import WrapViewModal from '@src/modals/wrap/wrap-view-modal';
import { useTheme } from '@src/themes/theme-provider';
import { DEFAULT_FEE_LIMIT_TRON, toDisplay, TronWebProvider } from '@owallet/common';
import { useLedgerBLE } from '@src/providers/ledger-ble';
import { handleTronPreSignByLedger } from './util/handle-trx-sign';
import { LedgerGuideBox } from '@src/components/guide-box/ledger-guide-box';

export const SignTronModal = registerModal(
  observer<{
    interactionData: NonNullable<SignTronInteractionStore['waitingData']>;
  }>(({ interactionData }) => {
    const { signTronInteractionStore, tronAccountStore, chainStore, queriesStore, keyRingStore } = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(false);
    const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
    const [ledgerInteractingError, setLedgerInteractingError] = useState<Error | undefined>(undefined);

    const chainId = interactionData.data.chainId;
    const account = tronAccountStore.getAccount(chainId);
    const addressToFetch = account.ethereumHexAddress;
    const data = JSON.parse(interactionData?.data?.data);

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    const chainInfo = chainStore.getChain(chainId);
    const queries = queriesStore.get(chainId);
    const sendConfigs = useSendTronTxConfig(chainStore, queriesStore, chainId, addressToFetch, 1);

    if (!parsedData.raw_data_hex) {
      const currency = chainInfo.forceFindCurrency(parsedData.coinMinimalDenom);
      sendConfigs.amountConfig.setCurrency(currency);
      sendConfigs.recipientConfig.setValue(parsedData.recipient || '');
      const displayAmount = toDisplay(parsedData.amount, chainInfo.stakeCurrency.coinDecimals);
      sendConfigs.amountConfig.setValue(displayAmount.toString());
    }

    const feeResult = useGetFeeTron(
      account.base58Address,
      sendConfigs.amountConfig,
      sendConfigs.recipientConfig,
      queries.tron,
      chainInfo,
      keyRingStore.selectedKeyInfo.id,
      keyRingStore,
      parsedData.raw_data_hex ? parsedData : null
    );

    const ledgerBLE = useLedgerBLE();

    const signingDataText = useMemo(() => {
      return JSON.stringify(parsedData);
    }, [parsedData]);

    const approve = async () => {
      try {
        let signature;
        if (interactionData.data.keyType === 'ledger') {
          console.log('ledger tron ', parsedData);
          let transaction;
          const tronWeb = TronWebProvider(chainInfo.rpc);

          if (parsedData?.contractAddress) {
            transaction = (
              await tronWeb.transactionBuilder.triggerSmartContract(
                parsedData?.contractAddress,
                'transfer(address,uint256)',
                {
                  callValue: 0,
                  feeLimit: parsedData?.feeLimit ?? DEFAULT_FEE_LIMIT_TRON,
                  userFeePercentage: 100,
                  shouldPollResponse: false
                },
                [
                  { type: 'address', value: parsedData.recipient },
                  { type: 'uint256', value: parsedData.amount }
                ],
                parsedData.address
              )
            ).transaction;
          } else {
            transaction = await tronWeb.transactionBuilder.sendTrx(
              parsedData.recipient,
              parsedData.amount,
              parsedData.address
            );
          }

          console.log('transaction', transaction.txID);

          setIsLedgerInteracting(true);
          setLedgerInteractingError(undefined);
          console.log('start handleTronPreSignByLedger');

          signature = await handleTronPreSignByLedger(
            interactionData,
            transaction.raw_data_hex,
            ledgerBLE.getTransport
          );

          console.log('signature', signature);
        }

        await signTronInteractionStore.approveWithProceedNext(
          interactionData.id,
          Buffer.from(Buffer.from(JSON.stringify(interactionData.data.data)).toString('hex')),
          signature,
          async () => {
            // noop
          },
          {
            preDelay: 200
          }
        );
      } catch (e) {
        console.log('error on sign Tron', e);
      }
    };
    const { colors } = useTheme();
    return (
      <WrapViewModal
        title={intl.formatMessage({
          id: 'page.sign.ethereum.tx.title'
        })}
      >
        <Box style={style.flatten(['padding-12', 'padding-top-0'])}>
          <Gutter size={24} />

          <Columns sum={1} alignY="center">
            <OWText style={style.flatten(['h5'])}>
              <FormattedMessage id="page.sign.ethereum.tx.summary" />
            </OWText>

            <Column weight={1} />

            <ViewDataButton isViewData={isViewData} setIsViewData={setIsViewData} />
          </Columns>

          <Gutter size={8} />

          {isViewData ? (
            <Box maxHeight={128} backgroundColor={colors['neutral-surface-bg']} padding={12} borderRadius={6}>
              <ScrollView persistentScrollbar={true}>
                <OWText style={style.flatten(['body3'])}>{signingDataText}</OWText>
              </ScrollView>
            </Box>
          ) : (
            <Box
              padding={12}
              minHeight={128}
              maxHeight={240}
              backgroundColor={colors['neutral-surface-bg']}
              borderRadius={6}
            >
              <OWText style={style.flatten(['body3'])}>{`${signingDataText}`}</OWText>
            </Box>
          )}

          <Gutter size={24} />

          {feeResult ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 16
              }}
            >
              <OWText size={16} weight={'600'}>
                <FormattedMessage id="page.sign.components.fee-summary.fee" />
              </OWText>
              <OWText size={16} weight={'600'} color={colors['primary-surface-default']}>
                {toDisplay(feeResult?.feeTrx?.amount, chainInfo.stakeCurrency.coinDecimals) ?? 0}{' '}
                {feeResult?.feeTrx?.denom?.toUpperCase() ?? chainInfo.feeCurrencies[0].coinDenom}
              </OWText>
            </View>
          ) : null}

          <LedgerGuideBox
            data={{
              keyInsensitive: interactionData.data.keyInsensitive,
              isEthereum: true
            }}
            isLedgerInteracting={isLedgerInteracting}
            ledgerInteractingError={ledgerInteractingError}
            // isInternal={interactionData.isInternal}
          />

          <Gutter size={12} />

          <XAxis>
            <OWButton
              size="large"
              label={intl.formatMessage({ id: 'button.reject' })}
              type="secondary"
              style={{ flex: 1, width: '100%' }}
              onPress={async () => {
                await signTronInteractionStore.rejectWithProceedNext(interactionData.id, () => {});
              }}
            />

            <Gutter size={16} />

            <OWButton
              type={'primary'}
              size="large"
              label={intl.formatMessage({ id: 'button.approve' })}
              style={{ flex: 1, width: '100%' }}
              onPress={approve}
            />
          </XAxis>
        </Box>
      </WrapViewModal>
    );
  })
);

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({ isViewData, setIsViewData }) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsViewData(!isViewData);
      }}
    >
      <XAxis alignY="center">
        <Text style={style.flatten(['text-button2', 'color-label-default'])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Text>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={style.get('color-gray-100').color} />
        ) : (
          <OWIcon size={12} name={'tdesignbrackets'} color={style.get('color-gray-100').color} />
        )}
      </XAxis>
    </TouchableWithoutFeedback>
  );
};

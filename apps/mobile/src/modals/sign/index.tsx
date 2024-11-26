import React, { FunctionComponent, useEffect, useState } from 'react';
import { SignInteractionStore } from '@owallet/stores-core';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStyle } from '../../styles';
import {
  useFeeConfig,
  useMemoConfig,
  useSenderConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useTxConfigsValidate,
  useZeroAllowedGasConfig
} from '@owallet/hooks';
import { unescapeHTML } from '@owallet/common';
import { CoinPretty, Dec, Int } from '@owallet/unit';
import { MsgGrant } from '@owallet/proto-types/cosmos/authz/v1beta1/tx';
import { defaultProtoCodec } from '@owallet/cosmos';
import { GenericAuthorization } from '@owallet/stores/build/query/cosmos/authz/types';
// import {BaseModalHeader} from '../../components/modal';
import { Column, Columns } from '../../components/column';
import { FlatList, Text } from 'react-native';
import { Gutter } from '../../components/gutter';
import { Box } from '../../components/box';
// import {FeeControl} from '../../components/input/fee-control';
import { XAxis } from '../../components/axis';
import { CloseIcon } from '../../components/icon';
import { GuideBox } from '../../components/guide-box';
import { handleCosmosPreSign } from './util/handle-cosmos-sign';
import { OWalletError } from '@owallet/router';
import { ErrModuleLedgerSign } from './util/ledger-types';
import { LedgerGuideBox } from '../../components/guide-box/ledger-guide-box';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FeeSummary } from './components/fee-summary';
import { HighFeeWarning } from './components/high-fee-warning';
import { defaultRegistry } from '@src/modals/sign/cosmos/message-registry';
import OWText from '@components/text/ow-text';
import { useLedgerBLE } from '@src/providers/ledger-ble';
import { registerModal } from '@src/modals/base';
import { MessageItem } from '@src/modals/sign/cosmos/message-item';
import { MemoInput } from '@components/input';
import CheckBox from 'react-native-check-box';
import { OWButton } from '@components/button';
import OWIcon from '@components/ow-icon/ow-icon';
import { FeeControl } from '@components/input/fee-control';
import WrapViewModal from '@src/modals/wrap/wrap-view-modal';
import { useTheme } from '@src/themes/theme-provider';

export const SignModal = registerModal(
  observer<{
    interactionData: NonNullable<SignInteractionStore['waitingData']>;
  }>(({ interactionData }) => {
    const { chainStore, signInteractionStore, queriesStore, priceStore } = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(false);

    const chainId = interactionData.data.chainId;
    const signer = interactionData.data.signer;

    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
    // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
    const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
    const amountConfig = useSignDocAmountConfig(chainStore, chainId, senderConfig);
    const feeConfig = useFeeConfig(chainStore, queriesStore, chainId, senderConfig, amountConfig, gasConfig);
    const memoConfig = useMemoConfig(chainStore, chainId);

    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    useEffect(() => {
      const data = interactionData.data;
      if (data.chainId !== data.signDocWrapper.chainId) {
        // Validate the requested chain id and the chain id in the sign doc are same.
        throw new Error('Chain id unmatched');
      }
      signDocHelper.setSignDocWrapper(data.signDocWrapper);
      gasConfig.setValue(data.signDocWrapper.gas);
      let memo = data.signDocWrapper.memo;
      if (data.signDocWrapper.mode === 'amino') {
        // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
        // For normal users, show the escaped characters with unescaped form.
        // Make sure that the actual sign doc's memo should be escaped.
        // In this logic, memo should be escaped from account store or background's request signing function.
        memo = unescapeHTML(memo);
      }
      memoConfig.setValue(memo);
      if (data.signOptions.preferNoSetFee || data.signDocWrapper.fees.length >= 2) {
        feeConfig.setFee(
          data.signDocWrapper.fees.map(fee => {
            const currency = chainStore.getChain(data.chainId).forceFindCurrency(fee.denom);
            return new CoinPretty(currency, new Int(fee.amount));
          })
        );
      }
      amountConfig.setDisableBalanceCheck(!!data.signOptions.disableBalanceCheck);
      feeConfig.setDisableBalanceCheck(!!data.signOptions.disableBalanceCheck);

      // We can't check the fee balance if the payer is not the signer.
      if (data.signDocWrapper.payer && data.signDocWrapper.payer !== data.signer) {
        feeConfig.setDisableBalanceCheck(true);
      }
      // We can't check the fee balance if the granter is not the signer.
      if (data.signDocWrapper.granter && data.signDocWrapper.granter !== data.signer) {
        feeConfig.setDisableBalanceCheck(true);
      }
    }, [amountConfig, chainStore, feeConfig, gasConfig, interactionData.data, memoConfig, signDocHelper]);

    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === 'amino'
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];
    const [isSendAuthzGrant, setIsSendAuthzGrant] = useState(false);
    useEffect(() => {
      try {
        if (
          interactionData.data.origin === 'https://liker.land' ||
          interactionData.data.origin === 'https://app.like.co'
        ) {
          return;
        }

        const msgs = signDocHelper.signDocWrapper
          ? signDocHelper.signDocWrapper.mode === 'amino'
            ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
            : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
          : [];

        for (const msg of msgs) {
          const anyMsg = msg as any;
          if (anyMsg.type == null && anyMsg.grant && anyMsg.grant.authorization) {
            // cosmos-sdk has bug that amino codec is not applied to authorization properly.
            // This is the workaround for this bug.
            if (anyMsg.grant.authorization.msg) {
              const innerType = anyMsg.grant.authorization.msg;
              if (
                innerType === '/cosmos.bank.v1beta1.MsgSend' ||
                innerType === '/cosmos.bank.v1beta1.MsgMultiSend' ||
                innerType === '/ibc.applications.transfer.v1.MsgTransfer' ||
                innerType === '/cosmos.authz.v1beta1.MsgGrant' ||
                innerType === '/cosmos.staking.v1beta1.MsgTokenizeShares' ||
                innerType === '/cosmos.staking.v1beta1.MsgEnableTokenizeShares'
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            } else if (anyMsg.grant.authorization.spend_limit) {
              setIsSendAuthzGrant(true);
              return;
            }
          } else if ('type' in msg) {
            if (msg.type === 'cosmos-sdk/MsgGrant') {
              if (msg.value.grant.authorization.type === 'cosmos-sdk/GenericAuthorization') {
                const innerType = msg.value.grant.authorization.value.msg;
                if (
                  innerType === '/cosmos.bank.v1beta1.MsgSend' ||
                  innerType === '/cosmos.bank.v1beta1.MsgMultiSend' ||
                  innerType === '/ibc.applications.transfer.v1.MsgTransfer' ||
                  innerType === '/cosmos.authz.v1beta1.MsgGrant' ||
                  innerType === '/cosmos.staking.v1beta1.MsgTokenizeShares' ||
                  innerType === '/cosmos.staking.v1beta1.MsgEnableTokenizeShares'
                ) {
                  setIsSendAuthzGrant(true);
                  return;
                }
              } else if (msg.value.grant.authorization.type === 'cosmos-sdk/SendAuthorization') {
                setIsSendAuthzGrant(true);
                return;
              }
            }
          } else if ('unpacked' in msg) {
            if (msg.typeUrl === '/cosmos.authz.v1beta1.MsgGrant') {
              const grantMsg = msg.unpacked as MsgGrant;
              if (grantMsg.grant && grantMsg.grant.authorization) {
                if (grantMsg.grant.authorization.typeUrl === '/cosmos.authz.v1beta1.GenericAuthorization') {
                  const factory = defaultProtoCodec.unpackAnyFactory(grantMsg.grant.authorization.typeUrl);
                  if (factory) {
                    const genericAuth = factory.decode(grantMsg.grant.authorization.value) as GenericAuthorization;

                    if (
                      genericAuth.msg === '/cosmos.bank.v1beta1.MsgSend' ||
                      genericAuth.msg === '/cosmos.bank.v1beta1.MsgMultiSend' ||
                      genericAuth.msg === '/ibc.applications.transfer.v1.MsgTransfer' ||
                      genericAuth.msg === '/cosmos.authz.v1beta1.MsgGrant' ||
                      genericAuth.msg === '/cosmos.staking.v1beta1.MsgTokenizeShares' ||
                      genericAuth.msg === '/cosmos.staking.v1beta1.MsgEnableTokenizeShares'
                    ) {
                      setIsSendAuthzGrant(true);
                      return;
                    }
                  }
                } else if (grantMsg.grant.authorization.typeUrl === '/cosmos.bank.v1beta1.SendAuthorization') {
                  setIsSendAuthzGrant(true);
                  return;
                }
              }
            }
          }
        }
      } catch (e) {
        console.log('Failed to check during authz grant send check', e);
      }

      setIsSendAuthzGrant(false);
    }, [interactionData.data.origin, signDocHelper.signDocWrapper]);
    const [isSendAuthzGrantChecked, setIsSendAuthzGrantChecked] = useState(false);

    const txConfigsValidate = useTxConfigsValidate({
      senderConfig,
      gasConfig,
      amountConfig,
      feeConfig,
      memoConfig
    });

    const preferNoSetFee = (() => {
      if (interactionData.data.signDocWrapper.fees.length >= 2) {
        return true;
      }

      return interactionData.data.signOptions.preferNoSetFee;
    })();

    const preferNoSetMemo = interactionData.data.signOptions.preferNoSetMemo;

    const isLedgerAndDirect = interactionData.data.keyType === 'ledger' && interactionData.data.mode === 'direct';

    const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
    const [ledgerInteractingError, setLedgerInteractingError] = useState<Error | undefined>(undefined);

    const isHighFee = (() => {
      if (feeConfig.fees) {
        let sumPrice = new Dec(0);
        for (const fee of feeConfig.fees) {
          const currency = chainStore.getChain(chainId).findCurrency(fee.currency.coinMinimalDenom);
          if (currency && currency.coinGeckoId) {
            const price = priceStore.calculatePrice(new CoinPretty(currency, fee.toCoin().amount), 'usd');
            if (price) {
              sumPrice = sumPrice.add(price.toDec());
            }
          }
        }
        return sumPrice.gte(new Dec(5));
      }
      return false;
    })();

    const [isHighFeeApproved, setIsHighFeeApproved] = useState(false);

    const buttonDisabled =
      txConfigsValidate.interactionBlocked ||
      !signDocHelper.signDocWrapper ||
      isLedgerAndDirect ||
      (isSendAuthzGrant && !isSendAuthzGrantChecked) ||
      (isHighFee && !isHighFeeApproved);

    const ledgerBLE = useLedgerBLE();

    const approve = async () => {
      if (signDocHelper.signDocWrapper) {
        if (interactionData.data.keyType === 'ledger') {
          setIsLedgerInteracting(true);
          setLedgerInteractingError(undefined);
        }

        try {
          const signature = await handleCosmosPreSign(
            ledgerBLE.getTransport,
            interactionData,
            signDocHelper.signDocWrapper
          );

          await signInteractionStore.approveWithProceedNext(
            interactionData.id,
            signDocHelper.signDocWrapper,
            signature,
            () => {
              // noop
            },
            {
              preDelay: 200
            }
          );
        } catch (e) {
          console.log(e);

          if (e instanceof OWalletError) {
            if (e.module === ErrModuleLedgerSign) {
              setLedgerInteractingError(e);
            } else {
              setLedgerInteractingError(undefined);
            }
          } else {
            setLedgerInteractingError(undefined);
          }
        } finally {
          setIsLedgerInteracting(false);
        }
      }
    };
    const { colors } = useTheme();
    return (
      <WrapViewModal title={intl.formatMessage({ id: 'page.sign.cosmos.tx.title' })}>
        <Box style={style.flatten(['padding-12', 'padding-top-0'])}>
          <Gutter size={24} />

          <Columns sum={1} alignY="center">
            <OWText
              style={{
                ...style.flatten(['h5']),
                color: colors['neutral-text-body']
              }}
            >
              {msgs.length}
            </OWText>

            <Gutter size={4} />

            <OWText
              style={{
                ...style.flatten(['h5']),
                color: colors['neutral-text-body']
              }}
            >
              <FormattedMessage id="page.sign.cosmos.tx.messages" />
            </OWText>

            <Column weight={1} />

            <ViewDataButton isViewData={isViewData} setIsViewData={setIsViewData} />
          </Columns>

          <Gutter size={8} />

          {isViewData ? (
            <Box maxHeight={128} backgroundColor={colors['neutral-surface-bg']} padding={12} borderRadius={6}>
              <ScrollView persistentScrollbar={true}>
                <OWText style={style.flatten(['body3'])}>{JSON.stringify(signDocHelper.signDocJson, null, 2)}</OWText>
              </ScrollView>
            </Box>
          ) : (
            <Box maxHeight={240} backgroundColor={colors['neutral-surface-bg']} borderRadius={6}>
              <FlatList
                // isGestureFlatList={true}
                data={[...msgs]}
                renderItem={({ item, index }) => {
                  const r = defaultRegistry.render(
                    chainId,

                    defaultProtoCodec,
                    item
                  );

                  return <MessageItem key={index} icon={r.icon} title={r.title} content={r.content} />;
                }}
                ItemSeparatorComponent={Divider}
              />
            </Box>
          )}

          <Gutter size={12} />

          {preferNoSetMemo ? (
            <ReadonlyMemo memo={memoConfig.memo} />
          ) : (
            <MemoInput label={'Memo'} isBottomSheet={true} memoConfig={memoConfig} />
          )}

          {/*<Gutter size={60} />*/}
          {(() => {
            if (interactionData.isInternal && preferNoSetFee) {
              return <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />;
            }

            return (
              <FeeControl
                feeConfig={feeConfig}
                senderConfig={senderConfig}
                gasConfig={gasConfig}
                disableAutomaticFeeSet={preferNoSetFee}
              />
              // <></>
            );
          })()}

          <Gutter size={12} />

          {isHighFee ? (
            <React.Fragment>
              <HighFeeWarning checked={isHighFeeApproved} onChange={v => setIsHighFeeApproved(v)} />

              <Gutter size={12} />
            </React.Fragment>
          ) : null}

          {isSendAuthzGrant ? (
            <React.Fragment>
              <GuideBox
                color="warning"
                title={intl.formatMessage({
                  id: 'page.sign.cosmos.tx.authz-send-grant.warning-title'
                })}
                titleRight={
                  <Box>
                    <CheckBox
                      isChecked={isSendAuthzGrantChecked}
                      onClick={checked => {
                        setIsSendAuthzGrantChecked(!isSendAuthzGrantChecked);
                      }}
                    />
                  </Box>
                }
              />

              <Gutter size={12} />
            </React.Fragment>
          ) : null}

          {isLedgerAndDirect ? (
            <React.Fragment>
              <GuideBox
                color="warning"
                title={intl.formatMessage({
                  id: 'page.sign.cosmos.tx.warning-title'
                })}
                paragraph={intl.formatMessage({
                  id: 'page.sign.cosmos.tx.warning-paragraph'
                })}
              />

              <Gutter size={12} />
            </React.Fragment>
          ) : null}

          {ledgerInteractingError ? (
            <React.Fragment>
              <LedgerGuideBox
                data={{
                  keyInsensitive: interactionData.data.keyInsensitive,
                  isEthereum: 'eip712' in interactionData.data && interactionData.data.eip712 != null
                }}
                isLedgerInteracting={isLedgerInteracting}
                ledgerInteractingError={ledgerInteractingError}
              />

              <Gutter size={12} />
            </React.Fragment>
          ) : null}

          <XAxis>
            <OWButton
              size="large"
              label={intl.formatMessage({ id: 'button.reject' })}
              type="secondary"
              disabled={signInteractionStore.isObsoleteInteraction(interactionData.id) || isLedgerInteracting}
              style={{ flex: 1, width: '100%' }}
              onPress={async () => {
                await signInteractionStore.rejectWithProceedNext(interactionData.id, () => {});
              }}
            />

            <Gutter size={16} />

            <OWButton
              type={'primary'}
              size="large"
              loading={signInteractionStore.isObsoleteInteraction(interactionData.id) || isLedgerInteracting}
              disabled={buttonDisabled}
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

const Divider = () => {
  const style = useStyle();
  const { colors } = useTheme();
  return <Box height={1} marginX={12} backgroundColor={colors['neutral-border-default']} />;
};

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
        <OWText style={style.flatten(['text-button2'])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </OWText>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={'red'} />
        ) : (
          // <CodeBracketIcon
          //     size={12}
          //     color={style.get('color-gray-100').color}
          // />
          <OWIcon name={'tdesignbrackets'} size={12} color={'red'} />
        )}
      </XAxis>
    </TouchableWithoutFeedback>
  );
};

export const ReadonlyMemo: FunctionComponent<{
  memo: string;
}> = ({ memo }) => {
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <Box
      // backgroundColor={style.get("color-gray-500").color}
      backgroundColor={colors['neutral-surface-bg']}
      borderRadius={6}
      padding={16}
    >
      <XAxis alignY="center">
        <OWText style={style.flatten(['subtitle3'])}>Memo</OWText>
        <OWText
          style={{
            flex: 1,
            color: colors['neutral-text-body'],
            textAlign: 'right'
          }}
        >
          {memo || <FormattedMessage id="page.sign.cosmos.tx.readonly-memo.empty" />}
        </OWText>
      </XAxis>
    </Box>
  );
};

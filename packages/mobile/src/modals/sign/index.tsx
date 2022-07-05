import React, { FunctionComponent, useEffect, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import { ScrollView, View } from 'react-native';
import { CText as Text } from '../../components/text';
import { useStyle } from '../../styles';
import { useStore } from '../../stores';
import { AmountInput, MemoInput } from '../../components/input';
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper
} from '@owallet/hooks';
import { Button } from '../../components/button';
import { Msg as AminoMsg } from '@cosmjs/launchpad';
import { Msg } from './msg';
import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';
import { FeeInSign } from './fee';
import { renderAminoMessage } from './amino';
import { renderDirectMessage } from './direct';
import { colors, spacing } from '../../themes';

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, accountStore, queriesStore, signInteractionStore } =
      useStore();
    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const style = useStyle();

    const [signer, setSigner] = useState('');

    const [chainId, setChainId] = useState(chainStore.current.chainId);

    // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
    const gasConfig = useGasConfig(chainStore, chainId, 1);
    const amountConfig = useSignDocAmountConfig(
      chainStore,
      chainId,
      accountStore.getAccount(chainId).msgOpts
    );
    const feeConfig = useFeeConfig(
      chainStore,
      chainId,
      signer,
      queriesStore.get(chainId).queryBalances,
      amountConfig,
      gasConfig
    );
    console.log(
      'feeConfig',
      feeConfig.fee?.toCoin().amount,
      amountConfig.amount
    );
    const memoConfig = useMemoConfig(chainStore, chainId);

    const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;
    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
      if (signInteractionStore.waitingData) {
        const data = signInteractionStore.waitingData;
        setIsInternal(data.isInternal);
        signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
        setChainId(data.data.signDocWrapper.chainId);
        gasConfig.setGas(data.data.signDocWrapper.gas);
        memoConfig.setMemo(data.data.signDocWrapper.memo);
        if (
          data.data.signOptions.preferNoSetFee &&
          data.data.signDocWrapper.fees[0]
        ) {
          feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
        } else {
          feeConfig.setFeeType('average');
        }
        setSigner(data.data.signer);
      }

      if (signInteractionStore.waitingEthereumData) {
        const data = signInteractionStore.waitingEthereumData;
      }
    }, [
      feeConfig,
      gasConfig,
      memoConfig,
      signDocHelper,
      signInteractionStore.waitingData
    ]);

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : 'none';
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === 'amino'
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];
    const isDisable =
      signDocWapper == null ||
      signDocHelper.signDocWrapper == null ||
      memoConfig.getError() != null ||
      feeConfig.getError() != null;

    const renderedMsgs = (() => {
      if (mode === 'amino') {
        return (msgs as readonly AminoMsg[]).map((msg, i) => {
          const account = accountStore.getAccount(chainId);
          const chainInfo = chainStore.getChain(chainId);
          const { title, content, scrollViewHorizontal } = renderAminoMessage(
            account.msgOpts,
            msg,
            chainInfo.currencies
          );

          return (
            <View key={i.toString()}>
              {/* <Msg title={title}> */}
              {scrollViewHorizontal ? (
                <ScrollView horizontal={true}>
                  <Text
                    style={style.flatten(['body3', 'color-text-black-low'])}
                  >
                    {content}
                  </Text>
                </ScrollView>
              ) : (
                <Text style={style.flatten(['body3', 'color-text-black-low'])}>
                  {content}
                </Text>
              )}
              {/* </Msg> */}
              {/* {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    'height-1',
                    'background-color-border-white',
                    'margin-x-16'
                  ])}
                />
              ) : null} */}
            </View>
          );
        });
      } else if (mode === 'direct') {
        return (msgs as any[]).map((msg, i) => {
          const chainInfo = chainStore.getChain(chainId);
          const { title, content } = renderDirectMessage(
            msg,
            chainInfo.currencies
          );

          return (
            <View key={i.toString()}>
              {content}
              {/* <Msg title={title}> */}
              {/* <Text style={style.flatten(['body3', 'color-text-black-low'])}> */}
              {/* </Text> */}
              {/* </Msg> */}
              {/* {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    'height-1',
                    'background-color-border-white',
                    'margin-x-16'
                  ])}
                />
              ) : null} */}
            </View>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <CardModal title="Confirm Transaction">
        <View style={style.flatten(['margin-bottom-16'])}>
          {/* <Text style={style.flatten(['margin-bottom-3'])}>
            <Text style={style.flatten(['subtitle3', 'color-primary'])}>
              {`${msgs.length.toString()} `}
            </Text>
            <Text
              style={style.flatten(['subtitle3', 'color-text-black-medium'])}
            >
              Messages
            </Text>
          </Text> */}
          <View
            style={style.flatten([
              'border-radius-8',
              'border-color-border-white'
              // 'overflow-hidden'
            ])}
          >
            <View
            // style={style.flatten(['max-height-214'])}
            // persistentScrollbar={true}
            >
              {renderedMsgs}
            </View>
          </View>
        </View>
        {/* <MemoInput label="To" memoConfig={memoConfig} /> */}
        <FeeInSign
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          signOptions={signInteractionStore.waitingData?.data.signOptions}
          isInternal={isInternal}
        />
        <Button
          text="Approve"
          style={{
            backgroundColor: isDisable
              ? colors['gray-400']
              : colors['purple-900']
          }}
          textStyle={{
            color: isDisable ? colors['gray-400'] : colors['white']
          }}
          size="large"
          disabled={isDisable}
          loading={signInteractionStore.isLoading}
          onPress={async () => {
            console.log('on press sign');
            try {
              if (signDocHelper.signDocWrapper) {
                await signInteractionStore.approveAndWaitEnd(
                  signDocHelper.signDocWrapper
                );
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />

        <View style={{ height: 8 }} />
        <Button
          text="Reject"
          size="large"
          style={{
            backgroundColor: colors['disabled']
          }}
          textStyle={{
            color: colors['red-500']
          }}
          loading={signInteractionStore.isLoading}
          onPress={() => {
            console.log('on press sign');
            try {
              if (signDocHelper.signDocWrapper) {
                //
                signInteractionStore.reject();
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true
  }
);

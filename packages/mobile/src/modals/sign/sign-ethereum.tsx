import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import { Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useStyle } from '../../styles';
import { useStore } from '../../stores';
import Web3 from 'web3';
import { Button } from '../../components/button';
import Big from 'big.js';
import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';
import ERC20_ABI from './erc20.json';
import { ScrollView } from 'react-native-gesture-handler';
import { TextInput } from '../../components/input';
import { useFeeEthereumConfig, useGasEthereumConfig } from '@owallet/hooks';
import { FeeEthereumInSign } from './fee-ethereum';
import { navigationRef } from '../../router/root';
import axios from 'axios';
import { colors } from '../../themes';
import { BottomSheetProps } from '@gorhom/bottom-sheet';
const keyboardVerticalOffset = Platform.OS === 'ios' ? 130 : 0;

export const SignEthereumModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, 'snapPoints' | 'children'>;
}> = registerModal(
  observer(({}) => {
    const { chainStore, signInteractionStore, accountStore, sendStore, appInitStore } = useStore();
    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const chainId = chainStore?.current?.chainId;
    const scheme = appInitStore.getInitApp.theme;

    const account = accountStore.getAccount(chainId);

    const current = chainStore.current;
    // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
    const [dataSign, setDataSign] = useState(null);
    const [gasPrice, setGasPrice] = useState('0');
    const gasConfig = useGasEthereumConfig(
      chainStore,
      current.chainId,
      parseInt(dataSign?.data?.data?.data?.estimatedGasLimit, 16)
    );
    const feeConfig = useFeeEthereumConfig(chainStore, current.chainId);
    const decimals = useRef(chainStore.current.feeCurrencies[0].coinDecimals);

    useEffect(() => {
      const getGasPrice = async () => {
        const response = await axios.post(chainStore.current.rest, {
          jsonrpc: '2.0',
          id: 'eth_gasPrice',
          method: 'eth_gasPrice',
          params: []
        });

        setGasPrice(
          new Big(parseInt(response.data.result, 16)).div(new Big(10).pow(decimals.current)).toFixed(decimals.current)
        );
      };
      getGasPrice();
    }, []);

    useEffect(() => {
      const estimateGas = async () => {
        try {
          if (dataSign) {
            decimals.current = dataSign?.data?.data?.data?.decimals;
            let chainIdSign = dataSign?.data?.chainId;
            if (!chainIdSign?.toString()?.startsWith('0x')) chainIdSign = '0x' + Number(chainIdSign).toString(16);
            chainStore.selectChain(chainIdSign);
          }
          if (gasPrice !== '' && sendStore.sendObj) {
            // @ts-ignore
            const web3 = new Web3(chainStore.current.rest);
            const tokenInfo = new web3.eth.Contract(ERC20_ABI as any, sendStore.sendObj?.contract_addr);

            const estimate = await tokenInfo.methods
              .transfer(
                sendStore.sendObj?.recipient,
                '0x' +
                  parseFloat(
                    new Big(sendStore.sendObj?.amount).mul(new Big(10).pow(decimals.current)).toString()
                  ).toString(16)
              )
              .estimateGas({
                from: sendStore.sendObj?.from
              });
            gasConfig.setGas(estimate);
            feeConfig.setFee(new Big(estimate).mul(gasPrice).toFixed(decimals.current));
          } else {
            decimals.current = dataSign?.data?.data?.data?.decimals;
            let chainIdSign = dataSign?.data?.chainId;
            if (!chainIdSign?.toString()?.startsWith('0x')) chainIdSign = '0x' + Number(chainIdSign).toString(16);
            chainStore.selectChain(chainIdSign);

            const estimatedGasLimit = parseInt(dataSign?.data?.data?.data?.estimatedGasLimit, 16);
            const estimatedGasPrice = new Big(parseInt(dataSign?.data?.data?.data?.estimatedGasPrice, 16))
              .div(new Big(10).pow(decimals.current))
              .toFixed(decimals.current);

            if (!isNaN(estimatedGasLimit) && estimatedGasPrice !== 'NaN') {
              setGasPrice(estimatedGasPrice);
              gasConfig.setGas(estimatedGasLimit);
              feeConfig.setFee(new Big(estimatedGasLimit).mul(estimatedGasPrice).toFixed(decimals.current));
            }
          }
        } catch (error) {
          gasConfig.setGas(80000);
          feeConfig.setFee(new Big(80000).mul(new Big(gasPrice)).toFixed(decimals.current));
        }
      };
      estimateGas();
    }, [gasPrice, dataSign]);

    useEffect(() => {
      if (signInteractionStore.waitingEthereumData) {
        setDataSign(signInteractionStore.waitingEthereumData);
      }
    }, [signInteractionStore.waitingEthereumData]);

    const [memo, setMemo] = useState<string>('');

    const style = useStyle();

    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <CardModal title="Confirm Transaction">
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={keyboardVerticalOffset}>
          <View style={style.flatten(['margin-bottom-16'])}>
            <Text style={style.flatten(['margin-bottom-3'])}>
              <Text style={style.flatten(['subtitle3', 'color-primary'])}>{`1 `}</Text>
              <Text style={style.flatten(['subtitle3', 'color-text-black-medium'])}>Message</Text>
            </Text>
            <View
              style={style.flatten([
                'border-radius-8',
                'border-width-1',
                'border-color-border-white',
                'overflow-hidden'
              ])}
            >
              <ScrollView style={style.flatten(['max-height-214'])} persistentScrollbar={true}>
                <Text
                  style={{
                    color: colors['sub-text']
                  }}
                >
                  {JSON.stringify(dataSign, null, 2)}
                </Text>
              </ScrollView>
            </View>
          </View>
          <TextInput
            label="Memo"
            onChangeText={txt => {
              setMemo(txt);
            }}
            defaultValue={''}
          />

          <FeeEthereumInSign
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            gasPrice={gasPrice}
            decimals={decimals.current}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly'
            }}
          >
            <Button
              text="Reject"
              size="large"
              containerStyle={{
                width: '40%'
              }}
              style={{
                backgroundColor: colors['red-500']
              }}
              textStyle={{
                color: colors['white']
              }}
              underlayColor={colors['danger-400']}
              loading={signInteractionStore.isLoading}
              disabled={signInteractionStore.isLoading}
              onPress={_onPressReject}
            />
            <Button
              text="Approve"
              size="large"
              disabled={signInteractionStore.isLoading}
              containerStyle={{
                width: '40%'
              }}
              textStyle={{
                color: colors['white']
              }}
              style={{
                backgroundColor: signInteractionStore.isLoading ? colors['gray-400'] : colors['primary-surface-default']
              }}
              loading={signInteractionStore.isLoading}
              onPress={async () => {
                try {
                  const gasPrice =
                    '0x' +
                    parseInt(
                      new Big(parseFloat(feeConfig.feeRaw))
                        .mul(new Big(10).pow(decimals.current))
                        .div(parseFloat(gasConfig.gasRaw))
                        .toFixed(decimals.current)
                    ).toString(16);

                  await signInteractionStore.approveEthereumAndWaitEnd({
                    gasPrice: gasPrice,
                    gasLimit: `0x${parseFloat(gasConfig.gasRaw).toString(16)}`,
                    memo
                  });
                  if (navigationRef.current.getCurrentRoute().name === 'Send') {
                    navigationRef.current.navigate('TxSuccessResult', {});
                  }
                } catch (error) {
                  signInteractionStore.rejectAll();
                  console.log('error approveEthereumAndWaitEnd', error);
                }
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true
  }
);

import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import { Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useStyle } from '../../styles';
import { useStore } from '../../stores';
import { Button, OWButton } from '../../components/button';
import { colors, typography } from '../../themes';

import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';
import { BottomSheetProps } from '@gorhom/bottom-sheet';
import { navigationRef } from '../../router/root';
import { SCREENS } from '@src/common/constants';
import { formatBalance } from '@owallet/bitcoin';

const keyboardVerticalOffset = Platform.OS === 'ios' ? 130 : 0;

export const SignBitcoinModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, 'snapPoints' | 'children'>;
}> = registerModal(
  observer(() => {
    const { chainStore, signInteractionStore } = useStore();

    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const [dataSign, setDataSign] = useState(null);

    useEffect(() => {
      if (signInteractionStore.waitingBitcoinData) {
        setDataSign(signInteractionStore.waitingBitcoinData);
      }
    }, []);

    const style = useStyle();

    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <CardModal>
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 8,
              alignItems: 'center'
            }}
          >
            <Text style={style.flatten(['subtitle3', 'color-text-black-medium'])}>Amount</Text>
            <Text
              style={{
                ...style.flatten(['subtitle2']),
                color: colors['primary-surface-default']
              }}
            >
              {formatBalance({
                balance: Number(dataSign?.data?.data?.msgs?.amount),
                cryptoUnit: 'BTC',
                coin: chainStore.current.chainId
              }) || '0 BTC'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 16,
              alignItems: 'center'
            }}
          >
            <Text style={style.flatten(['subtitle3', 'color-text-black-medium'])}>Fee</Text>
            <Text
              style={{
                ...style.flatten(['subtitle2']),
                color: colors['primary-surface-default']
              }}
            >
              {formatBalance({
                balance: Number(dataSign?.data?.data?.msgs?.totalFee),
                cryptoUnit: 'BTC',
                coin: chainStore.current.chainId
              }) || '0 BTC'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly'
            }}
          >
            <OWButton
              label="Reject"
              size="large"
              type="danger"
              style={{
                width: '40%'
              }}
              textStyle={{
                color: colors['white']
              }}
              disabled={signInteractionStore.isLoading}
              onPress={_onPressReject}
            />
            <OWButton
              label="Approve"
              size="large"
              style={{
                width: '40%'
              }}
              disabled={signInteractionStore.isLoading}
              loading={signInteractionStore.isLoading}
              onPress={async () => {
                try {
                  await signInteractionStore.approveBitcoinAndWaitEnd();
                } catch (error) {
                  signInteractionStore.rejectAll();
                  console.log('error approveBitcoinAndWaitEnd', error);
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

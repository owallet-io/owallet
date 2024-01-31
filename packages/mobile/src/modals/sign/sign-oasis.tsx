import React, { FunctionComponent, useEffect, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import { Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useStyle } from '../../styles';
import { useStore } from '../../stores';
import { Button } from '../../components/button';
import { colors } from '../../themes';
import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';
import { BottomSheetProps } from '@gorhom/bottom-sheet';
import { showToast } from '@src/utils/helper';

const keyboardVerticalOffset = Platform.OS === 'ios' ? 130 : 0;

export const SignOasisModal: FunctionComponent<{
  isOpen?: boolean;
  close: () => void;
  onSuccess: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, 'snapPoints' | 'children'>;
  data: object;
}> = registerModal(
  observer(({ data, close, onSuccess }) => {
    const { signInteractionStore } = useStore();

    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const [dataSign, setDataSign] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (data) {
        setDataSign(data);
      }
    }, [data]);

    const style = useStyle();

    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
        close();
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
              <Text style={style.flatten(['subtitle3', 'color-text-black-medium'])}>Message:</Text>
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
              loading={signInteractionStore.isLoading || loading}
              disabled={signInteractionStore.isLoading || loading}
              onPress={_onPressReject}
            />
            <Button
              text="Approve"
              size="large"
              disabled={signInteractionStore.isLoading || loading}
              containerStyle={{
                width: '40%'
              }}
              textStyle={{
                color: colors['white']
              }}
              style={{
                backgroundColor: signInteractionStore.isLoading ? colors['gray-400'] : colors['purple-900']
              }}
              loading={signInteractionStore.isLoading || loading}
              onPress={async () => {
                setLoading(true);
                try {
                  //@ts-ignore
                  const tx = await window.oasis.signOasis(dataSign.amount, dataSign.address);
                  setLoading(false);
                  close();
                  onSuccess();
                } catch (error) {
                  signInteractionStore.rejectAll();
                  close();
                  showToast({
                    message: error?.message ?? 'Something went wrong! Please try again later.',
                    type: 'danger'
                  });
                  console.log('error tx builder Oasis', error);
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

import React, { FunctionComponent } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableNativeFeedback,
  View
} from 'react-native';
import { useStyle } from '../../styles';
import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';
import { useStore } from '../../stores';

export const HomeBaseModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(({ children }) => {
    const style = useStyle();
    const { modalStore } = useStore();
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

    return (
      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <CardModal title={''}>
          <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
            <View style={style.flatten(['margin-bottom-16'])}>
              {children}
              {modalStore.getChildren()}
            </View>
          </TouchableNativeFeedback>
        </CardModal>
      </KeyboardAvoidingView>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true
  }
);

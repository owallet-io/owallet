import React, { FunctionComponent, useEffect, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import { View } from 'react-native';
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

    return (
      <CardModal title={''}>
        <View style={style.flatten(['margin-bottom-16'])}>
          {children}
          {modalStore.getChildren()}
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true,
  }
);

import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SettingItem } from '../components';
import { useStyle } from '../../../styles';
import { PasswordInputModal } from '../../../modals/password-input/modal';
import { useStore } from '../../../stores';
import { useNavigation, useTheme } from '@react-navigation/native';

export const SettingRemoveAccountItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keychainStore, keyRingStore, analyticsStore } = useStore();

  const { colors } = useTheme();
  const style = useStyle();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <SettingItem
        label="Remove current wallet"
        onPress={() => {
          setIsOpenModal(true);
        }}
        containerStyle={style.flatten(['margin-top-16'])}
        labelStyle={style.flatten(['subtitle1', 'color-danger'])}
        // style={style.flatten(["justify-center"])}
        topBorder={topBorder}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title="Remove wallet"
        labelStyle={{ color: colors['orange-800'], fontWeight: '700' }}
        paragraph="Please make sure you have saved the correct mnemonic before logging out"
        textButtonRight="Remove"
        buttonRightStyle={{ backgroundColor: colors['orange-800'] }}
        onEnterPassword={async password => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            keyStore => keyStore.selected
          );

          if (index >= 0) {
            await keyRingStore.deleteKeyRing(index, password);
            analyticsStore.logEvent('Account removed');

            if (keyRingStore.multiKeyStoreInfo.length === 0) {
              await keychainStore.reset();

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Unlock'
                  }
                ]
              });
            }
          }
        }}
      />
    </React.Fragment>
  );
});

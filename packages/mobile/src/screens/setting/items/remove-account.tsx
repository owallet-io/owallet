import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SettingItem } from '../components';
import { useStyle } from '../../../styles';
import { PasswordInputModal } from '../../../modals/password-input/modal';
import { useStore } from '../../../stores';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../../common/api';
import CodePush from 'react-native-code-push';

export const SettingRemoveAccountItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const {
    keychainStore,
    keyRingStore,
    analyticsStore,
    chainStore,
    accountStore
  } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const style = useStyle();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const onUnSubscribeToTopic = React.useCallback(async () => {
    const fcmToken = await AsyncStorage.getItem('FCM_TOKEN');

    if (fcmToken) {
      const unsubcriber = await API.unsubcribeTopic(
        {
          subcriber: fcmToken,
          topic:
            chainStore.current.networkType === 'cosmos'
              ? account.bech32Address.toString()
              : account.evmosHexAddress.toString()
        },
        {
          baseURL: 'https://tracking-tx.orai.io'
        }
      );
      console.log('un-subcriber ===', unsubcriber);
    }
  }, []);

  return (
    <React.Fragment>
      <SettingItem
        label="Check for Update"
        onPress={() => {
          CodePush.checkForUpdate().then(update => {
            if (!update) {
              console.log('The app is up to date!');
              alert('The app is up to date!');
            } else {
              console.log('An update is available! Should we download it?');
              alert(
                'Getting a new update...Please keep this screen on until completion. '
              );
              CodePush.sync(
                {
                  installMode: CodePush.InstallMode.IMMEDIATE
                },
                status => {
                  switch (status) {
                    case CodePush.SyncStatus.UP_TO_DATE:
                      console.log('UP_TO_DATE');
                      // Show "downloading" modal
                      // modal.open();
                      break;
                    case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                      console.log('DOWNLOADING_PACKAGE');
                      // Show "downloading" modal
                      // modal.open();
                      break;
                    case CodePush.SyncStatus.INSTALLING_UPDATE:
                      console.log('INSTALLING_UPDATE');
                      // show installing
                      break;
                    case CodePush.SyncStatus.UPDATE_INSTALLED:
                      console.log('UPDATE_INSTALLED');

                      // Hide loading modal
                      break;
                  }
                },
                ({ receivedBytes, totalBytes }) => {
                  /* Update download modal progress */
                }
              );
            }
          });
        }}
        containerStyle={style.flatten(['margin-top-16'])}
        labelStyle={style.flatten(['subtitle1', 'color-button-primary'])}
        // style={style.flatten(["justify-center"])}
        topBorder={topBorder}
      />
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
            await onUnSubscribeToTopic();
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

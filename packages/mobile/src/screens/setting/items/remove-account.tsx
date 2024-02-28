import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { SettingItem } from "../components";
import { useStyle } from "../../../styles";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../../common/api";
import CodePush from "react-native-code-push";
import { useTheme } from "@src/themes/theme-provider";
export const SettingRemoveAccountItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const {
    keychainStore,
    keyRingStore,
    analyticsStore,
    chainStore,
    accountStore,
  } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const { colors } = useTheme();
  const style = useStyle();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const onUnSubscribeToTopic = React.useCallback(async () => {
    const fcmToken = await AsyncStorage.getItem("FCM_TOKEN");

    if (fcmToken) {
      const unsubcriber = await API.unsubcribeTopic(
        {
          subcriber: fcmToken,
          topic:
            chainStore.current.networkType === "cosmos"
              ? account.bech32Address.toString()
              : account.evmosHexAddress.toString(),
        },
        {
          baseURL: "https://tracking-tx.orai.io",
        }
      );
    }
  }, []);

  return (
    <React.Fragment>
      <SettingItem
        label="Check for Update"
        onPress={() => {
          CodePush.checkForUpdate().then((update) => {
            if (!update) {
              alert("The app is up to date!");
            } else {
              alert(
                "Getting a new update...Please keep this screen on until completion. "
              );
              CodePush.sync(
                {
                  installMode: CodePush.InstallMode.IMMEDIATE,
                },
                (status) => {
                  switch (status) {
                    case CodePush.SyncStatus.UP_TO_DATE:
                      // Show "downloading" modal
                      // modal.open();
                      break;
                    case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                      // Show "downloading" modal
                      // modal.open();
                      break;
                    case CodePush.SyncStatus.INSTALLING_UPDATE:
                      // show installing
                      break;
                    case CodePush.SyncStatus.UPDATE_INSTALLED:
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
        containerStyle={style.flatten(["margin-top-16"])}
        labelStyle={style.flatten(["subtitle1", "color-button-primary"])}
        // style={style.flatten(["justify-center"])}
        topBorder={topBorder}
      />
      <SettingItem
        label="Remove current wallet"
        onPress={() => {
          setIsOpenModal(true);
        }}
        containerStyle={style.flatten(["margin-top-16"])}
        labelStyle={style.flatten(["subtitle1", "color-danger"])}
        // style={style.flatten(["justify-center"])}
        topBorder={topBorder}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title="Remove wallet"
        labelStyle={{ color: colors["orange-800"], fontWeight: "700" }}
        paragraph="Please make sure you have saved the correct mnemonic before logging out"
        textButtonRight="Remove"
        onEnterPassword={async (password) => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            (keyStore) => keyStore.selected
          );

          if (index >= 0) {
            await keyRingStore.deleteKeyRing(index, password);
            // await onUnSubscribeToTopic();
            analyticsStore.logEvent("Account removed");

            if (!keyRingStore.multiKeyStoreInfo.length) {
              await keychainStore.reset();

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Unlock",
                  },
                ],
              });
            }
          }
        }}
      />
    </React.Fragment>
  );
});

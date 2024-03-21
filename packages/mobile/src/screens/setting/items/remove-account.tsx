import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BasicSettingItem } from "../components";
// import { useStyle } from "../../../styles";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API } from "../../../common/api";
// import CodePush from "react-native-code-push";
import { useTheme } from "@src/themes/theme-provider";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { View } from "react-native";
export const SettingRemoveAccountItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keychainStore, keyRingStore, analyticsStore } = useStore();

  const { colors } = useTheme();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  // const checkCodepushUpdate = () => {
  //   CodePush.checkForUpdate().then(update => {
  //     if (!update) {
  //       alert("The app is up to date!");
  //     } else {
  //       alert("Getting a new update...Please keep this screen on until completion. ");
  //       CodePush.sync(
  //         {
  //           installMode: CodePush.InstallMode.IMMEDIATE
  //         },
  //         status => {
  //           switch (status) {
  //             case CodePush.SyncStatus.UP_TO_DATE:
  //               // Show "downloading" modal
  //               // modal.open();
  //               break;
  //             case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
  //               // Show "downloading" modal
  //               // modal.open();
  //               break;
  //             case CodePush.SyncStatus.INSTALLING_UPDATE:
  //               // show installing
  //               break;
  //             case CodePush.SyncStatus.UPDATE_INSTALLED:
  //               // Hide loading modal
  //               break;
  //           }
  //         },
  //         ({ receivedBytes, totalBytes }) => {
  //           /* Update download modal progress */
  //         }
  //       );
  //     }
  //   });
  // };

  return (
    <React.Fragment>
      {/* <SettingItem label="Check for Update" onPress={() => {checkCodepushUpdate()}} /> */}
      <BasicSettingItem
        left={
          <View
            style={{
              borderRadius: 99,
              marginRight: 16,
              backgroundColor: colors["neutral-surface-action"],
              padding: 16,
            }}
          >
            <OWIcon
              color={colors["error-surface-pressed"]}
              name={"tdesign_delete"}
              size={16}
            />
          </View>
        }
        paragraph="Remove current wallet"
        onPress={() => {
          setIsOpenModal(true);
        }}
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

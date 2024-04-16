import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BasicSettingItem } from "../components";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
// import { getPrivateDataTitle } from "../screens/view-private-data";
import { useSmartNavigation } from "../../../navigation.provider";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { Alert } from "react-native";
import { showToast } from "@src/utils/helper";
import { useNavigation } from "@react-navigation/native";
import { PincodeModal } from "@src/screens/pincode/pincode-modal";

export const SettingViewPrivateDataItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keyRingStore, modalStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const onGoBack = () => {
    modalStore.close();
  };

  const onVerifyPincode = async (passcode) => {
    try {
      const index = keyRingStore.multiKeyStoreInfo.findIndex(
        (keyStore) => keyStore.selected
      );

      if (index >= 0) {
        const privateData = await keyRingStore.showKeyRing(index, passcode);
        smartNavigation.navigateSmart("Setting.BackupMnemonic", {
          privateData,
          privateDataType: keyRingStore.keyRingType,
        });
      }
      modalStore.close();
    } catch (err) {
      showToast({
        message: "Invalid passcode",
        type: "danger",
      });
    }
  };

  const _onPressPincodekModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <PincodeModal
        onVerifyPincode={onVerifyPincode}
        onGoBack={onGoBack}
        label={"Enter your passcode"}
        subLabel={"Enter your passcode to reveal secret phrase"}
      />
    );
  };

  // const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <BasicSettingItem
        icon="md_key"
        paragraph={"Reveal secret phrase"}
        onPress={() => {
          _onPressPincodekModal();
        }}
      />
      {/* <PasswordInputModal
        isOpen={isOpenModal}
        paragraph={"Do not reveal your mnemonic to anyone"}
        close={() => {
          setIsOpenModal(false);
        }}
        title={getPrivateDataTitle(keyRingStore.keyRingType, true)}
        onEnterPassword={async password => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(keyStore => keyStore.selected);

          if (index >= 0) {
            const privateData = await keyRingStore.showKeyRing(index, password);
            smartNavigation.navigateSmart("Setting.BackupMnemonic", {
              privateData,
              privateDataType: keyRingStore.keyRingType
            });
          }
        }}
      /> */}
    </React.Fragment>
  );
});

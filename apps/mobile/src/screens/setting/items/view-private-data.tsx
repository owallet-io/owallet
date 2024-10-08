import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BasicSettingItem } from "../components";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
// import { getPrivateDataTitle } from "../screens/view-private-data";

import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { Alert } from "react-native";
import { showToast } from "@src/utils/helper";
import { useNavigation } from "@react-navigation/native";
import { PincodeModal } from "@src/screens/pincode/pincode-modal";

export const SettingViewPrivateDataItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keyRingStore, modalStore, chainStore } = useStore();

  const onGoBack = () => {
    modalStore.close();
  };
  const index = keyRingStore.multiKeyStoreInfo.findIndex(
    (keyStore) => keyStore.selected
  );
  const keyStore = keyRingStore.multiKeyStoreInfo[index];
  const onVerifyPincode = async (passcode, isPrivateKey) => {
    try {
      if (index >= 0) {
        const privateData = await keyRingStore.showKeyRing(
          index,
          passcode,
          chainStore.current.chainId,
          isPrivateKey
        );
        navigate(SCREENS.SettingBackupMnemonic, {
          privateData,
          privateDataType: isPrivateKey ? "privateKey" : "mnemonic",
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

  const _onPressPincodekModal = (isPrivateKey) => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <PincodeModal
        onVerifyPincode={(pass) => onVerifyPincode(pass, isPrivateKey)}
        onGoBack={onGoBack}
        label={"Enter your passcode"}
        subLabel={"Enter your passcode to reveal secret phrase"}
      />
    );
  };

  // const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      {keyStore?.type === "mnemonic" && (
        <BasicSettingItem
          icon="md_key"
          paragraph={"Reveal secret phrase"}
          onPress={() => {
            _onPressPincodekModal(false);
          }}
        />
      )}
      {keyStore?.type !== "ledger" && (
        <BasicSettingItem
          icon="md_key"
          paragraph={"Reveal Private Key"}
          onPress={() => {
            _onPressPincodekModal(true);
          }}
        />
      )}
    </React.Fragment>
  );
});

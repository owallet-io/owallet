import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BasicSettingItem } from "../components";
import { useStore } from "../../../stores";
import { useTheme } from "@src/themes/theme-provider";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { View } from "react-native";
import { showToast } from "@src/utils/helper";
import { SCREENS } from "@src/common/constants";
import { resetTo } from "@src/router/root";
import { PincodeModal } from "@src/screens/pincode/pincode-modal";
export const SettingRemoveAccountItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keyRingStore, modalStore, universalSwapStore } = useStore();

  const { colors } = useTheme();

  const onGoBack = () => {
    modalStore.close();
  };

  const onVerifyPincode = async (passcode) => {
    try {
      const vaultId = keyRingStore.selectedKeyInfo.id;
      if (vaultId) {
        await keyRingStore.deleteKeyRing(vaultId, passcode);
        modalStore.close();
        if (keyRingStore.isEmpty) {
          resetTo(SCREENS.STACK.PincodeUnlock);
          return;
        }
      }
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
        subLabel={"Enter your passcode to remove current wallet"}
      />
    );
  };

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
        right={<View />}
        paragraph="Remove current wallet"
        paragraphStyle={{ color: colors["error-text-action"] }}
        onPress={() => {
          universalSwapStore.clearAmounts();
          _onPressPincodekModal();
        }}
      />
    </React.Fragment>
  );
});

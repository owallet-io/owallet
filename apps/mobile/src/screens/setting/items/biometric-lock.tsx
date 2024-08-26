import React, { FunctionComponent, useState } from "react";
import { BasicSettingItem } from "../components";
import { Toggle } from "../../../components/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import delay from "delay";
import { showToast } from "@src/utils/helper";
import { PincodeModal } from "@src/screens/pincode/pincode-modal";

export const SettingBiometricLockItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  /*
    isTurnOffBiometryFallback indicates that the modal is for turning off the biometry
    when failing to check the password to turn off by the biometry.
    This is mainly used to give the chance to the user when the biometry information changed after turning on the biometry sign-in.
   */
  const [isTurnOffBiometryFallback, setIsTurnOffBiometryFallback] =
    useState(false);

  const { modalStore, keychainStore } = useStore();

  const onGoBack = () => {
    modalStore.close();
  };

  const onVerifyPincode = async (passcode) => {
    try {
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);

      if (!isTurnOffBiometryFallback) {
        await keychainStore.turnOnBiometry(passcode);
      } else {
        await keychainStore.turnOffBiometryWithPassword(passcode);
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
        subLabel={`Enter your passcode to ${
          !isTurnOffBiometryFallback ? "enable" : "disable"
        } Biometric Authentication`}
      />
    );
  };

  return (
    <React.Fragment>
      {/* <PasswordInputModal
        title={
          !isTurnOffBiometryFallback
            ? "Enable Biometric Authentication"
            : "Disable Biometric Authentication"
        }
        isOpen={isOpenModal}
        close={() => {
          setIsOpenModal(false);
          setIsTurnOffBiometryFallback(false);
        }}
        onEnterPassword={async (password) => {
          // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
          // So to make sure that the loading state changes, just wait very short time.
          await delay(10);

          if (!isTurnOffBiometryFallback) {
            await keychainStore.turnOnBiometry(password);
          } else {
            await keychainStore.turnOffBiometryWithPassword(password);
          }
        }}
      /> */}
      <BasicSettingItem
        icon="face"
        paragraph="Sign in with Face ID"
        right={
          <Toggle
            on={keychainStore.isBiometryOn}
            onChange={async (value) => {
              if (value) {
                _onPressPincodekModal();
                setIsTurnOffBiometryFallback(false);
              } else {
                try {
                  await keychainStore.turnOffBiometry();
                } catch (e) {
                  console.log(e);
                  _onPressPincodekModal();
                  setIsTurnOffBiometryFallback(true);
                }
              }
            }}
          />
        }
        topBorder={topBorder}
      />
    </React.Fragment>
  );
});

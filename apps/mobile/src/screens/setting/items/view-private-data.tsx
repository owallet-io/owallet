import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BasicSettingItem } from "../components";
import { useStore } from "../../../stores";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { showToast } from "@src/utils/helper";
import { PincodeModal } from "@src/screens/pincode/pincode-modal";
import { ChainIdEnum } from "@owallet/common";
import { PrivKeyConfirmModal } from "../components/privkey-confirm-modal";

export const SettingViewPrivateDataItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({}) => {
  const { keyRingStore, modalStore, chainStore, appInitStore } = useStore();

  const [isKeyringLoading, setKeyringLoading] = useState(false);

  const onGoBack = () => {
    modalStore.close();
  };

  const keyStore = keyRingStore.selectedKeyInfo;
  const onVerifyPincode = async (passcode, isPrivateKey) => {
    modalStore.close();
    try {
      const privateData = await keyRingStore.exportKeyRing(
        keyStore.id,
        passcode,
        chainStore.current.chainId
      );

      navigate(SCREENS.SettingBackupMnemonic, {
        privateData:
          keyStore.type === "private-key" || isPrivateKey
            ? privateData.privKey
            : privateData.sensitive,
        privateDataType:
          keyStore.type === "private-key" || isPrivateKey
            ? "private-key"
            : "mnemonic",
      });

      modalStore.close();
    } catch (err) {
      showToast({
        message: "Invalid passcode",
        type: "danger",
      });
    }
  };

  const _onPressPincodeModal = (isPrivateKey) => {
    setKeyringLoading(true);
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
    setTimeout(() => {
      setKeyringLoading(false);
    }, 500);
  };

  const _onPressExportPrivkeyModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <PrivKeyConfirmModal
        onClose={onGoBack}
        onConfirm={() => {
          if (!isKeyringLoading) {
            if (chainStore.current.chainId === ChainIdEnum.Oasis) return;
            _onPressPincodeModal(true);
          }
        }}
      />
    );
    setTimeout(() => {
      setKeyringLoading(false);
    }, 500);
  };

  return (
    <React.Fragment>
      {keyStore?.type !== "ledger" && (
        <BasicSettingItem
          icon="tdesignlink"
          paragraph={"Reveal secret phrase"}
          onPress={() => {
            if (!isKeyringLoading) {
              _onPressPincodeModal(false);
            }
          }}
        />
      )}
      {keyStore?.type !== "ledger" &&
        !appInitStore.getInitApp.isAllNetworks &&
        chainStore.current.chainId !== ChainIdEnum.Oasis &&
        !chainStore.current.chainId.startsWith("solana") && (
          <BasicSettingItem
            icon="md_key"
            paragraph={"Reveal Private Key"}
            onPress={() => {
              _onPressExportPrivkeyModal();
            }}
          />
        )}
    </React.Fragment>
  );
});

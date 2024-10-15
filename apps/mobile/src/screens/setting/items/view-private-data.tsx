import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BasicSettingItem } from "../components";
import { useStore } from "../../../stores";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { showToast } from "@src/utils/helper";
import { PincodeModal } from "@src/screens/pincode/pincode-modal";
import { ChainIdEnum } from "@owallet/common";

export const SettingViewPrivateDataItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keyRingStore, modalStore, chainStore, appInitStore } = useStore();

  const onGoBack = () => {
    modalStore.close();
  };
  const index = keyRingStore.multiKeyStoreInfo.findIndex(
    (keyStore) => keyStore.selected
  );
  const keyStore = keyRingStore.multiKeyStoreInfo[index];
  const onVerifyPincode = async (passcode, isPrivateKey) => {
    modalStore.close();
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
          privateDataType: isPrivateKey ? "private-key" : "mnemonic",
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
          icon="tdesignlink"
          paragraph={"Reveal secret phrase"}
          onPress={() => {
            _onPressPincodekModal(false);
          }}
        />
      )}
      {keyStore?.type !== "ledger" &&
        !appInitStore.getInitApp.isAllNetworks &&
        chainStore.current.chainId !== ChainIdEnum.Oasis && (
          <BasicSettingItem
            icon="md_key"
            paragraph={"Reveal Private Key"}
            onPress={() => {
              if (chainStore.current.chainId === ChainIdEnum.Oasis) return;
              _onPressPincodekModal(true);
            }}
          />
        )}
    </React.Fragment>
  );
});

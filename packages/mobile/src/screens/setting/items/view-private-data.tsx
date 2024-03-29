import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { RightArrow, SettingItem } from "../components";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
import { getPrivateDataTitle } from "../screens/view-private-data";
import { useSmartNavigation } from "../../../navigation.provider";

export const SettingViewPrivateDataItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keyRingStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <SettingItem
        label={"Mnemonic"}
        onPress={() => {
          setIsOpenModal(true);
        }}
        right={<RightArrow />}
        topBorder={topBorder}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        paragraph={"Do not reveal your mnemonic to anyone"}
        close={() => {
          setIsOpenModal(false);
        }}
        title={getPrivateDataTitle(keyRingStore.keyRingType, true)}
        onEnterPassword={async (password) => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            (keyStore) => keyStore.selected
          );

          if (index >= 0) {
            const privateData = await keyRingStore.showKeyRing(index, password);
            smartNavigation.navigateSmart("Setting.BackupMnemonic", {
              privateData,
              privateDataType: keyRingStore.keyRingType,
            });
          }
        }}
      />
    </React.Fragment>
  );
});

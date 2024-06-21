import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "../styles/modal-recovery-phrase.module.scss";
import { LayoutWithButtonBottom } from "../../../layouts/button-bottom-layout/layout-with-button-bottom";
import { HeaderModal } from "../../home/components/header-modal";
import { observer } from "mobx-react-lite";
import Colors from "../../../theme/colors";

export const ModalEditAccountNamePage: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const onConfirm = () => {};
  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalContainer}
    >
      <LayoutWithButtonBottom
        titleButton={"Confirm"}
        backgroundColor={Colors["neutral-surface-card"]}
        isDisabledHeader={true}
        onClickButtonBottom={onConfirm}
      >
        <HeaderModal
          title={"set account name"}
          onRequestClose={onRequestClose}
        />
        <div className={styles.contentWrap}>
          <div className={styles.containerInput}>
            <span className={styles.label}>Name:</span>
            <input
              className={styles.inputPass}
              type="text"
              defaultValue={"Wallet 1"}
              placeholder={"Please enter your account name"}
              name={"account_name"}
            />
          </div>
        </div>
      </LayoutWithButtonBottom>
    </SlidingPane>
  );
});

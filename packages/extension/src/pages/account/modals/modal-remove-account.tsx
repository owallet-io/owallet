import React, { FC } from "react";
import styles from "../styles/modal-recovery-phrase.module.scss";
import { LayoutWithButtonBottom } from "../../../layouts/button-bottom-layout/layout-with-button-bottom";
import Colors from "../../../theme/colors";
import { HeaderModal } from "../../home/components/header-modal";
import SlidingPane from "react-sliding-pane";

export const ModalRemoveAccount: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = ({ isOpen, onRequestClose }) => {
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
        titleButton={"Confirm Removal"}
        backgroundColor={Colors["neutral-surface-card"]}
        isDisabledHeader={true}
        onClickButtonBottom={onConfirm}
        btnBackgroundColor={Colors["error-surface-default"]}
      >
        <HeaderModal
          title={"Remember to back up your recovery phrase!"}
          onRequestClose={onRequestClose}
        />
        <div className={styles.contentWrap}>
          <div className={styles.alert}>
            <img
              src={require("../../../public/assets/svg/ow_error-circle.svg")}
            />
            <span className={styles.textAlert}>
              Making a backup of your wallet with this phrase is important so
              you can still get to your assets if you delete account. <br />
              There is no way to get back your assets if you lose Recovery
              Phrase.
            </span>
          </div>
          <div className={styles.actionReveal}>
            <img src={require("../../../public/assets/svg/ow_key.svg")} />
            <span className={styles.title}>Reveal Recovery Phrase</span>
          </div>
          <div className={styles.containerInput}>
            <input
              className={styles.inputPass}
              type="password"
              placeholder={"Enter your password"}
              name={"yourPassword"}
            />
          </div>
        </div>
      </LayoutWithButtonBottom>
    </SlidingPane>
  );
};

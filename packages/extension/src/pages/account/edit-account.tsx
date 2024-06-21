import React, { useState } from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./styles/edit-account.module.scss";
import { ModalRecoveryPhrase } from "./modals/modal-recovery-phrase";

export const EditAccountPage = () => {
  const [isShowRecoveryPhrase, setIsShowRecoveryPhrase] = useState(false);
  const onShowModalRecoveryPhrase = () => {
    setIsShowRecoveryPhrase(true);
  };
  return (
    <LayoutWithButtonBottom titleButton={"Add Wallet"} title={"edit account"}>
      <div className={styles.topBox}>
        <div className={styles.avatar}>
          <img
            className={styles.imgAvatar}
            src={require("../../public/assets/images/default-avatar.png")}
          />
        </div>
        <div className={styles.wrapText}>
          <span className={styles.titleWallet}>Wallet 1</span>
          <span className={styles.subTitleWallet}> orai1u453k...jsjamxnz</span>
        </div>
      </div>
      <div className={styles.accountActions}>
        <div className={styles.actionItem}>
          <span className={styles.leftTitle}>Account name</span>
          <div className={styles.blockRight}>
            <span className={styles.rightTitle}>Wallet 1</span>
            <img
              src={require("../../public/assets/svg/tdesign_chevron_right.svg")}
            />
          </div>
        </div>
        <div onClick={onShowModalRecoveryPhrase} className={styles.actionItem}>
          <span className={styles.leftTitle}>Reveal Recovery Phrase</span>
          <div className={styles.blockRight}>
            <img
              src={require("../../public/assets/svg/tdesign_chevron_right.svg")}
            />
          </div>
        </div>
        <div onClick={onShowModalRecoveryPhrase} className={styles.actionItem}>
          <span className={styles.leftTitle}>Reveal Private Key</span>
          <div className={styles.blockRight}>
            <img
              src={require("../../public/assets/svg/tdesign_chevron_right.svg")}
            />
          </div>
        </div>
        <div className={`${styles.actionItem} ${styles.removeAccount}`}>
          <span className={styles.leftTitle}>Remove account</span>
        </div>
      </div>
      <ModalRecoveryPhrase
        isOpen={isShowRecoveryPhrase}
        onRequestClose={() => setIsShowRecoveryPhrase(false)}
      />
    </LayoutWithButtonBottom>
  );
};

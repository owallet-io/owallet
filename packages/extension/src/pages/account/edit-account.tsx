import React from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./edit-account.module.scss";

export const EditAccountPage = () => {
  return (
    <LayoutWithButtonBottom title={"edit account"}>
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
        <div className={styles.actionItem}>
          <span className={styles.leftTitle}>Reveal Recovery Phrase</span>
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
    </LayoutWithButtonBottom>
  );
};

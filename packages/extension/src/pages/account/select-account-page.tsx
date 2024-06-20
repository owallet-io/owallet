import React from "react";
import styles from "./select-account.module.scss";
import { HeaderNew } from "../../layouts/footer-layout/components/header";

export const SelectAccountPage = () => {
  return (
    <div className={styles.container}>
      <HeaderNew
        isGoBack
        isConnectDapp={false}
        isExpand={false}
        isDisableCenterBtn={true}
        title="Select account"
      />
      <div className={styles.boxContainer}>
        <span className={styles.titleBox}>Imported by Ledger</span>
        <div className={styles.itemBox}>
          <div className={styles.mainItem}>
            <div className={styles.wrapAvatar}>
              <img
                className={styles.imgAvatar}
                src={require("../../public/assets/images/default-avatar.png")}
                alt="avatar"
              />
            </div>
            <div className={styles.itemCenter}>
              <span className={styles.title}>Harry</span>
              <span className={styles.subTitle}>Current active</span>
            </div>
          </div>
          <div className={styles.wrapBtn}>
            <img
              className={styles.imgIcon}
              src={require("../../public/assets/svg/tdesign_more.svg")}
              alt="account"
            />
          </div>
        </div>
      </div>
      <div className={styles.containerBtnBottom}>
        <div className={styles.buttonPrimary}>
          <span className={styles.txtBtn}>Add Wallet</span>
        </div>
      </div>
    </div>
  );
};

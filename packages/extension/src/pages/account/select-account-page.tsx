import React, { useCallback } from "react";
import styles from "./select-account.module.scss";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import { useHistory } from "react-router";

export const SelectAccountPage = () => {
  const history = useHistory();
  const onEditAccount = () => {
    history.push("/edit-account");
  };
  return (
    <LayoutWithButtonBottom title="Select Account">
      <div className={styles.boxContainer}>
        <span className={styles.titleBox}>Imported by Ledger</span>
        <div onClick={onEditAccount} className={styles.itemBox}>
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
    </LayoutWithButtonBottom>
  );
};

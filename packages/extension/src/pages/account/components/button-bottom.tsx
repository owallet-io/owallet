import styles from "./styles.module.scss";
import React from "react";

export const ButtonBottom = () => {
  return (
    <div className={styles.containerBtnBottom}>
      <div className={styles.buttonPrimary}>
        <span className={styles.txtBtn}>Add Wallet</span>
      </div>
    </div>
  );
};

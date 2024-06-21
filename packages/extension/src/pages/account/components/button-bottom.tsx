import styles from "./styles.module.scss";
import React, { FC } from "react";

export const ButtonBottom: FC<{
  title: string;
}> = ({ title }) => {
  return (
    <div className={styles.containerBtnBottom}>
      <div className={styles.buttonPrimary}>
        <span className={styles.txtBtn}>{title}</span>
      </div>
    </div>
  );
};

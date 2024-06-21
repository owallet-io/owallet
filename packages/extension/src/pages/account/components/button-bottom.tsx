import styles from "./styles.module.scss";
import React, { FC } from "react";

export const ButtonBottom: FC<{
  title: string;
  onClickButtonBottom?: () => void;
}> = ({ title, onClickButtonBottom }) => {
  return (
    <div onClick={onClickButtonBottom} className={styles.containerBtnBottom}>
      <div className={styles.buttonPrimary}>
        <span className={styles.txtBtn}>{title}</span>
      </div>
    </div>
  );
};

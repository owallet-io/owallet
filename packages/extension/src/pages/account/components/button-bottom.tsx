import styles from "../styles/cpm-button-bottom.module.scss";
import React, { FC } from "react";

export const ButtonBottom: FC<{
  title: string;
  onClickButtonBottom?: (e) => void;
  btnBackgroundColor?: string;
}> = ({ title, onClickButtonBottom, btnBackgroundColor }) => {
  return (
    <div onClick={onClickButtonBottom} className={styles.containerBtnBottom}>
      <div
        style={{
          backgroundColor: btnBackgroundColor,
        }}
        className={styles.buttonPrimary}
      >
        <span className={styles.txtBtn}>{title}</span>
      </div>
    </div>
  );
};

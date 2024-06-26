import styles from "./style.module.scss";
import React, { FC } from "react";

export const HeaderModal: FC<{
  title: string;
  onRequestClose?: () => void;
}> = ({ onRequestClose, title }) => {
  return (
    <div className={styles.headerModal}>
      <div className={styles.headerLeft} />
      <div className={styles.title}>
        <span className={styles.titleText}>{title}</span>
      </div>
      <div className={styles.headerRight}>
        {onRequestClose ? (
          <div onClick={onRequestClose} className={styles.closeBtn}>
            <img
              className={styles.imgIcon}
              src={require("../../../public/assets/img/close.svg")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

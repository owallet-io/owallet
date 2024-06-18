import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";

export const ModalNetwork: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = ({ isOpen, onRequestClose }) => {
  return (
    <SlidingPane
      isOpen={isOpen}
      title={<span>CHOOSE NETWORK</span>}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalNetwork}
    >
      <div className={styles.contentWrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft} />
          <div className={styles.title}>
            <span className={styles.titleText}>CHOOSE NETWORK</span>
          </div>
          <div className={styles.headerRight}>
            <div onClick={onRequestClose} className={styles.closeBtn}>
              <img
                className={styles.imgIcon}
                src={require("../../../public/assets/img/close.svg")}
              />
            </div>
          </div>
        </div>
        <div>And I am pane content on left.</div>
      </div>
    </SlidingPane>
  );
};

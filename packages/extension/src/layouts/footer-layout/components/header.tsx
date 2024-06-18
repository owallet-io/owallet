import React, { useState } from "react";
import styles from "./header.module.scss";
import { ModalNetwork } from "../../../pages/home/modals/modal-network";
import { ModalMenuLeft } from "../../../pages/home/modals/modal-menu-left";

export const HeaderNew = () => {
  const [isShow, setIsShow] = useState(false);
  const [isShowNetwork, setIsShowNetwork] = useState(false);
  const onRequestCloseNetwork = () => {
    setIsShowNetwork(false);
  };
  const onSelectNetwork = () => {
    setIsShowNetwork(true);
  };
  return (
    <div className={styles.container}>
      <div className={styles.leftBlock}>
        <div onClick={() => setIsShow(true)} className={styles.wrapIcon}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/tdesign_view-list.svg")}
          />
        </div>
      </div>
      <div onClick={onSelectNetwork} className={styles.centerBlock}>
        <div className={styles.wrapContent}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/Tokens.svg")}
          />
          <span className={styles.chainName}>All Networks</span>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/images/tdesign_chevron_down.svg")}
          />
        </div>
      </div>
      <div className={styles.rightBlock}>
        <div className={styles.wrapIconConnect}>
          <img
            className={styles.imgIcon}
            style={{
              filter: `invert(100%)`,
            }}
            src={require("../../../public/assets/images/dApps_dex_logo.png")}
          />
          <div className={styles.dot}></div>
        </div>
        <div className={styles.wrapIcon}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/tdesign_fullscreen.svg")}
          />
        </div>
      </div>
      <ModalNetwork
        isOpen={isShowNetwork}
        onRequestClose={onRequestCloseNetwork}
      />
      <ModalMenuLeft isOpen={isShow} onRequestClose={() => setIsShow(false)} />
    </div>
  );
};

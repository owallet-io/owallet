import React from "react";
import styles from "./header.module.scss";

export const HeaderNew = () => {
  return (
    <div className={styles.container}>
      <div className={styles.leftBlock}>
        <div className={styles.wrapIcon}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/tdesign_view-list.svg")}
          />
        </div>
      </div>
      <div className={styles.centerBlock}>
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
    </div>
  );
};

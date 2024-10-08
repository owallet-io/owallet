import React from "react";
import styles from "./empty.module.scss";
import images from "assets/images";
export const OwEmpty = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapImg}>
        <img src={images.img_planet} className={styles.img} alt="img monney" />
      </div>
      <span className={styles.label}>NO DATA</span>
    </div>
  );
};

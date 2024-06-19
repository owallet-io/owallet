import React from "react";
import styles from "./receive.module.scss";
import { HeaderNew } from "../../layouts/footer-layout/components/header";
export const ReceivePage = () => {
  return (
    <div className={styles.containerReceivePage}>
      <HeaderNew isGoBack />
    </div>
  );
};

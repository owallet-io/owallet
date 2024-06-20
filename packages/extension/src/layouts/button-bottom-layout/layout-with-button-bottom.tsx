import React, { FC } from "react";
import styles from "./styles.module.scss";
import { HeaderNew } from "../footer-layout/components/header";
import { ButtonBottom } from "../../pages/account/components/button-bottom";

export const LayoutWithButtonBottom: FC<{
  title: string;
}> = ({ title, children }) => {
  return (
    <div className={styles.container}>
      <HeaderNew
        isGoBack
        isConnectDapp={false}
        isExpand={false}
        isDisableCenterBtn={true}
        title={title}
      />
      {children}
      <ButtonBottom />
    </div>
  );
};

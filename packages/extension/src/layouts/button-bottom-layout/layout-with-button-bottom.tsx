import React, { FC } from "react";
import styles from "./styles.module.scss";
import { HeaderNew } from "../footer-layout/components/header";
import { ButtonBottom } from "../../pages/account/components/button-bottom";

export const LayoutWithButtonBottom: FC<{
  title?: string;
  isDisabledHeader?: boolean;
  backgroundColor?: string;
  titleButton?: string;
  onClickButtonBottom?: () => void;
}> = ({
  title,
  backgroundColor,
  onClickButtonBottom,
  children,
  titleButton,
  isDisabledHeader,
}) => {
  return (
    <div
      style={{
        backgroundColor,
      }}
      className={styles.container}
    >
      {!isDisabledHeader && (
        <HeaderNew
          isGoBack
          isConnectDapp={false}
          isExpand={false}
          isDisableCenterBtn={true}
          title={title}
        />
      )}
      {children}
      <ButtonBottom
        onClickButtonBottom={onClickButtonBottom}
        title={titleButton}
      />
    </div>
  );
};

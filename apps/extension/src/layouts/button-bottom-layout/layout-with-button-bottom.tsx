import React, { FC } from "react";
import styles from "./styles.module.scss";
import { HeaderNew } from "../footer-layout/components/header";
import { ButtonBottom } from "../../pages/account/components/button-bottom";

export const LayoutWithButtonBottom: FC<{
  title?: string;
  isDisabledHeader?: boolean;
  backgroundColor?: string;
  titleButton?: string;
  onClickButtonBottom?: (value) => void;
  btnBackgroundColor?: string;
  isHideButtonBottom?: boolean;
  CustomRight?: () => JSX.Element;
}> = ({
  title,
  backgroundColor,
  onClickButtonBottom,
  children,
  titleButton,
  isDisabledHeader,
  btnBackgroundColor,
  isHideButtonBottom,
  CustomRight,
}) => {
  return (
    <div
      style={{
        backgroundColor,
        paddingBottom: isHideButtonBottom ? 16 : 72,
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
          CustomRight={CustomRight}
        />
      )}
      {children}
      {!isHideButtonBottom && (
        <ButtonBottom
          btnBackgroundColor={btnBackgroundColor}
          onClickButtonBottom={onClickButtonBottom}
          title={titleButton}
        />
      )}
    </div>
  );
};

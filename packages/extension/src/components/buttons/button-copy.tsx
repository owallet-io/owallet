import React, { FC } from "react";
import { useNotification } from "../notification";
import { useIntl } from "react-intl";
import styles from "./styles.module.scss";
export const ButtonCopy: FC<{
  valueCopy: string;
  title: string;
}> = ({ valueCopy, title }) => {
  const notification = useNotification();
  const intl = useIntl();
  const copy = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.address.copied",
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };
  return (
    <div onClick={() => copy(valueCopy)} className={styles.wrapBtnCopy}>
      <img
        className={styles.icon}
        src={require("assets/svg/owallet-copy.svg")}
      />
      <span className={styles.txtCopy}>{title}</span>
    </div>
  );
};

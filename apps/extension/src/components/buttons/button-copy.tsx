import React, { FC } from "react";
import { useIntl } from "react-intl";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
export const ButtonCopy: FC<{
  valueCopy: string;
  title: string;
}> = ({ valueCopy, title }) => {
  const intl = useIntl();
  const copy = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast(
      intl.formatMessage({
        id: "main.address.copied",
      }),
      {
        type: "success",
      }
    );
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

import React, { FC, useCallback, useRef, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./styles.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useNotification } from "../../../components/notification";
import { useIntl } from "react-intl";
import { HeaderModal } from "../../home/components/header-modal";
import { LayoutWithButtonBottom } from "../../../layouts/button-bottom-layout/layout-with-button-bottom";
import { useHistory } from "react-router";

export const ModalRecoveryPhrase: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();

  const intl = useIntl();
  const notification = useNotification();
  const history = useHistory();
  const onConfirm = () => {
    history.push("/reveal-recovery-phrase");
    return;
  };
  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalRevealKey}
    >
      <LayoutWithButtonBottom
        titleButton={"Confirm"}
        backgroundColor={"#ffffff"}
        isDisabledHeader={true}
        onClickButtonBottom={onConfirm}
      >
        <HeaderModal title={""} onRequestClose={onRequestClose} />
        <div className={styles.contentWrap}>
          <img
            src={require("../../../public/assets/images/img_key.png")}
            alt="logo"
            className={styles.logo}
          />
          <span className={styles.title}>
            You are revealing recovery phrase
          </span>
          <span className={styles.subTitle}>
            Just be ready to write it down and{" "}
            <span className={styles.warning}>DO NOT SHARE </span> it with
            anyone.
          </span>
          <div className={styles.containerInput}>
            <input
              className={styles.inputPass}
              type="password"
              placeholder={"Enter your password"}
              name={"yourPassword"}
            />
          </div>
        </div>
      </LayoutWithButtonBottom>
    </SlidingPane>
  );
});

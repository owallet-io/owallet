import React, { FC, useState } from "react";
import styles from "./header.module.scss";
import { ModalNetwork } from "../../../pages/home/modals/modal-network";
import { ModalMenuLeft } from "../../../pages/home/modals/modal-menu-left";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { limitString, unknownToken } from "@owallet/common";
import { useHistory } from "react-router";

export const HeaderNew: FC<{
  isGoBack?: boolean;
  isConnectDapp?: boolean;
  isExpand?: boolean;
  title?: string;
  isDisableCenterBtn?: boolean;
}> = observer(
  ({ isConnectDapp = true, isGoBack, isExpand, isDisableCenterBtn, title }) => {
    const [isShow, setIsShow] = useState(false);
    const [isShowNetwork, setIsShowNetwork] = useState(false);
    const onRequestCloseNetwork = () => {
      setIsShowNetwork(false);
    };
    const onSelectNetwork = () => {
      if (isDisableCenterBtn) return;
      setIsShowNetwork(true);
    };
    const { chainStore } = useStore();
    const history = useHistory();
    const onGoBack = () => {
      history.goBack();
      return;
    };
    return (
      <div className={styles.container}>
        <div className={styles.leftBlock}>
          {isGoBack ? (
            <div onClick={onGoBack} className={styles.wrapIcon}>
              <img
                className={styles.imgIcon}
                src={require("../../../public/assets/svg/arrow-right.svg")}
              />
            </div>
          ) : (
            <div onClick={() => setIsShow(true)} className={styles.wrapIcon}>
              <img
                className={styles.imgIcon}
                src={require("../../../public/assets/svg/tdesign_view-list.svg")}
              />
            </div>
          )}
        </div>

        <div onClick={onSelectNetwork} className={styles.centerBlock}>
          <div className={styles.wrapContent}>
            {title ? (
              <span className={styles.chainName}>{title}</span>
            ) : (
              <>
                <img
                  className={styles.imgIcon}
                  src={
                    chainStore.isAllNetwork
                      ? require("../../../public/assets/svg/Tokens.svg")
                      : chainStore.current?.stakeCurrency?.coinImageUrl ||
                        unknownToken.coinImageUrl
                  }
                />
                <span className={styles.chainName}>
                  {chainStore.isAllNetwork
                    ? "All Networks"
                    : chainStore.current.chainName}
                </span>
                <img
                  className={styles.imgIcon}
                  src={require("../../../public/assets/images/tdesign_chevron_down.svg")}
                />
              </>
            )}
          </div>
        </div>
        <div className={styles.rightBlock}>
          {isConnectDapp && (
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
          )}
          {isExpand && (
            <div className={styles.wrapIcon}>
              <img
                className={styles.imgIcon}
                src={require("../../../public/assets/svg/tdesign_fullscreen.svg")}
              />
            </div>
          )}
        </div>
        <ModalNetwork
          isOpen={isShowNetwork}
          onRequestClose={onRequestCloseNetwork}
        />
        <ModalMenuLeft
          isOpen={isShow}
          onRequestClose={() => setIsShow(false)}
        />
      </div>
    );
  }
);

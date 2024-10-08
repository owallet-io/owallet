import React, { FC, useEffect, useState } from "react";
import styles from "./header.module.scss";
import { ModalNetwork } from "../../../pages/home/modals/modal-network";
import { ModalMenuLeft } from "../../../pages/home/modals/modal-menu-left";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import {
  getDomainFromUrl,
  getFavicon,
  limitString,
  PrivilegedOrigins,
  unknownToken,
} from "@owallet/common";
import { useHistory } from "react-router";
import { ModalSiteConnected } from "../../../pages/home/modals/modal-site-connected";
import Colors from "../../../theme/colors";

export const HeaderNew: FC<{
  isGoBack?: boolean;
  isConnectDapp?: boolean;
  isExpand?: boolean;
  showNetwork?: boolean;
  title?: string;
  isDisableCenterBtn?: boolean;
  isHideAllNetwork?: boolean;
}> = observer(
  ({
    isConnectDapp = true,
    isGoBack,
    isHideAllNetwork,
    isExpand,
    isDisableCenterBtn,
    title,
    showNetwork,
  }) => {
    const [isShow, setIsShow] = useState(false);
    const [isShowSiteConnected, setIsShowSiteConnected] = useState(false);
    const [isShowNetwork, setIsShowNetwork] = useState(false);

    const onRequestCloseNetwork = () => {
      setIsShowNetwork(false);
    };
    const onSelectNetwork = () => {
      if (isDisableCenterBtn) return;
      setIsShowNetwork(true);
    };
    const { chainStore, permissionStore } = useStore();
    const history = useHistory();
    const onGoBack = () => {
      history.goBack();
      return;
    };
    const [tabActive, setTabActive] = useState<string>("");
    useEffect(() => {
      // see the note below on how to choose currentWindow or lastFocusedWindow
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const url = tabs?.length > 0 && tabs[0].url;
        if (!url) return;
        setTabActive(url);
        // use `url` here inside the callback because it's asynchronous!
      });
    }, []);
    const isActive = permissionStore
      .getBasicAccessInfo(chainStore.current.chainId)
      .origins.includes(getDomainFromUrl(tabActive));
    return (
      <div className={styles.container}>
        <div className={styles.leftBlock}>
          {isGoBack ? (
            <div onClick={onGoBack} className={styles.wrapIcon}>
              <img
                className={styles.imgIcon}
                src={require("assets/svg/arrow-right.svg")}
              />
            </div>
          ) : (
            <div onClick={() => setIsShow(true)} className={styles.wrapIcon}>
              <img
                className={styles.imgIcon}
                src={require("assets/svg/tdesign_view-list.svg")}
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
                    chainStore.isAllNetwork && !showNetwork
                      ? require("assets/svg/Tokens.svg")
                      : chainStore.current?.stakeCurrency?.coinImageUrl ||
                        unknownToken.coinImageUrl
                  }
                />
                <span className={styles.chainName}>
                  {chainStore.isAllNetwork && !showNetwork
                    ? "All Networks"
                    : chainStore.current.chainName}
                </span>
                {isDisableCenterBtn ? null : (
                  <img
                    className={styles.imgIcon}
                    src={require("assets/images/tdesign_chevron_down.svg")}
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div className={styles.rightBlock}>
          {isConnectDapp && (
            <div
              onClick={() => {
                setIsShowSiteConnected(true);
              }}
              className={styles.wrapIconConnect}
            >
              <img className={styles.imgIcon} src={getFavicon(tabActive)} />
              {isActive && <div className={styles.dot}></div>}
            </div>
          )}
          {isExpand && (
            <div className={styles.wrapIcon}>
              <img
                className={styles.imgIcon}
                src={require("assets/svg/tdesign_fullscreen.svg")}
              />
            </div>
          )}
        </div>
        <ModalNetwork
          isOpen={isShowNetwork}
          onRequestClose={onRequestCloseNetwork}
          isHideAllNetwork={isHideAllNetwork}
        />
        <ModalMenuLeft
          isOpen={isShow}
          onRequestClose={() => setIsShow(false)}
        />
        <ModalSiteConnected
          isActive={isActive}
          url={getDomainFromUrl(tabActive)}
          isOpen={isShowSiteConnected}
          onRequestClose={() => setIsShowSiteConnected(false)}
        />
      </div>
    );
  }
);

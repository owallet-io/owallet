import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { ChainIdEnum } from "@owallet/common";
import { useNotification } from "components/notification";

export const ModalMenuLeft: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const { keyRingStore, chainStore } = useStore();
  const history = useHistory();
  const notification = useNotification();

  const lock = async () => {
    await keyRingStore.lock();
    history.push("/");
    onRequestClose();
  };
  const actionMenu = (item) => {
    switch (item.id) {
      case MenuEnum.LOCK:
        lock();
        break;
      case MenuEnum.CONNECTED_DAPP:
        if (chainStore.current.chainId === ChainIdEnum.Bitcoin) {
          notification.push({
            placement: "top-center",
            type: "success",
            duration: 2,
            content:
              "Add token in Bitcoin chain not supported yet! Please try again with another chain.",
            canDelete: true,
            transition: {
              duration: 0.25,
            },
          });
          return;
        }
        history.push("/connected-dapp");
        break;
      case MenuEnum.ADD_TOKEN:
        history.push("/add-token");
        break;
      case MenuEnum.PREFERENCES:
        history.push("/preferences");
        break;
      default:
      // code block
    }
  };
  return (
    <SlidingPane
      isOpen={isOpen}
      title={<span>CHOOSE NETWORK</span>}
      from="left"
      width="80vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalMenuLeft}
    >
      <div className={styles.containerSliderLeft}>
        <div
          style={{
            cursor: "auto",
          }}
          className={styles.itemMenu}
        >
          <div
            style={{
              width: 32,
              height: 32,
              cursor: "pointer",
            }}
            onClick={onRequestClose}
            className={styles.btnIcon}
          >
            <img
              className={styles.imgIcon}
              src={require("assets/svg/tdesign_arrow_left.svg")}
            />
          </div>
        </div>
        {dataItem.map((item, index) => (
          <div
            onClick={() => actionMenu(item)}
            key={item.id}
            style={{
              borderBottom: item.isBorderBottom ? "1px solid #EBEDF2" : null,
            }}
            className={styles.itemMenu}
          >
            <div className={styles.leftBlock}>
              <div className={styles.btnIcon}>
                <img className={styles.imgIcon} src={item.icon} />
              </div>
              <span className={styles.nameMenu}>{item.name}</span>
            </div>
            {item.value && <span className={styles.version}>{item.value}</span>}
          </div>
        ))}
      </div>
    </SlidingPane>
  );
});
const manifestData = chrome.runtime.getManifest();

enum MenuEnum {
  ADD_TOKEN = 1,
  ADDR_BOOK = 3,
  CONNECTED_DAPP = 4,
  PREFERENCES = 5,
  LOCK = 6,
  ABOUT_USER = 7,
}

const dataItem = [
  {
    name: "Add Token",
    icon: require("assets/svg/tdesign_add_circle.svg"),
    id: MenuEnum.ADD_TOKEN,
  },
  // {
  //   name: "Manage Token list",
  //   icon: require("assets/svg/tdesign_list.svg"),
  //   id: 2,
  // },
  // {
  //   name: "Address Book",
  //   icon: require("assets/svg/tdesign_address_book.svg"),
  //   id: MenuEnum.ADDR_BOOK,
  // },
  {
    name: "Connected DApp",
    icon: require("assets/svg/tdesign_internet.svg"),
    id: MenuEnum.CONNECTED_DAPP,
  },
  {
    name: "Preferences",
    icon: require("assets/svg/tdesign_adjustment.svg"),
    isBorderBottom: true,
    id: MenuEnum.PREFERENCES,
  },
  {
    name: "Lock Wallet",
    icon: require("assets/svg/tdesign_lock_on.svg"),
    id: MenuEnum.LOCK,
    isBorderBottom: true,
  },
  {
    name: "About us",
    icon: require("assets/svg/tdesign_info_circle.svg"),
    id: MenuEnum.ABOUT_USER,
    value: `v${manifestData.version}`,
  },
];

import React, { useState } from "react";
import styles from "./header.module.scss";
import { ModalNetwork } from "../../../pages/home/modals/modal-network";

export const HeaderNew = () => {
  const [isShow, setIsShow] = useState(false);
  const [isShowNetwork, setIsShowNetwork] = useState(false);
  const onRequestCloseNetwork = () => {
    setIsShowNetwork(false);
  };
  const onSelectNetwork = () => {
    setIsShowNetwork(true);
  };
  return (
    <div className={styles.container}>
      <div className={styles.leftBlock}>
        <div onClick={() => setIsShow(true)} className={styles.wrapIcon}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/tdesign_view-list.svg")}
          />
        </div>
      </div>
      <div onClick={onSelectNetwork} className={styles.centerBlock}>
        <div className={styles.wrapContent}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/Tokens.svg")}
          />
          <span className={styles.chainName}>All Networks</span>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/images/tdesign_chevron_down.svg")}
          />
        </div>
      </div>
      <div className={styles.rightBlock}>
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
        <div className={styles.wrapIcon}>
          <img
            className={styles.imgIcon}
            src={require("../../../public/assets/svg/tdesign_fullscreen.svg")}
          />
        </div>
      </div>
      <ModalNetwork
        isOpen={isShowNetwork}
        onRequestClose={onRequestCloseNetwork}
      />
      {isShow && <MenuLeft onBack={() => setIsShow(false)} />}
    </div>
  );
};

const dataItem = [
  {
    name: "Add Token",
    icon: require("../../../public/assets/svg/tdesign_add_circle.svg"),
    id: 1,
  },
  {
    name: "Manage Token list",
    icon: require("../../../public/assets/svg/tdesign_list.svg"),
    id: 2,
  },
  {
    name: "Address Book",
    icon: require("../../../public/assets/svg/tdesign_address_book.svg"),
    id: 3,
  },
  {
    name: "Connected DApp",
    icon: require("../../../public/assets/svg/tdesign_internet.svg"),
    id: 4,
  },
  {
    name: "Preferences",
    icon: require("../../../public/assets/svg/tdesign_adjustment.svg"),
    isBorderBottom: true,
    id: 5,
  },
  {
    name: "Lock Wallet",
    icon: require("../../../public/assets/svg/tdesign_lock_on.svg"),
    id: 6,
    isBorderBottom: true,
  },
  {
    name: "About us",
    icon: require("../../../public/assets/svg/tdesign_info_circle.svg"),
    id: 7,
    value: "v3.0.0",
  },
];

export const MenuLeft = ({ onBack = () => {} }) => {
  return (
    <div className={styles.backDrop}>
      <div className={styles.containerSliderLeft}>
        <div className={styles.itemMenu}>
          <div
            style={{
              width: 32,
              height: 32,
              cursor: "pointer",
            }}
            onClick={onBack}
            className={styles.btnIcon}
          >
            <img
              className={styles.imgIcon}
              src={require("../../../public/assets/svg/tdesign_arrow_left.svg")}
            />
          </div>
        </div>
        {dataItem.map((item, index) => (
          <div
            key={item.id}
            style={{
              borderBottom: item.isBorderBottom ? "1px solid #EBEDF2" : null,
            }}
            className={styles.itemMenu}
          >
            <div className={styles.btnIcon}>
              <img className={styles.imgIcon} src={item.icon} />
            </div>
            <span className={styles.nameMenu}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

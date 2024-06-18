import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";

export const ModalMenuLeft: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const { keyRingStore } = useStore();
  const history = useHistory();
  const lock = async () => {
    await keyRingStore.lock();
    history.push("/");
    onRequestClose();
  };
  const actionMenu = (item) => {
    if (item.id === 6) {
      lock();
      return;
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
        <div className={styles.itemMenu}>
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
              src={require("../../../public/assets/svg/tdesign_arrow_left.svg")}
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
            <div className={styles.btnIcon}>
              <img className={styles.imgIcon} src={item.icon} />
            </div>
            <span className={styles.nameMenu}>{item.name}</span>
          </div>
        ))}
      </div>
    </SlidingPane>
  );
});

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

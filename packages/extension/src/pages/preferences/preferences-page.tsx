import React, { useEffect, useState } from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import { observer } from "mobx-react-lite";
import styles from "./preferences.module.scss";
import { limitString } from "@owallet/common";
import { useStore } from "../../stores";
import { ModalCurrency } from "./modal/modal-currency";
import { ModalDefaultWallet } from "./modal/modal-default-wallet";
import { useHistory } from "react-router";
import { OWIcon } from "components/icon/Icon";
import colors from "theme/colors";
import Switch from "react-switch";

enum MenuEnum {
  LANGUAGE = "LANGUAGE",
  CURRENCY = "CURRENCY",
  DEFAULT_WALLET = "DEFAULT_WALLET",
  HIDE_TESTNET = "HIDE_TESTNET",
}

const dataPreferences = [
  {
    id: MenuEnum.LANGUAGE,
    name: "Language",
    icon: "tdesigntranslate-1",
    type: "arrow",
  },
  {
    id: MenuEnum.CURRENCY,
    name: "Currency",
    icon: "tdesigncurrency-exchange",
    type: "arrow",
  },
  {
    id: MenuEnum.DEFAULT_WALLET,
    name: "Default wallet",
    icon: "tdesignwallet",
    type: "arrow",
  },
  {
    id: MenuEnum.HIDE_TESTNET,
    name: "Hide testnet",
    icon: "tdesignbrowse-off",
    type: "switch",
  },
];
export const PreferencesPage = observer(() => {
  const { priceStore, chainStore } = useStore();
  const [valueDataPreferences, setValueDataPreferences] = useState<
    Record<any, any>
  >({
    [MenuEnum.LANGUAGE]: "English",
    [MenuEnum.CURRENCY]: priceStore.defaultVsCurrency?.toUpperCase(),
    [MenuEnum.DEFAULT_WALLET]: "",
    [MenuEnum.HIDE_TESTNET]: false,
  });

  const [isOpenCurrency, setIsOpenCurrency] = useState(false);
  const [isOpenDefaultWallet, setIsOpenDefaultWallet] = useState(false);
  useEffect(() => {
    if (priceStore.defaultVsCurrency) {
      setValueDataPreferences((prev) => ({
        ...prev,
        [MenuEnum.CURRENCY]: priceStore.defaultVsCurrency?.toUpperCase(),
      }));
    }
  }, [priceStore.defaultVsCurrency]);

  const onHideTestnet = () => {
    chainStore.setIsHideTestnet(!chainStore.isHideTestnet);
  };

  const checkAction = (item) => {
    switch (item.id) {
      case MenuEnum.CURRENCY:
        setIsOpenCurrency(true);
        break;
      case MenuEnum.DEFAULT_WALLET:
        setIsOpenDefaultWallet(true);
        break;
      case MenuEnum.HIDE_TESTNET:
        onHideTestnet();
        break;
    }
  };
  const history = useHistory();
  return (
    <LayoutWithButtonBottom
      onClickButtonBottom={() => {
        history.goBack();
        return;
      }}
      titleButton={"Close"}
      title={"Preferences"}
    >
      <div className={styles.wrapContent}>
        <div className={styles.listDapps}>
          {dataPreferences.map((item, index) => {
            return (
              <div
                onClick={() => checkAction(item)}
                key={index}
                className={styles.itemDapp}
              >
                <div className={styles.leftBlock}>
                  <div className={styles.wrapImg}>
                    <OWIcon
                      icon={item.icon}
                      size={20}
                      color={colors["neutral-icon-on-light"]}
                    />
                  </div>
                  <span className={styles.urlText}>
                    {limitString(item.name, 24)}
                  </span>
                </div>
                <div className={styles.rightBlock}>
                  <span className={styles.valueRight}>
                    {valueDataPreferences[item.id] || ""}
                  </span>
                  {item.type === "arrow" ? (
                    <img
                      src={require("assets/svg/tdesign_chevron_right.svg")}
                      className={styles.img}
                    />
                  ) : null}
                  {item.type === "switch" ? (
                    <div style={{ zIndex: 999 }}>
                      <Switch
                        onColor={colors["highlight-surface-active"]}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={35}
                        onChange={onHideTestnet}
                        checked={chainStore.isHideTestnet}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ModalCurrency
        isOpen={isOpenCurrency}
        onRequestClose={() => setIsOpenCurrency(false)}
      />
      <ModalDefaultWallet
        isOpen={isOpenDefaultWallet}
        onRequestClose={() => setIsOpenDefaultWallet(false)}
      />
    </LayoutWithButtonBottom>
  );
});

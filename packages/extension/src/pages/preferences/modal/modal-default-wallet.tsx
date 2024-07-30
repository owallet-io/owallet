import React, { FC, useState } from "react";
import styles from "./styles.module.scss";
import { HeaderModal } from "../../home/components/header-modal";
import { SearchInput } from "../../home/components/search-input";
import classnames from "classnames";
import { unknownToken, useLanguage } from "@owallet/common";
import { initPrice } from "../../../hooks/use-multiple-assets";
import SlidingPane from "react-sliding-pane";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";
import { useStore } from "../../../stores";
const data = [
  { name: "Default to OWallet", id: 1 },
  { name: "Don’t default to OWallet", id: 2 },
  { name: "Always Ask", id: 3 },
];
export const ModalDefaultWallet: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const history = useHistory();
  const intl = useIntl();
  const [defaultWallet, setDefaultWallet] = useState(data[0]);
  const language = useLanguage();

  const switchWallet = async (wallet) => {
    setDefaultWallet(wallet);
    onRequestClose();
    return;
  };

  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalCurrency}
    >
      <div className={styles.contentWrap}>
        <HeaderModal title={"DEFAULT WALLET"} onRequestClose={onRequestClose} />
        <span className={styles.subTitle}>
          For connecting to a new DApp that offers multiple installed wallets:
        </span>
        <div
          style={{
            paddingTop: 16,
          }}
          className={styles.containerListChain}
        >
          {data.map((item, index) => {
            return (
              <div
                onClick={() => switchWallet(item)}
                key={item.id}
                className={classnames([
                  styles.itemChain,
                  item.id === defaultWallet.id ? styles.activeItemChain : null,
                ])}
              >
                <div className={styles.leftBlockHuge}>
                  <div className={styles.rightBlock}>
                    <span className={styles.titleName}>{`${item.name}`}</span>
                  </div>
                </div>
                <div className={styles.rightBlockHuge}>
                  <input
                    id={item.name}
                    defaultChecked={item.id === defaultWallet.id}
                    name={"default-wallet"}
                    className={styles.radioInput}
                    type={"radio"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SlidingPane>
  );
});

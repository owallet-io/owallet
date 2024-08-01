import React, { FC, useEffect, useState } from "react";
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
import { DAPP_CONNECT_STATUS } from "@owallet/types";
const data = [
  { name: "Default to OWallet", id: DAPP_CONNECT_STATUS.ALWAY_CONNECT },
  { name: "Don’t default to OWallet", id: DAPP_CONNECT_STATUS.NOT_CONNECT },
  { name: "Always Ask", id: DAPP_CONNECT_STATUS.ASK_CONNECT },
];
export const ModalDefaultWallet: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose }) => {
  const { chainStore } = useStore();

  const history = useHistory();
  const intl = useIntl();
  const [defaultWallet, setDefaultWallet] = useState(data[0]);
  const language = useLanguage();
  useEffect(() => {
    (async () => {
      const rs = (await chainStore.getDappStatusConnect()) as any;
      const status = data.find((item, index) => item.id === rs.status);
      console.log(status, "status");
      setDefaultWallet(status);
      //   console.log(rs.status, "status");
    })();

    return () => {};
  }, []);
  const switchWallet = async (wallet) => {
    const rs = await chainStore.setDappStatusConnect(wallet.id);
    console.log(rs, "rs");
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

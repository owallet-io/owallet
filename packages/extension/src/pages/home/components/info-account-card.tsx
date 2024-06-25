import React, { FC, useState } from "react";
import styles from "./style.module.scss";
import { PricePretty } from "@owallet/unit";
import { initPrice } from "../../../hooks/use-multiple-assets";
import { ModalCopyAddress } from "../modals/modal-copy-address";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ChainIdEnum } from "@owallet/common";

export const InfoAccountCard: FC<{
  totalPrice: string;
}> = observer(({ totalPrice }) => {
  const [isShowCopyModal, setIsShowCopyModal] = useState(false);
  const onShowModalCopy = () => {
    setIsShowCopyModal(true);
  };
  const onCLoseModalCopy = () => {
    setIsShowCopyModal(false);
  };
  const history = useHistory();
  const onReceive = () => {
    history.push("/receive");
    return;
  };
  const { accountStore, priceStore, chainStore } = useStore();
  const account = accountStore.getAccount(ChainIdEnum.Oraichain);
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const onSelectAccount = () => {
    history.push("/select-account");
    return;
  };
  return (
    <div className={styles.containerInfoAccountCard}>
      <div className={styles.topHeaderInfoAcc}>
        <div onClick={onSelectAccount} className={styles.selectAccount}>
          <img
            className={styles.imgWallet}
            src={require("../../../public/assets/images/default-avatar.png")}
          />
          <span className={styles.nameWallet}>{account.name || "..."}</span>
          <img
            className={styles.arrDown}
            src={require("../../../public/assets/images/tdesign_chevron_down.svg")}
          />
        </div>
        <div onClick={onShowModalCopy} className={styles.blockCopyAddress}>
          <img
            className={styles.iconCopy}
            src={require("../../../public/assets/images/owallet_copy.svg")}
          />
          <span className={styles.nameCopy}>Copy address</span>
        </div>
      </div>
      <div className={styles.bodyBalance}>
        <span className={styles.textBalance}>
          {(new PricePretty(fiatCurrency, totalPrice) || initPrice)?.toString()}
        </span>
      </div>
      <div className={styles.btnsSendReceived}>
        <div onClick={onReceive} className={styles.btnWrap}>
          <span className={styles.txt}>Receive</span>
        </div>
        {/* do send function here */}
        <div
          onClick={() => {
            if (chainStore.current.chainId === ChainIdEnum.TRON) {
              history.push("/send-tron");
              return;
            }
            if (chainStore.current.chainId === ChainIdEnum.Bitcoin) {
              history.push("/send-btc");
              return;
            }
            if (chainStore.current.networkType === "evm") {
              history.push("/send-evm");
              return;
            }
            history.push("/send");
          }}
          className={styles.btnWrap}
        >
          <span className={styles.txt}>Send</span>
        </div>
      </div>
      <ModalCopyAddress
        isOpen={isShowCopyModal}
        onRequestClose={onCLoseModalCopy}
      />
    </div>
  );
});

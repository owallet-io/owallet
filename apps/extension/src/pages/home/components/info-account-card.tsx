import React, { FC, useState } from "react";
import styles from "./style.module.scss";
import { PricePretty } from "@owallet/unit";
import { initPrice } from "../../../hooks/use-multiple-assets";
import { ModalCopyAddress } from "../modals/modal-copy-address";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ChainIdEnum } from "@owallet/common";

import { useIntl } from "react-intl";
import { Address } from "components/address";
import { toast } from "react-toastify";

export const InfoAccountCard: FC<{
  totalPrice: string;
  isLoading?: boolean;
}> = observer(({ totalPrice, isLoading }) => {
  const { accountStore, priceStore, chainStore, keyRingStore } = useStore();
  const account = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const intl = useIntl();

  const signer = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const [isShowCopyModal, setIsShowCopyModal] = useState(false);
  const onShowModalCopy = async () => {
    if (chainStore.isAllNetwork) {
      setIsShowCopyModal(true);
    } else {
      await navigator.clipboard.writeText(signer);
      toast(
        intl.formatMessage({
          id: "main.address.copied",
        }),
        {
          type: "success",
        }
      );
    }
  };
  const onCLoseModalCopy = () => {
    setIsShowCopyModal(false);
  };
  const history = useHistory();
  const onReceive = () => {
    history.push("/receive");
    return;
  };

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
            src={require("assets/images/default-avatar.png")}
          />
          <div
            style={
              account.name?.length < 10
                ? {
                    width: "auto",
                  }
                : null
            }
            className={styles.wrapName}
          >
            <span
              style={
                account.name?.length < 10
                  ? {
                      animation: "auto",
                      paddingLeft: 0,
                    }
                  : null
              }
              className={styles.nameWallet}
            >
              {account.name || "..."}
            </span>
          </div>
          <img
            className={styles.arrDown}
            src={require("assets/images/tdesign_chevron_down.svg")}
          />
        </div>
        <div onClick={onShowModalCopy} className={styles.blockCopyAddress}>
          <img
            className={styles.iconCopy}
            src={require("assets/images/owallet_copy.svg")}
          />
          <span className={styles.nameCopy}>
            {chainStore.isAllNetwork ? (
              "Copy address"
            ) : (
              <Address maxCharacters={6} lineBreakBeforePrefix={false}>
                {signer}
              </Address>
            )}
          </span>
        </div>
      </div>
      <div className={styles.bodyBalance}>
        <span className={styles.textBalance}>
          {totalPrice}
          {/* {(new PricePretty(fiatCurrency, totalPrice) || initPrice)?.toString()} */}
          {isLoading && (
            <span>
              {" "}
              <i className="fas fa-spinner fa-spin" />
            </span>
          )}
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
            // if (chainStore.current.chainId.includes("solana")) {
            //     history.push("/send-solana");
            //     return;
            // }
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

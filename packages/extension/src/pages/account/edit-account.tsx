import React, { useState } from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./styles/edit-account.module.scss";
import { ModalRecoveryPhrase } from "./modals/modal-recovery-phrase";
import { ModalEditAccountNamePage } from "./modals/modal-edit-account-name";
import { ModalRemoveAccount } from "./modals/modal-remove-account";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
// import { useLocation } from 'react-router';
import { useParams, useLocation } from "react-router-dom";
import { KeyStore } from "@owallet/background/build/keyring/crypto";
import { formatAddress } from "@owallet/common";

export const EditAccountPage = observer(() => {
  const [isShowRecoveryPhrase, setIsShowRecoveryPhrase] = useState(false);
  const [isShowAccountName, setIsShowAccountName] = useState(false);
  const [isShowModalRemoveWallet, setIsShowModalRemoveWallet] = useState(false);
  const onShowModalRecoveryPhrase = () => {
    setIsShowRecoveryPhrase(true);
  };
  const onShowModalEditAccountName = () => {
    setIsShowAccountName(true);
  };
  const onShowModalRemoveAccount = () => {
    setIsShowModalRemoveWallet(true);
  };
  const params: {
    keystoreIndex: string;
  } = useParams();

  const { keyRingStore, chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const address = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  console.log(params, "params");
  // const keyStore = location.state?.keyStore;
  const wallet = keyRingStore.multiKeyStoreInfo[Number(params.keystoreIndex)];
  console.log(wallet, "wallet");
  const onAddAccount = () => {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    return;
  };
  return (
    <LayoutWithButtonBottom
      onClickButtonBottom={onAddAccount}
      titleButton={"Add Wallet"}
      title={"edit account"}
    >
      <div className={styles.topBox}>
        <div className={styles.avatar}>
          <img
            className={styles.imgAvatar}
            src={require("../../public/assets/images/default-avatar.png")}
          />
        </div>
        <div className={styles.wrapText}>
          <span className={styles.titleWallet}>
            {wallet?.meta?.name || "..."}
          </span>
          <span className={styles.subTitleWallet}>
            {" "}
            {formatAddress(address)}
          </span>
        </div>
      </div>
      <div className={styles.accountActions}>
        <div onClick={onShowModalEditAccountName} className={styles.actionItem}>
          <span className={styles.leftTitle}>Account name</span>
          <div className={styles.blockRight}>
            <span className={styles.rightTitle}>
              {wallet?.meta?.name || "..."}
            </span>
            <img
              src={require("../../public/assets/svg/tdesign_chevron_right.svg")}
            />
          </div>
        </div>
        <div onClick={onShowModalRecoveryPhrase} className={styles.actionItem}>
          <span className={styles.leftTitle}>Reveal Recovery Phrase</span>
          <div className={styles.blockRight}>
            <img
              src={require("../../public/assets/svg/tdesign_chevron_right.svg")}
            />
          </div>
        </div>
        <div onClick={onShowModalRecoveryPhrase} className={styles.actionItem}>
          <span className={styles.leftTitle}>Reveal Private Key</span>
          <div className={styles.blockRight}>
            <img
              src={require("../../public/assets/svg/tdesign_chevron_right.svg")}
            />
          </div>
        </div>
        <div
          onClick={onShowModalRemoveAccount}
          className={`${styles.actionItem} ${styles.removeAccount}`}
        >
          <span className={styles.leftTitle}>Remove account</span>
        </div>
      </div>
      <ModalRecoveryPhrase
        isOpen={isShowRecoveryPhrase}
        onRequestClose={() => setIsShowRecoveryPhrase(false)}
      />
      <ModalEditAccountNamePage
        keyStoreIndex={Number(params.keystoreIndex)}
        isOpen={isShowAccountName}
        onRequestClose={() => setIsShowAccountName(false)}
      />
      <ModalRemoveAccount
        isOpen={isShowModalRemoveWallet}
        onRequestClose={() => setIsShowModalRemoveWallet(false)}
      />
    </LayoutWithButtonBottom>
  );
});

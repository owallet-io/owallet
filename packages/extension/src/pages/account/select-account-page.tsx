import React, { useCallback } from "react";
import styles from "./styles/select-account.module.scss";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import { useLoadingIndicator } from "../../components/loading-indicator";

export const SelectAccountPage = observer(() => {
  const history = useHistory();
  const onEditAccount = (keyStore) => {
    if (!keyStore) return;
    console.log(keyStore, "keyStore");
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index < 0) return;
    history.push(`/edit-account/${index}`);
    return;
  };
  const { keyRingStore } = useStore();
  const ledgerAccounts = keyRingStore.multiKeyStoreInfo.filter(
    (keyStore) => keyStore.type === "ledger"
  );
  const mnemonicAccounts = keyRingStore.multiKeyStoreInfo.filter(
    (keyStore) => keyStore.type === "mnemonic"
  );
  const privKeyAccounts = keyRingStore.multiKeyStoreInfo.filter(
    (keyStore) => keyStore.type === "privateKey"
  );
  const wallets = [
    {
      type: "Mnemonic",
      data: mnemonicAccounts,
    },
    {
      type: "Private Key",
      data: privKeyAccounts,
    },
    {
      type: "Ledger",
      data: ledgerAccounts,
    },
  ];
  const intl = useIntl();
  const loadingIndicator = useLoadingIndicator();
  const onSelectWallet = async (keyStore) => {
    if (keyStore.selected) return;
    loadingIndicator.setIsLoading("keyring", true);
    try {
      const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
      if (index >= 0) {
        await keyRingStore.changeKeyRing(index);
        // analyticsStore.logEvent("Account changed");
        loadingIndicator.setIsLoading("keyring", false);
        history.push("/");
      }
    } catch (e) {
      console.log(`Failed to change keyring: ${e.message}`);
      loadingIndicator.setIsLoading("keyring", false);
    }
  };
  const onAddAccount = () => {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    return;
  };
  return (
    <LayoutWithButtonBottom
      titleButton={"Add Wallet"}
      onClickButtonBottom={onAddAccount}
      title="Select Account"
    >
      {wallets.map((wallet, index) => {
        if (!wallet.data?.length || wallet.data?.length <= 0) return;
        return (
          <div key={`wallet+${index}`} className={styles.boxContainer}>
            <span className={styles.titleBox}>Imported by {wallet.type}</span>
            {wallet.data.map((keyStore, index) => {
              return (
                <div key={index} className={styles.itemBox}>
                  <div
                    onClick={() => onSelectWallet(keyStore)}
                    className={styles.mainItem}
                  >
                    <div className={styles.wrapAvatar}>
                      <img
                        className={styles.imgAvatar}
                        src={require("../../public/assets/images/default-avatar.png")}
                        alt="avatar"
                      />
                    </div>
                    <div className={styles.itemCenter}>
                      <span className={styles.title}>
                        {keyStore.meta?.name ||
                          intl.formatMessage({
                            id: "setting.keyring.unnamed-account",
                          })}
                      </span>
                      {keyStore.selected && (
                        <span className={styles.subTitle}>Current active</span>
                      )}
                    </div>
                  </div>
                  <div
                    onClick={() => onEditAccount(keyStore)}
                    className={styles.wrapBtn}
                  >
                    <img
                      className={styles.imgIcon}
                      src={require("../../public/assets/svg/tdesign_more.svg")}
                      alt="account"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </LayoutWithButtonBottom>
  );
});

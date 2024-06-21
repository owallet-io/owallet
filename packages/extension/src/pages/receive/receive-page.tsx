import React, { useEffect, useRef } from "react";
import styles from "./receive.module.scss";
import { HeaderNew } from "../../layouts/footer-layout/components/header";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useNotification } from "../../components/notification";
import { useIntl } from "react-intl";
import { ButtonCopy } from "../../components/buttons/button-copy";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");
export const ReceivePage = observer(() => {
  const { accountStore, chainStore, keyRingStore } = useStore();
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    true
  );
  const notification = useNotification();
  const intl = useIntl();
  useEffect(() => {
    if (qrCodeRef.current && address) {
      QrCode.toCanvas(qrCodeRef.current, address, {
        width: 280,
      });
    }
  }, [address]);
  const copyAddress = async (address: string) => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.address.copied",
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };
  return (
    <div className={styles.containerReceivePage}>
      <HeaderNew isGoBack isConnectDapp={false} />
      <span className={styles.title}>RECEIVE</span>
      <div className={styles.containerModal}>
        <span className={styles.titleModal}>
          Scan QR code or share address to sender
        </span>
        <canvas className={styles.qrcode} id="qrcode" ref={qrCodeRef} />
        <span className={styles.address}>{address}</span>
        <ButtonCopy title={"Copy address"} valueCopy={address} />
      </div>
    </div>
  );
});

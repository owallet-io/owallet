import React, { useEffect, useRef } from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./styles/reveal-private-key.module.scss";
import Colors from "../../theme/colors";
import { ButtonCopy } from "../../components/buttons/button-copy";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");
export const RevealPrivateKeyPage = () => {
  const pvKey =
    "03hfcedjd3483dhf93277q8dspq921649393dxjw82chbchchdcuea93k475736227r5677";
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (qrCodeRef.current && pvKey) {
      QrCode.toCanvas(qrCodeRef.current, pvKey, {
        width: 150,
      });
    }
  }, [pvKey]);
  return (
    <LayoutWithButtonBottom
      titleButton={"Already Backed Up"}
      title={"Reveal PRIVATE KEY"}
      backgroundColor={Colors["neutral-surface-card"]}
    >
      <div className={styles.container}>
        <div className={styles.alert}>
          <img src={require("../../public/assets/svg/ow_error-circle.svg")} />
          <span className={styles.textAlert}>
            DO NOT take a screenshot of this QR code
          </span>
        </div>
        <div className={styles.qrcodeContainer}>
          <canvas className={styles.qrcode} id="qrcode" ref={qrCodeRef} />
        </div>
        <div className={styles.contentPrivateKey}>
          <div className={styles.wrapTitle}>
            <img src={require("../../public/assets/svg/ow_key-alt.svg")} />
            <span className={styles.title}>Private key:</span>
          </div>
          <span className={styles.content}>{pvKey}</span>
        </div>
        <ButtonCopy valueCopy={pvKey} title={"Copy to clipboard"} />
      </div>
    </LayoutWithButtonBottom>
  );
};

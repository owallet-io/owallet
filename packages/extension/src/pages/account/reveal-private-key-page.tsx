import React, { useEffect, useRef, useState } from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./styles/reveal-private-key.module.scss";
import Colors from "../../theme/colors";
import { ButtonCopy } from "../../components/buttons/button-copy";
import { ModalRecoveryPhrase } from "./modals/modal-recovery-phrase";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");
export const RevealPrivateKeyPage = () => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const [keyring, setKeyring] = useState<string>();
  const privKey = keyring?.length > 0 ? `0x${keyring}` : "";
  const [isShowRecoveryPhrase, setIsShowRecoveryPhrase] = useState(false);
  const params: {
    keystoreIndex: string;
  } = useParams();
  useEffect(() => {
    if (qrCodeRef.current && privKey) {
      QrCode.toCanvas(qrCodeRef.current, privKey, {
        width: 150,
      });
    }
  }, [privKey]);
  const history = useHistory();
  useEffect(() => {
    if (keyring?.length > 0) return;
    setIsShowRecoveryPhrase(true);
  }, [keyring]);

  return (
    <LayoutWithButtonBottom
      titleButton={"Already Backed Up"}
      title={"Reveal PRIVATE KEY"}
      onClickButtonBottom={() => history.goBack()}
      backgroundColor={Colors["neutral-surface-card"]}
    >
      <div className={styles.container}>
        <div className={styles.alert}>
          <img src={require("assets/svg/ow_error-circle.svg")} />
          <span className={styles.textAlert}>
            DO NOT take a screenshot of this QR code
          </span>
        </div>
        <div className={styles.qrcodeContainer}>
          <canvas className={styles.qrcode} id="qrcode" ref={qrCodeRef} />
        </div>
        <div className={styles.contentPrivateKey}>
          <div className={styles.wrapTitle}>
            <img src={require("assets/svg/ow_key-alt.svg")} />
            <span className={styles.title}>Private key:</span>
          </div>
          <span className={styles.content}>{privKey}</span>
        </div>
        <ButtonCopy valueCopy={privKey} title={"Copy to clipboard"} />
      </div>
      <ModalRecoveryPhrase
        onKeyring={(keyring) => {
          if (!keyring) return;
          setKeyring(keyring);
          setIsShowRecoveryPhrase(false);
        }}
        isOpen={isShowRecoveryPhrase}
        keyStoreIndex={Number(params.keystoreIndex)}
        onRequestClose={() => {
          history.goBack();
          return;
        }}
      />
    </LayoutWithButtonBottom>
  );
};

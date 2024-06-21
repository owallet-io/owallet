import React, { useState } from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./styles/reveal-recovery-phrase.module.scss";
import { ButtonCopy } from "../../components/buttons/button-copy";

import classnames from "classnames";
import Colors from "../../theme/colors";

const dataFake = [
  "tomado",
  "kaa",
  "lao",
  "teaske",
  "puma",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
  "tomado",
];
export const RevealRecoveryPhrasePage = () => {
  const [isShowPhrase, setIsShowPhrase] = useState(false);
  const onShowPhrase = () => {
    setIsShowPhrase(true);
  };
  return (
    <LayoutWithButtonBottom
      backgroundColor={Colors["neutral-surface-card"]}
      title={"Reveal Recovery Phrase"}
      titleButton={"Already Backed Up"}
    >
      <div className={styles.container}>
        <span className={styles.title}>
          Write down this recovery phrase in the exact order and keep it in a
          safe place
        </span>
        <div className={styles.wrapBox}>
          <div
            className={classnames([
              styles.boxRecoveryPhrase,
              !isShowPhrase ? styles.hide : styles.show,
            ])}
          >
            {dataFake.map((item, index) => (
              <div key={index.toString()} className={styles.itemRecoveryPhrase}>
                <span className={styles.number}>{index + 1}</span>
                <span className={styles.name}>{item}</span>
              </div>
            ))}
          </div>
          {!isShowPhrase && (
            <span onClick={onShowPhrase} className={styles.clickHere}>
              Click here to reveal the phrase
            </span>
          )}
        </div>
        <ButtonCopy title={"Copy to clipboard"} valueCopy={"passphrase"} />
      </div>
    </LayoutWithButtonBottom>
  );
};

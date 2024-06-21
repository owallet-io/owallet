import React from "react";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./reveal-recovery-phrase.module.scss";
import { ButtonCopy } from "../../components/buttons/button-copy";
import { Colors } from "../../helpers/constant";

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
        <div className={styles.boxRecoveryPhrase}>
          {dataFake.map((item, index) => (
            <div key={index.toString()} className={styles.itemRecoveryPhrase}>
              <span className={styles.number}>{index + 1}</span>
              <span className={styles.name}>{item}</span>
            </div>
          ))}
        </div>
        <ButtonCopy valueCopy={"passphrase"} />
      </div>
    </LayoutWithButtonBottom>
  );
};

import React, { FC } from "react";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import colors from "theme/colors";

export const NotificationCard: FC<{}> = observer(({}) => {
  return (
    <div className={styles.containerInfoAccountCard} style={{ marginTop: 16 }}>
      <div
        style={{
          color: colors["neutral-text-body"]
        }}
      >
        Big update soon! Secure your seed phrase to keep your account safe. 🎈
      </div>
    </div>
  );
});

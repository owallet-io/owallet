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
        🎈 Exciting news! A major update is on the way, bringing fresh features,
        improvements, and more. Stay tuned—things are about to get even better!
      </div>
    </div>
  );
});

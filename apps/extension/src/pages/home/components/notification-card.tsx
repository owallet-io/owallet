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
        Exciting update coming your way—new features and improvements are
        dropping soon. Stay tuned! 🎈
      </div>
    </div>
  );
});

import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { SignDocHelper } from "@owallet/hooks";

import style from "./style.module.scss";

export const DataTab: FunctionComponent<{
  signDocJsonAll: any;
}> = observer(({ signDocJsonAll }) => {
  return (
    <pre
      className={style.message}
      style={{
        color: "#353945",
        fontSize: 12,
      }}
    >
      {JSON.stringify(signDocJsonAll, undefined, 2)}
    </pre>
  );
});

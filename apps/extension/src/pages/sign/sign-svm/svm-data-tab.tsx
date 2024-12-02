import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";

import style from "../style.module.scss";

export const SvmDataTab: FunctionComponent<{
  data: object;
}> = observer(({ data }) => {
  return (
    <pre
      style={{
        height: 250,
      }}
      className={style.message}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
});

import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

export const DataTabEvm: FunctionComponent<{
  data: object;
}> = observer(({ data }) => {
  return <pre className={style.message}>{JSON.stringify(data, null, 2)}</pre>;
});

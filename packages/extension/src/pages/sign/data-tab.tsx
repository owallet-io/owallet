import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { SignDocHelper } from "@owallet/hooks";

import style from "./style.module.scss";
import { Buffer } from "buffer/";

export const DataTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
}> = observer(({ signDocHelper }) => {
  const { signDocJson } = signDocHelper;

  const messages =
    signDocJson?.txBody?.messages &&
    signDocJson.txBody.messages.map((mess) => {
      return {
        ...mess,
        msg: mess?.msg ? Buffer.from(mess?.msg).toString("base64") : "",
      };
    });
  const signDocJsonAll = messages
    ? {
        ...signDocJson,
        txBody: {
          messages,
        },
      }
    : signDocJson;

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

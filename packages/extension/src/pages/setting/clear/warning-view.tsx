import React, { FunctionComponent, MouseEvent, useCallback } from "react";

import styleWarningView from "./warning-view.module.scss";
import { Alert, Button } from "reactstrap";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";

import { MultiKeyStoreInfoWithSelectedElem } from "@owallet/background";

export const WarningView: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
}> = ({ index, keyStore }) => {
  const history = useHistory();

  const onBackUpMnemonicButtonClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      history.push(`/setting/export/${index}`);
    },
    [history, index]
  );

  return (
    <div className={styleWarningView.innerContainer}>
      {keyStore.type === "mnemonic" ? (
        <div
          style={{
            width: 344,
            backgroundColor: "rgba(119, 126, 144, 0.08)",
            fontSize: 14,
            color: "#777E90",
            fontWeight: 500,
            padding: "10px 20px 10px 20px",
            borderRadius: 20,
          }}
        >
          <div>
            Make sure you've backed up yourmnemonic seed before proceeding.
          </div>
          <Button
            size="sm"
            color=""
            style={{
              color: "white",
              backgroundColor: "#7664E4",
              marginTop: 10,
            }}
            onClick={onBackUpMnemonicButtonClick}
          >
            <FormattedMessage id="setting.clear.button.back-up" />
          </Button>
        </div>
      ) : null}
      <div style={{ height: 20 }} />
      <div className={styleWarningView.trashContainer}>
        <img
          src={require("../../../public/assets/img/trash-can.svg")}
          alt="trash-can"
        />
      </div>
      <div className={styleWarningView.textTrash}>
        <FormattedMessage id="setting.clear.warning" />
      </div>
    </div>
  );
};

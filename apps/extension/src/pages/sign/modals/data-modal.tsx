import React, { FunctionComponent, ReactElement, useState } from "react";
import { observer } from "mobx-react-lite";
import style from "../style.module.scss";
import { Button } from "../../../components/common/button";
import colors from "../../../theme/colors";
import { Text } from "../../../components/common/text";

export const DataModal: FunctionComponent<{
  onClose: () => void;
  renderData: () => ReactElement;
}> = observer(({ onClose, renderData }) => {
  return (
    <div className={style.feeModal} style={{ height: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          paddingBottom: 0,
        }}
      >
        <span />
        <Text size={16} weight="700">
          {"raw data".toUpperCase()}
        </Text>
        <div onClick={onClose}>
          <img src={require("assets/icon/circle-del.svg")} alt="" />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          borderBottom: "1px solid" + colors["neutral-border-default"],
          alignItems: "center",
        }}
      >
        <div
          style={{
            height: "60%",
            overflow: "scroll",
            backgroundColor: colors["neutral-surface-bg"],
            borderRadius: 12,
            padding: 8,
            width: "100vw",
          }}
        >
          {renderData()}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid" + colors["neutral-border-default"],
          position: "absolute",
          bottom: 0,
          width: "100%",
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: colors["neutral-surface-card"],
        }}
      >
        <div
          style={{
            marginLeft: 16,
            marginRight: 16,
          }}
        >
          <Button onClick={onClose}>Confirm</Button>
        </div>
      </div>
    </div>
  );
});

import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { FeeConfig, GasConfig } from "@owallet/hooks";
import style from "../style.module.scss";
import { Button } from "../../../components/common/button";
import colors from "../../../theme/colors";
import { Text } from "../../../components/common/text";
import ReactSwitch from "react-switch";

export const FeeModal: FunctionComponent<{
  feeConfig: FeeConfig;
  gasConfig: GasConfig;
  onClose: () => void;
}> = observer(({ feeConfig, gasConfig, onClose }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  return (
    <div className={style.feeModal} style={{}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
        }}
      >
        <span />
        <Text size={16} weight="700">
          {"set fee".toUpperCase()}
        </Text>
        <div onClick={onClose}>
          <img
            src={require("../../../public/assets/icon/circle-del.svg")}
            alt=""
          />
        </div>
      </div>
      <h4>Toggle switch in React</h4>
      <ReactSwitch
        onColor={colors["highlight-surface-active"]}
        uncheckedIcon={false}
        checkedIcon={false}
        checked={isOn}
        onChange={handleToggle}
        height={24}
        width={40}
      />

      <div
        style={{
          borderTop: "1px solid" + colors["neutral-border-default"],
          position: "absolute",
          bottom: 0,
          width: "100%",
          paddingBottom: 16,
          paddingTop: 8,
        }}
      >
        <div
          style={{
            marginLeft: 16,
            marginRight: 16,
          }}
        >
          <Button>Confirm</Button>
        </div>
      </div>
    </div>
  );
});

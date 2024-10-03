import React, { FunctionComponent, useEffect, useState } from "react";
import { BasicSettingItem } from "../components";
import { Toggle } from "../../../components/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import delay from "delay";

export const SettingSwitchOsmosisItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { appInitStore } = useStore();

  const [toggle, setToggle] = useState(
    appInitStore.getInitApp.wallet == "osmosis" ? true : false
  );

  const handleUpdateWalletTheme = async (toggle, theme) => {
    if (toggle && theme !== "osmosis") {
      await delay(130);
      appInitStore.updateWalletTheme("osmosis");
    } else if (!toggle && theme === "osmosis") {
      await delay(130);
      appInitStore.updateWalletTheme("owallet");
    }
  };

  useEffect(() => {
    handleUpdateWalletTheme(toggle, appInitStore.getInitApp.wallet);
  }, [toggle, appInitStore.getInitApp.wallet]);

  return (
    <React.Fragment>
      <BasicSettingItem
        icon="tdesign_moon"
        paragraph="Osmosis mode"
        right={
          <Toggle
            on={toggle}
            onChange={(value) => {
              setToggle(value);
            }}
          />
        }
        topBorder={topBorder}
      />
    </React.Fragment>
  );
});

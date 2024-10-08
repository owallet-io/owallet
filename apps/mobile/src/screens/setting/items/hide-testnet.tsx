import React, { FunctionComponent, useEffect, useState } from "react";
import { BasicSettingItem } from "../components";
import { Toggle } from "../../../components/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import delay from "delay";

export const SettingSwitchHideTestnet: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { appInitStore } = useStore();

  const [toggle, setToggle] = useState(
    appInitStore.getInitApp.hideTestnet ? true : false
  );

  useEffect(() => {
    handleUpdateHideTestnet(toggle);
  }, [toggle, appInitStore.getInitApp.hideTestnet]);

  const handleUpdateHideTestnet = async (toggle) => {
    await delay(130);
    appInitStore.updateHideTestnet(toggle);
  };
  return (
    <React.Fragment>
      <BasicSettingItem
        icon="tdesignbrowse-off"
        paragraph="Hide Testnet"
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

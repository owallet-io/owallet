import React, { FunctionComponent, useEffect, useState } from "react";
import { BasicSettingItem } from "../components";
import { Toggle } from "../../../components/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const HideTokensItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { appInitStore } = useStore();
  const [toggle, setToggle] = useState(
    appInitStore.getInitApp.hideTokensWithoutBalance
  );
  useEffect(() => {
    appInitStore.updateHideTokensWithoutBalance(toggle);
  }, [toggle]);
  return (
    <React.Fragment>
      <BasicSettingItem
        icon="tdesigncurrency-exchange"
        paragraph="Hide tokens < 0"
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

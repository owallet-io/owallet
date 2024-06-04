import React, { FunctionComponent, useEffect, useState } from "react";
import { BasicSettingItem } from "../components";
import { Toggle } from "../../../components/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const HideTokensItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { appInitStore } = useStore();

  return (
    <React.Fragment>
      <BasicSettingItem
        icon="tdesigncurrency-exchange"
        paragraph="Hide tokens < 0"
        right={
          <Toggle
            on={appInitStore.getInitApp.hideTokensWithoutBalance}
            onChange={(value) => {
              appInitStore.updateHideTokensWithoutBalance(value);
            }}
          />
        }
        topBorder={topBorder}
      />
    </React.Fragment>
  );
});

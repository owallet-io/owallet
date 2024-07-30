import React from "react";
import { explorerData } from "@src/screens/web/helper/browser-helper";
import { observer } from "mobx-react-lite";
import { ListDapp } from "@src/screens/web/components/list-dapp";
export const ExplorerRoute = observer(() => {
  return <ListDapp data={explorerData} />;
});

import React from "react";
import { defiData } from "@src/screens/web/helper/browser-helper";
import { observer } from "mobx-react-lite";
import { ListDapp } from "@src/screens/web/components/list-dapp";
export const DefiRoute = observer(() => {
  return <ListDapp data={defiData} />;
});

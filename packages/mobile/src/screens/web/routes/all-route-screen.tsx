import { observer } from "mobx-react-lite";
import React from "react";
import { dataAll } from "@src/screens/web/helper/browser-helper";
import { ListDapp } from "@src/screens/web/components/list-dapp";

export const AllRoute = observer(() => {
  return <ListDapp data={dataAll} />;
});

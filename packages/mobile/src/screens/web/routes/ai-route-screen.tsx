import React from "react";
import { aiData } from "@src/screens/web/helper/browser-helper";
import { observer } from "mobx-react-lite";
import { ListDapp } from "@src/screens/web/components/list-dapp";

export const AiRoute = observer(() => {
  return <ListDapp data={aiData} />;
});

import { useStore } from "@src/stores";
import { observer } from "mobx-react-lite";
import React from "react";
import { AddTokenCosmosScreen } from "./add-token-cosmos";
import { AddTokenEVMScreen } from "./add-token-evm";
export const AddTokenScreen = observer(() => {
  const { chainStore } = useStore();

  return (
    <>
      {chainStore.current.features.includes("cosmwasm") ? (
        <AddTokenCosmosScreen />
      ) : (
        <AddTokenEVMScreen />
      )}
    </>
  );
});

import { useStore } from '@src/stores';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { AddTokenCosmosScreen } from './add-token-cosmos';
import { AddTokenEVMScreen } from './add-token-evm';
import { AddTokenTronScreen } from './add-token-tron';
import { TRON_ID } from '@owallet/common';

export const AddTokenScreen = observer(() => {
  const { chainStore } = useStore();

  return chainStore.current.chainId === TRON_ID ? (
    <AddTokenTronScreen />
  ) : (
    <>
      {chainStore.current.features.includes('cosmwasm') || chainStore.current.features.includes('secretwasm') ? (
        <AddTokenCosmosScreen />
      ) : (
        <AddTokenEVMScreen />
      )}
    </>
  );
});

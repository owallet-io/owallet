import React from 'react';
import { InjData } from '@src/screens/web/helper/browser-helper';
import { observer } from 'mobx-react-lite';
import { ListDapp } from '@src/screens/web/components/list-dapp';
export const InjRoute = observer(() => {
  return <ListDapp data={InjData} />;
});

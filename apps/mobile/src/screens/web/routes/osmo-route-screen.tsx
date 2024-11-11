import React from 'react';
import { OsmoData } from '@src/screens/web/helper/browser-helper';
import { observer } from 'mobx-react-lite';
import { ListDapp } from '@src/screens/web/components/list-dapp';
export const OsmoRoute = observer(() => {
  return <ListDapp data={OsmoData} />;
});

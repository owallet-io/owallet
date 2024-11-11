import React, { FunctionComponent, useEffect, useState } from 'react';
import { BasicSettingItem } from '../components';
import { Toggle } from '../../../components/toggle';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import delay from 'delay';
import { ChainIdEnum } from '@owallet/common';

export const SettingSwitchHideTestnet: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { appInitStore, chainStore } = useStore();

  const [toggle, setToggle] = useState(appInitStore.getInitApp.hideTestnet ? true : false);

  useEffect(() => {
    handleUpdateHideTestnet(toggle);
  }, [toggle, appInitStore.getInitApp.hideTestnet]);

  const handleUpdateHideTestnet = async toggle => {
    await delay(130);
    appInitStore.updateHideTestnet(!toggle);

    if (!toggle && chainStore.current.chainName.toLocaleLowerCase().includes('test')) {
      appInitStore.selectAllNetworks(true);

      chainStore.selectChain(ChainIdEnum.Oraichain);
      await chainStore.saveLastViewChainId();
    }
  };
  return (
    <React.Fragment>
      <BasicSettingItem
        icon="tdesignbrowse-off"
        paragraph="Show Testnet"
        right={
          <Toggle
            on={toggle}
            onChange={value => {
              setToggle(value);
            }}
          />
        }
        topBorder={topBorder}
      />
    </React.Fragment>
  );
});

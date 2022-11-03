import React, { FunctionComponent } from 'react';
import { SettingItem } from '../components';
import { Toggle } from '../../../components/toggle';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

export const SettingSwitchModeItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { appInitStore } = useStore();

  return (
    <React.Fragment>
      <SettingItem
        label="Dark mode"
        right={
          <Toggle
            on={appInitStore.getInitApp.theme === 'dark'}
            onChange={async value => {
              if (value) {
                await appInitStore.updateTheme('dark');
              } else {
                try {
                  await appInitStore.updateTheme('light');
                } catch (e) {
                  console.log(e);
                }
              }
            }}
          />
        }
        topBorder={topBorder}
      />
    </React.Fragment>
  );
});

import { EVENTS, SCREENS_OPTIONS } from '@src/common/constants';
import { useStore } from '@src/stores';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

const useHiddenTabBar = observer((routeName) => {
  const { appInitStore } = useStore();
    useEffect(() => {
      appInitStore.updateVisibleTabBar(routeName);
      return () => {};
    }, []);
  
    return true;
});
export default useHiddenTabBar;

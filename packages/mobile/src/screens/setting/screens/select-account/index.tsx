import React, { FunctionComponent, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../../stores';
import { PageWithScrollViewInBottomTabView } from '../../../../components/page';
import { KeyStoreItem, KeyStoreSectionTitle } from '../../components';
import Svg, { Path } from 'react-native-svg';
import { useStyle } from '../../../../styles';
import { useLoadingScreen } from '../../../../providers/loading-screen';
import {
  MultiKeyStoreInfoElem,
  MultiKeyStoreInfoWithSelectedElem
} from '@owallet/background';
import { View } from 'react-native';
import { useSmartNavigation } from '../../../../navigation.provider';

const CheckIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 19 17"
      style={{
        height,
        aspectRatio: 19 / 17
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M18 1L7.448 16 1 7.923"
      />
    </Svg>
  );
};

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => !keyStore.type || keyStore.type === 'mnemonic'
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === 'ledger'
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === 'privateKey' && !keyStore.meta?.email
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const loadingScreen = useLoadingScreen();

  const selectKeyStore = async (
    keyStore: MultiKeyStoreInfoWithSelectedElem
  ) => {
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index >= 0) {
      await loadingScreen.openAsync();
      await keyRingStore.changeKeyRing(index);
      loadingScreen.setIsLoading(false);

      smartNavigation.navigateSmart('Home', {});
    }
  };

  const renderKeyStores = (
    title: string,
    keyStores: MultiKeyStoreInfoWithSelectedElem[]
  ) => {
    return (
      <>
        {keyStores.length > 0 ? (
          <>
            <KeyStoreSectionTitle title={title} />
            {keyStores.map((keyStore, i) => {
              return (
                <KeyStoreItem
                  key={i.toString()}
                  label={keyStore.meta?.name || 'OWallet Account'}
                  onPress={async () => {
                    analyticsStore.logEvent('Account changed');
                    await selectKeyStore(keyStore);
                  }}
                />
              );
            })}
          </>
        ) : null}
      </>
    );
  };

  return (
    <PageWithScrollViewInBottomTabView>
      {renderKeyStores('mnemonic seed', mnemonicKeyStores)}
      {renderKeyStores('hardware wallet', ledgerKeyStores)}
      {renderKeyStores('private key', privateKeyStores)}
      {/* Margin bottom for last */}
      <View style={style.get('height-16')} />
    </PageWithScrollViewInBottomTabView>
  );
});

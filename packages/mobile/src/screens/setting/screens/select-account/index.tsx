import React, { FunctionComponent, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { KeyStoreItem, KeyStoreSectionTitle } from "../../components";
import Svg, { Path } from "react-native-svg";
import { useLoadingScreen } from "../../../../providers/loading-screen";
import {
  MultiKeyStoreInfoElem,
  MultiKeyStoreInfoWithSelectedElem,
} from "@owallet/background";
import { View } from "react-native";
import { useSmartNavigation } from "../../../../navigation.provider";
import { useTheme } from "@src/themes/theme-provider";

export const getKeyStoreParagraph = (keyStore: MultiKeyStoreInfoElem) => {
  const bip44HDPath = keyStore.bip44HDPath
    ? keyStore.bip44HDPath
    : {
        coinType: 0,
        account: 0,
        change: 0,
        addressIndex: 0,
      };

  switch (keyStore.type) {
    case "ledger":
      return `Ledger - m/44'/${bip44HDPath.coinType}'/${bip44HDPath.account}'${
        bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
          ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
          : ""
      }`;
    case "mnemonic":
      if (
        bip44HDPath.account !== 0 ||
        bip44HDPath.change !== 0 ||
        bip44HDPath.addressIndex !== 0
      ) {
        return `Mnemonic - m/44'/-/${bip44HDPath.account}'${
          bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
            ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
            : ""
        }`;
      }
      return;
    case "privateKey":
      // Torus key
      if (keyStore.meta?.email) {
        return keyStore.meta.email;
      }
      return;
  }
};

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  const { colors } = useTheme();

  const smartNavigation = useSmartNavigation();

  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => !keyStore.type || keyStore.type === "mnemonic"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === "ledger"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === "privateKey"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const loadingScreen = useLoadingScreen();

  const selectKeyStore = async (
    keyStore: MultiKeyStoreInfoWithSelectedElem
  ) => {
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index >= 0) {
      await keyRingStore.changeKeyRing(index);
      smartNavigation.navigateSmart("Home", {});
    }
  };
  const handleOnKeyStore = useCallback(async (keyStore) => {
    loadingScreen.setIsLoading(true);
    analyticsStore.logEvent("Account changed");
    await selectKeyStore(keyStore);
    loadingScreen.setIsLoading(false);
  }, []);
  const renderKeyStores = (
    title: string,
    keyStores: MultiKeyStoreInfoWithSelectedElem[]
  ) => {
    return (
      <React.Fragment>
        {keyStores.length > 0 ? (
          <React.Fragment>
            <KeyStoreSectionTitle title={title} />
            {keyStores.map((keyStore, i) => {
              return (
                <KeyStoreItem
                  key={i.toString()}
                  colors={colors}
                  label={keyStore.meta?.name || "OWallet Account"}
                  paragraph={getKeyStoreParagraph(keyStore)}
                  topBorder={i === 0}
                  bottomBorder={keyStores.length - 1 !== i}
                  active={keyStore.selected}
                  onPress={() => handleOnKeyStore(keyStore)}
                />
              );
            })}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors["background"]}>
      {renderKeyStores("mnemonic seed", mnemonicKeyStores)}
      {renderKeyStores("hardware wallet", ledgerKeyStores)}
      {renderKeyStores("private key", privateKeyStores)}
      {/* Margin bottom for last */}
      <View style={{ height: 16 }} />
    </PageWithScrollViewInBottomTabView>
  );
});

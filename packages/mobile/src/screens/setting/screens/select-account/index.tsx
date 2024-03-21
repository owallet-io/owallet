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
import { ScrollView, View } from "react-native";
import { useSmartNavigation } from "../../../../navigation.provider";
import { useTheme } from "@src/themes/theme-provider";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { metrics } from "@src/themes";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";

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
  const { keyRingStore, analyticsStore, universalSwapStore } = useStore();

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
    universalSwapStore.setLoaded(false);
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
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Add wallets"
          onPress={() => {}}
          style={{
            marginTop: 20,
            borderRadius: 999,
            width: metrics.screenWidth - 32,
          }}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
          }}
        />
      }
    >
      <PageHeader title="Manage wallet" colors={colors} />
      <ScrollView
        contentContainerStyle={{ height: metrics.screenHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <OWCard type="normal">
            <OWText color={colors["neutral-text-title"]} size={12}>
              Recipient
            </OWText>
          </OWCard>

          <OWCard type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomColor: colors["neutral-border-default"],
                borderBottomWidth: 1,
                paddingVertical: 16,
                marginBottom: 8,
              }}
            ></View>

            <OWText color={colors["neutral-text-title"]} size={12}>
              Memo
            </OWText>
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );

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

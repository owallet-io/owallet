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
import { Image, ScrollView, View } from "react-native";

import { useTheme } from "@src/themes/theme-provider";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { metrics } from "@src/themes";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { RadioButton } from "react-native-radio-buttons-group";
import { useNavigation } from "@react-navigation/native";
import { waitAccountInit } from "@src/screens/unlock/pincode-unlock";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
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
  const {
    keyRingStore,
    chainStore,
    analyticsStore,
    universalSwapStore,
    accountStore,
  } = useStore();

  const { colors } = useTheme();

  const navigation = useNavigation();

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
      await waitAccountInit(chainStore, accountStore, keyRingStore);
      navigate(SCREENS.Home);
    }
  };
  const handleOnKeyStore = useCallback(async (keyStore) => {
    loadingScreen.setIsLoading(true);
    universalSwapStore.setLoaded(false);
    universalSwapStore.clearAmounts();
    analyticsStore.logEvent("Account changed");
    await selectKeyStore(keyStore);

    loadingScreen.setIsLoading(false);
    universalSwapStore.setLoaded(true);
  }, []);

  const renderKeyStoreItem = (keyStore, i) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 12,
        }}
        key={i.toString()}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              marginRight: 12,
            }}
            source={require("../../../../assets/images/default-avatar.png")}
            resizeMode="contain"
            fadeDuration={0}
          />
          <OWText color={colors["neutral-text-title"]} size={14} weight="600">
            {keyStore.meta?.name || "OWallet Account"}
          </OWText>
        </View>
        <RadioButton
          color={
            keyStore.selected
              ? colors["highlight-surface-active"]
              : colors["neutral-text-body"]
          }
          id={i.toString()}
          selected={keyStore.selected}
          onPress={() => handleOnKeyStore(keyStore)}
        />
      </View>
    );
  };

  const renderKeyStores = (
    title: string,
    keyStores: MultiKeyStoreInfoWithSelectedElem[]
  ) => {
    return keyStores.length > 0 ? (
      <OWCard style={{ marginBottom: 12 }} type="normal">
        {keyStores.length > 0 ? (
          <React.Fragment>
            <OWText
              style={{ marginBottom: 12 }}
              color={colors["neutral-text-title"]}
              size={16}
              weight="600"
            >
              Imported by {title}
            </OWText>
            {keyStores.map((keyStore, i) => {
              return renderKeyStoreItem(keyStore, i);
              // return (
              // <KeyStoreItem
              //   key={i.toString()}
              //   colors={colors}
              //   label={keyStore.meta?.name || "OWallet Account"}
              //   paragraph={getKeyStoreParagraph(keyStore)}
              //   topBorder={i === 0}
              //   bottomBorder={keyStores.length - 1 !== i}
              //   active={keyStore.selected}
              //   onPress={() => handleOnKeyStore(keyStore)}
              // />
              //);
            })}
          </React.Fragment>
        ) : null}
      </OWCard>
    ) : null;
  };

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Add wallets"
          onPress={() => {
            navigate(SCREENS.RegisterIntro, {
              canBeBack: true,
            });
          }}
          style={{
            marginTop: 20,
            borderRadius: 999,
            width: metrics.screenWidth - 32,
          }}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      }
    >
      <PageHeader title="Manage wallet" colors={colors} />
      <ScrollView
        style={{ height: metrics.screenHeight / 1.4 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {renderKeyStores("Mnemonic seed", mnemonicKeyStores)}
          {renderKeyStores("Ledger", ledgerKeyStores)}
          {renderKeyStores("Private key", privateKeyStores)}
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});

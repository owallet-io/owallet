import React, { FunctionComponent, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

import { useLoadingScreen } from "../../../../providers/loading-screen";

import { Image, ScrollView, View } from "react-native";

import { useTheme } from "@src/themes/theme-provider";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { metrics } from "@src/themes";

import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { RadioButton } from "react-native-radio-buttons-group";
import { useNavigation } from "@react-navigation/native";
import { goBack, navigate, resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyInfo } from "@owallet/background";

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const { keyRingStore, chainStore, universalSwapStore, accountStore } =
    useStore();

  const { colors } = useTheme();

  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.keyInfos.filter(
      (keyStore) => !keyStore.type || keyStore.type === "mnemonic"
    );
  }, [keyRingStore.keyInfos]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.keyInfos.filter(
      (keyStore) => keyStore.type === "ledger"
    );
  }, [keyRingStore.keyInfos]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.keyInfos.filter(
      (keyStore) => keyStore.type === "private-key"
    );
  }, [keyRingStore.keyInfos]);

  const loadingScreen = useLoadingScreen();

  const selectKeyStore = async (keyStore: KeyInfo) => {
    await keyRingStore.selectKeyRing(keyStore.id);
    await chainStore.waitSyncedEnabledChains();
  };
  const handleOnKeyStore = async (keyStore: KeyInfo) => {
    if (keyRingStore.selectedKeyInfo.id === keyStore.id) {
      return;
    }
    // loadingScreen.setIsLoading(true);
    universalSwapStore.setLoaded(false);
    universalSwapStore.clearAmounts();
    await selectKeyStore(keyStore);
    // loadingScreen.setIsLoading(false);
    universalSwapStore.setLoaded(true);
    goBack();
  };

  const renderKeyStoreItem = (keyStore: KeyInfo, i) => {
    return (
      <TouchableOpacity
        onPress={() => handleOnKeyStore(keyStore)}
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
            {keyStore.name || "OWallet Account"}
          </OWText>
        </View>
        <RadioButton
          color={
            keyStore.isSelected
              ? colors["highlight-surface-active"]
              : colors["neutral-text-body"]
          }
          id={i.toString()}
          selected={keyStore.isSelected}
        />
      </TouchableOpacity>
    );
  };

  const renderKeyStores = (title: string, keyStores) => {
    return keyStores.length > 0 ? (
      <OWCard
        style={{
          marginBottom: 12,
          backgroundColor: colors["neutral-surface-card"],
        }}
        type="normal"
      >
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

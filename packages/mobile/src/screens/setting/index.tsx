import React, { FunctionComponent, useMemo } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { renderFlag, SettingItem, SettingSectionTitle } from "./components";

import { OWBox } from "@src/components/card";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { DownArrowIcon } from "../../components/icon";
import { useStore } from "../../stores";
import { spacing, typography } from "../../themes";
import { CountryModal } from "./components/country-modal";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { SettingRemoveAccountItem } from "./items/remove-account";
import { SettingSwitchModeItem } from "./items/switch-mode";
import { SettingViewPrivateDataItem } from "./items/view-private-data";
import { canShowPrivateData } from "./screens/view-private-data";
import { tracking } from "@src/utils/tracking";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, priceStore, modalStore } = useStore();
  const { colors } = useTheme();
  tracking(`Setting Screen`);
  const styles = styling(colors);
  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key?.toUpperCase(),
      };
    });
  }, [priceStore.supportedVsCurrencies]);
  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const _onPressCountryModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      CountryModal({
        data: currencyItems,
        current: priceStore.defaultVsCurrency,
        priceStore,
        modalStore,
        colors,
      })
    );
  };

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors["background"]}>
      <ImageBackground
        style={{
          ...styles.containerScreen,
        }}
        resizeMode="cover"
        source={require("../../assets/image/bg_gradient.png")}
      >
        <Text
          style={{
            ...styles.title,
          }}
        >
          Settings
        </Text>
        <OWBox
          type="shadow"
          style={{
            ...styles.containerInfo,
          }}
        >
          <TouchableOpacity
            onPress={() => navigate(SCREENS.SettingSelectAccount, {})}
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  ...typography["text-caption2"],
                  color: colors["primary-text"],
                }}
              >
                WALLET
              </Text>
              <Text
                style={{
                  ...typography["h6"],
                  color: colors["primary-text"],
                  fontWeight: "bold",
                }}
              >
                {selected
                  ? selected.meta?.name || "OWallet Account"
                  : "No Account"}
              </Text>
            </View>
            <DownArrowIcon color={colors["primary-text"]} height={12} />
          </TouchableOpacity>
        </OWBox>
      </ImageBackground>

      <OWBox
        style={{
          marginTop: 0,
          marginBottom: 20,
          paddingHorizontal: 0,
        }}
      >
        <SettingSectionTitle title="Security" />
        {canShowPrivateData(keyRingStore.keyRingType) && (
          <SettingViewPrivateDataItem />
        )}

        <SettingItem
          label="Address book"
          onPress={() => {
            navigate(SCREENS.AddressBook, {});
          }}
        />

        {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
          <SettingBiometricLockItem
          // topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
          />
        ) : null}
        {/* <SettingSectionTitle title="Others" /> */}
        <SettingSwitchModeItem />
        <SettingItem
          label="About OWallet"
          onPress={() => {
            navigate(SCREENS.SettingVersion, {});
          }}
        />
        <SettingRemoveAccountItem />
      </OWBox>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: object) =>
  StyleSheet.create({
    shadowBox: {
      shadowColor: colors["splash-background"],
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowRadius: 5,
      shadowOpacity: 1.0,
    },
    containerScreen: {
      padding: 24,
      paddingTop: 76,
      paddingBottom: 101,
      marginBottom: 102,
      borderTopLeftRadius: Platform.OS === "ios" ? 32 : 0,
      borderTopRightRadius: Platform.OS === "ios" ? 32 : 0,
      // borderBottomLeftRadius: Platform.OS === 'ios' ? 32 : 0,
      // borderBottomRightRadius: Platform.OS === 'ios' ? 32 : 0
    },
    title: {
      ...typography.h1,
      color: colors["white"],
      textAlign: "center",
      fontWeight: "700",
    },
    containerInfo: {
      position: "absolute",
      height: 160,
      margin: 24,
      marginTop: 150,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      backgroundColor: colors["neutral-surface-bg2"],
    },
  });

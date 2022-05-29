import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
// import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from "../../navigation";
import { SettingFiatCurrencyItem } from "./items/fiat-currency";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SettingRemoveAccountItem } from "./items/remove-account";
import { canShowPrivateData } from "./screens/view-private-data";
import { SettingViewPrivateDataItem } from "./items/view-private-data";
import { useStyle } from "../../styles";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, priceStore } = useStore();

  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  useLogScreenView("Setting");

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={style.get('color-setting-screen-background').color}
    >
      <View
        style={style.flatten([
          "background-color-primary-400",
          "padding-24",
          "padding-top-76",
          "padding-bottom-101",
          "margin-bottom-102",
          "border-radius-top-left-32",
          "border-radius-top-right-32",
        ])}
      >
        <Text style={style.flatten(["h1", "color-white"])}>Setting</Text>
        <View
          style={[
            style.flatten([
              "absolute-fill",
              "background-color-white",
              "height-160",
              "margin-24",
              "margin-top-150",
              "border-radius-12",
              "padding-20",
            ]),
            styles.shadowBox,
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              smartNavigation.navigateSmart("SettingSelectAccount", {})
            }
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
            ])}
          >
            <View>
              <Text
                style={style.flatten([
                  "text-caption2",
                  "color-text-black-very-low",
                ])}
              >
                WALLET
              </Text>
              <Text
                style={style.flatten([
                  "text-caption2",
                  "color-black",
                  "font-bold",
                  "subtitle1",
                ])}
              >
                {selected
                  ? selected.meta?.name || "Keplr Account"
                  : "No Account"}
              </Text>
            </View>
            <RightArrow />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              smartNavigation.navigateSmart("SettingSelectAccount", {})
            }
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "padding-top-20",
            ])}
          >
            <View>
              <Text
                style={style.flatten([
                  "text-caption2",
                  "color-text-black-very-low",
                ])}
              >
                CURRENCY
              </Text>
              <Text
                style={style.flatten(["text-caption2", "color-black", "body1"])}
              >
                {priceStore.defaultVsCurrency.toUpperCase()}
              </Text>
            </View>
            <RightArrow />
          </TouchableOpacity>
        </View>
      </View>
      {/* <SettingSelectAccountItem /> */}
      <SettingFiatCurrencyItem topBorder={true} />
      {/* <SettingSectionTitle title="General" /> */}
      <View style={style.flatten(["background-color-white"])}>
        <SettingSectionTitle title="Security" />
        <SettingItem
          label="Address book"
          right={<RightArrow />}
          onPress={() => {
            smartNavigation.navigateSmart("AddressBook", {});
          }}
        />

        {canShowPrivateData(keyRingStore.keyRingType) && (
          <SettingViewPrivateDataItem topBorder={false} />
        )}
        {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
          <SettingBiometricLockItem
          // topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
          />
        ) : null}
        {/* <SettingSectionTitle title="Others" /> */}
        <SettingItem
          label="OWallet version"
          // topBorder={true}
          onPress={() => {
            smartNavigation.navigateSmart("Setting.Version", {});
          }}
        />
        <SettingRemoveAccountItem topBorder={true} />
        {/* Mock element for padding bottom */}
        <View style={style.get("height-16")} />
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styles = StyleSheet.create({
  shadowBox: {
    shadowColor: "#ccc",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 1.0,
  },
});

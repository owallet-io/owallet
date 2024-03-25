import React, { FunctionComponent, useCallback, useMemo } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { BasicSettingItem, renderFlag } from "./components";
import { useSmartNavigation } from "../../navigation.provider";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { DownArrowIcon } from "../../components/icon";
import { useStore } from "../../stores";
import { metrics } from "../../themes";
import { CountryModal } from "./components/country-modal";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { SettingRemoveAccountItem } from "./items/remove-account";
import { SettingSwitchModeItem } from "./items/switch-mode";
import { SettingViewPrivateDataItem } from "./items/view-private-data";
import { canShowPrivateData } from "./screens/view-private-data";
import { PageHeader } from "@src/components/header/header-new";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWCard from "@src/components/card/ow-card";
import { Bech32Address } from "@owallet/cosmos";

export const NewSettingScreen: FunctionComponent = observer(() => {
  const {
    keychainStore,
    keyRingStore,
    priceStore,
    modalStore,
    accountStore,
    chainStore,
  } = useStore();
  const safeAreaInsets = useSafeAreaInsets();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const { colors } = useTheme();
  const styles = styling(colors);
  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key.toUpperCase(),
      };
    });
  }, [priceStore.supportedVsCurrencies]);
  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const smartNavigation = useSmartNavigation();
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

  const renderRating = useCallback(() => {
    return (
      <OWCard style={{ marginBottom: 16 }}>
        <View style={{ alignItems: "center" }}>
          <Image
            style={{ width: 60, height: 60 }}
            source={require("../../assets/image/img_owallet.png")}
            fadeDuration={0}
            resizeMode="contain"
          />

          <OWText style={{ paddingTop: 8 }} size={16} weight="600">
            Enjoying the App?
          </OWText>
          <OWText
            style={{ paddingTop: 8 }}
            color={colors["neutral-text-body"]}
            size={14}
            weight="500"
          >
            Do you enjoy your experience with Owallet?
          </OWText>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
              justifyContent: "space-evenly",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderRadius: 12,
                borderColor: colors["neutral-border-default"],
                padding: 16,
                alignItems: "center",
                width: metrics.screenWidth / 3,
              }}
            >
              <OWIcon name="tdesign_despise" size={32} />
              <OWText style={{ paddingTop: 8 }} size={16} weight="600">
                Nah
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderRadius: 12,
                borderColor: colors["neutral-border-default"],
                padding: 16,
                alignItems: "center",
                width: metrics.screenWidth / 3,
              }}
            >
              <OWIcon name="tdesign_excited" size={32} />
              <OWText style={{ paddingTop: 8 }} size={16} weight="600">
                I love it!
              </OWText>
            </TouchableOpacity>
          </View>
        </View>
      </OWCard>
    );
  }, []);

  return (
    <PageWithScrollViewInBottomTabView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: safeAreaInsets.top }}
      backgroundColor={colors["neutral-surface-bg"]}
    >
      <PageHeader title="Settings" colors={colors} />
      <View>
        <BasicSettingItem
          left={
            <View style={{ paddingRight: 12 }}>
              <Image
                style={{ width: 44, height: 44, borderRadius: 44 }}
                source={require("../../assets/images/default-avatar.png")}
                fadeDuration={0}
                resizeMode="contain"
              />
            </View>
          }
          icon="owallet"
          paragraph={
            selected ? selected.meta?.name || "OWallet Account" : "No Account"
          }
          subtitle={Bech32Address.shortenAddress(account.bech32Address, 24)}
          onPress={() =>
            smartNavigation.navigateSmart("SettingSelectAccount", {})
          }
        />
        {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
          <SettingBiometricLockItem />
        ) : null}
        {canShowPrivateData(keyRingStore.keyRingType) && (
          <SettingViewPrivateDataItem />
        )}
        <SettingRemoveAccountItem />

        <View style={styles.border} />
        {/* <BasicSettingItem
          icon="tdesign_money"
          paragraph="Currency"
          onPress={_onPressCountryModal}
          right={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {renderFlag(priceStore.defaultVsCurrency, 20)}
              <OWText
                style={{ paddingHorizontal: 8 }}
                weight="600"
                color={colors["neutral-text-body"]}
              >
                {priceStore.defaultVsCurrency.toUpperCase()}
              </OWText>
              <OWIcon name="chevron_right" size={16} />
            </View>
          }
        /> */}
        <SettingSwitchModeItem />
        <View style={styles.border} />
        <BasicSettingItem
          icon="tdesign_book"
          paragraph="Address book"
          onPress={() => {
            smartNavigation.navigateSmart("AddressBook", {});
          }}
        />

        <View style={styles.border} />
        {renderRating()}
        <View style={styles.border} />
        <BasicSettingItem
          left={
            <View style={{ padding: 12 }}>
              <Image
                style={{ width: 24, height: 24 }}
                source={require("../../assets/image/logo_owallet.png")}
                fadeDuration={0}
                resizeMode="contain"
              />
            </View>
          }
          icon="owallet"
          paragraph="About OWallet"
          onPress={() => {
            smartNavigation.navigateSmart("Setting.Version", {});
          }}
        />
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: object) =>
  StyleSheet.create({
    itemWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 12,
      paddingHorizontal: 16,
      marginHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors["neutral-surface-card"],
      marginBottom: 16,
    },
    border: {
      height: 1,
      backgroundColor: colors["neutral-border-default"],
      marginBottom: 16,
      marginHorizontal: 16,
    },
    icon: {
      borderRadius: 99,
      marginRight: 16,
      backgroundColor: colors["neutral-surface-action"],
      padding: 16,
    },
  });

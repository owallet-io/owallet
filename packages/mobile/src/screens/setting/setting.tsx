import React, { FunctionComponent, useCallback, useMemo } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { renderFlag, SettingItem, SettingSectionTitle } from "./components";
import { useSmartNavigation } from "../../navigation.provider";
import { OWBox } from "@src/components/card";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { DownArrowIcon } from "../../components/icon";
import { useStore } from "../../stores";
import { metrics, spacing, typography } from "../../themes";
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

const mockSetting = [
  { type: "manage", title: "Manage Wallet", onPress: () => {} },
];

export const NewSettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, priceStore, modalStore } = useStore();
  const safeAreaInsets = useSafeAreaInsets();

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

  const renderItem = () => {
    return (
      <View style={styles.itemWrapper}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.icon}>
            <OWIcon name="wallet" size={16} />
          </View>
          <OWText size={16} weight="600">
            Manage wallet
          </OWText>
        </View>
        <TouchableOpacity>
          <OWIcon name="chevron_right" size={16} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSettingItem = ({ type, title, onPress }) => {};

  return (
    <PageWithScrollViewInBottomTabView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: safeAreaInsets.top }}
      backgroundColor={colors["neutral-surface-bg"]}
    >
      <PageHeader title="Settings" colors={colors} />
      <View>
        {renderItem()}
        {renderItem()}
        {renderItem()}
        <View style={styles.border} />
        {renderItem()}
        {renderItem()}
        {renderItem()}
        <View style={styles.border} />
        {renderItem()}
        {renderItem()}
        {renderItem()}
        {renderRating()}
        <View style={styles.border} />
        {renderItem()}
      </View>
    </PageWithScrollViewInBottomTabView>
  );

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
            onPress={() =>
              smartNavigation.navigateSmart("SettingSelectAccount", {})
            }
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
          <TouchableOpacity
            onPress={_onPressCountryModal}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: spacing["20"],
            }}
          >
            <View>
              <Text
                style={{
                  ...typography["text-caption2"],
                  color: colors["primary-text"],
                }}
              >
                CURRENCY
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {renderFlag(priceStore.defaultVsCurrency)}
                <Text
                  style={{
                    ...typography["h6"],
                    color: colors["primary-text"],
                    fontWeight: "bold",
                    marginHorizontal: spacing["8"],
                  }}
                >
                  {priceStore.defaultVsCurrency.toUpperCase()}
                </Text>
              </View>
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
            smartNavigation.navigateSmart("AddressBook", {});
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
            smartNavigation.navigateSmart("Setting.Version", {});
          }}
        />
        <SettingRemoveAccountItem />
      </OWBox>
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

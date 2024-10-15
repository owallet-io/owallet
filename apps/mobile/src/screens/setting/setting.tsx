import React, { FunctionComponent, useEffect, useMemo } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { BasicSettingItem, renderFlag } from "./components";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { metrics } from "../../themes";
import { CountryModal } from "./components/country-modal";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { SettingRemoveAccountItem } from "./items/remove-account";
import { SettingViewPrivateDataItem } from "./items/view-private-data";
import { canShowPrivateData } from "./screens/view-private-data";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWCard from "@src/components/card/ow-card";
import { Bech32Address } from "@owallet/cosmos";
import { ChainIdEnum } from "@oraichain/oraidex-common";
import Rate, { AndroidMarket } from "react-native-rate";
import { SettingSwitchHideTestnet } from "./items/hide-testnet";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { ThemeModal } from "./components/theme-modal";

export const NewSettingScreen: FunctionComponent = observer((props) => {
  const {
    keychainStore,
    keyRingStore,
    priceStore,
    modalStore,
    accountStore,
    appInitStore,
  } = useStore();
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

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
  // const selected = keyRingStore.multiKeyStoreInfo.find(
  //   (keyStore) => keyStore.selected
  // );
  const selectedKeyInfo = keyRingStore.selectedKeyInfo;
  console.log(selectedKeyInfo.name, "selectedKeyInfo");
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

  const _onPressThemeModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });

    modalStore.setChildren(
      ThemeModal({
        modalStore,
        appInitStore,
        colors,
      })
    );
  };

  useEffect(() => {
    //@ts-ignore
    if (props.route?.params?.isOpenTheme) {
      _onPressThemeModal();
    }
    //@ts-ignore
  }, [props.route?.params?.isOpenTheme]);

  const onRatingApp = () => {
    const options = {
      AppleAppID: "id1626035069",
      GooglePackageName: "com.io.owallet",
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: Platform.OS === "android" ? false : true,
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL:
        "https://play.google.com/store/apps/details?id=com.io.owallet",
    };
    Rate.rate(options, (success, errorMessage) => {
      if (success) {
        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        console.log("success", success);
      }
      if (errorMessage) {
        // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
        console.error(`Page Rate.rate() error: ${errorMessage}`);
      }
    });
  };

  const renderRating = () => {
    return (
      <OWCard
        style={{
          marginBottom: 16,
          backgroundColor: colors["neutral-surface-card"],
        }}
      >
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
              onPress={onRatingApp}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                borderColor: colors["neutral-border-default"],
                padding: 16,
                alignItems: "center",
                width: metrics.screenWidth / 3,
              }}
            >
              <OWIcon
                name="tdesign_despise"
                color={colors["neutral-text-body"]}
                size={32}
              />
              <OWText
                style={{ paddingTop: 8 }}
                color={colors["neutral-text-body"]}
                size={16}
                weight="600"
              >
                Nah
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRatingApp}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                borderColor: colors["neutral-border-default"],
                padding: 16,
                alignItems: "center",
                width: metrics.screenWidth / 3,
              }}
            >
              <OWIcon
                name="tdesign_excited"
                color={colors["neutral-text-body"]}
                size={32}
              />
              <OWText
                style={{ paddingTop: 8 }}
                color={colors["neutral-text-body"]}
                size={16}
                weight="600"
              >
                I love it!
              </OWText>
            </TouchableOpacity>
          </View>
        </View>
      </OWCard>
    );
  };

  return (
    <PageWithScrollViewInBottomTabView
      showsVerticalScrollIndicator={false}
      backgroundColor={colors["neutral-surface-bg"]}
    >
      <View>
        <OWCard
          style={{
            marginBottom: 16,
            backgroundColor: colors["neutral-surface-card"],
          }}
          type="normal"
        >
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
              selectedKeyInfo
                ? selectedKeyInfo.name || "OWallet Account"
                : "No Account"
            }
            subtitle={Bech32Address.shortenAddress(
              accountOrai.bech32Address,
              24
            )}
            onPress={() => navigate(SCREENS.SettingSelectAccount)}
          />
          <View style={styles.border} />
          {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
            <SettingBiometricLockItem />
          ) : null}
          {/*{canShowPrivateData(keyRingStore.keyRingType) && (*/}
          {/*  <SettingViewPrivateDataItem />*/}
          {/*)}*/}
          <SettingRemoveAccountItem />
        </OWCard>

        <OWCard
          style={{
            marginBottom: 16,
            backgroundColor: colors["neutral-surface-card"],
          }}
          type="normal"
        >
          <SettingSwitchHideTestnet />
          <BasicSettingItem
            icon="tdesign_moon"
            paragraph="Theme"
            onPress={_onPressThemeModal}
            right={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <OWIcon
                  color={colors["neutral-text-title"]}
                  name="chevron_right"
                  size={16}
                />
              </View>
            }
          />
          {/* <SettingSwitchModeItem /> */}

          <BasicSettingItem
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
                <OWIcon
                  color={colors["neutral-text-title"]}
                  name="chevron_right"
                  size={16}
                />
              </View>
            }
          />
          <BasicSettingItem
            icon="tdesign_book"
            paragraph="Address book"
            onPress={() => {
              navigate(SCREENS.AddressBook, {});
            }}
          />
          <BasicSettingItem
            icon="tdesignadjustment"
            paragraph="Manage Wallet Connect"
            onPress={() => {
              navigate(SCREENS.ManageWalletConnect);
            }}
          />
          <BasicSettingItem
            icon="tdesignapp"
            paragraph="Manage Chain"
            onPress={() => {
              navigate(SCREENS.ManageChain, {});
            }}
          />
        </OWCard>

        {renderRating()}
        <OWCard
          style={{
            marginBottom: 16,
            paddingBottom: 0,
            backgroundColor: colors["neutral-surface-card"],
          }}
          type="normal"
        >
          <BasicSettingItem
            typeLeftIcon={"images"}
            source={require("../../assets/image/logo_owallet.png")}
            containerStyle={{
              marginVertical: -16,
            }}
            icon="owallet"
            paragraph="About OWallet"
            onPress={() => {
              navigate(SCREENS.SettingVersion, {});
            }}
          />
        </OWCard>
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
    },
    icon: {
      borderRadius: 99,
      marginRight: 16,
      backgroundColor: colors["neutral-surface-action"],
      padding: 16,
    },
  });

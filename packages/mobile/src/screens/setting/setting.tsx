import React, { FunctionComponent, useMemo } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { renderFlag, SettingItem, SettingSectionTitle } from "./components";
import { useSmartNavigation } from "../../navigation.provider";
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
import { PageHeader } from "@src/components/header/header-new";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return (
    <PageWithScrollViewInBottomTabView
      contentContainerStyle={{ paddingTop: safeAreaInsets.top }}
      backgroundColor={colors["neutral-surface-bg"]}
    >
      <PageHeader title="Settings" colors={colors} />
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: object) => StyleSheet.create({});

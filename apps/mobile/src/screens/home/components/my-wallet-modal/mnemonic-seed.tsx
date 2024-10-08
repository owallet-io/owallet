import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";
import { Text } from "@src/components/text";
import { RectButton } from "../../../../components/rect-button";
import { useStore } from "../../../../stores";
import { metrics, spacing } from "../../../../themes";
import { _keyExtract } from "../../../../utils/helper";
import { LoadingSpinner } from "../../../../components/spinner";
import { useTheme } from "@src/themes/theme-provider";
import { useStyleMyWallet } from "./styles";
import OWFlatList from "@src/components/page/ow-flat-list";
import { RightArrowIcon } from "@src/components/icon";
import { ChainIdEnum } from "@oraichain/oraidex-common";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { waitAccountInit } from "@src/screens/unlock/pincode-unlock";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ViewToken } from "@src/stores/huge-queries";
import { initPrice } from "../../hooks/use-multiple-assets";

const MnemonicSeed = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    keyRingStore,
    analyticsStore,
    chainStore,
    modalStore,
    universalSwapStore,
    appInitStore,
    priceStore,
    accountStore,
  } = useStore();
  const styles = useStyleMyWallet();
  const { colors } = useTheme();
  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => !keyStore.type || keyStore.type === "mnemonic"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === "privateKey" && !keyStore.meta?.email
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === "ledger"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const selectKeyStore = useCallback(async (keyStore: any) => {
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index >= 0) {
      universalSwapStore.setLoaded(false);
      await keyRingStore.changeKeyRing(index);
      await waitAccountInit(chainStore, accountStore, keyRingStore);
    }
  }, []);

  const renderItem = ({ item }) => {
    return (
      <>
        <RectButton
          style={{
            ...styles.containerAccount,
            backgroundColor: item.selected
              ? colors["neutral-surface-bg2"]
              : null,
          }}
          onPress={async () => {
            setIsLoading(true);
            analyticsStore.logEvent("Account changed");
            await selectKeyStore(item);
            await modalStore.close();
            universalSwapStore.clearAmounts();
            setIsLoading(false);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              style={{
                width: spacing["38"],
                height: spacing["38"],
                borderRadius: spacing["38"],
              }}
              source={require("../../../../assets/images/default-avatar.png")}
              fadeDuration={0}
            />
            <View
              style={{
                marginLeft: spacing["12"],
              }}
            >
              <Text weight="600" size={16} numberOfLines={1}>
                {item.meta?.name}
              </Text>
            </View>
          </View>

          <View>
            <RightArrowIcon
              height={12}
              color={colors["neutral-text-heading"]}
            />
          </View>
        </RectButton>
      </>
    );
  };
  const data = [...mnemonicKeyStores, ...privateKeyStores, ...ledgerKeyStores];
  return (
    <View
      style={{
        width: metrics.screenWidth - 36,
        height: metrics.screenHeight / 2,
        marginBottom: 80,
      }}
    >
      <OWFlatList
        data={data}
        isBottomSheet
        renderItem={renderItem}
        keyExtractor={_keyExtract}
      />
      <View style={{ position: "relative" }}>
        <View
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            zIndex: 1,
          }}
        >
          {isLoading && (
            <LoadingSpinner
              size={24}
              color={colors["primary-surface-default"]}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default MnemonicSeed;

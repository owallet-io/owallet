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
import { KeyInfo } from "@owallet/background";

const MnemonicSeed = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { keyRingStore, chainStore, modalStore, universalSwapStore } =
    useStore();
  const styles = useStyleMyWallet();
  const { colors } = useTheme();
  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.keyInfos.filter(
      (keyStore) => !keyStore.type || keyStore.type === "mnemonic"
    );
  }, [keyRingStore.keyInfos]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.keyInfos.filter(
      (keyStore) => keyStore.type === "private-key"
    );
  }, [keyRingStore.keyInfos]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.keyInfos.filter(
      (keyStore) => keyStore.type === "ledger"
    );
  }, [keyRingStore.keyInfos]);

  const selectKeyStore = async (keyStore: KeyInfo) => {
    universalSwapStore.setLoaded(false);
    await keyRingStore.selectKeyRing(keyStore.id);
    await chainStore.waitSyncedEnabledChains();
  };
  const onSwitchWallet = useCallback(async (item) => {
    if (keyRingStore.selectedKeyInfo.id === item.id) {
      return;
    }
    // setIsLoading(true);
    await selectKeyStore(item);
    await modalStore.close();
    universalSwapStore.clearAmounts();
    // setIsLoading(false);
  }, []);
  const renderItem = ({ item }) => {
    return (
      <>
        <RectButton
          style={{
            ...styles.containerAccount,
            backgroundColor: item.isSelected
              ? colors["neutral-surface-bg2"]
              : null,
          }}
          onPress={() => onSwitchWallet(item)}
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
                {item?.name}
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
  const data: Array<KeyInfo> = [
    ...mnemonicKeyStores,
    ...privateKeyStores,
    ...ledgerKeyStores,
  ];
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

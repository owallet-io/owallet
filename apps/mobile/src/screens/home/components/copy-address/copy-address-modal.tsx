import {
  Image,
  StyleSheet,
  View,
  TextInput,
  InteractionManager,
} from "react-native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { CustomAddressCopyable } from "@src/components/address-copyable/custom";
import { unknownToken } from "@owallet/common";
import { useStore } from "@src/stores";
import { registerModal } from "@src/modals/base";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";

export const CopyAddressModal: FunctionComponent<{
  copyable?: boolean;
  onPress?: Function;
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(({ onPress, copyable = true, close }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");

  const { colors } = useTheme();

  const styles = styling(colors);

  const { chainStore, allAccountStore } = useStore();

  const chainsData = chainStore.chainInfosInUI.filter(
    (item, index) =>
      item?.chainName?.toLowerCase()?.includes(keyword?.toLowerCase()) &&
      !item?.chainName?.toLowerCase()?.includes("test")
  );

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.searchInput}>
          <View style={{ paddingRight: 4 }}>
            <OWIcon
              color={colors["neutral-icon-on-light"]}
              name="tdesign_search"
              size={16}
            />
          </View>
          <TextInput
            style={{
              fontFamily: "SpaceGrotesk-Regular",
              width: "100%",
              color: colors["neutral-icon-on-light"],
            }}
            onChangeText={(t) => setKeyword(t)}
            value={keyword}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search by name"
          />
        </View>
      </View>
      <ScrollView
        style={[
          {
            paddingBottom: safeAreaInsets.bottom,
            height: metrics.screenHeight / 1.5,
          },
        ]}
        showsVerticalScrollIndicator={false}
        persistentScrollbar={true}
      >
        {chainsData?.length > 0 &&
          chainsData.map((item, index) => {
            if (item.features.includes("btc")) {
              const legacyAddress = allAccountStore.getAccount(
                item.chainId
              )?.btcLegacyAddress;
              const segwitAddress = allAccountStore.getAccount(
                item.chainId
              ).addressDisplay;
              return (
                <>
                  <CustomAddressCopyable
                    copyable={copyable}
                    onPress={() =>
                      onPress && onPress(item, index === chainsData?.length - 1)
                    }
                    icon={
                      <OWIcon
                        style={{
                          borderRadius: 999,
                        }}
                        type="images"
                        source={{
                          uri:
                            item?.chainSymbolImageUrl ||
                            unknownToken.coinImageUrl,
                        }}
                        size={28}
                      />
                    }
                    chain={`${item.chainName} Segwit`}
                    address={segwitAddress}
                    maxCharacters={22}
                  />
                  <CustomAddressCopyable
                    copyable={copyable}
                    onPress={() =>
                      onPress && onPress(item, index === chainsData?.length - 1)
                    }
                    icon={
                      <OWIcon
                        style={{
                          borderRadius: 999,
                        }}
                        type="images"
                        source={{
                          uri:
                            item?.chainSymbolImageUrl ||
                            unknownToken.coinImageUrl,
                        }}
                        size={28}
                      />
                    }
                    chain={`${item.chainName} Legacy`}
                    address={legacyAddress}
                    maxCharacters={22}
                  />
                </>
              );
            }
            let address = allAccountStore.getAccount(
              item.chainId
            ).addressDisplay;
            return (
              <CustomAddressCopyable
                copyable={copyable}
                onPress={() =>
                  onPress && onPress(item, index === chainsData?.length - 1)
                }
                icon={
                  <OWIcon
                    style={{
                      borderRadius: 999,
                    }}
                    type="images"
                    source={{
                      uri:
                        item?.chainSymbolImageUrl || unknownToken.coinImageUrl,
                    }}
                    size={28}
                  />
                }
                chain={`${item.chainName}`}
                address={address}
                maxCharacters={22}
              />
            );
          })}
      </ScrollView>
    </View>
  );
});

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      alignSelf: "center",
    },
    searchInput: {
      flexDirection: "row",
      backgroundColor: colors["neutral-surface-action"],
      height: 40,
      borderRadius: 999,
      width: metrics.screenWidth - 32,
      alignItems: "center",
      paddingHorizontal: 12,
    },
  });

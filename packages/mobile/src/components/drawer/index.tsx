import React, { FunctionComponent, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "../../stores";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Alert, StyleSheet, View } from "react-native";
import { Text } from "@src/components/text";
import { useStyle } from "../../styles";
import { RectButton } from "../rect-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VectorCharacter } from "../vector-character";
import FastImage from "react-native-fast-image";
import { Hash } from "@owallet/crypto";
import { BrowserIcon } from "../icon/browser";
import { colors, spacing, typography } from "../../themes";

export type DrawerContentProps =
  DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore, analyticsStore } = useStore();
    const navigation = useNavigation();
    const safeAreaInsets = useSafeAreaInsets();
    const style = useStyle();

    const deterministicNumber = useCallback((chainInfo) => {
      const bytes = Hash.sha256(
        Buffer.from(chainInfo.stakeCurrency.coinMinimalDenom)
      );
      return (
        (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
      );
    }, []);

    const profileColor = useCallback(
      (chainInfo) => {
        const colors = [
          "sky-blue",
          "mint",
          "red",
          "orange",
          "blue-violet",
          "green",
          "sky-blue",
          "mint",
          "red",
          "purple",
          "red",
          "orange",
          "yellow",
        ];

        return colors[deterministicNumber(chainInfo) % colors.length];
      },
      [deterministicNumber]
    );

    return (
      <DrawerContentScrollView {...props}>
        <View
          style={{
            marginBottom: safeAreaInsets.bottom,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              height: 50,
            }}
          >
            <Text
              style={{
                ...typography.h3,
                color: colors["text-black-high"],
                marginLeft: spacing["24"],
              }}
            >
              Networks
            </Text>
          </View>
          <View>
            <>
              {chainStore.chainInfosInUI.map((chainInfo) => {
                const selected =
                  chainStore.current.chainId === chainInfo.chainId;

                return (
                  <RectButton
                    key={chainInfo.chainId}
                    onPress={() => {
                      if (!chainInfo.chainName.includes("soon")) {
                        navigation.dispatch(DrawerActions.closeDrawer());
                        analyticsStore.logEvent("Chain changed", {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                          toChainId: chainInfo.chainId,
                          toChainName: chainInfo.chainName,
                        });
                        chainStore.selectChain(chainInfo.chainId);
                        chainStore.saveLastViewChainId();
                      } else {
                        Alert.alert("Coming soon!");
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      height: 84,
                      alignItems: "center",
                      paddingHorizontal: spacing["20"],
                    }}
                    activeOpacity={1}
                    underlayColor={
                      style.get("color-drawer-rect-button-underlay").color
                    }
                  >
                    <View
                      style={{
                        ...styles.containerImage,
                        backgroundColor: selected
                          ? colors["black"]
                          : profileColor(chainInfo),
                      }}
                    >
                      {chainInfo.raw.chainSymbolImageUrl ? (
                        <FastImage
                          style={{
                            width: 24,
                            height: 24,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                          source={{
                            uri: chainInfo.raw.chainSymbolImageUrl,
                          }}
                        />
                      ) : (
                        <VectorCharacter
                          char={chainInfo.chainName[0]}
                          height={15}
                          color="white"
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        ...typography.h5,
                        color: selected
                          ? colors["text-black-medium"]
                          : colors["text-black-very-very-low"],
                      }}
                    >
                      {chainInfo.chainName}
                    </Text>
                  </RectButton>
                );
              })}
            </>
          </View>
        </View>
      </DrawerContentScrollView>
    );
  }
);

const styles = StyleSheet.create({
  containerBrowser: {
    width: spacing["32"],
    height: spacing["32"],
    borderRadius: spacing["64"],
    alignItems: "center",
    overflow: "hidden",
    marginRight: spacing["16"],
    backgroundColor: colors["profile-green"],
  },
  containerBtn: {
    flexDirection: "row",
    height: 84,
    alignItems: "center",
    paddingHorizontal: spacing["20"],
    borderTopWidth: 1,
  },
  containerImage: {
    width: spacing["32"],
    height: spacing["32"],
    borderRadius: spacing["64"],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: spacing["16"],
  },
});

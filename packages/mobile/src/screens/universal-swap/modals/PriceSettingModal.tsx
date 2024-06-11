//@ts-nocheck
import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { registerModal } from "@src/modals/base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@src/components/text";
import { OWButton } from "@src/components/button";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics, typography } from "@src/themes";
import { DEFAULT_SLIPPAGE } from "@owallet/common";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TextInput } from "@src/components/input";
import { getPairInfo } from "../helpers";
import {
  flattenTokens,
  flattenTokensWithIcon,
} from "@oraichain/oraidex-common";
import FastImage from "react-native-fast-image";
import { maskedNumber } from "@src/utils/helper";
import { useStore } from "@src/stores";

export const PriceSettingModal = registerModal(
  ({
    close,
    setUserSlippage,
    currentSlippage = 0,
    impactWarning,
    fromAmountToken,
    routersSwapData,
    minimumReceive,
    tokenFee,
    swapFee,
    bridgeFee,
    relayerFee,
    ratio,
  }) => {
    const safeAreaInsets = useSafeAreaInsets();
    const { appInitStore } = useStore();

    const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
    const { colors } = useTheme();
    const styles = styling(colors);
    const theme = appInitStore.getInitApp.theme;

    const handleChangeSlippage = (value: number) => {
      if (value <= 100) {
        setSlippage(value);
      } else {
        setSlippage(100);
      }
    };

    useEffect(() => {
      setSlippage(currentSlippage);
    }, [currentSlippage]);

    const handleSubmitSlippage = () => {
      setUserSlippage(slippage);
    };

    const renderInfo = (label, info, impact?) => {
      return (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            <Text size={15}>{label}</Text>
            <Text
              weight="600"
              size={15}
              color={
                Number(impact) > 5
                  ? Number(impact) > 10
                    ? colors["error-text-body"]
                    : colors["warning-text-body"]
                  : colors["neutral-text-title"]
              }
            >
              {Number(impact) > 5 ? (
                <OWIcon
                  name="tdesignerror-triangle"
                  color={
                    Number(impact) > 5
                      ? Number(impact) > 10
                        ? colors["error-text-body"]
                        : colors["warning-text-body"]
                      : colors["neutral-text-title"]
                  }
                  size={16}
                />
              ) : null}
              {" " + info}
            </Text>
          </View>
          <View style={styles.borderline} />
        </>
      );
    };

    const renderSmartRoutes = () => {
      if (fromAmountToken > 0 && routersSwapData?.routes.length > 0) {
        return (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 16,
              }}
            >
              <Text color={colors["neutral-text-title"]} weight="500" size={15}>
                Smart Route
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: colors["highlight-surface-subtle"],
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                >
                  <OWIcon
                    name="tdesignwindy"
                    color={colors["highlight-text-title"]}
                    size={14}
                  />
                  <Text
                    color={colors["highlight-text-title"]}
                    weight="600"
                    size={12}
                  >
                    {" "}
                    FASTEST
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors["primary-surface-subtle"],
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    color={colors["primary-text-action"]}
                    weight="600"
                    size={12}
                  >
                    BEST RETURN
                  </Text>
                </View>
              </View>
            </View>
            <View>
              {routersSwapData?.routes.map((route, ind) => {
                const volumn = Number(
                  (+route.returnAmount / +routersSwapData?.amount) * 100
                ).toFixed(0);
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 20,
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        zIndex: -999,
                        alignSelf: "center",
                      }}
                    >
                      <View
                        style={{
                          width: metrics.screenWidth - 32,
                          height: 2,
                          backgroundColor: colors["neutral-text-disable"],
                        }}
                      />
                    </View>
                    <View
                      style={{
                        backgroundColor: colors["neutral-surface-card"],
                        padding: 4,
                      }}
                    >
                      <Text weight="500" color={colors["neutral-text-body"]}>
                        {volumn}%
                      </Text>
                    </View>
                    {route.paths.map((path, i, acc) => {
                      const { TokenInIcon, TokenOutIcon } = getPairInfo(
                        path,
                        flattenTokens,
                        flattenTokensWithIcon,
                        theme === "light"
                      );

                      return (
                        <View
                          style={{
                            backgroundColor: colors["neutral-surface-card"],
                            borderRadius: 999,
                            paddingHorizontal: 4,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              backgroundColor: colors["neutral-surface-action"],
                              borderRadius: 999,
                              paddingHorizontal: 6,
                              paddingVertical: 4,
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 24,
                                backgroundColor: colors["neutral-icon-on-dark"],
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FastImage
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 24,
                                }}
                                source={{
                                  uri: TokenInIcon,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                            </View>
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 24,

                                backgroundColor: colors["neutral-icon-on-dark"],

                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FastImage
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 24,
                                }}
                                source={{
                                  uri: TokenOutIcon,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    <View
                      style={{
                        backgroundColor: colors["neutral-surface-card"],
                        padding: 4,
                      }}
                    >
                      <Text weight="500" color={colors["neutral-text-body"]}>
                        {volumn}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        );
      }
    };

    return (
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <View>
          <View style={styles.containerTitle}>
            <Text
              style={{
                ...typography.h6,
                fontWeight: "900",
                color: colors["neutral-text-title"],
                width: "100%",
                textAlign: "center",
              }}
            >
              {`Price settings`.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title} size={16} weight="600">
            Slippage rate
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={styles.containerSlippagePercent}>
              {[1, 3, 5].map((item, index) => {
                return (
                  <OWButton
                    key={item}
                    size="medium"
                    style={
                      slippage === Number(item)
                        ? styles.btnSlippgaePercentActive
                        : styles.btnSlippgaePercentInActive
                    }
                    textStyle={
                      slippage === Number(item)
                        ? styles.txtSlippgaePercentActive
                        : styles.txtSlippgaePercentInActive
                    }
                    label={`${item}%`}
                    fullWidth={false}
                    onPress={() => setSlippage(item)}
                  />
                );
              })}
            </View>
            <TextInput
              inputContainerStyle={{
                borderColor: colors["neutral-border-strong"],
                borderRadius: 8,
                height: 44,
                width: metrics.screenWidth / 2.5,
              }}
              value={slippage.toString()}
              onChangeText={(txt) => handleChangeSlippage(Number(txt))}
              inputRight={
                <Text
                  color={colors["neutral-text-body"]}
                  weight="500"
                  size={15}
                >
                  %
                </Text>
              }
              keyboardType="number-pad"
              placeholder="Custom"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          {renderSmartRoutes()}
          <View style={{ marginTop: 18, marginBottom: 36 }}>
            {renderInfo("Rate", ratio)}
            {renderInfo("Minimum Received", minimumReceive)}
            {impactWarning
              ? renderInfo(
                  "Price Impact",
                  `${maskedNumber(impactWarning)}%`,
                  impactWarning
                )
              : null}
            {/* {renderInfo("Slippage", `${slippage}%`)} */}
            {tokenFee && tokenFee > 0
              ? renderInfo("Token Fee", tokenFee)
              : null}
            {relayerFee ? renderInfo("Relayer Fee", relayerFee) : null}
            {swapFee ? renderInfo("Swap Fee", swapFee) : null}
            {bridgeFee ? renderInfo("Bridge Fee", bridgeFee) : null}
          </View>
          <OWButton
            style={styles.confirmBtn}
            textStyle={styles.txtBtn}
            type="primary"
            label="Confirm"
            size="medium"
            onPress={() => {
              handleSubmitSlippage();
              close();
            }}
          />
        </View>
      </ScrollView>
    );
  }
);

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    txtBtn: {
      fontWeight: "700",
      fontSize: 16,
    },
    confirmBtn: {
      height: 48,
      borderRadius: 999,
    },
    txtSlippgaePercentInActive: {
      color: "#7C8397",
    },
    btnSlippgaePercentInActive: {
      width: metrics.screenWidth / 5 - 24,
      backgroundColor: colors["background-item-list"],
      height: 44,
    },
    txtSlippgaePercentActive: {
      color: colors["neutral-border-bold"],
    },
    btnSlippgaePercentActive: {
      width: metrics.screenWidth / 5 - 24,
      backgroundColor: colors["background-item-list"],
      height: 44,
      borderWidth: 1,
      borderColor: colors["neutral-border-bold"],
    },
    containerSlippagePercent: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingTop: 8,
      alignItems: "center",
      alignContent: "center",
      width: metrics.screenWidth / 2.2,
    },
    addBtn: {
      width: 60,
    },
    input: {
      fontSize: 18,
      width: 30,
      color: colors["text-value-input-modal"],
      paddingVertical: 0,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
    },
    minusBtn: {
      width: 60,
    },
    subContainerInputSlippage: {
      height: 40,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors["border-input-slippage"],
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 10,
    },
    containerInputSlippage: {
      alignSelf: "center",
    },

    title: {
      paddingVertical: 10,
    },
    containerTitle: {
      alignItems: "center",
    },
    container: {
      paddingHorizontal: 16,
    },
    borderline: {
      backgroundColor: colors["neutral-border-default"],
      height: 1,
    },
  });

import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { registerModal } from "@src/modals/base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@src/components/text";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { OWButton } from "@src/components/button";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { metrics } from "@src/themes";
import { DEFAULT_SLIPPAGE } from "@owallet/common";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TextInput } from "@src/components/input";

export const PriceSettingModal = registerModal(
  //@ts-ignore
  ({ close, setUserSlippage, currentSlippage = 0 }) => {
    const safeAreaInsets = useSafeAreaInsets();
    const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
    const { colors } = useTheme();
    const styles = styling(colors);

    const handleChangeSlippage = (direction) => {
      if (direction === "minus") {
        if (slippage > 1) {
          setSlippage(slippage - 1);
        } else {
          setSlippage(1);
        }
      } else {
        if (slippage < 100) {
          setSlippage(slippage + 1);
        } else {
          setSlippage(100);
        }
      }
    };

    useEffect(() => {
      setSlippage(currentSlippage);
    }, [currentSlippage]);

    const handleSubmitSlippage = () => {
      setUserSlippage(slippage);
    };

    const renderInfo = () => {
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
            <Text>Rate</Text>
            <Text weight="600">1 USDT = 0.08715 ORAI</Text>
          </View>
          <View style={styles.borderline} />
        </>
      );
    };

    return (
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <View>
          <View style={styles.containerTitle}>
            <Text style={styles.title} size={16} weight="500">
              PRICE SETTINGS
            </Text>
          </View>
          <Text style={styles.title} size={16} weight="600">
            Slippage rate
          </Text>
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
            <View style={styles.containerInputSlippage}>
              <TextInput
                inputContainerStyle={{
                  borderColor: colors["neutral-border-strong"],
                  borderRadius: 8,
                  height: 44,
                  width: metrics.screenWidth / 3,
                }}
                inputRight={
                  <Text
                    color={colors["neutral-text-title"]}
                    weight="500"
                    size={15}
                  >
                    %
                  </Text>
                }
                placeholder="Custom"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
          </View>
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
          <View style={{ marginTop: 18, marginBottom: 36 }}>
            {renderInfo()}
            {renderInfo()}
            {renderInfo()}
            {renderInfo()}
            {renderInfo()}
          </View>
          <OWButton
            style={styles.confirmBtn}
            textStyle={styles.txtBtn}
            type="primary"
            label="Save"
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
      height: 40,
    },
    txtSlippgaePercentActive: {
      color: colors["neutral-border-bold"],
    },
    btnSlippgaePercentActive: {
      width: metrics.screenWidth / 5 - 24,
      backgroundColor: colors["background-item-list"],
      height: 40,
      borderWidth: 1,
      borderColor: colors["neutral-border-bold"],
    },
    containerSlippagePercent: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingTop: 8,
      width: "100%",
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
    containerInputSlippage: {},

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

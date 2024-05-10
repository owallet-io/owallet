import { TouchableOpacity, View } from "react-native";
import React, { FunctionComponent } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { ISwapBox } from "../types";
import InputSelectToken from "./InputSelectToken";
import { BalanceText } from "./BalanceText";
import { styling } from "../styles";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { metrics } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const SwapBox: FunctionComponent<ISwapBox> = observer(
  ({
    network,
    tokenActive,
    currencyValue,
    balanceValue,
    editable,
    type = "from",
    ...props
  }) => {
    const { colors } = useTheme();
    const styles = styling(colors);

    return (
      <OWCard
        style={{
          ...styles.containerInfo,
        }}
      >
        {type === "from" ? (
          <View style={{ paddingBottom: 16 }}>
            <View style={styles.containerItemBottom}>
              <View style={{ maxWidth: metrics.screenWidth / 2 }}>
                <BalanceText color={colors["neutral-text-title"]} weight="500">
                  <OWText color={colors["neutral-text-body2"]}>Balance:</OWText>{" "}
                  {balanceValue || 0.0} {tokenActive.name}
                </BalanceText>
              </View>
              <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors["primary-surface-default"],
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 4,
                  }}
                  onPress={() => {}}
                >
                  <OWText
                    color={colors["neutral-text-action-on-dark-bg"]}
                    weight="600"
                    size={14}
                  >
                    50%
                  </OWText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors["primary-surface-default"],
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 4,
                  }}
                  onPress={() => {}}
                >
                  <OWText
                    color={colors["neutral-text-action-on-dark-bg"]}
                    weight="600"
                    size={14}
                  >
                    100%
                  </OWText>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  paddingRight: 4,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ marginRight: 4 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 44,
                      backgroundColor: "red",
                    }}
                  />
                </View>
                <OWText
                  weight="600"
                  size={16}
                  color={colors["neutral-text-action-on-light-bg"]}
                >
                  {tokenActive?.name}
                </OWText>
              </View>
              <OWIcon
                color={colors["neutral-icon-on-light"]}
                name="down"
                size={14}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.containerItemBottom, { paddingBottom: 16 }]}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  paddingRight: 4,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ marginRight: 4 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 44,
                      backgroundColor: "red",
                    }}
                  />
                </View>
                <OWText
                  weight="600"
                  size={16}
                  color={colors["neutral-text-action-on-light-bg"]}
                >
                  {tokenActive?.name}
                </OWText>
              </View>
              <OWIcon
                color={colors["neutral-icon-on-light"]}
                name="down"
                size={14}
              />
            </TouchableOpacity>
            <View>
              <BalanceText color={colors["neutral-text-title"]} weight="500">
                <OWText color={colors["neutral-text-body2"]}>Balance:</OWText>{" "}
                {balanceValue || 0.0} {tokenActive.name}
              </BalanceText>
            </View>
          </View>
        )}

        <InputSelectToken
          editable={editable}
          currencyValue={currencyValue}
          tokenActive={tokenActive}
          {...props}
        />
      </OWCard>
    );
  }
);

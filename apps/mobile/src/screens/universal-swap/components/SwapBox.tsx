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
import { useStore } from "@src/stores";
import { chainIcons } from "@oraichain/oraidex-common";
import { maskedNumber } from "@src/utils/helper";

export const SwapBox: FunctionComponent<ISwapBox> = observer(
  ({
    network,
    tokenActive,
    balanceValue,
    editable,
    onOpenNetworkModal,
    onSelectAmount,
    onChangeAmount,
    type = "from",
    disabled,
    loading,
    impactWarning,
    ...props
  }) => {
    const { colors } = useTheme();
    const { chainStore } = useStore();
    const styles = styling(colors);
    const chainInfo = chainStore.getChain(network);
    const chainIcon = chainIcons.find((c) => c.chainId === network);

    return (
      <OWCard
        type="normal"
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
                  {maskedNumber(balanceValue) || 0.0} {tokenActive.name}
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
                  disabled={disabled}
                  onPress={() => {
                    onSelectAmount("50");
                  }}
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
                  disabled={disabled}
                  onPress={() => {
                    onSelectAmount("100");
                  }}
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
              onPress={() => {
                onOpenNetworkModal(true);
              }}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  paddingRight: 4,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    marginRight: 4,
                    backgroundColor: colors["neutral-surface-action"],
                    borderRadius: 99,
                  }}
                >
                  <OWIcon
                    type="images"
                    source={{
                      uri: chainIcon?.Icon ?? chainInfo.chainSymbolImageUrl,
                    }}
                    size={20}
                  />
                </View>
                <OWText
                  weight="600"
                  size={16}
                  color={colors["neutral-text-title"]}
                >
                  {chainInfo?.chainName}
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
              onPress={() => {
                onOpenNetworkModal(true);
              }}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  paddingRight: 4,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    marginRight: 4,
                    backgroundColor: colors["neutral-surface-action"],
                    borderRadius: 99,
                  }}
                >
                  <OWIcon
                    type="images"
                    source={{
                      uri: chainIcon?.Icon ?? chainInfo.chainSymbolImageUrl,
                    }}
                    size={20}
                  />
                </View>
                <OWText
                  weight="600"
                  size={16}
                  color={colors["neutral-text-title"]}
                >
                  {chainInfo?.chainName}
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
                {maskedNumber(balanceValue) || 0.0} {tokenActive.name}
              </BalanceText>
            </View>
          </View>
        )}

        <InputSelectToken
          editable={editable}
          tokenActive={tokenActive}
          onChangeAmount={onChangeAmount}
          loading={loading}
          impactWarning={impactWarning}
          {...props}
        />
      </OWCard>
    );
  }
);

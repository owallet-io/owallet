import React, { FunctionComponent } from "react";
import { IBtcFeeConfig, IFeeConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Column, Columns } from "../../column";
import { useStyle } from "../../../styles";
import { StyleSheet, Text, View } from "react-native";
import { Box } from "../../box";
import { FormattedMessage } from "react-intl";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { AverageIconFill, FastIconFill, LowIconFill } from "@components/icon";
import { spacing } from "@src/themes";
import { RadioButton } from "react-native-radio-buttons-group";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { TouchableOpacity } from "@gorhom/bottom-sheet";

export const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig | IBtcFeeConfig;
}> = observer(({ feeConfig }) => {
  const { priceStore } = useStore();

  const feeCurrency =
    feeConfig.fees.length > 0
      ? feeConfig.fees[0].currency
      : feeConfig.selectableFeeCurrencies[0];

  if (!feeCurrency) {
    return null;
  }
  const { colors } = useTheme();
  const styles = styling(colors);
  const renderIconTypeFee = (
    label: string,
    round: boolean = true,
    size = 16,
    selected?: boolean
  ) => {
    switch (label) {
      case "Slow":
        return (
          <View
            style={{
              ...styles.containerIcon,
              borderRadius: round ? 44 : 0,
              backgroundColor: colors["neutral-surface-bg2"],
            }}
          >
            <LowIconFill color={colors["neutral-icon-on-light"]} size={size} />
          </View>
        );
      case "Average":
        return (
          <View
            style={{
              ...styles.containerIcon,
              borderRadius: round ? 44 : 0,
              backgroundColor: colors["warning-surface-subtle"],
            }}
          >
            <AverageIconFill
              color={colors["neutral-icon-on-light"]}
              size={size}
            />
          </View>
        );
      case "Fast":
        return (
          <View
            style={{
              ...styles.containerIcon,
              borderRadius: round ? 44 : 0,
              backgroundColor: colors["primary-surface-subtle"],
            }}
          >
            <FastIconFill color={colors["neutral-icon-on-light"]} size={size} />
          </View>
        );
      default:
        return (
          <View
            style={{
              ...styles.containerIcon,
              backgroundColor: colors["primary-surface-subtle"],
            }}
          >
            <LowIconFill color={colors["neutral-icon-on-light"]} size={size} />
          </View>
        );
    }
  };
  const renderVerticalButton: (
    label: string,
    price: PricePretty | undefined,
    amount: CoinPretty,
    selected: boolean,
    onPress: () => void
  ) => React.ReactElement = (label, price, amount, selected, onPress) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          backgroundColor: selected ? colors["neutral-surface-bg2"] : null,
          // paddingHorizontal: 16,
          paddingVertical: 8,
          marginVertical: 8,
          borderRadius: 8,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onPress={() => {
          onPress();
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View>{renderIconTypeFee(label)}</View>
          <View style={{ paddingLeft: 8 }}>
            <OWText
              style={{
                fontWeight: "600",
                color: colors["neutral-text-title"],
              }}
            >
              {label}
            </OWText>
            <OWText
              style={{
                color: colors["neutral-text-body"],
              }}
            >
              {" "}
              {amount.maxDecimals(6).trim(true).separator(" ").toString()}
              {price ? (
                <OWText
                  style={{
                    color: colors["neutral-text-body"],
                  }}
                >
                  ( {price.toString()})
                </OWText>
              ) : null}
            </OWText>
          </View>
        </View>

        <View>
          <RadioButton
            color={
              selected
                ? colors["highlight-surface-active"]
                : colors["neutral-text-body"]
            }
            id={label}
            selected={selected}
            onPress={onPress}
          />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{}}>
      {renderVerticalButton(
        "Slow",
        feeCurrency.coinGeckoId
          ? priceStore.calculatePrice(
              feeConfig.getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
            )
          : null,
        feeConfig
          .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
          .maxDecimals(6)
          .inequalitySymbol(true)
          .trim(true)
          .hideIBCMetadata(true),
        feeConfig.type === "low",
        () => {
          feeConfig.setFee({
            type: "low",
            currency: feeCurrency,
          });
        }
      )}
      {renderVerticalButton(
        "Average",
        feeCurrency.coinGeckoId
          ? priceStore.calculatePrice(
              feeConfig.getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
            )
          : null,
        feeConfig
          .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
          .maxDecimals(6)
          .inequalitySymbol(true)
          .trim(true)
          .hideIBCMetadata(true),
        feeConfig.type === "average",
        () => {
          feeConfig.setFee({
            type: "average",
            currency: feeCurrency,
          });
        }
      )}
      {renderVerticalButton(
        "Fast",
        feeCurrency.coinGeckoId
          ? priceStore.calculatePrice(
              feeConfig.getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
            )
          : null,
        feeConfig
          .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
          .maxDecimals(6)
          .inequalitySymbol(true)
          .trim(true)
          .hideIBCMetadata(true),
        feeConfig.type === "high",
        () => {
          feeConfig.setFee({
            type: "high",
            currency: feeCurrency,
          });
        }
      )}
    </View>
  );
});
const styling = (colors) =>
  StyleSheet.create({
    containerBtnFee: {
      flex: 1,
      justifyContent: "center",
      padding: spacing["12"],
      backgroundColor: colors["item"],
      borderColor: colors["white"],
      borderRadius: spacing["12"],
      marginLeft: 5,
      marginRight: 5,
    },
    containerIcon: {
      borderRadius: spacing["8"],
      padding: spacing["10"],
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
  });

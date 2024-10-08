import {
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@owallet/hooks";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { RadioButton } from "react-native-radio-buttons-group";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { spacing, typography } from "../../themes";
import { AverageIconFill, FastIconFill, LowIconFill } from "../icon";
import { RectButton } from "../rect-button";
import { LoadingSpinner } from "../spinner";
import OWText from "../text/ow-text";
import { GasInput } from "./gas";

export interface FeeButtonsProps {
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  buttonsContainerStyle?: ViewProps;
  errorLabelStyle?: TextStyle;
  label: string;
  gasLabel: string;
  vertical?: boolean;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  isGasInputOpen?: boolean;
}

class FeeButtonState {
  @observable
  protected _isGasInputOpen: boolean = false;

  constructor() {
    makeObservable(this);
  }

  get isGasInputOpen(): boolean {
    return this._isGasInputOpen;
  }

  @action
  setIsGasInputOpen(open: boolean) {
    this._isGasInputOpen = open;
  }
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  (props) => {
    // This may be not the good way to handle the states across the components.
    // But, rather than using the context API with boilerplate code, just use the mobx state to simplify the logic.
    const [feeButtonState] = useState(() => new FeeButtonState());
    return (
      <React.Fragment>
        {props.feeConfig.feeCurrency ? <FeeButtonsInner {...props} /> : null}
        {props?.isGasInputOpen || !props.feeConfig.feeCurrency ? (
          <GasInput
            labelStyle={props.labelStyle}
            label={props.gasLabel}
            gasConfig={props.gasConfig}
          />
        ) : null}
      </React.Fragment>
    );
  }
);

export const getFeeErrorText = (error: Error): string | undefined => {
  switch (error.constructor) {
    case InsufficientFeeError:
      return "Insufficient available balance for transaction fee";
    case NotLoadedFeeError:
      return undefined;
    default:
      return error.message || "Unknown error";
  }
};

export const FeeButtonsInner: FunctionComponent<FeeButtonsProps> = observer(
  ({
    labelStyle,
    containerStyle,
    buttonsContainerStyle,
    errorLabelStyle,
    label,
    feeConfig,
    vertical,
  }) => {
    const { priceStore, chainStore, appInitStore } = useStore();
    const style = useStyle();
    const { colors } = useTheme();
    const styles = styling(colors);

    useEffect(() => {
      if (feeConfig.feeCurrency && !feeConfig.fee) {
        feeConfig.setFeeType("average");
      }
      if (appInitStore.getInitApp.feeOption) {
        feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
      }
    }, [feeConfig, appInitStore.getInitApp.feeOption]);

    // For chains without feeCurrencies, OWallet assumes tx doesn’t need to include information about the fee and the fee button does not have to be rendered.
    // The architecture is designed so that fee button is not rendered if the parental component doesn’t have a feeCurrency.
    // However, because there may be situations where the fee buttons is rendered before the chain information is changed,
    // and the fee button is an observer, and the sequence of rendering the observer may not appear stabilized,
    // so only handling the rendering in the parent component may not be sufficient
    // Therefore, this line double checks to ensure that the fee buttons is not rendered if fee currency doesn’t exist.
    // But because this component uses hooks, using a hook in the line below can cause an error.
    // Note that hooks should be used above this line, and only rendering-related logic should exist below this line.
    if (!feeConfig.feeCurrency) {
      return <React.Fragment />;
    }

    const lowFee = feeConfig.getFeeTypePretty("low");
    const lowFeePrice = priceStore.calculatePrice(lowFee);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice(highFee);

    let isFeeLoading = false;

    const error = feeConfig.getError();
    const errorText: string | undefined = (() => {
      if (error) {
        if (error.constructor === NotLoadedFeeError) {
          isFeeLoading = true;
        }

        return getFeeErrorText(error);
      }
    })();

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
              <LowIconFill
                color={colors["neutral-icon-on-light"]}
                size={size}
              />
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
              <FastIconFill
                color={colors["neutral-icon-on-light"]}
                size={size}
              />
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
              <LowIconFill
                color={colors["neutral-icon-on-light"]}
                size={size}
              />
            </View>
          );
      }
    };

    const renderButton: (
      label: string,
      price: PricePretty | undefined,
      amount: CoinPretty,
      selected: boolean,
      onPress: () => void
    ) => React.ReactElement = (label, price, amount, selected, onPress) => {
      return (
        <RectButton
          style={{
            ...styles.containerBtnFee,
            ...(selected
              ? {
                  borderColor: colors["primary-surface-default"],
                  borderWidth: 1,
                }
              : {
                  borderColor: colors["border-purple-100-gray-800"],
                  borderWidth: 0.5,
                }),
          }}
          rippleColor={style.get("color-primary-100").color}
          onPress={onPress}
        >
          <View>
            {renderIconTypeFee(label)}
            <OWText
              style={{
                ...typography.h7,
                fontWeight: "700",
                color: colors["sub-primary-text"],
              }}
            >
              {label}
            </OWText>
          </View>
          <OWText
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: colors["sub-primary-text"],
            }}
          >
            {chainStore.current.networkType === "bitcoin" ? "≤" : null}{" "}
            {amount.maxDecimals(6).trim(true).separator(" ").toString()}
          </OWText>
          {price ? (
            <OWText
              style={{
                fontSize: 10,
                lineHeight: 16,
                color: colors["sub-primary-text"],
              }}
            >
              {chainStore.current.networkType === "bitcoin" ? "≤" : null}{" "}
              {price.toString()}
            </OWText>
          ) : null}
        </RectButton>
      );
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
                {chainStore.current.networkType === "bitcoin" ? "≤" : null}{" "}
                {amount.maxDecimals(6).trim(true).separator(" ").toString()}
                {price ? (
                  <OWText
                    style={{
                      color: colors["neutral-text-body"],
                    }}
                  >
                    ({chainStore.current.networkType === "bitcoin" ? "≤" : null}{" "}
                    {price.toString()})
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

    return vertical ? (
      <View style={{}}>
        {renderVerticalButton(
          "Slow",
          lowFeePrice,
          lowFee,
          feeConfig.feeType === "low",
          () => {
            feeConfig.setFeeType("low");
            appInitStore.updateFeeOption("low");
          }
        )}
        {renderVerticalButton(
          "Average",
          averageFeePrice,
          averageFee,
          feeConfig.feeType === "average",
          () => {
            feeConfig.setFeeType("average");
            appInitStore.updateFeeOption("average");
          }
        )}
        {renderVerticalButton(
          "Fast",
          highFeePrice,
          highFee,
          feeConfig.feeType === "high",
          () => {
            feeConfig.setFeeType("high");
            appInitStore.updateFeeOption("high");
          }
        )}
      </View>
    ) : (
      <View
        style={{
          paddingBottom: spacing["28"],
          ...containerStyle,
        }}
      >
        <Text
          style={[
            StyleSheet.flatten([
              style.flatten([
                "subtitle3",
                "color-text-black-medium",
                "margin-bottom-3",
              ]),
              labelStyle,
            ]),
            { color: colors["sub-primary-text"] },
          ]}
        >
          {label}
        </Text>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          {renderButton(
            "Slow",
            lowFeePrice,
            lowFee,
            feeConfig.feeType === "low",
            () => {
              feeConfig.setFeeType("low");
              appInitStore.updateFeeOption("low");
            }
          )}
          {renderButton(
            "Average",
            averageFeePrice,
            averageFee,
            feeConfig.feeType === "average",
            () => {
              feeConfig.setFeeType("average");
              appInitStore.updateFeeOption("average");
            }
          )}
          {renderButton(
            "Fast",
            highFeePrice,
            highFee,
            feeConfig.feeType === "high",
            () => {
              feeConfig.setFeeType("high");
              appInitStore.updateFeeOption("high");
            }
          )}
        </View>
        {isFeeLoading ? (
          <View>
            <View
              style={style.flatten([
                "absolute",
                "height-16",
                "justify-center",
                "margin-top-2",
                "margin-left-4",
              ])}
            >
              <LoadingSpinner
                size={14}
                color={style.get("color-loading-spinner").color}
              />
            </View>
          </View>
        ) : null}
        {!isFeeLoading && errorText ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute",
                  "text-caption1",
                  "color-error",
                  "margin-top-6",
                  "margin-left-4",
                ]),
                errorLabelStyle,
              ])}
            >
              {errorText}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);

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

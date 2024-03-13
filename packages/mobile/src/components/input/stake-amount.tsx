import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { TextStyle, View, ViewStyle, TouchableOpacity } from "react-native";
import OWText from "../text/ow-text";
import { TextInput } from "./input";

export const StakeAmountInput: FunctionComponent<{
  labelStyle?: TextStyle;
  colors: any;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;
  placeholder?: string;
  placeholderTextColor?: string;
  allowMax?: boolean;
  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    amountConfig,
    placeholder,
    placeholderTextColor,
    allowMax = true,
    colors,
  }) => {
    const error = amountConfig.getError();
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            return;
          case InvalidNumberAmountError:
            return "Invalid number";
          case ZeroAmountError:
            return "Amount is zero";
          case NegativeAmountError:
            return "Amount is negative";
          case InsufficientAmountError:
            return "Insufficient fund";
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    return (
      <>
        <View style={{ flexDirection: "row" }}>
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
            onPress={() => {
              amountConfig.setFraction(0.5);
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
            onPress={() => {
              amountConfig.setFraction(1);
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
        <View>
          <TextInput
            label={""}
            labelStyle={labelStyle}
            containerStyle={containerStyle}
            inputContainerStyle={inputContainerStyle}
            textAlign="right"
            errorLabelStyle={errorLabelStyle}
            value={amountConfig.amount}
            onChangeText={(text) => {
              amountConfig.setAmount(text.replace(/,/g, "."));
            }}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            error={errorText}
            keyboardType="numeric"
            style={{ fontSize: 24 }}
          />
        </View>
      </>
    );
  }
);

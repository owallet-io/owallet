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
import { TextStyle, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../themes";
import { Button } from "../button";
import { TextInput } from "./input";

export const AmountInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;
  placeholder?: string;
  placeholderTextColor?: string;
  label: string;
  allowMax?: boolean;
  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    amountConfig,
    placeholder,
    placeholderTextColor,
    allowMax = true,
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
      <TextInput
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        value={amountConfig.amount}
        onChangeText={(text) => {
          amountConfig.setAmount(text.replace(/,/g, "."));
        }}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        inputRight={
          allowMax ? (
            <View
              style={{
                height: 1,
                overflow: "visible",
                justifyContent: "center",
              }}
            >
              <Button
                text="MAX"
                mode={"light"}
                size="small"
                containerStyle={{
                  height: 24,
                  borderRadius: spacing["8"],
                  backgroundColor: colors["primary-surface-default"],
                  justifyContent: "center",
                  alignItems: "center",
                }}
                textStyle={{
                  color: colors["white"],
                  textTransform: "uppercase",
                }}
                onPress={() => {
                  amountConfig.setIsMax(!amountConfig.isMax);
                }}
              />
            </View>
          ) : null
        }
        error={errorText}
        keyboardType="numeric"
      />
    );
  }
);

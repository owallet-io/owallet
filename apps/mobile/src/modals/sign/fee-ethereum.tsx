import { IFeeEthereumConfig, IGasConfig } from "@owallet/hooks";
import React, { FunctionComponent, useEffect } from "react";
import { Text, View } from "react-native";
import { TextStyle, ViewStyle } from "react-native";
import { TextInput } from "../../components/input";
import Big from "big.js";
import { observer } from "mobx-react-lite";
import { colors } from "@src/themes";

export const FeeInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  gasConfig: IGasConfig;
  gasPrice: string;
  label: string;
  feeConfig: any;
  decimals: number;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    label,
    feeConfig,
    gasConfig,
    gasPrice,
    decimals,
  }) => {
    useEffect(() => {
      try {
        if (gasConfig.gasRaw !== "NaN" && gasPrice != "NaN") {
          feeConfig.setFee(
            new Big(parseInt(gasConfig.gasRaw)).mul(gasPrice).toFixed(decimals)
          );
        } else {
          feeConfig.setFee(parseFloat(feeConfig.feeRaw).toString());
        }
      } catch (error) {
        feeConfig.setFee(parseFloat(feeConfig.feeRaw).toString());
        console.log(error);
      }
    }, [gasConfig.gasRaw, gasPrice]);

    return (
      <TextInput
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        label={label}
        value={Number(feeConfig.feeRaw).toString()}
        onChangeText={(text) => {
          feeConfig.setFee(text);
        }}
        inputRight={
          <View>
            <Text style={{ color: colors["sub-text"] }}>
              {feeConfig.chainInfo.stakeCurrency.coinDenom}
            </Text>
          </View>
        }
        keyboardType="decimal-pad"
      />
    );
  }
);

export const GasInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  label: string;
  gasConfig: IGasConfig;
}> = observer(
  ({ labelStyle, containerStyle, inputContainerStyle, label, gasConfig }) => {
    return (
      <TextInput
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        label={label}
        value={gasConfig.gasRaw}
        onChangeText={(text) => {
          gasConfig.setGas(text);
        }}
        keyboardType="number-pad"
      />
    );
  }
);

export const FeeEthereumInSign: FunctionComponent<{
  feeConfig: IFeeEthereumConfig;
  gasConfig: IGasConfig;
  gasPrice: string;
  decimals: number;
}> = observer(({ feeConfig, gasConfig, gasPrice, decimals }) => {
  return (
    <View>
      <GasInput label={"Gas"} gasConfig={gasConfig} />
      <FeeInput
        label={"Fee"}
        feeConfig={feeConfig}
        gasPrice={gasPrice}
        gasConfig={gasConfig}
        decimals={decimals}
      />
    </View>
  );
});

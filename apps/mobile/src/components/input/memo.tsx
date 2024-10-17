import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IMemoConfig, MemoConfig } from "@owallet/hooks";
import { TextStyle, ViewStyle } from "react-native";
import { TextInput } from "./input";

export const MemoInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;
  placeholder?: string;
  label: string;
  inputLeft?: React.ReactNode;
  placeholderTextColor?: string;
  memoConfig: MemoConfig;
  multiline?: boolean;
  editable?: boolean;
  topInInputContainer?: React.ReactNode;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    memoConfig,
    placeholder,
    placeholderTextColor,
    inputStyle,
    inputLeft,
    multiline,
    topInInputContainer,
    editable,
  }) => {
    return (
      <TextInput
        topInInputContainer={topInInputContainer}
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        inputStyle={inputStyle}
        multiline={multiline}
        style={{
          fontSize: 16,
        }}
        editable={editable}
        errorLabelStyle={errorLabelStyle}
        value={memoConfig.memo}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onChangeText={(text) => {
          memoConfig.setMemo(text);
        }}
        inputLeft={inputLeft}
      />
    );
  }
);

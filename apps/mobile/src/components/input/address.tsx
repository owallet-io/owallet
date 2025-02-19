import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  // ENSFailedToFetchError,
  // ENSIsFetchingError,
  // ENSNotSupportedError,
  IMemoConfig,
  InvalidBech32Error,
  IRecipientConfig,
} from "@owallet/hooks";
import {
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  Clipboard,
} from "react-native";
import { TextInput } from "./input";
import { ObservableEnsFetcher } from "@owallet/ens";
import { LoadingSpinner } from "../spinner";
import { useStyle } from "../../styles";
import { NoteIcon } from "../icon";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import OWIcon from "@components/ow-icon/ow-icon";
import OWText from "@components/text/ow-text";
import { OWButton } from "@components/button";

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
  },
  "height-16": {
    height: 16,
  },
  "justify-center": {
    justifyContent: "center",
  },
  "margin-top-2": {
    marginTop: 2,
  },
});

export const AddressInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;
  inputContainerStyle?: ViewStyle;
  topInInputContainer?: React.ReactNode;
  label: string;
  colors?: any;
  inputRight?: React.ReactNode;
  inputLeft?: React.ReactNode;
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
  disableAddressBook?: boolean;
  placeholder?: string;
  placeholderTextColor?: string;
  disableAddressError?: boolean;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputLeft,
    inputContainerStyle,
    errorLabelStyle,
    label,
    recipientConfig,
    memoConfig,
    disableAddressBook,
    placeholder,
    placeholderTextColor,
    inputRight,
    colors,
    topInInputContainer,
    disableAddressError,
  }) => {
    const style = useStyle();

    // const isENSAddress = ObservableEnsFetcher.isValidENS(
    //   recipientConfig.rawRecipient
    // );

    const error = disableAddressError
      ? null
      : recipientConfig.uiProperties.error;

    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return "Invalid address";
          // case ENSNotSupportedError:
          //     return "ENS not supported";
          // case ENSFailedToFetchError:
          //     return "Failed to fetch the address from ENS";
          // case ENSIsFetchingError:
          //     return;
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    // const isENSLoading: boolean = error instanceof ENSIsFetchingError;

    return (
      <TextInput
        multiline
        label={label}
        topInInputContainer={topInInputContainer}
        labelStyle={labelStyle}
        containerStyle={{
          ...containerStyle,
          marginBottom:
            error && error.constructor !== EmptyAddressError ? 24 : 0,
        }}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        error={errorText}
        value={recipientConfig.value}
        onChangeText={(text) => {
          recipientConfig.setValue(text.replace(/\s/g, ""));
        }}
        style={{
          fontSize: 16,
        }}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        // paragraph={recipientConfig.value}
        inputLeft={inputLeft}
        inputRight={
          disableAddressBook ? null : (
            <View
            // style={style.flatten([
            //   "height-1",
            //   "overflow-visible",
            //   "justify-center",
            // ])}
            >
              {inputRight ? (
                inputRight
              ) : (
                <OWButton
                  onPress={async () => {
                    const text = await Clipboard.getString();
                    if (text) {
                      recipientConfig.setValue(text.replace(/\s/g, ""));
                    }
                  }}
                  type={"link"}
                  size={"small"}
                  label={"Paste"}
                  fullWidth={false}
                  style={style.flatten(["padding-4"])}
                />
              )}
            </View>
          )
        }
        autoCorrect={false}
        autoCapitalize="none"
        // autoCompleteType="off"
      />
    );
  }
);

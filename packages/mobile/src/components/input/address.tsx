import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  ENSNotSupportedError,
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
} from "react-native";
import { TextInput } from "./input";
import { ObservableEnsFetcher } from "@owallet/ens";
import { LoadingSpinner } from "../spinner";
import { useStyle } from "../../styles";
import { NoteIcon } from "../icon";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

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
  }) => {
    const style = useStyle();

    const isENSAddress = ObservableEnsFetcher.isValidENS(
      recipientConfig.rawRecipient
    );

    const error = recipientConfig.getError();

    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return "Invalid address";
          case ENSNotSupportedError:
            return "ENS not supported";
          case ENSFailedToFetchError:
            return "Failed to fetch the address from ENS";
          case ENSIsFetchingError:
            return;
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    const isENSLoading: boolean = error instanceof ENSIsFetchingError;

    return (
      <TextInput
        // multiline
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
        value={recipientConfig.rawRecipient}
        onChangeText={(text) => {
          recipientConfig.setRawRecipient(text.replace(/\s/g, ""));
        }}
        style={{
          fontSize: 16,
        }}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        paragraph={
          isENSAddress ? (
            isENSLoading ? (
              <View>
                <View
                  style={[
                    styles["absolute"],
                    styles["height-16"],
                    styles["justify-center"],
                    styles["margin-top-2"],
                  ]}
                >
                  <LoadingSpinner size={14} color={"#83838F"} />
                </View>
              </View>
            ) : (
              recipientConfig.recipient
            )
          ) : undefined
        }
        inputLeft={inputLeft}
        inputRight={
          disableAddressBook ? null : (
            <View
              style={style.flatten([
                "height-1",
                "overflow-visible",
                "justify-center",
              ])}
            >
              {inputRight ? (
                inputRight
              ) : (
                <TouchableOpacity
                  style={style.flatten(["padding-4"])}
                  onPress={() => {
                    navigate(SCREENS.AddressBook, {
                      recipientConfig,
                      memoConfig,
                    });
                  }}
                >
                  <NoteIcon
                    color={colors ? colors["neutral-icon-on-light"] : "#7C00DB"}
                    height={18}
                  />
                </TouchableOpacity>
              )}
            </View>
          )
        }
        autoCorrect={false}
        autoCapitalize="none"
        autoCompleteType="off"
      />
    );
  }
);

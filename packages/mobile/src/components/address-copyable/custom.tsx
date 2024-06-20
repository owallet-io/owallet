import React, { FunctionComponent } from "react";
import { ViewStyle, View, Clipboard } from "react-native";
import { Text } from "@src/components/text";
import { Bech32Address } from "@owallet/cosmos";
import { RectButton } from "../rect-button";
import { CheckIcon, CopyFillIcon } from "../icon";
import { useSimpleTimer } from "../../hooks";
import { formatContractAddress } from "../../utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export const CustomAddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  chain?: string;
  onPress?: Function;
  networkType?: string;
  maxCharacters: number;
  icon?: any;
  copyable?: boolean;
}> = ({
  style: propStyle,
  address,
  maxCharacters,
  networkType,
  chain,
  icon,
  onPress,
  copyable,
}) => {
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();

  return (
    <TouchableWithoutFeedback
      style={{
        paddingLeft: 12,
        paddingRight: 8,
        marginVertical: 9.5,
        borderRadius: 12,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...propStyle,
      }}
      onPress={() => {
        Clipboard.setString(address);
        setTimer(300);
        onPress?.();
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 44,
            backgroundColor: colors["neutral-icon-on-dark"],
            marginRight: 16,
          }}
        >
          {icon ?? null}
        </View>
        <View>
          {chain ? (
            <Text
              style={{
                fontSize: 14,
                color: colors["neutral-text-title"],
                fontWeight: "600",
              }}
            >
              {chain}
            </Text>
          ) : null}
          <Text
            style={{
              fontSize: 14,
              color: colors["sub-text"],
              fontWeight: "400",
            }}
          >
            {networkType === "cosmos"
              ? Bech32Address.shortenAddress(address, maxCharacters)
              : formatContractAddress(address ?? "")}
          </Text>
        </View>
      </View>

      {!copyable ? null : (
        <View
          style={{
            width: 24,
            height: 24,
            justifyContent: "center",
          }}
        >
          {isTimedOut ? (
            <CheckIcon />
          ) : (
            <CopyFillIcon size={24} color={colors["neutral-icon-on-light"]} />
          )}
        </View>
      )}
    </TouchableWithoutFeedback>
  );
};

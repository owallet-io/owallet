import React, { FunctionComponent, ReactElement } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@src/components/text";
import { spacing } from "../../themes";
import OWIcon from "../ow-icon/ow-icon";
import { useSmartNavigation } from "@src/navigation.provider";

export const PageHeader: FunctionComponent<{
  title: string;
  colors: any;
  left?: ReactElement;
  onPress?: () => void;
  onGoBack?: () => void;
  right?: ReactElement;
}> = ({ title, right, left, onGoBack, colors }) => {
  const smartNavigation = useSmartNavigation();

  const goBack = () => {
    smartNavigation.goBack();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing["card-vertical"],
        justifyContent: "space-between",
      }}
    >
      {left ? (
        <View style={{ marginRight: spacing["16"] }}>{left}</View>
      ) : (
        <TouchableOpacity
          onPress={onGoBack ?? goBack}
          style={{
            backgroundColor: colors["neutral-surface-card"],
            borderRadius: 999,
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: spacing["16"],
          }}
        >
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
      )}
      {title ? (
        <View
          style={{
            justifyContent: "center",
            paddingLeft: spacing["8"],
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              lineHeight: 24,
              color: colors["neutral-text-title"],
              textTransform: "uppercase",
            }}
          >
            {title}
          </Text>
        </View>
      ) : null}

      <View>
        {right && <View style={{ marginRight: spacing["16"] }}>{right}</View>}
      </View>
    </View>
  );
};

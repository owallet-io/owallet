import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";

export const WordChip: FunctionComponent<{
  index: number;
  word: string;
  colors: any;
  hideWord?: boolean;

  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ index, word, hideWord, empty, dashedBorder, colors }) => {
  return (
    <View
      style={{
        borderRadius: 8,
        borderWidth: 1,
        margin: 5,
        borderColor: empty
          ? colors["primary-100"]
          : colors["primary-surface-default"],
        borderStyle: dashedBorder ? "dashed" : "dotted",
      }}
    >
      <Text
        style={{
          color: empty
            ? colors["primary-100"]
            : colors["text-gray-900-primary-surface-default"],
          fontSize: 18,
          lineHeight: 22,
          fontWeight: "400",
          padding: 4,
          opacity: 1,
        }}
      >
        {empty ? `         ` : ` ${word}`}
      </Text>
    </View>
  );
};

export const BackupWordChip: FunctionComponent<{
  index: number;
  word: string;
  hideWord?: boolean;
  colors: any;
  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ index, word, hideWord, empty }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderRadius: 999,
        margin: 5,
        backgroundColor: colors["neutral-surface-action3"],
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
      }}
    >
      <View
        style={{
          borderRadius: 999,
          width: 24,
          height: 24,
          backgroundColor: colors["primary-surface-subtle"],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            padding: 4,
            color: empty
              ? colors["neutral-text-title"]
              : colors["primary-text-default"],
          }}
        >
          {index}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          lineHeight: 22,
          fontWeight: "500",
          padding: 4,
          paddingHorizontal: 6,
          opacity: 1,
          color: empty
            ? colors["primary-surface-default"]
            : colors["neutral-text-title"],
        }}
      >
        {empty ? `         ` : `${word}`}
      </Text>
    </View>
  );
};

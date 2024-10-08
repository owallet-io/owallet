import React from "react";
import { useTheme } from "@src/themes/theme-provider";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { metrics } from "@src/themes";
export const SkeletonNft = () => {
  const { colors } = useTheme();
  return (
    <SkeletonPlaceholder
      highlightColor={colors["skeleton"]}
      backgroundColor={colors["neutral-surface-action"]}
      borderRadius={18}
    >
      <SkeletonPlaceholder.Item
        width={(metrics.screenWidth - 48) / 2}
        padding={12}
        height={(metrics.screenWidth + 32) / 2}
      ></SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

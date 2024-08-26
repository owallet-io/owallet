import React, { FunctionComponent } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { registerModal } from "@src/modals/base";
import { useTheme } from "@src/themes/theme-provider";

const MoreModal: FunctionComponent<{
  copyable?: boolean;
  onPress?: Function;
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(({ onPress, copyable = true, close }) => {
  const { colors } = useTheme();

  return (
    <View style={{ padding: 24 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 44,
            backgroundColor: colors["primary-surface-default"],
            marginRight: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OWIcon
            name={"trending-outline"}
            size={20}
            color={colors["neutral-text-action-on-dark-bg"]}
          />
        </View>
        <View>
          <Text size={16} weight="600">
            Compound All Staking
          </Text>
          <Text size={13} color={colors["neutral-text-body3"]}>
            Claims and reinvests your rewards
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 24,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 44,
            backgroundColor: colors["neutral-surface-action"],
            marginRight: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OWIcon
            name={"tdesigncreditcard"}
            size={20}
            color={colors["neutral-text-action-on-light-bg"]}
          />
        </View>
        <View>
          <Text size={16} weight="600">
            Buy
          </Text>
          <Text size={13} color={colors["neutral-text-body3"]}>
            Exchange cash for crypto
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

export default MoreModal;

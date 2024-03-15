import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@src/components/text";
import { useStyle } from "../../styles";
import { registerModal } from "../../modals/base";
import { RectButton } from "../rect-button";
import { metrics, spacing, typography } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { chainIcons } from "@oraichain/oraidex-common";
import OWIcon from "../ow-icon/ow-icon";
import OWText from "../text/ow-text";
import { DownArrowIcon } from "../icon";
export const SelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  items: {
    label: string;
    key: string;
  }[];
  maxItemsToShow?: number;
  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;
  modalPersistent?: boolean;
}> = registerModal(
  ({
    close,
    items,
    selectedKey,
    setSelectedKey,
    maxItemsToShow,
    modalPersistent,
  }) => {
    const { colors } = useTheme();

    const renderBall = (selected: boolean) => {
      if (selected) {
        return (
          <View
            style={{
              ...styles.ball,
              backgroundColor: colors["primary-surface-default"],
            }}
          >
            <View
              style={{
                height: spacing["12"],
                width: spacing["12"],
                borderRadius: spacing["32"],
                backgroundColor: colors["white"],
              }}
            />
          </View>
        );
      } else {
        return (
          <View
            style={{
              ...styles.ball,
              backgroundColor: colors["gray-100"],
            }}
          >
            <View
              style={{
                height: spacing["12"],
                width: spacing["12"],
                borderRadius: spacing["32"],
                backgroundColor: colors["white"],
              }}
            />
          </View>
        );
      }
    };

    const scrollViewRef = useRef<ScrollView | null>(null);
    const initOnce = useRef<boolean>(false);

    const onInit = () => {
      if (!initOnce.current) {
        if (scrollViewRef.current) {
          scrollViewRef.current.flashScrollIndicators();

          if (maxItemsToShow) {
            const selectedIndex = items.findIndex(
              (item) => item.key === selectedKey
            );

            if (selectedIndex) {
              const scrollViewHeight = maxItemsToShow * 64;

              scrollViewRef.current.scrollTo({
                y: selectedIndex * 64 - scrollViewHeight / 2 + 32,
                animated: false,
              });
            }
          }

          initOnce.current = true;
        }
      }
    };

    return (
      <View
        style={{
          borderRadius: spacing["8"],
          overflow: "hidden",
          backgroundColor: colors["background-box"],
          paddingVertical: spacing["16"],
        }}
      >
        <ScrollView
          style={{
            maxHeight: maxItemsToShow ? 64 * maxItemsToShow : undefined,
            paddingHorizontal: spacing["24"],
          }}
          ref={scrollViewRef}
          persistentScrollbar={true}
          onLayout={onInit}
        >
          {items.map((item) => {
            return (
              <View
                style={{
                  backgroundColor: colors["background-item-list"],
                  borderRadius: spacing["12"],
                  marginTop: spacing["8"],
                  marginBottom: spacing["8"],
                  paddingHorizontal: spacing["18"],
                }}
              >
                <RectButton
                  key={item.key}
                  style={{
                    height: 64,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onPress={() => {
                    setSelectedKey(item.key);
                    if (!modalPersistent) {
                      close();
                    }
                  }}
                >
                  <Text
                    style={{ ...styles.label, color: colors["primary-text"] }}
                  >
                    {item.label}
                  </Text>
                  {renderBall(item.key === selectedKey)}
                </RectButton>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

export const TokensSelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  label: string;
  chainId: string;
  placeHolder?: string;
  maxItemsToShow?: number;

  items: any[];

  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;

  modalPersistent?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  selectorContainerStyle,
  textStyle,
  label,
  maxItemsToShow,
  placeHolder,
  items,
  selectedKey,
  setSelectedKey,
  chainId,
  modalPersistent,
}) => {
  const selected = useMemo(() => {
    return items.find((item) => item.key === selectedKey);
  }, [items, selectedKey]);

  console.log("items", items);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <React.Fragment>
      <SelectorModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        maxItemsToShow={maxItemsToShow}
        modalPersistent={modalPersistent}
      />
      <SelectorButtonWithoutModal
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        selected={selected}
        chainId={chainId}
        onPress={() => setIsModalOpen(true)}
      />
    </React.Fragment>
  );
};

export const SelectorButtonWithoutModal: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  chainId: string;
  label: string;
  placeHolder?: string;

  selected:
    | {
        label: string;
        key: string;
      }
    | undefined;

  onPress: () => void;
}> = ({
  containerStyle,
  labelStyle,
  selectorContainerStyle,
  textStyle,
  label,
  placeHolder,
  selected,
  onPress,
  chainId,
}) => {
  const { colors } = useTheme();

  const chainIcon = chainIcons.find((c) => c.chainId === chainId);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        backgroundColor: colors["neutral-surface-action3"],
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 12,
        maxWidth: metrics.screenWidth / 4.5,
        marginTop: 12,
        alignItems: "center",
      }}
    >
      <OWIcon type="images" source={{ uri: chainIcon?.Icon }} size={16} />
      <OWText style={{ paddingHorizontal: 4 }} weight="600" size={14}>
        {selected ? selected.label : chainId ?? ""}
      </OWText>
      <DownArrowIcon height={11} color={colors["primary-text"]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ball: {
    width: spacing["24"],
    height: spacing["24"],
    borderRadius: spacing["32"],
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.h5,
    fontWeight: "700",
  },
});

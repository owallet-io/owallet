import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { registerModal } from "../../modals/base";
import { RectButton } from "../rect-button";
import { metrics, spacing } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { chainIcons } from "@oraichain/oraidex-common";
import OWIcon from "../ow-icon/ow-icon";
import OWText from "../text/ow-text";
import { DownArrowIcon } from "../icon";
import { RadioButton } from "react-native-radio-buttons-group";
import { Bech32Address } from "@owallet/cosmos";
import { TextInput } from "./input";
export const SelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  items: any[];
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

    const [keyword, setKeyword] = useState("");

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
        <View>
          <TextInput
            style={{
              paddingVertical: 0,
              height: 40,
              backgroundColor: colors["neutral-surface-action"],
              borderRadius: 999,
              paddingLeft: 35,
              fontSize: 16,
              color: colors["neutral-text-body"],
            }}
            inputContainerStyle={{
              borderWidth: 0,
            }}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search for a token"
            onChangeText={(t) => setKeyword(t)}
            value={keyword}
          />
          <View style={{ position: "absolute", left: 24, top: 24 }}>
            <OWIcon
              color={colors["neutral-icon-on-light"]}
              name="search"
              size={16}
            />
          </View>
        </View>
        <ScrollView
          style={{
            maxHeight: maxItemsToShow ? 64 * maxItemsToShow : undefined,
            paddingHorizontal: spacing["24"],
          }}
          ref={scrollViewRef}
          persistentScrollbar={true}
          onLayout={onInit}
        >
          {items
            .filter((i) => i.denom.includes(keyword))
            .map((item) => {
              if (item) {
                const selected = item.key === selectedKey;

                let subtitle;
                const channel = item.denom.split(" (")?.[1];
                if (channel) {
                  subtitle = `(${channel}`;
                }
                if (item.contractAddress) {
                  subtitle = Bech32Address.shortenAddress(
                    item.contractAddress,
                    24
                  );
                }

                return (
                  <View
                    style={{
                      marginVertical: 16,
                    }}
                  >
                    <RectButton
                      key={item.key}
                      style={{
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
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={{
                            marginRight: 8,
                            borderRadius: 999,
                            width: 40,
                            height: 40,
                            backgroundColor: colors["neutral-surface-action2"],
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <OWIcon
                            type="images"
                            source={{ uri: item.image }}
                            size={28}
                          />
                        </View>
                        <View>
                          <OWText size={16} weight="500">
                            {item.denom.replace(/(.{16})..+/, "$1…")}
                          </OWText>
                          {subtitle ? (
                            <OWText
                              color={colors["neutral-text-body"]}
                              size={14}
                              weight="400"
                            >
                              {subtitle}
                            </OWText>
                          ) : null}
                        </View>
                      </View>

                      <RadioButton
                        color={
                          selected
                            ? colors["hightlight-surface-active"]
                            : colors["neutral-text-body"]
                        }
                        id={item.key}
                        selected={selected}
                        onPress={() => {
                          setSelectedKey(item.key);
                          if (!modalPersistent) {
                            close();
                          }
                        }}
                      />
                    </RectButton>
                  </View>
                );
              }
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
    | {
        contractAddress: string;
        denom: string;
        image: string;
        key: string;
      }
    | undefined;

  onPress: () => void;
}> = ({ selected, onPress, chainId }) => {
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
        maxWidth: metrics.screenWidth / 4,
        marginTop: 12,
        alignItems: "center",
      }}
    >
      <OWIcon
        type="images"
        source={{ uri: selected.image ?? chainIcon?.Icon }}
        size={16}
      />
      <OWText style={{ paddingHorizontal: 4 }} weight="600" size={14}>
        {selected ? selected.denom : chainId ?? ""}
      </OWText>
      <DownArrowIcon height={11} color={colors["primary-text"]} />
    </TouchableOpacity>
  );
};

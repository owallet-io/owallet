import { StyleSheet, View, TextInput } from "react-native";
import React, { FunctionComponent, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import OWText from "@src/components/text/ow-text";
import { BottomSheetProps, TouchableOpacity } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import { RadioButton } from "react-native-radio-buttons-group";

export const SelectTokenTypeModal: FunctionComponent<{
  list: Array<string>;
  onPress?: Function;
  isOpen?: boolean;
  selected: string;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = ({ onPress, list, selected }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = styling(colors);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.searchInput}>
          <OWText size={16} weight="700">
            SELECT TYPE
          </OWText>
        </View>
      </View>
      <ScrollView
        style={[
          {
            paddingBottom: safeAreaInsets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        persistentScrollbar={true}
      >
        {list.map((type) => {
          const isSelected = type === selected;
          return (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 12,
              }}
              onPress={() => {
                onPress(type);
              }}
            >
              <OWText weight="600">{type.toUpperCase()}</OWText>
              <View>
                <RadioButton
                  color={
                    isSelected
                      ? colors["highlight-surface-active"]
                      : colors["neutral-text-body"]
                  }
                  id={type}
                  selected={isSelected}
                  onPress={() => {
                    onPress(type);
                  }}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      alignSelf: "center",
    },
    searchInput: {
      paddingHorizontal: 12,
    },
  });

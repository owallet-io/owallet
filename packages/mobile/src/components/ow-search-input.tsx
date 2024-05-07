import { View } from "react-native";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { TextInput } from "@src/components/input";
import React, { useState } from "react";
import { useTheme } from "@src/themes/theme-provider";

export const OWSearchInput = ({ placeHolder = "Search URL" }) => {
  const [search, setSearch] = useState<string>();
  const { colors } = useTheme();
  return (
    <TextInput
      inputLeft={
        <View
          style={{
            paddingRight: 8,
          }}
        >
          <OWIcon
            color={colors["neutral-text-action-on-light-bg"]}
            name={"tdesignsearch"}
            size={20}
          />
        </View>
      }
      // onSubmitEditing={(e) => onHandleUrl(e.nativeEvent.text)}
      placeholder={placeHolder}
      placeholderTextColor={colors["neutral-text-body"]}
      inputStyle={{
        backgroundColor: colors["neutral-surface-action"],
        borderWidth: 0,
        borderRadius: 999,
        paddingVertical: 12,
      }}
      containerStyle={{
        backgroundColor: colors["neutral-surface-card"],
        flex: 1,
      }}
      returnKeyType={"next"}
      defaultValue={search}
      onChangeText={(txt) => setSearch(txt.toLowerCase())}
      inputRight={
        <>
          {search?.length > 0 && (
            <OWButtonIcon
              fullWidth={false}
              colorIcon={colors["neutral-text-action-on-light-bg"]}
              name={"tdesignclose"}
              sizeIcon={20}
              onPress={() => {
                setSearch("");
              }}
            />
          )}
        </>
      }
    />
  );
};

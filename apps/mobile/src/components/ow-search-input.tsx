import { View, ViewProps } from "react-native";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { TextInput } from "@src/components/input";
import React, { FC, useState } from "react";
import { useTheme } from "@src/themes/theme-provider";

export const OWSearchInput: FC<{
  placeHolder: string;
  style: ViewProps["style"];
  containerStyle: ViewProps["style"];
  onValueChange: (txt) => void;
}> = ({
  placeHolder = "Search URL",
  style,
  containerStyle,
  onValueChange = () => {},
}) => {
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
            color={colors["neutral-icon-on-light"]}
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
        height: 44,
        ...style,
      }}
      containerStyle={{
        backgroundColor: colors["neutral-surface-card"],
        flex: 1,
        ...containerStyle,
      }}
      returnKeyType={"next"}
      defaultValue={search}
      onChangeText={(txt) => {
        setSearch(txt.toLowerCase());
        onValueChange(txt.toLowerCase());
      }}
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
                onValueChange("");
              }}
            />
          )}
        </>
      }
    />
  );
};

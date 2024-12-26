import { FlatList, View } from "react-native";
import { ItemBanner } from "@src/screens/web/components/item-banner";
import React, { FC } from "react";
import { useTheme } from "@src/themes/theme-provider";

export const ListDapp: FC<{ data: any }> = ({ data }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 4,
        paddingTop: 8,
        paddingBottom: 0,
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        numColumns={2}
        renderItem={({ item, index }) => {
          return <ItemBanner key={index.toString()} item={item} />;
        }}
      />
    </View>
  );
};

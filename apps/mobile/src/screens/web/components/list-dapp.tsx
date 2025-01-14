import { FlatList, RefreshControl, View } from "react-native";
import { ItemBanner } from "@src/screens/web/components/item-banner";
import React, { FC, useState } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { InjectedProviderUrl } from "@screens/web/config";
import { fetchRetry } from "@owallet/common";

export const ListDapp: FC<{ data: any }> = observer(({ data }) => {
  const { colors } = useTheme();
  const { browserStore } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    fetchRetry(InjectedProviderUrl, {}, true)
      .then((res) => {
        browserStore.update_inject(res);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setRefreshing(false);
      });
  };
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        numColumns={2}
        renderItem={({ item, index }) => {
          return <ItemBanner key={index.toString()} item={item} />;
        }}
      />
    </View>
  );
});

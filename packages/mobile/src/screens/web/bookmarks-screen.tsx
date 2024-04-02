import React from "react";
import { PageWithView } from "@src/components/page";
import { PageHeader } from "@src/components/header/header-new";

import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
import { TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useStore } from "@src/stores";
import OWIcon from "@src/components/ow-icon/ow-icon";
import {
  getFavicon,
  getNameBookmark,
} from "@src/screens/web/helper/browser-helper";
import OWText from "@src/components/text/ow-text";
import { limitString } from "@src/utils/helper";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const BookmarksScreen = observer(() => {
  const { colors } = useTheme();
  const { browserStore } = useStore();
  console.log(browserStore.getBookmarks, "browserStore.getBookmarks");
  const onDetailBrowser = (url) => {
    if (!url) return;
    navigate(SCREENS.DetailsBrowser, {
      url: url,
    });
    return;
  };
  const onDelete = (uri) => {
    if (!uri) return;
    browserStore.removeBoorkmark(uri);
    return;
  };
  const renderItem = ({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        onPress={() => onDetailBrowser(item?.uri)}
        style={{
          paddingVertical: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: isActive ? colors["neutral-surface-action"] : null,
          borderRadius: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View
            style={{
              backgroundColor: colors["neutral-surface-action"],
              borderRadius: 999,
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <OWIcon
              type={"images"}
              size={18}
              source={{
                uri: getFavicon(item.uri),
              }}
            />
          </View>
          <View
            style={{
              paddingLeft: 10,
            }}
          >
            <OWText
              color={colors["neutral-text-title"]}
              weight={"600"}
              size={16}
            >
              {getNameBookmark(item?.name ? item?.name : item?.uri)}
            </OWText>
            <OWText color={colors["neutral-text-body"]} weight={"400"}>
              {limitString(item?.uri, 30)}
            </OWText>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <OWButtonIcon
            name={"tdesigndelete"}
            sizeIcon={24}
            onPress={() => onDelete(item)}
            fullWidth={false}
            colorIcon={colors["neutral-text-action-on-light-bg"]}
          />
          <OWButtonIcon
            name={"tdesignview-list"}
            sizeIcon={24}
            fullWidth={false}
            colorIcon={colors["neutral-text-disable"]}
            onLongPress={drag}
          />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <PageWithView>
      <PageHeader
        title="BOOKMARKS"
        // subtitle={chainStore.current.chainName}
        colors={colors}
      />
      <View
        style={{
          paddingHorizontal: 16,
        }}
      >
        <DraggableFlatList
          data={browserStore.getBookmarks}
          onDragEnd={({ data }) => {
            browserStore.updateBookmarks(data);
            // setData(data);
          }}
          keyExtractor={(item: any) => item?.uri}
          renderItem={renderItem}
        />
      </View>
    </PageWithView>
  );
});

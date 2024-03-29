import { FlatList, useWindowDimensions, View } from "react-native";
import React from "react";
import { TabBar, TabView } from "react-native-tab-view";
import OWText from "@src/components/text/ow-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageWithViewInBottomTabView } from "@src/components/page";
import { TextInput } from "@src/components/input";
import { RightArrowIcon, SearchIcon } from "@src/components/icon";
import { OWButton } from "@src/components/button";
import OWFlatList from "@src/components/page/ow-flat-list";
import { TouchableOpacity } from "react-native-gesture-handler";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { observer } from "mobx-react-lite";
import { renderScene } from "@src/screens/web/routes";
import { useTheme } from "@src/themes/theme-provider";
import {
  dataBookMarks,
  getFavicon,
  getNameBookmark,
} from "@src/screens/web/helper/browser-helper";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { checkValidDomain } from "@src/utils/helper";
import { useStore } from "@src/stores";

export const BrowserScreen = observer(() => {
  const layout = useWindowDimensions();
  const { colors } = useTheme();
  const { browserStore } = useStore();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "all", title: "All" },
    { key: "defi", title: "DeFi" },
    { key: "ai", title: "AI" },
    { key: "explorer", title: "Explorer" },
  ]);
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors["primary-surface-default"] }}
      style={{ backgroundColor: colors["neutral-surface-card"], height: 50 }}
      labelStyle={{
        fontSize: 16,
        fontWeight: "600",
      }}
      renderLabel={({ route, focused, color }) => (
        <OWText style={{ color, fontSize: 16 }}>{route.title}</OWText>
      )}
      // scrollEnabled={true}
      activeColor={colors["primary-surface-default"]}
      inactiveColor={colors["neutral-text-body"]}
    />
  );
  const onDetailBrowser = (url) => {
    if (!url) return;
    navigate(SCREENS.DetailsBrowser, {
      url: url,
    });
    return;
  };
  const { top } = useSafeAreaInsets();
  const onHandleUrl = (uri) => {
    const url = uri?.toLowerCase();
    if (!url) return;
    let link: string;
    if (checkValidDomain(url)) {
      link = url?.indexOf("http") >= 0 ? url : "https://" + url;
    } else {
      link = `https://www.google.com/search?q=${url}`;
    }
    navigate(SCREENS.DetailsBrowser, {
      url: link,
    });
    return;
  };
  const onBookmarks = () => {
    navigate(SCREENS.BookMarks);
    return;
  };
  return (
    <PageWithViewInBottomTabView
      // disableSafeArea={true}
      style={{
        backgroundColor: colors["neutral-surface-action"],
        flexGrow: 1,
      }}
    >
      <TextInput
        inputLeft={
          <View
            style={{
              paddingRight: 8,
            }}
          >
            <SearchIcon
              size={14}
              color={colors["neutral-text-action-on-light-bg"]}
            />
          </View>
        }
        onSubmitEditing={(e) => onHandleUrl(e.nativeEvent.text)}
        placeholder={"Search URL"}
        placeholderTextColor={colors["neutral-text-body"]}
        inputStyle={{
          backgroundColor: colors["neutral-surface-action"],
          borderWidth: 0,
          borderRadius: 999,
        }}
        containerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16 + (top || 0),
          backgroundColor: colors["neutral-surface-card"],
        }}
      />
      <View
        style={{
          padding: 16,
          paddingBottom: 0,
        }}
      >
        <View style={{}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <OWText size={16} weight={"600"}>
              Bookmarks
            </OWText>
            <OWButton
              label={"View all"}
              type={"link"}
              onPress={onBookmarks}
              fullWidth={false}
              size={"medium"}
              textStyle={{
                fontWeight: "600",
                fontSize: 14,
                color: colors["primary-surface-default"],
              }}
              iconRight={
                <View
                  style={{
                    paddingLeft: 10,
                  }}
                >
                  <RightArrowIcon
                    color={colors["primary-surface-default"]}
                    height={14}
                  />
                </View>
              }
            />
          </View>
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={browserStore.getBookmarks}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={() => onDetailBrowser(item?.uri)}
                  style={{
                    alignItems: "center",
                    marginHorizontal: 16,
                  }}
                >
                  <OWIcon
                    size={30}
                    type={"images"}
                    source={{
                      uri: getFavicon(item?.uri),
                    }}
                  />
                  <OWText
                    style={{
                      paddingTop: 3,
                    }}
                    color={colors["neutral-text-title"]}
                    size={14}
                    weight={"400"}
                  >
                    {getNameBookmark(item?.name ? item?.name : item?.uri)}
                  </OWText>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors["neutral-surface-card"],
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 16,
        }}
      >
        <OWText size={22} weight={"700"}>
          Discover Apps
        </OWText>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
        style={{
          flex: 1,
        }}
      />
    </PageWithViewInBottomTabView>
  );
});

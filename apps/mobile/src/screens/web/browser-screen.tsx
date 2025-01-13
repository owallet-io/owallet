import { Clipboard, FlatList, useWindowDimensions, View } from "react-native";
import React, { useEffect, useState } from "react";
import { TabBar, TabView } from "react-native-tab-view";
import OWText from "@src/components/text/ow-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "@src/components/input";
import { RightArrowIcon } from "@src/components/icon";
import { OWButton } from "@src/components/button";
import { TouchableOpacity } from "react-native-gesture-handler";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { observer } from "mobx-react-lite";
import { renderScene } from "@src/screens/web/routes";
import { useTheme } from "@src/themes/theme-provider";
import {
  getFavicon,
  getNameBookmark,
} from "@src/screens/web/helper/browser-helper";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { checkValidDomain, showToast } from "@src/utils/helper";
import { useStore } from "@src/stores";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { tracking } from "@src/utils/tracking";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { PageWithViewInBottomTabView } from "@src/components/page";

export const BrowserScreen = observer(() => {
  const layout = useWindowDimensions();
  useEffect(() => {
    tracking(`Browser Screen`);

    return () => {};
  }, []);

  const { colors } = useTheme();
  const { browserStore } = useStore();
  const { inject } = browserStore;
  const sourceCode = inject;

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "all", title: "All" },
    { key: "defi", title: "DeFi" },
    // { key: "ai", title: "AI" },
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
    if (!sourceCode) {
      showToast({
        type: "danger",
        message: "Not connected! Please try again.",
      });
      return;
    }
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
    if (!sourceCode) {
      showToast({
        type: "danger",
        message: "Not connected! Please try again.",
      });
      return;
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
  const [url, setUrl] = useState("");
  const onClear = () => {
    setUrl("");
  };
  const onPasteAndGo = async () => {
    const text = await Clipboard.getString();
    if (text) {
      setUrl(text);
      if (!sourceCode) {
        showToast({
          type: "danger",
          message: "Not connected! Please try again.",
        });
        return;
      }
      navigate(SCREENS.DetailsBrowser, {
        url: text,
      });
      return;
    }
  };
  return (
    <PageWithViewInBottomTabView
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
            <OWIcon
              color={colors["neutral-text-title"]}
              name={"tdesignsearch"}
              size={20}
            />
          </View>
        }
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={(e) => onHandleUrl(e.nativeEvent.text)}
        placeholder={"Search URL"}
        placeholderTextColor={colors["neutral-text-body"]}
        inputStyle={{
          backgroundColor: colors["neutral-surface-action"],
          borderWidth: 0,
          borderRadius: 999,
          paddingVertical: 7,
        }}
        containerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16 + (top || 0),
          backgroundColor: colors["neutral-surface-card"],
        }}
        returnKeyType={"next"}
        defaultValue={url}
        onChangeText={(txt) => setUrl(txt.toLowerCase())}
        inputRight={
          <>
            <OWButton
              onPress={onPasteAndGo}
              size={"small"}
              style={{
                backgroundColor: colors["neutral-surface-action3"],
                borderRadius: 99,
                paddingHorizontal: 10,
                paddingVertical: 5,
                // height: 20
              }}
              textStyle={{
                color: colors["neutral-text-title"],
                fontWeight: "600",
                fontSize: 13,
              }}
              fullWidth={false}
              disabled={!sourceCode}
              loading={!sourceCode}
              colorLoading={colors["neutral-text-title"]}
              label={"Paste & Go"}
            />
            {url?.length > 0 && (
              <OWButtonIcon
                fullWidth={false}
                colorIcon={colors["neutral-text-title"]}
                name={"tdesignclose"}
                sizeIcon={20}
                onPress={onClear}
              />
            )}
          </>
        }
      />
      <View
        style={{
          padding: 16,
          paddingBottom: 0,
        }}
      >
        {[...(browserStore.getBookmarks || [])].length > 0 ? (
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
            {!inject ? (
              <SkeletonPlaceholder
                highlightColor={colors["skeleton"]}
                backgroundColor={colors["neutral-surface-card-brutal"]}
                borderRadius={12}
              >
                <SkeletonPlaceholder.Item
                  width={"100%"}
                  marginBottom={8}
                  height={65}
                ></SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            ) : (
              <FlatList
                horizontal={true}
                style={{
                  paddingBottom: 16,
                }}
                showsHorizontalScrollIndicator={false}
                data={[...(browserStore.getBookmarks || [])]}
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
                        style={{ borderRadius: 999 }}
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
            )}
          </View>
        ) : null}
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
          Oraichain Apps
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

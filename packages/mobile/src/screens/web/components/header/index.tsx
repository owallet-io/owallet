import React, { FunctionComponent, useEffect, useState } from "react";
import { Platform, StyleSheet, View, TextInput } from "react-native";
import { Text } from "@src/components/text";
import { useHeaderHeight } from "@react-navigation/elements";
import { useStyle } from "../../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWebViewState } from "../context";
import Svg, { Path } from "react-native-svg";
import { RectButton } from "../../../../components/rect-button";
import { metrics } from "../../../../themes";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";
import { checkValidDomain } from "../../../../utils/helper";
import { HeaderBackButtonIcon } from "../../../../components/header/icon";
import { useTheme } from "@src/themes/theme-provider";
const EditIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 20, color }) => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M4.61666 16.2676C4.10832 16.2676 3.63332 16.0926 3.29166 15.7676C2.85832 15.3593 2.64999 14.7426 2.72499 14.0759L3.03332 11.3759C3.09166 10.8676 3.39999 10.1926 3.75832 9.82594L10.6 2.58427C12.3083 0.775936 14.0917 0.725936 15.9 2.43427C17.7083 4.1426 17.7583 5.92594 16.05 7.73427L9.20832 14.9759C8.85832 15.3509 8.20832 15.7009 7.69999 15.7843L5.01666 16.2426C4.87499 16.2509 4.74999 16.2676 4.61666 16.2676ZM13.275 2.42594C12.6333 2.42594 12.075 2.82594 11.5083 3.42594L4.66666 10.6759C4.49999 10.8509 4.30832 11.2676 4.27499 11.5093L3.96666 14.2093C3.93332 14.4843 3.99999 14.7093 4.14999 14.8509C4.29999 14.9926 4.52499 15.0426 4.79999 15.0009L7.48332 14.5426C7.72499 14.5009 8.12499 14.2843 8.29166 14.1093L15.1333 6.8676C16.1667 5.7676 16.5417 4.75094 15.0333 3.33427C14.3667 2.6926 13.7917 2.42594 13.275 2.42594Z"
        fill={color}
      />
      <Path
        d="M14.4502 9.12406C14.4335 9.12406 14.4085 9.12406 14.3919 9.12406C11.7919 8.86573 9.7002 6.89073 9.3002 4.30739C9.2502 3.96573 9.48353 3.64906 9.8252 3.59073C10.1669 3.54073 10.4835 3.77406 10.5419 4.11573C10.8585 6.13239 12.4919 7.68239 14.5252 7.88239C14.8669 7.91573 15.1169 8.22406 15.0835 8.56573C15.0419 8.88239 14.7669 9.12406 14.4502 9.12406Z"
        fill={color}
      />
      <Path
        d="M17.5 18.959H2.5C2.15833 18.959 1.875 18.6757 1.875 18.334C1.875 17.9923 2.15833 17.709 2.5 17.709H17.5C17.8417 17.709 18.125 17.9923 18.125 18.334C18.125 18.6757 17.8417 18.959 17.5 18.959Z"
        fill={color}
      />
    </Svg>
  );
};

const BookmarkedIcon: FunctionComponent<{
  size: number;
  color?: string;
}> = ({ size = 20, color }) => {
  return (
    <Svg width="13" height="17" viewBox="0 0 13 17" fill="none">
      <Path
        d="M0 2.48399C0 1.82519 0.256807 1.19338 0.713927 0.727543C1.17105 0.261705 1.79103 0 2.4375 0H10.5625C11.209 0 11.829 0.261705 12.2861 0.727543C12.7432 1.19338 13 1.82519 13 2.48399V15.7551C13 16.7653 11.8787 17.3531 11.0728 16.7661L6.5 13.4375L1.92725 16.7661C1.12044 17.354 0 16.7661 0 15.7559V2.48399Z"
        fill="#945EF8"
      />
    </Svg>
  );
};

const BookmarkIcon: FunctionComponent<{
  size: number;
  color?: string;
}> = ({ size = 20, color }) => {
  return (
    <Svg width="13" height="17" viewBox="0 0 13 17" fill="none">
      <Path
        d="M11.3671 16.3619L11.367 16.3618L6.79425 13.0333L6.5 12.8191L6.20575 13.0333L1.633 16.3618L1.6328 16.362C1.17109 16.6984 0.5 16.3755 0.5 15.7559V2.48399C0.5 1.95478 0.706379 1.44912 1.0708 1.07774C1.43491 0.706686 1.92672 0.5 2.4375 0.5H10.5625C11.0733 0.5 11.5651 0.706686 11.9292 1.07774C12.2936 1.44912 12.5 1.95478 12.5 2.48399V15.7551C12.5 16.3747 11.828 16.6976 11.3671 16.3619Z"
        stroke="#945EF8"
      />
    </Svg>
  );
};

export const OnScreenWebpageScreenHeader: FunctionComponent = observer(() => {
  const navigation = useNavigation();
  const { browserStore } = useStore();
  const { colors } = useTheme();

  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeaderHeight = headerHeight - safeAreaInsets.top;
  const [onEdit, setOnEdit] = useState(false);
  const [isBookmark, setIsBookmark] = useState(false);
  const webViewState = useWebViewState();
  const [currentUrl, setURL] = useState(webViewState.name);

  useEffect(() => {
    const rIndex = browserStore.getBookmarks.findIndex(
      (b) => b.uri === webViewState.url
    );
    if (rIndex > -1) {
      setIsBookmark(true);
    }
  }, [browserStore]);

  const onBookmark = () => {
    const rIndex = browserStore.getBookmarks.findIndex(
      (b) => b.uri === webViewState.url
    );

    if (rIndex > -1) {
      // case found
      browserStore.removeBoorkmark({
        uri: webViewState.url,
        name: webViewState.name,
      });
      setIsBookmark(false);
    } else {
      // case not found
      browserStore.addBoorkmark({
        id: Date.now(),
        uri: webViewState.url,
        name: webViewState.name,
      });
      setIsBookmark(true);
    }
  };

  return (
    <View
      style={StyleSheet.flatten([
        {
          height: headerHeight,
          // If the iPhone has notch, add the extra bottom space for header.
          // Because of the lack of space, it slightly invades the notch, giving it a bit more space.
          paddingTop:
            safeAreaInsets.top -
            (Platform.OS === "ios" && safeAreaInsets.top > 44 ? 6 : 0),
        },
      ])}
    >
      {/* Name and refresh icon on center */}
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          paddingRight: 16,
          alignItems: "center",
          height: actualHeaderHeight,
          marginBottom: 16,
        }}
      >
        <RectButton
          style={{ paddingLeft: 4, width: 60 }}
          onPress={() => {
            if (!webViewState.canGoBack) {
              webViewState.clearWebViewContext();
              navigation.goBack();
            } else if (webViewState.webView) {
              webViewState.webView.goBack();
            }
          }}
        >
          <HeaderBackButtonIcon size={24} color={colors["icon"]} />
        </RectButton>
        {onEdit ? (
          <TextInput
            style={{
              width: metrics.screenWidth * 0.7,
              fontFamily: "SpaceGrotesk-Regular",
              color: colors["label"],
              fontWeight: "500",
            }}
            returnKeyType={"next"}
            placeholder={"Type URL"}
            placeholderTextColor={colors["label"]}
            autoFocus={true}
            defaultValue={webViewState.name}
            onChangeText={(text) => setURL(text)}
            onSubmitEditing={() => {
              browserStore.removeTab(browserStore.getSelectedTab);
              if (currentUrl !== "") {
                if (checkValidDomain(currentUrl?.toLowerCase())) {
                  const tab = {
                    id: Date.now(),
                    name: currentUrl,
                    uri:
                      currentUrl?.toLowerCase().indexOf("http") >= 0
                        ? currentUrl?.toLowerCase()
                        : "https://" + currentUrl?.toLowerCase(),
                  };
                  browserStore.addTab(tab);
                  navigation.navigate("Web.dApp", tab);
                } else {
                  let uri = `https://www.google.com/search?q=${
                    currentUrl ?? ""
                  }`;
                  browserStore.addTab({
                    id: Date.now(),
                    name: "Google",
                    uri,
                  });
                  navigation.navigate("Web.dApp", {
                    name: "Google",
                    uri,
                  });
                }
              }
            }}
            onBlur={() => setOnEdit(false)}
          />
        ) : (
          <RectButton
            style={StyleSheet.flatten([
              style.flatten([
                "flex-row",
                "items-center",
                "padding-y-5",
                "justify-between",
              ]),
              {
                borderBottomWidth: 0.4,
                borderBottomColor: colors["border"],
                width: metrics.screenWidth * 0.7,
              },
            ])}
            onPress={() => {
              setOnEdit(true);
            }}
          >
            <Text
              style={{
                color: colors["label"],
                fontWeight: "500",
              }}
            >
              {webViewState.name}
            </Text>
            <EditIcon size={20} color={colors["icon"]} />
          </RectButton>
        )}
        <RectButton onPress={onBookmark}>
          {isBookmark ? (
            <BookmarkedIcon size={20} />
          ) : (
            <BookmarkIcon size={20} />
          )}
        </RectButton>
      </View>

      {/* Other buttons like the back, forward, home... */}
      {/* <View
          style={StyleSheet.flatten([
            style.flatten([
              'absolute',
              'width-full',
              'flex-row',
              'items-center'
            ]),
            {
              left: 0,
              height: actualHeaderHeight
            }
          ])}
          pointerEvents="box-none"
        >
          <View style={style.get('flex-1')} />
        </View> */}
      {/* </View> */}
    </View>
  );
});

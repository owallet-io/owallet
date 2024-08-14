import { ImageBackground, TouchableOpacity, View } from "react-native";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { limitString, showToast } from "@src/utils/helper";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { tracking } from "@src/utils/tracking";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { useTheme } from "@src/themes/theme-provider";

export const ItemBanner: FC<{ item: any }> = observer(({ item }) => {
  const { browserStore } = useStore();
  const { colors } = useTheme();

  const { inject } = browserStore;
  const sourceCode = inject;
  const onToBrowser = (url) => {
    if (!sourceCode) {
      showToast({
        type: "danger",
        message: "Please check your network connection and try again.",
      });
      return;
    }
    if (!url) return;
    tracking(`Detail Browser`, `url=${url};`);
    navigate(SCREENS.DetailsBrowser, {
      url: url,
    });
    return;
  };

  const renderItemSkeleton = () => {
    return (
      <SkeletonPlaceholder
        highlightColor={colors["skeleton"]}
        backgroundColor={colors["neutral-surface-action"]}
        borderRadius={12}
      >
        <SkeletonPlaceholder.Item
          width={"100%"}
          marginVertical={8}
          height={65}
        ></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 4,
      }}
    >
      {!inject ? (
        renderItemSkeleton()
      ) : (
        <TouchableOpacity
          disabled={!inject}
          onPress={() => onToBrowser(item.url)}
        >
          <ImageBackground
            style={{
              width: "100%",
              height: 160,
            }}
            imageStyle={{ borderRadius: 12 }}
            resizeMode={"cover"}
            source={item.images}
          >
            <View
              style={{
                paddingHorizontal: 16,
                justifyContent: "center",
                flex: 1,
              }}
            >
              <OWIcon type={"images"} source={item.logo} size={32} />
              <OWText
                size={16}
                weight={"600"}
                style={{
                  color: "#EBEDF2",
                  paddingTop: 8,
                }}
              >
                {item.title}
              </OWText>
              <OWText
                size={13}
                weight={"400"}
                style={{
                  color: "#909298",
                }}
              >
                {limitString(item.subTitle, 60)}
              </OWText>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
    </View>
  );
});

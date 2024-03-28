import { useTheme } from "@src/themes/theme-provider";
import { FlatList, ImageBackground, View } from "react-native";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import React from "react";
import { explorerData } from "@src/screens/web/helper/browser-helper";

export const ExplorerRoute = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 16,
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        data={explorerData}
        numColumns={2}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                flex: 1,
                padding: 4,
              }}
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
                    {item.subTitle}
                  </OWText>
                </View>
              </ImageBackground>
            </View>
          );
        }}
      />
    </View>
  );
};

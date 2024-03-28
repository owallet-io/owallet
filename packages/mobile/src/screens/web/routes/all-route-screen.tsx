import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
import { FlatList, ImageBackground, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import React from "react";
import { dataAll } from "@src/screens/web/helper/browser-helper";

export const AllRoute = observer(() => {
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
        data={dataAll}
        numColumns={2}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                flex: 1,
                padding: 4,
              }}
            >
              <TouchableOpacity onPress={() => {}}>
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
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
});

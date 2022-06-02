import React, { FunctionComponent, useRef, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RectButton } from "../../components/rect-button";
import Svg, { Path, G, Defs, ClipPath } from "react-native-svg";
import { DAppInfos } from "./config";

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    if (Platform.OS === "ios") {
      RNFS.readFile(
        `${RNFS.MainBundlePath}/injected-provider.bundle.js`
      ).then((r) => setCode(r));
    } else {
      RNFS.readFileAssets("injected-provider.bundle.js").then((r) =>
        setCode(r)
      );
    }
  }, []);

  return (
    <PageWithScrollViewInBottomTabView
      contentContainerStyle={style.get("flex-grow-1")}
      style={StyleSheet.flatten([
        style.flatten(["padding-x-20"]),
        {
          marginTop: safeAreaInsets.top,
        },
      ])}
    >
      <Text
        style={style.flatten([
          "h3",
          "color-text-black-high",
          "margin-top-44",
          "margin-bottom-20",
        ])}
      >
        Access dApps
      </Text>
      {DAppInfos.map(({ name, thumbnail, uri, logo }) => (
        <WebpageImageButton
          key={uri}
          name={name}
          source={thumbnail}
          logo={logo}
          onPress={() => {
            smartNavigation.pushSmart("Web.dApp", { name, uri });
          }}
        />
      ))}
    </PageWithScrollViewInBottomTabView>
  );
};

export const WebpageImageButton: FunctionComponent<{
  name?: string;
  source?: ImageSourcePropType;
  onPress?: () => void;
  logo?: ImageSourcePropType;
  overrideInner?: React.ReactElement;
}> = ({ name, source, onPress, logo, overrideInner }) => {
  const style = useStyle();

  const height = 240;

  /*
    Adjust the size of image view manually because react native's resize mode doesn't provide the flexible API.
    First load the image view with invisible,
    after it is loaded, obtain the image view's size and the appropriate size is set accordingly to it.
   */
  const [imageSize, setImageSize] = useState<
    | {
        width: number | string;
        height: number;
      }
    | undefined
  >(undefined);

  const imageRef = useRef<Image | null>(null);
  const onImageLoaded = () => {
    if (imageRef.current) {
      imageRef.current.measure((_x, _y, measureWidth, measureHeight) => {
        setImageSize({
          width: (measureWidth / measureHeight) * height,
          height,
        });
      });
    }
  };

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "overflow-hidden",
          "border-radius-16",
          "background-color-big-image-placeholder",
          "margin-bottom-16",
        ]),
        {
          height,
        },
      ])}
    >
      {source ? (
        <View style={style.flatten(["absolute-fill", "items-end"])}>
          <Image
            ref={imageRef}
            style={
              imageSize
                ? {
                    resizeMode: "stretch",
                    width: "100%",
                    height,
                  }
                : {
                    opacity: 0,
                  }
            }
            onLoadEnd={onImageLoaded}
            source={source}
            fadeDuration={0}
          />
          {imageSize ? (
            <View
              style={style.flatten([
                "absolute-fill",
                "background-color-black",
                "opacity-10",
              ])}
            />
          ) : null}
        </View>
      ) : null}
      <View style={style.flatten(["absolute-fill"])}>
        <RectButton
          style={StyleSheet.flatten([
            style.flatten(["flex-row", "padding-x-20", "padding-y-20"]),
            { height },
          ])}
          activeOpacity={0.2}
          underlayColor={style.get("color-white").color}
          enabled={onPress != null}
          onPress={onPress}
        >
          {overrideInner ? (
            overrideInner
          ) : (
            <React.Fragment>
              <View
                style={[
                  style.flatten([
                    "flex-row",
                    "items-center",
                    "width-160",
                    "height-44",
                    "border-radius-32",
                    "padding-x-12",
                    "background-color-text-black-very-very-low",
                  ]),
                ]}
              >
                <Image
                  ref={imageRef}
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 8,
                  }}
                  onLoadEnd={onImageLoaded}
                  source={logo}
                  fadeDuration={0}
                />
                <Text style={style.flatten(["font-extrabold", "subtitle1"])}>
                  {name}
                </Text>
              </View>

              <View style={style.get("flex-1")} />
              <View
                style={style.flatten([
                  "flex-row",
                  "items-center",
                  "justify-center",
                  "width-44",
                  "height-44",
                  "border-radius-32",
                  "background-color-text-black-very-very-low",
                ])}
              >
                <GoIcon
                  width={20}
                  height={20}
                  color={style.get("color-black").color}
                />
              </View>
            </React.Fragment>
          )}
        </RectButton>
      </View>
    </View>
  );
};

const GoIcon: FunctionComponent<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 38, height = 23, color = "white" }) => {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 38 23">
      <G clipPath="url(#clip0_4026_25847)">
        <Path
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          d="M25.91 2.125l9.362 9.375-9.363 9.375m8.063-9.375H2.5"
        />
      ) : null}
    </PageWithView>
  );
};

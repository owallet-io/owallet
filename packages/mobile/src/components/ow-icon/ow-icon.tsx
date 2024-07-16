import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import Icon, { IconProps } from "./icomoon";
export interface IOWIconProps extends IconProps {
  type?: "images";
  source?: ImageSourcePropType;
  style?: any;
  resizeMode?: "cover" | "contain";
}
const OWIcon = ({
  type,
  style,
  resizeMode = "contain",
  ...props
}: IOWIconProps) => {
  const [imageDefault, setImageDefault] = useState(
    "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://orai.io&size=32"
  );
  const [isErrorLoad, setIsErrorLoad] = useState(false);
  useEffect(() => {
    setIsErrorLoad(false);
  }, [props.source?.uri]);
  if (type == "images")
    return (
      <Image
        style={{
          width: props.size,
          height: props.size,
          tintColor: props.color,
          ...style,
        }}
        onError={(e) => {
          if (e.nativeEvent?.error) {
            setIsErrorLoad(true);
            if (props?.onError) {
              props?.onError(e);
            }
          }
        }}
        source={
          isErrorLoad
            ? {
                uri: imageDefault,
              }
            : props.source
        }
        resizeMode={resizeMode}
      />
    );
  return <Icon {...props} />;
};

export default OWIcon;

const styles = StyleSheet.create({});

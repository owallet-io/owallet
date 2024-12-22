import React, { useEffect, useState } from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";

import Icon, { IconProps } from "./icomoon";
import FastImage, { FastImageProps } from "react-native-fast-image";
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
    "https://assets.coingecko.com/coins/images/12931/standard/orai.png?1696512718"
  );
  const [isErrorLoad, setIsErrorLoad] = useState(false);
  useEffect(() => {
    setIsErrorLoad(false);
  }, [props.source?.uri]);
  if (type == "images")
    return (
      //@ts-ignore
      <FastImage
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

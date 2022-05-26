import React, { FunctionComponent } from "react";

import { useStyle } from "../../styles";
import { View, Image } from "react-native";

export const OWalletLogo: FunctionComponent = () => {
  const style = useStyle();

  return (
    <View style={style.flatten(["flex-row", "items-center"])}>
      <Image
        style={style.flatten(["width-80", "height-80"])}
        source={require("../../assets/logo/splash-screen-only-k.png")}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

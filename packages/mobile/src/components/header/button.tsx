import React, { FunctionComponent } from "react";
import { StackHeaderLeftButtonProps } from "@react-navigation/stack";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { HeaderBackButtonIcon } from "./icon";
import { spacing } from "../../themes";

export const HeaderLeftButton: FunctionComponent<
  StackHeaderLeftButtonProps
> = ({ children, onPress }) => {
  const style = useStyle();

  return (
    <View
      style={{
        position: "absolute",
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          padding: spacing["10"],
        }}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

export const HeaderRightButton: FunctionComponent<{
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ children, style: propStyle, onPress }) => {
  const style = useStyle();

  return (
    <View
      style={{
        position: "absolute",
        ...propStyle,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          padding: spacing["10"],
        }}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};
export const HeaderLeftBackButton: FunctionComponent<
  StackHeaderLeftButtonProps
> = (props) => {
  return (
    <React.Fragment>
      {props.canGoBack ? (
        <HeaderLeftButton {...props}>
          <HeaderBackButtonIcon />
        </HeaderLeftButton>
      ) : null}
    </React.Fragment>
  );
};

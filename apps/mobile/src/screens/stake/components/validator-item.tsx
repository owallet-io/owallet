import React, { FunctionComponent } from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing, typography } from "../../../themes";
import { Text } from "@src/components/text";
import { TouchableOpacity } from "react-native-gesture-handler";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

interface Validator {
  imageUri?: string;
  name?: string;
  amount?: string;
  denom?: string;
  staked?: number;
}

interface ValidatorItemProps {
  validator?: Validator;
  containerStyle?: ViewStyle;
}

export const ValidatorItem: FunctionComponent<ValidatorItemProps> = ({
  validator,
  containerStyle,
}) => {
  const _onPress = () => {
    navigate(SCREENS.DelegateDetail, {
      validator,
    });
  };

  return (
    <TouchableOpacity
      style={{
        ...styles.container,
        ...containerStyle,
      }}
      onPress={_onPress}
    >
      <View
        style={{
          ...styles.containerLeft,
        }}
      >
        <Image
          source={{
            uri: validator.imageUri,
          }}
          style={{
            height: 38,
            width: 38,
            borderRadius: spacing["6"],
            marginRight: spacing["12"],
          }}
          resizeMode="cover"
        />
        <Text
          style={{
            ...styles.textInfo,
            fontWeight: "700",
          }}
        >
          {validator.name}
        </Text>
      </View>

      <View
        style={{
          ...styles.containerRight,
        }}
      >
        <Text
          style={{
            ...styles.textInfo,
          }}
        >{`${validator?.amount} ${validator?.denom?.toUpperCase()}`}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors["white"],
    borderRadius: spacing["8"],
    marginVertical: spacing["8"],
    flexDirection: "row",
    marginHorizontal: spacing["24"],
    padding: spacing["8"],
    flex: 1,
  },
  containerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  containerRight: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  textInfo: {
    ...typography.h5,
    fontWeight: "400",
    color: colors["gray-900"],
  },
});

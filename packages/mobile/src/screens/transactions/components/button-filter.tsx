import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { useTheme } from "@src/themes/theme-provider";

const ButtonFilter = ({ label, onPress, value }) => {
  const styles = styling();
  const { colors } = useTheme();
  return (
    <View style={styles.containerInput}>
      <Text color="#8C93A7">{label}</Text>
      <TouchableOpacity onPress={onPress} style={styles.input}>
        <Text variant="body2">{value}</Text>
        <View>
          <OWIcon name="down" size={15} color={colors["primary-text"]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonFilter;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    input: {
      borderWidth: 0.5,
      borderColor: colors["border-input-login"],
      height: 39,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginTop: 4,
    },
    containerInput: {
      width: "50%",
    },
  });
};

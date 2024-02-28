import { StyleSheet } from "react-native";
import React, { FunctionComponent } from "react";
import { OWTextProps } from "@src/components/text/ow-text";
import { Text } from "@src/components/text";

export const BalanceText: FunctionComponent<OWTextProps> = (props) => {
  return (
    <Text size={14} weight="500" color={props.color ?? "#7C8397"} {...props}>
      {props.children}
    </Text>
  );
};

const styles = StyleSheet.create({});

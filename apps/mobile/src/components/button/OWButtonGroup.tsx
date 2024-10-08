import { StyleSheet, Text, View } from "react-native";
import React from "react";
import OWButton, { IOWButtonProps } from "./OWButton";

interface IOWButtonGroupProps
  extends Omit<
    IOWButtonProps,
    | "label"
    | "style"
    | "type"
    | "textStyle"
    | "loading"
    | "fullWidth"
    | "icon"
    | "disabled"
    | "size"
  > {
  labelClose?: IOWButtonProps["label"];
  styleClose?: IOWButtonProps["style"];
  typeClose?: IOWButtonProps["type"];
  textStyleClose?: IOWButtonProps["textStyle"];
  loadingClose?: IOWButtonProps["loading"];
  fullWidthClose?: IOWButtonProps["fullWidth"];
  iconClose?: IOWButtonProps["icon"];
  disabledClose?: IOWButtonProps["disabled"];
  sizeClose?: IOWButtonProps["size"];
  onPressClose?: IOWButtonProps["onPress"];
  labelApprove?: IOWButtonProps["label"];
  styleApprove?: IOWButtonProps["style"];
  typeApprove?: IOWButtonProps["type"];
  textStyleApprove?: IOWButtonProps["textStyle"];
  loadingApprove?: IOWButtonProps["loading"];
  fullWidthApprove?: IOWButtonProps["fullWidth"];
  iconApprove?: IOWButtonProps["icon"];
  disabledApprove?: IOWButtonProps["disabled"];
  sizeApprove?: IOWButtonProps["size"];
  onPressApprove?: IOWButtonProps["onPress"];
}
const OWButtonGroup = ({
  labelClose,
  styleClose,
  typeClose = "secondary",
  textStyleClose,
  loadingClose,
  fullWidthClose,
  iconClose,
  disabledClose,
  sizeClose,
  labelApprove,
  styleApprove,
  typeApprove = "danger",
  textStyleApprove,
  loadingApprove,
  fullWidthApprove,
  iconApprove,
  disabledApprove,
  sizeApprove,
  onPressClose,
  onPressApprove,
  ...props
}: IOWButtonGroupProps) => {
  return (
    <View style={styles.container}>
      <OWButton
        label={labelClose}
        style={[styles.btnClose, styleClose]}
        type={typeClose}
        textStyle={textStyleClose}
        loading={loadingClose}
        fullWidth={fullWidthClose}
        icon={iconClose}
        disabled={disabledClose}
        size={sizeClose}
        onPress={onPressClose}
        {...props}
      />
      <OWButton
        label={labelApprove}
        style={[styles.btnApprove, styleApprove]}
        type={typeApprove}
        textStyle={textStyleApprove}
        loading={loadingApprove}
        fullWidth={fullWidthApprove}
        icon={iconApprove}
        disabled={disabledApprove}
        size={sizeApprove}
        onPress={onPressApprove}
        {...props}
      />
    </View>
  );
};

export default OWButtonGroup;

const styles = StyleSheet.create({
  btnApprove: { flex: 1, marginLeft: 4 },
  btnClose: { flex: 1, marginRight: 4 },
  container: { flexDirection: "row", width: "100%" },
});

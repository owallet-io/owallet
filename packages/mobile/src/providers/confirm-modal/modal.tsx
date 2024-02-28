import React, { FunctionComponent } from "react";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { Text } from "@src/components/text";
import { Button } from "../../components/button";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
export const ConfirmModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  title: string;
  paragraph?: string;

  yesButtonText: string;
  noButtonText: string;

  onSelectYes: () => void;
  onSelectNo: () => void;

  modalRootCustom?: ViewStyle;
  titleStyleCustom?: TextStyle;
  contentStyleCustom?: TextStyle;
  noBtnStyleCustom?: TextStyle;
  yesBtnStyleCustom?: TextStyle;
}> = registerModal(
  ({
    close,
    title,
    paragraph,
    yesButtonText,
    noButtonText,
    onSelectYes,
    onSelectNo,
    modalRootCustom,
    titleStyleCustom,
    contentStyleCustom,
    noBtnStyleCustom,
    yesBtnStyleCustom,
  }) => {
    const style = useStyle();

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={{
            ...style.flatten([
              "border-radius-8",
              "overflow-hidden",
              "background-color-white",
              "padding-x-20",
              "padding-y-28",
              "items-center",
            ]),
            ...modalRootCustom,
          }}
        >
          <Text
            style={{
              ...style.flatten([
                "h3",
                "color-text-black-medium",
                "margin-bottom-8",
              ]),
              ...titleStyleCustom,
            }}
          >
            {title}
          </Text>
          {paragraph ? (
            <Text
              style={{
                ...style.flatten([
                  "body2",
                  "color-text-black-low",
                  "margin-bottom-16",
                  "text-center",
                ]),
                ...contentStyleCustom,
              }}
            >
              {paragraph}
            </Text>
          ) : null}
          <View style={style.flatten(["flex-row"])}>
            <Button
              containerStyle={{
                ...style.flatten(["flex-1"]),
                ...noBtnStyleCustom,
              }}
              text={noButtonText}
              mode="outline"
              onPress={() => {
                onSelectNo();
                close();
              }}
              textStyle={{ color: noBtnStyleCustom?.color }}
            />
            <View style={style.flatten(["width-12"])} />
            <Button
              containerStyle={{
                ...style.flatten(["flex-1"]),
                ...yesBtnStyleCustom,
              }}
              text={yesButtonText}
              onPress={() => {
                onSelectYes();
                close();
              }}
            />
          </View>
        </View>
      </View>
    );
  },
  {
    align: "center",
  }
);

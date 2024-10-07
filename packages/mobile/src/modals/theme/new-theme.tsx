import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useStyle } from "../../styles";
import { Button } from "../../components/button";
import { observer } from "mobx-react-lite";
import { colors } from "../../themes";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const NewThemeModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(({ close }) => {
    const style = useStyle();

    return (
      <CardModal title="Confirm Grant Access">
        <View style={style.flatten(["margin-bottom-16"])}>
          <Text style={style.flatten(["margin-bottom-3"])}>
            <Text
              style={style.flatten(["subtitle3", "color-primary"])}
            >{`1 `}</Text>
            <Text
              style={style.flatten(["subtitle3", "color-text-black-medium"])}
            >
              Message
            </Text>
          </Text>
          <View
            style={style.flatten([
              "border-radius-8",
              "border-width-1",
              "border-color-border-white",
              "overflow-hidden",
            ])}
          >
            <ScrollView
              style={style.flatten(["max-height-214"])}
              persistentScrollbar={true}
            >
              <Text
                style={{
                  color: colors["sub-text"],
                }}
              >
                What news
              </Text>
            </ScrollView>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            text="Reject"
            size="large"
            containerStyle={{
              width: "40%",
            }}
            style={{
              backgroundColor: colors["red-500"],
            }}
            textStyle={{
              color: colors["white"],
            }}
            underlayColor={colors["danger-400"]}
            onPress={() => {
              close();
            }}
          />
          <Button
            text="Approve"
            size="large"
            containerStyle={{
              width: "40%",
            }}
            textStyle={{
              color: colors["white"],
            }}
            style={{
              backgroundColor: colors["primary-surface-default"],
            }}
            onPress={async () => {
              resetTo(SCREENS.TABS.Settings, {
                isOpenTheme: true,
              });
              close();
            }}
          />
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);

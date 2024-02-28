import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { Button } from "../../components/button";
import { observer } from "mobx-react-lite";
import { colors } from "../../themes";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
const keyboardVerticalOffset = Platform.OS === "ios" ? 130 : 0;

export const AccessModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  waitingData: any;
}> = registerModal(
  observer(({ waitingData }) => {
    const { permissionStore } = useStore();
    const style = useStyle();

    const _onPressReject = async () => {
      if (waitingData) {
        await permissionStore.reject(waitingData.id);
      }
    };

    return (
      <CardModal title="Confirm Grant Access">
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
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
                  {JSON.stringify(waitingData, null, 2)}
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
              loading={permissionStore.isLoading}
              disabled={permissionStore.isLoading}
              onPress={_onPressReject}
            />
            <Button
              text="Approve"
              size="large"
              disabled={permissionStore.isLoading}
              containerStyle={{
                width: "40%",
              }}
              textStyle={{
                color: colors["white"],
              }}
              style={{
                backgroundColor: permissionStore.isLoading
                  ? colors["gray-400"]
                  : colors["primary-surface-default"],
              }}
              loading={permissionStore.isLoading}
              onPress={async () => {
                try {
                  if (waitingData) {
                    await permissionStore.approve(waitingData.id);
                  }
                } catch (error) {
                  permissionStore.reject(waitingData.id);
                  console.log("error AccessModal", error);
                }
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);

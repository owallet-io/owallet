import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useStyle } from "../../styles";
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { useStore } from "../../stores";
import { useTheme } from "@src/themes/theme-provider";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
export const HomeBaseModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(({ children }) => {
    const style = useStyle();
    const { modalStore } = useStore();
    const { colors } = useTheme();
    // const keyboardVerticalOffset = Platform.OS === 'ios' ? 70 : 0;
    return (
      // <KeyboardAvoidingView
      //   behavior="position"
      //   keyboardVerticalOffset={keyboardVerticalOffset}
      // >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <CardModal
          childrenContainerStyle={{
            backgroundColor: colors["background-box"],
          }}
          title={""}
        >
          <View style={style.flatten(["margin-bottom-16"])}>
            {children}
            {modalStore.getChildren()}
          </View>
        </CardModal>
      </TouchableWithoutFeedback>
      // </KeyboardAvoidingView>
    );
  }),
  {
    disableSafeArea: true,
  }
);

import React, { FC, ReactNode } from "react";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { RightArrowIcon } from "@src/components/icon";
import { View } from "react-native";
import { useStore } from "@src/stores";
import { ScrollView } from "react-native-gesture-handler";
import { WasmExecutionMsgView } from "@src/modals/sign/components/msg-view";
import { metrics } from "@src/themes";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";

export const MsgRawView: FC<{
  msg: string | any;
}> = observer(({ msg }) => {
  const { colors } = useTheme();
  return (
    <WrapViewModal
      containerStyle={{
        paddingHorizontal: 0,
      }}
      title={"View Raw Data"}
      disabledScrollView={true}
    >
      <ScrollView
        style={{
          backgroundColor: colors["neutral-surface-bg"],
          padding: 16,
          borderRadius: 24,
          maxHeight: metrics.screenHeight * 0.5,
        }}
      >
        <WasmExecutionMsgView msg={msg} />
      </ScrollView>
    </WrapViewModal>
  );
});
export const AmountCard: FC<{
  imageCoin: ReactNode | null;
  amountStr: string;
  totalPrice: string;
  msg?: string | any;
}> = observer(({ imageCoin, amountStr, totalPrice, msg }) => {
  const { colors } = useTheme();
  const { modalStore } = useStore();

  const onShowViewRaw = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(<MsgRawView msg={msg} />);
  };
  return (
    <OWCard
      style={{
        height: 143,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors["neutral-surface-card"],
      }}
    >
      {imageCoin}
      <OWText
        style={{
          textAlign: "center",
        }}
        size={28}
        color={colors["neutral-text-title"]}
        weight={"500"}
      >
        {amountStr}
      </OWText>
      {totalPrice && (
        <OWText
          style={{
            textAlign: "center",
          }}
          color={colors["neutral-text-body2"]}
          weight={"400"}
        >
          {totalPrice}
        </OWText>
      )}
      {msg && (
        <OWButton
          label={"View Raw Data"}
          type={"link"}
          size={"small"}
          fullWidth={false}
          onPress={onShowViewRaw}
          iconRight={
            <View
              style={{
                paddingLeft: 6,
              }}
            >
              <RightArrowIcon
                color={colors["primary-surface-default"]}
                height={13}
              />
            </View>
          }
        />
      )}
    </OWCard>
  );
});

import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { OWButton } from "@src/components/button";
import { metrics } from "@src/themes";

export const NewThemeModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  colors: any;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(({ close, colors }) => {
    return (
      <OWCard
        type="normal"
        style={{
          backgroundColor: colors["neutral-surface-card"],
          alignItems: "center",
        }}
      >
        <OWIcon
          style={{
            borderRadius: 24,
            width: metrics.screenWidth - 64,
            height: metrics.screenWidth / 2,
          }}
          type={"images"}
          source={require("@src/assets/images/theme.png")}
        />
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <OWText size={16} weight="700">
            {`What’s new`.toUpperCase()}
          </OWText>
          <OWText
            style={{ textAlign: "center", marginTop: 4 }}
            weight="500"
            color={colors["neutral-text-body"]}
          >
            Seamlessly experience the Osmosis and Injective themes on OWallet
          </OWText>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <OWButton
            label="Cancel"
            type="secondary"
            onPress={async () => {
              close();
            }}
            style={{
              borderRadius: 999,
              width: "48%",
            }}
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
            }}
          />
          <OWButton
            label="Check it out"
            onPress={async () => {
              resetTo(SCREENS.TABS.Settings, {
                isOpenTheme: true,
              });
              close();
            }}
            style={{
              borderRadius: 999,
              width: "48%",
            }}
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
            }}
          />
        </View>
      </OWCard>
    );
  }),
  {
    disableSafeArea: true,
  }
);

import React from "react";
import { View } from "react-native";
import { useStore } from "../../../../stores";
import { metrics } from "../../../../themes";
import { navigate } from "../../../../router/root";
import { useTheme } from "@src/themes/theme-provider";
import { OWButton } from "@src/components/button";

const WalletBtnList = () => {
  const { modalStore } = useStore();
  const { colors } = useTheme();

  return (
    <>
      <View style={{ width: "100%" }}>
        <OWButton
          label="+ Add wallets"
          onPress={() => {
            modalStore.close();
            navigate("Register", {
              screen: "Register.Intro",
              params: {
                canBeBack: true,
              },
            });
          }}
          style={{
            marginTop: 20,
            borderRadius: 999,
            width: metrics.screenWidth - 32,
          }}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      </View>
    </>
  );
};

export default WalletBtnList;

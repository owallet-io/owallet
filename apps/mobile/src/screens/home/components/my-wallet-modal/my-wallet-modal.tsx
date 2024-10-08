import React from "react";
import { View } from "react-native";
import { Text } from "@src/components/text";
import { metrics, spacing, typography } from "../../../../themes";
import { _keyExtract } from "../../../../utils/helper";
import MnemonicSeed from "./mnemonic-seed";
import WalletBtnList from "./wallet-btn-list";
import { useTheme } from "@src/themes/theme-provider";

const MyWalletModal = () => {
  return (
    <View style={{ alignItems: "center" }}>
      <View>
        <Text
          style={{
            ...typography.h6,
            fontWeight: "800",
            marginBottom: spacing["12"],
          }}
        >
          {"Select Wallet".toUpperCase()}
        </Text>
      </View>
      <MnemonicSeed />
      <View style={{ position: "absolute", bottom: 0 }}>
        <WalletBtnList />
      </View>
    </View>
  );
};

export default MyWalletModal;

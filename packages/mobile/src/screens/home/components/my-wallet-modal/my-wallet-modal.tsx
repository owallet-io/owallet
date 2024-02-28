import React from "react";
import { View } from "react-native";
import { Text } from "@src/components/text";
import { spacing, typography } from "../../../../themes";
import { _keyExtract } from "../../../../utils/helper";
import MnemonicSeed from "./mnemonic-seed";

const MyWalletModal = () => {
  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            ...typography.h6,
            fontWeight: "800",
            marginBottom: spacing["12"],
          }}
        >
          Set Default Wallet
        </Text>
      </View>
      <MnemonicSeed />
      {/* <WalletBtnList  /> */}
    </View>
  );
};

export default MyWalletModal;

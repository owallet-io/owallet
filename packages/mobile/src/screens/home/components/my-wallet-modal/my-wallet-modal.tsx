import React from "react";
import { FlatList, StyleSheet, View, Image } from "react-native";
import { Text } from "@rneui/base";
import { colors, metrics, spacing, typography } from "../../../../themes";
import { RectButton } from "../../../../components/rect-button";
import { _keyExtract } from "../../../../utils/helper";
import { BookMnemonicSeedIcon, ExistingWalletSquareIcon, LedgerNanoWalletSquareIcon, NewWalletSquareIcon } from "../../../../components/icon/new-wallet";
import MnemonicSeed from "./mnemonic-seed";
import WalletBtnList from "./wallet-btn-list";



const styles = StyleSheet.create({
  containerAccount: {
    backgroundColor: colors["gray-10"],
    paddingVertical: spacing["16"],
    borderRadius: spacing["8"],
    paddingHorizontal: spacing["16"],
    flexDirection: "row",
    marginTop: spacing["16"],
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
});

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
            color: colors["gray-900"],
            fontWeight: "800",
            marginBottom: spacing["12"],
          }}
        >
          My Wallet
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <BookMnemonicSeedIcon color="none" size={16} />
        <Text style={{ marginLeft: spacing["8"] }}>Mnemonic seed</Text>
      </View>
      <MnemonicSeed styles={styles} />
      <WalletBtnList styles={styles} />
    </View>
  );
};

export default MyWalletModal;

import React from 'react';
import { View } from 'react-native';
import { CText as Text} from "../../../../components/text";
import {
  ExistingWalletSquareIcon,
  LedgerNanoWalletSquareIcon,
  NewWalletSquareIcon,
} from "../../../../components/icon/new-wallet";
import { RectButton } from "../../../../components/rect-button";
import { colors, spacing, typography } from "../../../../themes";

const walletBtnList = [
  {
    icon: <NewWalletSquareIcon color="none" size={38} />,
    title: "Create a new wallet",
  },
  {
    icon: <ExistingWalletSquareIcon color="none" size={38} />,
    title: "Import existing wallet",
  },
  {
    icon: <LedgerNanoWalletSquareIcon color="none" size={38} />,
    title: "Import Ledger Nano X",
  },
];

const WalletBtnList = ({ styles }) => {
  const renderWalletBtn = (item) => {
    return (
      <RectButton
        style={{
          ...styles.containerAccount,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: colors["purple-700"],
        }}
      >
        <View
          style={{
            justifyContent: "flex-start",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {item.icon}
          <View
            style={{
              justifyContent: "space-between",
              marginLeft: spacing["12"],
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors["gray-900"],
                fontWeight: "800",
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
        </View>
      </RectButton>
    );
  };

  return (
    <>
      <View>
        <Text style={{ color: colors['gray-700'],paddingTop: 10 }}>
          Don’t see your wallet on the list?
        </Text>
      </View>
      <View style={{ width: "100%" }}>
        {walletBtnList.map((item) => renderWalletBtn(item))}
      </View>
    </>
  );
};

export default WalletBtnList;

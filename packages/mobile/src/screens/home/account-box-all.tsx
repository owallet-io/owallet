import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { OWBox } from "../../components/card";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "@src/components/text";
import { useStore } from "../../stores";
import { useTheme } from "@src/themes/theme-provider";
import { getTotalUsd } from "@oraichain/oraidex-common";
import { DownArrowIcon } from "@src/components/icon";
import { AddressCopyable } from "@src/components/address-copyable";
import { spacing } from "@src/themes";
import MyWalletModal from "./components/my-wallet-modal/my-wallet-modal";
import { ChainIdEnum, ChainNameEnum, getBase58Address } from "@owallet/common";
import { OWButton } from "@src/components/button";

export const AccountBoxAll: FunctionComponent<{}> = observer(({}) => {
  const { colors } = useTheme();
  const {
    universalSwapStore,
    accountStore,
    modalStore,
    chainStore,
    appInitStore,
  } = useStore();
  const styles = styling(colors);
  let totalUsd: number;
  if (appInitStore.getInitApp.prices) {
    totalUsd = getTotalUsd(
      universalSwapStore.getAmount,
      appInitStore.getInitApp.prices
    );
  }
  const account = accountStore.getAccount(chainStore.current.chainId);
  const [more, setMore] = useState(true);

  let accounts = {};

  Object.keys(ChainIdEnum).map((key) => {
    let defaultAddress = accountStore.getAccount(
      ChainIdEnum[key]
    ).bech32Address;
    if (ChainIdEnum[key] === ChainIdEnum.TRON) {
      accounts[ChainNameEnum[key]] = getBase58Address(
        accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress
      );
    } else if (defaultAddress.startsWith("evmos")) {
      accounts[ChainNameEnum[key]] = accountStore.getAccount(
        ChainIdEnum[key]
      ).evmosHexAddress;
    } else {
      accounts[ChainNameEnum[key]] = defaultAddress;
    }
  });

  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(MyWalletModal());
  };

  return (
    <View
      style={{
        marginHorizontal: 24,
      }}
    >
      <OWBox style={styles.containerOWBox} type="gradient">
        <View style={styles.overview}>
          <Text style={styles.titleTotalBalance}>Total Balance</Text>
          <Text style={styles.labelTotalAmount}>
            ${totalUsd?.toFixed(2) ?? 0}
          </Text>
        </View>
      </OWBox>
      <OWBox style={styles.containerBox} type="shadow">
        <View style={styles.containerInfoAccount}>
          <TouchableOpacity onPress={_onPressMyWallet} style={styles.btnAcc}>
            <Image
              style={styles.infoIcon}
              source={require("../../assets/images/default-avatar.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.labelName}>{account?.name || ".."}</Text>
            <DownArrowIcon height={15} color={colors["primary-text"]} />
          </TouchableOpacity>
          <View style={styles.addressBox}>
            {Object.keys(accounts).map((k, index) => {
              if (accounts[k]) {
                if (more) {
                  if (index < 3)
                    return (
                      <AddressCopyable
                        chain={k}
                        address={accounts[k]}
                        maxCharacters={22}
                      />
                    );
                } else {
                  return (
                    <AddressCopyable
                      chain={k}
                      address={accounts[k]}
                      maxCharacters={22}
                    />
                  );
                }
              }
            })}
          </View>
          <OWButton
            label={more ? "View all" : "Hide"}
            size="medium"
            type="secondary"
            onPress={() => {
              setMore(!more);
            }}
          />
        </View>
      </OWBox>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    overview: {
      marginBottom: 16,
    },

    titleTotalBalance: {
      textAlign: "center",
      color: colors["neutral-text-action-on-dark-bg"],
      fontSize: 14,
      lineHeight: 20,
    },
    labelTotalAmount: {
      textAlign: "center",
      color: colors["neutral-text-action-on-dark-bg"],
      fontSize: 28,
    },
    containerOWBox: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    textCenter: {
      textAlign: "center",
    },
    containerBox: {
      marginTop: 0,
      paddingHorizontal: 12,
      borderTopLeftRadius: 0,
      paddingVertical: 18,
      borderTopRightRadius: 0,
      backgroundColor: colors["neutral-surface-bg2"],
    },
    labelName: {
      paddingLeft: spacing["6"],
      paddingRight: 10,
      fontWeight: "700",
      fontSize: 16,
      color: colors["primary-text"],
    },
    infoIcon: {
      width: spacing["26"],
      borderRadius: spacing["26"],
      height: spacing["26"],
    },
    btnAcc: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: spacing["2"],
    },
    containerInfoAccount: {
      display: "flex",
      justifyContent: "space-between",
    },
    addressBox: {
      marginVertical: 16,
    },
  });

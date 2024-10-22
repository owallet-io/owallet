import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { metrics, spacing, typography } from "../../../themes";
import {
  _keyExtract,
  showToast,
  sortChainsByPrice,
} from "../../../utils/helper";
import { Text } from "@src/components/text";

import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { OWButton } from "@src/components/button";
import { RadioButton } from "react-native-radio-buttons-group";
import { initPrice } from "@src/screens/home/hooks/use-multiple-assets";
import { PricePretty } from "@owallet/unit";
import { tracking } from "@src/utils/tracking";

export const NetworkModal: FC<{
  hideAllNetwork?: boolean;
}> = ({ hideAllNetwork }) => {
  const { colors } = useTheme();
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<"mainnet" | "testnet">("mainnet");
  useEffect(() => {
    tracking("Modal Select Network Screen");
  }, []);

  const { modalStore, chainStore, appInitStore, hugeQueriesStore } = useStore();
  const styles = styling(colors);

  useEffect(() => {
    if (chainStore.current.chainName.toLowerCase().includes("test")) {
      setActiveTab("testnet");
    }
  }, [chainStore.current.chainName]);

  useEffect(() => {
    if (appInitStore.getInitApp.hideTestnet) {
      setActiveTab("mainnet");
    }
  }, [appInitStore.getInitApp.hideTestnet]);

  const handleSwitchNetwork = useCallback(async (item) => {
    try {
      modalStore.close();
      chainStore.selectChain(item?.chainId);
    } catch (error) {
      showToast({
        type: "danger",
        message: JSON.stringify(error),
      });
    }
  }, []);
  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);
  const stakedTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (bal.viewToken.price) {
        if (!result) {
          result = bal.viewToken.price;
        } else {
          result = result.add(bal.viewToken.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings]);
  const _renderItem = ({ item }: { item }) => {
    let selected =
      item?.chainId === chainStore.current.chainId &&
      !appInitStore.getInitApp.isAllNetworks;

    if (item.isAll && appInitStore.getInitApp.isAllNetworks) {
      selected = true;
    }
    const oraiIcon =
      "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png";
    return (
      <TouchableOpacity
        style={{
          paddingLeft: 12,
          paddingRight: 8,
          paddingVertical: 9.5,
          borderRadius: 12,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: selected ? colors["neutral-surface-bg2"] : null,
        }}
        onPress={() => {
          handleSwitchNetwork(item);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 44,
              backgroundColor: colors["neutral-surface-action"],
              marginRight: 16,
            }}
          >
            {item.isAll ? (
              <OWIcon
                name={"tdesignblockchain"}
                size={20}
                // color={colors["neutral-text-title"]}
              />
            ) : (
              <OWIcon
                type="images"
                source={{
                  uri: item?.chainSymbolImageUrl || oraiIcon,
                }}
                style={{
                  borderRadius: 999,
                }}
                size={28}
              />
            )}
          </View>
          <View>
            <Text
              style={{
                fontSize: 14,
                color: colors["neutral-text-title"],
                fontWeight: "600",
              }}
            >
              {item?.chainName}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors["sub-text"],
                fontWeight: "400",
              }}
            >
              {!item.chainId
                ? (
                    availableTotalPrice?.add(stakedTotalPrice) || initPrice
                  )?.toString()
                : (item.balance || initPrice)?.toString()}
            </Text>
          </View>
        </View>

        <View>
          <RadioButton
            color={
              selected
                ? colors["highlight-surface-active"]
                : colors["neutral-text-body"]
            }
            id={item.chainId}
            selected={selected}
            onPress={() => handleSwitchNetwork(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const chainsInfoWithBalance = chainStore.chainInfosInUI.map((item, index) => {
    let balances = hugeQueriesStore.getAllBalancesByChainId(item.chainId);
    let result: PricePretty | undefined;
    for (const bal of balances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.delegations.filter(
      (delegation) => delegation.chainInfo.chainId === item.chainId
    )) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings.filter(
      (unbonding) => unbonding.viewToken.chainInfo.chainId === item.chainId
    )) {
      if (bal.viewToken.price) {
        if (!result) {
          result = bal.viewToken.price;
        } else {
          result = result.add(bal.viewToken.price);
        }
      }
    }
    //@ts-ignore
    item.balance = result || initPrice;
    return item;
  });
  const dataTestnet = sortChainsByPrice(chainsInfoWithBalance).filter(
    (c) =>
      c.chainName.toLowerCase().includes("test") &&
      c.chainName.toLowerCase().includes(keyword.toLowerCase())
  );
  const dataMainnet = sortChainsByPrice(chainsInfoWithBalance).filter(
    (c) =>
      !c.chainName.toLowerCase().includes("test") &&
      c.chainName.toLowerCase().includes(keyword.toLowerCase())
  );
  const dataChains = activeTab === "testnet" ? dataTestnet : dataMainnet;

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <Text
        style={{
          ...typography.h6,
          fontWeight: "900",
          color: colors["neutral-text-title"],
          width: "100%",
          textAlign: "center",
        }}
      >
        {`choose networks`.toUpperCase()}
      </Text>
      <View style={styles.header}>
        <View style={styles.searchInput}>
          <View style={{ paddingRight: 4 }}>
            <OWIcon
              color={colors["neutral-icon-on-light"]}
              name="tdesign_search"
              size={16}
            />
          </View>
          <TextInput
            style={{
              fontFamily: "SpaceGrotesk-Regular",
              width: "100%",
              color: colors["neutral-icon-on-light"],
            }}
            onChangeText={(t) => setKeyword(t)}
            value={keyword}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search by name"
          />
        </View>
      </View>
      {!appInitStore.getInitApp.hideTestnet ? (
        <View style={styles.wrapHeaderTitle}>
          <OWButton
            type="link"
            label={"Mainnet"}
            textStyle={{
              color: colors["primary-surface-default"],
              fontWeight: "600",
              fontSize: 16,
            }}
            onPress={() => setActiveTab("mainnet")}
            style={[
              {
                width: "50%",
              },
              activeTab === "mainnet" ? styles.active : null,
            ]}
          />
          <OWButton
            type="link"
            label={"Testnet"}
            onPress={() => setActiveTab("testnet")}
            textStyle={{
              color: colors["primary-surface-default"],
              fontWeight: "600",
              fontSize: 16,
            }}
            style={[
              {
                width: "50%",
              },
              activeTab === "testnet" ? styles.active : null,
            ]}
          />
        </View>
      ) : null}
      <View
        style={{
          marginTop: spacing["12"],
          width: metrics.screenWidth - 48,
          justifyContent: "space-between",
          height: metrics.screenHeight / 2,
        }}
      >
        {!hideAllNetwork &&
          _renderItem({ item: { chainName: "All networks", isAll: true } })}
        <BottomSheetFlatList
          showsVerticalScrollIndicator={false}
          data={dataChains}
          renderItem={_renderItem}
          keyExtractor={_keyExtract}
        />
      </View>
    </View>
  );
};

const styling = (colors) =>
  StyleSheet.create({
    containerBtn: {
      backgroundColor: colors["neutral-surface-card"],
      paddingVertical: spacing["16"],
      borderRadius: spacing["8"],
      paddingHorizontal: spacing["16"],
      flexDirection: "row",
      marginTop: spacing["16"],
      alignItems: "center",
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      alignSelf: "center",
      marginTop: 16,
    },
    searchInput: {
      flexDirection: "row",
      backgroundColor: colors["neutral-surface-action"],
      height: 40,
      borderRadius: 999,
      width: metrics.screenWidth - 32,
      alignItems: "center",
      paddingHorizontal: 12,
    },
    wrapHeaderTitle: {
      flexDirection: "row",
      paddingBottom: 12,
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });

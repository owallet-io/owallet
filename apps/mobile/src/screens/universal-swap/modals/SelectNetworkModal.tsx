import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { metrics, spacing, typography } from "../../../themes";
import {
  _keyExtract,
  getTokenInfos,
  maskedNumber,
} from "../../../utils/helper";
import { VectorCharacter } from "../../../components/vector-character";
import { Text } from "@src/components/text";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import {
  chainIcons,
  ChainIdEnum,
  getTotalUsd,
} from "@oraichain/oraidex-common";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { RadioButton } from "react-native-radio-buttons-group";
import { registerModal } from "@src/modals/base";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SelectNetworkModal: FunctionComponent<{
  close?: () => void;
  tokenList: any;
  selectedChainFilter: string;
  setChainFilter: Function;
  isOpen?: boolean;
}> = registerModal(
  ({ close, selectedChainFilter, setChainFilter, tokenList }) => {
    const safeAreaInsets = useSafeAreaInsets();

    const { colors } = useTheme();
    const [keyword, setKeyword] = useState("");
    const [activeTab, setActiveTab] = useState<"mainnet" | "testnet">(
      "mainnet"
    );

    const { chainStore, appInitStore, universalSwapStore } = useStore();
    const [chains, setChains] = useState(chainStore.chainInfosInUI);

    const styles = styling(colors);
    let totalUsd: number = 0;
    let todayAssets;
    if (
      Object.keys(appInitStore.getInitApp.prices).length > 0 &&
      Object.keys(universalSwapStore.getAmount).length > 0
    ) {
      totalUsd = getTotalUsd(
        universalSwapStore.getAmount,
        appInitStore.getInitApp.prices
      );
      todayAssets = getTokenInfos({
        tokens: universalSwapStore.getAmount,
        prices: appInitStore.getInitApp.prices,
      });
    }

    const handleChangeNetwork = (network) => {
      setChainFilter(network.chainId);
      close();
    };

    const chainAssets = todayAssets?.reduce((result, element) => {
      const key = element.chainId;

      if (!result[key]) {
        result[key] = {
          sum: 0,
        };
      }

      result[key].sum += element.value;

      return result;
    }, {});

    useEffect(() => {
      if (activeTab === "mainnet") {
        const tmpChainInfos = [];
        chainStore.chainInfosInUI.map((c) => {
          if (!c.chainName.toLowerCase().includes("test")) {
            tmpChainInfos.push(c);
          }
        });
        setChains(tmpChainInfos);
      } else {
        const tmpChainInfos = [];
        chainStore.chainInfosInUI.map((c) => {
          if (c.chainName.toLowerCase().includes("test")) {
            tmpChainInfos.push(c);
          }
        });
        setChains(tmpChainInfos);
      }
    }, [activeTab]);

    useEffect(() => {
      if (activeTab === "mainnet") {
        let tmpChainInfos = [];
        chainStore.chainInfosInUI.map((c) => {
          if (
            !c.chainName.toLowerCase().includes("test") &&
            c.chainName.toLowerCase().includes(keyword.toLowerCase())
          ) {
            tmpChainInfos.push(c);
          }
        });

        setChains(tmpChainInfos);
      } else {
        let tmpChainInfos = [];
        chainStore.chainInfosInUI.map((c) => {
          if (
            c.chainName.toLowerCase().includes("test") &&
            c.chainName.toLowerCase().includes(keyword.toLowerCase())
          ) {
            tmpChainInfos.push(c);
          }
        });

        setChains(tmpChainInfos);
      }
    }, [keyword, activeTab]);

    useEffect(() => {
      if (chainStore.current.chainName.toLowerCase().includes("test")) {
        setActiveTab("testnet");
      }
    }, [chainStore.current.chainName]);

    const _renderItem = ({ item }) => {
      let selected = item?.chainId === selectedChainFilter;

      const tokenListByChain = tokenList.filter(
        (t) => t.chainId === item?.chainId
      );

      if (tokenListByChain.length <= 0) {
        return null;
      }

      if (item.isAll && appInitStore.getInitApp.isAllNetworks) {
        selected = true;
      }
      let chainIcon = chainIcons.find((c) => c.chainId === item.chainId);

      // Hardcode for Oasis because oraidex-common does not have icon yet
      if (item.chainName.toLowerCase().includes("oasis")) {
        chainIcon = {
          chainId: item.chainId,
          Icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/7653.png",
        };
      }

      if (item.chainName.toLowerCase().includes("celestia")) {
        chainIcon = {
          chainId: item.chainId,
          Icon: "https://assets.coingecko.com/coins/images/31967/standard/tia.jpg?1696530772",
        };
      }

      if (!chainIcon) {
        chainIcon = chainIcons.find((c) => c.chainId === ChainIdEnum.Oraichain);
      }

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
            handleChangeNetwork(item);
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
                backgroundColor: colors["neutral-icon-on-dark"],
                marginRight: 16,
              }}
            >
              {chainIcon ? (
                <OWIcon
                  type="images"
                  source={{ uri: chainIcon.Icon }}
                  size={28}
                />
              ) : (
                <VectorCharacter
                  char={item.chainName[0]}
                  height={15}
                  color={colors["white"]}
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
                {item.chainName}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: colors["sub-text"],
                  fontWeight: "400",
                }}
              >
                $
                {!item.chainId
                  ? maskedNumber(totalUsd)
                  : maskedNumber(chainAssets?.[item.chainId]?.sum)}
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
              onPress={() => handleChangeNetwork(item)}
            />
          </View>
        </TouchableOpacity>
      );
    };

    useEffect(() => {
      if (chainAssets) {
        const sortedData = Object.entries(chainAssets).sort(
          (a, b) => b[1].sum - a[1].sum
        );
        const keysArray = sortedData.map(([key]) => key);

        chains.sort((a, b) => {
          const indexA = keysArray.indexOf(a.chainId);
          const indexB = keysArray.indexOf(b.chainId);

          if (indexA === -1 && indexB === -1) {
            return 0;
          } else if (indexA === -1) {
            return 1;
          } else if (indexB === -1) {
            return -1;
          } else {
            if (indexA < indexB) {
              return -1;
            }
            if (indexA > indexB) {
              return 1;
            }
            return 0;
          }
        });
      }
    }, [chainAssets]);

    return (
      <View
        style={{
          alignItems: "center",
          paddingBottom: safeAreaInsets.bottom,
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
          {`choose network`.toUpperCase()}
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

        <View
          style={{
            marginTop: spacing["12"],
            width: metrics.screenWidth - 32,
            justifyContent: "space-between",
            height: metrics.screenHeight / 2,
          }}
        >
          <BottomSheetFlatList
            showsVerticalScrollIndicator={false}
            data={chains}
            renderItem={_renderItem}
            keyExtractor={_keyExtract}
          />
        </View>
      </View>
    );
  }
);

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

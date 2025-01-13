import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { registerModal } from "@src/modals/base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OWFlatList from "@src/components/page/ow-flat-list";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics, typography } from "@src/themes";
import {
  TokenItemType,
  toDisplay,
  tokensIcon,
} from "@oraichain/oraidex-common";
import { useStore } from "@src/stores";
import { CoinGeckoPrices } from "@owallet/hooks";
import { find } from "lodash";
import { maskedNumber, shortenAddress } from "@src/utils/helper";
import { unknownToken } from "@owallet/common";

export const SelectTokenModal: FunctionComponent<{
  onNetworkModal?: () => void;
  close?: () => void;
  data: TokenItemType[];
  activeToken: TokenItemType;
  isOpen?: boolean;
  prices: CoinGeckoPrices<string>;
  selectedChainFilter?: string;
  bottomSheetModalConfig?: unknown;
  setToken: (denom: string) => void;
  setSearchTokenName: Function;
}> = registerModal(
  ({ close, activeToken, data, setToken, selectedChainFilter }) => {
    const safeAreaInsets = useSafeAreaInsets();
    const {
      universalSwapStore,
      appInitStore,
      accountStore,
      keyRingStore,
      chainStore,
    } = useStore();
    const [filteredTokens, setTokens] = useState([]);

    // const [refresh, setRefresh] = useState(Date.now());

    const [keyword, setKeyword] = useState("");
    // const [chainAddress, setChainAddress] = useState("");

    // const account = accountStore.getAccount(selectedChainFilter);

    // useEffect(() => {
    //   setTimeout(() => {
    //     setRefresh(Date.now());
    //   }, 300);
    // }, []);

    // useEffect(() => {
    //   const address = account.getAddressDisplay(
    //     keyRingStore.keyRingLedgerAddresses
    //   );
    //   setChainAddress(address);
    // }, [selectedChainFilter, refresh]);

    const prices = appInitStore.getInitApp.prices;

    console.log("data", data);

    const onFilter = (key, chain) => {
      if (key && chain && key !== "" && chain !== "") {
        const tmpData = [];

        data.map((d) => {
          if (
            d.chainId.toString().toLowerCase().includes(chain.toLowerCase()) &&
            (d.chainId + d.denom + d.name + d.org + d.coinGeckoId)
              .toString()
              .toLowerCase()
              .includes(key.toLowerCase())
          ) {
            tmpData.push(d);
          }
        });

        handleSetTokensWithAmount(tmpData);
        return;
      } else {
        if (key && key !== "") {
          const tmpData = data.filter((d) => {
            return (d.chainId + d.denom + d.name + d.org + d.coinGeckoId)
              .toString()
              .toLowerCase()
              .includes(key.toLowerCase());
          });

          handleSetTokensWithAmount(tmpData);
          return;
        }

        if (chain && chain !== "") {
          const tmpData = data.filter((d) =>
            d.chainId.toString().toLowerCase().includes(chain.toLowerCase())
          );
          handleSetTokensWithAmount(tmpData);
          return;
        }
        setTokens(data);
      }
    };

    const handleSetTokensWithAmount = useCallback(
      (tokens) => {
        const tmpTokens = [];
        tokens.map((t) => {
          const usdPrice = prices[t.coinGeckoId];

          const amount = toDisplay(
            universalSwapStore?.getAmount?.[t.denom],
            t.decimals
          );

          const totalUsd = usdPrice
            ? (Number(amount) * Number(usdPrice)).toFixed(2)
            : 0;
          tmpTokens.push({ ...t, amount, totalUsd });
        });
        setTokens(tmpTokens);
      },
      [data]
    );

    useEffect(() => {
      onFilter(keyword, selectedChainFilter);
    }, [data, keyword, selectedChainFilter]);

    const { colors } = useTheme();
    const styles = styling(colors);

    const renderTokenItem = useCallback(
      (item) => {
        if (item) {
          let chainId = item.chainId;
          if (item.chainId.startsWith("0x")) {
            chainId = `eip155:${parseInt(item.chainId, 16)}`;
          }

          const chainInfo = chainStore.getChain(chainId);
          const currencies = item.chainId ? chainInfo.currencies : [];

          const tokenIcon = find(
            tokensIcon,
            (tk) => tk.coinGeckoId === item.coinGeckoId
          );

          const tokenIconFromLocal = currencies.find(
            (tk) => tk.coinGeckoId === item.coinGeckoId
          );
          return (
            <>
              <TouchableOpacity
                onPress={() => {
                  close();
                  setToken(item.denom);
                }}
                style={[
                  styles.btnItem,
                  activeToken.coinGeckoId === item.coinGeckoId
                    ? styles.active
                    : { paddingHorizontal: 16 },
                ]}
              >
                <View style={styles.leftBoxItem}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 36,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: colors["icon"],
                      padding: 4,
                    }}
                  >
                    <OWIcon
                      type="images"
                      source={{
                        uri:
                          tokenIcon?.Icon ||
                          tokenIconFromLocal?.coinImageUrl ||
                          unknownToken.coinImageUrl,
                      }}
                      size={30}
                      style={{
                        borderRadius: 999,
                      }}
                    />
                  </View>
                  <View style={styles.pl10}>
                    <Text
                      size={16}
                      color={colors["neutral-text-title"]}
                      weight="500"
                    >
                      {item.name}
                    </Text>
                    {/* {chainAddress ? (
                      <Text weight="400" color={colors["neutral-text-body"]}>
                        {shortenAddress(chainAddress, 9)}
                      </Text>
                    ) : null} */}

                    <Text weight="400" color={colors["neutral-text-body"]}>
                      {item.org}
                    </Text>
                  </View>
                </View>
                <View style={styles.rightBoxItem}>
                  <Text
                    size={16}
                    weight="500"
                    color={colors["neutral-text-title"]}
                  >
                    {maskedNumber(item.amount)}
                  </Text>
                  <Text weight="400" color={colors["neutral-text-body"]}>
                    ${maskedNumber(item.totalUsd) ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
              {activeToken.coinGeckoId === item.coinGeckoId ? null : (
                <View style={styles.borderLine} />
              )}
            </>
          );
        }
      },
      [
        universalSwapStore?.getAmount,
        appInitStore.getInitApp.theme,
        appInitStore.getInitApp.wallet,
      ]
    );

    return (
      <View
        style={[
          styles.containerModal,
          { paddingBottom: safeAreaInsets.bottom },
        ]}
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
          {`choose token`.toUpperCase()}
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
              placeholder="Search for a token"
            />
          </View>
        </View>

        <OWFlatList
          isBottomSheet
          keyboardShouldPersistTaps="handled"
          data={filteredTokens.sort((a, b) => {
            return Number(b?.totalUsd) - Number(a?.totalUsd);
          })}
          renderItem={({ item }) => {
            return renderTokenItem(item);
          }}
        />
      </View>
    );
  }
);

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    pl10: {
      paddingLeft: 10,
    },
    active: {
      backgroundColor: colors["neutral-surface-bg2"],
      padding: 16,
      borderRadius: 12,
    },
    leftBoxItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    btnItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 10,
    },
    txtNetwork: {
      paddingHorizontal: 4,
    },
    btnNetwork: {
      flexDirection: "row",
      alignItems: "center",
    },
    containerTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },
    iconSearch: {
      position: "absolute",
      left: 12,
      top: 22,
    },
    textInput: {
      paddingVertical: 0,
      height: 40,
      backgroundColor: colors["neutral-surface-action"],
      borderRadius: 8,
      paddingLeft: 35,
      fontSize: 16,
      fontFamily: "SpaceGrotesk-Regular",
      color: colors["neutral-icon-on-light"],
      marginVertical: 10,
    },
    containerModal: {
      paddingHorizontal: 12,
      height: metrics.screenHeight / 1.3,
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
    borderLine: {
      width: "100%",
      height: 1,
      backgroundColor: colors["neutral-border-default"],
      marginTop: 4,
    },
  });

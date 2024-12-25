import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView, PageWithView } from "@components/page";
import { OWBox } from "@components/card";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import OWIcon from "@components/ow-icon/ow-icon";
import {
  delay,
  EmbedChainInfos,
  fetchRetry,
  formatAddress,
  limitString,
  unknownToken,
} from "@owallet/common";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@components/text/ow-text";
import OWFlatList from "@components/page/ow-flat-list";
import { Toggle } from "@components/toggle";
import { OWSearchInput } from "@components/ow-search-input";
import { useStore } from "@src/stores";
import {
  _keyExtract,
  capitalizedText,
  getImageFromToken,
  maskedNumber,
  removeDataInParentheses,
  showToast,
} from "@utils/helper";
import { XAxis, YAxis } from "@components/axis";
import OWButtonIcon from "@components/button/ow-button-icon";
import { navigate } from "@src/router/root";
import { SCREENS } from "@common/constants";
import { useIsNotReady } from "@screens/home";
import { Text } from "@components/text";
import { Box } from "@components/box";
import { initPrice } from "@screens/home/components";
import { metrics } from "@src/themes";
import { OWHeaderTitle } from "@components/header";
import { useNavigation } from "@react-navigation/native";

export const ManageTokenScreen: FunctionComponent = observer(() => {
  const { colors } = useTheme();
  const { chainStore, hugeQueriesStore, appInitStore, priceStore } = useStore();
  const [keyword, setKeyword] = useState("");

  const { chainId } = chainStore.current;
  const allBalances = useMemo(() => {
    return appInitStore.getInitApp.isAllNetworks
      ? hugeQueriesStore.getAllBalances(true)
      : hugeQueriesStore.getAllBalancesByChainId(chainId);
  }, [
    appInitStore.getInitApp.isAllNetworks,
    hugeQueriesStore.getAllBalances(true),
    hugeQueriesStore.getAllBalancesByChainId(chainId),
  ]);
  const isNotReady = useIsNotReady();
  const isFirstTime = allBalances.length === 0 && isNotReady;
  const trimSearch = keyword.trim();
  const _allBalancesSearchFiltered = useMemo(() => {
    return allBalances.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [allBalances, trimSearch]);
  const navigation = useNavigation();
  useEffect(() => {
    if (!appInitStore.getInitApp.isAllNetworks) {
      navigation.setOptions({
        headerRight: () => {
          return (
            <OWButtonIcon
              sizeIcon={24}
              disabled={true}
              typeIcon={"images"}
              colorIcon={"red"}
              source={{
                uri: chainStore.current.chainSymbolImageUrl,
              }}
              style={{
                paddingRight: 16,
              }}
              fullWidth={false}
            />
          );
        },
      });
    }
  }, [chainStore.current.chainId, appInitStore.getInitApp.isAllNetworks]);
  const styles = styling(colors);

  const renderChain = ({ item }) => {
    const Denom = removeDataInParentheses(
      item.token?.currency?.coinDenom
    ).trim();
    const key = `${item?.chainInfo?.chainId}/${item.token?.currency.coinMinimalDenom}`;
    const isHide = appInitStore.getInitApp.manageToken?.[key];
    return (
      <Box
        key={`${item.chainInfo?.chainId}-${item.token?.toString()}`}
        style={{ ...styles.btnItem, opacity: isHide ? 0.5 : 1 }}
      >
        <View style={[styles.wraperItem]}>
          <View style={styles.leftBoxItem}>
            <View style={styles.iconWrap}>
              <OWIcon
                style={{ borderRadius: 999 }}
                type="images"
                source={{
                  uri: getImageFromToken(item),
                }}
                size={32}
              />
            </View>
            <View style={styles.chainWrap}>
              <OWIcon
                style={{
                  borderRadius: 999,
                }}
                type="images"
                source={{
                  uri:
                    item?.chainInfo?.chainSymbolImageUrl ||
                    unknownToken?.coinImageUrl,
                }}
                size={16}
              />
            </View>

            <View style={styles.pl12}>
              <XAxis alignY={"center"}>
                <Text
                  size={16}
                  color={colors["neutral-text-heading"]}
                  weight="600"
                >
                  {Denom?.length > 15 ? formatAddress(Denom, 14) : Denom}
                </Text>
              </XAxis>
              <Text
                style={{
                  lineHeight: 24,
                }}
                weight="400"
                color={colors["neutral-text-body"]}
              >
                {item?.chainInfo?.chainName}
                {item.token?.currency?.type &&
                item.token?.currency?.coinDenom === "BTC"
                  ? ` ${capitalizedText(item.token?.currency?.type)}`
                  : ""}
              </Text>
            </View>
          </View>
          <View style={styles.rightBoxItem}>
            <XAxis alignY={"center"}>
              <View style={{ alignItems: "flex-end", width: "50%" }}>
                <Text
                  size={16}
                  style={{ lineHeight: 24 }}
                  weight="500"
                  color={colors["neutral-text-heading"]}
                >
                  {item?.token
                    ? maskedNumber(
                        item?.token.trim(true).hideDenom(true).toString(),
                        6
                      )
                    : "0"}
                </Text>
                <Text
                  size={14}
                  style={{ lineHeight: 24 }}
                  color={colors["neutral-text-body"]}
                >
                  {(
                    priceStore.calculatePrice(item?.token) || initPrice
                  )?.toString()}
                </Text>
              </View>
              <OWButtonIcon
                name={isHide ? "eye-slash" : "eye"}
                sizeIcon={24}
                colorIcon={colors["neutral-text-body"]}
                onPress={() => {
                  console.log(key);
                  appInitStore.updateManageToken(key, !isHide);
                }}
                style={{
                  width: 32,
                  height: 32,
                  marginLeft: 10,
                }}
                fullWidth={false}
              />
            </XAxis>
          </View>
        </View>
      </Box>
    );
  };
  return (
    <PageWithView
      style={{
        paddingTop: 8,
      }}
    >
      <OWBox style={styles.pageContainer}>
        <XAxis>
          <OWSearchInput
            style={{
              paddingVertical: 6,
              height: 32,
            }}
            containerStyle={styles.searchContainer}
            onValueChange={(txt) => {
              setKeyword(txt);
            }}
            placeHolder={"Search token"}
          />

          <OWButtonIcon
            name={"tdesignplus"}
            sizeIcon={20}
            fullWidth={false}
            style={{
              height: 32,
              width: 32,
              backgroundColor: colors["neutral-surface-action3"],
            }}
            onPress={() => {
              navigate(SCREENS.NetworkToken);
              return;
            }}
            colorIcon={colors["neutral-text-action-on-light-bg"]}
          />
        </XAxis>
        <OWFlatList
          // loading={isLoading}
          style={styles.flatList}
          data={!isFirstTime ? _allBalancesSearchFiltered : []}
          renderItem={renderChain}
          keyExtractor={_keyExtract}
        />
      </OWBox>
    </PageWithView>
  );
});
const styling = (colors) => {
  return StyleSheet.create({
    pageContainer: {
      paddingHorizontal: 16,
      marginTop: 0,
      backgroundColor: colors["neutral-surface-card"],
    },
    searchContainer: {
      paddingBottom: 20,
      paddingRight: 8,
    },
    flatList: {
      marginHorizontal: -16,
    },
    chainContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: colors["neutral-border-default"],
      justifyContent: "space-between",
    },
    chainInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    chainIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      borderRadius: 44,
      backgroundColor: colors["neutral-surface-action"],
    },
    chainIconImage: {
      borderRadius: 999,
    },
    wrapHeaderTitle: {
      flexDirection: "row",
      paddingBottom: 12,
    },
    container: {
      marginBottom: 60,
    },
    pl12: {
      paddingLeft: 12,
    },
    leftBoxItem: {
      flexDirection: "row",
      flex: 0.5,
    },
    rightBoxItem: {
      alignItems: "flex-end",
      flex: 1,
    },
    wraperItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: "center",
      flexWrap: "wrap",
    },
    btnItem: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    profit: {
      // fontWeight: "400",
      lineHeight: 16,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-surface-action"],
    },
    chainWrap: {
      width: 22,
      height: 22,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-surface-action"],
      position: "absolute",
      bottom: -6,
      left: 26,
      top: 26,
      borderWidth: 1,
      borderColor: colors["neutral-border-bold"],
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
    inactive: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    type: {
      backgroundColor: colors["neutral-surface-action2"],
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginHorizontal: 2,
      alignItems: "center",
    },
  });
};

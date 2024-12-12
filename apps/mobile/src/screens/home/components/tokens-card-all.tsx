import { OWButton } from "@src/components/button";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, {
  FC,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useStore } from "@src/stores";
import {
  capitalizedText,
  maskedNumber,
  removeDataInParentheses,
} from "@utils/helper";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { unknownToken } from "@owallet/common";
import { metrics } from "@src/themes";
import FastImage from "react-native-fast-image";
import OWText from "@src/components/text/ow-text";
import { ViewToken } from "@src/stores/huge-queries";
import { OWSearchInput } from "@src/components/ow-search-input";
import images from "@src/assets/images";
import { initPrice } from "./account-box-new";
import { Dec } from "@owallet/unit";
import { useIsNotReady } from "@screens/home";
const zeroDec = new Dec(0);
export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
  // dataTokens: ViewToken[];
}> = observer(({ containerStyle }) => {
  const { hugeQueriesStore, uiConfigStore, appInitStore, chainStore } =
    useStore();
  const [keyword, setKeyword] = useState("");
  const { colors } = useTheme();
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

  const allBalancesNonZero = useMemo(() => {
    return allBalances.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [allBalances]);
  const isNotReady = useIsNotReady();
  const isFirstTime = allBalancesNonZero.length === 0 && isNotReady;
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
  const hasLowBalanceTokens =
    hugeQueriesStore.filterLowBalanceTokens(allBalances).length > 0;
  const lowBalanceFilteredAllBalancesSearchFiltered =
    hugeQueriesStore.filterLowBalanceTokens(_allBalancesSearchFiltered);

  const allBalancesSearchFiltered =
    uiConfigStore.isHideLowBalance && hasLowBalanceTokens
      ? lowBalanceFilteredAllBalancesSearchFiltered
      : _allBalancesSearchFiltered;

  const [toggle, setToggle] = useState(uiConfigStore.isHideLowBalance);
  const [viewMore, setViewMore] = useState(true);
  useEffect(() => {
    uiConfigStore.setHideLowBalance(toggle);
  }, [toggle]);
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: 10,
          paddingTop: 6,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <OWSearchInput
          containerStyle={{
            height: 35,
          }}
          onValueChange={(txt) => {
            setKeyword(txt);
          }}
          style={{
            height: 35,
            paddingVertical: 8,
          }}
          placeHolder={"Search for a token"}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <OWText color={colors["neutral-text-body"]}>{`Hide dust`}</OWText>
          <Switch
            onValueChange={(value) => {
              setToggle(value);
            }}
            style={{
              transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
              marginRight: -5,
            }}
            value={toggle}
          />
        </View>
      </View>
      {!isFirstTime ? (
        (viewMore
          ? allBalancesSearchFiltered?.slice(0, 5)
          : allBalancesSearchFiltered
        ).map((item, index) => <TokenItem key={index.toString()} item={item} />)
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 42,
          }}
        >
          <FastImage
            source={images.img_money}
            style={{
              width: 150,
              height: 150,
            }}
            resizeMode={"contain"}
          />
          <OWText color={colors["neutral-text-title"]} size={16} weight="700">
            {"no tokens yet".toUpperCase()}
          </OWText>
          <OWButton
            style={{
              marginTop: 8,
              marginHorizontal: 16,
              width: metrics.screenWidth / 2,
              borderRadius: 999,
            }}
            label={"+ Buy ORAI with cash"}
            size="large"
            type="secondary"
            onPress={() => {
              navigate(SCREENS.BuyFiat);
            }}
          />
        </View>
      )}
      <View
        style={{
          marginVertical: 8,
        }}
      >
        <OWButton
          style={{
            width: "100%",
          }}
          label={`View ${viewMore ? "More" : "Less"}`}
          iconRight={
            <OWIcon
              name={viewMore ? "tdesignchevron-down" : "tdesignchevron-up"}
              color={colors["primary-surface-pressed"]}
              size={20}
            />
          }
          onPress={() => setViewMore((prev) => !prev)}
          contentAlign={"right"}
          fullWidth={false}
          type={"link"}
        />
        <OWButton
          style={{
            marginHorizontal: 16,
            width: metrics.screenWidth - 32,
            borderRadius: 999,
          }}
          icon={
            <OWIcon
              name="tdesignplus"
              color={colors["neutral-text-title"]}
              size={20}
            />
          }
          label={"Add token"}
          size="large"
          type="secondary"
          onPress={() => {
            navigate(SCREENS.NetworkToken);
            return;
          }}
        />
      </View>
    </>
  );
});

const TokenItem: FC<{
  item: ViewToken;
}> = observer(({ item }) => {
  const { colors } = useTheme();
  const { priceStore } = useStore();
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  if (!fiatCurrency) return;
  const styles = styling(colors);
  const onPressToken = async (item) => {
    // if (
    //   !item.token?.currency?.coinGeckoId ||
    //   !item.token?.currency?.coinImageUrl
    // )
    //   return;
    navigate(SCREENS.TokenDetails, {
      item,
    });
    return;
  };
  const price24h = item.token?.currency?.coinGeckoId
    ? priceStore.getPrice24hChange(item.token.currency.coinGeckoId)
    : 0;
  return (
    <TouchableOpacity
      onPress={() => {
        onPressToken(item);
      }}
      key={`${item.chainInfo?.chainId}-${item.token?.toString()}`}
      style={styles.btnItem}
    >
      <View style={[styles.wraperItem]}>
        <View style={styles.leftBoxItem}>
          <View style={styles.iconWrap}>
            <OWIcon
              style={{ borderRadius: 999 }}
              type="images"
              source={{
                uri:
                  item.token?.currency?.coinImageUrl?.includes("missing.png") ||
                  !item.token?.currency?.coinImageUrl ||
                  item.token?.currency?.coinImageUrl?.includes("missing.svg")
                    ? unknownToken?.coinImageUrl
                    : item.token?.currency?.coinImageUrl,
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
            <Text size={16} color={colors["neutral-text-heading"]} weight="600">
              {removeDataInParentheses(item.token?.currency?.coinDenom)}{" "}
              <Text
                size={12}
                color={
                  price24h < 0
                    ? colors["error-text-body"]
                    : colors["success-text-body"]
                }
                style={styles.profit}
              >
                {price24h > 0 ? "+" : ""}
                {maskedNumber(price24h, 2, 2)}%
              </Text>
            </Text>
            <Text weight="400" color={colors["neutral-text-body"]}>
              {item?.chainInfo?.chainName}
              {item.token?.currency?.type &&
              item.token?.currency?.coinDenom === "BTC"
                ? ` ${capitalizedText(item.token?.currency?.type)}`
                : ""}
            </Text>
          </View>
        </View>
        <View style={styles.rightBoxItem}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "flex-end" }}>
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
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});
const styling = (colors) =>
  StyleSheet.create({
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
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    wraperItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
      marginHorizontal: 16,
    },
    btnItem: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
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

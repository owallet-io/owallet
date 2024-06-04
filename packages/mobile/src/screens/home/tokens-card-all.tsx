import { OWButton } from "@src/components/button";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
// @ts-ignore
import React, { FC, FunctionComponent, useState, useTransition } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { OWBox } from "../../components/card";
import { useStore } from "../../stores";
import { maskedNumber, removeDataInParentheses } from "../../utils/helper";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { unknownToken } from "@owallet/common";

import { metrics } from "@src/themes";
import FastImage from "react-native-fast-image";
import OWText from "@src/components/text/ow-text";
import { HistoryCard } from "@src/screens/transactions";
import { ViewRawToken, ViewToken } from "@src/stores/huge-queries";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
  dataTokens: ViewRawToken[];
}> = observer(({ containerStyle, dataTokens }) => {
  const { priceStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const [activeTab, setActiveTab] = useState("tokens");
  const styles = styling(colors);

  const tokens = appInitStore.getInitApp.hideTokensWithoutBalance
    ? dataTokens.filter((item, index) => {
        return new Dec(item.token.amount).gt(new Dec("1000"));
      })
    : dataTokens;
  const renderContent = () => {
    if (activeTab === "tokens") {
      return (
        <>
          {tokens?.length > 0 ? (
            tokens.map((item, index) => (
              <TokenItem key={index.toString()} item={item} />
            ))
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 42,
              }}
            >
              <FastImage
                source={require("../../assets/images/img_money.png")}
                style={{
                  width: 150,
                  height: 150,
                }}
                resizeMode={"contain"}
              />
              <OWText
                color={colors["neutral-text-title"]}
                size={16}
                weight="700"
              >
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
                  navigate(SCREENS.STACK.Others, {
                    screen: SCREENS.BuyFiat,
                  });
                }}
              />
            </View>
          )}
          <OWButton
            style={{
              marginTop: Platform.OS === "android" ? 28 : 22,
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
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.NetworkToken,
              });
              return;
            }}
          />
        </>
      );
    } else {
      return (
        <>
          <HistoryCard />
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <OWBox
        style={{
          paddingTop: 12,
          backgroundColor: colors["neutral-surface-card"],
          paddingHorizontal: 0,
        }}
      >
        <View style={styles.wrapHeaderTitle}>
          <OWButton
            type="link"
            label={"Tokens"}
            textStyle={{
              color:
                activeTab === "tokens"
                  ? colors["primary-surface-default"]
                  : colors["neutral-text-body"],
              fontWeight: "600",
              fontSize: 16,
            }}
            onPress={() => {
              setActiveTab("tokens");
            }}
            style={[
              {
                width: "50%",
              },
              activeTab === "tokens" ? styles.active : styles.inactive,
            ]}
          />
          <OWButton
            type="link"
            label={"History"}
            onPress={() => {
              setActiveTab("history");
            }}
            textStyle={{
              color:
                activeTab === "history"
                  ? colors["primary-surface-default"]
                  : colors["neutral-text-body"],
              fontWeight: "600",
              fontSize: 16,
            }}
            style={[
              {
                width: "50%",
              },
              activeTab === "history" ? styles.active : styles.inactive,
            ]}
          />
        </View>

        {renderContent()}
      </OWBox>
    </View>
  );
});

const TokenItem: FC<{
  item: ViewRawToken;
}> = observer(({ item }) => {
  const { colors } = useTheme();
  const { priceStore } = useStore();
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  if (!fiatCurrency) return;
  const styles = styling(colors);
  const onPressToken = async (item) => {
    navigate(SCREENS.TokenDetails, {
      item,
    });
    return;
  };
  return (
    <TouchableOpacity
      onPress={() => {
        onPressToken(item);
      }}
      key={`${item.chainInfo.chainId}-${item.token.toString()}`}
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
                  item.token.currency.coinImageUrl || unknownToken.coinImageUrl,
              }}
              size={32}
            />
          </View>
          <View style={styles.chainWrap}>
            <OWIcon
              type="images"
              source={{
                uri: item.chainInfo.chainImage || unknownToken.coinImageUrl,
              }}
              size={16}
            />
          </View>

          <View style={styles.pl12}>
            <Text size={16} color={colors["neutral-text-heading"]} weight="600">
              {removeDataInParentheses(item.token.currency.coinDenom)}
            </Text>
            <Text weight="400" color={colors["neutral-text-body"]}>
              {item.chainInfo.chainName}
            </Text>
            {item.type && (
              <View style={styles.type}>
                <Text
                  weight="400"
                  size={12}
                  color={colors["neutral-text-body-2"]}
                >
                  {item.type}
                </Text>
              </View>
            )}
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
                {maskedNumber(
                  new CoinPretty(item.token.currency, item.token.amount)
                    .trim(true)
                    .hideDenom(true)
                    .toString()
                )}
              </Text>
              <Text
                size={14}
                style={{ lineHeight: 24 }}
                color={colors["neutral-text-body"]}
              >
                {new PricePretty(fiatCurrency, item.price).toString()}
              </Text>
              {/*<Text*/}
              {/*  size={14}*/}
              {/*  style={styles.profit}*/}
              {/*  // color={*/}
              {/*  //   colors[*/}
              {/*  //     profit < 0 ? 'error-text-body' : 'success-text-body'*/}
              {/*  //     ]*/}
              {/*  // }*/}
              {/*>*/}
              {/*  0*/}
              {/*  /!*{profit < 0 ? '' : '+'}*!/*/}
              {/*  /!*{percent}% (${profit ?? 0})*!/*/}
              {/*</Text>*/}
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
      backgroundColor: colors["neutral-icon-on-dark"],
    },
    chainWrap: {
      width: 22,
      height: 22,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-icon-on-dark"],
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
    },
  });

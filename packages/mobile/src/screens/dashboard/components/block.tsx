import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { OWBox } from "../../../components/card";
import { Text } from "@src/components/text";
import { View, ViewStyle, StyleSheet } from "react-native";
import { spacing } from "../../../themes";
import { useStore } from "../../../stores";
import { ActivityIcon, ClockIcon } from "../../../components/icon";
import FastImage from "react-native-fast-image";
import { API } from "../../../common/api";
import { numberWithCommas } from "../../../utils/helper";
import { useTheme } from "@src/themes/theme-provider";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { CoinGeckoAPIEndPoint } from "@owallet/common";

export const BlockCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling();

  const [data, setData] = useState(null);

  const { data: res } = useQuery({
    queryKey: ["chart-dashboard", chainStore.current.stakeCurrency.coinGeckoId],
    queryFn: () =>
      API.getCoinInfo(
        {
          id: chainStore.current.stakeCurrency.coinGeckoId,
        },
        { baseURL: CoinGeckoAPIEndPoint }
      ),
    ...{
      initialData: null,
    },
  });

  useEffect(() => {
    if (res?.status === 200 && typeof res?.data === "object") {
      setData(res.data?.[0]);
    }
  }, [res]);

  const renderBlockInfo = (title, value, sub, color, isBottom) => {
    return (
      <View
        style={[
          styles.blockWrapper,
          isBottom
            ? {
                borderBottomWidth: 0,
                paddingBottom: 0,
              }
            : null,
        ]}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIcon />
        </View>
        <View style={{ paddingLeft: 33 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <ClockIcon size={18} color={colors["primary-text"]} />
            <Text style={styles.blockTitle}>
              {"  "}
              {title}
            </Text>
          </View>

          <Text style={styles.blockValue}>{value}</Text>
          <Text style={styles.blockSub}>{sub}</Text>
        </View>
      </View>
    );
  };

  return (
    <OWBox>
      <View style={styles.headerWrapper}>
        <View style={[styles.blockWrapper, { paddingTop: 0 }]}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              backgroundColor: colors["purple-100"],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FastImage
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: chainStore.current.stakeCurrency?.coinImageUrl,
              }}
            />
          </View>

          <View style={{ paddingLeft: 33 }}>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <ClockIcon size={18} color={colors["primary-text"]} />
              <Text style={styles.blockTitle}>{"  "}Coin market info</Text>
            </View>
            <Text style={styles.blockValue}>${data?.current_price}</Text>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: colors["background-item-list"],
                borderRadius: 4,
                marginBottom: 4,
              }}
            >
              <Text style={[styles.blockSub, { lineHeight: 20 }]}>
                Coingecko :{" "}
                <Text
                  style={[
                    styles.blockSub,
                    {
                      lineHeight: 20,
                      color:
                        data?.market_cap_change_percentage_24h > 0
                          ? colors["green-500"]
                          : colors["danger-300"],
                    },
                  ]}
                >
                  {data?.market_cap_change_percentage_24h > 0 ? "+" : ""}
                  {data?.market_cap_change_percentage_24h.toFixed(2)}% (24h)
                </Text>
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.blockSub, { lineHeight: 20 }]}>
                Market Cap
              </Text>
              <Text
                style={{
                  fontWeight: "700",
                  lineHeight: 20,
                  color: colors["primary-text"],
                }}
              >
                ${numberWithCommas(data?.market_cap ?? 0)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.blockSub, { lineHeight: 20 }]}>
                Trading Vol
              </Text>
              <Text
                style={{
                  fontWeight: "700",
                  lineHeight: 20,
                  color: colors["primary-text"],
                }}
              >
                ${numberWithCommas(data?.total_volume ?? 0)}
              </Text>
            </View>
          </View>
        </View>
        {renderBlockInfo(
          "24h Low / 24h High",
          `$${data?.low_24h ?? 0} / $${data?.high_24h ?? 0}`,
          `Date updated: ${moment(data?.last_updated).format(
            "hh:mm DD/MM/YY"
          )}`,
          colors["profile-green"],
          false
        )}
        {renderBlockInfo(
          "Total Volume",
          "$" + numberWithCommas(data?.total_volume ?? 0),
          `Date updated: ${moment(data?.last_updated).format(
            "hh:mm DD/MM/YY"
          )}`,
          colors["purple-400"],
          false
        )}
        {renderBlockInfo(
          "Market Cap Rank",
          `#${data?.market_cap_rank ?? 0}`,
          `Date updated: ${moment(data?.last_updated).format(
            "hh:mm DD/MM/YY"
          )}`,
          colors["blue-300"],
          true
        )}
      </View>
    </OWBox>
  );
});

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    headerWrapper: {
      alignItems: "center",
      paddingBottom: 40,
    },
    card: {
      padding: spacing["28"],
      paddingBottom: spacing["14"],
      marginBottom: spacing["32"],
      borderRadius: spacing["24"],
      backgroundColor: colors["primary"],
    },
    blockWrapper: {
      flexDirection: "row",
      borderBottomColor: colors["border-input-login"],
      borderBottomWidth: 1,
      width: "100%",
      padding: 24,
      alignItems: "center",
    },
    blockTitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors["text-dashboard"],
    },
    blockValue: {
      fontSize: 34,
      fontWeight: "500",
      lineHeight: 50,
      color: colors["primary-text"],
    },
    blockSub: {
      fontSize: 12,
      lineHeight: 16,
      color: colors["text-dashboard"],
    },
  });
};

import { View } from "react-native";
import { LineGraph } from "react-native-graph";
import OWText from "@src/components/text/ow-text";
import React, { FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
import { OWButton } from "@src/components/button";
import { useQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { MarketAPIEndPoint } from "@owallet/common";
import moment from "moment/moment";
import HapticFeedback, {
  HapticFeedbackTypes,
} from "react-native-haptic-feedback";
import { PricePretty } from "@owallet/unit";
import { useStore } from "@src/stores";
import { OWBox } from "@src/components/card";

export interface GraphPoint {
  value: number;
  date: Date;
}

export type DataPrices = [number, number][];

function convertDataPrices(data: [number, number][]): GraphPoint[] {
  return data.map(([timestamp, value]) => ({
    value,
    date: new Date(timestamp),
  }));
}

const ranges = [
  {
    id: 1,
    value: "1h",
    name: "1H",
    unit: "hour",
  },
  {
    id: 2,
    value: "24h",
    name: "1D",
    unit: "day",
  },
  {
    id: 3,
    value: "7d",
    name: "1W",
    unit: "week",
  },
  {
    id: 4,
    value: "30d",
    name: "1M",
    unit: "month",
  },
  {
    id: 5,
    value: "1y",
    name: "1Y",
    unit: "year",
  },
  {
    id: 6,
    value: "max",
    name: "MAX",
    unit: "year",
  },
];
export const TokenChart: FC<{
  coinGeckoId: string;
  denom?: string;
}> = observer(({ coinGeckoId, denom }) => {
  const { colors } = useTheme();
  const { priceStore } = useStore();
  const [typeActive, setTypeActive] = useState(ranges[1]);
  const [dataPriceChart, setDataPriceChart] = useState(null);
  const [currentPrice, setCurrentPrice] = useState<GraphPoint>();
  const [simplePrice, setSimplePrice] = useState<GraphPoint>();
  const [change24h, setChange24h] = useState<number>();
  const { data: res } = useQuery({
    queryKey: ["chart-range", coinGeckoId, typeActive],
    queryFn: () => {
      if (typeActive.id === 6) {
        return API.getMarketChart(
          {
            id: coinGeckoId,
            unit: "usd",
            days: "max",
          },
          { baseURL: MarketAPIEndPoint + "/api/v3" }
        );
      }
      return API.getMarketChartRange(
        {
          id: coinGeckoId,
          from: moment()
            .subtract(1, typeActive.unit as any)
            .unix(),
        },
        { baseURL: MarketAPIEndPoint + "/api/v3" }
      );
    },
    ...{
      initialData: null,
    },
  });
  const { data: resPriceSimple, refetch: refetchPriceSimple } = useQuery({
    queryKey: ["current-price", coinGeckoId, typeActive?.value],
    queryFn: () =>
      API.getCoinSimpleInfo(
        {
          id: coinGeckoId,
          time: typeActive?.value,
        },
        { baseURL: MarketAPIEndPoint + "/api/v3" }
      ),
    ...{
      initialData: null,
    },
  });
  useEffect(() => {
    if (resPriceSimple?.data?.length > 0 && typeActive?.value) {
      if (resPriceSimple?.data?.[0]?.["current_price"]) {
        setCurrentPrice({
          value: resPriceSimple?.data?.[0]?.["current_price"],
          date: new Date(),
        });
        setSimplePrice({
          value: resPriceSimple?.data?.[0]?.["current_price"],
          date: new Date(),
        });
        if (typeActive.value === "max") {
          setChange24h(0);
        } else {
          setChange24h(
            resPriceSimple?.data?.[0]?.[
              `price_change_percentage_${typeActive.value}_in_currency`
            ]
          );
        }
      }
    }
  }, [
    resPriceSimple?.data?.[0]?.["current_price"],
    coinGeckoId,
    typeActive?.value,
  ]);
  const handlePriceData = (prices: DataPrices) => {
    const dataConvered = convertDataPrices(prices);

    return dataConvered;
  };
  useEffect(() => {
    if (res?.status !== 200 || !res?.data?.prices) return;

    const dataPrice = handlePriceData(res.data?.prices);
    setDataPriceChart(dataPrice);
  }, [res]);
  const hapticFeedback = (
    type: HapticFeedbackTypes = "impactLight",
    force = false
  ) => {
    HapticFeedback.trigger(type, {
      enableVibrateFallback: force,
      ignoreAndroidSystemSettings: force,
    });
  };
  const fiat = priceStore.defaultVsCurrency;
  const fiatCurrency = priceStore.getFiatCurrency(fiat);
  const resetPrice = () => {
    if (simplePrice) {
      setCurrentPrice(simplePrice);
      return;
    }
    return;
  };
  const hapticStart = () => {
    hapticFeedback("impactLight");
    return;
  };
  return (
    <OWBox
      style={{
        maxHeight: 360,
        marginTop: 16,
        borderRadius: 24,
        paddingHorizontal: 0,
      }}
    >
      <View
        style={{
          paddingHorizontal: 24,
        }}
      >
        <OWText size={15} weight={"400"} color={colors["neutral-text-body"]}>
          {denom} Price
        </OWText>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingBottom: 24,
          justifyContent: "space-between",
        }}
      >
        <OWText size={28} weight={"500"} color={colors["neutral-text-heading"]}>
          {new PricePretty(
            {
              ...fiatCurrency,
              maxDecimals: 6,
            },
            currentPrice?.value
          ).toString()}
        </OWText>
        <View>
          <OWText size={12} color={colors["neutral-text-body"]}>
            {currentPrice?.date &&
            simplePrice?.date &&
            currentPrice?.date !== simplePrice?.date
              ? moment(currentPrice?.date).format("YYYY-MM-DD HH:mm:ss")
              : null}
          </OWText>
          <OWText
            size={14}
            weight={"400"}
            color={
              change24h < 0
                ? colors["error-text-body"]
                : colors["success-text-body"]
            }
          >
            {typeof change24h === "number" && change24h < 0
              ? `${change24h?.toFixed(2)}`
              : `+${change24h?.toFixed(2) ?? "0.00"}`}{" "}
            % Today
          </OWText>
        </View>
      </View>
      {dataPriceChart && (
        <LineGraph
          animated={true}
          style={{
            width: "100%",
            height: "70%",
          }}
          enablePanGesture={true}
          onPointSelected={(p) => setCurrentPrice(p)}
          onGestureStart={hapticStart}
          onGestureEnd={resetPrice}
          enableIndicator={true}
          panGestureDelay={0}
          points={dataPriceChart}
          color={
            change24h < 0
              ? colors["error-text-body"]
              : colors["success-text-body"]
          }
        />
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        {ranges.map((item, index) => {
          return (
            <OWButton
              key={`${item.id}`}
              onPress={() => {
                setTypeActive(item);
              }}
              style={{
                borderRadius: 20,
                height: 32,
                paddingHorizontal: 12,
                backgroundColor:
                  typeActive.id === item.id
                    ? colors["neutral-surface-action2"]
                    : colors["neutral-surface-card"],
              }}
              size={"small"}
              textStyle={{
                fontWeight: "400",
                fontSize: 13,
              }}
              fullWidth={false}
              type={"secondary"}
              label={item.name}
            />
          );
        })}
      </View>
    </OWBox>
  );
});

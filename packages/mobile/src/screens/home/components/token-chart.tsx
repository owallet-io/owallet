import { View } from "react-native";
import { LineGraph } from "react-native-graph";
import { metrics } from "@src/themes";
import OWText from "@src/components/text/ow-text";
import React, { FC, FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
import { OWButton } from "@src/components/button";
import { useQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { MarketAPIEndPoint } from "@owallet/common";
import moment from "moment/moment";

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
    value: 10,
    name: "1H",
    unit: "hour",
  },
  {
    id: 2,
    value: 10,
    name: "1D",
    unit: "day",
  },
  {
    id: 3,
    value: 10,
    name: "1W",
    unit: "week",
  },
  {
    id: 4,
    value: 10,
    name: "1M",
    unit: "month",
  },
  {
    id: 5,
    value: 10,
    name: "1Y",
    unit: "year",
  },
  {
    id: 6,
    value: 10,
    name: "MAX",
    unit: "year",
  },
];
export const TokenChart: FC<{
  coinGeckoId: string;
}> = observer(({ coinGeckoId }) => {
  const { colors } = useTheme();

  const [typeActive, setTypeActive] = useState(ranges[1]);
  const [dataPriceChart, setDataPriceChart] = useState(null);
  const { data: res, refetch } = useQuery({
    queryKey: ["chart-range", coinGeckoId, typeActive],
    queryFn: () =>
      API.getMarketChartRange(
        {
          id: coinGeckoId,
          from: moment()
            .subtract(1, typeActive.unit as any)
            .unix(),
        },
        { baseURL: MarketAPIEndPoint + "/api/v3" }
      ),
    ...{
      initialData: null,
    },
  });

  const handlePriceData = (prices: DataPrices) => {
    const dataConvered = convertDataPrices(prices);
    console.log(dataConvered, "dataConvered");
    return dataConvered;
  };
  useEffect(() => {
    if (res?.status === 200 && typeof res?.data === "object") {
      console.log(res, "ress");
      const dataPrice = handlePriceData(res.data?.prices);
      setDataPriceChart(dataPrice);
    }
  }, [res]);

  return (
    <View
      style={{
        backgroundColor: colors["neutral-surface-card"],
        maxHeight: 330,
        marginHorizontal: 16,
        padding: 16,
        marginTop: 2,
        borderRadius: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <OWText size={28} weight={"500"} color={colors["neutral-text-heading"]}>
          $4.89
        </OWText>
        <OWText
          style={{
            paddingLeft: 8,
            paddingBottom: 4,
          }}
          size={14}
          weight={"400"}
          color={colors["success-text-body"]}
        >
          +8.95% Today
        </OWText>
      </View>
      {dataPriceChart && (
        <LineGraph
          animated={true}
          style={{
            width: "100%",
            height: "77%",
            // marginLeft: 5,
          }}
          enableFadeInMask={true}
          TopAxisLabel={() => <OWText>ok</OWText>}
          enablePanGesture={true}
          // onGestureStart={() => hapticFeedback('impactLight')}
          enableIndicator={true}
          points={dataPriceChart}
          color={colors["success-text-body"]}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
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
    </View>
  );
});

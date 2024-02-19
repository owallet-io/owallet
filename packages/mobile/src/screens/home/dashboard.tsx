import { OWEmpty } from '@src/components/empty';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { API } from '../../common/api';
import { OWBox } from '../../components/card';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
import { metrics, spacing } from '../../themes';
import { nFormatter } from '../../utils/helper';
import { colorsCode } from '@src/themes/mode-colors';
import { useQuery } from '@tanstack/react-query';
import { CoinGeckoAPIEndPoint } from '@owallet/common';

const DATA_COUNT_DENOM = 4;
const transformData = data => {
  if (Array.isArray(data)) {
    return data
      .filter((item, index, arr) => index % DATA_COUNT_DENOM === 0 || index === 0 || index === arr.length - 1)
      .map(item => [item[0], Math.round(item[1] * 100) / 100]);
  }

  return [];
};

const formater = value => {
  if (value > 1000) {
    return nFormatter(value, 1).value;
  } else {
    return value;
  }
};

const formatData = data => {
  const labels = [];
  const dataChart = [];
  let suffix = '';
  if (data.length > 0) {
    const first = data[0];
    const last = data[data.length - 1];
    suffix = nFormatter(first[1], 1).symbol;
    labels.push(moment(first[0]).format('hh:mm'));
    dataChart.push(formater(first[1]));

    const step = Math.floor(data.length / 5);
    for (let i = 1; i < 5; i++) {
      labels.push(moment(data[i * step][0]).format('hh:mm'));
      dataChart.push(formater(data[i * step][1]));
    }
    labels.push(moment(last[0]).format('hh:mm'));
    dataChart.push(formater(last[1]));
  }

  return {
    labels,
    datasets: [
      {
        data: dataChart,
        color: (opacity = 1) => colorsCode['primary-surface-default'],
        strokeWidth: 1.7
      }
    ],
    suffix: suffix
  };
};

export const DashboardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  canView?: boolean;
}> = observer(({ canView = true }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  const chartConfig = {
    backgroundColor: colors['background-box'],
    backgroundGradientFrom: colors['background-box'],
    backgroundGradientTo: colors['background-box'],
    color: (opacity = 1) => `rgba(148, 94, 248, ${opacity})`,
    labelColor: (opacity = 1) => colors['text-title-login'],
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const [active, setActive] = useState('price');
  const [chartSuffix, setChartSuffix] = useState('');
  const [isNetworkError, setNetworkError] = useState(true);
  const { chainStore } = useStore();
  const [data, setData] = useState({
    labels: ['12:00'],
    datasets: [
      {
        data: [0],
        color: (opacity = 1) => `rgba(148, 94, 248, ${opacity})`,
        strokeWidth: 2
      }
    ],
    suffix: ''
  });

  const [dataVolumes, setDataVolumes] = useState({
    labels: ['12:00'],
    datasets: [
      {
        data: [0],
        color: (opacity = 1) => `rgba(148, 94, 248, ${opacity})`,
        strokeWidth: 2
      }
    ],
    suffix: ''
  });

  const smartNavigation = useSmartNavigation();

  const { data: res, refetch } = useQuery({
    queryKey: ['chart-range', chainStore.current.stakeCurrency.coinGeckoId],
    queryFn: () =>
      API.getMarketChartRange(
        {
          id: chainStore.current.stakeCurrency.coinGeckoId
        },
        { baseURL: CoinGeckoAPIEndPoint }
      ),
    ...{
      initialData: null
    }
  });

  useEffect(() => {
    console.log('refetch', chainStore.current.stakeCurrency.coinGeckoId, res);

    refetch();
  }, [chainStore.current.stakeCurrency.coinGeckoId]);

  useEffect(() => {
    console.log('res', res);

    if (res?.status === 200 && typeof res?.data === 'object') {
      setNetworkError(false);
      setData(formatData(transformData(res.data?.prices)));
      setDataVolumes(formatData(transformData(res.data?.total_volumes)));
    } else {
      setNetworkError(true);
    }
  }, [res]);

  const handleChartState = type => {
    setActive(type);
    if (type === 'price') {
      setChartSuffix(data.suffix);
    } else {
      setChartSuffix(dataVolumes.suffix);
    }
  };

  useEffect(() => {
    setActive('price');
    setChartSuffix(data.suffix);
  }, [chainStore.current.chainId, data]);

  return (
    <OWBox>
      <Text
        style={{
          alignSelf: 'center',
          paddingBottom: spacing['16'],
          fontSize: 17,
          fontWeight: '500',
          color: colors['primary-text']
        }}
      >
        {chainStore.current.chainName} ({chainStore.current.stakeCurrency.coinDenom})
      </Text>
      <View style={styles.headerWrapper}>
        <View style={styles.headerLeftWrapper}>
          <TouchableOpacity
            onPress={() => handleChartState('price')}
            style={[active === 'price' ? styles.active : styles.inActive]}
          >
            <Text style={[active === 'price' ? styles.activeText : styles.inActiveText]}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleChartState('volume')}
            style={[active === 'volume' ? styles.active : styles.inActive]}
          >
            <Text style={[active === 'volume' ? styles.activeText : styles.inActiveText]}>Volume</Text>
          </TouchableOpacity>
        </View>

        {canView && !isNetworkError ? (
          <TouchableOpacity
            onPress={() => {
              smartNavigation.navigateSmart('Dashboard', {});
            }}
            style={styles.viewDetail}
          >
            <Text
              style={{
                color: colors['label']
              }}
            >
              View detail
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {isNetworkError ? (
        <OWEmpty
          style={styles.emptyChart}
          type="crash"
          label={`Something went wrong with the chart.\nPlease pull to refresh.`}
        />
      ) : null}
      {!isNetworkError && active === 'price' ? (
        <LineChart
          data={data}
          withDots={false}
          withInnerLines={false}
          yAxisLabel={'$'}
          yAxisSuffix={chartSuffix}
          width={metrics.screenWidth - 48}
          height={256}
          chartConfig={chartConfig}
          bezier
        />
      ) : !isNetworkError ? (
        <BarChart
          data={dataVolumes}
          width={metrics.screenWidth - 48}
          height={256}
          yAxisLabel="$"
          yAxisSuffix={chartSuffix}
          chartConfig={chartConfig}
        />
      ) : null}
    </OWBox>
  );
});

const styling = colors =>
  StyleSheet.create({
    emptyChart: {
      height: 256,
      paddingBottom: 80
    },
    headerWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 40
    },
    headerLeftWrapper: {
      flexDirection: 'row',
      paddingVertical: 4,
      paddingHorizontal: 7,
      borderColor: colors['sub-primary'],
      borderWidth: 1,
      borderRadius: 4
    },
    active: {
      padding: 7,
      backgroundColor: colors['primary-surface-default'],
      borderRadius: 4
    },
    inActive: {
      padding: 7,
      backgroundColor: colors['background-box'],
      borderRadius: 4
    },
    activeText: {
      color: colors['white'],
      fontSize: 14
    },
    inActiveText: {
      color: colors['primary-surface-default'],
      fontSize: 14
    },
    viewDetail: {
      backgroundColor: colors['sub-primary'],
      opacity: 0.6,
      paddingVertical: 4,
      paddingHorizontal: 7,
      borderRadius: 4
    }
  });

import React, { FunctionComponent, useMemo } from 'react';

import { Dec, DecUtils } from '@owallet/unit';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import styleAsset from './asset.module.scss';
import { ToolTip } from '../../components/tooltip';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLanguage, toDisplay, TRON_ID, getEvmAddress } from '@owallet/common';
import { useHistory } from 'react-router';
import { formatBalance, getExchangeRate, getBalanceValue, getBaseDerivationPath } from '@owallet/bitcoin';
const LazyDoughnut = React.lazy(async () => {
  const module = await import(/* webpackChunkName: "reactChartJS" */ 'react-chartjs-2');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const chartJS = module.Chart as any;

  chartJS.pluginService.register({
    beforeDraw: function (chart: any): void {
      const round = {
        x: (chart.chartArea.left + chart.chartArea.right) / 2,
        y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
        radius: (chart.outerRadius + chart.innerRadius) / 2,
        thickness: (chart.outerRadius - chart.innerRadius) / 2
      };

      const ctx = chart.chart.ctx;

      // Draw the background circle.
      ctx.save();
      ctx.beginPath();
      ctx.arc(round.x, round.y, round.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.lineWidth = round.thickness * 2;
      ctx.strokeStyle = '#f4f5f7';
      ctx.stroke();
      ctx.restore();
    },
    beforeTooltipDraw: function (chart: any): void {
      const data = chart.getDatasetMeta(0).data;

      const round = {
        x: (chart.chartArea.left + chart.chartArea.right) / 2,
        y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
        radius: (chart.outerRadius + chart.innerRadius) / 2,
        thickness: (chart.outerRadius - chart.innerRadius) / 2
      };

      const ctx = chart.chart.ctx;

      const drawCircle = (angle: number, color: string) => {
        ctx.save();
        ctx.translate(round.x, round.y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(round.radius * Math.sin(angle), round.radius * Math.cos(angle), round.thickness, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      const drawCircleEndEachOther = (arc1: any, arc2: any) => {
        const startAngle1 = Math.PI / 2 - arc1._view.startAngle;
        const endAngle1 = Math.PI / 2 - arc1._view.endAngle;

        const startAngle2 = Math.PI / 2 - arc2._view.startAngle;
        // Nomalize
        const endAngle2 = Math.atan2(
          Math.sin(Math.PI / 2 - arc2._view.endAngle),
          Math.cos(Math.PI / 2 - arc2._view.endAngle)
        );

        // If the end of the first arc and the end of the second arc overlap,
        // Don't draw the first arc's end because it overlaps and looks weird.
        if (Math.abs(startAngle1 - endAngle2) > (Math.PI / 180) * 3) {
          drawCircle(startAngle1, arc1._view.backgroundColor);
        }
        if (Math.abs(endAngle1 - startAngle2) > (Math.PI / 180) * 3) {
          drawCircle(endAngle1, arc1._view.backgroundColor);
        }

        if (Math.abs(startAngle2) > (Math.PI / 180) * 3 || Math.abs(endAngle2) > (Math.PI / 180) * 3) {
          drawCircle(startAngle2, arc2._view.backgroundColor);
          drawCircle(endAngle2, arc2._view.backgroundColor);
        }
      };

      if (data.length == 2) {
        drawCircleEndEachOther(data[0], data[1]);
      }
    }
  });

  return { default: module.Doughnut };
});

export const AssetStakedChartView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const intl = useIntl();
  const language = useLanguage();

  const fiat = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const queryBalances = queries.queryBalances.getQueryBech32Address(accountInfo.bech32Address);
  const balanceStakableQuery = queryBalances.stakable;

  const stakable = balanceStakableQuery?.balance;

  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const stakedSum = delegated.add(unbonding);

  const totalStake = stakable.add(stakedSum);

  const tokens = queryBalances.positiveNativeUnstakables.concat(queryBalances.nonNativeBalances);
  const totalPrice = useMemo(() => {
    const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
    if (!fiatCurrency) {
      return undefined;
    }
    if (!totalStake.isReady) {
      return undefined;
    }
    let res = priceStore.calculatePrice(totalStake, fiat);
    for (const token of tokens) {
      const price = priceStore.calculatePrice(token.balance, fiat);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  }, [totalStake, fiat]);

  return (
    <React.Fragment>
      <div className={styleAsset.containerChart}>
        <div className={styleAsset.centerText}>
          <div className={styleAsset.big}>
            <FormattedMessage id="main.account.chart.total-balance" />
          </div>
          <div className={styleAsset.small}>
            {totalPrice ? totalPrice.toString() : totalStake.shrink(true).trim(true).maxDecimals(6).toString()}
          </div>
        </div>
        <React.Suspense fallback={<div style={{ height: '150px' }} />}>
          <img src={require('../../public/assets/img/total-balance.svg')} alt="total-balance" />
        </React.Suspense>
      </div>
      <div style={{ marginTop: '12px', width: '100%' }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: '#777E90' }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: '20px' }} />
          <div
            className={styleAsset.value}
            style={{
              color: '#353945E5'
            }}
          >
            {stakable.shrink(true).maxDecimals(6).toString()}
          </div>
        </div>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: '#777E90' }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.staked-balance" />
          </div>
          <div style={{ minWidth: '20px' }} />
          <div
            className={styleAsset.value}
            style={{
              color: '#353945E5'
            }}
          >
            {stakedSum.shrink(true).maxDecimals(6).toString()}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});

export const AssetChartViewEvm: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } = useStore();

  const language = useLanguage();

  const fiatCurrency = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const addressCore = accountInfo.getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
  console.log('🚀 ~ constAssetChartViewEvm:FunctionComponent=observer ~ addressCore:', addressCore);
  // wait for account to be
  if (!addressCore) return null;

  const isTronNetwork = chainStore.current.chainId === TRON_ID;

  const balance = queries.evm.queryEvmBalance.getQueryBalance(addressCore)?.balance;
  console.log('🚀 ~ constAssetChartViewEvm:FunctionComponent=observer ~ balance:', balance);
  let totalPrice;
  let total;
  if (addressCore) {
    total = queries.evm.queryEvmBalance.getQueryBalance(addressCore)?.balance;
    if (total) {
      totalPrice =
        isTronNetwork && total
          ? toDisplay(total.amount.int.value, 24) *
            priceStore?.getPrice(chainStore?.current?.stakeCurrency?.coinGeckoId)
          : priceStore?.calculatePrice(total, fiatCurrency);
    }
  }
  return (
    <React.Fragment>
      <div className={styleAsset.containerChart}>
        <div className={styleAsset.centerText}>
          <div className={styleAsset.big}>
            <FormattedMessage id="main.account.chart.total-balance" />
          </div>
          <div className={styleAsset.small}>
            {!isTronNetwork
              ? totalPrice
                ? totalPrice.toString()
                : total?.shrink(true).maxDecimals(6).toString()
              : null}

            {isTronNetwork && totalPrice && parseFloat(totalPrice).toFixed(2) + ' $'}
          </div>
        </div>
        <React.Suspense fallback={<div style={{ height: '150px' }} />}>
          <img src={require('../../public/assets/img/total-balance.svg')} alt="total-balance" />
        </React.Suspense>
      </div>
      <div style={{ marginTop: '12px', width: '100%' }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: '#777E90' }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: '20px' }} />
          <div
            className={styleAsset.value}
            style={{
              color: '#353945E5'
            }}
          >
            {!isTronNetwork && balance?.trim(true).shrink(true).maxDecimals(6).toString()}

            {isTronNetwork && total
              ? toDisplay(total.amount.int.value, 24) + ` ${chainStore.current?.stakeCurrency.coinDenom}`
              : null}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});

export const AssetChartViewBtc: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } = useStore();

  const language = useLanguage();

  const fiatCurrency = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);
  // wait for account to be
  const networkType = chainStore.current.networkType;
  const chainId = chainStore.current.chainId;
  let address = accountInfo.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const balance = queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.balance;

  const totalAmount = useMemo(() => {
    const amount = formatBalance({
      balance: Number(balance?.toCoin().amount),
      cryptoUnit: 'BTC',
      coin: chainId
    });
    return amount;
  }, [chainId, address, networkType, balance]);

  return (
    <React.Fragment>
      <div className={styleAsset.containerChart}>
        <div className={styleAsset.centerText}>
          <div className={styleAsset.big}>
            <FormattedMessage id="main.account.chart.total-balance" />
          </div>
          <div className={styleAsset.small}>{totalAmount}</div>
        </div>
        <React.Suspense fallback={<div style={{ height: '150px' }} />}>
          <img src={require('../../public/assets/img/total-balance.svg')} alt="total-balance" />
        </React.Suspense>
      </div>
      <div style={{ marginTop: '12px', width: '100%' }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: '#777E90' }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: '20px' }} />
          <div
            className={styleAsset.value}
            style={{
              color: '#353945E5'
            }}
          >
            {totalAmount}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});
export const AssetView: FunctionComponent = () => {
  return (
    <div className={styleAsset.containerAsset}>
      <AssetStakedChartView />
    </div>
  );
};

export const AssetViewEvm: FunctionComponent = () => {
  return (
    <div className={styleAsset.containerAsset}>
      <AssetChartViewEvm />
    </div>
  );
};
export const AssetViewBtc: FunctionComponent = () => {
  return (
    <div className={styleAsset.containerAsset}>
      <AssetChartViewBtc />
    </div>
  );
};

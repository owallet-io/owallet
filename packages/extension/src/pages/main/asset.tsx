import React, { FunctionComponent, useEffect, useMemo } from "react";

import { Dec, DecUtils } from "@owallet/unit";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { ToolTip } from "../../components/tooltip";
import { FormattedMessage, useIntl } from "react-intl";
import { useLanguage } from "@owallet/common";
import { useHistory } from "react-router";
import { formatBalance } from "@owallet/bitcoin";

export const AssetStakedChartView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } =
    useStore();
  const intl = useIntl();
  const language = useLanguage();

  const fiat = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const queryBalances =
    queries.queryBalances.getQueryBech32Address(walletAddress);

  const balanceStakableQuery = queryBalances.stakable;

  const stakable = balanceStakableQuery?.balance;

  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(walletAddress)
    .total.upperCase(true);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(walletAddress)
    .total.upperCase(true);

  const stakedSum = delegated.add(unbonding);

  const totalStake = stakable.add(stakedSum);

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );
  const totalPrice = useMemo(() => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );
    if (!fiatCurrency) {
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
            {totalPrice
              ? totalPrice.toString()
              : totalStake.shrink(true).trim(true).maxDecimals(6).toString()}
          </div>
        </div>
        <React.Suspense fallback={<div style={{ height: "150px" }} />}>
          <img
            src={require("../../public/assets/img/total-balance.svg")}
            alt="total-balance"
          />
        </React.Suspense>
      </div>
      <div style={{ marginTop: "12px", width: "100%" }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
            }}
          >
            {stakable.shrink(true).maxDecimals(6).toString()}
          </div>
        </div>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.staked-balance" />
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
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
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } =
    useStore();
  const intl = useIntl();
  const language = useLanguage();

  const fiat = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);
  const evmAddress = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const queryBalances = queries.queryBalances.getQueryBech32Address(evmAddress);

  const balanceStakableQuery = queryBalances.stakable;

  const stakable = balanceStakableQuery?.balance;

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );
  const totalPrice = useMemo(() => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );
    if (!fiatCurrency) {
      return undefined;
    }
    // if (!stakable.isReady) {
    //   return undefined;
    // }
    let res = priceStore.calculatePrice(stakable, fiat);
    for (const token of tokens) {
      const price = priceStore.calculatePrice(token.balance, fiat);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  }, [stakable, fiat]);

  return (
    <React.Fragment>
      <div className={styleAsset.containerChart}>
        <div className={styleAsset.centerText}>
          <div className={styleAsset.big}>
            <FormattedMessage id="main.account.chart.total-balance" />
          </div>
          <div className={styleAsset.small}>
            {totalPrice
              ? totalPrice.toString()
              : stakable.shrink(true).trim(true).maxDecimals(6).toString()}
          </div>
        </div>
        <React.Suspense fallback={<div style={{ height: "150px" }} />}>
          <img
            src={require("../../public/assets/img/total-balance.svg")}
            alt="total-balance"
          />
        </React.Suspense>
      </div>
      <div style={{ marginTop: "12px", width: "100%" }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
            }}
          >
            {stakable.shrink(true).trim(true).maxDecimals(6).toString()}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});

export const AssetChartViewBtc: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } =
    useStore();

  const language = useLanguage();

  const fiatCurrency = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);
  // wait for account to be
  const networkType = chainStore.current.networkType;
  const chainId = chainStore.current.chainId;
  const address = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const balance =
    queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.balance;

  const totalAmount = useMemo(() => {
    const amount = formatBalance({
      balance: Number(balance?.toCoin().amount),
      cryptoUnit: "BTC",
      coin: chainId,
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
        <React.Suspense fallback={<div style={{ height: "150px" }} />}>
          <img
            src={require("../../public/assets/img/total-balance.svg")}
            alt="total-balance"
          />
        </React.Suspense>
      </div>
      <div style={{ marginTop: "12px", width: "100%" }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
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
export const AssetChartViewTron: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } =
    useStore();
  const intl = useIntl();
  const language = useLanguage();

  const fiat = language.fiatCurrency;
  const { chainId } = chainStore.current;
  const queries = queriesStore.get(chainId);

  const accountInfo = accountStore.getAccount(chainId);
  const tronAddressToFetch = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const tronAddress = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const queryBalances =
    queries.queryBalances.getQueryBech32Address(tronAddressToFetch);
  //
  const balanceStakableQuery = queryBalances.stakable;
  //
  const stakable = balanceStakableQuery.balance;
  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );
  const totalPrice = () => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );
    if (!fiatCurrency) {
      return undefined;
    }

    let res = priceStore.calculatePrice(stakable, fiat);
    for (const token of tokens) {
      const price = priceStore.calculatePrice(token.balance, fiat);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  };

  const accountTronInfo =
    queries.tron.queryAccount.getQueryWalletAddress(tronAddress);

  return (
    <React.Fragment>
      <div className={styleAsset.containerChart}>
        <div className={styleAsset.centerText}>
          <div className={styleAsset.big}>
            <FormattedMessage id="main.account.chart.total-balance" />
          </div>
          <div className={styleAsset.small}>{totalPrice()?.toString()}</div>
        </div>
        <React.Suspense fallback={<div style={{ height: "150px" }} />}>
          <img
            src={require("../../public/assets/img/total-balance.svg")}
            alt="total-balance"
          />
        </React.Suspense>
      </div>
      <div style={{ marginTop: "12px", width: "100%" }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            <FormattedMessage id="main.account.chart.available-balance" />
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
            }}
          >
            {stakable.shrink(true).trim(true).maxDecimals(6).toString()}
          </div>
        </div>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            Energy
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
            }}
          >
            {`${accountTronInfo?.energyRemaining?.toString()}/${accountTronInfo?.energyLimit?.toString()}`}
          </div>
        </div>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#777E90" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-gray" />
            </span>
            Bandwidth
          </div>
          <div style={{ minWidth: "20px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#353945E5",
            }}
          >
            {`${accountTronInfo?.bandwidthRemaining?.toString()}/${accountTronInfo?.bandwidthLimit?.toString()}`}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});
export const AssetViewTron: FunctionComponent = () => {
  return (
    <div className={styleAsset.containerAsset}>
      <AssetChartViewTron />
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

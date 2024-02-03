import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { useStore } from '../../stores';
import styleAsset from './asset.module.scss';

export const AmountTokenCosmos: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);
  const balanceStakableQuery = queries.queryBalances.getQueryBech32Address(accountInfo.bech32Address).stakable;

  // const delegated = queries.cosmos.queryDelegations
  //   .getQueryBech32Address(accountInfo.bech32Address)
  //   .total.upperCase(true);

  // const unbonding = queries.cosmos.queryUnbondingDelegations
  //   .getQueryBech32Address(accountInfo.bech32Address)
  //   .total.upperCase(true);

  const stakable = balanceStakableQuery.balance;
  // const stakedSum = delegated.add(unbonding);

  return (
    <div className={styleAsset.amountOrainWrap}>
      <div className={styleAsset.legend}>
        <div className={styleAsset.label}>
          <FormattedMessage id="main.account.chart.available-balance" />
        </div>
        <div style={{ minWidth: '16px' }} />
        <div className={styleAsset.value}>{stakable.shrink(true).maxDecimals(6).toString()}</div>
      </div>
      {/* <div className={styleAsset.legend}>
        <div className={styleAsset.label} style={{ color: '#11cdef' }}>
          <span className="badge-dot badge badge-secondary">
            <i className="bg-info" />
          </span>
          <FormattedMessage id="main.account.chart.staked-balance" />
        </div>
        <div style={{ minWidth: '16px' }} />
        <div
          className={styleAsset.value}
          style={{
            color: '#D6CCF4'
          }}
        >
          {stakedSum.shrink(true).maxDecimals(6).toString()}
        </div>
      </div> */}
    </div>
  );
});

export const AmountTokenEvm: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  // const chainInfo = chainStore.getChain(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  // wait for account to be
  if (!accountInfo.evmosHexAddress) return null;

  const balance = queries.evm.queryEvmBalance.getQueryBalance(accountInfo.evmosHexAddress).balance;

  return (
    <div className={styleAsset.amountOrainWrap}>
      <div className={styleAsset.legend}>
        <div className={styleAsset.label}>
          <FormattedMessage id="main.account.chart.available-balance" />
        </div>
        <div style={{ minWidth: '16px' }} />
        {/* <div className={styleAsset.label}>
            <img src={chainInfo.stakeCurrency.coinImageUrl} />
          </div> */}
        <div className={styleAsset.value}>{balance?.trim(true).shrink(true).maxDecimals(6).toString()}</div>
      </div>
    </div>
  );
});

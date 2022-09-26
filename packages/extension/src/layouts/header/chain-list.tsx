import React, { FunctionComponent } from 'react';
import classnames from 'classnames';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

import style from './chain-list.module.scss';
import { ChainInfoWithEmbed } from '@owallet/background';
import { useConfirm } from '../../components/confirm';
import { useIntl } from 'react-intl';

const ChainElement: FunctionComponent<{
  chainInfo: ChainInfoWithEmbed;
}> = observer(({ chainInfo }) => {
  const { chainStore } = useStore();

  const intl = useIntl();

  const confirm = useConfirm();

  return (
    <div
      className={classnames({
        [style.chainName]: true,
        selected: chainInfo.chainId === chainStore.current.chainId
      })}
      onClick={() => {
        if (chainInfo.chainId !== chainStore.current.chainId) {
          analyticsStore.logEvent('Chain changed', {
            chainId: chainStore.current.chainId,
            chainName: chainStore.current.chainName,
            toChainId: chainInfo.chainId,
            toChainName: chainInfo.chainName
          });
          await keyRingStore.changeChain({
            chainId: chainInfo.chainId,
            chainName: chainInfo.chainName,
            networkType: chainInfo.networkType,
            rpc: chainInfo?.rpc ?? chainInfo?.rest,
            // ...chainInfo
          });
          chainStore.selectChain(chainInfo.chainId);
          chainStore.saveLastViewChainId();
        }
      }}
    >
      {chainInfo.chainName}
      {!chainInfo.embeded &&
      chainStore.current.chainId !== chainInfo.chainId ? (
        <div className={style.removeBtn}>
          <i
            className="fas fa-times-circle"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                await confirm.confirm({
                  paragraph: intl.formatMessage(
                    {
                      id: 'chain.remove.confirm.paragraph'
                    },
                    {
                      chainName: chainInfo.chainName
                    }
                  )
                })
              ) {
                await chainStore.removeChainInfo(chainInfo.chainId);
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
});

export const ChainList: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const mainChainList = chainStore.chainInfos.filter(
    (chainInfo) => !chainInfo.beta
  );
  const betaChainList = chainStore.chainInfos.filter(
    (chainInfo) => chainInfo.beta
  );

  return (
    <div className={style.chainListContainer}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: '1px solid rgba(255, 255, 255)'
          }}
        />
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255)',
            margin: '0 8px'
          }}
        >
          EVM
        </div>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: '1px solid rgba(255, 255, 255)'
          }}
        />
      </div>
      {mainChainList.map(
        (chainInfo) =>
          chainInfo.networkType === 'evm' && (
            <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
          )
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: '1px solid rgba(255, 255, 255)'
          }}
        />
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255)',
            margin: '0 8px'
          }}
        >
          Cosmos
        </div>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: '1px solid rgba(255, 255, 255)'
          }}
        />
      </div>
      {mainChainList.map(
        (chainInfo) =>
          chainInfo.networkType !== 'evm' && (
            <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
          )
      )}
    </div>
  );
});

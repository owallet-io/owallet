import React, { FunctionComponent, useEffect, useRef } from 'react';

import { HeaderLayout, LayoutHidePage } from '../../layouts';

import { Card, CardBody } from 'reactstrap';

import style from './style.module.scss';
import { Menu } from './menu';
import { AccountView } from './account';
import { TxButtonEvmView, TxButtonView } from './tx-button';
import { AssetView, AssetViewEvm } from './asset';
import { StakeView, LinkStakeView } from './stake';

import classnames from 'classnames';
import { useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TokensView } from './token';
import { BIP44SelectModal } from './bip44-select-modal';
import { useIntl } from 'react-intl';
import { useConfirm } from '../../components/confirm';
import { ChainUpdaterService } from '@owallet/background';
import { TRON_ID } from '@owallet/common';
import { IBCTransferView } from './ibc-transfer';
import { SelectChain } from '../../layouts/header';
import { AmountTokenCosmos, AmountTokenEvm } from './amount-tokens';
import { SendPage } from '../send';
import { SendEvmPage } from '../send-evm';
import { SendTronEvmPage } from '../send-tron';

export const MainPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();
  const [hasSend, setHasSend] = React.useState(false);
  const confirm = useConfirm();

  const currentChainId = chainStore.current.chainId;
  const prevChainId = useRef<string | undefined>();
  useEffect(() => {
    if (!chainStore.isInitializing && prevChainId.current !== currentChainId) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(
          chainStore.current
        );
        if (result.explicit) {
          // If chain info has been changed, warning the user wether update the chain or not.
          if (
            await confirm.confirm({
              paragraph: intl.formatMessage({
                id: 'main.update-chain.confirm.paragraph'
              }),
              yes: intl.formatMessage({
                id: 'main.update-chain.confirm.yes'
              }),
              no: intl.formatMessage({
                id: 'main.update-chain.confirm.no'
              })
            })
          ) {
            await chainStore.tryUpdateChain(chainStore.current.chainId);
          }
        } else if (result.slient) {
          await chainStore.tryUpdateChain(chainStore.current.chainId);
        }
      })();

      prevChainId.current = currentChainId;
    }
  }, [chainStore, confirm, chainStore.isInitializing, currentChainId, intl]);

  useEffect(() => {
    setHasSend(false);
  }, [chainStore.current]);
  // const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  // const queryBalances = queriesStore
  //   .get(chainStore.current.chainId)
  //   .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  // const tokens = queryBalances.unstakables;

  // const hasTokens = tokens.length > 0;
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <SelectChain showChainName canChangeChainInfo />
      <div style={{ height: 10 }} />
      <BIP44SelectModal />
      <Card className={classnames(style.card, 'shadow')}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <div className={style.imageWrap}>
              <AccountView />
              {chainStore.current.networkType === 'evm' ? (
                <>
                  <AssetViewEvm />
                </>
              ) : (
                <>
                  <AssetView />
                </>
              )}
            </div>
            {chainStore.current.networkType === 'evm' ? (
              <div style={{ marginTop: 24 }}>
                <TxButtonEvmView hasSend={hasSend} setHasSend={setHasSend} />
              </div>
            ) : (
              <>
                <TxButtonView hasSend={hasSend} setHasSend={setHasSend} />
              </>
            )}
            {hasSend ? (
              <>
                <div style={{ height: 32 }} />
                <hr
                  className="my-3"
                  style={{
                    height: 1,
                    borderTop: '1px solid #E6E8EC'
                  }}
                />
                <LayoutHidePage hidePage={() => setHasSend(false)} />
                {chainStore.current.networkType === 'evm' ? (
                  chainStore?.current.chainId === TRON_ID ? (
                    <SendTronEvmPage />
                  ) : (
                    <SendEvmPage />
                  )
                ) : (
                  <SendPage />
                )}
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {chainStore.current.networkType === 'cosmos' && (
        <>
          <Card className={classnames(style.card, 'shadow')}>
            <CardBody>
              <StakeView />
            </CardBody>
          </Card>
          <Card className={classnames(style.card, 'shadow')}>
            <CardBody>
              <LinkStakeView />
            </CardBody>
          </Card>
        </>
      )}
      {/* {hasTokens ? (
        <Card className={classnames(style.card, 'shadow')}>
          <CardBody>{<TokensView tokens={tokens} />}</CardBody>
        </Card>
      ) : null} */}

      {/* {uiConfigStore.showAdvancedIBCTransfer &&
      chainStore.current.features?.includes('ibc-transfer') ? (
        <Card className={classnames(style.card, 'shadow')}>
          <CardBody>
            <IBCTransferView />
          </CardBody>
        </Card>
      ) : null} */}
    </HeaderLayout>
  );
});

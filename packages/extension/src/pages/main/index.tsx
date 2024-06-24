import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";

import { HeaderLayout, LayoutHidePage } from "../../layouts";

import { Card, CardBody } from "reactstrap";

import { AccountView } from "./account";
import { AssetView, AssetViewBtc, AssetViewEvm, AssetViewTron } from "./asset";
import { LinkStakeView, StakeView } from "./stake";
import style from "./style.module.scss";
import { TxButtonBtcView, TxButtonView } from "./tx-button";

import { ChainUpdaterService } from "@owallet/background";
import { ChainIdEnum, TRON_ID } from "@owallet/common";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useConfirm } from "../../components/confirm";
import { SelectChain } from "../../layouts/header";
import { useStore } from "../../stores";
import { SendPage } from "../send";
import { SendEvmPage } from "../send-evm/send-evm";
import { SendTronEvmPage } from "../send-tron";
import { BIP44SelectModal } from "./bip44-select-modal";
import { SendBtcPage } from "../send-btc";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";

export const MainPage: FunctionComponent = observer(() => {
  const intl = useIntl();

  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();
  const [hasSend, setHasSend] = React.useState(false);
  const confirm = useConfirm();

  const currentChainId = chainStore.current.chainId;
  const prevChainId = useRef<string | undefined>();
  const { networkType, chainId } = chainStore.current;
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
                id: "main.update-chain.confirm.paragraph",
              }),
              yes: intl.formatMessage({
                id: "main.update-chain.confirm.yes",
              }),
              no: intl.formatMessage({
                id: "main.update-chain.confirm.no",
              }),
            })
          ) {
            await chainStore.tryUpdateChain(chainId);
          }
        } else if (result.slient) {
          await chainStore.tryUpdateChain(chainId);
        }
      })();

      prevChainId.current = currentChainId;
    }
  }, [chainStore, confirm, chainStore.isInitializing, currentChainId, intl]);

  useEffect(() => {
    setHasSend(false);
  }, [chainStore.current]);

  const renderAssetView = useMemo(() => {
    if (networkType === "evm") {
      console.log(chainId, "chain ID");
      if (chainId === ChainIdEnum.TRON) {
        return <AssetViewTron />;
      }
      return (
        <>
          <AssetViewEvm />
        </>
      );
    } else if (networkType === "bitcoin") {
      return (
        <>
          <AssetViewBtc />
        </>
      );
    }
    return (
      <>
        <AssetView />
      </>
    );
  }, [networkType, chainId]);

  // send page
  const handleCheckSendPage = () => {
    if (networkType === "evm") {
      if (chainId === TRON_ID) {
        return <SendTronEvmPage />;
      }
      return <SendEvmPage />;
    } else if (networkType === "bitcoin") {
      return <SendBtcPage />;
    }
    return <SendPage />;
  };
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <SelectChain showChainName canChangeChainInfo />
      <div style={{ height: 10 }} />
      <BIP44SelectModal />
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <div className={style.imageWrap}>
              <AccountView />
              {renderAssetView}
            </div>
            {networkType === "bitcoin" ? (
              <div style={{ marginTop: 24 }}>
                <TxButtonBtcView hasSend={hasSend} setHasSend={setHasSend} />
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
                    borderTop: "1px solid #E6E8EC",
                  }}
                />
                <LayoutHidePage hidePage={() => setHasSend(false)} />
                {handleCheckSendPage()}
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {networkType === "cosmos" && (
        <>
          <Card className={classnames(style.card, "shadow")}>
            <CardBody>
              <StakeView />
            </CardBody>
          </Card>
          <Card className={classnames(style.card, "shadow")}>
            <CardBody>
              <LinkStakeView />
            </CardBody>
          </Card>
        </>
      )}
    </HeaderLayout>
  );
});

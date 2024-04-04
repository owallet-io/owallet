import React, { FunctionComponent, useEffect } from "react";

import { observer } from "mobx-react-lite";

import styleDetailsTab from "../details-tab.module.scss";
import { FormattedMessage } from "react-intl";
import { Badge, Label } from "reactstrap";
import classnames from "classnames";
import TronWeb from "tronweb";
import { useStore } from "../../../stores";
import { ChainIdEnum } from "@owallet/common";
import { CoinPretty, Int } from "@owallet/unit";
import { CoinPrimitive } from "@owallet/stores";

export const TronDetailsTab: FunctionComponent<{
  dataSign;
  intl;
  txInfo;
  dataInfo: {
    estimateBandwidth: Int;
    estimateEnergy: Int;
    feeTrx: CoinPrimitive;
  };
}> = observer(({ dataSign, intl, txInfo, dataInfo }) => {
  const { chainStore, priceStore } = useStore();

  const feePretty = new CoinPretty(
    chainStore.current.feeCurrencies[0],
    new Int(dataInfo?.feeTrx?.amount)
  );
  return (
    <div className={styleDetailsTab.container}>
      <Label
        for="signing-messages"
        className="form-control-label"
        style={{ display: "flex" }}
      >
        <FormattedMessage id="sign.list.messages.label" />
        <Badge className={classnames("ml-2", styleDetailsTab.msgsBadge)}>
          {JSON.stringify(dataSign).length}
        </Badge>
      </Label>
      <div id="signing-messages" className={styleDetailsTab.msgContainer}>
        <React.Fragment>
          {dataSign?.currency && (
            <MsgRender
              icon={"fas fa-paper-plane"}
              title={intl.formatMessage({
                id: "sign.list.message.cosmos-sdk/MsgSend.title",
              })}
            >
              <FormattedMessage
                id="sign.list.message.cosmos-sdk/MsgSend.content"
                values={{
                  b: (...chunks: any[]) => <b>{chunks}</b>,
                  recipient: dataSign?.recipient,
                  amount:
                    dataSign?.amount + " " + dataSign?.currency?.coinDenom,
                }}
              />
            </MsgRender>
          )}
          {txInfo?.functionSelector && (
            <MsgRender icon={null} title={"Trigger Smart Contract"}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <span>Contract:</span>
                  <span>Method:</span>
                  <span>Resources:</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 2,
                    // justifyContent:"flex-end",
                    alignItems: "flex-end",
                  }}
                >
                  <a
                    rel="noreferrer"
                    href={`https://tronscan.org/#/contract/${txInfo?.address}`}
                    target="_blank"
                  >
                    {txInfo?.address}
                  </a>
                  <span>{txInfo?.functionSelector}</span>
                </div>
              </div>
            </MsgRender>
          )}
          {dataInfo?.estimateBandwidth?.lte(new Int(0)) &&
          dataInfo?.estimateEnergy?.lte(new Int(0)) ? null : (
            <div
              style={{
                justifyContent: "space-between",
                display: "flex",
              }}
            >
              <span>Resources:</span>
              <span>
                {dataInfo?.estimateBandwidth?.gt(new Int(0)) &&
                  `${dataInfo?.estimateBandwidth?.toString()} Bandwidth`}
                {dataInfo?.estimateEnergy?.gt(new Int(0)) &&
                  `+ ${dataInfo?.estimateEnergy?.toString()} Energy`}
              </span>
            </div>
          )}

          <div
            style={{
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <span>Fee:</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span>{feePretty?.trim(true)?.toString()}</span>
              <span>~{priceStore.calculatePrice(feePretty)?.toString()}</span>
            </div>
          </div>

          <hr />
        </React.Fragment>
      </div>
    </div>
  );
});

export const MsgRender: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      {icon && (
        <div className={styleDetailsTab.icon}>
          <div style={{ height: "2px" }} />
          <i className={icon} />
          <div style={{ flex: 1 }} />
        </div>
      )}
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};

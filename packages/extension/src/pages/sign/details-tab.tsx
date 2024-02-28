import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import styleDetailsTab from "./details-tab.module.scss";

import { renderAminoMessage } from "./amino";
import { Msg } from "@cosmjs/launchpad";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeButtons, MemoInput } from "../../components/form";
import {
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  SignDocHelper,
} from "@owallet/hooks";
import { useLanguage } from "@owallet/common";
import { Badge, Button, Label } from "reactstrap";
import { renderDirectMessage } from "./direct";
import classnames from "classnames";

export const DetailsTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  isInternal: boolean;

  preferNoSetFee: boolean;
  preferNoSetMemo: boolean;
}> = observer(
  ({
    signDocHelper,
    memoConfig,
    feeConfig,
    gasConfig,
    isInternal,
    preferNoSetFee,
    preferNoSetMemo,
  }) => {
    const { chainStore, priceStore, accountStore } = useStore();
    const intl = useIntl();
    const language = useLanguage();

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : "none";
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === "amino"
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];

    const renderedMsgs = (() => {
      if (mode === "amino") {
        return (msgs as readonly Msg[]).map((msg, i) => {
          const msgContent = renderAminoMessage(
            accountStore.getAccount(chainStore.current.chainId).msgOpts,
            msg,
            chainStore.current.currencies,
            intl
          );
          return (
            <React.Fragment key={i.toString()}>
              <MsgRender icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </MsgRender>
              <hr />
            </React.Fragment>
          );
        });
      } else if (mode === "direct") {
        return (msgs as any[]).map((msg, i) => {
          const msgContent = renderDirectMessage(
            msg,
            chainStore.current.currencies,
            intl
          );
          return (
            <React.Fragment key={i.toString()}>
              <MsgRender icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </MsgRender>
              <hr />
            </React.Fragment>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <div className={styleDetailsTab.container}>
        <Label
          for="signing-messages"
          className="form-control-label"
          style={{ display: "flex" }}
        >
          <FormattedMessage id="sign.list.messages.label" />
          <Badge className={classnames("ml-2", styleDetailsTab.msgsBadge)}>
            {msgs.length}
          </Badge>
        </Label>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs}
        </div>
        {!preferNoSetFee || !feeConfig.isManual ? (
          <FeeButtons
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            priceStore={priceStore}
            label={intl.formatMessage({ id: "sign.info.fee" })}
            gasLabel={intl.formatMessage({ id: "sign.info.gas" })}
          />
        ) : feeConfig.fee ? (
          <React.Fragment>
            <Label for="fee-price" className="form-control-label">
              <FormattedMessage id="sign.info.fee" />
            </Label>
            <div id="fee-price">
              <div className={styleDetailsTab.feePrice}>
                {feeConfig.fee.maxDecimals(6).trim(true).toString()}
                {priceStore.calculatePrice(
                  feeConfig.fee,
                  language.fiatCurrency
                ) ? (
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: "12px",
                      color: "#353945",
                    }}
                  >
                    {priceStore
                      .calculatePrice(feeConfig.fee, language.fiatCurrency)
                      ?.toString()}
                  </div>
                ) : null}
              </div>
            </div>
            {
              /*
                Even if the "preferNoSetFee" option is turned on, it provides the way to edit the fee to users.
                However, if the interaction is internal, you can be sure that the fee is set well inside OWallet.
                Therefore, the button is not shown in this case.
              */
              !isInternal ? (
                <div style={{ fontSize: "12px" }}>
                  <Button
                    color="link"
                    size="sm"
                    style={{
                      padding: 0,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      feeConfig.setFeeType("average");
                    }}
                  >
                    <FormattedMessage id="sign.info.fee.override" />
                  </Button>
                </div>
              ) : null
            }
          </React.Fragment>
        ) : null}
        {!preferNoSetMemo ? (
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "sign.info.memo" })}
            rows={1}
          />
        ) : (
          <React.Fragment>
            <Label for="memo" className="form-control-label">
              <FormattedMessage id="sign.info.memo" />
            </Label>
            <div
              id="memo"
              style={{
                marginBottom: "8px",
                color: memoConfig.memo ? "#353945" : "#AAAAAA",
                fontSize: 12,
              }}
            >
              <div>
                {memoConfig.memo
                  ? memoConfig.memo
                  : intl.formatMessage({ id: "sign.info.warning.empty-memo" })}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
);

export const MsgRender: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ height: "2px" }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};

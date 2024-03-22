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
import { ChainIdEnum } from "@owallet/common";
import { Badge, Button, Label } from "reactstrap";
import { renderDirectMessage } from "./direct";
import classnames from "classnames";
import { Bech32Address } from "@owallet/cosmos";
import Web3 from "web3";
export const DetailsTabEvm: FunctionComponent<{
  msgSign: any;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  isInternal: boolean;

  preferNoSetFee: boolean;
  preferNoSetMemo: boolean;
}> = observer(
  ({
    msgSign,
    memoConfig,
    feeConfig,
    gasConfig,
    isInternal,
    preferNoSetFee,
    preferNoSetMemo,
  }) => {
    console.log("🚀 ~ feeConfig:", feeConfig.fee);
    const { chainStore, priceStore, accountStore } = useStore();
    const intl = useIntl();
    const language = useLanguage();

    // const mode = signDocHelper.signDocWrapper
    //   ? signDocHelper.signDocWrapper.mode
    //   : "none";
    const msgs = msgSign ? msgSign : [];
    const amount = msgs?.value && Web3.utils.hexToNumberString(msgs?.value);
    const renderedMsgs = (() => {
      //   if (mode === "amino") {
      //     return (msgs as readonly Msg[]).map((msg, i) => {
      //       const msgContent = renderAminoMessage(
      //         accountStore.getAccount(chainStore.current.chainId).msgOpts,
      //         msg,
      //         chainStore.current.currencies,
      //         intl
      //       );
      //       return (
      //         <React.Fragment key={i.toString()}>
      //           <MsgRender icon={msgContent.icon} title={msgContent.title}>
      //             {msgContent.content}
      //           </MsgRender>
      //           <hr />
      //         </React.Fragment>
      //       );
      //     });
      //   } else if (mode === "direct") {
      //     return (msgs as any[]).map((msg, i) => {
      //       const msgContent = renderDirectMessage(
      //         msg,
      //         chainStore.current.currencies,
      //         intl
      //       );
      //       return (
      //         <React.Fragment key={i.toString()}>
      //           <MsgRender icon={msgContent.icon} title={msgContent.title}>
      //             {msgContent.content}
      //           </MsgRender>
      //           <hr />
      //         </React.Fragment>
      //       );
      //     });
      //   } else {
      //     return null;
      //   }
      if (msgs && amount && !msgs?.data) {
        return (
          <React.Fragment>
            {/* <MsgRender
            icon={'fas fa-paper-plane'}
            title={intl.formatMessage({
              id: 'sign.list.message.cosmos-sdk/MsgSend.title'
            })}
          >
            {JSON.stringify(msgs)}
          </MsgRender>
          <hr /> */}
            <MsgRender
              icon={"fas fa-paper-plane"}
              title={intl.formatMessage({
                id: "sign.list.message.cosmos-sdk/MsgSend.title",
              })}
            >
              Send{" "}
              <b>
                {/* {formatBalance({
                balance: Number(msgs?.amount),
                cryptoUnit: "BTC",
                coin: msgs?.selectedCrypto,
              }) || "0 BTC"} */}

                {`${
                  chainStore.current.chainId === ChainIdEnum.Oasis
                    ? Web3.utils.fromWei(amount, "gwei")
                    : Web3.utils.fromWei(amount, "ether")
                } ${chainStore.current.feeCurrencies[0].coinDenom}`}
              </b>{" "}
              to <b>{msgs?.to && Bech32Address.shortenAddress(msgs?.to, 20)}</b>{" "}
              on <b>{chainStore.current.chainName}</b>
            </MsgRender>

            <hr />
          </React.Fragment>
        );
      }

      return null;
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
            {msgSign && JSON.stringify(msgSign).length}
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
                {feeConfig.fee.maxDecimals(9).trim(true).toString()}
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
        {/* {!preferNoSetMemo ? (
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "sign.info.memo" })}
            rows={1}
          />
        ) : // <React.Fragment>
        //   <Label for="memo" className="form-control-label">
        //     <FormattedMessage id="sign.info.memo" />
        //   </Label>
        //   <div
        //     id="memo"
        //     style={{
        //       marginBottom: '8px',
        //       color: memoConfig.memo ? '#353945' : '#AAAAAA',
        //       fontSize: 12
        //     }}
        //   >
        //     <div>{memoConfig.memo ? memoConfig.memo : intl.formatMessage({ id: 'sign.info.warning.empty-memo' })}</div>
        //   </div>
        // </React.Fragment>
        null} */}
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

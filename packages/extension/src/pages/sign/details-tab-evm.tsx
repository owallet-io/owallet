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
import { Card } from "../../components/common/card";
import colors from "../../theme/colors";
import { Text } from "../../components/common/text";
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

    const renderMsg = (content) => {
      return (
        <div>
          <Card
            containerStyle={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors["neutral-surface-action"],
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              borderLeftWidth: 4,
              borderLeftStyle: "solid",
              borderColor: colors["primary-surface-default"],
              padding: 12,
              marginTop: 12,
            }}
          >
            {content}
          </Card>
        </div>
      );
    };

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
            {renderMsg(
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
                to{" "}
                <b>{msgs?.to && Bech32Address.shortenAddress(msgs?.to, 20)}</b>{" "}
                on <b>{chainStore.current.chainName}</b>
              </MsgRender>
            )}
            <hr />
          </React.Fragment>
        );
      }

      return null;
    })();

    const renderFees = () => {
      return (
        <div>
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
        </div>
      );
    };

    return (
      <div className={styleDetailsTab.container}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <img
            style={{ paddingRight: 4 }}
            src={require("../../public/assets/icon/tdesign_code-1.svg")}
          />
          <Text color={colors["neutral-text-body"]} weight="500">
            <FormattedMessage id="sign.list.messages.label" />:
          </Text>
          <div
            className="ml-2"
            style={{
              backgroundColor: colors["primary-surface-default"],
              padding: "0px 8px",
              borderRadius: 8,
            }}
          >
            <Text
              size={12}
              weight="600"
              color={colors["neutral-text-action-on-dark-bg"]}
            >
              {(msgSign && JSON.stringify(msgSign).length) ?? 0}
            </Text>
          </div>
        </div>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs}
        </div>
        {/* {renderFees()} */}
      </div>
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
            {msgSign && JSON.stringify(msgSign).length}
          </Badge>
        </Label>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs}
        </div>
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

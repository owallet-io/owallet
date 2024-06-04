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
import { Button, Label } from "reactstrap";
import { renderDirectMessage } from "./direct";
import { Text } from "../../components/common/text";
import colors from "../../theme/colors";
import { Card } from "../../components/common/card";

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
              overflow: "scroll",
            }}
          >
            {content}
            {/* <div
              style={{
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                className="logo"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 40,
                  backgroundColor: "red",
                }}
              />
              <div
                className="infos"
                style={{
                  flexDirection: "column",
                  display: "flex",
                  marginLeft: 8,
                }}
              >
                <Text size={16} weight="600">
                  Execute Wasm Contract
                </Text>
                <Text
                  size={14}
                  weight="500"
                  color={colors["neutral-text-body"]}
                >
                  orai051E23F...C52D28F
                </Text>
                <Text
                  size={14}
                  weight="500"
                  color={colors["neutral-text-body"]}
                >
                  Sending: 134.2345 ORAI
                </Text>
              </div>
            </div>
            <div className="img">
              <img
                style={{ paddingRight: 4 }}
                src={require("../../public/assets/icon/tdesign_chevron-down.svg")}
              />
            </div> */}
          </Card>
          {/* <div
          style={{
            backgroundColor: colors["neutral-surface-bg"],
            borderRadius: 12,
            marginTop: 8,
            padding: 8,
            overflow: "hidden"
          }}
        >
          {JSON.stringify({
            provide_liquidity: {
              assets: [
                {
                  info: {
                    token: {
                      contract_addr: "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh"
                    }
                  },
                  amount: "257853"
                },
                {
                  info: {
                    native_token: {
                      denom: "orai"
                    }
                  },
                  amount: "23191"
                }
              ],
              slippage_tolerance: "0.01"
            }
          })}
        </div> */}
        </div>
      );
    };

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
              {renderMsg(
                <MsgRender icon={msgContent.icon} title={msgContent.title}>
                  {msgContent.content}
                </MsgRender>
              )}

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
              {renderMsg(
                <MsgRender icon={msgContent.icon} title={msgContent.title}>
                  {msgContent.content}
                </MsgRender>
              )}

              <hr />
            </React.Fragment>
          );
        });
      } else {
        return null;
      }
    })();

    const renderFees = () => {
      return !preferNoSetFee || !feeConfig.isManual ? (
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
      ) : null;
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
              {msgs.length}
            </Text>
          </div>
        </div>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs}
        </div>
        {/* {renderFees()} */}
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

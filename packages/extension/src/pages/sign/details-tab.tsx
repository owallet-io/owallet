import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import styleDetailsTab from "./details-tab.module.scss";
import { renderAminoMessage } from "./amino";
import { Msg } from "@cosmjs/launchpad";
import { FormattedMessage, useIntl } from "react-intl";
import { MemoInput } from "../../components/form";
import {
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  SignDocHelper,
} from "@owallet/hooks";
import { EmbedChainInfos, toDisplay } from "@owallet/common";
import { Label } from "reactstrap";
import { renderDirectMessage } from "./direct";
import { Text } from "../../components/common/text";
import colors from "../../theme/colors";
import { Card } from "../../components/common/card";
import { Coin, CoinUtils } from "@owallet/unit";
import { clearDecimals } from "./messages";
import { Address } from "../../components/address";
import { CosmosRenderArgs } from "./components/render-cosmos-args";

export const DetailsTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  signDocJsonAll: any;

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
    signDocJsonAll,
  }) => {
    const { chainStore, accountStore } = useStore();
    const intl = useIntl();

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : "none";
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === "amino"
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];

    let chain;

    if (signDocJsonAll) {
      chain = chainStore.getChain(signDocJsonAll?.chainId);
      console.log("chain,", chain);
    }

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
              width: "100%",
            }}
          >
            {content}
          </Card>
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
            <div key={i.toString()}>
              {renderMsg(
                <MsgRender icon={msgContent.icon} title={msgContent.title}>
                  {msgContent.content}
                </MsgRender>
              )}

              <hr />
              <Card
                containerStyle={{
                  borderRadius: 12,
                  border: "1px solid" + colors["neutral-border-default"],
                  padding: 8,
                }}
              >
                <CosmosRenderArgs msg={msg} chain={chain} i={i} />
              </Card>
            </div>
          );
        });
      } else {
        return null;
      }
    })();

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
    <div style={{ width: "125%" }} className={styleDetailsTab.msg}>
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

import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";

import styleDetailsTab from "../details-tab.module.scss";
import { FormattedMessage } from "react-intl";
import { FormFeedback, FormText } from "reactstrap";
import { useStore } from "../../../stores";
import { CoinPretty, Int, IntPretty } from "@owallet/unit";
import { CoinPrimitive } from "@owallet/stores";
import {
  FeeTronConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@owallet/hooks";
import { Text } from "../../../components/common/text";
import colors from "../../../theme/colors";
import { Card } from "../../../components/common/card";

export const TronDetailsTab: FunctionComponent<{
  dataSign;
  intl;
  txInfo;
  dataInfo: {
    estimateBandwidth: Int;
    estimateEnergy: Int;
    feeTrx: CoinPrimitive;
  };
  feeConfig: FeeTronConfig;
}> = observer(({ dataSign, intl, txInfo, dataInfo, feeConfig }) => {
  const { chainStore, priceStore } = useStore();
  let isFeeLoading = false;
  const feePretty = new CoinPretty(
    chainStore.current.feeCurrencies[0],
    new Int(dataInfo?.feeTrx?.amount)
  );
  const error = feeConfig.getError();
  const errorText: string | undefined = (() => {
    if (error) {
      switch (error.constructor) {
        case InsufficientFeeError:
          return intl.formatMessage({
            id: "input.fee.error.insufficient",
          });
        case NotLoadedFeeError:
          isFeeLoading = true;
          return undefined;
        default:
          return (
            error.message ||
            intl.formatMessage({ id: "input.fee.error.unknown" })
          );
      }
    }
  })();

  const renderMsg = (content) => {
    return (
      <div>
        <Card
          containerStyle={{
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
        </Card>
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
          src={require("../../../public/assets/icon/tdesign_code-1.svg")}
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
            {JSON.stringify(dataSign).length}
          </Text>
        </div>
      </div>
      {/* <div id="signing-messages" className={styleDetailsTab.msgContainer}>
        {renderMsg(
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
            {isFeeLoading ? (
              <FormText>
                <i className="fa fa-spinner fa-spin fa-fw" />
              </FormText>
            ) : (
              <>
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
                        ` + ${new IntPretty(
                          dataInfo?.estimateEnergy?.toDec()
                        )?.toString()} Energy`}
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
                    <span>
                      ~{priceStore.calculatePrice(feePretty)?.toString()}
                    </span>
                  </div>
                </div>

                <hr />
                {errorText != null ? (
                  <FormFeedback style={{ display: "block", marginTop: -15 }}>
                    {errorText}
                  </FormFeedback>
                ) : null}
              </>
            )}
          </React.Fragment>
        )}
      </div> */}
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

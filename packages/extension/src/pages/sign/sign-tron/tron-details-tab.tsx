import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styleDetailsTab from "../details-tab.module.scss";
import { FormattedMessage } from "react-intl";
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
import { ChainIdEnum } from "@owallet/common";
import { Address } from "../../../components/address";
import { TronRenderParams } from "./components/render-params";

export const TronDetailsTab: FunctionComponent<{
  dataSign;
  intl;
  addressTronBase58;
  txInfo;
  dataInfo: {
    estimateBandwidth: Int;
    estimateEnergy: Int;
    feeTrx: CoinPrimitive;
  };
  feeConfig: FeeTronConfig;
}> = observer(
  ({ dataSign, intl, txInfo, dataInfo, feeConfig, addressTronBase58 }) => {
    const { chainStore, priceStore } = useStore();
    const chain = chainStore.getChain(ChainIdEnum.TRON);

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

    const renderInfo = (condition, label, leftContent) => {
      if (condition && condition !== "") {
        return (
          <div
            style={{
              marginTop: 14,
              height: "auto",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text weight="600">{label}</Text>
              <div
                style={{
                  alignItems: "flex-end",
                  maxWidth: "70%",
                  wordBreak: "break-all",
                }}
              >
                <div>{leftContent}</div>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: 1,
                backgroundColor: colors["neutral-border-default"],
              }}
            />
          </div>
        );
      }
    };

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

    const renderedMsgs = () => {
      return (
        <React.Fragment>
          {renderMsg(
            <div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                  style={{
                    marginRight: 4,
                    width: 44,
                    height: 44,
                    borderRadius: 44,
                    backgroundColor: colors["neutral-surface-card"],
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <img
                    style={{ width: 28, height: 28, borderRadius: 28 }}
                    src={chain?.stakeCurrency.coinImageUrl}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Text size={16} weight="600">
                    {(dataSign?.raw_data?.contract
                      ? dataSign?.raw_data?.contract?.[0].type?.replace(
                          /([a-z])([A-Z])/g,
                          "$1 $2"
                        )
                      : "Send"
                    ).toUpperCase()}
                  </Text>
                  <Text color={colors["neutral-text-body"]} weight="500">
                    <Address maxCharacters={16} lineBreakBeforePrefix={false}>
                      {addressTronBase58 ?? "..."}
                    </Address>
                  </Text>
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    };

    const renderTransactionFee = () => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          <Text weight="600">Transaction fee</Text>
          <div
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Text
                size={16}
                weight="600"
                color={colors["primary-text-action"]}
              >
                {feePretty?.trim(true)?.toString()}
              </Text>
            </div>
            <Text color={colors["neutral-text-body"]}>
              ≈{priceStore.calculatePrice(feePretty)?.toString()}
            </Text>
          </div>
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
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs()}
        </div>
        <Card
          containerStyle={{
            borderRadius: 12,
            border: "1px solid" + colors["neutral-border-default"],
            padding: 8,
          }}
        >
          {renderInfo(
            chain?.chainName,
            "Network",
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <img
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 28,
                  marginRight: 4,
                }}
                src={chain?.stakeCurrency.coinImageUrl}
              />
              <Text weight="600">{chain?.chainName}</Text>
            </div>
          )}
          {renderInfo(
            txInfo?.address,
            "From",
            <Address maxCharacters={16} lineBreakBeforePrefix={false}>
              {txInfo?.address ?? "..."}
            </Address>
          )}
          <TronRenderParams
            params={txInfo?.parameters}
            chain={chain}
            renderInfo={renderInfo}
            contractAddress={txInfo?.address}
          />

          {renderInfo(
            txInfo?.functionSelector,
            "Method",
            <Text>{txInfo?.functionSelector}</Text>
          )}
          {renderInfo(
            !dataInfo?.estimateBandwidth?.lte(new Int(0)),
            "Bandwidth",
            <Text>
              {dataInfo?.estimateBandwidth?.gt(new Int(0)) &&
                `${dataInfo?.estimateBandwidth?.toString()} Bandwidth`}
            </Text>
          )}
          {renderInfo(
            !dataInfo?.estimateEnergy?.lte(new Int(0)),
            "Energy",
            <Text>
              {dataInfo?.estimateEnergy?.gt(new Int(0)) &&
                `${new IntPretty(
                  dataInfo?.estimateEnergy?.toDec()
                )?.toString()} Energy`}
            </Text>
          )}
          {renderTransactionFee()}
        </Card>
        {errorText != null ? (
          <div
            style={{
              display: "flex",
              backgroundColor: colors["warning-surface-subtle"],
              borderRadius: 12,
              flexDirection: "row",
              marginTop: 12,
              padding: "8px",
            }}
          >
            <img
              style={{ paddingRight: 4 }}
              src={require("../../../public/assets/icon/tdesign_error-circle.svg")}
            />
            <Text size={12} weight="600">
              {errorText}
            </Text>
          </div>
        ) : null}
      </div>
    );
  }
);

export const MsgRender: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div style={{ width: "85%" }} className={styleDetailsTab.msg}>
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

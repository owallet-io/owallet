import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styleDetailsTab from "../details-tab.module.scss";
import { FormattedMessage } from "react-intl";
import { Bech32Address } from "@owallet/cosmos";
import { FeeButtons } from "../../../components/form";
import { CoinGeckoPriceStore } from "@owallet/stores";
import { FeeConfig, GasConfig } from "@owallet/hooks";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { useStore } from "../../../stores";
import { Card } from "../../../components/common/card";
import colors from "../../../theme/colors";
import { Text } from "../../../components/common/text";
import { Address } from "../../../components/address";
import { ChainIdEnum } from "@owallet/common";
import { shortenAddress } from "pages/sign/helpers/helpers";

export const SvmDetailsTab: FunctionComponent<{
  dataSign;
  priceStore: CoinGeckoPriceStore;
  feeConfig: FeeConfig;
  gasConfig: GasConfig;
  intl;
  signer: string;
  isNoSetFee: boolean;
  simulation: any;
}> = observer(
  ({
    dataSign,
    intl,
    feeConfig,
    isNoSetFee,
    gasConfig,
    priceStore,
    signer,
    simulation,
  }) => {
    const { chainStore } = useStore();

    const chain = chainStore.getChain(
      dataSign?.data?.chainId ?? chainStore.current.chainId
    );
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
    const fee =
      feeConfig.fee ||
      new CoinPretty(chainStore.current.stakeCurrency, new Dec(0));
    const renderTransactionFee = () => {
      return (
        <div>
          {simulation?.account_summary?.account_assets_diff.map(
            (item, index) => {
              return renderInfo(
                item.out ? "out" : item.in ? "in" : "",
                item.out ? "Send" : "Receive",
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
                      cursor: "pointer",
                    }}
                  >
                    <Text
                      size={16}
                      color={
                        item.out
                          ? colors["error-text-action"]
                          : item.in
                          ? colors["success-text-action"]
                          : null
                      }
                      weight="600"
                    >
                      {`${(item.out || item.in).value} ${
                        item.asset.symbol || "SOL"
                      }`}
                    </Text>
                  </div>
                  <Text
                    containerStyle={{
                      alignSelf: "flex-end",
                      display: "flex",
                    }}
                    color={colors["neutral-text-body"]}
                  >
                    ≈ ${((item.out || item.in).usd_price || 0).toFixed(2)}
                  </Text>
                </div>
              );
            }
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 14,
            }}
          >
            <div
              style={{
                flexDirection: "column",
                display: "flex",
              }}
            >
              <div>
                <Text weight="600">Fee</Text>
              </div>
              <div></div>
            </div>
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                alignItems: "flex-end",
                width: "65%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  cursor: "pointer",
                }}
              >
                <Text
                  size={16}
                  weight="600"
                  color={colors["primary-text-action"]}
                >
                  {`≈ ${fee?.maxDecimals(6)?.trim(true)?.toString()}`}
                </Text>
              </div>
              <Text
                containerStyle={{
                  alignSelf: "flex-end",
                  display: "flex",
                }}
                color={colors["neutral-text-body"]}
              >
                ≈ {priceStore.calculatePrice(fee)?.toString()}
              </Text>
            </div>
          </div>
        </div>
      );
    };

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
              <div>
                <Text
                  color={
                    condition === "out"
                      ? colors["error-text-action"]
                      : colors["success-text-action"]
                  }
                  size={16}
                  weight="600"
                >
                  {label}
                </Text>
              </div>
              <div
                style={{
                  alignItems: "flex-end",
                  maxWidth: "60%",
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
            src={require("assets/icon/tdesign_code-1.svg")}
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
              {dataSign?.data?.data?.tx.length ?? 1}
            </Text>
          </div>
        </div>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderMsg(
            <div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                  style={{
                    marginRight: 8,
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
                    {"Send".toUpperCase()}
                  </Text>
                  <Text color={colors["neutral-text-body"]} weight="500">
                    <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                      {signer ?? "..."}
                    </Address>
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
        <Card
          containerStyle={{
            borderRadius: 12,
            border: "1px solid" + colors["neutral-border-default"],
            padding: 8,
            marginTop: 12,
          }}
        >
          {renderTransactionFee()}
        </Card>
      </div>
    );
  }
);

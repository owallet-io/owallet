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

export const BtcDetailsTab: FunctionComponent<{
  dataSign;
  priceStore: CoinGeckoPriceStore;
  feeConfig: FeeConfig;
  gasConfig: GasConfig;
  intl;
  signer: string;
  isNoSetFee: boolean;
}> = observer(
  ({
    dataSign,
    intl,
    feeConfig,
    isNoSetFee,
    gasConfig,
    priceStore,
    signer,
  }) => {
    const msgs = dataSign?.data?.data?.msgs;
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );

    const { chainStore } = useStore();

    const chain = chainStore.getChain(
      dataSign?.data?.chainId ?? ChainIdEnum.Bitcoin
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

    const renderTransactionFee = () => {
      return (
        <div>
          {renderInfo(
            msgs?.amount,
            "Amount",
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
                <Text size={16} weight="600">
                  {new CoinPretty(
                    chainStore.current.stakeCurrency,
                    new Dec(msgs?.amount)
                  )
                    ?.trim(true)
                    ?.toString()}
                </Text>
              </div>
              <Text
                containerStyle={{
                  alignSelf: "flex-end",
                  display: "flex",
                }}
                color={colors["neutral-text-body"]}
              >
                ≈{" "}
                {new PricePretty(fiatCurrency, msgs?.amount || "0").toString()}
              </Text>
            </div>
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
                  {`≈ ${new CoinPretty(
                    chainStore.current.stakeCurrency,
                    new Dec(msgs?.totalFee)
                  )
                    ?.trim(true)
                    ?.toString()}`}
                </Text>
                {/* <img src={require("assets/icon/tdesign_chevron-down.svg")} /> */}
              </div>
              <Text
                containerStyle={{
                  alignSelf: "flex-end",
                  display: "flex",
                }}
                color={colors["neutral-text-body"]}
              >
                ≈{" "}
                {new PricePretty(
                  fiatCurrency,
                  msgs?.totalFee || "0"
                ).toString()}
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
                <Text weight="600">{label}</Text>
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

    const renderDestination = (from?, to?) => {
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
            <div
              style={{
                maxWidth: "50%",
              }}
            >
              <div style={{ flexDirection: "column", display: "flex" }}>
                <Text color={colors["neutral-text-body"]}>From</Text>
                {from ? (
                  <>
                    <Address
                      maxCharacters={6}
                      lineBreakBeforePrefix={false}
                      textDecor={"underline"}
                      textColor={colors["neutral-text-body"]}
                    >
                      {from}
                    </Address>
                  </>
                ) : (
                  <Text color={colors["neutral-text-body"]}>
                    {signer ?? "-"}
                  </Text>
                )}
              </div>
            </div>
            <img
              style={{ paddingRight: 4 }}
              src={require("assets/icon/tdesign_arrow-right.svg")}
            />
            <div
              style={{
                maxWidth: "50%",
              }}
            >
              <div style={{ flexDirection: "column", display: "flex" }}>
                <Text color={colors["neutral-text-body"]}>To</Text>
                {to ? (
                  <>
                    <Address
                      maxCharacters={6}
                      lineBreakBeforePrefix={false}
                      textDecor={"underline"}
                      textColor={colors["neutral-text-body"]}
                    >
                      {to}
                    </Address>
                  </>
                ) : (
                  <Text color={colors["neutral-text-body"]}>-</Text>
                )}
              </div>
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
              {(msgs && msgs.length) ?? 1}
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
          }}
        >
          {renderDestination(
            signer,
            msgs?.address && Bech32Address.shortenAddress(msgs?.address, 20)
          )}
        </Card>
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
        {/* <React.Fragment>
        <Label for="fee-price" className="form-control-label">
          <FormattedMessage id="sign.info.fee" />
        </Label>
        <div id="fee-price">
          <div className={styleDetailsTab.feePrice}>
            {`≈ ${new CoinPretty(chainStore.current.stakeCurrency, new Dec(msgs?.totalFee))?.trim(true)?.toString()}`}
          </div>
        </div>
      </React.Fragment> */}

        <React.Fragment>
          {/* <Label for="memo" className="form-control-label">
          Message
        </Label>
        <div
          id="memo"
          style={{
            marginBottom: "8px",
            color: msgs?.message ? "#353945" : "#AAAAAA",
            fontSize: 12
          }}
        >
          <div>{msgs?.message ? msgs?.message : intl.formatMessage({ id: "sign.info.warning.empty-memo" })}</div>
        </div> */}
          {!isNoSetFee && (
            <FeeButtons
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              priceStore={priceStore}
              label={intl.formatMessage({ id: "send.input.fee" })}
              feeSelectLabels={{
                low: intl.formatMessage({ id: "fee-buttons.select.slow" }),
                average: intl.formatMessage({
                  id: "fee-buttons.select.average",
                }),
                high: intl.formatMessage({ id: "fee-buttons.select.fast" }),
              }}
              isGasInput={false}
              gasLabel={intl.formatMessage({ id: "send.input.gas" })}
            />
          )}
        </React.Fragment>
      </div>
    );
  }
);

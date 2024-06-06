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
import { toDisplay, useLanguage } from "@owallet/common";
import { ChainIdEnum } from "@owallet/common";
import { Badge, Button, Label } from "reactstrap";
import { renderDirectMessage } from "./direct";
import classnames from "classnames";
import { Bech32Address } from "@owallet/cosmos";
import Web3 from "web3";
import { Card } from "../../components/common/card";
import colors from "../../theme/colors";
import { Text } from "../../components/common/text";
import { ethers } from "ethers";
import ERC20_ABI from "./abi/erc20-abi.json";
import GRAVITY_ABI from "./abi/gravity-abi.json";
import { Address } from "../../components/address";
export const DetailsTabEvm: FunctionComponent<{
  msgSign: any;
  dataSign: any;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  isInternal: boolean;

  preferNoSetFee: boolean;
  preferNoSetMemo: boolean;

  setOpenSetting: () => void;
}> = observer(
  ({
    msgSign,
    dataSign,
    feeConfig,
    gasConfig,
    isInternal,
    preferNoSetFee,
    setOpenSetting,
  }) => {
    const { chainStore, priceStore } = useStore();
    const intl = useIntl();
    const language = useLanguage();

    const chain = chainStore.getChain(dataSign?.data?.chainId);
    let decodedData;

    if (msgSign?.data) {
      const inputData = msgSign.data;
      // The encoded data
      try {
        const iface = new ethers.utils.Interface(ERC20_ABI);
        decodedData = iface.parseTransaction({ data: inputData });
        console.log("decodedData 1", decodedData);
      } catch (err) {
        const iface = new ethers.utils.Interface(GRAVITY_ABI);
        decodedData = iface.parseTransaction({ data: inputData });
        console.log("decodedData 2", decodedData);
      }
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
              overflow: "scroll",
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

      if (Object.keys(msgs).length > 0 && decodedData) {
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
                    {/* <Text>{chain.chainName}</Text> */}
                    <Text size={16} weight="600">
                      {decodedData.name
                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                        .toUpperCase()}
                    </Text>
                    <Text color={colors["neutral-text-body"]} weight="500">
                      <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                        {msgs?.from ?? "..."}
                      </Address>
                    </Text>
                    {/* <Text>To Contract: {decodedData.args?.[0]}</Text> */}
                    {/* <Text>To: {msgs.to}</Text> */}
                    {/* <Text>Method: {decodedData.name}</Text> */}
                    {/* <Text>Amount: {Number(decodedData.args._value)}</Text> */}
                    {/* <Text>Gas: {msgs.gas}</Text> */}
                  </div>
                </div>
              </div>
            )}
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

    const renderInfo = (condition, label, leftContent) => {
      if (condition && condition !== "" && condition !== null) {
        return (
          <div
            style={{
              marginTop: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
              onClick={() => {
                setOpenSetting();
              }}
            >
              <Text weight="600">{label}</Text>
              <div
                style={{
                  alignItems: "flex-end",
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

    const renderTransactionFee = () => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 14,
          }}
          onClick={() => {
            setOpenSetting();
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
                {feeConfig?.fee?.maxDecimals(8).trim(true).toString() || 0}
              </Text>
              <img
                src={require("../../public/assets/icon/tdesign_chevron-down.svg")}
              />
            </div>
            <Text color={colors["neutral-text-body"]}>
              ≈
              {priceStore
                .calculatePrice(feeConfig?.fee, language.fiatCurrency)
                ?.toString() || 0}
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
              {(msgs && msgs.length) ?? 1}
            </Text>
          </div>
        </div>
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          {renderedMsgs}
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
            msgs.to,
            "To",
            <Text color={colors["neutral-text-body"]}>
              {" "}
              <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                {msgs?.to}
              </Address>
            </Text>
          )}
          {decodedData ? (
            <>
              {renderInfo(
                decodedData.name,
                "Method",
                <Text>{decodedData.name}</Text>
              )}
              {renderInfo(
                decodedData.args?._value,
                "Amount",
                <Text>
                  {toDisplay(
                    Number(decodedData.args?._value).toString(),
                    chain.stakeCurrency.coinDecimals
                  )}
                </Text>
              )}
            </>
          ) : null}

          {renderInfo(msgs?.gas, "Gas", <Text>{Number(msgs?.gas)}</Text>)}
          {renderTransactionFee()}
        </Card>
        {/* {renderFees()} */}
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

import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import styleDetailsTab from "./details-tab.module.scss";
import { FormattedMessage, useIntl } from "react-intl";
import { IFeeConfig, IGasConfig, IMemoConfig } from "@owallet/hooks";
import { toDisplay, useLanguage } from "@owallet/common";
import { ChainIdEnum } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import Web3 from "web3";
import { Card } from "../../components/common/card";
import colors from "../../theme/colors";
import { Text } from "../../components/common/text";
import ERC20_ABI from "./abi/erc20-abi.json";
import BEP20_ABI from "./abi/bep20-abi.json";
import EVM_PROXY_ABI from "./abi/evm-proxy-abi.json";
import GRAVITY_ABI from "./abi/gravity-abi.json";
import PANCAKE_ABI from "./abi/pancake-abi.json";
import UNISWAP_ABI from "./abi/uniswap-abi.json";
import { Address } from "../../components/address";
import { tryAllABI } from "./helpers/helpers";
import { EVMRenderArgs } from "./components/render-evm-args";

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
    const [decodedData, setDecodedData] = useState(null);
    const [decodeWithABI, setDecodeWithABI] = useState(null);

    useEffect(() => {
      if (msgSign?.data) {
        const inputData = msgSign.data;
        console.log("inputData", inputData);

        try {
          const res = tryAllABI(inputData, [
            ERC20_ABI,
            EVM_PROXY_ABI,
            GRAVITY_ABI,
            PANCAKE_ABI,
            UNISWAP_ABI,
            BEP20_ABI,
          ]);
          setDecodeWithABI(res);

          if (!res.isRaw) {
            setDecodedData(res.data);
          }
        } catch (err) {
          console.log("err", err);
        }
      }
    }, [msgSign]);

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

      if (Object.keys(msgs).length > 0 && decodedData && !decodeWithABI.isRaw) {
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
                      {decodedData.name
                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                        .toUpperCase()}
                    </Text>
                    <Text color={colors["neutral-text-body"]} weight="500">
                      <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                        {msgs?.from ?? "..."}
                      </Address>
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      }

      return null;
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
              <div>
                <Text weight="600">{label}</Text>
              </div>
              <div
                style={{
                  alignItems: "flex-end",
                  maxWidth: "65%",
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

    const renderTransactionFee = () => {
      return (
        <div>
          {renderInfo(
            msgs?.value || decodedData?.args?._amount,
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
                  {msgs.value && !decodedData?.args?._amount
                    ? toDisplay(
                        msgs?.value?.toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                  {!msgs.value && decodedData?.args?._amount
                    ? toDisplay(
                        decodedData?.args?._amount.toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              </div>
              <Text
                containerStyle={{
                  alignSelf: "flex-end",
                  display: "flex",
                }}
                color={colors["neutral-text-body"]}
              >
                ≈
                {priceStore
                  .calculatePrice(feeConfig?.fee, language.fiatCurrency)
                  ?.toString() || 0}
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
            onClick={() => {
              setOpenSetting();
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
              <div>
                <Text color={colors["neutral-text-body"]}>
                  Gas: {Number(msgs?.gas)}
                </Text>
              </div>
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
                  {feeConfig?.fee?.maxDecimals(8).trim(true).toString() || 0}
                </Text>
                <img
                  src={require("../../public/assets/icon/tdesign_chevron-down.svg")}
                />
              </div>
              <Text
                containerStyle={{
                  alignSelf: "flex-end",
                  display: "flex",
                }}
                color={colors["neutral-text-body"]}
              >
                ≈
                {priceStore
                  .calculatePrice(feeConfig?.fee, language.fiatCurrency)
                  ?.toString() || 0}
              </Text>
            </div>
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
              <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                {msgs?.to}
              </Address>
            </Text>
          )}
          {renderInfo(
            msgs.from,
            "From",
            <Text color={colors["neutral-text-body"]}>
              <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                {msgs?.from}
              </Address>
            </Text>
          )}

          {renderInfo(
            msgs?.value,
            "Amount In",
            <Text>
              {msgs.value
                ? toDisplay(
                    msgs?.value?.toString(),
                    chain.stakeCurrency.coinDecimals
                  )
                : null}
            </Text>
          )}
          {decodedData ? (
            <>
              {renderInfo(
                decodedData.name,
                "Method",
                <Text>{decodedData.name}</Text>
              )}
              {decodedData?.args ? (
                <EVMRenderArgs
                  args={decodedData.args}
                  renderInfo={renderInfo}
                  chain={chain}
                />
              ) : null}
            </>
          ) : null}
        </Card>
        <Card
          containerStyle={{
            borderRadius: 12,
            border: "2px solid" + colors["neutral-text-title"],
            padding: 8,
            marginTop: 12,
          }}
        >
          {renderTransactionFee()}
        </Card>
        {feeConfig.getError() !== null && feeConfig.getError() !== undefined ? (
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
              src={require("../../public/assets/icon/tdesign_error-circle.svg")}
            />
            <Text size={12} weight="600">
              {feeConfig.getError().message}
            </Text>
          </div>
        ) : null}
        {gasConfig.getError() !== null && gasConfig.getError() !== undefined ? (
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
              src={require("../../public/assets/icon/tdesign_error-circle.svg")}
            />
            <Text size={12} weight="600">
              {gasConfig.getError().message}
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

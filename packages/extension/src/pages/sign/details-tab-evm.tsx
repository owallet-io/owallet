import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import styleDetailsTab from "./details-tab.module.scss";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeButtons } from "../../components/form";
import { IFeeConfig, IGasConfig, IMemoConfig } from "@owallet/hooks";
import { EmbedChainInfos, toDisplay, useLanguage } from "@owallet/common";
import { ChainIdEnum } from "@owallet/common";
import { Button, Label } from "reactstrap";
import { Bech32Address } from "@owallet/cosmos";
import Web3 from "web3";
import { Card } from "../../components/common/card";
import colors from "../../theme/colors";
import { Text } from "../../components/common/text";
import ERC20_ABI from "./abi/erc20-abi.json";
import EVM_PROXY_ABI from "./abi/evm-proxy-abi.json";
import GRAVITY_ABI from "./abi/gravity-abi.json";
import PANCAKE_ABI from "./abi/pancake-abi.json";
import { Address } from "../../components/address";
import {
  MapChainIdToNetwork,
  TX_HISTORY_ENDPOINT,
} from "../../helpers/constant";
import { decodeBase64 } from "../../helpers/helper";
import { LIST_ORAICHAIN_CONTRACT } from "./helpers/constant";
import {
  calculateJaccardIndex,
  findKeyBySimilarValue,
  tryAllABI,
} from "./helpers/helpers";

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

        try {
          const res = tryAllABI(inputData, [
            ERC20_ABI,
            EVM_PROXY_ABI,
            GRAVITY_ABI,
            PANCAKE_ABI,
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

    const [path, setPath] = useState<Array<any>>([]);
    const [tokenIn, setTokenIn] = useState<any>();
    const [tokenOut, setTokenOut] = useState<any>();
    const [toAddress, setToAddress] = useState<any>();
    const [toToken, setToToken] = useState<any>();

    const getTokenInfo = async (tokenContract) => {
      try {
        const response = await fetch(
          `${TX_HISTORY_ENDPOINT}/v1/token-info/${
            MapChainIdToNetwork[chain.chainId]
          }/${tokenContract}`
        );
        if (response.ok) {
          const jsonData = await response.json();

          return jsonData.data;
        } else {
          console.error("Error:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    console.log("decodedData", decodedData);

    useEffect(() => {
      const fetchTokenInfo = async () => {
        if (chain?.chainId && decodedData?.args?._tokenContract) {
          const token = await getTokenInfo(decodedData?.args?._tokenContract);
          setTokenIn(token);
        }
        if (chain?.chainId && decodedData?.args?._tokenIn) {
          const tokenIn = await getTokenInfo(decodedData?.args?._tokenIn);
          setTokenIn(tokenIn);
        }
        if (chain?.chainId && decodedData?.args?._tokenOut) {
          const tokenOut = await getTokenInfo(decodedData?.args?._tokenOut);
          setTokenOut(tokenOut);
        }
        if (chain?.chainId && decodedData?.args?.path?.length > 0) {
          let tmpPath = [];

          await Promise.all(
            decodedData.args.path.map(async (p) => {
              const token = await getTokenInfo(p);
              tmpPath.push(token);
            })
          );

          setPath(tmpPath);
        }
      };

      fetchTokenInfo();
    }, [chain?.chainId, decodedData?.args]);

    useEffect(() => {
      if (decodedData?.args?._destination) {
        const encodedData = decodedData?.args?._destination.split(":")?.[1];
        if (encodedData) {
          const decodedData = decodeBase64(encodedData);

          console.log("decodedData", decodedData);

          // Regular expression pattern to split the input string
          const pattern = /[\x00-\x1F]+/;

          const addressPattern = /[a-zA-Z0-9]+/g;

          // Split the input string using the pattern
          const array = decodedData.split(pattern).filter(Boolean);
          if (array.length < 1) {
            array.push(decodedData);
          }
          console.log("array", array);
          const des = array.shift();
          const token = array.pop();

          let tokenInfo;
          if (token) {
            EmbedChainInfos.find((chain) => {
              if (
                chain.stakeCurrency.coinMinimalDenom ===
                token.match(addressPattern).join("")
              ) {
                tokenInfo = chain.stakeCurrency;
                return;
              }
              if (
                chain.stakeCurrency.coinMinimalDenom ===
                token.match(addressPattern).join("")
              ) {
                tokenInfo = chain.stakeCurrency;
                return;
              }
              const foundCurrency = chain.currencies.find(
                (cr) =>
                  cr.coinMinimalDenom ===
                    token.match(addressPattern).join("") ||
                  //@ts-ignore
                  cr.contractAddress === token.match(addressPattern).join("") ||
                  calculateJaccardIndex(cr.coinMinimalDenom, token) > 0.85
              );

              if (foundCurrency) {
                tokenInfo = foundCurrency;
                return;
              }
            });
          }

          if (!tokenInfo) {
            const key = findKeyBySimilarValue(
              LIST_ORAICHAIN_CONTRACT,
              token.match(addressPattern).join("")
            ).split("_")?.[0];

            console.log("key", key);

            if (key)
              tokenInfo = {
                coinDenom: key,
                contractAddress: token.match(addressPattern).join(""),
              };
          }

          setToAddress(des.match(addressPattern).join(""));
          setToToken(tokenInfo);
        }
      }
    }, [decodedData?.args?._destination]);

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

    const renderToken = (token) => {
      return (
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
            src={token?.imgUrl}
          />
          <Text weight="600">{token?.abbr}</Text>
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
            msgs.from,
            "From",
            <Text color={colors["neutral-text-body"]}>
              {" "}
              <Address maxCharacters={18} lineBreakBeforePrefix={false}>
                {msgs?.from}
              </Address>
            </Text>
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
                "Approve amount",
                <Text>
                  {decodedData.args?._value
                    ? toDisplay(
                        Number(decodedData.args?._value).toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              )}
              {renderInfo(
                decodedData.args?._amount,
                "Amount",
                <Text>
                  {decodedData.args?._amount
                    ? toDisplay(
                        Number(decodedData.args?._amount).toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              )}
              {renderInfo(
                decodedData?.args?._amountIn,
                "Amount In",
                <Text>
                  {decodedData.args._amountIn
                    ? toDisplay(
                        Number(decodedData.args._amountIn).toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              )}
              {renderInfo(
                decodedData?.args?.amountIn,
                "Amount In",
                <Text>
                  {decodedData.args.amountIn
                    ? toDisplay(
                        Number(decodedData.args.amountIn).toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              )}
              {tokenIn
                ? renderInfo(tokenIn?.abbr, "Token", renderToken(tokenIn))
                : null}
              {renderInfo(
                decodedData.args?._amountOutMin,
                "Amount Out Min",
                <Text>
                  {decodedData.args?._amountOutMin
                    ? toDisplay(
                        Number(decodedData.args?._amountOutMin).toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              )}
              {renderInfo(
                decodedData.args?.amountOutMin,
                "Amount Out Min",
                <Text>
                  {decodedData.args?.amountOutMin
                    ? toDisplay(
                        Number(decodedData.args?.amountOutMin).toString(),
                        chain.stakeCurrency.coinDecimals
                      )
                    : null}
                </Text>
              )}
              {tokenOut
                ? renderInfo(tokenOut?.abbr, "Token Out", renderToken(tokenOut))
                : null}
              {renderInfo(
                toAddress,
                "To Address",
                <Text>{toAddress ? toAddress : null}</Text>
              )}
              {toToken
                ? renderInfo(
                    toToken.coinDenom,
                    "To Token",
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
                          backgroundColor: colors["neutral-surface-pressed"],
                        }}
                        src={toToken?.coinImageUrl}
                      />
                      <Text weight="600">{toToken?.coinDenom}</Text>
                    </div>
                  )
                : null}
              {path.length > 0
                ? renderInfo(
                    path.length,
                    "Path",
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {path
                        .sort((a, b) => {
                          const indexA = decodedData?.args?.path.indexOf(
                            a.contractAddress.toLowerCase()
                          );
                          const indexB = decodedData?.args?.path.indexOf(
                            b.contractAddress.toLowerCase()
                          );
                          return indexA - indexB;
                        })
                        .map((p, i) => {
                          if (i > 0) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <span>-</span>
                                {renderToken(p)}
                              </div>
                            );
                          }
                          return renderToken(p);
                        })}
                    </div>
                  )
                : null}
              {renderInfo(
                decodedData.args?._destination,
                "Destination",
                <Text>
                  {decodedData.args?._destination
                    ? decodedData.args?._destination.split(":")?.[0]
                    : null}
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

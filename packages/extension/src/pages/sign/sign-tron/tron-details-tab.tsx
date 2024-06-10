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
import {
  ChainIdEnum,
  EmbedChainInfos,
  getBase58Address,
  toDisplay,
} from "@owallet/common";
import { Address } from "../../../components/address";
import {
  calculateJaccardIndex,
  findKeyBySimilarValue,
  getTokenInfo,
} from "../helpers/helpers";
import { LIST_ORAICHAIN_CONTRACT } from "../helpers/constant";
import { decodeBase64 } from "../../../helpers/helper";

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
    const [params, setParams] = useState(null);

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

    useEffect(() => {
      setParams(txInfo?.parameters);
    }, [txInfo?.parameters]);

    const [token, setToken] = useState(null);

    const findToken = async (contractAddress) => {
      if (chain?.chainId && contractAddress) {
        try {
          const token = await getTokenInfo(contractAddress, chain.chainId);
          setToken(token.data);
        } catch (err) {
          EmbedChainInfos.map((c) => {
            if (c.chainId === chain.chainId) {
              //@ts-ignore
              const token = c.currencies.find(
                (cu) => cu.contractAddress === contractAddress
              );
              console.log("toennn 3", token);

              setToken(token);
            }
          });
        }
      }
    };

    useEffect(() => {
      params?.map((p) => {
        if (p.type === "address") {
          console.log("p", p.value);

          findToken(getBase58Address(p.value));
        }
      });
    }, [params]);

    useEffect(() => {
      const fetchToken = async () => {
        if (chain?.chainId && txInfo?.address) {
          const token = await getTokenInfo(txInfo?.address, chain.chainId);
          setToken(token.data);
        }
      };
      fetchToken();
    }, [chain?.chainId, txInfo?.address]);

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

    const convertDestinationToken = (value) => {
      if (value) {
        const encodedData = value.split(":")?.[1];
        if (encodedData) {
          const decodedData = decodeBase64(encodedData);

          if (decodedData) {
            // Regular expression pattern to split the input string
            const pattern = /[\x00-\x1F]+/;

            const addressPattern = /[a-zA-Z0-9]+/g;

            // Split the input string using the pattern
            const array = decodedData.split(pattern).filter(Boolean);
            if (array.length < 1) {
              array.push(decodedData);
            }
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
                    cr.contractAddress ===
                      token.match(addressPattern).join("") ||
                    calculateJaccardIndex(cr.coinMinimalDenom, token) > 0.85
                );

                if (foundCurrency) {
                  tokenInfo = foundCurrency;
                  return;
                }
              });
            }

            if (!tokenInfo && token) {
              const key = findKeyBySimilarValue(
                LIST_ORAICHAIN_CONTRACT,
                token.match(addressPattern).join("")
              )?.split("_")?.[0];

              if (key)
                tokenInfo = {
                  coinDenom: key,
                  contractAddress: token.match(addressPattern).join(""),
                };
            }

            return {
              des: des.match(addressPattern).join(""),
              tokenInfo: tokenInfo,
            };
          }
        }
      }
    };

    const renderParams = (params) => {
      return (
        <div>
          {params?.map((p) => {
            if (p.type === "uint256") {
              return renderInfo(
                p?.value,
                "Amount In",
                <Text>
                  {toDisplay(
                    (p?.value).toString(),
                    chain.stakeCurrency.coinDecimals
                  )}
                </Text>
              );
            }
            if (p.type === "address") {
              let toContractComponent;
              toContractComponent = renderInfo(
                p?.value,
                "To Contract",
                <Text>{getBase58Address(p?.value)}</Text>
              );

              return <>{toContractComponent}</>;
              // return renderInfo(p?.value, "To Contract", <Text>{getBase58Address(p?.value)}</Text>);
            }

            if (p.type === "string") {
              const { des, tokenInfo } = convertDestinationToken(p?.value);
              let desComponent, tokenComponent;

              console.log("tokenInfo", tokenInfo);

              if (des) {
                desComponent = renderInfo(
                  des,
                  "Destination Address",
                  <Text>{des ? des : null}</Text>
                );
              }
              if (tokenInfo) {
                tokenComponent = renderInfo(
                  tokenInfo.coinDenom,
                  "Token Out",
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
                      src={tokenInfo?.coinImageUrl}
                    />
                    <Text weight="600">{tokenInfo?.coinDenom}</Text>
                  </div>
                );
              }

              return (
                <>
                  {desComponent}
                  {tokenComponent}
                </>
              );
            }
          })}
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
          {renderParams(txInfo?.parameters)}
          {token
            ? renderInfo(
                token,
                "Token In",
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
                    src={token?.imgUrl ?? token?.coinImageUrl}
                  />
                  <Text weight="600">{token?.abbr ?? token?.coinDenom}</Text>
                </div>
              )
            : null}
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
  }
);

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

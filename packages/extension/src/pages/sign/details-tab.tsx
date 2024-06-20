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
import { EmbedChainInfos, toDisplay, useLanguage } from "@owallet/common";
import { Button, Label } from "reactstrap";
import { renderDirectMessage } from "./direct";
import { Text } from "../../components/common/text";
import colors from "../../theme/colors";
import { Card } from "../../components/common/card";
import { Coin, CoinUtils } from "@owallet/unit";
import { clearDecimals } from "./messages";

import { getBase58Address } from "@owallet/common";
import { Address } from "../../components/address";

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

    const renderToken = (token) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            margin: "4px 0",
          }}
        >
          {token?.imgUrl || token?.coinImageUrl ? (
            <img
              style={{
                width: 14,
                height: 14,
                borderRadius: 28,
                marginRight: 4,
              }}
              src={token?.imgUrl ?? token?.coinImageUrl}
            />
          ) : null}
          <Text weight="600">{token?.abbr ?? token?.coinDenom}</Text>
        </div>
      );
    };

    const renderPath = (fromToken?, toToken?, fromContract?, toContract?) => {
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
                <Text color={colors["neutral-text-body"]}>Pay token</Text>
                {fromToken ? (
                  <>
                    {renderToken(fromToken)}
                    <Address
                      maxCharacters={8}
                      lineBreakBeforePrefix={false}
                      textDecor={"underline"}
                      textColor={colors["neutral-text-body"]}
                    >
                      {fromToken.contractAddress}
                    </Address>
                  </>
                ) : (
                  <Text color={colors["neutral-text-body"]}>-</Text>
                )}

                {fromContract ? (
                  <Address
                    maxCharacters={8}
                    lineBreakBeforePrefix={false}
                    textDecor={"underline"}
                    textColor={colors["neutral-text-body"]}
                  >
                    {fromContract}
                  </Address>
                ) : null}
              </div>
            </div>
            <img
              style={{ paddingRight: 4 }}
              src={require("../../public/assets/icon/tdesign_arrow-right.svg")}
            />
            <div
              style={{
                maxWidth: "50%",
              }}
            >
              <div style={{ flexDirection: "column", display: "flex" }}>
                <Text color={colors["neutral-text-body"]}>Receive token</Text>
                {toToken ? (
                  <>
                    {renderToken(toToken)}
                    <Address
                      maxCharacters={8}
                      lineBreakBeforePrefix={false}
                      textDecor={"underline"}
                      textColor={colors["neutral-text-body"]}
                    >
                      {toToken.contractAddress}
                    </Address>
                  </>
                ) : (
                  <Text color={colors["neutral-text-body"]}>-</Text>
                )}

                {toContract ? (
                  <Address
                    maxCharacters={8}
                    lineBreakBeforePrefix={false}
                    textDecor={"underline"}
                    textColor={colors["neutral-text-body"]}
                  >
                    {toContract}
                  </Address>
                ) : null}
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
          console.log("msg", i, msg);

          const msgContent = renderDirectMessage(
            msg,
            chainStore.current.currencies,
            intl
          );

          const txInfo = { ...msg };
          const decodeMsg = msg.unpacked?.msg
            ? JSON.parse(Buffer.from(msg.unpacked.msg).toString())
            : msg.unpacked;
          txInfo.decode = decodeMsg;

          // decode decodeMsg.send.msg
          const extraInfo = decodeMsg?.send?.msg
            ? atob(decodeMsg.send?.msg)
            : null;
          txInfo.extraInfo = extraInfo ? JSON.parse(extraInfo) : null;
          // get contract address from it
          // using default/get_v1_token_info_by_addresses to get token info by contract address
          // Note: Tron Contract address(remote_denom) need to be converted to base58
          // const evm = "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C";
          // const b58 = getBase58Address(evm);
          // console.log("b58===", b58);
          // infact we do have those infomation from config
          let minimum_receive;
          let ask_asset_info;
          if (txInfo.extraInfo && txInfo.extraInfo.execute_swap_operations) {
            const lastDes =
              txInfo.extraInfo.execute_swap_operations.operations.pop();
            const ask_asset =
              lastDes.orai_swap?.ask_asset_info?.token?.contract_addr;
            minimum_receive =
              txInfo.extraInfo.execute_swap_operations.minimum_receive;
            if (ask_asset) {
              EmbedChainInfos.find((c) => {
                if (c.chainId === chain?.chainId) {
                  ask_asset_info = c.currencies.find(
                    //@ts-ignore
                    (cur) => cur.contractAddress === ask_asset
                  );
                }
              });
            }
          }

          console.log("ask_asset_info", i, ask_asset_info);

          let contractInfo;
          let receiveToken;

          // get info of token from this extra info
          if (txInfo?.unpacked?.contract) {
            EmbedChainInfos.find((c) => {
              if (c.chainId === chain?.chainId) {
                contractInfo = c.currencies.find(
                  //@ts-ignore
                  (cur) => cur.contractAddress === txInfo?.unpacked?.contract
                );
              }
            });
          }

          if (txInfo?.unpacked?.token) {
            const coin = new Coin(
              txInfo?.unpacked?.token.denom,
              txInfo?.unpacked?.token.amount
            );
            const parsed = CoinUtils.parseDecAndDenomFromCoin(
              chainStore.current.currencies,
              coin
            );

            receiveToken = {
              amount: clearDecimals(parsed.amount),
              denom: parsed.denom,
            };
          }
          const sent: { amount: string; denom: string }[] = [];

          if (txInfo?.unpacked?.funds) {
            for (const coinPrimitive of txInfo?.unpacked?.funds) {
              const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);

              const parsed = CoinUtils.parseDecAndDenomFromCoin(
                chainStore.current.currencies,
                coin
              );

              sent.push({
                amount: clearDecimals(parsed.amount),
                denom: parsed.denom,
              });
              console.log("receiveToken parsed", i, parsed);
            }
          }

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
                {i === 0
                  ? renderInfo(
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
                          src={
                            chain?.chainSymbolImageUrl ??
                            chain?.stakeCurrency.coinImageUrl
                          }
                        />
                        <Text weight="600">{chain?.chainName}</Text>
                      </div>
                    )
                  : null}
                {renderInfo(
                  txInfo?.unpacked?.sender,
                  "Sender",
                  <Text color={colors["neutral-text-body"]}>
                    {txInfo?.unpacked?.sender}
                  </Text>
                )}
                {contractInfo && ask_asset_info
                  ? renderPath(contractInfo, ask_asset_info)
                  : null}
                {txInfo?.extraInfo?.remote_address &&
                !txInfo?.decode?.send?.contract
                  ? renderPath(
                      null,
                      null,
                      txInfo?.unpacked?.contract,
                      txInfo?.extraInfo?.remote_address
                    )
                  : null}
                {txInfo?.decode?.send?.contract && !ask_asset_info
                  ? renderPath(
                      contractInfo,
                      null,
                      null,
                      txInfo?.decode?.send?.contract
                    )
                  : null}
                {txInfo?.decode?.transfer_to_remote
                  ? renderPath(
                      null,
                      null,
                      txInfo?.unpacked?.contract,
                      txInfo?.decode?.transfer_to_remote.remote_address
                    )
                  : null}
                {sent.map((s) => {
                  return renderInfo(
                    s,
                    "Fund",
                    <Text color={colors["neutral-text-body"]}>
                      {s.amount} {s.denom}
                    </Text>
                  );
                })}
                {renderInfo(
                  contractInfo,
                  "Amount",
                  <Text color={colors["neutral-text-body"]}>
                    {toDisplay(
                      txInfo?.decode?.send?.amount,
                      contractInfo?.coinDecimals
                    )}{" "}
                    {contractInfo?.coinDenom}
                  </Text>
                )}
                {renderInfo(
                  ask_asset_info && minimum_receive,
                  "Min. Receive",
                  <Text color={colors["neutral-text-body"]}>
                    {toDisplay(minimum_receive, ask_asset_info?.coinDecimals)}{" "}
                    {ask_asset_info?.coinDenom}
                  </Text>
                )}
                {renderInfo(
                  txInfo?.unpacked?.receiver,
                  "Receiver",
                  <Text color={colors["neutral-text-body"]}>
                    {txInfo?.unpacked?.receiver}
                  </Text>
                )}
                {renderInfo(
                  receiveToken,
                  "Transfer",
                  <Text color={colors["neutral-text-body"]}>
                    {receiveToken?.amount} {receiveToken?.denom}
                  </Text>
                )}
                {/* {renderInfo(
                  txInfo?.unpacked?.contract,
                  "Contract",
                  <Text color={colors["neutral-text-body"]}>{txInfo?.unpacked?.contract}</Text>
                )} */}

                {/* <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    cursor: "pointer",
                    justifyContent: "flex-end",
                    width: "100%",
                    marginTop: 8
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      cursor: "pointer"
                    }}
                    onClick={() => {}}
                  >
                    <Text size={14} weight="500">
                      {`View more`}
                    </Text>
                    <img src={require("../../public/assets/icon/tdesign_chevron-down.svg")} />
                  </div>
                </div> */}
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

import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AppChainInfo } from "@owallet/types";
import { EmbedChainInfos, toDisplay } from "@owallet/common";
import { Text } from "../../../components/common/text";
import colors from "../../../theme/colors";
import { Address } from "../../../components/address";
import { Coin, CoinUtils } from "@owallet/unit";
import { clearDecimals } from "../messages";
import { useStore } from "../../../stores";

export const CosmosRenderArgs: FunctionComponent<{
  msg: any;
  i: Number;
  chain: AppChainInfo;
}> = observer(({ msg, chain, i }) => {
  const { chainStore } = useStore();

  const [isMore, setIsMore] = useState(true);

  const txInfo = { ...msg };
  const decodeMsg = msg.unpacked?.msg
    ? JSON.parse(Buffer.from(msg.unpacked.msg).toString())
    : msg.unpacked;
  txInfo.decode = decodeMsg;

  // decode decodeMsg.send.msg
  const extraInfo = decodeMsg?.send?.msg ? atob(decodeMsg.send?.msg) : null;
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
  if (
    (txInfo?.extraInfo && txInfo.extraInfo?.execute_swap_operations) ||
    (txInfo?.decode && txInfo.decode?.execute_swap_operations)
  ) {
    const execute_swap_operations =
      txInfo?.extraInfo?.execute_swap_operations ||
      txInfo?.decode?.execute_swap_operations;
    const lastDes = execute_swap_operations.operations.pop();

    const ask_asset = lastDes.orai_swap?.ask_asset_info?.token?.contract_addr;
    minimum_receive = execute_swap_operations.minimum_receive;
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

  console.log("txInfo", i, txInfo);

  console.log("ask_asset_info", i, ask_asset_info);

  let contractInfo;
  let receiveToken;
  let tokenOut;
  let tokensIn;

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

  useEffect(() => {});
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

    if (parsed.currency) {
      tokenOut = parsed.currency;
    } else {
      tokenOut = { amount: clearDecimals(parsed.amount), denom: parsed.denom };
    }
  }
  const sent: { amount: string; denom: string }[] = [];

  if (txInfo?.unpacked?.funds) {
    const tokens = [];
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
      if (parsed.currency) {
        tokens.push(parsed.currency);
      } else {
        tokens.push({
          amount: clearDecimals(parsed.amount),
          denom: parsed.denom,
        });
      }
    }
    tokensIn = tokens;
  }

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
        <Text weight="600">
          {token?.abbr ?? token?.coinDenom ?? token.denom}
        </Text>
      </div>
    );
  };

  const renderPath = (fromToken?, toToken?, fromContract?, toContract?) => {
    const inToken = fromToken || contractInfo || null;
    const outToken = toToken || tokenOut || ask_asset_info || null;
    const inContract =
      fromContract ||
      inToken?.contractAddress ||
      txInfo?.unpacked?.contract ||
      "-";
    const outContract =
      toContract ||
      outToken?.contractAddress ||
      txInfo?.extraInfo?.remote_address ||
      txInfo?.decode?.send?.contract ||
      txInfo?.decode?.transfer_to_remote?.remote_address ||
      "-";

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
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                wordBreak: "break-word",
              }}
            >
              <Text color={colors["neutral-text-body"]}>Pay token</Text>
              {inToken ? (
                <>{renderToken(inToken)}</>
              ) : (
                <Text color={colors["neutral-text-body"]}>-</Text>
              )}

              {inContract && inContract !== "-" ? (
                <Address
                  maxCharacters={8}
                  lineBreakBeforePrefix={false}
                  textDecor={"underline"}
                  textColor={colors["neutral-text-body"]}
                >
                  {inContract}
                </Address>
              ) : (
                <Text color={colors["neutral-text-body"]}>-</Text>
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
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                wordBreak: "break-word",
              }}
            >
              <Text color={colors["neutral-text-body"]}>Receive token</Text>
              {outToken ? (
                <>{renderToken(outToken)}</>
              ) : (
                <Text color={colors["neutral-text-body"]}>-</Text>
              )}

              {outContract && outContract !== "-" ? (
                <Address
                  maxCharacters={8}
                  lineBreakBeforePrefix={false}
                  textDecor={"underline"}
                  textColor={colors["neutral-text-body"]}
                >
                  {outContract}
                </Address>
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

  return (
    <div>
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
      {tokensIn?.length > 0
        ? tokensIn.map((token, index) => renderPath(token))
        : renderPath()}

      {isMore ? null : (
        <>
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
        </>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          cursor: "pointer",
          justifyContent: "flex-end",
          width: "100%",
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
          }}
          onClick={() => {
            setIsMore((prevState) => {
              return prevState ? false : true;
            });
          }}
        >
          <Text size={14} weight="500">
            {`View ${isMore ? "more" : "less"}`}
          </Text>
          {isMore ? (
            <img src={require("assets/icon/tdesign_chevron-down.svg")} />
          ) : (
            <img src={require("assets/icon/tdesign_chevron-up.svg")} />
          )}
        </div>
      </div>
    </div>
  );
});

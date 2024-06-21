import React, { FunctionComponent, useState } from "react";
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
  if (txInfo.extraInfo && txInfo.extraInfo.execute_swap_operations) {
    const lastDes = txInfo.extraInfo.execute_swap_operations.operations.pop();
    const ask_asset = lastDes.orai_swap?.ask_asset_info?.token?.contract_addr;
    minimum_receive = txInfo.extraInfo.execute_swap_operations.minimum_receive;
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
            src={require("../../../public/assets/icon/tdesign_arrow-right.svg")}
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
      {contractInfo && ask_asset_info
        ? renderPath(contractInfo, ask_asset_info)
        : null}
      {txInfo?.extraInfo?.remote_address && !txInfo?.decode?.send?.contract
        ? renderPath(
            null,
            null,
            txInfo?.unpacked?.contract,
            txInfo?.extraInfo?.remote_address
          )
        : null}
      {txInfo?.decode?.send?.contract && !ask_asset_info
        ? renderPath(contractInfo, null, null, txInfo?.decode?.send?.contract)
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
          {toDisplay(txInfo?.decode?.send?.amount, contractInfo?.coinDecimals)}{" "}
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
      {isMore ? null : <></>}

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
            <img
              src={require("../../../public/assets/icon/tdesign_chevron-down.svg")}
            />
          ) : (
            <img
              src={require("../../../public/assets/icon/tdesign_chevron-up.svg")}
            />
          )}
        </div>
      </div>
    </div>
  );
});

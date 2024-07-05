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

const styles = {
  container: {
    marginTop: 14,
    height: "auto",
    alignItems: "center",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  column: {
    flexDirection: "column",
    display: "flex",
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: colors["neutral-border-default"],
  },
  image: {
    width: 14,
    height: 14,
    borderRadius: 28,
    marginRight: 4,
  },
  viewMore: {
    display: "flex",
    flexDirection: "row",
    cursor: "pointer",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: 8,
  },
};

const TokenRenderer = React.memo(({ token }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      margin: "4px 0",
    }}
  >
    {(token?.imgUrl || token?.coinImageUrl) && (
      <img style={styles.image} src={token?.imgUrl ?? token?.coinImageUrl} />
    )}
    <Text weight="600">{token?.abbr ?? token?.coinDenom ?? token.denom}</Text>
  </div>
));

const TokenPathRenderer = React.memo(
  ({ inToken, outToken, inContract, outContract }) => (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={{ maxWidth: "50%" }}>
          <div style={styles.column}>
            <Text color={colors["neutral-text-body"]}>Pay token</Text>
            {inToken ? (
              <TokenRenderer token={inToken} />
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
        <div style={{ maxWidth: "50%" }}>
          <div style={styles.column}>
            <Text color={colors["neutral-text-body"]}>Receive token</Text>
            {outToken ? (
              <TokenRenderer token={outToken} />
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
      <div style={styles.separator} />
    </div>
  )
);

const InfoRenderer = React.memo(
  ({ condition, label, leftContent }) =>
    condition && (
      <div style={styles.container}>
        <div style={styles.row}>
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
            {leftContent}
          </div>
        </div>
        <div style={styles.separator} />
      </div>
    )
);

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
  const extraInfo = decodeMsg?.send?.msg ? atob(decodeMsg.send?.msg) : null;
  txInfo.extraInfo = extraInfo ? JSON.parse(extraInfo) : null;

  let minimum_receive;
  let ask_asset_info;
  if (
    txInfo.extraInfo?.execute_swap_operations ||
    txInfo.decode?.execute_swap_operations
  ) {
    const execute_swap_operations =
      txInfo.extraInfo?.execute_swap_operations ||
      txInfo.decode?.execute_swap_operations;
    const lastDes = execute_swap_operations.operations.pop();
    const ask_asset = lastDes.orai_swap?.ask_asset_info?.token?.contract_addr;
    minimum_receive = execute_swap_operations.minimum_receive;

    if (ask_asset) {
      EmbedChainInfos.forEach((c) => {
        if (c.chainId === chain?.chainId) {
          ask_asset_info = c.currencies.find(
            (cur) => cur.contractAddress === ask_asset
          );
        }
      });
    }
  }

  let contractInfo;
  let receiveToken;
  let tokenOut;
  let tokensIn = [];

  if (txInfo.unpacked?.contract) {
    EmbedChainInfos.forEach((c) => {
      if (c.chainId === chain?.chainId) {
        contractInfo = c.currencies.find(
          (cur) => cur.contractAddress === txInfo.unpacked.contract
        );
      }
    });
  }

  if (txInfo.unpacked?.token) {
    const coin = new Coin(
      txInfo.unpacked.token.denom,
      txInfo.unpacked.token.amount
    );
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      chainStore.current.currencies,
      coin
    );
    receiveToken = {
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    };
    tokenOut = parsed.currency || {
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    };
  }

  if (txInfo.unpacked?.funds) {
    txInfo.unpacked.funds.forEach((coinPrimitive) => {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
      const parsed = CoinUtils.parseDecAndDenomFromCoin(
        chainStore.current.currencies,
        coin
      );
      tokensIn.push(
        parsed.currency || {
          amount: clearDecimals(parsed.amount),
          denom: parsed.denom,
        }
      );
    });
  }

  return (
    <div>
      {i === 0 && (
        <InfoRenderer
          condition={chain?.chainName}
          label="Network"
          leftContent={
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <img
                style={styles.image}
                src={
                  chain?.chainSymbolImageUrl ??
                  chain?.stakeCurrency.coinImageUrl
                }
              />
              <Text weight="600">{chain?.chainName}</Text>
            </div>
          }
        />
      )}
      <InfoRenderer
        condition={txInfo.unpacked?.sender}
        label="Sender"
        leftContent={
          <Text color={colors["neutral-text-body"]}>
            {txInfo.unpacked.sender}
          </Text>
        }
      />
      {tokensIn.length > 0 ? (
        tokensIn.map((token, index) => (
          <TokenPathRenderer key={index} inToken={token} />
        ))
      ) : (
        <TokenPathRenderer />
      )}
      {!isMore && (
        <>
          {txInfo.unpacked?.funds.map((fund, index) => (
            <InfoRenderer
              key={index}
              condition={fund}
              label="Fund"
              leftContent={
                <Text color={colors["neutral-text-body"]}>
                  {fund.amount} {fund.denom}
                </Text>
              }
            />
          ))}
          <InfoRenderer
            condition={contractInfo}
            label="Amount"
            leftContent={
              <Text color={colors["neutral-text-body"]}>
                {toDisplay(
                  txInfo.decode?.send?.amount,
                  contractInfo?.coinDecimals
                )}{" "}
                {contractInfo?.coinDenom}
              </Text>
            }
          />
          <InfoRenderer
            condition={ask_asset_info && minimum_receive}
            label="Min. Receive"
            leftContent={
              <Text color={colors["neutral-text-body"]}>
                {toDisplay(minimum_receive, ask_asset_info?.coinDecimals)}{" "}
                {ask_asset_info?.coinDenom}
              </Text>
            }
          />
          <InfoRenderer
            condition={txInfo.unpacked?.receiver}
            label="Receiver"
            leftContent={
              <Text color={colors["neutral-text-body"]}>
                {txInfo.unpacked.receiver}
              </Text>
            }
          />
          <InfoRenderer
            condition={receiveToken}
            label="Transfer"
            leftContent={
              <Text color={colors["neutral-text-body"]}>
                {receiveToken.amount} {receiveToken.denom}
              </Text>
            }
          />
        </>
      )}
      <div style={styles.viewMore}>
        <div
          style={{ display: "flex", flexDirection: "row", cursor: "pointer" }}
          onClick={() => setIsMore(!isMore)}
        >
          <Text size={14} weight="500">{`View ${
            isMore ? "more" : "less"
          }`}</Text>
          <img
            src={require(`assets/icon/tdesign_chevron-${
              isMore ? "down" : "up"
            }.svg`)}
          />
        </div>
      </div>
    </div>
  );
});

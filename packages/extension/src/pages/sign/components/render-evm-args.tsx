import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { decodeBase64, numberWithCommas } from "../../../helpers/helper";
import { AppChainInfo } from "@owallet/types";
import { LIST_ORAICHAIN_CONTRACT } from "../helpers/constant";
import {
  calculateJaccardIndex,
  findKeyBySimilarValue,
  getTokenInfo,
} from "../helpers/helpers";
import { EmbedChainInfos, toDisplay } from "@owallet/common";
import { Text } from "../../../components/common/text";
import colors from "../../../theme/colors";
import { Address } from "../../../components/address";
import { isEmpty } from "lodash";

export const EVMRenderArgs: FunctionComponent<{
  msgs: any;
  args: any;
  chain: AppChainInfo;
  renderInfo: (condition, label, content) => ReactElement;
}> = observer(({ args, msgs, chain, renderInfo }) => {
  const [toAddress, setToAddress] = useState<string>();
  const [toToken, setToToken] = useState<any>();
  const [path, setPath] = useState<Array<any>>([]);
  const [tokenIn, setTokenIn] = useState<any>();
  const [tokenOut, setTokenOut] = useState<any>();
  const [isMore, setIsMore] = useState(true);

  const renderToken = (token) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {token?.imgUrl || token?.coinImageUrl ? (
          <img
            style={{
              width: 14,
              height: 14,
              borderRadius: 28,
              marginRight: 4,
              backgroundColor: colors["neutral-surface-action2"],
            }}
            src={token?.imgUrl ?? token?.coinImageUrl}
          />
        ) : null}
        <Text weight="600">{token?.abbr ?? token?.coinDenom}</Text>
      </div>
    );
  };

  const renderPath = (fromToken?, desToken?, fromContract?, toContract?) => {
    const amountIn =
      args?._amount || args?._amountIn || args?.amountIn || msgs?.value || "-";
    const amountOut = args?.amountOutMin || args?._amountOutMin || "-";
    const inToken = fromToken || tokenIn;
    const outToken = desToken || tokenOut || toToken;

    console.log(inToken, "inToken");

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
                <>
                  {renderToken(inToken)}

                  <Address
                    maxCharacters={6}
                    lineBreakBeforePrefix={false}
                    textDecor={"underline"}
                    textColor={colors["neutral-text-body"]}
                  >
                    {inToken.contractAddress}
                  </Address>
                </>
              ) : (
                <Text color={colors["neutral-text-body"]}>-</Text>
              )}

              {amountIn && amountIn !== "-" ? (
                <Text weight="600" color={colors["neutral-text-title"]}>
                  {numberWithCommas(
                    toDisplay(
                      amountIn.toString(),
                      inToken?.decimal ?? chain.stakeCurrency.coinDecimals
                    )
                  )}{" "}
                </Text>
              ) : (
                <Text color={colors["neutral-text-body"]}>-</Text>
              )}

              {fromContract ? (
                <Address
                  maxCharacters={6}
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
                <>
                  {renderToken(outToken)}

                  <Address
                    maxCharacters={8}
                    lineBreakBeforePrefix={false}
                    textDecor={"underline"}
                    textColor={colors["neutral-text-body"]}
                  >
                    {outToken.contractAddress}
                  </Address>
                </>
              ) : (
                <Text color={colors["neutral-text-body"]}>-</Text>
              )}

              {amountOut && amountOut !== "-" ? (
                <Text weight="600" color={colors["neutral-text-title"]}>
                  {numberWithCommas(
                    toDisplay(
                      amountOut.toString(),
                      outToken?.decimal ?? chain.stakeCurrency.coinDecimals
                    )
                  )}{" "}
                </Text>
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

  const renderArgPath = () => {
    if (args?.path?.length >= 2 && path.length > 0) {
      const fromToken = path.find((p) => {
        return p.contractAddress.toUpperCase() === args.path[0].toUpperCase();
      });
      const toToken = path.find((p) => {
        return p.contractAddress.toUpperCase() === args.path[1].toUpperCase();
      });

      return renderPath(fromToken, toToken);
    }
  };

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (chain?.chainId && args?._tokenContract) {
        const token = await getTokenInfo(args?._tokenContract, chain.chainId);
        setTokenIn(token.data);
      }
      if (chain?.chainId && args?._tokenIn) {
        const tokenIn = await getTokenInfo(args?._tokenIn, chain.chainId);
        setTokenIn(tokenIn.data);
      }
      if (chain?.chainId && args?._tokenOut) {
        const tokenOut = await getTokenInfo(args?._tokenOut, chain.chainId);
        setTokenOut(tokenOut.data);
      }
      if (chain?.chainId && args?.path?.length > 0) {
        let tmpPath = [];

        await Promise.all(
          args.path.map(async (p) => {
            const token = await getTokenInfo(p, chain.chainId);
            tmpPath.push(token.data);
          })
        );

        setPath(tmpPath);
      }
    };

    fetchTokenInfo();
  }, [chain?.chainId, args]);

  const getInfoFromDecodedData = (decodedData) => {
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
              cr.coinMinimalDenom === token.match(addressPattern).join("") ||
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

      setToAddress(des.match(addressPattern).join(""));
      setToToken(tokenInfo);
    }
  };

  useEffect(() => {
    if (args?._destination) {
      const encodedData = args?._destination.split(":")?.[1];
      if (encodedData) {
        const decodedData = decodeBase64(encodedData);
        console.log("decodedData", decodedData);
        getInfoFromDecodedData(decodedData);
      }
    }
  }, [args?._destination]);

  return (
    <div>
      {renderInfo(
        args?._value,
        "Approve amount",
        <Text>
          {args?._value
            ? numberWithCommas(
                toDisplay(
                  (args?._value).toString(),
                  chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}

      {isEmpty(path) ? renderPath() : null}
      {path?.length > 0 ? renderArgPath() : null}
      {isMore ? null : (
        <>
          {renderInfo(
            msgs?.to,
            "Interact contract",
            <Address
              maxCharacters={6}
              lineBreakBeforePrefix={false}
              textDecor={"underline"}
              textColor={colors["neutral-text-body"]}
            >
              {msgs?.to ?? "-"}
            </Address>
          )}
          {renderInfo(
            args?._destination,
            "Bridge channel",
            <Text>
              {args?._destination ? args?._destination.split(":")?.[0] : null}
            </Text>
          )}

          {renderInfo(
            toAddress,
            "To Address",
            <Address
              maxCharacters={6}
              lineBreakBeforePrefix={false}
              textDecor={"underline"}
              textColor={colors["neutral-text-body"]}
            >
              {toAddress ?? null}
            </Address>
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

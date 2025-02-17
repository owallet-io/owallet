import React, { FunctionComponent, useEffect, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { Body3, H5, H3 } from "../../../../components/typography";
import { useTheme } from "styled-components";
import { SenderConfig, useCoinGeckoPrices } from "@owallet/hooks";
import axios from "axios";
import { XAxis } from "components/axis";
import { camelCaseToTitleCase, mapToDynamicAction } from "./helper";
import { shortenWord, toDisplay } from "@owallet/common";

const ParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  return parsedMsg.action === "transfer_to_remote" ? (
    <BridgeParsedItem parsedMsg={parsedMsg} theme={theme} />
  ) : (
    <SwapParsedItem parsedMsg={parsedMsg} theme={theme} />
  );
};
const BridgeParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response.data);
  }, [parsedMsg]);

  if (!data) return null;
  console.log("data 2222", data);

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];
  const feeAmount =
    tokenPrice * toDisplay(data?.feeAmount, data?.tokenInfo.decimals);
  const outValue =
    tokenPrice * toDisplay(data?.bridgeAmount, data?.tokenInfo.decimals);

  return (
    <>
      <Gutter size="2px" />
      <Body3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        <Gutter size="1rem" />
        <XAxis
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: ColorPalette["black-50"],
            }}
          >
            Action
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
                color:
                  theme.mode === "light"
                    ? ColorPalette["platinum-200"]
                    : ColorPalette["platinum-200"],
              }}
            >
              {parsedMsg.action}
            </span>
          </div>
        </XAxis>
        <Gutter size="1.25rem" />
        <div
          style={{
            width: "100%",
            height: 0.75,
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["gray-90"]
                : ColorPalette["gray-90"],
          }}
        />
        <Gutter size="1rem" />
        <XAxis
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: ColorPalette["black-50"],
            }}
          >
            Token Info
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
                color:
                  theme.mode === "light"
                    ? ColorPalette["green-350"]
                    : ColorPalette["green-350"],
              }}
            >
              +{toDisplay(data.bridgeAmount, data.tokenInfo.decimals)}{" "}
              {data.tokenInfo.denom.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 12,
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-80"]
                    : ColorPalette["gray-80"],
                paddingTop: 4,
              }}
            >
              ≈ ${!outValue ? "0" : outValue.toFixed(4).toString()}
            </span>
          </div>
        </XAxis>
        <Gutter size="0.25rem" />
        <div
          style={{
            width: "100%",
            height: 0.75,
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["gray-90"]
                : ColorPalette["gray-90"],
          }}
        />
        <Gutter size="1rem" />
        <XAxis
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: ColorPalette["black-50"],
            }}
          >
            Bridge Fee
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
                color:
                  theme.mode === "light"
                    ? ColorPalette["red-350"]
                    : ColorPalette["red-350"],
              }}
            >
              -{toDisplay(data.feeAmount, data.tokenInfo.decimals)}{" "}
              {data.tokenInfo.denom.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 12,
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-80"]
                    : ColorPalette["gray-80"],
                paddingTop: 4,
              }}
            >
              ≈ ${!outValue ? "0" : outValue.toFixed(4).toString()}
            </span>
          </div>
        </XAxis>
        {/* {Object.keys(parsedMsg).map((key) => {
          return (
            <XAxis
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Subtitle3>{camelCaseToTitleCase(key)}</Subtitle3>
              <Subtitle4>
                {typeof parsedMsg[key] === "object"
                  ? shortenWord(
                      JSON.stringify(mapToDynamicAction(parsedMsg[key]))
                    )
                  : shortenWord(parsedMsg[key])}
              </Subtitle4>
            </XAxis>
          );
        })} */}
      </Body3>
    </>
  );
};

const SwapParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const mockInAsset = {
    denom: "ORAI",
    coinMinimalDenom: "orai",
    coinGeckoId: "oraichain-token",
    decimals: 6,
  };

  const mockOutAsset = {
    denom: "USDC",
    coinMinimalDenom: "cw20:orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh:USDT",
    coinGeckoId: "usd-coin",
    decimals: 6,
  };

  const { data: prices } = useCoinGeckoPrices();
  const inPrice = prices?.[mockInAsset.coinGeckoId];
  const inValue = inPrice * toDisplay(parsedMsg.inAmount, mockInAsset.decimals);
  const outPrice = prices?.[mockOutAsset.coinGeckoId];
  const outValue =
    outPrice * toDisplay(parsedMsg.outAmount, mockOutAsset.decimals);

  console.log("parsedMsg", parsedMsg);

  return (
    <>
      <Gutter size="2px" />
      <Body3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        <Gutter size="1rem" />
        <XAxis
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: ColorPalette["black-50"],
            }}
          >
            {mockInAsset.denom}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
                color:
                  theme.mode === "light"
                    ? ColorPalette["red-350"]
                    : ColorPalette["red-350"],
              }}
            >
              -{toDisplay(parsedMsg.inAmount, mockInAsset.decimals)}{" "}
              {mockInAsset.denom}
            </span>
            <span
              style={{
                fontSize: 12,
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-80"]
                    : ColorPalette["gray-80"],
                paddingTop: 4,
              }}
            >
              ≈ ${!outValue ? "0" : outValue.toFixed(4).toString()}
            </span>
          </div>
        </XAxis>
        <Gutter size="0.25rem" />
        <div
          style={{
            width: "100%",
            height: 0.75,
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["gray-90"]
                : ColorPalette["gray-90"],
          }}
        />
        <Gutter size="1rem" />
        <XAxis
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: ColorPalette["black-50"],
            }}
          >
            {mockOutAsset.denom}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
                color:
                  theme.mode === "light"
                    ? ColorPalette["green-350"]
                    : ColorPalette["green-350"],
              }}
            >
              +{toDisplay(parsedMsg.outAmount, mockOutAsset.decimals)}{" "}
              {mockOutAsset.denom}
            </span>
            <span
              style={{
                fontSize: 12,
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-80"]
                    : ColorPalette["gray-80"],
                paddingTop: 4,
              }}
            >
              ≈ ${!inValue ? "0" : inValue.toFixed(4).toString()}
            </span>
          </div>
        </XAxis>
        <Gutter size="0.25rem" />
        <div
          style={{
            width: "100%",
            height: 0.75,
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["gray-90"]
                : ColorPalette["gray-90"],
          }}
        />
      </Body3>
    </>
  );
};

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
  msg?: any;
  senderConfig?: SenderConfig;
}> = ({ title, content, msg, senderConfig }) => {
  const rpc = "http://192.168.10.71:9000/";
  const theme = useTheme();
  const [parsedMsg, setParsedMsg] = React.useState<any>();

  const parseMsg = async (msg: any) => {
    const client = axios.create({ baseURL: rpc });
    const { data } = await client.put(
      `multichain-parser/v1/parser/parse`,
      {
        typeUrl: msg.typeUrl,
        value: Buffer.from(msg.value).toString("base64"),
        sender: senderConfig.sender,
      },
      {}
    );
    console.log("data parseMsg", data);
    if (data) {
      setParsedMsg(data.data);
    }
    return data;
  };

  useEffect(() => {
    if (msg) {
      console.log("full msg", {
        typeUrl: msg.typeUrl,
        value: Buffer.from(msg.value).toString("base64"),
        sender: senderConfig.sender,
      });

      parseMsg(msg);
    }
  }, []);

  return (
    <Box padding="1rem">
      <Columns sum={1}>
        {/* <Box
          width="2.5rem"
          minWidth="2.5rem"
          height="2.5rem"
          alignX="center"
          alignY="center"
        >
          {icon}
        </Box> */}

        <Gutter size="0.5rem" />

        <Column weight={1}>
          <Box minHeight="3rem" alignY="center">
            <H5
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-10"]
              }
            >
              {title}
            </H5>

            {parsedMsg ? (
              <ParsedItem theme={theme} parsedMsg={parsedMsg} />
            ) : (
              <>
                <Gutter size="2px" />
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {content}
                </Body3>
              </>
            )}
          </Box>
        </Column>
      </Columns>
    </Box>
  );
};

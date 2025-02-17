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
import { snakeToTitle, mapToDynamicAction } from "./helper";
import { toDisplay } from "@owallet/common";

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

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];
  const feeAmount =
    tokenPrice * toDisplay(data?.feeAmount, data?.tokenInfo.decimal);
  const outValue =
    tokenPrice * toDisplay(data?.bridgeAmount, data?.tokenInfo.decimal);

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
          <div>
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
              {snakeToTitle(parsedMsg.action)}
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
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <img
              style={{ width: 24, height: 24, borderRadius: 30 }}
              src={data?.tokenInfo?.icon}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: ColorPalette["black-50"],
                marginLeft: 4,
              }}
            >
              {data?.tokenInfo?.name.toUpperCase()}
            </span>
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
              +
              {data.tokenInfo
                ? toDisplay(data.bridgeAmount, data.tokenInfo.decimal)
                : data.bridgeAmount}{" "}
              {data?.tokenInfo?.denom?.toUpperCase()}
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
              -{toDisplay(data.feeAmount, data.tokenInfo.decimal)}{" "}
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
              ≈ ${!feeAmount ? "0" : feeAmount.toFixed(4).toString()}
            </span>
          </div>
        </XAxis>
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
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              From
            </span>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <img
                style={{ width: 24, height: 24, borderRadius: 30 }}
                src={data?.fromChain?.image}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: ColorPalette["black-50"],
                  marginLeft: 4,
                }}
              >
                {data?.fromChain?.name}
              </span>
            </div>
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
              }}
            >
              To
            </span>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <img
                style={{ width: 24, height: 24, borderRadius: 30 }}
                src={data?.toChain?.image}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: ColorPalette["black-50"],
                  marginLeft: 4,
                }}
              >
                {data?.toChain?.name}
              </span>
            </div>
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
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response);
  }, [parsedMsg]);

  if (!data) return null;

  let inPrice,
    inValue,
    outPrice,
    outValue = 0;

  if (data?.inAssetInfo) {
    inPrice = prices?.[data.inAssetInfo?.coinGeckoId];
    inValue = inPrice * toDisplay(data.inAmount, data.inAssetInfo?.decimal);
  }

  if (data?.outAssetInfo) {
    outPrice = prices?.[data.outAssetInfo?.coinGeckoId];
    outValue = outPrice * toDisplay(data.outAmount, data.outAssetInfo?.decimal);
  }

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
          <div>
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
              {snakeToTitle(parsedMsg.action)}
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
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <img
              style={{ width: 24, height: 24, borderRadius: 30 }}
              src={data?.inAssetInfo?.icon}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: ColorPalette["black-50"],
                marginLeft: 4,
              }}
            >
              {data?.inAssetInfo?.name.toUpperCase()}
            </span>
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
              -
              {data.inAssetInfo
                ? toDisplay(data.inAmount, data.inAssetInfo.decimal)
                : data.inAmount}{" "}
              {data?.inAssetInfo?.name?.toUpperCase()}
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
        <Gutter size="1rem" />
        <XAxis
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <img
              style={{ width: 24, height: 24, borderRadius: 30 }}
              src={data?.outAssetInfo?.icon}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: ColorPalette["black-50"],
                marginLeft: 4,
              }}
            >
              {data?.outAssetInfo?.name.toUpperCase()}
            </span>
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
              +
              {data.outAssetInfo
                ? toDisplay(data.outAmount, data.outAssetInfo.decimal)
                : data.outAmount}{" "}
              {data?.outAssetInfo?.name?.toUpperCase()}
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
    console.log("Parsed data", data);
    if (data) {
      setParsedMsg(data.data);
    }
    return data;
  };

  useEffect(() => {
    if (msg) {
      console.log("Full msg", {
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

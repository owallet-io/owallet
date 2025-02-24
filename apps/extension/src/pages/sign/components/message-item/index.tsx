import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { Body3, H5 } from "../../../../components/typography";
import { useTheme } from "styled-components";
import { SenderConfig, useCoinGeckoPrices } from "@owallet/hooks";
import axios from "axios";
import { XAxis } from "components/axis";
import { snakeToTitle, isUint8Array } from "./helper";
import { shortenWord, toDisplay } from "@owallet/common";
import { TX_PARSER } from "./constant";

const ParsedComponent: FunctionComponent<{
  label?: string;
  value?: string;
  left?: ReactElement;
  right?: ReactElement;
  color?: string;
}> = ({ label, value, left, right, color }) => {
  return (
    <>
      <Gutter size="0.75rem" />
      <XAxis
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {left ? (
          left
        ) : (
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: ColorPalette["black-50"],
            }}
          >
            {label}
          </div>
        )}

        <div>
          {right ? (
            right
          ) : (
            <span
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: color ?? ColorPalette["platinum-200"],
              }}
            >
              {value}
            </span>
          )}
        </div>
      </XAxis>
      <Gutter size="0.75rem" />
      <div
        style={{
          width: "100%",
          height: 0.75,
          backgroundColor: ColorPalette["gray-90"],
        }}
      />
    </>
  );
};

const ParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  switch (parsedMsg.action.action) {
    case "bridge":
      return <BridgeParsedItem parsedMsg={parsedMsg} theme={theme} />;
    case "swap":
      return <SwapParsedItem parsedMsg={parsedMsg} theme={theme} />;
    case "staking":
      if (parsedMsg.response.action === "bond") {
        return <StakingParsedItem parsedMsg={parsedMsg} theme={theme} />;
      } else {
        return <div />;
      }

    case "open_position":
      return <OpenPositionParsedItem parsedMsg={parsedMsg} theme={theme} />;
    case "deposit_margin":
      return <DepositPositionParsedItem parsedMsg={parsedMsg} theme={theme} />;
    case "future":
      if (parsedMsg.action.msgAction === "update_tp_sl") {
        return <UpdatePositionParsedItem parsedMsg={parsedMsg} theme={theme} />;
      } else if (parsedMsg.action.msgAction === "close_position") {
        return <ClosePositionParsedItem parsedMsg={parsedMsg} theme={theme} />;
      } else {
        return <div />;
      }

    default:
      return <div />;
  }
};

const OpenPositionParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response);
  }, [parsedMsg]);

  if (!data) return null;

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];

  const marginValue =
    tokenPrice * toDisplay(data?.marginAmount, data?.tokenInfo.decimal);

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
        <ParsedComponent label="Action" value={snakeToTitle(data.action)} />

        <ParsedComponent
          left={
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
          }
          right={
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
                {data.tokenInfo
                  ? toDisplay(data.marginAmount, data.tokenInfo.decimal)
                  : data.marginAmount}{" "}
                {data?.tokenInfo?.name?.toUpperCase()}
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
                ≈ ${!marginValue ? "0" : marginValue.toFixed(4).toString()}
              </span>
            </div>
          }
        />

        <ParsedComponent
          label="Pair"
          value={data.pair}
          color={ColorPalette["gray-600"]}
        />
        <ParsedComponent
          label="Side"
          value={data.positionSide.toUpperCase()}
          color={
            data.positionSide === "Buy"
              ? ColorPalette["green-350"]
              : ColorPalette["red-350"]
          }
        />
        <ParsedComponent
          label="Entry Price"
          value={
            data.tokenInfo
              ? toDisplay(data.entryPrice, data.tokenInfo.decimal)
              : data.entryPrice
          }
          color={
            data.positionSide === "Buy"
              ? ColorPalette["green-350"]
              : ColorPalette["red-350"]
          }
        />
        <ParsedComponent
          label="Leverage"
          value={
            data.tokenInfo
              ? toDisplay(data.leverage, data.tokenInfo.decimal) + "x"
              : data.leverage + "x"
          }
          color={ColorPalette["gray-600"]}
        />
        <ParsedComponent
          label="Stop loss"
          value={
            data.tokenInfo
              ? toDisplay(data.sl, data.tokenInfo.decimal)
              : data.sl
          }
          color={ColorPalette["red-350"]}
        />
        <ParsedComponent
          label="Take profit"
          value={
            data.tokenInfo
              ? toDisplay(data.tp, data.tokenInfo.decimal)
              : data.sl
          }
          color={ColorPalette["green-350"]}
        />
        <Gutter size="0.25rem" />
      </Body3>
    </>
  );
};

const ClosePositionParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response);
  }, [parsedMsg]);

  if (!data) return null;

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];

  const marginValue =
    tokenPrice * toDisplay(data?.marginAmount, data?.tokenInfo.decimal);

  const withdrawValue =
    tokenPrice * toDisplay(data?.withdrawAmount, data?.tokenInfo.decimal);

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
        <ParsedComponent label="Action" value={snakeToTitle(data.action)} />

        <ParsedComponent
          label="Pair"
          value={data.pair}
          color={ColorPalette["gray-600"]}
        />
        <ParsedComponent
          label="Margin Amount"
          right={
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
                {data.tokenInfo
                  ? toDisplay(data.marginAmount, data.tokenInfo.decimal)
                  : data.marginAmount}{" "}
                {data?.tokenInfo?.name?.toUpperCase()}
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
                ≈ ${!marginValue ? "0" : marginValue.toFixed(4).toString()}
              </span>
            </div>
          }
        />
        <ParsedComponent
          label="PnL"
          value={
            data.tokenInfo
              ? toDisplay(data.pnl, data.tokenInfo.decimal)
              : data.pnl
          }
          color={
            data.pnl > 0 ? ColorPalette["green-350"] : ColorPalette["red-350"]
          }
        />
        <ParsedComponent
          label="Withdraw Amount"
          right={
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
                    data.withdrawAmount >= data.marginAmount
                      ? ColorPalette["green-350"]
                      : ColorPalette["red-350"],
                }}
              >
                {data.tokenInfo
                  ? toDisplay(data.withdrawAmount, data.tokenInfo.decimal)
                  : data.withdrawAmount}{" "}
                {data?.tokenInfo?.name?.toUpperCase()}
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
                ≈ ${!withdrawValue ? "0" : withdrawValue.toFixed(4).toString()}
              </span>
            </div>
          }
        />

        <ParsedComponent
          label="Leverage"
          value={
            data.tokenInfo
              ? toDisplay(data.leverage, data.tokenInfo.decimal) + "x"
              : data.leverage + "x"
          }
          color={ColorPalette["gray-600"]}
        />
        <ParsedComponent
          label="Side"
          value={data.positionSide.toUpperCase()}
          color={
            data.positionSide === "Buy"
              ? ColorPalette["green-350"]
              : ColorPalette["red-350"]
          }
        />

        <Gutter size="0.25rem" />
      </Body3>
    </>
  );
};

const UpdatePositionParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response);
  }, [parsedMsg]);

  if (!data) return null;

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];

  const depositValue =
    tokenPrice * toDisplay(data?.depositAmount, data?.tokenInfo.decimal);

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
        <ParsedComponent label="Action" value={snakeToTitle(data.action)} />
        <ParsedComponent
          label="Position Id"
          value={data.positionId.toUpperCase()}
        />
        <ParsedComponent
          label="Pair"
          value={data.pair}
          color={ColorPalette["gray-600"]}
        />

        <ParsedComponent
          label="Stop loss"
          value={
            data.tokenInfo
              ? toDisplay(data.stopLoss, data.tokenInfo.decimal)
              : data.stopLoss
          }
          color={ColorPalette["red-350"]}
        />

        <ParsedComponent
          label="Take profit"
          value={
            data.tokenInfo
              ? toDisplay(data.takeProfit, data.tokenInfo.decimal)
              : data.takeProfit
          }
          color={ColorPalette["green-350"]}
        />

        <Gutter size="0.25rem" />
      </Body3>
    </>
  );
};

const DepositPositionParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response);
  }, [parsedMsg]);

  if (!data) return null;

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];

  const depositValue =
    tokenPrice * toDisplay(data?.depositAmount, data?.tokenInfo.decimal);

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
        <ParsedComponent label="Action" value={snakeToTitle(data.action)} />

        <ParsedComponent
          left={
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
          }
          right={
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
                  ? toDisplay(data.depositAmount, data.tokenInfo.decimal)
                  : data.depositAmount}{" "}
                {data?.tokenInfo?.name?.toUpperCase()}
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
                ≈ ${!depositValue ? "0" : depositValue.toFixed(4).toString()}
              </span>
            </div>
          }
        />

        <ParsedComponent
          label="Position Id"
          value={data.positionId.toUpperCase()}
        />

        <Gutter size="0.25rem" />
      </Body3>
    </>
  );
};

const StakingParsedItem: FunctionComponent<{
  theme: any;
  parsedMsg: any;
}> = ({ theme, parsedMsg }) => {
  const { data: prices } = useCoinGeckoPrices();

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(parsedMsg.response);
  }, [parsedMsg]);

  if (!data) return null;

  const tokenPrice = prices?.[data?.tokenInfo?.coinGeckoId];

  const stakeValue =
    tokenPrice * toDisplay(data?.amount, data?.tokenInfo.decimal);

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
        <ParsedComponent label="Action" value={snakeToTitle(data.action)} />
        <ParsedComponent
          left={
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
          }
          right={
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
                {data.tokenInfo
                  ? toDisplay(data.amount, data.tokenInfo.decimal)
                  : data.amount}{" "}
                {data?.tokenInfo?.name?.toUpperCase()}
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
                ≈ ${!stakeValue ? "0" : stakeValue.toFixed(4).toString()}
              </span>
            </div>
          }
        />

        <ParsedComponent
          label="Staker"
          value={shortenWord(data.stakerAddress)}
        />

        <Gutter size="0.25rem" />
      </Body3>
    </>
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
        <ParsedComponent
          label="Action"
          value={snakeToTitle(parsedMsg.action.action)}
        />
        <ParsedComponent
          left={
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
                  marginTop: 6,
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
          }
          right={
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
                  marginTop: 6,
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
          }
        />

        <ParsedComponent
          left={
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
          }
          right={
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
                {data?.tokenInfo?.name?.toUpperCase()}
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
          }
        />

        <ParsedComponent
          label="Bridge Fee"
          right={
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
                -{toDisplay(data.feeAmount, data.tokenInfo?.decimal)}{" "}
                {data.tokenInfo?.name.toUpperCase()}
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
          }
        />

        <Gutter size="0.25rem" />
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
    outValue = 0,
    totalOut = 0;

  if (data?.inAssetInfo) {
    inPrice = prices?.[data.inAssetInfo?.coinGeckoId];
    inValue = inPrice * toDisplay(data.inAmount, data.inAssetInfo?.decimal);
  }

  if (data?.outAssetInfo) {
    outPrice = prices?.[data.outAssetInfo?.coinGeckoId];
    totalOut = toDisplay(data.outAmount, data.outAssetInfo?.decimal);

    if (data.postActionFee) {
      totalOut =
        Number(totalOut) -
        Number(toDisplay(data.postActionFee, data.outAssetInfo?.decimal));
    }
    outValue = outPrice * totalOut;
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
        <ParsedComponent
          label="Action"
          value={snakeToTitle(parsedMsg.action.msgAction)}
        />

        <ParsedComponent
          left={
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
          }
          right={
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
          }
        />

        <ParsedComponent
          left={
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
          }
          right={
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
                {data.outAssetInfo && totalOut
                  ? totalOut.toFixed(4)
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
          }
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
  msgs?: Array<any>;
  senderConfig?: SenderConfig;
}> = ({ title, content, msg, senderConfig, msgs }) => {
  const theme = useTheme();
  const [parsedMsg, setParsedMsg] = React.useState<any>();

  const parseMsg = async (msgArray: Array<any>, sender: string) => {
    const client = axios.create({ baseURL: TX_PARSER });

    console.log("msgArray", { messages: msgArray, sender });

    const { data } = await client.put(
      `multichain-parser/v1/parser/parse`,
      { messages: msgArray, sender },
      {}
    );
    console.log("Parsed data", data);
    if (data) {
      setParsedMsg(data.data);
    }
  };

  useEffect(() => {
    const msgArray = [];
    msgs.map((mg) => {
      if (mg && isUint8Array(mg.value)) {
        const convertedMsg = {
          typeUrl: mg.typeUrl,
          value: Buffer.from(mg.value).toString("base64"),
        };
        msgArray.push(convertedMsg);
      }
    });

    parseMsg(msgArray, senderConfig.sender);
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

import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAmountError,
  IAmountConfig,
  ZeroAmountError,
} from "@owallet/hooks";
import { TextInput } from "../text-input";
import { useStore } from "../../../stores";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { Box } from "../../box";
import { Body3, Button2, Subtitle3 } from "../../typography";
import { ColorPalette } from "../../../styles";
import { Columns } from "../../column";
import { useTheme } from "styled-components";
import { ViewToken } from "pages/main";
import { TokenItem } from "pages/main/components";
import { useNavigate } from "react-router";

export const TokenAmountInput: FunctionComponent<{
  amountConfig: IAmountConfig;
  viewToken: ViewToken;
}> = observer(({ amountConfig, viewToken }) => {
  if (amountConfig.amount.length !== 1) {
    throw new Error(
      `Amount input component only handles single amount: ${amountConfig.amount
        .map((a) => a.toString())
        .join(",")}`
    );
  }

  const { chainStore, priceStore } = useStore();

  const price = (() => {
    return priceStore.calculatePrice(amountConfig.amount[0]);
  })();
  const [priceValue, setPriceValue] = useState("");
  const [isPriceBased, setIsPriceBased] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // it frustrating when scrolling inside a number input field unintentionally changes its value
    // we should prevent default behavior of the wheel event
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    if (inputRef.current) {
      inputRef.current.addEventListener("wheel", handleWheel, {
        passive: false,
      });
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);
  const navigate = useNavigate();

  return (
    <TextInput
      ref={inputRef}
      textAlign="right"
      border={false}
      noPadding={true}
      styleInput={{
        fontSize: 20,
        fontWeight: 500,
      }}
      placeholder={"0"}
      type="number"
      value={(() => {
        if (isPriceBased) {
          if (amountConfig.fraction != 0) {
            return price?.toDec().toString(price?.options.maxDecimals);
          }
          return priceValue;
        } else {
          return amountConfig.value;
        }
      })()}
      onChange={(e) => {
        e.preventDefault();

        if (isPriceBased) {
          if (price) {
            let value = e.target.value;
            if (value.startsWith(".")) {
              value = "0" + value;
            }
            if (value.trim().length === 0) {
              amountConfig.setValue("");
              setPriceValue(value);
              return;
            }
            if (/^\d+(\.\d+)*$/.test(value)) {
              let dec: Dec;
              try {
                dec = new Dec(value);
              } catch (e) {
                console.log(e);
                return;
              }
              if (dec.lte(new Dec(0))) {
                setPriceValue(value);
                return;
              }

              const onePrice = priceStore.calculatePrice(
                new CoinPretty(
                  amountConfig.amount[0].currency,
                  DecUtils.getTenExponentN(
                    amountConfig.amount[0].currency.coinDecimals
                  )
                )
              );

              console.log(
                "amountConfig.amount[0].currency",
                amountConfig.amount[0].currency,
                onePrice.toString()
              );

              if (!onePrice) {
                // Can't be happen
                return;
              }
              const onePriceDec = onePrice.toDec();
              const expectedAmount = dec.quo(onePriceDec);

              setPriceValue(value);
              amountConfig.setValue(
                expectedAmount.toString(
                  amountConfig.amount[0].currency.coinDecimals
                )
              );
            }
          }
        } else {
          amountConfig.setValue(e.target.value);
        }
      }}
      left={
        <Box
          style={{
            backgroundColor: ColorPalette["gray-10"],
            borderRadius: "99rem",
            padding: "0.5rem 1rem",
          }}
        >
          <TokenItem
            viewToken={viewToken}
            forChange
            showLeft={false}
            onClick={() => {
              navigate(
                `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
                  "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                )}`
              );
            }}
          />
        </Box>
      }
      top={(() => {
        if (
          // In the case of terra classic, tax is applied in proportion to the amount.
          // However, in this case, the tax itself changes the fee,
          // so if you use the max function, it will fall into infinite repetition.
          // We currently disable if chain is terra classic because we can't handle it properly.
          chainStore.hasChain(amountConfig.chainId) &&
          chainStore
            .getChain(amountConfig.chainId)
            .hasFeature("terra-classic-fee")
        ) {
          return undefined;
        }

        return (
          <Box
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Subtitle3>
              Balance:{" "}
              {viewToken.token
                ?.trim(true)
                ?.shrink(true)
                ?.maxDecimals(6)
                .hideDenom(true)
                .toString()}
            </Subtitle3>
            <MaxButton amountConfig={amountConfig} />
          </Box>
        );
      })()}
      bottom={
        price ? (
          <BottomPriceButton
            text={(() => {
              if (isPriceBased) {
                return amountConfig.amount[0]
                  .trim(true)
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .shrink(true)
                  .toString();
              } else {
                return price.toString();
              }
            })()}
            onClick={() => {
              if (!isPriceBased) {
                if (price.toDec().lte(new Dec(0))) {
                  setPriceValue("");
                } else {
                  setPriceValue(
                    price.toDec().toString(price.options.maxDecimals).toString()
                  );
                }
              }
              setIsPriceBased(!isPriceBased);

              inputRef.current?.focus();
            }}
          />
        ) : null
      }
      error={(() => {
        const uiProperties = amountConfig.uiProperties;

        const err = uiProperties.error || uiProperties.warning;

        if (err instanceof EmptyAmountError) {
          return;
        }

        if (err instanceof ZeroAmountError) {
          return;
        }

        if (err) {
          return err.message || err.toString();
        }
      })()}
    />
  );
});

const BottomPriceButton: FunctionComponent<{
  text: string;
  onClick: () => void;
}> = ({ text, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      style={{
        alignItems: "flex-end",
        display: "flex",
        padding: 8,
      }}
      marginTop="0.375rem"
      marginLeft="0.375rem"
      alignX="left"
    >
      <Box
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-300"]
        }
        hover={{
          color:
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"],
        }}
        onClick={(e) => {
          e.preventDefault();

          onClick();
        }}
        cursor="pointer"
      >
        <Columns sum={1} alignY="center">
          <img src={require("assets/icon/tdesign_swap.svg")} alt="logo" />
          <Body3
            style={{
              marginLeft: "0.3rem",
            }}
          >
            {text}
          </Body3>
        </Columns>
      </Box>
    </Box>
  );
};

const MaxButton: FunctionComponent<{
  amountConfig: IAmountConfig;
}> = observer(({ amountConfig }) => {
  const isMax = amountConfig.fraction === 1;
  const isHalf = amountConfig.fraction === 0.5;
  const theme = useTheme();

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Box
        cursor="pointer"
        height="1.625rem"
        alignX="center"
        alignY="center"
        paddingX="0.5rem"
        marginX="0.25rem"
        color={
          isHalf
            ? theme.mode === "light"
              ? ColorPalette["purple-400"]
              : ColorPalette["gray-300"]
            : theme.mode === "light"
            ? ColorPalette["purple-400"]
            : ColorPalette["gray-10"]
        }
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["purple-50"]
            : ColorPalette["gray-500"]
        }
        borderRadius="5rem"
        borderWidth={"1px"}
        borderColor={
          isHalf
            ? theme.mode === "light"
              ? ColorPalette["purple-200"]
              : ColorPalette["gray-300"]
            : theme.mode === "light"
            ? ColorPalette["purple-50"]
            : ColorPalette["gray-500"]
        }
        hover={{
          color: isHalf
            ? theme.mode === "light"
              ? ColorPalette["purple-500"]
              : ColorPalette["gray-300"]
            : theme.mode === "light"
            ? ColorPalette["purple-400"]
            : ColorPalette["white"],
          backgroundColor: isHalf
            ? theme.mode === "light"
              ? ColorPalette["purple-100"]
              : ColorPalette["gray-500"]
            : theme.mode === "light"
            ? ColorPalette["purple-100"]
            : ColorPalette["gray-550"],
          borderColor: isHalf
            ? theme.mode === "light"
              ? ColorPalette["purple-300"]
              : ColorPalette["gray-400"]
            : theme.mode === "light"
            ? ColorPalette["purple-100"]
            : ColorPalette["gray-550"],
        }}
        onClick={(e) => {
          e.preventDefault();
          // if (amountConfig.fraction > 0) {
          //   amountConfig.setFraction(0);
          // } else {
          //   amountConfig.setFraction(0.5);
          // }
          amountConfig.setFraction(0.5);
        }}
      >
        <Button2
          style={{
            fontSize: "0.85rem",
          }}
        >
          50%
        </Button2>
      </Box>
      <Box
        cursor="pointer"
        height="1.625rem"
        alignX="center"
        alignY="center"
        paddingX="0.5rem"
        color={
          isMax
            ? theme.mode === "light"
              ? ColorPalette["purple-400"]
              : ColorPalette["gray-300"]
            : theme.mode === "light"
            ? ColorPalette["purple-400"]
            : ColorPalette["gray-10"]
        }
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["purple-50"]
            : ColorPalette["gray-500"]
        }
        borderRadius="5rem"
        borderWidth={"1px"}
        borderColor={
          isMax
            ? theme.mode === "light"
              ? ColorPalette["purple-200"]
              : ColorPalette["gray-300"]
            : theme.mode === "light"
            ? ColorPalette["purple-50"]
            : ColorPalette["gray-500"]
        }
        hover={{
          color: isMax
            ? theme.mode === "light"
              ? ColorPalette["purple-500"]
              : ColorPalette["gray-300"]
            : theme.mode === "light"
            ? ColorPalette["purple-400"]
            : ColorPalette["white"],
          backgroundColor: isMax
            ? theme.mode === "light"
              ? ColorPalette["purple-100"]
              : ColorPalette["gray-500"]
            : theme.mode === "light"
            ? ColorPalette["purple-100"]
            : ColorPalette["gray-550"],
          borderColor: isMax
            ? theme.mode === "light"
              ? ColorPalette["purple-300"]
              : ColorPalette["gray-400"]
            : theme.mode === "light"
            ? ColorPalette["purple-100"]
            : ColorPalette["gray-550"],
        }}
        onClick={(e) => {
          e.preventDefault();

          // if (amountConfig.fraction > 0) {
          //   amountConfig.setFraction(0);
          // } else {
          //   amountConfig.setFraction(1);
          // }
          amountConfig.setFraction(1);
        }}
      >
        <Button2
          style={{
            fontSize: "0.85rem",
          }}
        >
          100%
        </Button2>
      </Box>
    </Box>
  );
});

import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import styleCoinInput from "./coin-input.module.scss";
import { FormFeedback } from "reactstrap";
import { observer } from "mobx-react-lite";
import {
  EmptyAmountError,
  InvalidNumberAmountError,
  ZeroAmountError,
  NegativeAmountError,
  InsufficientAmountError,
  IAmountConfig,
} from "@owallet/hooks";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { Card } from "../common/card";
import colors from "../../theme/colors";
import { Text } from "../common/text";
import { Button } from "../common/button";
import { Input } from "./input";

export const removeDataInParentheses = (inputString: string): string => {
  if (!inputString) return;
  return inputString.replace(/\([^)]*\)/g, "");
};

export interface CoinInputProps {
  amountConfig: IAmountConfig;
  balanceText?: string;
  balance?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  openSelectToken?: () => void;
  disableAllBalance?: boolean;
}

const reduceStringAssets = (str) => {
  return (str && str.split("(")[0]) || "";
};

export const CoinInput: FunctionComponent<CoinInputProps> = observer(
  ({
    amountConfig,
    className,
    label,
    disableAllBalance,
    placeholder,
    openSelectToken,
  }) => {
    const intl = useIntl();

    const [randomId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return Buffer.from(bytes).toString("hex");
    });

    const error = amountConfig.getError();
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            // No need to show the error to user.
            return;
          case InvalidNumberAmountError:
            return intl.formatMessage({
              id: "input.amount.error.invalid-number",
            });
          case ZeroAmountError:
            return intl.formatMessage({
              id: "input.amount.error.is-zero",
            });
          case NegativeAmountError:
            return intl.formatMessage({
              id: "input.amount.error.is-negative",
            });
          case InsufficientAmountError:
            return intl.formatMessage({
              id: "input.amount.error.insufficient",
            });
          default:
            return intl.formatMessage({ id: "input.amount.error.unknown" });
        }
      }
    }, [intl, error]);

    const { queriesStore, chainStore, priceStore, keyRingStore, accountStore } =
      useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const walletAddress = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      false
    );

    const queryBalances = queriesStore
      .get(amountConfig.chainId)
      .queryBalances.getQueryBech32Address(amountConfig.sender);

    const [balance, setBalance] = useState(
      new CoinPretty(amountConfig.sendCurrency, new Int(0))
    );

    const tokenDenom = new CoinPretty(amountConfig.sendCurrency, new Int(0))
      .currency.coinDenom;

    useEffect(() => {
      const queryBalance = queryBalances.balances.find(
        (bal) =>
          amountConfig.sendCurrency.coinMinimalDenom ===
          bal.currency.coinMinimalDenom
      );

      setBalance(
        queryBalance
          ? queryBalance.balance
          : new CoinPretty(amountConfig.sendCurrency, new Int(0))
      );
    }, [tokenDenom, chainStore.current.chainId]);

    const isReadyBalance = queriesStore
      .get(chainStore.current.chainId)
      .queryBalances.getQueryBech32Address(walletAddress)
      .getBalanceFromCurrency(amountConfig.sendCurrency).isReady;
    useEffect(() => {
      if (isReadyBalance && amountConfig.sendCurrency && walletAddress) {
        const balance = queriesStore
          .get(chainStore.current.chainId)
          .queryBalances.getQueryBech32Address(walletAddress)
          .getBalanceFromCurrency(amountConfig.sendCurrency);
        setBalance(balance);
      }
    }, [isReadyBalance, walletAddress, amountConfig.sendCurrency]);

    const getName = (name) => {
      return removeDataInParentheses(name);
    };

    const amount = new CoinPretty(
      amountConfig.sendCurrency,
      new Dec(amountConfig.getAmountPrimitive().amount)
    );

    const estimatePrice = priceStore.calculatePrice(amount)?.toString();

    return (
      <Card
        containerStyle={{
          backgroundColor: colors["neutral-surface-card"],
          padding: 16,
          borderRadius: 24,
          marginTop: 1,
          marginBottom: 1,
        }}
      >
        <div className={className}>
          {!disableAllBalance ? (
            <div className={styleCoinInput.row}>
              <div>
                <Text>{`Balance: ${
                  reduceStringAssets(
                    balance?.trim(true)?.maxDecimals(6)?.toString()
                  ) || 0
                }`}</Text>
              </div>
              <div
                style={{
                  flexDirection: "row",
                  display: "flex",
                }}
              >
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    amountConfig.setFraction(0.5);
                  }}
                  size={"small"}
                  containerStyle={{
                    marginRight: 4,
                  }}
                >
                  50%
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    amountConfig.toggleIsMax();
                  }}
                  size={"small"}
                >
                  100%
                </Button>
              </div>
            </div>
          ) : null}
          <div className={styleCoinInput.row}>
            <div
              onClick={openSelectToken}
              style={{
                backgroundColor: colors["neutral-surface-action3"],
                borderRadius: 999,
                padding: "16px 12px",
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              {amountConfig.sendCurrency.coinImageUrl ? (
                <img
                  style={{ width: 20, height: 20, borderRadius: 20 }}
                  src={amountConfig.sendCurrency.coinImageUrl}
                  alt="logo"
                />
              ) : null}

              <Text
                containerStyle={{ marginRight: 4, marginLeft: 4 }}
                color={colors["neutral-text-action-on-light-bg"]}
                size={16}
                weight="600"
              >
                {getName(amountConfig?.sendCurrency?.coinDenom)}
              </Text>
              <img
                src={require("assets/icon/tdesign_chevron-down.svg")}
                alt="logo"
              />
            </div>
            <Input
              border={"none"}
              styleTextInput={{
                textAlign: "right",
                fontSize: 28,
                fontWeight: "500",
              }}
              id={`input-${randomId}`}
              type="number"
              value={amountConfig.amount}
              onChange={(e) => {
                e.preventDefault();
                amountConfig.setAmount(e.target.value);
              }}
              step={new Dec(1)
                .quo(
                  DecUtils.getTenExponentNInPrecisionRange(
                    amountConfig.sendCurrency?.coinDecimals ?? 0
                  )
                )
                .toString(amountConfig.sendCurrency?.coinDecimals ?? 0)}
              min={0}
              // disabled={amountConfig.isMax}
              autoComplete="off"
              placeHolder="0"
            />
          </div>
          <div
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            <img src={require("assets/icon/tdesign_swap.svg")} alt="logo" />
            <Text
              containerStyle={{ marginLeft: 4 }}
              color={colors["neutral-text-body"]}
            >
              {estimatePrice}
            </Text>
          </div>
          {errorText != null ? (
            <FormFeedback style={{ display: "block", position: "sticky" }}>
              {errorText}
            </FormFeedback>
          ) : null}
        </div>
      </Card>
    );
  }
);

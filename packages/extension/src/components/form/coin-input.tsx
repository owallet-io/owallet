import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import styleCoinInput from "./coin-input.module.scss";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  InputGroup,
  Label,
} from "reactstrap";
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
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../stores";
import { DenomHelper } from "@owallet/common";
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

    const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);
    const { queriesStore, chainStore, priceStore } = useStore();

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

    const selectableCurrencies = amountConfig.sendableCurrencies
      .filter((cur) => {
        const bal = queryBalances.getBalanceFromCurrency(cur);
        return !bal?.toDec()?.isZero();
      })
      .sort((a, b) => {
        return a.coinDenom < b.coinDenom ? -1 : 1;
      });

    const denomHelper = new DenomHelper(
      amountConfig.sendCurrency.coinMinimalDenom
    );

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

    return (
      <React.Fragment>
        <div className={className}>
          <Label
            for={`selector-${randomId}`}
            className="form-control-label"
            style={{ width: "100%" }}
          >
            <FormattedMessage id="component.form.coin-input.token.label" />
          </Label>
          <ButtonDropdown
            id={`selector-${randomId}`}
            className={classnames(styleCoinInput.tokenSelector, {
              disabled: amountConfig.fraction === 1,
            })}
            isOpen={isOpenTokenSelector}
            toggle={() => setIsOpenTokenSelector((value) => !value)}
            disabled={amountConfig.fraction === 1}
          >
            <DropdownToggle caret>
              {amountConfig.sendCurrency.coinDenom}{" "}
              {denomHelper.contractAddress &&
                ` (${denomHelper.contractAddress})`}
            </DropdownToggle>
            <DropdownMenu>
              {selectableCurrencies.map((currency) => {
                const denomHelper = new DenomHelper(currency.coinMinimalDenom);
                return (
                  <DropdownItem
                    key={currency.coinMinimalDenom}
                    active={
                      currency.coinMinimalDenom ===
                      amountConfig.sendCurrency.coinMinimalDenom
                    }
                    onClick={(e) => {
                      e.preventDefault();

                      amountConfig.setSendCurrency(currency);
                    }}
                  >
                    {currency.coinDenom}{" "}
                    {denomHelper.contractAddress &&
                      ` (${denomHelper.contractAddress})`}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </ButtonDropdown>
        </div>
        <div className={className}>
          {label ? (
            <Label
              for={`input-${randomId}`}
              className={classnames(
                "form-control-label",
                styleCoinInput.labelBalance
              )}
            >
              <div>{label}</div>
              {!disableAllBalance ? (
                <div
                  className={classnames(
                    styleCoinInput.balance,
                    styleCoinInput.clickable,
                    {
                      [styleCoinInput.clicked]: amountConfig.isMax,
                    }
                  )}
                  onClick={(e) => {
                    e.preventDefault();

                    amountConfig.toggleIsMax();
                  }}
                >
                  <span>{`Total: ${
                    reduceStringAssets(
                      balance?.trim(true)?.maxDecimals(6)?.toString()
                    ) || 0
                  }`}</span>
                </div>
              ) : null}
            </Label>
          ) : null}
          <InputGroup className={styleCoinInput.inputGroup}>
            <Input
              className={classnames(
                "form-control-alternative",
                styleCoinInput.input
              )}
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
              disabled={amountConfig.isMax}
              autoComplete="off"
              placeholder={placeholder}
            />
            <div
              style={{ padding: 7.5, textAlign: "center", cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                amountConfig.toggleIsMax();
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 28,
                  backgroundColor: amountConfig.isMax ? "#7664E4" : "#f8fafc",
                  borderRadius: 4,
                }}
              >
                <span
                  style={{
                    color: amountConfig.isMax ? "white" : "#7664E4",
                    fontSize: 14,
                  }}
                >
                  MAX
                </span>
              </div>
            </div>
          </InputGroup>
          {errorText != null ? (
            <FormFeedback style={{ display: "block", position: "sticky" }}>
              {errorText}
            </FormFeedback>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
);

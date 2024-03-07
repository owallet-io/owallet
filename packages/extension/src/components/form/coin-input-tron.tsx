import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

import classnames from "classnames";
import styleCoinInput from "./coin-input.module.scss";

import {
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  FormGroup,
  Input,
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
  IFeeEthereumConfig,
} from "@owallet/hooks";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../stores";
import { DenomHelper, getEvmAddress, toDisplay } from "@owallet/common";
export interface CoinInputTronProps {
  amountConfig: IAmountConfig;
  feeConfig?: any;
  balanceText?: string;

  className?: string;
  label?: string;
  placeholder?: string;

  disableAllBalance?: boolean;
  tokenTrc20?: {
    coinDenom: string;
    amount: string;
    contractAddress: string;
  };
}

const reduceStringAssets = (str) => {
  return (str && str.split("(")[0]) || "";
};

export const CoinInputTronEvm: FunctionComponent<CoinInputTronProps> = observer(
  ({
    amountConfig,
    className,
    label,
    disableAllBalance,
    placeholder,
    feeConfig,
    tokenTrc20,
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
    const { queriesStore, chainStore, accountStore, keyRingStore } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);
    const queryBalances = queriesStore
      .get(amountConfig.chainId)
      .queryBalances.getQueryBech32Address(amountConfig.sender);
    const [balance, setBalance] = useState(
      new CoinPretty(amountConfig.sendCurrency, new Int(0))
    );

    const tokenDenom = new CoinPretty(amountConfig.sendCurrency, new Int(0))
      .currency.coinDenom;

    useEffect(() => {
      if (
        chainStore?.current?.networkType === "evm" &&
        tokenDenom === chainStore?.current?.stakeCurrency?.coinDenom
      ) {
        if (!accountInfo.evmosHexAddress) return null;

        const evmBalance = queries.queryBalances.getQueryBech32Address(
          keyRingStore.keyRingType === "ledger"
            ? getEvmAddress(keyRingStore?.keyRingLedgerAddresses?.trx)
            : accountInfo.evmosHexAddress
        )?.stakable.balance;
        setBalance(evmBalance);
      }
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

    useEffect(() => {}, [parseFloat(feeConfig)]);
    return (
      <React.Fragment>
        <FormGroup className={className}>
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
              {tokenTrc20
                ? tokenTrc20.coinDenom
                : amountConfig.sendCurrency.coinDenom}{" "}
              {tokenTrc20
                ? tokenTrc20.contractAddress
                : denomHelper.contractAddress &&
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
        </FormGroup>
        <FormGroup className={className}>
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
                    amountConfig.setAmount(
                      parseFloat(
                        tokenTrc20
                          ? toDisplay(tokenTrc20.amount, 6).toString()
                          : toDisplay(
                              //@ts-ignore
                              balance?.amount?.int?.value,
                              24
                            ).toString()
                      )
                        .toFixed(6)
                        .toString()
                    );
                  }}
                >
                  <span>{`Total: ${
                    tokenTrc20
                      ? reduceStringAssets(
                          toDisplay(tokenTrc20.amount, 6).toString() +
                            ` ${tokenTrc20.coinDenom}`
                        )
                      : (balance &&
                          reduceStringAssets(
                            toDisplay(
                              //@ts-ignore
                              balance?.amount?.int?.value,
                              24
                            ).toString() +
                              ` ${chainStore.current?.stakeCurrency.coinDenom}`
                          )) ||
                        0
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
          </InputGroup>
          {errorText != null ? (
            <FormFeedback style={{ display: "block", position: "sticky" }}>
              {errorText}
            </FormFeedback>
          ) : null}
        </FormGroup>
      </React.Fragment>
    );
  }
);

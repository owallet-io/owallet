import React, { FunctionComponent, useEffect, useState } from "react";

import styleFeeButtons from "./fee-buttons.module.scss";

import { FormFeedback, FormGroup, FormText, Label } from "reactstrap";

import classnames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FeeType,
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@owallet/hooks";
import { CoinGeckoPriceStore } from "@owallet/stores";
import { useLanguage } from "@owallet/common";
import { useIntl } from "react-intl";
import { GasInput } from "../gas-input";
import { action, makeObservable, observable } from "mobx";
import { useStore } from "../../../stores";
import colors from "../../../theme/colors";
import { Text } from "../../common/text";
import { RadioButton } from "../../common/radio";

export interface FeeButtonsProps {
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  priceStore: CoinGeckoPriceStore;
  // customFee: boolean;

  className?: string;
  label?: string;
  dimensional?: "horizontal" | "vertical";
  feeSelectLabels?: {
    low: string;
    average: string;
    high: string;
  };

  gasLabel?: string;
  isGasInput?: boolean;
}

class FeeButtonState {
  @observable
  protected _isGasInputOpen: boolean = false;

  constructor() {
    makeObservable(this);
  }

  get isGasInputOpen(): boolean {
    return this._isGasInputOpen;
  }

  @action
  setIsGasInputOpen(open: boolean) {
    this._isGasInputOpen = open;
  }
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  ({
    feeConfig,
    gasConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
    gasLabel,
    isGasInput = true,
    dimensional = "horizontal",
    // customFee,
  }) => {
    // This may be not the good way to handle the states across the components.
    // But, rather than using the context API with boilerplate code, just use the mobx state to simplify the logic.
    const [feeButtonState] = useState(() => new FeeButtonState());
    const intl = useIntl();
    return (
      <React.Fragment>
        {/* {customFee ? (
          <FeeInput
            label={intl.formatMessage({ id: "sign.info.fee" })}
            feeConfig={feeConfig}
            priceStore={priceStore}
          />
        ) : ( */}
        <FeeButtonsInner
          dimensional={dimensional}
          feeConfig={feeConfig}
          priceStore={priceStore}
          label={label}
          feeSelectLabels={feeSelectLabels}
          feeButtonState={feeButtonState}
        />
        {/* )} */}
        {/* {feeButtonState.isGasInputOpen || !feeConfig.feeCurrency ? (
          <GasInput label={gasLabel} gasConfig={gasConfig} />
        ) : null} */}
        {isGasInput ? (
          <GasInput label={gasLabel} gasConfig={gasConfig} />
        ) : null}
      </React.Fragment>
    );
  }
);

export const FeeButtonsInner: FunctionComponent<
  Pick<
    FeeButtonsProps,
    "feeConfig" | "priceStore" | "dimensional" | "label" | "feeSelectLabels"
  > & {
    feeButtonState: FeeButtonState;
  }
> = observer(
  ({
    feeConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
    feeButtonState,
    dimensional,
  }) => {
    const { chainStore } = useStore();
    useEffect(() => {
      if (feeConfig.feeCurrency && !feeConfig.fee) {
        feeConfig.setFeeType("average");
      }
      if (chainStore.selectedFee && chainStore.selectedFee !== "") {
        feeConfig.setFeeType(chainStore.selectedFee as FeeType);
      }
    }, [feeConfig, feeConfig.feeCurrency, feeConfig.fee]);

    const intl = useIntl();

    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    const renderIconTypeFee = (label: string) => {
      switch (label) {
        case "low":
          return (
            <img
              style={{ width: 44, height: 44, borderRadius: 44 }}
              src={require("../../../public/assets/img/slow.svg")}
              alt={label}
            />
          );
        case "average":
          return (
            <img
              style={{ width: 44, height: 44, borderRadius: 44 }}
              src={require("../../../public/assets/img/average.svg")}
              alt={label}
            />
          );
        case "high":
          return (
            <img
              style={{ width: 44, height: 44, borderRadius: 44 }}
              src={require("../../../public/assets/img/fast.svg")}
              alt={label}
            />
          );
      }
    };

    const language = useLanguage();

    // For chains without feeCurrencies, OWallet assumes tx doesn’t need to include information about the fee and the fee button does not have to be rendered.
    // The architecture is designed so that fee button is not rendered if the parental component doesn’t have a feeCurrency.
    // However, because there may be situations where the fee buttons is rendered before the chain information is changed,
    // and the fee button is an observer, and the sequence of rendering the observer may not appear stabilized,
    // so only handling the rendering in the parent component may not be sufficient
    // Therefore, this line double checks to ensure that the fee buttons is not rendered if fee currency doesn’t exist.
    // But because this component uses hooks, using a hook in the line below can cause an error.
    // Note that hooks should be used above this line, and only rendering-related logic should exist below this line.
    if (!feeConfig.feeCurrency) {
      return <React.Fragment />;
    }

    const fiatCurrency = language.fiatCurrency;

    const lowFee = feeConfig.getFeeTypePretty("low");
    const lowFeePrice = priceStore.calculatePrice(lowFee, fiatCurrency);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee, fiatCurrency);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice(highFee, fiatCurrency);

    let isFeeLoading = false;

    const error = feeConfig.getError();
    const errorText: string | undefined = (() => {
      if (error) {
        switch (error.constructor) {
          case InsufficientFeeError:
            return intl.formatMessage({
              id: "input.fee.error.insufficient",
            });
          case NotLoadedFeeError:
            isFeeLoading = true;
            return undefined;
          default:
            return (
              error.message ||
              intl.formatMessage({ id: "input.fee.error.unknown" })
            );
        }
      }
    })();

    const renderHorizontalFee = () => {
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "row" }}>
          {["low", "average", "high"].map((fee, i) => {
            return (
              <div
                key={i}
                style={{
                  border: `1px solid ${
                    feeConfig.feeType == fee ? "#7664E4" : "#fff"
                  }`,
                  borderRadius: 8,
                  boxShadow: "0px 10px 35px -3px rgba(24, 39, 75, 0.12)",
                  flex: 1,
                  marginLeft: i == 1 ? 5 : 0,
                  marginRight: i == 1 ? 5 : 0,
                  padding: 8,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  const feeType =
                    fee == "low"
                      ? "low"
                      : fee == "average"
                      ? "average"
                      : "high";
                  feeConfig.setFeeType(feeType);
                  chainStore.setSelectedFee(feeType);
                  e.preventDefault();
                }}
              >
                {renderIconTypeFee(fee)}
                <div className={styleFeeButtons.title}>
                  {feeSelectLabels[fee]}
                </div>
                <div
                  className={classnames(styleFeeButtons.coin, {
                    "text-muted": feeConfig.feeType !== fee,
                  })}
                >
                  {chainStore.current.networkType === "bitcoin" ? "≤" : null}{" "}
                  {[lowFee, averageFee, highFee][i].trim(true).toString() || 0}
                </div>
                {[lowFeePrice, averageFeePrice, highFeePrice][i] ? (
                  <div
                    className={classnames(styleFeeButtons.fiat, {
                      "text-muted": feeConfig.feeType !== fee,
                    })}
                  >
                    {chainStore.current.networkType === "bitcoin" ? "≈ " : null}
                    {[lowFeePrice, averageFeePrice, highFeePrice][i].toString()}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      );
    };

    const renderVerticalFee = () => {
      return (
        <div>
          {["low", "average", "high"].map((fee, i) => {
            return (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  borderRadius: 8,
                  display: "flex",
                  padding: 8,
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor:
                    feeConfig.feeType == fee
                      ? colors["neutral-surface-bg2"]
                      : "transparent",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                onClick={(e) => {
                  feeConfig.setFeeType(fee as FeeType);
                  chainStore.setSelectedFee(fee);

                  e.preventDefault();
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {renderIconTypeFee(fee)}
                  <div style={{ marginLeft: 4 }}>
                    <Text size={16} weight="600">
                      {feeSelectLabels[fee]}
                    </Text>
                    <div>
                      <Text color={colors["neutral-text-body"]} size={14}>
                        {chainStore.current.networkType === "bitcoin"
                          ? "≤"
                          : null}{" "}
                        {[lowFee, averageFee, highFee][i]
                          .trim(true)
                          .toString() || 0}
                        (
                        {[lowFeePrice, averageFeePrice, highFeePrice][i] ? (
                          <Text>
                            {chainStore.current.networkType === "bitcoin"
                              ? "≈ "
                              : null}
                            {[lowFeePrice, averageFeePrice, highFeePrice][
                              i
                            ].toString()}
                          </Text>
                        ) : null}
                        )
                      </Text>
                    </div>
                  </div>
                </div>
                <div className={styleFeeButtons.radio}>
                  <RadioButton
                    checked={
                      feeConfig.feeType
                        ? feeConfig.feeType == fee
                        : feeConfig?.fee
                            ?.maxDecimals(8)
                            .trim(true)
                            .toString() ===
                          [lowFee, averageFee, highFee][i].trim(true).toString()
                    }
                    onChange={(e) => {
                      feeConfig.setFeeType(fee as FeeType);
                      chainStore.setSelectedFee(fee);
                      e.preventDefault();
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <FormGroup style={{ position: "relative", marginBottom: "0px" }}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        {dimensional === "horizontal"
          ? renderHorizontalFee()
          : renderVerticalFee()}

        {isFeeLoading ? (
          <FormText>
            <i className="fa fa-spinner fa-spin fa-fw" />
          </FormText>
        ) : null}
        <div style={{ height: 20 }} />
        {errorText != null ? (
          <FormFeedback style={{ display: "block", marginTop: -15 }}>
            {errorText}
          </FormFeedback>
        ) : null}
      </FormGroup>
    );
  }
);

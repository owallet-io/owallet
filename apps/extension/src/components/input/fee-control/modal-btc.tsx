import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  Body3,
  Caption1,
  Caption2,
  H5,
  Subtitle1,
  Subtitle3,
} from "../../typography";
import { ColorPalette } from "../../../styles";
import styled, { useTheme } from "styled-components";
import { Stack } from "../../stack";
import { Dropdown } from "../../dropdown";
import { Column, Columns } from "../../column";
import { Toggle } from "../../toggle";
import { TextInput } from "..";
import { Button } from "../../button";
import { observer } from "mobx-react-lite";
import {
  IBtcFeeConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  ISenderConfig,
} from "@owallet/hooks";
import { useStore } from "../../../stores";
import { GuideBox } from "../../guide-box";
import { Dec, PricePretty } from "@owallet/unit";
import { Box } from "../../box";
import { FormattedMessage, useIntl } from "react-intl";
import { XAxis } from "../../axis";
import { Gutter } from "../../gutter";
import { VerticalCollapseTransition } from "../../transition/vertical-collapse";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};

export const TransactionBTCFeeModal: FunctionComponent<{
  close: () => void;

  senderConfig: ISenderConfig;
  feeConfig: IBtcFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;
  disableAutomaticFeeSet?: boolean;
  isForEVMTx?: boolean;
}> = observer(
  ({
    close,
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
  }) => {
    const { queriesStore, uiConfigStore, priceStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    useEffect(() => {
      if (uiConfigStore.rememberLastFeeOption) {
        if (feeConfig.type !== "manual") {
          uiConfigStore.setLastFeeOption(feeConfig.type);
        }
      } else {
        uiConfigStore.setLastFeeOption(false);
      }
    }, [feeConfig.type, uiConfigStore, uiConfigStore.rememberLastFeeOption]);

    const [showChangesApplied, setShowChangesApplied] = useState(false);
    const feeConfigCurrencyString = feeConfig
      .toStdFee()
      .amount.map((x) => x.denom)
      .join(",");
    const prevFeeConfigType = useRef(feeConfig.type);
    const prevFeeConfigCurrency = useRef(feeConfigCurrencyString);
    const lastShowChangesAppliedTimeout = useRef<NodeJS.Timeout | undefined>(
      undefined
    );
    useEffect(() => {
      if (
        prevFeeConfigType.current !== feeConfig.type ||
        prevFeeConfigCurrency.current !== feeConfigCurrencyString
      ) {
        if (lastShowChangesAppliedTimeout.current) {
          clearTimeout(lastShowChangesAppliedTimeout.current);
          lastShowChangesAppliedTimeout.current = undefined;
        }
        setShowChangesApplied(true);
        lastShowChangesAppliedTimeout.current = setTimeout(() => {
          setShowChangesApplied(false);
          lastShowChangesAppliedTimeout.current = undefined;
        }, 2500);
      }

      prevFeeConfigType.current = feeConfig.type;
      prevFeeConfigCurrency.current = feeConfigCurrencyString;
    }, [feeConfig.type, feeConfigCurrencyString]);

    return (
      <Styles.Container>
        <Box marginBottom="1.25rem" marginLeft="0.5rem" paddingY="0.4rem">
          <Subtitle1>
            <FormattedMessage id="components.input.fee-control.modal.title" />
          </Subtitle1>
        </Box>

        <Stack gutter="0.75rem">
          <Stack gutter="0.375rem">
            <Box marginLeft="0.5rem">
              <XAxis alignY="center">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-100"]
                  }
                >
                  <FormattedMessage id="components.input.fee-control.modal.fee-title" />
                </Subtitle3>

                <div style={{ flex: 1 }} />
                {!disableAutomaticFeeSet ? (
                  <React.Fragment>
                    <div
                      style={{
                        width: "0.375rem",
                        height: "0.375rem",
                        borderRadius: "99999px",
                        backgroundColor:
                          theme.mode === "light"
                            ? ColorPalette["purple-400"]
                            : ColorPalette["purple-400"],
                        marginRight: "0.3rem",
                      }}
                    />
                    <Body3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-200"]
                      }
                    >
                      <FormattedMessage id="components.input.fee-control.modal.remember-last-fee-option" />
                    </Body3>
                    <Gutter size="0.5rem" />
                    <Toggle
                      isOpen={uiConfigStore.rememberLastFeeOption}
                      setIsOpen={(v) =>
                        uiConfigStore.setRememberLastFeeOption(v)
                      }
                    />
                  </React.Fragment>
                ) : null}
              </XAxis>
            </Box>

            <FeeSelector
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              gasSimulator={gasSimulator}
            />
          </Stack>

          <Dropdown
            label={intl.formatMessage({
              id: "components.input.fee-control.modal.fee-token-dropdown-label",
            })}
            menuContainerMaxHeight="10rem"
            items={feeConfig.selectableFeeCurrencies
              .filter((cur, i) => {
                if (i === 0) {
                  return true;
                }

                const balance = queriesStore
                  .get(feeConfig.chainId)
                  .queryBalances.getQueryBech32Address(senderConfig.sender)
                  .getBalanceFromCurrency(cur);

                return balance.toDec().gt(new Dec(0));
              })
              .map((cur) => {
                return {
                  key: cur.coinMinimalDenom,
                  label: cur.coinDenom,
                };
              })}
            selectedItemKey={feeConfig.fees[0]?.currency.coinMinimalDenom}
            onSelect={(key) => {
              const currency = feeConfig.selectableFeeCurrencies.find(
                (cur) => cur.coinMinimalDenom === key
              );
              if (currency) {
                if (feeConfig.type !== "manual") {
                  feeConfig.setFee({
                    type: feeConfig.type,
                    currency: currency,
                  });
                } else {
                  feeConfig.setFee({
                    type: "average",
                    currency: currency,
                  });
                }
              }
            }}
            size="large"
          />

          {(() => {
            if (gasSimulator) {
              if (gasSimulator.uiProperties.error) {
                return (
                  <GuideBox
                    color="danger"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      gasSimulator.uiProperties.error.message ||
                      gasSimulator.uiProperties.error.toString()
                    }
                  />
                );
              }

              if (gasSimulator.uiProperties.warning) {
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      gasSimulator.uiProperties.warning.message ||
                      gasSimulator.uiProperties.warning.toString()
                    }
                  />
                );
              }
            }
          })()}

          {disableAutomaticFeeSet ? (
            <GuideBox
              title={intl.formatMessage({
                id: "components.input.fee-control.modal.guide.external-fee-set",
              })}
              backgroundColor={
                theme.mode === "light" ? undefined : ColorPalette["gray-500"]
              }
            />
          ) : null}

          <VerticalCollapseTransition collapsed={!showChangesApplied}>
            <GuideBox
              color="safe"
              title={intl.formatMessage({
                id: "components.input.fee-control.modal.notification.changes-applied",
              })}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />

          <Button
            type="button"
            text={intl.formatMessage({
              id: "button.close",
            })}
            color="secondary"
            size="large"
            onClick={() => {
              close();
            }}
          />
        </Stack>
      </Styles.Container>
    );
  }
);

const FeeSelectorStyle = {
  Item: styled.div<{ selected: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;

    cursor: pointer;

    background-color: ${({ selected, theme }) =>
      selected
        ? ColorPalette["purple-400"]
        : theme.mode === "light"
        ? ColorPalette["purple-50"]
        : ColorPalette["gray-500"]};
  `,
  Title: styled(H5)<{ selected: boolean }>`
    color: ${({ selected, theme }) =>
      selected
        ? theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-50"]
        : theme.mode === "light"
        ? ColorPalette["purple-400"]
        : ColorPalette["gray-50"]};
  `,
  Price: styled(Caption2)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 0.25rem;
    color: ${({ selected, theme }) =>
      selected
        ? ColorPalette["purple-200"]
        : theme.mode === "light"
        ? ColorPalette["purple-500"]
        : ColorPalette["gray-300"]};
  `,
  Amount: styled(Caption1)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 0.25rem;
    color: ${({ selected }) =>
      selected ? ColorPalette["purple-100"] : ColorPalette["gray-200"]};
  `,
};

const FeeSelector: FunctionComponent<{
  feeConfig: IBtcFeeConfig;
  gasConfig?: IGasConfig;
  gasSimulator?: IGasSimulator;
  isForEVMTx?: boolean;
}> = observer(({ feeConfig, gasConfig, gasSimulator, isForEVMTx }) => {
  const { priceStore } = useStore();
  const theme = useTheme();

  const feeCurrency =
    feeConfig.fees.length > 0
      ? feeConfig.fees[0].currency
      : feeConfig.selectableFeeCurrencies[0];

  if (!feeCurrency) {
    return null;
  }

  const isShowingGasEstimatedOnly = isForEVMTx && !!gasSimulator?.gasEstimated;

  return (
    <Columns sum={3}>
      <Column weight={1}>
        <FeeSelectorStyle.Item
          style={{
            borderRadius: "0.5rem 0 0 0.5rem",
            borderRight: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
          }}
          onClick={() => {
            feeConfig.setFee({
              type: "low",
              currency: feeCurrency,
            });
          }}
          selected={feeConfig.type === "low"}
        >
          <Box width="1px" alignX="center">
            <FeeSelectorStyle.Title selected={feeConfig.type === "low"}>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.low" />
            </FeeSelectorStyle.Title>
            {feeCurrency.coinGeckoId ? (
              <FeeSelectorStyle.Price selected={feeConfig.type === "low"}>
                {priceStore
                  .calculatePrice(
                    feeConfig
                      .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                      .quo(
                        new Dec(
                          isShowingGasEstimatedOnly ? gasConfig?.gas || 1 : 1
                        )
                      )
                      .mul(
                        new Dec(
                          isShowingGasEstimatedOnly
                            ? gasSimulator?.gasEstimated || 1
                            : 1
                        )
                      )
                  )
                  ?.toString() || "-"}
              </FeeSelectorStyle.Price>
            ) : null}
            <FeeSelectorStyle.Amount selected={feeConfig.type === "low"}>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                .quo(
                  new Dec(isShowingGasEstimatedOnly ? gasConfig?.gas || 1 : 1)
                )
                .mul(
                  new Dec(
                    isShowingGasEstimatedOnly
                      ? gasSimulator?.gasEstimated || 1
                      : 1
                  )
                )
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .shrink(true)
                .hideIBCMetadata(true)
                .toString()}
            </FeeSelectorStyle.Amount>
          </Box>
        </FeeSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeSelectorStyle.Item
          onClick={() => {
            feeConfig.setFee({
              type: "average",
              currency: feeCurrency,
            });
          }}
          selected={feeConfig.type === "average"}
        >
          <Box width="1px" alignX="center">
            <FeeSelectorStyle.Title selected={feeConfig.type === "average"}>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.average" />
            </FeeSelectorStyle.Title>
            {feeCurrency.coinGeckoId ? (
              <FeeSelectorStyle.Price selected={feeConfig.type === "average"}>
                {priceStore
                  .calculatePrice(
                    feeConfig
                      .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
                      .quo(
                        new Dec(
                          isShowingGasEstimatedOnly ? gasConfig?.gas || 1 : 1
                        )
                      )
                      .mul(
                        new Dec(
                          isShowingGasEstimatedOnly
                            ? gasSimulator?.gasEstimated || 1
                            : 1
                        )
                      )
                  )
                  ?.toString() || "-"}
              </FeeSelectorStyle.Price>
            ) : null}
            <FeeSelectorStyle.Amount selected={feeConfig.type === "average"}>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
                .quo(
                  new Dec(isShowingGasEstimatedOnly ? gasConfig?.gas || 1 : 1)
                )
                .mul(
                  new Dec(
                    isShowingGasEstimatedOnly
                      ? gasSimulator?.gasEstimated || 1
                      : 1
                  )
                )
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .shrink(true)
                .hideIBCMetadata(true)
                .toString()}
            </FeeSelectorStyle.Amount>
          </Box>
        </FeeSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeSelectorStyle.Item
          style={{
            borderRadius: "0 0.5rem 0.5rem 0",
            borderLeft: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
          }}
          onClick={() => {
            feeConfig.setFee({
              type: "high",
              currency: feeCurrency,
            });
          }}
          selected={feeConfig.type === "high"}
        >
          <Box width="1px" alignX="center">
            <FeeSelectorStyle.Title selected={feeConfig.type === "high"}>
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.high" />
            </FeeSelectorStyle.Title>
            {feeCurrency.coinGeckoId ? (
              <FeeSelectorStyle.Price selected={feeConfig.type === "high"}>
                {priceStore
                  .calculatePrice(
                    feeConfig
                      .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
                      .quo(
                        new Dec(
                          isShowingGasEstimatedOnly ? gasConfig?.gas || 1 : 1
                        )
                      )
                      .mul(
                        new Dec(
                          isShowingGasEstimatedOnly
                            ? gasSimulator?.gasEstimated || 1
                            : 1
                        )
                      )
                  )
                  ?.toString() || "-"}
              </FeeSelectorStyle.Price>
            ) : null}
            <FeeSelectorStyle.Amount selected={feeConfig.type === "high"}>
              {feeConfig
                .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
                .quo(
                  new Dec(isShowingGasEstimatedOnly ? gasConfig?.gas || 1 : 1)
                )
                .mul(
                  new Dec(
                    isShowingGasEstimatedOnly
                      ? gasSimulator?.gasEstimated || 1
                      : 1
                  )
                )
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .shrink(true)
                .hideIBCMetadata(true)
                .toString()}
            </FeeSelectorStyle.Amount>
          </Box>
        </FeeSelectorStyle.Item>
      </Column>
    </Columns>
  );
});

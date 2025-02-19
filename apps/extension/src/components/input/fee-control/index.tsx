import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  IBtcFeeConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  ISenderConfig,
} from "@owallet/hooks";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";
import { Body2, Subtitle4 } from "../../typography";
import { LoadingIcon } from "../../icon";
import { Modal } from "../../modal";
import { TransactionFeeModal } from "./modal";
import { useStore } from "../../../stores";
import { autorun } from "mobx";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";
import { FormattedMessage, useIntl } from "react-intl";
import { XAxis, YAxis } from "../../axis";
import { UIConfigStore } from "../../../stores/ui-config";
import { IChainStore, IQueriesStore } from "@owallet/stores";
import { Tooltip } from "../../tooltip";
import { EthereumAccountBase } from "@owallet/stores-eth";
import { TransactionBTCFeeModal } from "./modal-btc";

export const useFeeOptionSelectionOnInit = (
  uiConfigStore: UIConfigStore,
  feeConfig: IFeeConfig | IBtcFeeConfig,
  disableAutomaticFeeSet: boolean | undefined
) => {
  useLayoutEffect(() => {
    if (disableAutomaticFeeSet) {
      return;
    }

    if (
      feeConfig.fees.length === 0 &&
      feeConfig.selectableFeeCurrencies.length > 0
    ) {
      if (uiConfigStore.rememberLastFeeOption && uiConfigStore.lastFeeOption) {
        feeConfig.setFee({
          type: uiConfigStore.lastFeeOption,
          currency: feeConfig.selectableFeeCurrencies[0],
        });
      } else {
        feeConfig.setFee({
          type: "average",
          currency: feeConfig.selectableFeeCurrencies[0],
        });
      }
    }
  }, [
    disableAutomaticFeeSet,
    feeConfig,
    feeConfig.fees,
    feeConfig.selectableFeeCurrencies,
    uiConfigStore.lastFeeOption,
    uiConfigStore.rememberLastFeeOption,
  ]);
};

export const useAutoFeeCurrencySelectionOnInit = (
  chainStore: IChainStore,
  queriesStore: IQueriesStore,
  senderConfig: ISenderConfig,
  feeConfig: IFeeConfig | IBtcFeeConfig,
  disableAutomaticFeeSet: boolean | undefined
) => {
  useLayoutEffect(() => {
    if (disableAutomaticFeeSet) {
      return;
    }

    // Require to invoke effect whenever chain is changed,
    // even though it is not used in logic.
    noop(feeConfig.chainId);

    // Try to find other fee currency if the account doesn't have enough fee to pay.
    // This logic can be slightly complex, so use mobx's `autorun`.
    // This part fairly different with the approach of react's hook.
    let skip = false;
    // Try until 500ms to avoid the confusion to user.
    const timeoutId = setTimeout(() => {
      skip = true;
    }, 2000);

    const disposer = autorun(() => {
      if (
        !skip &&
        feeConfig.type !== "manual" &&
        feeConfig.selectableFeeCurrencies.length > 1 &&
        feeConfig.fees.length > 0
      ) {
        const queryBalances =
          chainStore.getChain(feeConfig.chainId).evm != null &&
          EthereumAccountBase.isEthereumHexAddressWithChecksum(
            senderConfig.sender
          )
            ? queriesStore
                .get(feeConfig.chainId)
                .queryBalances.getQueryEthereumHexAddress(senderConfig.sender)
            : queriesStore
                .get(feeConfig.chainId)
                .queryBalances.getQueryBech32Address(senderConfig.sender);

        const currentFeeCurrency = feeConfig.fees[0].currency;
        const currentFeeCurrencyBal =
          queryBalances.getBalanceFromCurrency(currentFeeCurrency);

        const currentFee = feeConfig.getFeeTypePrettyForFeeCurrency(
          currentFeeCurrency,
          feeConfig.type
        );
        if (currentFeeCurrencyBal.toDec().lt(currentFee.toDec())) {
          const isOsmosis =
            chainStore.hasChain(feeConfig.chainId) &&
            chainStore.getChain(feeConfig.chainId).hasFeature("osmosis-txfees");

          // Not enough balances for fee.
          // Try to find other fee currency to send.
          for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
            const feeCurrencyBal =
              queryBalances.getBalanceFromCurrency(feeCurrency);
            const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
              feeCurrency,
              feeConfig.type
            );

            if (isOsmosis && fee.toDec().lte(new Dec(0))) {
              continue;
            }

            if (feeCurrencyBal.toDec().gte(fee.toDec())) {
              feeConfig.setFee({
                type: feeConfig.type,
                currency: feeCurrency,
              });
              const uiProperties = feeConfig.uiProperties;
              skip =
                !uiProperties.loadingState &&
                uiProperties.error == null &&
                uiProperties.warning == null;
              return;
            }
          }
        }
      }
    });

    return () => {
      clearTimeout(timeoutId);
      skip = true;
      disposer();
    };
  }, [
    chainStore,
    disableAutomaticFeeSet,
    feeConfig,
    feeConfig.chainId,
    queriesStore,
    senderConfig.sender,
  ]);
};

export const FeeControl: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig | IBtcFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;

  disableAutomaticFeeSet?: boolean;
  isForEVMTx?: boolean;
  disabled?: boolean;
}> = observer(
  ({
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
    isForEVMTx,
    disabled,
  }) => {
    const {
      analyticsStore,
      queriesStore,
      priceStore,
      chainStore,
      uiConfigStore,
    } = useStore();

    const intl = useIntl();
    const theme = useTheme();

    useFeeOptionSelectionOnInit(
      uiConfigStore,
      feeConfig,
      disableAutomaticFeeSet
    );

    useAutoFeeCurrencySelectionOnInit(
      chainStore,
      queriesStore,
      senderConfig,
      feeConfig,
      disableAutomaticFeeSet
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const chainInfo = chainStore.getChain(feeConfig.chainId);
    const isBtc = chainInfo.features.includes("btc");

    const isShowingEstimatedFee = isForEVMTx && !!gasSimulator?.gasEstimated;

    return (
      <Box>
        <YAxis alignX="center">
          <Box
            paddingBottom="0.21rem"
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              if (disabled) {
                return;
              }

              analyticsStore.logEvent("click_txFeeSet");
              setIsModalOpen(true);
            }}
          >
            <XAxis alignY="center">
              <Box minWidth="0.875rem" />
              <Body2
                color={(() => {
                  if (
                    feeConfig.uiProperties.error ||
                    feeConfig.uiProperties.warning
                  ) {
                    return theme.mode === "light"
                      ? ColorPalette["orange-400"]
                      : ColorPalette["yellow-400"];
                  }

                  return theme.mode === "light"
                    ? ColorPalette["purple-400"]
                    : ColorPalette["white"];
                })()}
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: "0.2rem",
                }}
              >
                {
                  <FormattedMessage
                    id="components.input.fee-control.fee"
                    values={{
                      assets: (() => {
                        if (feeConfig.fees.length > 0) {
                          return feeConfig.fees;
                        }
                        const chainInfo = chainStore.getChain(
                          feeConfig.chainId
                        );
                        return [
                          new CoinPretty(
                            chainInfo.stakeCurrency || chainInfo.currencies[0],
                            new Dec(0)
                          ),
                        ];
                      })()
                        .map((fee) =>
                          fee
                            .quo(
                              new Dec(
                                isShowingEstimatedFee ? gasConfig?.gas || 1 : 1
                              )
                            )
                            .mul(
                              new Dec(
                                isShowingEstimatedFee
                                  ? gasSimulator?.gasEstimated || 1
                                  : 1
                              )
                            )
                            .maxDecimals(6)
                            .inequalitySymbol(true)
                            .trim(true)
                            .shrink(true)
                            .hideIBCMetadata(true)
                            .toString()
                        )
                        .join("+"),
                    }}
                  />
                }
              </Body2>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-300"]
                }
                style={{
                  textDecoration: "underline",
                  whiteSpace: "pre-wrap",
                  textUnderlineOffset: "0.2rem",
                }}
              >
                {` ${(() => {
                  let total: PricePretty | undefined;
                  let hasUnknown = false;
                  for (const fee of feeConfig.fees) {
                    if (!fee.currency.coinGeckoId) {
                      hasUnknown = true;
                      break;
                    } else {
                      const price = priceStore.calculatePrice(
                        fee
                          .quo(
                            new Dec(
                              isShowingEstimatedFee ? gasConfig?.gas || 1 : 1
                            )
                          )
                          .mul(
                            new Dec(
                              isShowingEstimatedFee
                                ? gasSimulator?.gasEstimated || 1
                                : 1
                            )
                          )
                      );
                      if (price) {
                        if (!total) {
                          total = price;
                        } else {
                          total = total.add(price);
                        }
                      }
                    }
                  }

                  if (hasUnknown || !total) {
                    return "";
                  }
                  return `(${total.toString()})`;
                })()}`}
              </Body2>
              <Box minWidth="0.875rem" height="1px" alignY="center">
                {(() => {
                  if (
                    feeConfig.uiProperties.loadingState ||
                    gasSimulator?.uiProperties.loadingState
                  ) {
                    return (
                      <Box alignY="center" marginLeft="0.25rem">
                        <LoadingIcon
                          width="1.25rem"
                          height="1.25rem"
                          color={ColorPalette["gray-200"]}
                        />
                      </Box>
                    );
                  }

                  if (
                    !disableAutomaticFeeSet &&
                    uiConfigStore.rememberLastFeeOption
                  ) {
                    return (
                      <Box minWidth="0.875rem" alignY="center" alignX="center">
                        <div
                          style={{
                            width: "0.375rem",
                            height: "0.375rem",
                            borderRadius: "99999px",
                            backgroundColor:
                              theme.mode === "light"
                                ? ColorPalette["purple-400"]
                                : ColorPalette["purple-400"],
                          }}
                        />
                      </Box>
                    );
                  }

                  if (disableAutomaticFeeSet) {
                    return (
                      <Tooltip
                        content={intl.formatMessage({
                          id: "components.input.fee-control.tooltip.external-fee-set",
                        })}
                      >
                        <Box alignY="center" marginLeft="0.25rem">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="17"
                            height="17"
                            fill="none"
                            viewBox="0 0 17 17"
                          >
                            <path
                              fill={
                                theme.mode === "light"
                                  ? ColorPalette["gray-200"]
                                  : ColorPalette["gray-300"]
                              }
                              d="M8.5 1.833A6.67 6.67 0 001.833 8.5 6.67 6.67 0 008.5 15.167 6.67 6.67 0 0015.167 8.5 6.67 6.67 0 008.5 1.833zm.667 10H7.834v-4h1.333v4zm0-5.333H7.834V5.167h1.333V6.5z"
                            />
                          </svg>
                        </Box>
                      </Tooltip>
                    );
                  }

                  return null;
                })()}
              </Box>
            </XAxis>
          </Box>
        </YAxis>
        <VerticalResizeTransition transitionAlign="top">
          {feeConfig.uiProperties.error || feeConfig.uiProperties.warning ? (
            <Box
              marginTop="1.04rem"
              borderRadius="0.5rem"
              alignX="center"
              alignY="center"
              paddingY="1.125rem"
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["orange-50"]
                  : ColorPalette["yellow-800"]
              }
            >
              <Subtitle4
                color={
                  theme.mode === "light"
                    ? ColorPalette["orange-400"]
                    : ColorPalette["yellow-400"]
                }
              >
                {(() => {
                  if (feeConfig.uiProperties.error) {
                    if (
                      feeConfig.uiProperties.error instanceof
                      InsufficientFeeError
                    ) {
                      return intl.formatMessage({
                        id: "components.input.fee-control.error.insufficient-fee",
                      });
                    }

                    return (
                      feeConfig.uiProperties.error.message ||
                      feeConfig.uiProperties.error.toString()
                    );
                  }

                  if (feeConfig.uiProperties.warning) {
                    return (
                      feeConfig.uiProperties.warning.message ||
                      feeConfig.uiProperties.warning.toString()
                    );
                  }

                  if (gasConfig.uiProperties.error) {
                    return (
                      gasConfig.uiProperties.error.message ||
                      gasConfig.uiProperties.error.toString()
                    );
                  }

                  if (gasConfig.uiProperties.warning) {
                    return (
                      gasConfig.uiProperties.warning.message ||
                      gasConfig.uiProperties.warning.toString()
                    );
                  }
                })()}
              </Subtitle4>
            </Box>
          ) : null}
        </VerticalResizeTransition>

        <Modal
          isOpen={isModalOpen}
          align="bottom"
          maxHeight="95vh"
          close={() => setIsModalOpen(false)}
        >
          {isBtc ? (
            <TransactionBTCFeeModal
              close={() => setIsModalOpen(false)}
              senderConfig={senderConfig}
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              gasSimulator={gasSimulator}
              disableAutomaticFeeSet={disableAutomaticFeeSet}
              isForEVMTx={isForEVMTx}
            />
          ) : (
            <TransactionFeeModal
              close={() => setIsModalOpen(false)}
              senderConfig={senderConfig}
              feeConfig={feeConfig as IFeeConfig}
              gasConfig={gasConfig}
              gasSimulator={gasSimulator}
              disableAutomaticFeeSet={disableAutomaticFeeSet}
              isForEVMTx={isForEVMTx}
            />
          )}
        </Modal>
      </Box>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};

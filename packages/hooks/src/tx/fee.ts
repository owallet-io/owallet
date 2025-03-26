import {
  DefaultGasPriceStep,
  FeeType,
  IBaseAmountConfig,
  IFeeConfig,
  IGasConfig,
  ISenderConfig,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter, CoinPrimitive } from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { Currency, FeeCurrency, StdFee } from "@owallet/types";
import { computedFn } from "mobx-utils";
import { useState } from "react";
import { InsufficientFeeError } from "./errors";
import { QueriesStore } from "./internal";
import { DenomHelper } from "@owallet/common";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable.ref
  protected _fee:
    | {
        type: FeeType;
        currency: Currency;
      }
    | CoinPretty[]
    | undefined = undefined;

  /**
   * `additionAmountToNeedFee` indicated that the fee config should consider the amount config's amount
   *  when checking that the fee is sufficient to send tx.
   *  If this value is true and if the amount + fee is not sufficient to send tx, it will return error.
   *  Else, only consider the fee without addition the amount.
   * @protected
   */
  @observable
  protected additionAmountToNeedFee: boolean = true;

  @observable
  protected computeTerraClassicTax: boolean = false;

  @observable
  protected _disableBalanceCheck: boolean = false;

  @observable
  protected _l1DataFee: Dec | undefined = undefined;

  @observable
  protected exchangeRate: number | undefined = undefined;

  @observable
  protected _manualFee:
    | {
        amount: string;
        currency: FeeCurrency;
      }[]
    | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig,
    protected readonly amountConfig: IBaseAmountConfig,
    protected readonly gasConfig: IGasConfig,
    additionAmountToNeedFee: boolean = true,
    computeTerraClassicTax: boolean = false
  ) {
    super(chainGetter, initialChainId);

    this.additionAmountToNeedFee = additionAmountToNeedFee;
    this.computeTerraClassicTax = computeTerraClassicTax;

    makeObservable(this);
  }

  @action
  setAdditionAmountToNeedFee(additionAmountToNeedFee: boolean) {
    this.additionAmountToNeedFee = additionAmountToNeedFee;
  }

  @action
  setComputeTerraClassicTax(computeTerraClassicTax: boolean) {
    this.computeTerraClassicTax = computeTerraClassicTax;
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }

  get type(): FeeType | "manual" {
    if (!this.fee) {
      return "manual";
    }

    if ("type" in this.fee) {
      return this.fee.type;
    }

    return "manual";
  }

  @computed
  protected get fee():
    | {
        type: FeeType;
        currency: Currency;
      }
    | CoinPretty[]
    | undefined {
    if (!this._fee) {
      return undefined;
    }

    if ("type" in this._fee) {
      const coinMinimalDenom = this._fee.currency.coinMinimalDenom;
      const feeCurrency = this.chainGetter
        .getChain(this.chainId)
        .feeCurrencies.find((cur) => cur.coinMinimalDenom === coinMinimalDenom);
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(coinMinimalDenom);

      return {
        type: this._fee.type,
        currency: {
          ...feeCurrency,
          ...currency,
        },
      };
    }

    return this._fee.map((coin) => {
      const coinMinimalDenom = coin.currency.coinMinimalDenom;
      const feeCurrency = this.chainGetter
        .getChain(this.chainId)
        .feeCurrencies.find((cur) => cur.coinMinimalDenom === coinMinimalDenom);
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(coinMinimalDenom);

      return new CoinPretty(
        {
          ...feeCurrency,
          ...currency,
        },
        coin.toCoin().amount
      );
    });
  }

  @action
  setFee(
    fee:
      | {
          type: FeeType;
          currency: Currency;
        }
      | CoinPretty
      | CoinPretty[]
      | undefined
  ): void {
    if (fee && "type" in fee) {
      // Destruct it to ensure ref update.
      this._fee = {
        ...fee,
      };
    } else if (fee) {
      if ("length" in fee) {
        this._fee = fee;
      } else {
        //@ts-ignore
        this._fee = [fee];
      }
    } else {
      this._fee = undefined;
    }
    this._manualFee = undefined;
  }

  @action
  setManualFee(fee: { amount: string; currency: FeeCurrency }[]) {
    this._manualFee = fee;
    this._fee = undefined;
  }

  @computed
  get selectableFeeCurrencies(): FeeCurrency[] {
    if (
      this.chainInfo.bip44.coinType === 60 ||
      this.chainInfo.hasFeature("eth-address-gen") ||
      this.chainInfo.hasFeature("eth-key-sign") ||
      ("evm" in this.chainInfo && this.chainInfo.evm)
    ) {
      return this.chainInfo.feeCurrencies.slice(0, 1);
    }

    if (this.canOsmosisTxFeesAndReady()) {
      const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;

      if (queryOsmosis) {
        const txFees = queryOsmosis.queryTxFeesFeeTokens;

        const exists: { [denom: string]: boolean | undefined } = {};

        // To reduce the confusion, add the priority to native (not ibc token) currency.
        // And, put the most priority to the base denom.
        // Remainings are sorted in alphabetical order.
        return this.chainInfo.feeCurrencies
          .concat(txFees.feeCurrencies)
          .filter((cur) => {
            if (!exists[cur.coinMinimalDenom]) {
              exists[cur.coinMinimalDenom] = true;
              return true;
            }

            return false;
          })
          .sort((cur1, cur2) => {
            if (
              cur1.coinMinimalDenom ===
              queryOsmosis.queryTxFeesBaseDenom.baseDenom
            ) {
              return -1;
            }
            if (
              cur2.coinMinimalDenom ===
              queryOsmosis.queryTxFeesBaseDenom.baseDenom
            ) {
              return 1;
            }

            const cur1IsIBCToken = cur1.coinMinimalDenom.startsWith("ibc/");
            const cur2IsIBCToken = cur2.coinMinimalDenom.startsWith("ibc/");
            if (cur1IsIBCToken && !cur2IsIBCToken) {
              return 1;
            }
            if (!cur1IsIBCToken && cur2IsIBCToken) {
              return -1;
            }

            return cur1.coinMinimalDenom < cur2.coinMinimalDenom ? -1 : 1;
          });
      }
    } else if (this.canFeeMarketTxFeesAndReady()) {
      const queryCosmos = this.queriesStore.get(this.chainId).cosmos;
      if (queryCosmos) {
        const gasPrices = queryCosmos.queryFeeMarketGasPrices.gasPrices;

        const found: FeeCurrency[] = [];
        for (const gasPrice of gasPrices) {
          const cur = this.chainInfo.findCurrency(gasPrice.denom);
          if (cur) {
            found.push(cur);
          }
        }

        const firstFeeDenom =
          this.chainInfo.feeCurrencies.length > 0
            ? this.chainInfo.feeCurrencies[0].coinMinimalDenom
            : "";
        return found.sort((cur1, cur2) => {
          // firstFeeDenom should be the first.
          // others should be sorted in alphabetical order.
          if (cur1.coinMinimalDenom === firstFeeDenom) {
            return -1;
          }
          if (cur2.coinMinimalDenom === firstFeeDenom) {
            return 1;
          }
          return cur1.coinDenom < cur2.coinDenom ? -1 : 1;
        });
      }
    }

    const res: FeeCurrency[] = [];

    for (const feeCurrency of this.chainInfo.feeCurrencies) {
      const cur = this.chainInfo.findCurrency(feeCurrency.coinMinimalDenom);
      if (cur) {
        res.push({
          ...feeCurrency,
          ...cur,
        });
      }
    }

    return res;
  }

  toStdFee(): StdFee {
    const primitive = this.getFeePrimitive();

    return {
      gas: this.gasConfig.gas.toString(),
      amount: primitive.map((p) => {
        return {
          amount: p.amount,
          denom: p.currency.coinMinimalDenom,
        };
      }),
    };
  }

  @computed
  get fees(): CoinPretty[] {
    const primitives = this.getFeePrimitive();

    return primitives.map((p) => {
      return new CoinPretty(p.currency, p.amount);
    });
  }

  getFeePrimitive(): {
    amount: string;
    currency: FeeCurrency;
  }[] {
    let res: {
      amount: string;
      currency: FeeCurrency;
    }[] = [];

    // If there is no fee currency, just return with empty fee amount.
    if (this._manualFee) {
      return this._manualFee;
    }
    if (!this.fee) {
      res = [];
    } else if ("type" in this.fee) {
      res = [
        {
          amount: this.getFeeTypePrettyForFeeCurrency(
            this.fee.currency,
            this.fee.type
          ).toCoin().amount,
          currency: this.fee.currency,
        },
      ];
    } else {
      res = this.fee.map((fee) => {
        return {
          amount: fee
            .add(
              this.l1DataFee?.quo(
                DecUtils.getTenExponentN(fee.currency.coinDecimals)
              ) ?? new Dec(0)
            )
            .toCoin().amount,
          currency: fee.currency,
        };
      });
    }

    if (
      res.length > 0 &&
      this.computeTerraClassicTax &&
      this.chainInfo.features &&
      this.chainInfo.features.includes("terra-classic-fee")
    ) {
      const etcQueries = this.queriesStore.get(this.chainId).owalletETC;
      if (
        etcQueries &&
        etcQueries.queryTerraClassicTaxRate.response &&
        etcQueries.queryTerraClassicTaxCaps.response
      ) {
        const taxRate = etcQueries.queryTerraClassicTaxRate.taxRate;
        if (taxRate && taxRate.toDec().gt(new Dec(0))) {
          const sendAmount = this.amountConfig.amount;
          for (const sendAmt of sendAmount) {
            if (
              new DenomHelper(sendAmt.currency.coinMinimalDenom).type ===
              "native"
            ) {
              let tax = sendAmt
                .toDec()
                .mul(DecUtils.getTenExponentN(sendAmt.currency.coinDecimals))
                .mul(taxRate.toDec());
              const taxCap = etcQueries.queryTerraClassicTaxCaps.getTaxCaps(
                sendAmt.currency.coinMinimalDenom
              );
              if (taxCap && tax.roundUp().gt(taxCap)) {
                tax = taxCap.toDec();
              }

              const taxAmount = tax.roundUp();
              if (taxAmount.isPositive()) {
                const i = res.findIndex(
                  (f) =>
                    f.currency.coinMinimalDenom ===
                    sendAmt.currency.coinMinimalDenom
                );
                if (i >= 0) {
                  res[i] = {
                    amount: new Int(res[i].amount).add(taxAmount).toString(),
                    currency: res[i].currency,
                  };
                } else {
                  res.push({
                    amount: taxAmount.toString(),
                    currency: sendAmt.currency,
                  });
                }
              }
            }
          }
        }
      }
    }

    return res;
  }

  protected canOsmosisTxFeesAndReady(): boolean {
    if (this.chainInfo.hasFeature("osmosis-txfees")) {
      const queries = this.queriesStore.get(this.chainId);
      if (!queries.osmosis) {
        console.log(
          "Chain has osmosis-txfees feature. But no osmosis queries provided."
        );
        return false;
      }

      const queryBaseDenom = queries.osmosis.queryTxFeesBaseDenom;

      if (
        queryBaseDenom.baseDenom &&
        this.chainInfo.feeCurrencies.find(
          (cur) => cur.coinMinimalDenom === queryBaseDenom.baseDenom
        )
      ) {
        return true;
      }
    }

    return false;
  }

  protected canFeeMarketTxFeesAndReady(): boolean {
    if (this.chainInfo.hasFeature("feemarket")) {
      const queries = this.queriesStore.get(this.chainId);
      if (!queries.cosmos) {
        console.log(
          "Chain has feemarket feature. But no cosmos queries provided."
        );
        return false;
      }

      const queryFeeMarketGasPrices = queries.cosmos.queryFeeMarketGasPrices;

      if (queryFeeMarketGasPrices.gasPrices.length === 0) {
        return false;
      }

      for (let i = 0; i < queryFeeMarketGasPrices.gasPrices.length; i++) {
        const gasPrice = queryFeeMarketGasPrices.gasPrices[i];
        // 일단 모든 currency에 대해서 find를 시도한다.
        this.chainInfo.findCurrency(gasPrice.denom);
      }

      return (
        queryFeeMarketGasPrices.gasPrices.find((gasPrice) =>
          this.chainInfo.findCurrency(gasPrice.denom)
        ) != null
      );
    }

    return false;
  }

  protected canEIP1559TxFeesAndReady(isRefresh?: boolean): boolean {
    if (this.chainInfo.evm && this.senderConfig.sender.startsWith("0x")) {
      const queries = this.queriesStore.get(this.chainId);
      if (!queries.ethereum) {
        console.log("Chain supports EVM. But no ethereum queries provided.");
        return false;
      }

      const feeHistoryQuery =
        queries.ethereum.queryEthereumFeeHistory.getQueryByFeeHistoryParams(
          ETH_FEE_HISTRORY_BLOCK_COUNT,
          ETH_FEE_HISTORY_NEWEST_BLOCK,
          ETH_FEE_HISTORY_REWARD_PERCENTILES
        );
      const latestBaseFeePerGas = parseInt(
        feeHistoryQuery.feeHistory?.baseFeePerGas?.[
          feeHistoryQuery.feeHistory?.baseFeePerGas.length - 1
        ] ?? "0"
      );

      if (feeHistoryQuery.feeHistory != null && latestBaseFeePerGas !== 0) {
        // Fetch `maxPriorityFeePerGas` in advance here, but it's not mandatory to make sure it's ready.
        const maxPriorityFeePerGasQuery =
          queries.ethereum.queryEthereumMaxPriorityFee;
        maxPriorityFeePerGasQuery.maxPriorityFeePerGas;

        if (isRefresh) {
          feeHistoryQuery.waitFreshResponse();

          if (maxPriorityFeePerGasQuery != null) {
            maxPriorityFeePerGasQuery.waitFreshResponse();
          }
        }
        return true;
      } else {
        const blockQuery =
          queries.ethereum.queryEthereumBlock.getQueryByBlockNumberOrTag(
            ETH_FEE_HISTORY_NEWEST_BLOCK
          );
        const latestBaseFeePerGas = parseInt(
          blockQuery.block?.baseFeePerGas ?? "0"
        );
        const maxPriorityFeePerGasQuery =
          queries.ethereum.queryEthereumMaxPriorityFee;
        if (
          blockQuery.block != null &&
          latestBaseFeePerGas !== 0 &&
          maxPriorityFeePerGasQuery.maxPriorityFeePerGas != null
        ) {
          if (isRefresh) {
            blockQuery.waitFreshResponse();
            maxPriorityFeePerGasQuery.waitFreshResponse();
          }
          return true;
        } else {
          const gasPriceQuery = queries.ethereum.queryEthereumGasPrice;
          if (gasPriceQuery.gasPrice != null) {
            if (isRefresh) {
              feeHistoryQuery.waitFreshResponse();
            }
            return true;
          }
        }
      }
    }

    return false;
  }

  get l1DataFee(): Dec | undefined {
    return this._l1DataFee;
  }

  @action
  setL1DataFee(fee: Dec) {
    this._l1DataFee = fee;
  }

  get currencyExchangeRate(): number | undefined {
    return this.exchangeRate;
  }

  @action
  setExchangeRate(rate: number) {
    this.exchangeRate = rate;
  }

  readonly getFeeTypePrettyForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType) => {
      const gas = this.gasConfig.gas;
      const gasPrice = this.getGasPriceForFeeCurrency(feeCurrency, feeType);

      console.log("gasPrice222", gas, gasPrice.toString());

      let feeAmount = gasPrice
        .mul(new Dec(gas))
        .add(this.l1DataFee ?? new Dec(0));

      // Apply exchange rate if present
      if (this.exchangeRate) {
        console.log("Applying exchange rate:", this.exchangeRate);
        console.log("Before exchange rate:", feeAmount.toString());
        feeAmount = feeAmount.mul(new Dec(this.exchangeRate));
        console.log("After exchange rate:", feeAmount.toString());
      }

      console.log(
        "feeAmount 2",
        feeAmount.toString(),
        feeAmount.roundUp().toString(),
        this.l1DataFee
      );

      return new CoinPretty(feeCurrency, feeAmount.roundUp()).maxDecimals(
        feeCurrency.coinDecimals
      );
    }
  );

  readonly getGasPriceForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType): Dec => {
      if (
        this.chainInfo.hasFeature("osmosis-base-fee-beta") ||
        this.canOsmosisTxFeesAndReady()
      ) {
        const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;
        if (queryOsmosis) {
          const baseDenom = queryOsmosis.queryTxFeesBaseDenom.baseDenom;
          let baseFeeCurrency =
            this.selectableFeeCurrencies.find(
              (c) => c.coinMinimalDenom === baseDenom
            ) || this.chainInfo.feeCurrencies[0];

          if (this.chainInfo.hasFeature("osmosis-base-fee-beta")) {
            const remoteBaseFeeStep = this.queriesStore.simpleQuery.queryGet<{
              low?: number;
              average?: number;
              high?: number;
            }>(
              "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws/osmosis/osmosis-base-fee-beta.json"
            );

            const baseFee = queryOsmosis.queryBaseFee.baseFee;
            if (baseFee) {
              const low = remoteBaseFeeStep.response?.data.low
                ? parseFloat(
                    baseFee
                      .mul(new Dec(remoteBaseFeeStep.response.data.low))
                      .toString(8)
                  )
                : baseFeeCurrency.gasPriceStep?.low ?? DefaultGasPriceStep.low;
              const average = Math.max(
                low,
                remoteBaseFeeStep.response?.data.average
                  ? parseFloat(
                      baseFee
                        .mul(new Dec(remoteBaseFeeStep.response.data.average))
                        .toString(8)
                    )
                  : baseFeeCurrency.gasPriceStep?.average ??
                      DefaultGasPriceStep.average
              );
              const high = Math.max(
                average,
                remoteBaseFeeStep.response?.data.high
                  ? parseFloat(
                      baseFee
                        .mul(new Dec(remoteBaseFeeStep.response.data.high))
                        .toString(8)
                    )
                  : baseFeeCurrency.gasPriceStep?.high ??
                      DefaultGasPriceStep.high
              );

              baseFeeCurrency = {
                ...baseFeeCurrency,
                gasPriceStep: {
                  low,
                  average,
                  high,
                },
              };
            }
          }

          if (this.canOsmosisTxFeesAndReady()) {
            if (
              feeCurrency.coinMinimalDenom !== baseDenom &&
              queryOsmosis.queryTxFeesFeeTokens.isTxFeeToken(
                feeCurrency.coinMinimalDenom
              )
            ) {
              const baseGasPriceStep =
                baseFeeCurrency.gasPriceStep ?? DefaultGasPriceStep;

              const baseGasPrice = new Dec(
                baseGasPriceStep[feeType].toString()
              );
              const spotPriceDec =
                queryOsmosis.queryTxFeesSpotPriceByDenom.getQueryDenom(
                  feeCurrency.coinMinimalDenom
                ).spotPriceDec;
              if (spotPriceDec.gt(new Dec(0))) {
                // If you calculate only the spot price, slippage cannot be considered
                // However, rather than performing the actual calculation here,
                // the slippage problem is avoided by simply giving an additional value of 1%.
                return baseGasPrice.quo(spotPriceDec).mul(new Dec(1.01));
              } else {
                return new Dec(0);
              }
            }
          }

          if (
            feeCurrency.coinMinimalDenom === baseFeeCurrency.coinMinimalDenom
          ) {
            return this.populateGasPriceStep(baseFeeCurrency, feeType);
          }
        }
      } else if (this.canFeeMarketTxFeesAndReady()) {
        const queryCosmos = this.queriesStore.get(this.chainId).cosmos;
        if (queryCosmos) {
          const gasPrices = queryCosmos.queryFeeMarketGasPrices.gasPrices;

          const gasPrice = gasPrices.find(
            (gasPrice) => gasPrice.denom === feeCurrency.coinMinimalDenom
          );

          console.log("gasPrice111 ", gasPrice);

          if (gasPrice) {
            let multiplication = {
              low: 1.1,
              average: 1.2,
              high: 1.3,
            };

            const multificationConfig = this.queriesStore.simpleQuery.queryGet<{
              [str: string]:
                | {
                    low: number;
                    average: number;
                    high: number;
                  }
                | undefined;
            }>(
              "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws",
              "/feemarket/info.json"
            );

            if (multificationConfig.response) {
              const _default = multificationConfig.response.data["__default__"];
              if (
                _default &&
                _default.low != null &&
                typeof _default.low === "number" &&
                _default.average != null &&
                typeof _default.average === "number" &&
                _default.high != null &&
                typeof _default.high === "number"
              ) {
                multiplication = {
                  low: _default.low,
                  average: _default.average,
                  high: _default.high,
                };
              }
              const specific =
                multificationConfig.response.data[
                  this.chainInfo.chainIdentifier
                ];
              if (
                specific &&
                specific.low != null &&
                typeof specific.low === "number" &&
                specific.average != null &&
                typeof specific.average === "number" &&
                specific.high != null &&
                typeof specific.high === "number"
              ) {
                multiplication = {
                  low: specific.low,
                  average: specific.average,
                  high: specific.high,
                };
              }
            }
            switch (feeType) {
              case "low":
                return new Dec(multiplication.low).mul(gasPrice.amount);
              case "average":
                return new Dec(multiplication.average).mul(gasPrice.amount);
              case "high":
                return new Dec(multiplication.high).mul(gasPrice.amount);
            }
          }
        }
      }

      if (this.canEIP1559TxFeesAndReady()) {
        const { maxFeePerGas, gasPrice } = this.getEIP1559TxFees(feeType);

        return maxFeePerGas ?? gasPrice;
      }

      // TODO: Handle terra classic fee

      return this.populateGasPriceStep(feeCurrency, feeType);
    }
  );

  refreshEIP1559TxFees() {
    this.canEIP1559TxFeesAndReady(true);
  }

  readonly getEIP1559TxFees = computedFn(
    (feeTypeOrManual: FeeType | "manual") => {
      const feeType =
        feeTypeOrManual === "manual" ? "average" : feeTypeOrManual;
      console.log("feeType", feeType);

      const ethereumQueries = this.queriesStore.get(this.chainId).ethereum;

      if (ethereumQueries && this.canEIP1559TxFeesAndReady()) {
        const feeHistory =
          ethereumQueries.queryEthereumFeeHistory.getQueryByFeeHistoryParams(
            ETH_FEE_HISTRORY_BLOCK_COUNT,
            ETH_FEE_HISTORY_NEWEST_BLOCK,
            ETH_FEE_HISTORY_REWARD_PERCENTILES
          ).feeHistory;
        console.log("feeHistory", feeHistory);

        const latestBaseFeePerGas = parseInt(
          feeHistory?.baseFeePerGas?.[feeHistory?.baseFeePerGas.length - 1] ??
            "0"
        );

        console.log("latestBaseFeePerGas", latestBaseFeePerGas);

        if (feeHistory != null && latestBaseFeePerGas !== 0) {
          const baseFeePerGasDec = new Dec(latestBaseFeePerGas).mul(
            ETH_FEE_SETTINGS_BY_FEE_TYPE[feeType].baseFeePercentageMultiplier
          );
          const priorityFeesPerGas = feeHistory.reward?.map(
            (priorityFeeByRewardPercentileIndex) =>
              priorityFeeByRewardPercentileIndex[
                ETH_FEE_HISTORY_REWARD_PERCENTILES.findIndex(
                  (percentile) =>
                    percentile ===
                    ETH_FEE_SETTINGS_BY_FEE_TYPE[feeType].percentile
                )
              ]
          );
          const medianOfPriorityFeesPerGas =
            priorityFeesPerGas?.sort((a, b) => Number(BigInt(a) - BigInt(b)))?.[
              Math.floor((priorityFeesPerGas.length - 1) / 2)
            ] ?? "0";
          const maxPriorityFeePerGasDec = new Dec(
            BigInt(medianOfPriorityFeesPerGas)
          );

          if (maxPriorityFeePerGasDec.isZero()) {
            const maxPriorityFeePerGas =
              ethereumQueries.queryEthereumMaxPriorityFee.maxPriorityFeePerGas;
            if (maxPriorityFeePerGas != null) {
              const maxPriorityFeePerGasDec = new Dec(
                BigInt(maxPriorityFeePerGas)
              );
              const maxFeePerGas = baseFeePerGasDec.add(
                maxPriorityFeePerGasDec
              );

              return {
                maxPriorityFeePerGas: maxPriorityFeePerGasDec.truncateDec(),
                maxFeePerGas: maxFeePerGas.truncateDec(),
              };
            }
          }
          const maxFeePerGas = baseFeePerGasDec.add(maxPriorityFeePerGasDec);

          return {
            maxPriorityFeePerGas: maxPriorityFeePerGasDec.truncateDec(),
            maxFeePerGas: maxFeePerGas.truncateDec(),
          };
        } else {
          const block =
            ethereumQueries.queryEthereumBlock.getQueryByBlockNumberOrTag(
              ETH_FEE_HISTORY_NEWEST_BLOCK
            ).block;
          const latestBaseFeePerGas = parseInt(block?.baseFeePerGas ?? "0");
          const maxPriorityFeePerGas =
            ethereumQueries.queryEthereumMaxPriorityFee.maxPriorityFeePerGas;
          if (
            block != null &&
            latestBaseFeePerGas !== 0 &&
            maxPriorityFeePerGas != null
          ) {
            const baseFeePerGasDec = new Dec(latestBaseFeePerGas).mul(
              ETH_FEE_SETTINGS_BY_FEE_TYPE[feeType].baseFeePercentageMultiplier
            );
            const maxPriorityFeePerGasDec = new Dec(
              BigInt(maxPriorityFeePerGas)
            );
            const maxFeePerGas = baseFeePerGasDec.add(maxPriorityFeePerGasDec);

            return {
              maxPriorityFeePerGas: maxPriorityFeePerGasDec.truncateDec(),
              maxFeePerGas: maxFeePerGas.truncateDec(),
            };
          } else {
            const gasPrice = ethereumQueries.queryEthereumGasPrice.gasPrice;

            if (gasPrice != null) {
              const multipliedGasPrice = new Dec(BigInt(gasPrice)).mul(
                ETH_FEE_SETTINGS_BY_FEE_TYPE[feeType]
                  .baseFeePercentageMultiplier
              );

              return {
                gasPrice: multipliedGasPrice,
              };
            }
          }
        }
      }

      return {
        gasPrice: new Dec(0),
      };
    }
  );

  protected populateGasPriceStep(
    feeCurrency: FeeCurrency,
    feeType: FeeType
  ): Dec {
    const gasPriceStep = feeCurrency.gasPriceStep ?? DefaultGasPriceStep;
    let gasPrice = new Dec(0);
    switch (feeType) {
      case "low": {
        gasPrice = new Dec(gasPriceStep.low);
        break;
      }
      case "average": {
        gasPrice = new Dec(gasPriceStep.average);
        break;
      }
      case "high": {
        gasPrice = new Dec(gasPriceStep.high);
        break;
      }
      default: {
        throw new Error(`Unknown fee type: ${feeType}`);
      }
    }

    return gasPrice;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this.disableBalanceCheck) {
      return {};
    }

    const fee = this.getFeePrimitive();
    if (!fee) {
      return {};
    }

    if (
      fee.length > 0 &&
      this.computeTerraClassicTax &&
      this.chainInfo.features &&
      this.chainInfo.features.includes("terra-classic-fee")
    ) {
      const etcQueries = this.queriesStore.get(this.chainId).owalletETC;
      if (etcQueries) {
        if (
          etcQueries.queryTerraClassicTaxRate.error ||
          etcQueries.queryTerraClassicTaxRate.isFetching
        ) {
          return {
            error: (() => {
              if (etcQueries.queryTerraClassicTaxRate.error) {
                return new Error("Failed to fetch tax rate");
              }
            })(),
            loadingState: etcQueries.queryTerraClassicTaxRate.isFetching
              ? "loading-block"
              : undefined,
          };
        }

        if (
          etcQueries.queryTerraClassicTaxCaps.error ||
          etcQueries.queryTerraClassicTaxCaps.isFetching
        ) {
          return {
            error: (() => {
              if (etcQueries.queryTerraClassicTaxCaps.error) {
                return new Error("Failed to fetch tax rate");
              }
            })(),
            loadingState: etcQueries.queryTerraClassicTaxCaps.isFetching
              ? "loading-block"
              : undefined,
          };
        }
      }
    }

    if (this.chainInfo.hasFeature("osmosis-base-fee-beta")) {
      const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;
      if (queryOsmosis) {
        const queryBaseFee = queryOsmosis.queryBaseFee;
        const baseFee = queryBaseFee.baseFee;
        if (!baseFee) {
          return {
            loadingState: "loading-block",
          };
        }
        if (queryBaseFee.isFetching) {
          return {
            loadingState: "loading",
          };
        }
        if (queryBaseFee.error) {
          return {
            warning: new Error("Failed to fetch base fee"),
          };
        }
      }
    } else if (this.canFeeMarketTxFeesAndReady()) {
      const queryCosmos = this.queriesStore.get(this.chainId).cosmos;
      if (queryCosmos) {
        const queryFeeMarketGasPrices = queryCosmos.queryFeeMarketGasPrices;
        if (queryFeeMarketGasPrices.error) {
          return {
            warning: new Error("Failed to fetch gas prices"),
          };
        }
        if (!queryFeeMarketGasPrices.response) {
          return {
            loadingState: "loading-block",
          };
        }
        if (queryFeeMarketGasPrices.isFetching) {
          return {
            loadingState: "loading",
          };
        }
      }
    }

    if (this.canOsmosisTxFeesAndReady()) {
      const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;
      if (queryOsmosis && this.getFeePrimitive().length > 0) {
        const baseDenom = queryOsmosis.queryTxFeesBaseDenom.baseDenom;
        const feeCurrency = this.getFeePrimitive()[0].currency;
        if (
          feeCurrency.coinMinimalDenom !== baseDenom &&
          queryOsmosis.queryTxFeesFeeTokens.isTxFeeToken(
            feeCurrency.coinMinimalDenom
          )
        ) {
          const spotPrice =
            queryOsmosis.queryTxFeesSpotPriceByDenom.getQueryDenom(
              feeCurrency.coinMinimalDenom
            );

          const error = (() => {
            if (spotPrice.error) {
              return new Error("Failed to fetch spot price");
            }
          })();
          const loadingState = (() => {
            if (!spotPrice.response) {
              return "loading-block";
            }

            if (spotPrice.isFetching) {
              return "loading";
            }
          })();

          // Return only needed.
          // There is proceeding logic to validate the balance.
          if (error || loadingState) {
            return {
              error,
              loadingState,
            };
          }
        }
      }
    }

    if (this.canEIP1559TxFeesAndReady()) {
      const ethereumQueries = this.queriesStore.get(this.chainId).ethereum;
      if (ethereumQueries) {
        const feeHistoryQuery =
          ethereumQueries.queryEthereumFeeHistory.getQueryByFeeHistoryParams(
            ETH_FEE_HISTRORY_BLOCK_COUNT,
            ETH_FEE_HISTORY_NEWEST_BLOCK,
            ETH_FEE_HISTORY_REWARD_PERCENTILES
          );

        if (feeHistoryQuery.error) {
          return {
            warning: new Error("Failed to fetch fee history"),
          };
        }

        if (feeHistoryQuery.isFetching) {
          return {
            loadingState: "loading",
          };
        }

        if (!feeHistoryQuery.response) {
          const blockQuery =
            ethereumQueries.queryEthereumBlock.getQueryByBlockNumberOrTag(
              ETH_FEE_HISTORY_NEWEST_BLOCK
            );
          const maxPriorityFeePerGasQuery =
            ethereumQueries.queryEthereumMaxPriorityFee;

          if (blockQuery.error || maxPriorityFeePerGasQuery.error) {
            return {
              warning: new Error("Failed to fetch block or max priority fee"),
            };
          }

          if (blockQuery.isFetching || maxPriorityFeePerGasQuery.isFetching) {
            return {
              loadingState: "loading",
            };
          }

          if (!blockQuery.response || !maxPriorityFeePerGasQuery.response) {
            return {
              loadingState: "loading-block",
            };
          }
        }
      }
    }

    const amount = this.amountConfig.amount;

    const needs = fee.slice();
    if (this.additionAmountToNeedFee) {
      for (let i = 0; i < needs.length; i++) {
        const need = needs[i];
        for (const amt of amount) {
          if (
            need.currency.coinMinimalDenom === amt.currency.coinMinimalDenom
          ) {
            needs[i] = {
              ...need,
              amount: new Int(need.amount)
                .add(new Int(amt.toCoin().amount))
                .toString(),
            };
          }
        }
      }
    }

    for (let i = 0; i < needs.length; i++) {
      const need = needs[i];

      if (new Int(need.amount).lte(new Int(0))) {
        continue;
      }

      const bal = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.senderConfig.value)
        .balances.find(
          (bal) =>
            bal.currency.coinMinimalDenom === need.currency.coinMinimalDenom
        );

      if (!bal) {
        return {
          warning: new Error(
            `Can't parse the balance for ${need.currency.coinMinimalDenom}`
          ),
        };
      }

      if (bal.error) {
        return {
          warning: new Error("Failed to fetch balance"),
        };
      }

      if (!bal.response) {
        return {
          loadingState: "loading-block",
        };
      }

      if (new Int(bal.balance.toCoin().amount).lt(new Int(need.amount))) {
        return {
          error: new InsufficientFeeError("Insufficient fee"),
          loadingState: bal.isFetching ? "loading" : undefined,
        };
      }
    }

    return {};
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  amountConfig: IBaseAmountConfig,
  gasConfig: IGasConfig,
  opts: {
    additionAmountToNeedFee?: boolean;
    computeTerraClassicTax?: boolean;
  } = {}
) => {
  const [config] = useState(
    () =>
      new FeeConfig(
        chainGetter,
        queriesStore,
        chainId,
        senderConfig,
        amountConfig,
        gasConfig,
        opts.additionAmountToNeedFee ?? true,
        opts.computeTerraClassicTax ?? false
      )
  );
  config.setChain(chainId);
  config.setAdditionAmountToNeedFee(opts.additionAmountToNeedFee ?? true);
  config.setComputeTerraClassicTax(opts.computeTerraClassicTax ?? false);

  return config;
};

const ETH_FEE_SETTINGS_BY_FEE_TYPE: Record<
  FeeType,
  {
    percentile: number;
    baseFeePercentageMultiplier: Dec;
  }
> = {
  low: {
    percentile: 10,
    baseFeePercentageMultiplier: new Dec(1),
  },
  average: {
    percentile: 40,
    baseFeePercentageMultiplier: new Dec(1.125),
  },
  high: {
    percentile: 70,
    baseFeePercentageMultiplier: new Dec(1.25),
  },
};
const ETH_FEE_HISTRORY_BLOCK_COUNT = 3;
const ETH_FEE_HISTORY_NEWEST_BLOCK = "latest";
const ETH_FEE_HISTORY_REWARD_PERCENTILES = [
  ETH_FEE_SETTINGS_BY_FEE_TYPE.low.percentile,
  ETH_FEE_SETTINGS_BY_FEE_TYPE.average.percentile,
  ETH_FEE_SETTINGS_BY_FEE_TYPE.high.percentile,
];

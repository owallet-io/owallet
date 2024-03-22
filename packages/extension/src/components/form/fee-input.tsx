import React, { FunctionComponent, useEffect, useState } from "react";
import { FormGroup, Label } from "reactstrap";
import {
  FeeConfig,
  GasConfig,
  IFeeConfig,
  IFeeEthereumConfig,
  IGasEthereumConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import Big from "big.js";
import { Input } from "../../components/form";
import { Dec, DecUtils } from "@owallet/unit";
import { useIntl } from "react-intl";

export interface GasInputProps {
  feeConfig: FeeConfig;
  gasConfig: GasConfig;
  decimals: number;

  label?: string;
  className?: string;
  defaultValue?: number;
  gasPrice?: number | string | Big;

  denom?: string | unknown | any;
  classNameInputGroup?: string | unknown | any;
  classNameInput?: string | unknown | any;
}

// TODO: Handle the max block gas limit(?)
export const FeeInput: FunctionComponent<GasInputProps> = observer(
  ({
    feeConfig,
    label,
    className,
    defaultValue,
    gasConfig,
    gasPrice,
    decimals,
    denom,
    classNameInputGroup,
    classNameInput,
  }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });
    const intl = useIntl();
    // useEffect(() => {
    //   try {
    //     if (gasConfig.gasRaw !== "NaN" && gasPrice != "NaN") {
    //       feeConfig.setFee(
    //         new Big(parseInt(gasConfig.gasRaw)).mul(gasPrice).toFixed(decimals)
    //       );
    //     } else {
    //       feeConfig.setFee(parseFloat(feeConfig.feeRaw).toString());
    //     }
    //   } catch (error) {
    //     feeConfig.setFee(parseFloat(feeConfig.feeRaw).toString());
    //   }
    // }, [gasConfig.gasRaw, gasPrice]);
    const error = feeConfig.getError();
    const errorText: string | undefined = (() => {
      if (error) {
        switch (error.constructor) {
          case InsufficientFeeError:
            return intl.formatMessage({
              id: "input.fee.error.insufficient",
            });
          case NotLoadedFeeError:
            return undefined;
          default:
            return (
              error.message ||
              intl.formatMessage({ id: "input.fee.error.unknown" })
            );
        }
      }
    })();
    return (
      <FormGroup className={className}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <Input
          // type="number"
          classNameInputGroup={classNameInputGroup}
          value={feeConfig.fee
            ?.shrink(true)
            ?.trim(true)
            ?.hideDenom(true)
            ?.toString()}
          className={classNameInput}
          disabled
          // style={{
          //   backgroundColor: 'rgba(230, 232, 236, 0.2)'
          // }}
          // onChange={(e) => {
          //   // feeConfig.setManualFee(e.target.value);
          //   const fee = new Dec(Number(e.target.value.replace(/,/g, '.'))).mul(
          //     DecUtils.getTenExponentNInPrecisionRange(feeConfig.feeCurrency.coinDecimals)
          //   );
          //   console.log('🚀 ~ fee.roundUp().toString():', fee.roundUp().toString());
          //   feeConfig.setManualFee({
          //     amount: fee.roundUp().toString(),
          //     denom: feeConfig.feeCurrency.coinMinimalDenom
          //   });

          //   e.preventDefault();
          // }}
          error={errorText}
          id={inputId}
          append={
            <span
              style={{
                padding: 10,
                color: "#777e90",
                textTransform: "uppercase",
              }}
            >
              {feeConfig.feeCurrency.coinDenom}
            </span>
          }
        />
      </FormGroup>
    );
  }
);

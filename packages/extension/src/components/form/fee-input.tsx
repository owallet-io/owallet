import React, { FunctionComponent, useEffect, useState } from "react";
import { FormGroup, Input, Label } from "reactstrap";
import {
  IFeeConfig,
  IFeeEthereumConfig,
  IGasEthereumConfig,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import Big from "big.js";
import { Input as InputEvm } from "../../components/form";

export interface GasInputProps {
  feeConfig: IFeeEthereumConfig;
  gasConfig: IGasEthereumConfig;
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

    useEffect(() => {
      try {
        if (gasConfig.gasRaw !== "NaN" && gasPrice != "NaN") {
          feeConfig.setFee(
            new Big(parseInt(gasConfig.gasRaw)).mul(gasPrice).toFixed(decimals)
          );
        } else {
          feeConfig.setFee(parseFloat(feeConfig.feeRaw).toString());
        }
      } catch (error) {
        feeConfig.setFee(parseFloat(feeConfig.feeRaw).toString());
      }
    }, [gasConfig.gasRaw, gasPrice]);

    return (
      <FormGroup className={className}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <InputEvm
          type="number"
          classNameInputGroup={classNameInputGroup}
          value={parseFloat(feeConfig.feeRaw)}
          className={classNameInput}
          // style={{
          //   backgroundColor: 'rgba(230, 232, 236, 0.2)'
          // }}
          onChange={(e) => {
            feeConfig.setFee(e.target.value);
            e.preventDefault();
          }}
          id={inputId}
          append={
            <span
              style={{
                padding: 10,
                color: "#777e90",
                textTransform: "uppercase",
              }}
            >
              {denom?.feeCurrency?.coinDenom ?? denom ?? "ORAI"}
            </span>
          }
        />
        {/* <Input
          id={inputId}
          className="form-control-alternative"
          type="number"
          value={
            parseFloat(feeConfig.feeRaw).toString() +
            ' ' +
            denom?.feeCurrency?.coinDenom
          }
          onChange={(e) => {
            feeConfig.setFee(e.target.value);
            e.preventDefault();
          }}
          defaultValue={defaultValue}
          autoComplete="off"
        /> */}
      </FormGroup>
    );
  }
);

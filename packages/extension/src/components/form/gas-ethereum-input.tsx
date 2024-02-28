import React, { FunctionComponent, useEffect, useState } from "react";
import { FormGroup, Input, Label } from "reactstrap";
import {
  IFeeEthereumConfig,
  IGasConfig,
  IGasEthereumConfig,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";

export interface GasInputProps {
  gasConfig: IGasEthereumConfig;

  label?: string;
  className?: string;
  defaultValue?: number;
}

// TODO: Handle the max block gas limit(?)
export const GasEthereumInput: FunctionComponent<GasInputProps> = observer(
  ({ gasConfig, label, className, defaultValue }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    // useEffect(() => {
    //     gasConfig.setGas(parseInt(feeConfig.feeRaw) / gasPrice);
    // }, [feeConfig.feeRaw])

    return (
      <FormGroup className={className}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <Input
          id={inputId}
          className="form-control-alternative"
          type="number"
          step={1}
          min={0}
          value={gasConfig.gasRaw}
          onChange={(e) => {
            gasConfig.setGas(e.target.value);
            e.preventDefault();
          }}
          defaultValue={defaultValue}
          autoComplete="off"
        />
      </FormGroup>
    );
  }
);

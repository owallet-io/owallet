import React, { FunctionComponent, useEffect, useState } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import {
  IFeeConfig,
  IFeeEthereumConfig,
  IGasEthereumConfig
} from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import Big from 'big.js';

export interface GasInputProps {
  feeConfig: IFeeEthereumConfig;
  gasConfig: IGasEthereumConfig;
  decimals: number;

  label?: string;
  className?: string;
  defaultValue?: number;
  gasPrice?: number | string | Big;
}

// TODO: Handle the max block gas limit(?)
export const FeeInput: FunctionComponent<GasInputProps> = observer(
  ({ feeConfig, label, className, defaultValue, gasConfig, gasPrice, decimals }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString('hex')}`;
    });

    useEffect(() => {
      try {
        if (gasConfig.gasRaw !== "NaN" && gasPrice != "NaN") {
          feeConfig.setFee(new Big(parseInt(gasConfig.gasRaw)).mul(gasPrice).toFixed(decimals));
        }
      } catch (error) {
        console.log(error);
      }
    }, [gasConfig.gasRaw, gasPrice]);

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
          value={parseFloat(feeConfig.feeRaw)}
          onChange={(e) => {
            feeConfig.setFee(e.target.value);
            e.preventDefault();
          }}
          defaultValue={defaultValue}
          autoComplete="off"
        />
      </FormGroup>
    );
  }
);

import { IGasConfig } from './types';
import { TxChainSetter } from './chain';
import { ChainGetter } from '@owallet/stores';
import { action, makeObservable, observable } from 'mobx';
import { useState } from 'react';

export class GasConfig extends TxChainSetter implements IGasConfig {
  @observable
  protected _gas: number;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialGas: number = 0
  ) {
    super(chainGetter, initialChainId);

    this._gas = initialGas;

    makeObservable(this);
  }

  get gas(): number {
    return this._gas;
  }

  @action
  setGas(gas: number | string) {
    if (typeof gas === 'number') {
      this._gasRaw = Math.floor(gas).toString();
      return;
    }

    if (gas === '') {
      this._gasRaw = gas;
      return;
    }

    // Gas must not be floated.
    if (!gas.includes('.')) {
      if (!Number.isNaN(Number.parseInt(gas))) {
        this._gasRaw = gas;
        return;
      }
    }
  }

  getError(): Error | undefined {
    if (this._gasRaw === '') {
      return new Error('Gas not set');
    }

    if (this._gasRaw && Number.isNaN(this._gasRaw)) {
      return new Error('Gas is not valid number');
    }

    if (!Number.isInteger(this.gas)) {
      return new Error('Gas is not integer');
    }

    if (this.gas <= 0) {
      return new Error('Gas should be greater than 0');
    }
    return;
  }
}

export const useGasConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialGas: number = 0
) => {
  const [txConfig] = useState(
    () => new GasConfig(chainGetter, chainId, initialGas)
  );
  txConfig.setChain(chainId);

  return txConfig;
};

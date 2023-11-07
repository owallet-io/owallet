import { fetchTaxRate } from '@owallet/common';
import { useEffect, useState } from 'react';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export const useTaxRate = (client: CosmWasmClient) => {
  const [taxRate, setTaxRate] = useState('');

  const queryTaxRate = async () => {
    const data = await fetchTaxRate(client);
    setTaxRate(data?.rate);
  };

  useEffect(() => {
    queryTaxRate();
  }, []);

  return taxRate;
};

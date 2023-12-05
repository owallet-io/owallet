import { CWStargate, fetchTaxRate, oraichainNetwork, ORAICHAIN_ID } from '@owallet/common';
import { useEffect, useState } from 'react';
import { AccountWithAll } from '@owallet/stores';

export const useTaxRate = (accountOrai: AccountWithAll) => {
  const [taxRate, setTaxRate] = useState('');

  const queryTaxRate = async () => {
    const cwClient = await CWStargate.init(accountOrai, ORAICHAIN_ID, oraichainNetwork.rpc);
    const data = await fetchTaxRate(cwClient);
    setTaxRate(data?.rate);
  };

  useEffect(() => {
    queryTaxRate();
  }, []);

  return taxRate;
};

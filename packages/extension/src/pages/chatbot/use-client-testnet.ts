import { CWStargate, ChainIdEnum } from '@owallet/common';
import { useEffect, useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { AccountWithAll } from '@owallet/stores';

export const useClientTestnet = (accountOrai: AccountWithAll) => {
  const [client, setClient] = useState<SigningCosmWasmClient>();

  const getClient = async () => {
    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.OraichainTestnet,
      'https://testnet-rpc.orai.io'
    );
    setClient(cwClient);
  };

  useEffect(() => {
    getClient();
  }, []);

  return client;
};

import { useEffect, useState } from 'react';
import { fetchRelayerFee } from '@owallet/common';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export const useRelayerFee = (client: CosmWasmClient) => {
  const [relayerFee, setRelayerFee] = useState([]);

  const queryRelayerFee = async () => {
    const data = await fetchRelayerFee(client);
    setRelayerFee(data);
  };

  useEffect(() => {
    queryRelayerFee();
  }, []);

  return relayerFee;
};

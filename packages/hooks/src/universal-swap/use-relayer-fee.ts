import { useEffect, useState } from 'react';
import { CWStargate, fetchRelayerFee, oraichainNetwork, ChainIdEnum } from '@owallet/common';
import { AccountWithAll } from '@owallet/stores';

export const useRelayerFee = (accountOrai: AccountWithAll) => {
  const [relayerFee, setRelayerFee] = useState([]);

  const queryRelayerFee = async () => {
    const cwClient = await CWStargate.init(accountOrai, ChainIdEnum.Oraichain, oraichainNetwork.rpc);
    const data = await fetchRelayerFee(cwClient);
    setRelayerFee(data);
  };

  useEffect(() => {
    queryRelayerFee();
  }, []);

  return relayerFee;
};

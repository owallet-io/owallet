import { useEffect, useState } from 'react';
import { CWStargate, fetchRelayerFee, oraichainNetwork, ORAICHAIN_ID } from '@owallet/common';
import { AccountWithAll } from '@owallet/stores';

export const useRelayerFee = (accountOrai: AccountWithAll) => {
  const [relayerFee, setRelayerFee] = useState([]);

  const queryRelayerFee = async () => {
    const cwClient = await CWStargate.init(accountOrai, ORAICHAIN_ID, oraichainNetwork.rpc);
    const data = await fetchRelayerFee(cwClient);
    setRelayerFee(data);
  };

  useEffect(() => {
    queryRelayerFee();
  }, []);

  return relayerFee;
};

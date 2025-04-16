import { CWStargate, ChainIdEnum } from "@owallet/common";
import { useEffect, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const useClient = (accountOrai: any, oraichainNetwork, network) => {
  const [client, setClient] = useState<SigningCosmWasmClient>();

  const getClient = async (oraichainNetwork, network) => {
    if (!oraichainNetwork || !oraichainNetwork.rpc) {
      return;
    }

    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.Oraichain,
      oraichainNetwork.rpc,
      network
    );
    setClient(cwClient);
  };

  useEffect(() => {
    getClient(oraichainNetwork, network);
  }, [oraichainNetwork]);

  return client;
};

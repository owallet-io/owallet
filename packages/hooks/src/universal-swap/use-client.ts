import { CWStargate, ChainIdEnum } from "@owallet/common";
import { useEffect, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const useClient = (accountOrai: any, oraichainNetwork) => {
  const [client, setClient] = useState<SigningCosmWasmClient>();

  const getClient = async (oraichainNetwork) => {
    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.Oraichain,
      oraichainNetwork.rpc
    );
    setClient(cwClient);
  };

  useEffect(() => {
    getClient(oraichainNetwork);
  }, [oraichainNetwork]);

  return client;
};

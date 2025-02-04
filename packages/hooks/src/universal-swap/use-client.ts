import { CWStargate, ChainIdEnum, oraichainNetwork } from "@owallet/common";
import { useEffect, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const useClient = (accountOrai: any) => {
  const [client, setClient] = useState<SigningCosmWasmClient>();

  const getClient = async () => {
    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.Oraichain,
      oraichainNetwork.rpc
    );
    setClient(cwClient);
  };

  useEffect(() => {
    getClient();
  }, []);

  return client;
};

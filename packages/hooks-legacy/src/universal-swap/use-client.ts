import { CWStargate, ChainIdEnum } from "@owallet/common";
import { oraichainNetwork } from "@oraichain/oraidex-common";
import { useEffect, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AccountWithAll } from "@owallet/stores";

export const useClient = (accountOrai: AccountWithAll) => {
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

import { OraidexCommon } from "@oraichain/oraidex-common";
import { CWStargate, fetchTaxRate, ChainIdEnum } from "@owallet/common";
import { useEffect, useState } from "react";

export const useTaxRate = (accountOrai: any, oraichainNetwork) => {
  const [taxRate, setTaxRate] = useState("");

  const queryTaxRate = async () => {
    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.Oraichain,
      oraichainNetwork.rpc
    );
    const data = await fetchTaxRate(cwClient);
    setTaxRate(data?.rate);
  };

  useEffect(() => {
    queryTaxRate();
  }, []);

  return taxRate;
};

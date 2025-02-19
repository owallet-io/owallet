import { CWStargate, fetchTaxRate, ChainIdEnum } from "@owallet/common";
import { useEffect, useState } from "react";

export const useTaxRate = (accountOrai: any, oraichainNetwork, network) => {
  const [taxRate, setTaxRate] = useState("");

  const queryTaxRate = async () => {
    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.Oraichain,
      oraichainNetwork.rpc,
      network
    );
    const data = await fetchTaxRate(cwClient, network);
    setTaxRate(data?.rate);
  };

  useEffect(() => {
    queryTaxRate();
  }, []);

  return taxRate;
};

import {
  CWStargate,
  fetchTaxRate,
  ChainIdEnum,
  oraichainNetwork,
} from "@owallet/common";
import { useEffect, useState } from "react";

export const useTaxRate = (accountOrai: any) => {
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

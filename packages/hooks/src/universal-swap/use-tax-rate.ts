import {
  CWStargate,
  fetchTaxRate,
  ChainIdEnum,
  oraidexCommonLoad,
} from "@owallet/common";
import { useEffect, useState } from "react";

export const useTaxRate = (accountOrai: any) => {
  const [taxRate, setTaxRate] = useState("");

  const queryTaxRate = async () => {
    const { oraichainNetwork } = await oraidexCommonLoad();

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

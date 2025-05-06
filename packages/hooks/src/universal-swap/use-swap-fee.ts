import { useEffect, useState } from "react";
import {
  PAIRS,
  USDC_CONTRACT,
  ORAIX_CONTRACT,
  PairMapping,
} from "@oraichain/oraidex-common";

export const PAIRS_CHART: PairMapping[] = PAIRS.map((pair) => {
  const assets = pair.asset_infos.map((info) => {
    if ("native_token" in info) return info.native_token.denom;
    return info.token.contract_addr;
  });

  // TODO: reverse symbol for pair oraix/usdc
  let symbol = `${pair.symbols[0]}/${pair.symbols[1]}`;
  if (assets[0] === USDC_CONTRACT && assets[1] === ORAIX_CONTRACT) {
    symbol = `${pair.symbols[1]}/${pair.symbols[0]}`;
  }
  return {
    ...pair,
    symbol,
    info: `${assets[0]}-${assets[1]}`,
  };
});

const checkIsPairOfPool = ({
  fromName,
  toName,
}: {
  fromName: string;
  toName: string;
}) => {
  // TODO: check a pair is v2
  const check = [].find((p) => {
    const symbols = p.symbols.map((symbol) => symbol.toUpperCase());
    return symbols.includes(fromName) && symbols.includes(toName);
  });

  // return !!check;
  // TODO: check a pair is v2
  return true;
};

export const useSwapFee = ({ fromToken, toToken }) => {
  const [fee, setFee] = useState(0);

  const SWAP_FEE_PER_ROUTE = 0.003;

  const isDependOnNetwork =
    fromToken?.chainId !== "Oraichain" || toToken?.chainId !== "Oraichain";

  useEffect(() => {
    if (!fromToken || !toToken) return;

    const { name: fromName = "", chainId: fromChainId } = fromToken;
    const { name: toName = "", chainId: toChainId } = toToken;

    // case: same chainId as evm, or bnb => swap fee = 0
    // case: same Token Name and !== chainId => bridge token => swap fee = 0

    if (fromChainId === "Oraichain" && toChainId === "Oraichain") {
      if (
        checkIsPairOfPool({
          fromName: fromName.toUpperCase(),
          toName: toName.toUpperCase(),
        })
      ) {
        setFee(SWAP_FEE_PER_ROUTE);
        return;
      }

      setFee(SWAP_FEE_PER_ROUTE * 2);
      return;
    }

    // bridge
    if (fromChainId !== toChainId && toName === fromName) {
      setFee(() => 0);
      return;
    }

    // swap to oraichain and bridge
    if (
      fromChainId !== toChainId &&
      toName !== fromName &&
      (fromChainId === "Oraichain" || toChainId === "Oraichain")
    ) {
      setFee(() => SWAP_FEE_PER_ROUTE);
      return;
    }
  }, [fromToken, toToken]);

  return { fee, isDependOnNetwork };
};

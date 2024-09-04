import { ObservableChainQuery } from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryIrisMintingInfation extends ObservableChainQuery<{
  height: string;
  result: {
    mint_denom: string;
    // Dec
    inflation: string;
  };
}> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/mint/params");
  }
}

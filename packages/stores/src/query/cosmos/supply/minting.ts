import { ObservableChainQuery } from "../../chain-query";
import { MintingInflation } from "./types";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { autorun } from "mobx";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryMintingInfation extends ObservableChainQuery<MintingInflation> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/minting/inflation");
    autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);

      if (
        !chainId?.startsWith("osmosis") &&
        chainInfo.features &&
        chainInfo.features.includes("ibc-go")
      ) {
        this.setUrl(`/cosmos/mint/v1beta1/inflation`);
      }
    });
  }
}

import { ObservableQuery, QuerySharedContext } from "@owallet/stores";
import { ChainIdHelper } from "@owallet/cosmos";
import { TokenContract } from "./types";

export class ObservableQueryTokenContracts extends ObservableQuery<
  TokenContract[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    tokenContractListURL: string
  ) {
    super(
      sharedContext,
      tokenContractListURL,
      `tokens/${ChainIdHelper.parse(chainId).identifier}`
    );
  }

  get tokenContracts(): TokenContract[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data;
  }
}

import { SecretContractCodeHash } from "./types";
import { KVStore } from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../common";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQuerySecretContractCodeHashInner extends ObservableChainQuery<SecretContractCodeHash> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/wasm/contract/${contractAddress}/code-hash`
    );
  }

  protected canFetch(): boolean {
    return this.contractAddress?.length > 0;
  }
}

export class ObservableQuerySecretContractCodeHash extends ObservableChainQueryMap<SecretContractCodeHash> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQuerySecretContractCodeHashInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQuerySecretContractCodeHashInner {
    return this.get(
      contractAddress
    ) as ObservableQuerySecretContractCodeHashInner;
  }
}

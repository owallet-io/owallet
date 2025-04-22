import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@owallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryERC20Metadata } from "./erc20";
import { ObservableQueryEVMTokenInfo } from "./axelar";
import {
  ObservableQueryTaxCaps,
  ObservableQueryTaxRate,
} from "./terra-classic/treasury";
import { ObservableQuerySkipTokenInfo } from "./token-info";
import { ObservableQueryInitiaDynamicFee } from "./initia/dynamicfee";

export interface OWalletETCQueries {
  owalletETC: OWalletETCQueriesImpl;
}

export const OWalletETCQueries = {
  use(options: {
    ethereumURL: string;
    skipTokenInfoBaseURL: string;
    skipTokenInfoAPIURI: string;
  }): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => OWalletETCQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        owalletETC: new OWalletETCQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter,
          options.ethereumURL,
          options.skipTokenInfoBaseURL,
          options.skipTokenInfoAPIURI
        ),
      };
    };
  },
};

export class OWalletETCQueriesImpl {
  public readonly queryERC20Metadata: DeepReadonly<ObservableQueryERC20Metadata>;
  public readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;
  public readonly querySkipTokenInfo: DeepReadonly<ObservableQuerySkipTokenInfo>;

  public readonly queryTerraClassicTaxRate: DeepReadonly<ObservableQueryTaxRate>;
  public readonly queryTerraClassicTaxCaps: DeepReadonly<ObservableQueryTaxCaps>;

  public readonly queryInitiaDynamicFee: DeepReadonly<ObservableQueryInitiaDynamicFee>;

  constructor(
    _base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    ethereumURL: string,
    skipTokenInfoBaseURL: string,
    skipTokenInfoAPIURI: string
  ) {
    this.queryERC20Metadata = new ObservableQueryERC20Metadata(
      sharedContext,
      ethereumURL
    );
    this.queryEVMTokenInfo = new ObservableQueryEVMTokenInfo(
      sharedContext,
      chainId,
      chainGetter
    );
    this.querySkipTokenInfo = new ObservableQuerySkipTokenInfo(
      sharedContext,
      chainId,
      chainGetter,
      skipTokenInfoBaseURL,
      skipTokenInfoAPIURI
    );

    this.queryTerraClassicTaxRate = new ObservableQueryTaxRate(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryTerraClassicTaxCaps = new ObservableQueryTaxCaps(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryInitiaDynamicFee = new ObservableQueryInitiaDynamicFee(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}

import { ChainInfo } from "@owallet/types";

export type ChainInfoWithSuggestedOptions = ChainInfo & {
  readonly updateFromRepoDisabled?: boolean;
};

export type ChainInfoWithCoreTypes = ChainInfoWithSuggestedOptions & {
  readonly embedded?: boolean;
};

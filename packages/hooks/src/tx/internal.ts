import {
  CosmosQueriesImpl,
  IQueriesStore,
  OsmosisQueries,
} from "@owallet/stores";
import { OWalletETCQueriesImpl } from "@owallet/stores-etc";
import { EthereumQueries } from "@owallet/stores-eth";

export type QueriesStore = IQueriesStore<
  Partial<OsmosisQueries> &
    Partial<EthereumQueries> & {
      cosmos?: Pick<
        CosmosQueriesImpl,
        "queryDelegations" | "queryFeeMarketGasPrices"
      >;
    } & {
      keplrETC?: Pick<
        OWalletETCQueriesImpl,
        "queryTerraClassicTaxRate" | "queryTerraClassicTaxCaps"
      >;
    }
>;

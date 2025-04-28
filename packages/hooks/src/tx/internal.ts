import {
  CosmosQueriesImpl,
  IQueriesStore,
  NobleQueries,
  OsmosisQueries,
} from "@owallet/stores";
import { OWalletETCQueriesImpl } from "@owallet/stores-etc";
import { EthereumQueries } from "@owallet/stores-eth";
import { BtcQueries } from "@owallet/stores-btc";
import { OasisQueries } from "@owallet/stores-oasis";
import { TrxQueries } from "@owallet/stores-trx";

export type QueriesStore = IQueriesStore<
  Partial<OsmosisQueries> &
    Partial<EthereumQueries> & {
      cosmos?: Pick<
        CosmosQueriesImpl,
        "queryDelegations" | "queryFeeMarketGasPrices"
      >;
    } & {
      owalletETC?: Pick<
        OWalletETCQueriesImpl,
        | "queryTerraClassicTaxRate"
        | "queryTerraClassicTaxCaps"
        | "queryInitiaDynamicFee"
      >;
    } & Partial<BtcQueries> &
    Partial<OasisQueries> &
    Partial<TrxQueries> &
    Partial<NobleQueries>
>;

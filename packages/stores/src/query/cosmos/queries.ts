import { QueriesSetBase } from "../queries";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../common";
import { ObservableQueryBlock } from "./block";
import { ObservableQueryAccount } from "./account";
import {
  ObservableQueryInflation,
  ObservableQueryMintingInfation,
  ObservableQuerySupplyTotal,
} from "./supply";
import {
  ObservableQueryDelegations,
  ObservableQueryRewards,
  ObservableQueryStakingParams,
  ObservableQueryStakingPool,
  ObservableQueryUnbondingDelegations,
  ObservableQueryValidators,
} from "./staking";
import {
  ObservableQueryGovernance,
  ObservableQueryProposalVote,
} from "./governance";
import {
  ObservableQueryDenomTrace,
  ObservableQueryIBCChannel,
  ObservableQueryIBCClientState,
} from "./ibc";
import { ObservableQuerySifchainLiquidityAPY } from "./supply/sifchain";
import { ObservableQueryCosmosBalanceRegistry } from "./balance";
import { ObservableQueryIrisMintingInfation } from "./supply/iris-minting";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryOsmosisEpochProvisions,
  ObservableQueryOsmosisEpochs,
  ObservableQueryOsmosisMintParmas,
} from "./supply/osmosis";
import { QuerySharedContext } from "src/common/query/context";

export interface HasCosmosQueries {
  cosmos: CosmosQueries;
}

export class QueriesWrappedCosmos
  extends QueriesSetBase
  implements HasCosmosQueries
{
  public cosmos: CosmosQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter);

    this.cosmos = new CosmosQueries(this, sharedContext, chainId, chainGetter);
  }
}

export class CosmosQueries {
  public readonly queryBlock: DeepReadonly<ObservableQueryBlock>;
  public readonly queryAccount: DeepReadonly<ObservableQueryAccount>;
  public readonly queryMint: DeepReadonly<ObservableQueryMintingInfation>;
  public readonly queryPool: DeepReadonly<ObservableQueryStakingPool>;
  public readonly queryStakingParams: DeepReadonly<ObservableQueryStakingParams>;
  public readonly querySupplyTotal: DeepReadonly<ObservableQuerySupplyTotal>;
  public readonly queryInflation: DeepReadonly<ObservableQueryInflation>;
  public readonly queryRewards: DeepReadonly<ObservableQueryRewards>;
  public readonly queryDelegations: DeepReadonly<ObservableQueryDelegations>;
  public readonly queryUnbondingDelegations: DeepReadonly<ObservableQueryUnbondingDelegations>;
  public readonly queryValidators: DeepReadonly<ObservableQueryValidators>;
  public readonly queryGovernance: DeepReadonly<ObservableQueryGovernance>;
  public readonly queryProposalVote: DeepReadonly<ObservableQueryProposalVote>;

  public readonly queryIBCClientState: DeepReadonly<ObservableQueryIBCClientState>;
  public readonly queryIBCChannel: DeepReadonly<ObservableQueryIBCChannel>;
  public readonly queryIBCDenomTrace: DeepReadonly<ObservableQueryDenomTrace>;

  public readonly querySifchainAPY: DeepReadonly<ObservableQuerySifchainLiquidityAPY>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.querySifchainAPY = new ObservableQuerySifchainLiquidityAPY(
      sharedContext,
      chainId
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCosmosBalanceRegistry(sharedContext)
    );

    this.queryBlock = new ObservableQueryBlock(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryAccount = new ObservableQueryAccount(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryMint = new ObservableQueryMintingInfation(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryPool = new ObservableQueryStakingPool(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryStakingParams = new ObservableQueryStakingParams(
      sharedContext,
      chainId,
      chainGetter
    );
    this.querySupplyTotal = new ObservableQuerySupplyTotal(
      sharedContext,
      chainId,
      chainGetter
    );

    const osmosisMintParams = new ObservableQueryOsmosisMintParmas(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryInflation = new ObservableQueryInflation(
      chainId,
      chainGetter,
      this.queryMint,
      this.queryPool,
      this.querySupplyTotal,
      new ObservableQueryIrisMintingInfation(
        sharedContext,
        chainId,
        chainGetter
      ),
      this.querySifchainAPY,
      new ObservableQueryOsmosisEpochs(sharedContext, chainId, chainGetter),
      new ObservableQueryOsmosisEpochProvisions(
        sharedContext,
        chainId,
        chainGetter,
        osmosisMintParams
      ),
      osmosisMintParams
    );
    this.queryRewards = new ObservableQueryRewards(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryDelegations = new ObservableQueryDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryUnbondingDelegations = new ObservableQueryUnbondingDelegations(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryValidators = new ObservableQueryValidators(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryGovernance = new ObservableQueryGovernance(
      sharedContext,
      chainId,
      chainGetter,
      this.queryPool
    );
    this.queryProposalVote = new ObservableQueryProposalVote(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryIBCClientState = new ObservableQueryIBCClientState(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCChannel = new ObservableQueryIBCChannel(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryIBCDenomTrace = new ObservableQueryDenomTrace(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}

import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { ObservableQuerySecret20ContractInfo } from "./secret20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySecret20BalanceRegistry } from "./secret20-balance";
import { QueriesWrappedCosmos } from "../cosmos";
import { OWallet } from "@owallet/types";
import { QuerySharedContext } from "src/common/query/context";

export interface HasSecretQueries {
  secret: SecretQueries;
}

export class QueriesWrappedSecret
  extends QueriesWrappedCosmos
  implements HasSecretQueries
{
  public secret: SecretQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(sharedContext, chainId, chainGetter);

    this.secret = new SecretQueries(
      this,
      sharedContext,
      chainId,
      chainGetter,
      apiGetter
    );
  }
}

export class SecretQueries {
  public readonly querySecretContractCodeHash: DeepReadonly<ObservableQuerySecretContractCodeHash>;
  public readonly querySecret20ContractInfo: DeepReadonly<ObservableQuerySecret20ContractInfo>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    this.querySecretContractCodeHash =
      new ObservableQuerySecretContractCodeHash(
        sharedContext,
        chainId,
        chainGetter
      );

    base.queryBalances.addBalanceRegistry(
      new ObservableQuerySecret20BalanceRegistry(
        sharedContext,
        apiGetter,
        this.querySecretContractCodeHash
      )
    );

    this.querySecret20ContractInfo = new ObservableQuerySecret20ContractInfo(
      sharedContext,
      chainId,
      chainGetter,
      apiGetter,
      this.querySecretContractCodeHash
    );
  }
}

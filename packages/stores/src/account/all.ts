import { EthereumAccount, EthereumMsgOpts } from "./ethereum";
import { AccountSetBase, AccountSetOpts } from "./base";
import {
  AccountWithCosmos,
  CosmosAccount,
  CosmosMsgOpts,
  HasCosmosAccount,
} from "./cosmos";
import {
  AccountWithSecret,
  HasSecretAccount,
  SecretAccount,
  SecretMsgOpts,
} from "./secret";
import {
  HasBtcQueries,
  HasCosmosQueries,
  HasCosmwasmQueries,
  HasEvmQueries,
  HasSvmQueries,
  HasSecretQueries,
  QueriesSetBase,
  QueriesStore,
} from "../query";
import deepmerge from "deepmerge";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";
import {
  AccountWithCosmwasm,
  CosmwasmAccount,
  CosmwasmMsgOpts,
  HasCosmwasmAccount,
} from "./cosmwasm";
import { BitcoinAccount, BitcoinMsgOpts } from "./bitcoin";

export class AccountWithAll
  extends AccountSetBase<
    CosmosMsgOpts &
      SecretMsgOpts &
      CosmwasmMsgOpts &
      EthereumMsgOpts &
      BitcoinMsgOpts,
    HasCosmosQueries &
      HasSecretQueries &
      HasCosmwasmQueries &
      HasEvmQueries &
      HasSvmQueries &
      HasBtcQueries
  >
  implements HasCosmosAccount, HasSecretAccount, HasCosmwasmAccount
{
  static readonly defaultMsgOpts: CosmosMsgOpts &
    SecretMsgOpts &
    CosmwasmMsgOpts = deepmerge(
    AccountWithCosmos.defaultMsgOpts,
    deepmerge(
      AccountWithSecret.defaultMsgOpts,
      AccountWithCosmwasm.defaultMsgOpts
    )
  );

  public readonly cosmos: DeepReadonly<CosmosAccount>;
  public readonly ethereum: DeepReadonly<EthereumAccount>;
  public readonly secret: DeepReadonly<SecretAccount>;
  public readonly cosmwasm: DeepReadonly<CosmwasmAccount>;
  public readonly bitcoin: DeepReadonly<BitcoinAccount>;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase &
        HasCosmosQueries &
        HasSecretQueries &
        HasCosmwasmQueries &
        HasEvmQueries &
        HasSvmQueries &
        HasBtcQueries
    >,
    protected readonly opts: AccountSetOpts<
      CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts
    >
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(
      this as AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.secret = new SecretAccount(
      this as AccountSetBase<SecretMsgOpts, HasSecretQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.cosmwasm = new CosmwasmAccount(
      this as AccountSetBase<CosmwasmMsgOpts, HasCosmwasmQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.ethereum = new EthereumAccount(
      this as AccountSetBase<EthereumMsgOpts, HasEvmQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.bitcoin = new BitcoinAccount(
      this as AccountSetBase<BitcoinMsgOpts, HasBtcQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
  }
}

// export class AccountEvmWithAll
//   extends AccountSetEvmBase<
//     CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts,
//     HasCosmosQueries & HasSecretQueries & HasCosmwasmQueries
//   >
//   implements HasCosmosAccount, HasSecretAccount, HasCosmwasmAccount {
//   static readonly defaultMsgOpts: CosmosMsgOpts &
//     SecretMsgOpts &
//     CosmwasmMsgOpts = deepmerge(
//     AccountWithCosmos.defaultMsgOpts,
//     deepmerge(
//       AccountWithSecret.defaultMsgOpts,
//       AccountWithCosmwasm.defaultMsgOpts
//     )
//   );

//   public readonly cosmos: DeepReadonly<CosmosAccount>;
//   public readonly secret: DeepReadonly<SecretAccount>;
//   public readonly cosmwasm: DeepReadonly<CosmwasmAccount>;

//   constructor(
//     protected readonly eventListener: {
//       addEventListener: (type: string, fn: () => unknown) => void;
//       removeEventListener: (type: string, fn: () => unknown) => void;
//     },
//     protected readonly chainGetter: ChainGetter,
//     protected readonly chainId: string,
//     protected readonly queriesStore: QueriesStore<
//       QueriesSetBase & HasCosmosQueries & HasSecretQueries & HasCosmwasmQueries
//     >,
//     protected readonly opts: AccountSetEvmOpts<
//       CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts
//     >
//   ) {
//     super(eventListener, chainGetter, chainId, queriesStore, opts);

//     // this.cosmos = new CosmosAccount(
//     //   this as AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
//     //   chainGetter,
//     //   chainId,
//     //   queriesStore
//     // );
//     // this.secret = new SecretAccount(
//     //   this as AccountSetBase<SecretMsgOpts, HasSecretQueries>,
//     //   chainGetter,
//     //   chainId,
//     //   queriesStore
//     // );
//     // this.cosmwasm = new CosmwasmAccount(
//     //   this as AccountSetBase<CosmwasmMsgOpts, HasCosmwasmQueries>,
//     //   chainGetter,
//     //   chainId,
//     //   queriesStore
//     // );
//     this.ethereum =
//   }
// }

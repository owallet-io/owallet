import { ExtraOptionSendToken, MsgOpt } from "./base";
import { AccountSetBase, AccountSetOpts } from "./base";
import { AppCurrency, OWalletSignOptions } from "@owallet/types";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper } from "@owallet/common";

import { HasSvmQueries, QueriesSetBase, QueriesStore } from "../query";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";

export interface HasSolanaAccount {
  svm: DeepReadonly<SolanaAccount>;
}

export interface SolanaMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
}

export class AccountWithSolana
  extends AccountSetBase<SolanaMsgOpts, HasSvmQueries>
  implements HasSolanaAccount
{
  public readonly svm: DeepReadonly<SolanaAccount>;

  static readonly defaultMsgOpts: SolanaMsgOpts = {
    send: {
      native: {
        type: "send",
        gas: 80000,
      },
    },
  };

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasSvmQueries
    >,
    protected readonly opts: AccountSetOpts<SolanaMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.svm = new SolanaAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class SolanaAccount {
  constructor(
    protected readonly base: AccountSetBase<SolanaMsgOpts, HasSvmQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasSvmQueries
    >
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  //send token
  protected async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: StdFee,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: ExtraOptionSendToken
  ): Promise<boolean> {
    if (signOptions.networkType === "svm") {
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);

      switch (denomHelper.type) {
        case "native":
          const msg: any = {
            address: recipient,
            changeAddress: this.base.btcAddress,
            amount: Number(extraOptions.amount),
            message: memo,
            totalFee: Number(stdFee.amount[0].amount),
            selectedCrypto: signOptions.chainId,
            confirmedBalance: extraOptions.confirmedBalance,
            feeRate: extraOptions.feeRate,
          };

          await this.base.sendSvmMsgs(
            "send",
            msg,
            memo,
            stdFee,
            signOptions,
            this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
              // if (tx) {
              //   // After succeeding to send token, refresh the balance.
              //   const querySvmBalance =
              //     this.queries.svm.querySolanaBalance.getQueryBalance(
              //       this.base.btcAddress
              //     );
              //   if (querySvmBalance) {
              //     querySvmBalance.fetch();
              //   }
              // }
            })
          );
          return true;
      }
    }
    return false;
  }

  protected txEventsWithPreOnFulfill(
    onTxEvents:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
      | undefined,
    preOnFulfill?: (tx: any) => void
  ):
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: any) => void;
      }
    | undefined {
    if (!onTxEvents) {
      return;
    }

    const onBroadcasted =
      typeof onTxEvents === "function" ? undefined : onTxEvents.onBroadcasted;
    const onFulfill =
      typeof onTxEvents === "function" ? onTxEvents : onTxEvents.onFulfill;

    return {
      onBroadcasted,
      onFulfill:
        onFulfill || preOnFulfill
          ? (tx: any) => {
              if (preOnFulfill) {
                preOnFulfill(tx);
              }

              if (onFulfill) {
                onFulfill(tx);
              }
            }
          : undefined,
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & HasSvmQueries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes("no-legacy-stdTx")
    );
  }
}

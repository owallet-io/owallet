import { AccountSetBase, AccountSetOpts, MsgOpt } from "./base";
import { HasCosmwasmQueries, QueriesSetBase, QueriesStore } from "../query";
import { ChainGetter, CoinPrimitive } from "../common";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper } from "@owallet/common";
import { Dec, DecUtils } from "@owallet/unit";
import { AppCurrency, OWalletSignOptions } from "@owallet/types";
import { DeepReadonly, Optional } from "utility-types";
// import { cosmwasm } from '@owallet/cosmos';
import {
  MsgExecuteContract,
  MsgInstantiateContract,
} from "@owallet/proto-types/cosmwasm/wasm/v1/tx";
import { Buffer } from "buffer";

export interface HasCosmwasmAccount {
  cosmwasm: DeepReadonly<CosmwasmAccount>;
}

export interface CosmwasmMsgOpts {
  readonly send: {
    readonly cw20: Pick<MsgOpt, "gas">;
  };

  readonly executeWasm: Pick<MsgOpt, "type">;
}

export class AccountWithCosmwasm
  extends AccountSetBase<CosmwasmMsgOpts, HasCosmwasmQueries>
  implements HasCosmwasmAccount
{
  public readonly cosmwasm: DeepReadonly<CosmwasmAccount>;

  static readonly defaultMsgOpts: CosmwasmMsgOpts = {
    send: {
      cw20: {
        gas: 150000,
      },
    },

    executeWasm: {
      type: "wasm/MsgExecuteContract",
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
      QueriesSetBase & HasCosmwasmQueries
    >,
    protected readonly opts: AccountSetOpts<CosmwasmMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmwasm = new CosmwasmAccount(
      this,
      chainGetter,
      chainId,
      queriesStore
    );
  }
}

export class CosmwasmAccount {
  constructor(
    protected readonly base: AccountSetBase<
      CosmwasmMsgOpts,
      HasCosmwasmQueries
    >,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmwasmQueries
    >
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  protected async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: {
      type: string;
      contract_addr: string;
      token_id: string;
      recipient?: string;
      amount?: string;
      to?: string;
    }
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    if (signOptions.networkType === "cosmos") {
      switch (denomHelper.type) {
        case "cw20":
          const actualAmount = (() => {
            let dec = new Dec(amount);
            dec = dec.mul(
              DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
            );
            return dec.truncate().toString();
          })();

          if (!("type" in currency) || currency.type !== "cw20") {
            throw new Error("Currency is not cw20");
          }

          if (extraOptions && Object.keys(extraOptions).length !== 0) {
            let contractAddress, transfer_nft_directly;
            contractAddress =
              extraOptions.type === "721"
                ? "orai1r5je7ftryvymzukudqgh0dwrkyfyr8u07cjuhw"
                : "orai1m0cdln6klzlsk87jww9wwr7ksasa6cnava28j5";
            transfer_nft_directly =
              extraOptions.type === "721"
                ? {
                    contract_addr: extraOptions.contract_addr,
                    recipient: extraOptions.recipient,
                    token_id: extraOptions.token_id,
                  }
                : {
                    contract_addr: extraOptions.contract_addr,
                    amount: extraOptions.amount,
                    to: extraOptions.to,
                    token_id: extraOptions.token_id,
                  };
            await this.sendExecuteContractMsg(
              "send",
              contractAddress,
              {
                transfer_nft_directly,
              },
              [],
              memo,
              {
                amount: stdFee.amount ?? [],
                gas: stdFee.gas ?? this.base.msgOpts.send.cw20.gas.toString(),
              },
              signOptions,
              this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
                if (tx.code == null || tx.code === 0) {
                  // After succeeding to send token, refresh the balance.
                  const queryBalance = this.queries.queryBalances
                    .getQueryBech32Address(this.base.bech32Address)
                    .balances.find((bal) => {
                      return (
                        bal.currency.coinMinimalDenom ===
                        currency.coinMinimalDenom
                      );
                    });

                  if (queryBalance) {
                    queryBalance.fetch();
                  }
                }
              })
            );
            return true;
          }

          await this.sendExecuteContractMsg(
            "send",
            currency.contractAddress || denomHelper.contractAddress,
            {
              transfer: {
                recipient: recipient,
                amount: actualAmount,
              },
            },
            [],
            memo,
            {
              amount: stdFee.amount ?? [],
              gas: stdFee.gas ?? this.base.msgOpts.send.cw20.gas.toString(),
            },
            signOptions,
            this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
              if (tx.code == null || tx.code === 0) {
                // After succeeding to send token, refresh the balance.
                const queryBalance = this.queries.queryBalances
                  .getQueryBech32Address(this.base.bech32Address)
                  .balances.find((bal) => {
                    return (
                      bal.currency.coinMinimalDenom ===
                      currency.coinMinimalDenom
                    );
                  });

                if (queryBalance) {
                  queryBalance.fetch();
                }
              }
            })
          );
          return true;
      }
    }

    return false;
  }

  async sendExecuteContractMsg(
    // This arg can be used to override the type of sending tx if needed.
    type: keyof CosmwasmMsgOpts | "unknown" = "executeWasm",
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object,
    funds: CoinPrimitive[],
    memo: string = "",
    stdFee: Optional<StdFee, "amount">,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void> {
    const msg = {
      type: this.base.msgOpts.executeWasm.type,
      value: {
        sender: this.base.bech32Address,
        contract: contractAddress,
        msg: obj,
      },
    };
    const chainInfo = this.chainGetter.getChain(this.chainId);

    // dynamic msg based on beta
    msg.value[chainInfo.beta ? "sent_funds" : "funds"] = funds;

    const protoMsgs = [
      {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.encode({
          sender: msg.value.sender,
          contract: msg.value.contract,
          msg: Buffer.from(JSON.stringify(msg.value.msg)),
          funds: funds,
        }).finish(),
      },
    ];

    await this.base.sendMsgs(
      type,
      {
        aminoMsgs: [msg],
        protoMsgs,
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents)
    );
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
      onFulfill: onFulfill
        ? (tx: any) => {
            if (preOnFulfill) {
              preOnFulfill(tx);
            }

            onFulfill(tx);
          }
        : undefined,
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & HasCosmwasmQueries> {
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

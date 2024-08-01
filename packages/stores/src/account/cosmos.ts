import { AccountSetBase, AccountSetOpts, MsgOpt } from "./base";
import { AppCurrency, OWalletSignOptions } from "@owallet/types";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper, EVMOS_NETWORKS } from "@owallet/common";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { ChainIdHelper, BaseAccount } from "@owallet/cosmos";
import { BondStatus } from "../query/cosmos/staking/types";
import { HasCosmosQueries, QueriesSetBase, QueriesStore } from "../query";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";
import Axios, { AxiosInstance } from "axios";
import { MsgTransfer } from "@owallet/proto-types/ibc/applications/transfer/v1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@owallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgWithdrawDelegatorReward } from "@owallet/proto-types/cosmos/distribution/v1beta1/tx";
import { MsgVote } from "@owallet/proto-types/cosmos/gov/v1beta1/tx";
import { VoteOption } from "@owallet/proto-types/cosmos/gov/v1beta1/gov";
import { SignMode } from "@owallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import Long from "long";
import { MsgSend } from "@owallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "@owallet/proto-types/cosmos/tx/v1beta1/tx";
// import SignMode = cosmos.tx.signing.v1beta1.SignMode;

export interface HasCosmosAccount {
  cosmos: DeepReadonly<CosmosAccount>;
}

export interface CosmosMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
  readonly ibcTransfer: MsgOpt;
  readonly delegate: MsgOpt;
  readonly undelegate: MsgOpt;
  readonly redelegate: MsgOpt;
  // The gas multiplication per rewards.
  readonly withdrawRewards: MsgOpt;
  readonly govVote: MsgOpt;
}

export class AccountWithCosmos
  extends AccountSetBase<CosmosMsgOpts, HasCosmosQueries>
  implements HasCosmosAccount
{
  public readonly cosmos: DeepReadonly<CosmosAccount>;

  static readonly defaultMsgOpts: CosmosMsgOpts = {
    send: {
      native: {
        type: "cosmos-sdk/MsgSend",
        gas: 200000,
      },
    },
    ibcTransfer: {
      type: "cosmos-sdk/MsgTransfer",
      gas: 450000,
    },
    delegate: {
      type: "cosmos-sdk/MsgDelegate",
      gas: 250000,
    },
    undelegate: {
      type: "cosmos-sdk/MsgUndelegate",
      gas: 250000,
    },
    redelegate: {
      type: "cosmos-sdk/MsgBeginRedelegate",
      gas: 250000,
    },
    // The gas multiplication per rewards.
    withdrawRewards: {
      type: "cosmos-sdk/MsgWithdrawDelegationReward",
      gas: 140000,
    },
    govVote: {
      type: "cosmos-sdk/MsgVote",
      gas: 250000,
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
      QueriesSetBase & HasCosmosQueries
    >,
    protected readonly opts: AccountSetOpts<CosmosMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class CosmosAccount {
  constructor(
    protected readonly base: AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries
    >
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });
  }

  /**
   * Simulate tx without making state transition on chain or not waiting the tx committed.
   * Mainly used to estimate the gas needed to process tx.
   * You should multiply arbitrary number (gas adjustment) for gas before sending tx.
   *
   * NOTE: "/cosmos/tx/v1beta1/simulate" returns 400, 500 or (more?) status and error code as a response when tx fails on stimulate.
   *       Currently, non 200~300 status is handled as error, thus error would be thrown.
   *
   * XXX: Uses the simulate request format for cosmos-sdk@0.43+
   *      Thus, may throw an error if the chain is below cosmos-sdk@0.43
   *      And, for simplicity, doesn't set the public key to tx bytes.
   *      Thus, the gas estimated doesn't include the tx bytes size of public key.
   *
   * @param msgs
   * @param fee
   * @param memo
   */
  async simulateTx(
    msgs: any[],
    fee: Omit<StdFee, "gas">,
    memo: string = ""
  ): Promise<{
    gasUsed: number;
  }> {
    const account = await BaseAccount.fetchFromRest(
      this.instance,
      this.base.bech32Address,
      true
    );

    const unsignTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: msgs,
          memo: memo,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          SignerInfo.fromPartial({
            // Pub key is ignored.
            // It is fine to ignore the pub key when simulating tx.
            // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: account.getSequence().toString(),
          }),
        ],

        fee: Fee.fromPartial({
          amount: fee.amount.map((amount) => {
            return { amount: amount.amount, denom: amount.denom };
          }),
          gasLimit: Long.fromString("500000"),
        }),
      }).finish(),
      signatures: [new Uint8Array(64)],
    }).finish();

    const result = await this.instance.post("/cosmos/tx/v1beta1/simulate", {
      tx_bytes: Buffer.from(unsignTx).toString("base64"),
    });

    const gasUsed = parseInt(result.data.gas_info.gas_used);
    if (Number.isNaN(gasUsed)) {
      throw new Error(`Invalid integer gas: ${result.data.gas_info.gas_used}`);
    }

    return {
      gasUsed,
    };
  }

  //send token
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
        }
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    if (
      signOptions.networkType === "cosmos" &&
      !EVMOS_NETWORKS.includes(signOptions.chainId)
    ) {
      switch (denomHelper.type) {
        case "native":
          const actualAmount = (() => {
            let dec = new Dec(amount);
            dec = dec.mul(
              DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
            );
            return dec.truncate().toString();
          })();

          const msg = {
            type: this.base.msgOpts.send.native.type,
            value: {
              from_address: this.base.bech32Address,
              to_address: recipient,
              amount: [
                {
                  denom: currency.coinMinimalDenom,
                  amount: actualAmount,
                },
              ],
            },
          };

          const simulateTx = await this.simulateTx(
            this.checkNoLegacyStdFeature([
              {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                value: MsgSend.encode({
                  fromAddress: msg.value.from_address,
                  toAddress: msg.value.to_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ]),
            {
              amount: stdFee.amount ?? [],
            },
            memo
          );
          await this.base.sendMsgs(
            "send",
            {
              aminoMsgs: [msg],
              protoMsgs: this.checkNoLegacyStdFeature([
                {
                  typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                  value: MsgSend.encode({
                    fromAddress: msg.value.from_address,
                    toAddress: msg.value.to_address,
                    amount: msg.value.amount,
                  }).finish(),
                },
              ]),
              rlpTypes: {
                MsgValue: [
                  { name: "from_address", type: "string" },
                  { name: "to_address", type: "string" },
                  { name: "amount", type: "TypeAmount[]" },
                ],
                TypeAmount: [
                  { name: "denom", type: "string" },
                  { name: "amount", type: "string" },
                ],
              },
            },
            memo,
            {
              amount: stdFee.amount ?? [],
              gas: simulateTx?.gasUsed
                ? (simulateTx.gasUsed * 1.3).toString()
                : stdFee.gas ?? this.base.msgOpts.send.native.gas.toString(),
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

  async sendIBCTransferMsg(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "native") {
      throw new Error("Only native token can be sent via IBC");
    }

    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(
        DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
      );
      return dec.truncate().toString();
    })();

    const destinationBlockHeight = this.queriesStore
      .get(channel.counterpartyChainId)
      .cosmos.queryBlock.getBlock("latest");

    const msg = {
      type: this.base.msgOpts.ibcTransfer.type,
      value: {
        source_port: channel.portId,
        source_channel: channel.channelId,
        token: {
          denom: currency.coinMinimalDenom,
          amount: actualAmount,
        },
        sender: this.base.bech32Address,
        receiver: recipient,
        timeout_height: {
          revision_number: ChainIdHelper.parse(
            channel.counterpartyChainId
          ).version.toString() as string | undefined,
          // Set the timeout height as the current height + 150.
          revision_height: destinationBlockHeight.height
            .add(new Int("150"))
            .toString(),
        },
      },
    };

    const simulateTx = await this.simulateTx(
      [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.encode({
            sourcePort: msg.value.source_port,
            sourceChannel: msg.value.source_channel,
            token: msg.value.token,
            sender: msg.value.sender,
            receiver: msg.value.receiver,
            timeoutHeight: {
              revisionNumber: msg.value.timeout_height.revision_number
                ? Long.fromString(msg.value.timeout_height.revision_number)
                : null,
              revisionHeight: Long.fromString(
                msg.value.timeout_height.revision_height
              ),
            },
          }).finish(),
        },
      ],
      {
        amount: stdFee.amount ?? [],
      },
      memo
    );

    await this.base.sendMsgs(
      "ibcTransfer",
      async () => {
        // Wait until fetching complete.
        await destinationBlockHeight.waitFreshResponse();

        if (destinationBlockHeight.height.equals(new Int("0"))) {
          throw new Error(
            `Failed to fetch the latest block of ${channel.counterpartyChainId}`
          );
        }

        const msg = {
          type: this.base.msgOpts.ibcTransfer.type,
          value: {
            source_port: channel.portId,
            source_channel: channel.channelId,
            token: {
              denom: currency.coinMinimalDenom,
              amount: actualAmount,
            },
            sender: this.base.bech32Address,
            receiver: recipient,
            timeout_height: {
              revision_number: ChainIdHelper.parse(
                channel.counterpartyChainId
              ).version.toString() as string | undefined,
              // Set the timeout height as the current height + 150.
              revision_height: destinationBlockHeight.height
                .add(new Int("150"))
                .toString(),
            },
          },
        };

        if (msg.value.timeout_height.revision_number === "0") {
          delete msg.value.timeout_height.revision_number;
        }

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
              value: MsgTransfer.encode({
                sourcePort: msg.value.source_port,
                sourceChannel: msg.value.source_channel,
                token: msg.value.token,
                sender: msg.value.sender,
                receiver: msg.value.receiver,
                timeoutHeight: {
                  revisionNumber: msg.value.timeout_height.revision_number
                    ? Long.fromString(msg.value.timeout_height.revision_number)
                    : null,
                  revisionHeight: Long.fromString(
                    msg.value.timeout_height.revision_height
                  ),
                },
              }).finish(),
            },
          ],
          rlpTypes: {
            MsgValue: [
              { name: "source_port", type: "string" },
              { name: "source_channel", type: "string" },
              { name: "token", type: "TypeToken" },
              { name: "sender", type: "string" },
              { name: "receiver", type: "string" },
              { name: "timeout_height", type: "TypeTimeoutHeight" },
              { name: "timeout_timestamp", type: "uint64" },
              ...(() => {
                if (memo != null) {
                  return [
                    {
                      name: "memo",
                      type: "string",
                    },
                  ];
                }

                return [];
              })(),
            ],
            TypeToken: [
              { name: "denom", type: "string" },
              { name: "amount", type: "string" },
            ],
            TypeTimeoutHeight: [
              { name: "revision_number", type: "uint64" },
              { name: "revision_height", type: "uint64" },
            ],
          },
        };
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: simulateTx?.gasUsed
          ? (simulateTx.gasUsed * 1.3).toString()
          : stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to send token, refresh the balance.
          const queryBalance = this.queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom === currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }
        }
      })
    );
  }

  /**
   * Send `MsgDelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param validatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendDelegateMsg(
    amount: string,
    validatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
    );

    const msg = {
      type: this.base.msgOpts.delegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    console.log("msg", msg);

    const simulateTx = await this.simulateTx(
      [
        {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: MsgDelegate.encode({
            delegatorAddress: msg.value.delegator_address,
            validatorAddress: msg.value.validator_address,
            amount: msg.value.amount,
          }).finish(),
        },
      ],
      {
        amount: stdFee.amount ?? [],
      },
      memo
    );

    await this.base.sendMsgs(
      "delegate",
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                value: MsgDelegate.encode({
                  delegatorAddress: msg.value.delegator_address,
                  validatorAddress: msg.value.validator_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ]
          : undefined,
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
            { name: "amount", type: "TypeAmount" },
          ],
          TypeAmount: [
            { name: "denom", type: "string" },
            { name: "amount", type: "string" },
          ],
        },
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: simulateTx?.gasUsed
          ? (simulateTx.gasUsed * 1.3).toString()
          : stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to delegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  /**
   * Send `MsgUndelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param validatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendUndelegateMsg(
    amount: string,
    validatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
    );

    const msg = {
      type: this.base.msgOpts.undelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    const simulateTx = await this.simulateTx(
      [
        {
          typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
          value: MsgUndelegate.encode({
            delegatorAddress: msg.value.delegator_address,
            validatorAddress: msg.value.validator_address,
            amount: msg.value.amount,
          }).finish(),
        },
      ],
      {
        amount: stdFee.amount ?? [],
      },
      memo
    );

    await this.base.sendMsgs(
      "undelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
            value: MsgUndelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
            { name: "amount", type: "TypeAmount" },
          ],
          TypeAmount: [
            { name: "denom", type: "string" },
            { name: "amount", type: "string" },
          ],
        },
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: simulateTx?.gasUsed
          ? (simulateTx.gasUsed * 1.3).toString()
          : stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to unbond, refresh the validators and delegations, unbonding delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryUnbondingDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  /**
   * Send `MsgBeginRedelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param srcValidatorAddress
   * @param dstValidatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendBeginRedelegateMsg(
    amount: string,
    srcValidatorAddress: string,
    dstValidatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
    );

    const msg = {
      type: this.base.msgOpts.redelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_src_address: srcValidatorAddress,
        validator_dst_address: dstValidatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    const simulateTx = await this.simulateTx(
      [
        {
          typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
          value: MsgBeginRedelegate.encode({
            delegatorAddress: msg.value.delegator_address,
            validatorSrcAddress: msg.value.validator_src_address,
            validatorDstAddress: msg.value.validator_dst_address,
            amount: msg.value.amount,
          }).finish(),
        },
      ],
      {
        amount: stdFee.amount ?? [],
      },
      memo
    );

    await this.base.sendMsgs(
      "redelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
                value: MsgBeginRedelegate.encode({
                  delegatorAddress: msg.value.delegator_address,
                  validatorSrcAddress: msg.value.validator_src_address,
                  validatorDstAddress: msg.value.validator_dst_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ]
          : undefined,
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_src_address", type: "string" },
            { name: "validator_dst_address", type: "string" },
            { name: "amount", type: "TypeAmount" },
          ],
          TypeAmount: [
            { name: "denom", type: "string" },
            { name: "amount", type: "string" },
          ],
        },
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: simulateTx?.gasUsed
          ? (simulateTx.gasUsed * 1.3).toString()
          : stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to redelegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  async sendWithdrawAndDelegationRewardMsgs(
    validatorAddresses: string[],
    validatorRewars: Array<{ validatorAddress: string; rewards: CoinPretty }>,
    // amount: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    currency?: string
  ) {
    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: this.base.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    // Delegate msgs
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;
    const delegateMsgs = validatorRewars.map((vr) => {
      let dec = new Dec(
        vr.rewards.shrink(true).maxDecimals(6).hideDenom(true).toString()
      );
      dec = dec.mulTruncate(
        DecUtils.getTenExponentNInPrecisionRange(stakeCurrency.coinDecimals)
      );
      return {
        type: this.base.msgOpts.delegate.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: vr.validatorAddress,
          amount: {
            denom: stakeCurrency.coinMinimalDenom,
            amount: dec.truncate().toString(),
          },
        },
      };
    });

    const simulateTx = await this.simulateTx(
      [
        ...msgs.map((msg) => {
          return {
            typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
            value: MsgWithdrawDelegatorReward.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
            }).finish(),
          };
        }),
        ...delegateMsgs.map((delegateMsg) => {
          return {
            typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
            value: MsgDelegate.encode({
              delegatorAddress: delegateMsg.value.delegator_address,
              validatorAddress: delegateMsg.value.validator_address,
              amount: delegateMsg.value.amount,
            }).finish(),
          };
        }),
      ],
      {
        amount: stdFee.amount ?? [],
      },
      memo
    );
    await this.base.sendMsgs(
      "withdrawRewardsAndDelegation",
      {
        aminoMsgs: [...msgs, ...delegateMsgs],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? // Delegate after withdrawRewards goes here, just add one more delegate msg into this array
            [
              ...msgs.map((msg) => {
                return {
                  typeUrl:
                    "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                  value: MsgWithdrawDelegatorReward.encode({
                    delegatorAddress: msg.value.delegator_address,
                    validatorAddress: msg.value.validator_address,
                  }).finish(),
                };
              }),
              ...delegateMsgs.map((delegateMsg) => {
                return {
                  typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                  value: MsgDelegate.encode({
                    delegatorAddress: delegateMsg.value.delegator_address,
                    validatorAddress: delegateMsg.value.validator_address,
                    amount: delegateMsg.value.amount,
                  }).finish(),
                };
              }),
            ]
          : undefined,
        // this is needed for ledger and ethermint, cosmos does not care about this, so we could pass anything in this rlpTypes
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
          ],
        },
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: simulateTx?.gasUsed
          ? (simulateTx.gasUsed * 1.2 * validatorAddresses.length).toString()
          : (Number(stdFee.gas) * 1.1).toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to send token, refresh the balance.
          const queryBalance = this.queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom === currency //currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  async sendWithdrawDelegationRewardMsgs(
    validatorAddresses: string[],
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    currency?: string
  ) {
    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: this.base.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    const simulateTx = await this.simulateTx(
      msgs.map((msg) => {
        return {
          typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
          value: MsgWithdrawDelegatorReward.encode({
            delegatorAddress: msg.value.delegator_address,
            validatorAddress: msg.value.validator_address,
          }).finish(),
        };
      }),
      {
        amount: stdFee.amount ?? [],
      },
      memo
    );

    await this.base.sendMsgs(
      "withdrawRewards",
      {
        aminoMsgs: msgs,
        protoMsgs: this.checkNoLegacyStdFeature(
          msgs.map((msg) => {
            return {
              typeUrl:
                "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
              value: MsgWithdrawDelegatorReward.encode({
                delegatorAddress: msg.value.delegator_address,
                validatorAddress: msg.value.validator_address,
              }).finish(),
            };
          })
        ),
        rlpTypes: {
          MsgValue: [
            { name: "delegator_address", type: "string" },
            { name: "validator_address", type: "string" },
          ],
        },
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: simulateTx?.gasUsed
          ? (simulateTx.gasUsed * 1.3 * validatorAddresses.length).toString()
          : stdFee.gas,
        // stdFee.gas ??
        // (
        //   this.base.msgOpts.withdrawRewards.gas * validatorAddresses.length
        // ).toString()
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to send token, refresh the balance.
          const queryBalance = this.queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom === currency //currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      })
    );
  }

  async sendGovVoteMsg(
    proposalId: string,
    option: "Yes" | "No" | "Abstain" | "NoWithVeto",
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    const voteOption = (() => {
      if (
        this.chainGetter.getChain(this.chainId).features?.includes("stargate")
      ) {
        switch (option) {
          case "Yes":
            return 1;
          case "Abstain":
            return 2;
          case "No":
            return 3;
          case "NoWithVeto":
            return 4;
        }
      } else {
        return option;
      }
    })();

    const msg = {
      type: this.base.msgOpts.govVote.type,
      value: {
        option: voteOption,
        proposal_id: proposalId,
        voter: this.base.bech32Address,
      },
    };

    await this.base.sendMsgs(
      "govVote",
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                typeUrl: "/cosmos.gov.v1beta1.MsgVote",
                value: MsgVote.encode({
                  proposalId: Long.fromString(msg.value.proposal_id),
                  voter: msg.value.voter,
                  option: (() => {
                    switch (msg.value.option) {
                      case "Yes":
                      case 1:
                        return VoteOption.VOTE_OPTION_YES;
                      case "Abstain":
                      case 2:
                        return VoteOption.VOTE_OPTION_ABSTAIN;
                      case "No":
                      case 3:
                        return VoteOption.VOTE_OPTION_NO;
                      case "NoWithVeto":
                      case 4:
                        return VoteOption.VOTE_OPTION_NO_WITH_VETO;
                      default:
                        return VoteOption.VOTE_OPTION_UNSPECIFIED;
                    }
                  })(),
                }).finish(),
              },
            ]
          : undefined,
        rlpTypes: {
          MsgValue: [
            { name: "proposal_id", type: "uint64" },
            { name: "voter", type: "string" },
            { name: "option", type: "int32" },
          ],
        },
      },
      memo,
      {
        amount: stdFee?.amount ?? [],
        gas: stdFee?.gas ?? this.base.msgOpts.govVote.gas.toString(),
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to vote, refresh the proposal.
          const proposal = this.queries.cosmos.queryGovernance.proposals.find(
            (proposal) => proposal.id === proposalId
          );
          if (proposal) {
            proposal.fetch();
          }

          const vote = this.queries.cosmos.queryProposalVote.getVote(
            proposalId,
            this.base.bech32Address
          );
          vote.fetch();
        }
      })
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

  protected get queries(): DeepReadonly<QueriesSetBase & HasCosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes("no-legacy-stdTx")
    );
  }

  protected checkNoLegacyStdFeature(msgs): Array<any> {
    return this.hasNoLegacyStdFeature() ? msgs : undefined;
  }
}

import { ExtraOptionSendToken, MsgOpt } from './base';
import { AccountSetBase, AccountSetOpts } from './base';
import { AppCurrency, OWalletSignOptions } from '@owallet/types';

import { DenomHelper, EVMOS_NETWORKS } from '@owallet/common';
import { Dec, DecUtils, Int } from '@owallet/unit';

import { HasCosmosQueries, HasEvmQueries, QueriesSetBase, QueriesStore } from '../query';
import { DeepReadonly } from 'utility-types';
import { ChainGetter, StdFeeEthereum } from '../common';

export interface HasEthereumAccount {
  ethereum: DeepReadonly<EthereumAccount>;
}

export interface EthereumMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
}

export class AccountWithEthereum extends AccountSetBase<EthereumMsgOpts, HasEvmQueries> implements HasEthereumAccount {
  public readonly ethereum: DeepReadonly<EthereumAccount>;

  static readonly defaultMsgOpts: EthereumMsgOpts = {
    send: {
      native: {
        type: 'send',
        gas: 80000
      }
    }
  };

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<QueriesSetBase & HasEvmQueries>,
    protected readonly opts: AccountSetOpts<EthereumMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.ethereum = new EthereumAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class EthereumAccount {
  constructor(
    protected readonly base: AccountSetBase<EthereumMsgOpts, HasEvmQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<QueriesSetBase & HasEvmQueries>
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  //send token
  protected async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFeeEthereum>,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: ExtraOptionSendToken
  ): Promise<boolean> {
    if (signOptions.networkType === 'evm' || EVMOS_NETWORKS.includes(signOptions.chainId)) {
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);

      switch (denomHelper.type) {
        case 'erc20':
          const realAmount = (() => {
            let dec = new Dec(amount);
            dec = dec.mul(DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals));
            return dec.truncate().toString();
          })();

          await this.base.sendEvmMsgs(
            'send',
            {
              type: 'erc20',
              value: { ...extraOptions, amount: realAmount }
            },
            memo,
            {
              gas: '0x' + parseInt(stdFee.gas).toString(16),
              gasPrice: stdFee.gasPrice
            },
            signOptions,
            this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
              
              if (tx) {
                // After succeeding to send token, refresh the balance.

                const queryBalance = this.queries.queryBalances
                  .getQueryBech32Address(this.base.evmosHexAddress)
                  .balances.find((bal) => {
                    return bal.currency.coinMinimalDenom === currency.coinMinimalDenom;
                  });

                if (queryBalance) {
                  queryBalance.fetch();
                }
              }
            })
          );
          return true;
        case 'native':
          const actualAmount = (() => {
            let dec = new Dec(amount);
            dec = dec.mul(DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals));
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
                  amount: actualAmount
                }
              ]
            }
          };

          await this.base.sendEvmMsgs(
            'send',
            msg,
            memo,
            {
              gas: '0x' + parseInt(stdFee.gas).toString(16),
              gasPrice: stdFee.gasPrice
            },
            signOptions,
            this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
              console.log('Tx on fullfill: ', tx);
              if (tx) {
                // After succeeding to send token, refresh the balance.
                const queryBalance = this.queries.queryBalances
                  .getQueryBech32Address(this.base.evmosHexAddress)
                  .balances.find((bal) => {
                    return bal.currency.coinMinimalDenom === currency.coinMinimalDenom;
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

    const onBroadcasted = typeof onTxEvents === 'function' ? undefined : onTxEvents.onBroadcasted;
    const onFulfill = typeof onTxEvents === 'function' ? onTxEvents : onTxEvents.onFulfill;

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
          : undefined
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & HasEvmQueries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.features != null && chainInfo.features.includes('no-legacy-stdTx');
  }
}

import { MsgOpt } from './base';
import { AccountSetBase, AccountSetOpts } from './base';
import { AppCurrency, OWalletSignOptions } from '@owallet/types';
import { StdFee } from '@cosmjs/launchpad';
import { DenomHelper, EVMOS_NETWORKS } from '@owallet/common';
import { Dec, DecUtils, Int } from '@owallet/unit';
import { ChainIdHelper, cosmos, ibc } from '@owallet/cosmos';
import { BondStatus } from '../query/cosmos/staking/types';

import {
  HasCosmosQueries,
  HasBtcQueries,
  QueriesSetBase,
  QueriesStore
} from '../query';
import { DeepReadonly } from 'utility-types';
import { ChainGetter, StdFeeEthereum } from '../common';

export interface HasBitcoinAccount {
  bitcoin: DeepReadonly<BitcoinAccount>;
}

export interface BitcoinMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
}

export class AccountWithBitcoin
  extends AccountSetBase<BitcoinMsgOpts, HasBtcQueries>
  implements HasBitcoinAccount
{
  public readonly bitcoin: DeepReadonly<BitcoinAccount>;

  static readonly defaultMsgOpts: BitcoinMsgOpts = {
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
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasBtcQueries
    >,
    protected readonly opts: AccountSetOpts<BitcoinMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.bitcoin = new BitcoinAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class BitcoinAccount {
  constructor(
    protected readonly base: AccountSetBase<BitcoinMsgOpts, HasBtcQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasBtcQueries
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
    stdFee: Partial<StdFeeEthereum>,
    signOptions?: OWalletSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        },
    extraOptions?: {
      from: string;
      contract_addr: string;
      token_id?: string;
      recipient?: string;
      amount?: string;
      to?: string;
      gas?: string;
    }
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    console.log(stdFee, 'STD FEE ETHEREUM!!!!!!!!!!!!!!!!!!!!!');

    if (signOptions.networkType === 'bitcoin') {
      switch (denomHelper.type) {
        case 'native':
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
            //   if (tx) {
            //     // After succeeding to send token, refresh the balance.
            //     const queryEvmBalance =
            //       this.queries.evm.queryEvmBalance.getQueryBalance(
            //         this.base.evmosHexAddress
            //       );

            //     if (queryEvmBalance) {
            //       queryEvmBalance.fetch();
            //     }
            //   }
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
      typeof onTxEvents === 'function' ? undefined : onTxEvents.onBroadcasted;
    const onFulfill =
      typeof onTxEvents === 'function' ? onTxEvents : onTxEvents.onFulfill;

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

  protected get queries(): DeepReadonly<QueriesSetBase & HasBtcQueries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes('no-legacy-stdTx')
    );
  }
}

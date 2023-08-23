import { ExtraOptionSendToken, MsgOpt } from './base';
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
import { createMsg } from '@owallet/bitcoin';

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
    if (signOptions.networkType === 'bitcoin') {
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);
      console.log(stdFee, 'STD FEE BITCOIN!!!!!!!!!!!!!!!!!!!!!');
      console.log(
        '🚀 ~ file: bitcoin.ts:103 ~ BitcoinAccount ~ denomHelper.type:',
        denomHelper.type
      );
      switch (denomHelper.type) {
        case 'native':
          //   const actualAmount = (() => {
          //     let dec = new Dec(amount);
          //     dec = dec.mul(
          //       DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
          //     );
          //     return dec.truncate().toString();
          //   })();

          const msg: any = createMsg({
            address: recipient,
            changeAddress: this.base.bech32Address,
            amount: Number(extraOptions.amount),
            message: memo,
            totalFee: Number(stdFee.amount[0].amount),
            selectedCrypto: signOptions.chainId,
            confirmedBalance: extraOptions.confirmedBalance
          });
          console.log("🚀 ~ file: bitcoin.ts:117 ~ BitcoinAccount ~ msg:", msg)

          await this.base.sendBtcMsgs(
            'send',
            msg,
            memo,
            stdFee,
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
            }),
            extraOptions
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

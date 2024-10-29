import { ChainsService } from '../chains';
import { simpleFetch } from '@owallet/simple-fetch';
import { Notification } from '../tx/types';
import { Transaction, TransactionStatus, TransactionType } from '@owallet/types';
import { retry } from '@owallet/common';

export class BackgroundTxTronService {
  constructor(protected readonly chainsService: ChainsService, protected readonly notification: Notification) {}

  async init(): Promise<void> {
    // noop
  }

  async sendTronTx(
    chainId: string,
    signedTx: any,
    options: {
      silent?: boolean;
      onFulfill?: (tx: Transaction) => void;
    }
  ): Promise<string> {
    if (!options.silent) {
      this.notification.create({
        iconRelativeUrl: 'assets/logo-256.png',
        title: 'Tx is pending...',
        message: 'Wait a second'
      });
    }

    try {
      const isTronChain = this.chainsService.isTronChain(chainId);
      const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
      if (!chainInfo.grpc || !isTronChain) {
        throw new Error('No Tron info chain');
      }

      const txHash = '';
      if (!txHash) {
        throw new Error('No tx hash responded');
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            resolve();

            reject();
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 500,
          maxWaitMsAfterError: 4000
        }
      );

      return 'txHash';
    } catch (e) {
      console.error(e);
      if (!options.silent) {
        BackgroundTxTronService.processTxErrorNotification(this.notification, e);
      }
      throw e;
    }
  }

  private static processTxResultNotification(notification: Notification): void {
    try {
      notification.create({
        iconRelativeUrl: 'assets/logo-256.png',
        title: 'Tx succeeds',
        message: 'Congratulations!'
      });
    } catch (e) {
      BackgroundTxTronService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(notification: Notification, e: Error): void {
    const message = e.message;

    notification.create({
      iconRelativeUrl: 'assets/logo-256.png',
      title: 'Tx failed',
      message
    });
  }
}

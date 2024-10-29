import { ChainsService } from "../chains";
import { simpleFetch } from "@owallet/simple-fetch";
import { Notification } from "../tx/types";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@owallet/types";
import { getOasisNic, OasisTransaction, retry, TW } from "@owallet/common";
import * as oasis from "@oasisprotocol/client";
import { types } from "@oasisprotocol/client";
import { hashSignedTransaction } from "@oasisprotocol/client/dist/consensus";

export class BackgroundTxOasisService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly notification: Notification
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async sendOasisTx(
    chainId: string,
    signedTx: types.SignatureSigned,
    options: {
      silent?: boolean;
      onFulfill?: (tx: Transaction) => void;
    }
  ): Promise<string> {
    if (!options.silent) {
      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx is pending...",
        message: "Wait a second",
      });
    }

    try {
      const isOasisChain = this.chainsService.isOasisChain(chainId);
      const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
      if (!chainInfo.grpc || !isOasisChain) {
        throw new Error("No Oasis info chain");
      }
      const nic = getOasisNic(chainInfo.grpc);
      await nic.consensusSubmitTx(signedTx);
      const txHash = await hashSignedTransaction(signedTx);

      // await OasisTransaction.submit(nic, signedTx)
      // const txHash = await tw.hash();
      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            if (!txHash) {
              console.error("No tx hash responded");
              resolve();
            }

            if (txHash) {
              const transaction: Transaction = {
                hash: txHash,
                type: TransactionType.StakingTransfer,
                from: undefined,
                amount: undefined,
                to: undefined,
                status: TransactionStatus.Pending,
                fee: undefined,
                level: undefined,
                round: undefined,
                runtimeId: undefined,
                runtimeName: undefined,
                timestamp: undefined,
                nonce: undefined,
              };
              options?.onFulfill?.(transaction);
              BackgroundTxOasisService.processTxResultNotification(
                this.notification
              );
              resolve();
            }

            reject();
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 500,
          maxWaitMsAfterError: 4000,
        }
      );

      return txHash;
    } catch (e) {
      console.error(e);
      if (!options.silent) {
        BackgroundTxOasisService.processTxErrorNotification(
          this.notification,
          e
        );
      }
      throw e;
    }
  }

  private static processTxResultNotification(notification: Notification): void {
    try {
      notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx succeeds",
        message: "Congratulations!",
      });
    } catch (e) {
      BackgroundTxOasisService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(
    notification: Notification,
    e: Error
  ): void {
    const message = e.message;

    notification.create({
      iconRelativeUrl: "assets/logo-256.png",
      title: "Tx failed",
      message,
    });
  }
}

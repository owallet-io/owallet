import { ChainsService } from "../chains";
import { simpleFetch } from "@owallet/simple-fetch";
import { Notification } from "../tx/types";
import { retry } from "@owallet/common";
import { EthTxReceipt, TxBtcInfo } from "@owallet/types";

export class BackgroundTxBtcService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly notification: Notification
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async sendBtcTx(
    chainId: string,
    signedTx: string,
    options: {
      silent?: boolean;
      onFulfill?: (tx: TxBtcInfo) => void;
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
      const isBtcChain = this.chainsService.isBtcChain(chainId);
      const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
      if (!isBtcChain) {
        throw new Error("No Btc info chain");
      }
      const txReceiptResponse = await simpleFetch(`${chainInfo.rest}/tx`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: signedTx,
      });
      console.log(txReceiptResponse, "txReceiptResponse");
      if (txReceiptResponse.status !== 200)
        throw new Error("No tx hash responded");
      const txHash = txReceiptResponse.data;
      if (!txHash) {
        throw new Error("No tx hash responded");
      }
      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            try {
              const txReceiptResponse = await simpleFetch<TxBtcInfo>(
                `${chainInfo.rest}/tx/${txHash}`
              );
              if (txReceiptResponse?.data) {
                options?.onFulfill?.(txReceiptResponse?.data);
                BackgroundTxBtcService.processTxResultNotification(
                  this.notification
                );
                resolve();
              }
              reject();
            } catch (e) {
              reject();
              throw Error(e);
            }
          });
        },
        {
          maxRetries: 20,
          waitMsAfterError: 1000,
          maxWaitMsAfterError: 4000,
        }
      );

      //@ts-ignore
      return txHash;
    } catch (e) {
      console.error(e);
      if (!options.silent) {
        BackgroundTxBtcService.processTxErrorNotification(this.notification, e);
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
      BackgroundTxBtcService.processTxErrorNotification(notification, e);
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

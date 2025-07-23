import { ChainsService } from "../chains";
import { TendermintTxTracer } from "@owallet/cosmos";
import { Notification } from "./types";
import { simpleFetch } from "@owallet/simple-fetch";
import { Buffer } from "buffer/";
import { retry } from "@owallet/common";
import { TXSLcdRest } from "@owallet/types";
import { AuthInfo } from "@owallet/proto-types/cosmos/tx/v1beta1/tx";

interface CosmosSdkError {
  codespace: string;
  code: number;
  message: string;
}

interface ABCIMessageLog {
  msg_index: number;
  success: boolean;
  log: string;
  // Events StringEvents
}

export class BackgroundTxService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly notification: Notification
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async sendTx(
    chainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    options: {
      silent?: boolean;
      onFulfill?: (tx: any) => void;
    }
  ): Promise<Uint8Array> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    if (!options.silent) {
      this.notification.create({
        iconRelativeUrl: "assets/orai_wallet_logo.png",
        title: "Tx is pending...",
        message: "Wait a second",
      });
    }

    const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

    const params = isProtoTx
      ? {
          tx_bytes: Buffer.from(tx as any).toString("base64"),
          mode: (() => {
            switch (mode) {
              case "async":
                return "BROADCAST_MODE_ASYNC";
              case "block":
                return "BROADCAST_MODE_BLOCK";
              case "sync":
                return "BROADCAST_MODE_SYNC";
              default:
                return "BROADCAST_MODE_UNSPECIFIED";
            }
          })(),
        }
      : {
          tx,
          mode: mode,
        };

    try {
      console.log(
        `🔍 BackgroundTxService.sendTx - Using LCD endpoint: ${chainInfo.rest} for chain: ${chainId}`
      );
      console.log(
        `🔍 Chain config updateFromRepoDisabled: ${
          (chainInfo as any).updateFromRepoDisabled
        }`
      );

      const result = await simpleFetch<any>(
        chainInfo.rest,
        isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      const txResponse = isProtoTx ? result.data["tx_response"] : result.data;

      if (txResponse.code != null && txResponse.code !== 0) {
        throw new Error(txResponse["raw_log"]);
      }

      const txHash = Buffer.from(txResponse.txhash, "hex");
      if (
        (chainInfo?.chainId?.includes("Oraichain") ||
          chainId?.includes("oraibridge-subnet-2")) &&
        txHash
      ) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              try {
                const { status, data } = await simpleFetch<TXSLcdRest>(
                  `${chainInfo.rest}/cosmos/tx/v1beta1/txs/${txResponse.txhash}`
                );
                if (data && status === 200) {
                  const tx = { ...data?.tx_response } as any;

                  if (options.onFulfill) {
                    if (!tx.hash) {
                      tx.hash = data?.tx_response.txhash;
                    }
                    options.onFulfill(tx);
                  }

                  if (!options.silent) {
                    BackgroundTxService.processTxResultNotification(
                      this.notification,
                      tx
                    );
                  }

                  resolve();
                }
              } catch (error) {
                console.log("error", error);
                reject();
                throw Error(error);
              }
              reject();
            });
          },
          {
            maxRetries: 10,
            waitMsAfterError: 500,
            maxWaitMsAfterError: 1000,
          }
        );
        return txHash;
      }
      retry(
        () => {
          return new Promise<void>((resolve, reject) => {
            const txTracer = new TendermintTxTracer(
              chainInfo.rpc,
              "/websocket"
            );
            txTracer.addEventListener("close", () => {
              setTimeout(() => {
                reject();
              }, 500);
            });
            txTracer.addEventListener("error", () => {
              reject();
            });
            txTracer.traceTx(txHash).then((tx) => {
              txTracer.close();

              if (options.onFulfill) {
                if (!tx.hash) {
                  tx.hash = txHash;
                }
                options.onFulfill(tx);
              }

              if (!options.silent) {
                BackgroundTxService.processTxResultNotification(
                  this.notification,
                  tx
                );
              }

              resolve();
            });
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 10 * 1000, // 10sec
          maxWaitMsAfterError: 5 * 60 * 1000, // 5min
        }
      );

      return txHash;
    } catch (e) {
      console.log(e);
      if (!options.silent) {
        BackgroundTxService.processTxErrorNotification(this.notification, e);
      }
      throw e;
    }
  }

  private static processTxResultNotification(
    notification: Notification,
    result: any
  ): void {
    try {
      if (result.mode === "commit") {
        if (result.checkTx.code !== undefined && result.checkTx.code !== 0) {
          throw new Error(result.checkTx.log);
        }
        if (
          result.deliverTx.code !== undefined &&
          result.deliverTx.code !== 0
        ) {
          throw new Error(result.deliverTx.log);
        }
      } else {
        if (result.code != null && result.code !== 0) {
          // XXX: Hack of the support of the stargate.
          const log = result.log ?? (result as any)["raw_log"];
          throw new Error(log);
        }
      }

      notification.create({
        iconRelativeUrl: "assets/orai_wallet_logo.png",
        title: "Tx succeeds",
        // TODO: Let users know the tx id?
        message: "Congratulations!",
      });
    } catch (e) {
      BackgroundTxService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(
    notification: Notification,
    e: Error
  ): void {
    console.log(e);
    let message = e.message;

    // Tendermint rpc error.
    const regResult = /code:\s*(-?\d+),\s*message:\s*(.+),\sdata:\s(.+)/g.exec(
      e.message
    );
    if (regResult && regResult.length === 4) {
      // If error is from tendermint
      message = regResult[3];
    }

    try {
      // Cosmos-sdk error in ante handler
      const sdkErr: CosmosSdkError = JSON.parse(e.message);
      if (sdkErr?.message) {
        message = sdkErr.message;
      }
    } catch {
      // noop
    }

    try {
      // Cosmos-sdk error in processing message
      const abciMessageLogs: ABCIMessageLog[] = JSON.parse(e.message);
      if (abciMessageLogs && abciMessageLogs.length > 0) {
        for (const abciMessageLog of abciMessageLogs) {
          if (!abciMessageLog.success) {
            const sdkErr: CosmosSdkError = JSON.parse(abciMessageLog.log);
            if (sdkErr?.message) {
              message = sdkErr.message;
              break;
            }
          }
        }
      }
    } catch {
      // noop
    }

    notification.create({
      iconRelativeUrl: "assets/orai_wallet_logo.png",
      title: "Tx failed",
      message,
    });
  }
}

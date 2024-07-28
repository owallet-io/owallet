import { delay, inject, singleton } from "tsyringe";
import { TYPES } from "../types";
import Axios from "axios";
import { ChainInfoWithEmbed, ChainsService } from "../chains";
import { PermissionService } from "../permission";
import { TendermintTxTracer } from "@owallet/cosmos";
import { Notification } from "./types";

import { Buffer } from "buffer";
import { KeyRingService } from "../keyring";

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

// TODO: is this place good to place this function?
export async function request(
  rpc: string,
  method: string,
  params: any[]
): Promise<any> {
  const restInstance = Axios.create({
    ...{
      baseURL: rpc,
    },
    adapter: "fetch",
  });

  const response = await restInstance.post(
    "/",
    {
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "x-api-key": process.env.X_API_KEY,
      },
    }
  );

  if (response.data.result) return response.data.result;
  if (response.data.error) throw new Error(JSON.stringify(response.data.error));
  return response.data;
  // throw new Error(`Unexpected error from the network: ${JSON.stringify(response.data)}`);
}

@singleton()
export class BackgroundTxService {
  constructor(
    @inject(delay(() => ChainsService))
    protected readonly chainsService: ChainsService,
    @inject(delay(() => KeyRingService))
    protected readonly keyRingService: KeyRingService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService,
    @inject(TYPES.Notification)
    protected readonly notification: Notification
  ) {}

  async sendTx(
    chainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block"
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    const restInstance = Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
      adapter: "fetch",
    });

    this.notification.create({
      iconRelativeUrl: "assets/orai_wallet_logo.png",
      title: "Tx is pending...",
      message: "Wait a second",
    });

    // here
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
      const result = await restInstance.post(
        isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
        params
      );

      const txResponse = isProtoTx ? result.data["tx_response"] : result.data;

      if (txResponse.code != null && txResponse.code !== 0) {
        throw new Error(txResponse["raw_log"]);
      }

      const txHash = Buffer.from(txResponse.txhash, "hex");

      const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer.traceTx(txHash).then((tx) => {
        txTracer.close();
        BackgroundTxService.processTxResultNotification(this.notification, tx);
      });

      return txHash;
    } catch (e: any) {
      console.log(e);
      BackgroundTxService.processTxErrorNotification(this.notification, e);
      throw e;
    }
  }

  // private parseChainId({ chainId }: { chainId: string }): {
  //   chainId: string;
  //   isEvm: boolean;
  // } {
  //   if (!chainId) throw new Error("Invalid empty chain id when switching Ethereum chain");
  //   if (chainId.substring(0, 2) === "0x") return { chainId: chainId, isEvm: true };
  //   return { chainId, isEvm: false };
  // }

  // async request(chainId: string, method: string, params: any[]): Promise<any> {
  //   let chainInfo: ChainInfoWithEmbed;
  //   switch (method) {
  //     case "eth_accounts":
  //     case "eth_requestAccounts":
  //       console.log("check zo day");
  //       chainInfo = await this.chainsService.getChainInfo(chainId);
  //       if (chainInfo.coinType !== 60) return undefined;
  //       const chainIdOrCoinType = params.length ? parseInt(params[0]) : chainId; // default is cointype 60 for ethereum based
  //       const key = await this.keyRingService.getKey(chainIdOrCoinType);
  //       const ledgerCheck = await this.keyRingService.getKeyRingType();
  //       if (ledgerCheck === "ledger") {
  //         const addresses = await this.keyRingService.getKeyRingLedgerAddresses();
  //         return [`${addresses?.eth}`];
  //       }
  //       return [`0x${Buffer.from(key.address).toString("hex")}`];
  //     case "wallet_switchEthereumChain" as any:
  //       const { chainId: inputChainId, isEvm } = this.parseChainId(params[0]);
  //       chainInfo = isEvm
  //         ? await this.chainsService.getChainInfo(inputChainId, "evm")
  //         : await this.chainsService.getChainInfo(inputChainId);

  //       return chainInfo.chainId;
  //     default:
  //       chainInfo = await this.chainsService.getChainInfo(chainId);
  //       if (!chainInfo.rest)
  //         throw new Error(`The given chain ID: ${chainId} does not have a RPC endpoint to connect to`);
  //       return await request(chainInfo.rest, method, params);
  //   }
  // }

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
    } catch (e: any) {
      BackgroundTxService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(
    notification: Notification,
    e: Error
  ): void {
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

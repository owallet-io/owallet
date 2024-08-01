import {
  DEFAULT_BLOCK_TIME_IN_SECONDS,
  DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS,
} from "../utils/utils";
import Axios, { AxiosResponse } from "axios";
import { TxResponse, TxResTron, TxResultResponse } from "./type";

import TronWebProvider from "tronweb";
export class TxRestCosmosClient {
  constructor(
    protected readonly restApi: string,
    protected readonly restConfig: any
  ) {}
  public async fetchTx(txHash: string, params: any = {}): Promise<TxResponse> {
    try {
      const restInstance = Axios.create({
        ...{
          baseURL: this.restApi,
        },
        ...this.restConfig,
        adapter: "fetch",
      });
      const response = await restInstance.get<TxResultResponse>(
        `/cosmos/tx/v1beta1/txs/${txHash}`,
        params
      );

      const { tx_response: txResponse } = response.data;

      if (!txResponse) {
        throw (
          (new Error(`The transaction with ${txHash} is not found`),
          {
            context: "TxRestApi",
            contextModule: "fetch-tx",
          })
        );
      }

      if (parseInt(txResponse.code.toString(), 10) !== 0) {
        throw (
          (new Error(txResponse.raw_log),
          {
            contextCode: txResponse.code,
            contextModule: txResponse.codespace,
          })
        );
      }

      return {
        ...txResponse,
        rawLog: txResponse.raw_log,
        gasWanted: parseInt(txResponse.gas_wanted, 10),
        gasUsed: parseInt(txResponse.gas_used, 10),
        height: parseInt(txResponse.height, 10),
        txHash: txResponse?.txhash,
      };
    } catch (e: unknown) {
      // The response itself failed
      throw (
        (new Error("There was an issue while fetching transaction details"),
        {
          context: "TxRestApi",
          contextModule: "fetch-tx",
        })
      );
    }
  }
  public async fetchTxPoll(
    txHash: string,
    timeout = DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS || 60000
  ): Promise<TxResponse> {
    const POLL_INTERVAL = DEFAULT_BLOCK_TIME_IN_SECONDS * 1000;

    for (let i = 0; i <= timeout / POLL_INTERVAL; i += 1) {
      try {
        const txInfo = await this.fetchTx(txHash);
        const txResponse = txInfo;

        if (txResponse) {
          return txResponse;
        }
      } catch (e: unknown) {
        // We throw only if the transaction failed on chain
        if (e instanceof Error) {
          throw e;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    throw (
      (new Error(
        `Transaction was not included in a block before timeout of ${timeout}ms`
      ),
      {
        context: "TxRestApi",
        contextModule: "fetch-tx-poll",
      })
    );
  }
}

export class TxRestTronClient {
  constructor(
    protected readonly restApi: string,
    protected readonly restConfig: any
  ) {}
  public async fetchTx(txId: string, params: any = {}): Promise<TxResTron> {
    try {
      const tronWeb = new TronWebProvider({
        fullHost: this.restApi,
      });
      const result = (await tronWeb.trx.getTransactionInfo(txId)) as TxResTron;
      // const { tx_response: txResponse } = response.data;

      if (!result?.receipt) {
        throw (
          (new Error(`The transaction with ${txId} is not found`),
          {
            context: "TxRestApi",
            contextModule: "fetch-tx",
          })
        );
      }

      if (!result?.blockNumber) {
        throw (
          (new Error(`The transaction with ${txId} is FAILED`),
          {
            context: "TxRestApi",
            contextModule: "tx-failed",
          })
        );
      }

      return {
        ...result,
      };
    } catch (e: unknown) {
      // The response itself failed
      throw (
        (new Error("There was an issue while fetching transaction details"),
        {
          context: "TxRestApi",
          contextModule: "fetch-tx",
        })
      );
    }
  }
  public async fetchTxPoll(
    txHash: string,
    timeout = DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS || 60000
  ): Promise<TxResTron> {
    const POLL_INTERVAL = DEFAULT_BLOCK_TIME_IN_SECONDS * 1000;

    for (let i = 0; i <= timeout / POLL_INTERVAL; i += 1) {
      try {
        const txInfo = await this.fetchTx(txHash);
        const txResponse = txInfo;

        if (txResponse) {
          return txResponse;
        }
      } catch (e: unknown) {
        // We throw only if the transaction failed on chain
        if (e instanceof Error) {
          throw e;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    throw (
      (new Error(
        `Transaction was not included in a block before timeout of ${timeout}ms`
      ),
      {
        context: "TxRestApi",
        contextModule: "fetch-tx-poll",
      })
    );
  }
}

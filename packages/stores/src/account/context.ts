import {
  OWallet,
  Key,
  SettledResponse,
  SettledResponses,
} from "@owallet/types";
import { DebounceActionTimer } from "@owallet/mobx-utils";

export class AccountSharedContext {
  protected suggestChainDebounceTimer = new DebounceActionTimer<
    [fn: () => Promise<void>],
    void
  >(0, async (requests) => {
    const responses: SettledResponses<void> = [];
    for (const req of requests) {
      try {
        await req.args[0]();
        responses.push({
          status: "fulfilled",
          value: undefined,
        });
      } catch (e) {
        responses.push({
          status: "rejected",
          reason: e.toString(),
        });
      }
    }

    return responses;
  });
  protected enableDebounceTimer = new DebounceActionTimer<
    [chainId: string],
    void
  >(0, async (requests) => {
    const owallet = await this.getOWallet();

    if (!owallet) {
      return requests.map(() => {
        return {
          status: "rejected",
          reason: new Error("OWallet is not installed"),
        };
      });
    }

    const chainIdSet = new Set<string>(requests.map((req) => req.args[0]));
    const chainIds = Array.from(chainIdSet);
    try {
      await owallet.enable(chainIds);

      return requests.map(() => {
        return {
          status: "fulfilled",
          value: undefined,
        };
      });
    } catch (e) {
      return requests.map(() => {
        return {
          status: "rejected",
          reason: e.toString(),
        };
      });
    }
  });
  protected getKeyDebounceTimer = new DebounceActionTimer<
    [chainId: string],
    Key
  >(0, async (requests) => {
    const owallet = await this.getOWallet();

    if (!owallet) {
      return requests.map(() => {
        return {
          status: "rejected",
          reason: new Error("OWallet is not installed"),
        };
      });
    }

    const chainIdSet = new Set<string>(requests.map((req) => req.args[0]));
    const chainIds = Array.from(chainIdSet);

    const settled = await owallet.getKeysSettled(chainIds);

    const settledMap = new Map<string, SettledResponse<Key>>();
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const res = settled[i];
      settledMap.set(chainId, res);
    }

    return requests.map((req) => settledMap.get(req.args[0])!);
  });

  protected promiseGetOWallet?: Promise<OWallet | undefined>;

  constructor(
    protected readonly _getOWallet: () => Promise<OWallet | undefined>
  ) {}

  async getOWallet(): Promise<OWallet | undefined> {
    if (this.promiseGetOWallet) {
      return this.promiseGetOWallet;
    }

    const promise = new Promise<OWallet | undefined>((resolve, reject) => {
      this._getOWallet()
        .then((owallet) => {
          this.promiseGetOWallet = undefined;
          resolve(owallet);
        })
        .catch((e) => {
          this.promiseGetOWallet = undefined;
          reject(e);
        });
    });
    return (this.promiseGetOWallet = promise);
  }

  suggestChain(fn: () => Promise<void>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.suggestChainDebounceTimer.call([fn], (res) => {
        if (res.status === "fulfilled") {
          resolve();
        } else {
          reject(res.reason);
        }
      });
    });
  }

  enable(chainId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.enableDebounceTimer.call([chainId], (res) => {
        if (res.status === "fulfilled") {
          resolve();
        } else {
          reject(res.reason);
        }
      });
    });
  }

  getKey(
    chainId: string,
    action: (res: SettledResponse<Key>) => void
  ): Promise<void> {
    return this.getKeyDebounceTimer.call([chainId], action);
  }
}

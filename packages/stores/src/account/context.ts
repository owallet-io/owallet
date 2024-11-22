import {
  OWallet,
  Key,
  SettledResponse,
  SettledResponses,
  Ethereum,
  TronWeb,
  Bitcoin,
  Solana,
} from "@owallet/types";
import { DebounceActionTimer } from "@owallet/common";

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
          reason: e,
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
          reason: e,
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
  protected promiseGetEthereum?: Promise<Ethereum | undefined>;
  protected promiseGetTronWeb?: Promise<TronWeb | undefined>;
  protected promiseGetBitcoin?: Promise<Bitcoin | undefined>;
  protected promiseGetSolana?: Promise<Solana | undefined>;

  constructor(
    protected readonly _getOWallet: () => Promise<OWallet | undefined>,
    protected readonly _getEthereum: () => Promise<Ethereum | undefined>,
    protected readonly _getTronWeb: () => Promise<TronWeb | undefined>,
    protected readonly _getBitcoin: () => Promise<Bitcoin | undefined>,
    protected readonly _getSolana: () => Promise<Solana | undefined>
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
  async getEthereum(): Promise<Ethereum | undefined> {
    if (this.promiseGetEthereum) {
      return this.promiseGetEthereum;
    }

    const promise = new Promise<Ethereum | undefined>((resolve, reject) => {
      this._getEthereum()
        .then((ethereum) => {
          this.promiseGetEthereum = undefined;
          resolve(ethereum);
        })
        .catch((e) => {
          this.promiseGetEthereum = undefined;
          reject(e);
        });
    });
    return (this.promiseGetEthereum = promise);
  }
  async getBitcoin(): Promise<Bitcoin | undefined> {
    if (this.promiseGetBitcoin) {
      return this.promiseGetBitcoin;
    }

    const promise = new Promise<Bitcoin | undefined>((resolve, reject) => {
      this._getBitcoin()
        .then((bitcoin) => {
          this.promiseGetBitcoin = undefined;
          resolve(bitcoin);
        })
        .catch((e) => {
          this.promiseGetBitcoin = undefined;
          reject(e);
        });
    });
    return (this.promiseGetBitcoin = promise);
  }
  async getSolana(): Promise<Solana | undefined> {
    if (this.promiseGetSolana) {
      return this.promiseGetSolana;
    }

    const promise = new Promise<Solana | undefined>((resolve, reject) => {
      this._getSolana()
        .then((bitcoin) => {
          this.promiseGetSolana = undefined;
          resolve(bitcoin);
        })
        .catch((e) => {
          this.promiseGetSolana = undefined;
          reject(e);
        });
    });
    return (this.promiseGetSolana = promise);
  }
  async getTronWeb(): Promise<TronWeb | undefined> {
    if (this.promiseGetTronWeb) {
      return this.promiseGetTronWeb;
    }

    const promise = new Promise<TronWeb | undefined>((resolve, reject) => {
      this._getTronWeb()
        .then((tronweb) => {
          this.promiseGetTronWeb = undefined;
          resolve(tronweb);
        })
        .catch((e) => {
          this.promiseGetTronWeb = undefined;
          reject(e);
        });
    });
    return (this.promiseGetTronWeb = promise);
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

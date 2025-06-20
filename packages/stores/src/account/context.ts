import {
  OWallet,
  Key,
  SettledResponse,
  SettledResponses,
  SupportedPaymentType,
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
  protected getKeyMixedDebounceTimer = new DebounceActionTimer<
    [chainId: string, isStarknet: boolean, isBitcoin: boolean],
    | Key
    | {
        name: string;
        hexAddress: string;
        pubKey: Uint8Array;
        address: Uint8Array;
        isNanoLedger: boolean;
      }
    | {
        name: string;
        pubKey: Uint8Array;
        address: string;
        paymentType: SupportedPaymentType;
        isNanoLedger: boolean;
      }
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

    const cosmosReqs = requests.filter((req) => !req.args[1] && !req.args[2]);
    const starknetReqs = requests.filter((req) => req.args[1] && !req.args[2]);
    const bitcoinReqs = requests.filter((req) => !req.args[1] && req.args[2]);

    const cosmosChainIdSet = new Set<string>(
      cosmosReqs.map((req) => req.args[0])
    );
    const cosmosChainIds = Array.from(cosmosChainIdSet);
    const starknetChainIdSet = new Set<string>(
      starknetReqs.map((req) => req.args[0])
    );
    const starknetChainIds = Array.from(starknetChainIdSet);
    const bitcoinChainIdSet = new Set<string>(
      bitcoinReqs.map((req) => req.args[0])
    );
    const bitcoinChainIds = Array.from(bitcoinChainIdSet);

    const settledMap = new Map<
      string,
      SettledResponse<
        | Key
        | {
            name: string;
            hexAddress: string;
            pubKey: Uint8Array;
            address: Uint8Array;
            isNanoLedger: boolean;
          }
        | {
            name: string;
            pubKey: Uint8Array;
            address: string;
            paymentType: SupportedPaymentType;
            isNanoLedger: boolean;
          }
      >
    >();

    if (cosmosChainIds.length > 0) {
      const cosmosSettled = await owallet.getKeysSettled(cosmosChainIds);
      for (let i = 0; i < cosmosChainIds.length; i++) {
        const chainId = cosmosChainIds[i];
        const res = cosmosSettled[i];
        settledMap.set(chainId, res);
      }
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

  getKeyMixed(
    chainId: string,
    isStarknet: boolean,
    isBitcoin: boolean,
    action: (
      res: SettledResponse<
        | Key
        | {
            name: string;
            hexAddress: string;
            pubKey: Uint8Array;
            address: Uint8Array;
            isNanoLedger: boolean;
          }
        | {
            name: string;
            pubKey: Uint8Array;
            address: string;
            paymentType: SupportedPaymentType;
            isNanoLedger: boolean;
            masterFingerprintHex?: string;
            derivationPath?: string;
          }
      >
    ) => void
  ): Promise<void> {
    return this.getKeyMixedDebounceTimer.call(
      [chainId, isStarknet, isBitcoin],
      action
    );
  }
}

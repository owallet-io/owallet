import { OWallet, Key, SettledResponse } from "@owallet/types";
import { DebounceActionTimer } from "@owallet/mobx-utils";

export class AccountSvmSharedContext {
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

    const settled = await owallet.solana.getKeysSettled(chainIds);

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

  getKey(
    chainId: string,
    action: (res: SettledResponse<Key>) => void
  ): Promise<void> {
    return this.getKeyDebounceTimer.call([chainId], action);
  }
}

import { ChainGetter, HasMapStore } from "@owallet/stores";
import { TrxAccountBase } from "./base";
import { OWallet } from "@owallet/types";
import { AccountTrxSharedContext } from "./context";

export class TrxAccountStore extends HasMapStore<TrxAccountBase> {
  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    const sharedContext = new AccountTrxSharedContext(getOWallet);
    super((chainId: string) => {
      return new TrxAccountBase(
        eventListener,
        chainGetter,
        chainId,
        sharedContext,
        getOWallet
      );
    });
  }

  getAccount(chainId: string): TrxAccountBase {
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

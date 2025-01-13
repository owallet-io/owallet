import { ChainGetter, HasMapStore } from "@owallet/stores";
import { SvmAccountBase } from "./base";
import { OWallet } from "@owallet/types";
import { AccountSvmSharedContext } from "./context";

export class SvmAccountStore extends HasMapStore<SvmAccountBase> {
  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    const sharedContext = new AccountSvmSharedContext(getOWallet);
    super((chainId: string) => {
      return new SvmAccountBase(
        eventListener,
        chainGetter,
        chainId,
        sharedContext,
        getOWallet
      );
    });
  }

  getAccount(chainId: string): SvmAccountBase {
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

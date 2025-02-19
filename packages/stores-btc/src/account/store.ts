import { ChainGetter, HasMapStore } from "@owallet/stores";
import { BtcAccountBase } from "./base";
import { OWallet } from "@owallet/types";
import { AccountBtcSharedContext } from "./context";

export class BtcAccountStore extends HasMapStore<BtcAccountBase> {
  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    const sharedContext = new AccountBtcSharedContext(getOWallet);
    super((chainId: string) => {
      return new BtcAccountBase(
        eventListener,
        chainGetter,
        chainId,
        sharedContext,
        getOWallet
      );
    });
  }

  getAccount(chainId: string): BtcAccountBase {
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

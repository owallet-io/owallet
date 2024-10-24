import { ChainGetter, HasMapStore } from "@owallet/stores";
import { OasisAccountBase } from "./base";
import { OWallet } from "@owallet/types";
import { AccountOasisSharedContext } from "./context";

export class OasisAccountStore extends HasMapStore<OasisAccountBase> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    const sharedContext = new AccountOasisSharedContext(getOWallet);
    super((chainId: string) => {
      return new OasisAccountBase(
        chainGetter,
        chainId,
        sharedContext,
        getOWallet
      );
    });
  }

  getAccount(chainId: string): OasisAccountBase {
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

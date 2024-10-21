import { ChainGetter, HasMapStore } from "@owallet/stores";
import { OasisAccountBase } from "./base";
import { OWallet } from "@owallet/types";

export class OasisAccountStore extends HasMapStore<OasisAccountBase> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    super((chainId: string) => {
      return new OasisAccountBase(chainGetter, chainId, getOWallet);
    });
  }

  getAccount(chainId: string): OasisAccountBase {
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

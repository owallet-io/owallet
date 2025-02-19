import { ChainGetter, HasMapStore } from "@owallet/stores";
import { EthereumAccountBase } from "./base";
import { OWallet } from "@owallet/types";

export class EthereumAccountStore extends HasMapStore<EthereumAccountBase> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    super((chainId: string) => {
      return new EthereumAccountBase(chainGetter, chainId, getOWallet);
    });
  }

  getAccount(chainId: string): EthereumAccountBase {
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

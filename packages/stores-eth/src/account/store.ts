import { ChainGetter, HasMapStore } from "@owallet/stores";
import { EthereumAccountBase } from "./base";
import { OWallet } from "@owallet/types";

export class EthereumAccountStore extends HasMapStore<EthereumAccountBase> {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly getKeplr: () => Promise<OWallet | undefined>
  ) {
    super((chainId: string) => {
      return new EthereumAccountBase(chainGetter, chainId, getKeplr);
    });
  }

  getAccount(chainId: string): EthereumAccountBase {
    // Allow access through chain identifier by accessing through chainGetter.
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }
}

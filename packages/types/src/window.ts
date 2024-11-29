import { OWallet, Ethereum, TronWeb, Bitcoin, Solana } from "./wallet";
import { OfflineSigner } from "@cosmjs/launchpad";
import { SecretUtils } from "./secretjs";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
export interface Window {
  owallet?: OWallet;
  bitcoin?: Bitcoin;
  ethereum?: Ethereum;
  owalletSolana?: Solana;
  eth_owallet?: Ethereum;
  tronWeb?: TronWeb;
  tronLink?: TronWeb;
  tronWeb_owallet?: TronWeb;
  tronLink_owallet?: TronWeb;
  getOfflineSigner?: (chainId: string) => OfflineSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (chainId: string) => OfflineSigner;
  getOfflineSignerAuto?: (
    chainId: string
  ) => Promise<OfflineSigner | OfflineDirectSigner>;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}

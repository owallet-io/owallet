import { OWallet, OWalletSignOptions } from "./wallet";
import { OfflineAminoSigner, OfflineDirectSigner } from "./cosmjs";
import { SecretUtils } from "./secretjs";

export interface Window {
  owallet?: OWallet;
  getOfflineSigner?: (
    chainId: string,
    signOptions?: OWalletSignOptions
  ) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (
    chainId: string,
    signOptions?: OWalletSignOptions
  ) => OfflineAminoSigner;
  getOfflineSignerAuto?: (
    chainId: string,
    signOptions?: OWalletSignOptions
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}

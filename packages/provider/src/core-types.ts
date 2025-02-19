import { AminoSignResponse, StdSignDoc } from "@owallet/types";

export interface OWalletCoreTypes {
  __core__getAnalyticsId(): Promise<string>;
  __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse>;
  __core__privilageSignAminoDelegate(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse>;

  __core__webpageClosed(): Promise<void>;
}

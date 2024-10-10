import {
  OWallet,
  OfflineDirectSigner,
  OfflineAminoSigner,
  AccountData,
  AminoSignResponse,
  StdSignDoc,
  DirectSignResponse,
  SignDoc,
  OWalletSignOptions,
} from "@owallet/types";

export class CosmJSOfflineSignerOnlyAmino implements OfflineAminoSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly owallet: OWallet,
    protected readonly signOptions?: OWalletSignOptions
  ) {}

  async getAccounts(): Promise<AccountData[]> {
    const key = await this.owallet.getKey(this.chainId);

    return [
      {
        address: key.bech32Address,
        // Currently, only secp256k1 is supported.
        algo: "secp256k1",
        pubkey: key.pubKey,
      },
    ];
  }

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    if (this.chainId !== signDoc.chain_id) {
      throw new Error("Unmatched chain id with the offline signer");
    }

    const key = await this.owallet.getKey(signDoc.chain_id);

    if (key.bech32Address !== signerAddress) {
      throw new Error("Unknown signer address");
    }

    return await this.owallet.signAmino(
      this.chainId,
      signerAddress,
      signDoc,
      this.signOptions
    );
  }

  // Fallback function for the legacy cosmjs implementation before the stargate.
  async sign(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.signAmino(signerAddress, signDoc);
  }
}

export class CosmJSOfflineSigner
  extends CosmJSOfflineSignerOnlyAmino
  implements OfflineAminoSigner, OfflineDirectSigner
{
  constructor(
    chainId: string,
    owallet: OWallet,
    signOptions?: OWalletSignOptions
  ) {
    super(chainId, owallet, signOptions);
  }

  async signDirect(
    signerAddress: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error("Unmatched chain id with the offline signer");
    }

    const key = await this.owallet.getKey(signDoc.chainId);

    if (key.bech32Address !== signerAddress) {
      throw new Error("Unknown signer address");
    }

    return await this.owallet.signDirect(
      this.chainId,
      signerAddress,
      signDoc,
      this.signOptions
    );
  }
}

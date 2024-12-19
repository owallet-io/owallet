import { Message, OWalletError } from "@owallet/router";
import { Key, SettledResponses, TransactionType } from "@owallet/types";
import { ROUTE } from "./constants";
import { SolanaSignInInput } from "@solana/wallet-standard-features";
import { isBase58 } from "@owallet/common";
import { PublicKey } from "@solana/web3.js";

export class GetSvmKeyMsg extends Message<Key> {
  public static type() {
    return "get-svm-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSvmKeyMsg.type();
  }
}
export class ConnectSvmMsg extends Message<{ publicKey: PublicKey }> {
  public static type() {
    return "connect-svm";
  }

  constructor(
    public readonly chainId: string,
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ConnectSvmMsg.type();
  }
}

export class GetSvmKeysSettledMsg extends Message<SettledResponses<Key>> {
  public static type() {
    return "get-svm-keys-settled";
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new Error("chainIds are not set");
    }

    const seen = new Map<string, boolean>();

    for (const chainId of this.chainIds) {
      if (seen.get(chainId)) {
        throw new Error(`chainId ${chainId} is duplicated`);
      }

      seen.set(chainId, true);
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSvmKeysSettledMsg.type();
  }
}
export class RequestSignAllTransactionSvm extends Message<
  Array<{
    signature: string;
    signedTx: string;
  }>
> {
  public static type() {
    return "request-sign-all-transaction-svm";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly txs: Array<string>
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new OWalletError("keyring", 230, "signer not set");
    }

    const isValid = isBase58(this.signer);
    if (!isValid) throw new OWalletError("keyring", 230, "Invalid signer");
    if (!this.txs) throw new OWalletError("keyring", 230, "txs not set");
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignAllTransactionSvm.type();
  }
}
export class RequestSignInSvm extends Message<{
  publicKey: string;
  signedMessage: string;
  signature: string;
  connectionUrl: string;
}> {
  public static type() {
    return "request-sign-in-svm";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly inputs: SolanaSignInInput
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new OWalletError("keyring", 230, "signer not set");
    }

    const isValid = isBase58(this.signer);
    if (!isValid) throw new OWalletError("keyring", 230, "Invalid signer");
    if (!this.inputs) throw new OWalletError("keyring", 230, "inputs not set");
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignInSvm.type();
  }
}
export class RequestSignMessageSvm extends Message<{
  signedMessage: string;
}> {
  public static type() {
    return "request-sign-message-svm";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly message: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new OWalletError("keyring", 230, "signer not set");
    }

    const isValid = isBase58(this.signer);
    if (!isValid) throw new OWalletError("keyring", 230, "Invalid signer");
    if (!this.message) throw new OWalletError("keyring", 230, "tx not set");
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignMessageSvm.type();
  }
}
export class RequestSignTransactionSvm extends Message<{
  signature: string;
  signedTx: string;
}> {
  public static type() {
    return "request-sign-transaction-svm";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly tx: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new OWalletError("keyring", 230, "signer not set");
    }

    const isValid = isBase58(this.signer);
    if (!isValid) throw new OWalletError("keyring", 230, "Invalid signer");
    if (!this.tx) throw new OWalletError("keyring", 230, "tx not set");
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignTransactionSvm.type();
  }
}
export class RequestSendAndConfirmTxSvm extends Message<Uint8Array> {
  public static type() {
    return "request-sign-and-confirm-tx-svm";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly unsignedTx: Uint8Array
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new OWalletError("keyring", 230, "signer not set");
    }

    const isValid = isBase58(this.signer);
    if (!isValid) throw new OWalletError("keyring", 230, "Invalid signer");
    if (!this.unsignedTx)
      throw new OWalletError("keyring", 230, "unsignedTx not set");
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSendAndConfirmTxSvm.type();
  }
}
// export class RequestSignBtcMsg extends Message<string> {
//   public static type() {
//     return "request-sign-btc";
//   }
//
//   constructor(
//     public readonly chainId: string,
//     public readonly signer: string,
//     public readonly message: Uint8Array,
//     public readonly signType: "legacy" | "bech32"
//   ) {
//     super();
//   }
//
//   validateBasic(): void {
//     if (!this.chainId) {
//       throw new Error("chain id not set");
//     }
//
//     if (!this.signer) {
//       throw new Error("signer not set");
//     }
//
//     if (!this.signType) {
//       throw new Error("sign type not set");
//     }
//
//     // Validate signer address.
//     try {
//       const isValid = isBtcAddress(this.signer);
//       if (!isValid) {
//         throw new Error("Invalid BTC Address");
//       }
//     } catch {
//       console.error(`Invalidate BTC address from ${RequestSignBtcMsg.type()}`);
//     }
//   }
//
//   override approveExternal(): boolean {
//     return true;
//   }
//
//   route(): string {
//     return ROUTE;
//   }
//
//   type(): string {
//     return RequestSignBtcMsg.type();
//   }
// }

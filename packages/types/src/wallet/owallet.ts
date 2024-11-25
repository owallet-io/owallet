import {
  ChainInfo,
  ChainInfoWithoutEndpoints,
  NetworkType,
} from "../chain-info";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineSigner,
  StdSignature,
} from "@cosmjs/launchpad";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { SecretUtils } from "../secretjs";
import Long from "long";
import { SignEthereumTypedDataObject } from "../typedMessage";
import { Signer } from "@oasisprotocol/client/dist/signature";
import { SettledResponses } from "src/settled";
import { Wallet } from "@wallet-standard/base";
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from "@wallet-standard/features";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import {
  SolanaSignAndSendTransactionMethod,
  SolanaSignInMethod,
  SolanaSignMessageMethod,
  SolanaSignTransactionMethod,
} from "@solana/wallet-standard-features";
export type AddressesLedger = {
  cosmos?: string;
  eth?: string;
  trx?: string;
  btc44?: string;
  btc84?: string;
  tbtc44?: string;
  tbtc84?: string;
};
export interface Key {
  // Name of the selected key store.
  readonly name?: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address?: string;
  readonly legacyAddress?: string;
  readonly base58Address?: string;
  // Indicate whether the selected account is from the nano ledger.
  // Because current cosmos app in the nano ledger doesn't support the direct (proto) format msgs,
  // this can be used to select the amino or direct signer.
  readonly isNanoLedger: boolean;
}

export type OWalletMode = "core" | "extension" | "mobile-web" | "walletconnect";

export interface OWalletIntereactionOptions {
  readonly sign?: OWalletSignOptions;
}

export interface OWalletSignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;

  readonly disableBalanceCheck?: boolean;
  readonly networkType?: NetworkType;
  readonly chainId?: string;
}

export interface OWallet {
  readonly version: string;
  /**
   * mode means that how OWallet is connected.
   * If the connected OWallet is browser's extension, the mode should be "extension".
   * If the connected OWallet is on the mobile app with the embeded web browser, the mode should be "mobile-web".
   */
  readonly mode: OWalletMode;
  defaultOptions: OWalletIntereactionOptions;

  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
  getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]>;
  enable(chainIds: string | string[]): Promise<void>;
  getKey(chainId: string): Promise<Key>;
  getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: OWalletSignOptions
  ): Promise<AminoSignResponse>;
  signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      /** SignDoc bodyBytes */
      bodyBytes?: Uint8Array | null;

      /** SignDoc authInfoBytes */
      authInfoBytes?: Uint8Array | null;

      /** SignDoc chainId */
      chainId?: string | null;

      /** SignDoc accountNumber */
      accountNumber?: Long | null;
    },
    signOptions?: OWalletSignOptions
  ): Promise<DirectSignResponse>;
  sendTx(
    chainId: string,
    /*
     If the type is `StdTx`, it is considered as legacy stdTx.
     If the type is `Uint8Array`, it is considered as proto tx.
     */
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array>;
  sendAndConfirmTransactionSvm?(
    chainId: string,
    signer: string,
    unsignedTx: string | Uint8Array
  ): Promise<Uint8Array>;
  signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature>;
  verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean>;

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner;
  getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner>;
  suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void>;
  getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string>;
  getEnigmaUtils(chainId: string): SecretUtils;

  /**
   * Sign the sign doc with ethermint's EIP-712 format.
   * The difference from signEthereum(..., EthSignType.EIP712) is that this api returns a new sign doc changed by the user's fee setting and the signature for that sign doc.
   * Encoding tx to EIP-712 format should be done on the side using this api.
   * Not compatible with cosmjs.
   * The returned signature is (r | s | v) format which used in ethereum.
   * v should be 27 or 28 which is used in the ethereum mainnet regardless of chain.
   * @param chainId
   * @param signer
   * @param eip712
   * @param signDoc
   * @param signOptions
   */
  experimentalSignEIP712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions?: OWalletSignOptions
  ): Promise<AminoSignResponse>;
  // Related to Enigma.
  // But, recommended to use `getEnigmaUtils` rather than using below.
  getEnigmaPubKey(chainId: string): Promise<Uint8Array>;
  getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array>;
  enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array>;
  enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array>;
}

export type EthereumMode =
  | "core"
  | "extension"
  | "mobile-web"
  | "walletconnect";
export type BitcoinMode = "core" | "extension" | "mobile-web" | "walletconnect";
export type DefaultMode = "core" | "extension" | "mobile-web" | "walletconnect";
export type TronWebMode = "core" | "extension" | "mobile-web" | "walletconnect";

export interface RequestArguments {
  method: string;
  params?: any;
  [key: string]: any;
}

export interface Ethereum {
  readonly version: string;
  /**
   * mode means that how Ethereum is connected.
   * If the connected Ethereum is browser's extension, the mode should be "extension".
   * If the connected Ethereum is on the mobile app with the embeded web browser, the mode should be "mobile-web".
   */
  readonly mode: EthereumMode;
  initChainId: string;
  // send(): Promise<void>;
  request(args: RequestArguments): Promise<any>;
  signAndBroadcastEthereum(
    chainId: string,
    data: object
  ): Promise<{ rawTxHex: string }>;
  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
  signEthereumTypeData(
    chainId: string,
    data: SignEthereumTypedDataObject
  ): Promise<void>;
  signReEncryptData(chainId: string, data: object): Promise<object>;
  signDecryptData(chainId: string, data: object): Promise<object>;
  getPublicKey(chainId: string): Promise<object>;
  signAndBroadcastTron(chainId: string, data: object): Promise<any>;
  // asyncRequest(): Promise<void>;
  // getKey(chainId: string): Promise<Key>;
}

export interface TronWeb {
  readonly version: string;
  readonly mode: TronWebMode;
  defaultAddress?: object;
  initChainId: string;
  sign(transaction: object): Promise<object>;
  sendRawTransaction(transaction: {
    raw_data: any;
    raw_data_hex: string;
    txID: string;
    visible?: boolean;
  }): Promise<object>;
  triggerSmartContract(
    address: string,
    functionSelector: string,
    options: any,
    parameters: any[],
    issuerAddress: string
  ): Promise<any>;
  getDefaultAddress(): Promise<object>;
}
export interface Bitcoin {
  readonly version: string;
  /**
   * mode means that how Ethereum is connected.
   * If the connected Ethereum is browser's extension, the mode should be "extension".
   * If the connected Ethereum is on the mobile app with the embeded web browser, the mode should be "mobile-web".
   */
  readonly mode: BitcoinMode;

  signAndBroadcast(
    chainId: string,
    data: object
  ): Promise<{ rawTxHex: string }>;
  getKey(chainId: string): Promise<Key>;
}

export interface Solana extends Wallet {
  destroy(): void;
  connected(): void;
  disconnected(): void;
  connect: StandardConnectMethod;
  disconnect: StandardDisconnectMethod;
  on: StandardEventsOnMethod;
  emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void;
  off<E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E]
  ): void;
  deserializeTransaction(
    serializedTransaction: Uint8Array
  ): Transaction | VersionedTransaction;
  signAndSendTransaction: SolanaSignAndSendTransactionMethod;
  signTransaction: SolanaSignTransactionMethod;
  signMessage: SolanaSignMessageMethod;
  signIn: SolanaSignInMethod;
}

export interface Oasis {
  readonly version: string;
  /**
   * mode means that how Oasis is connected.
   * If the connected Oasis is browser's extension, the mode should be "extension".
   * If the connected Oasis is on the mobile app with the embeded web browser, the mode should be "mobile-web".
   */
  readonly mode: DefaultMode;

  signOasis(amount: bigint, to: string): Promise<any>;
}

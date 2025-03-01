import { ChainInfo, ChainInfoWithoutEndpoints } from "../chain-info";
import { EthSignType } from "../ethereum";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  OfflineAminoSigner,
  StdSignature,
  DirectSignResponse,
  OfflineDirectSigner,
} from "../cosmjs";
import { SecretUtils } from "../secretjs";
import Long from "long";
import { SettledResponses } from "../settled";
import { DirectAuxSignResponse } from "../cosmjs-alt";
import EventEmitter from "events";
import { TransactionType } from "../oasis";
import { TW } from "../oasis/oasis-types";
import * as oasis from "@oasisprotocol/client";
import { types } from "@oasisprotocol/client";
import { TransactionBtcType } from "../btc";
import { ITronProvider } from "../tron";
import {
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { OWalletSolana } from "@oraichain/owallet-wallet-standard/src/window";
export interface Key {
  // Name of the selected key store.
  readonly name: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address: string;
  readonly ethereumHexAddress: string;
  readonly base58Address?: string;
  readonly btcLegacyAddress?: string;
  // Indicate whether the selected account is from the nano ledger.
  // Because current cosmos app in the nano ledger doesn't support the direct (proto) format msgs,
  // this can be used to select the amino or direct signer.
  readonly isNanoLedger: boolean;
  readonly isKeystone: boolean;
}

export type ICNSAdr36Signatures = {
  chainId: string;
  bech32Prefix: string;
  bech32Address: string;
  addressHash: "cosmos" | "ethereum";
  pubKey: Uint8Array;
  signatureSalt: number;
  signature: Uint8Array;
}[];

export type OWalletMode = "core" | "extension" | "mobile-web" | "walletconnect";

export interface OWalletIntereactionOptions {
  readonly sign?: OWalletSignOptions;
}

export interface OWalletSignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;

  readonly disableBalanceCheck?: boolean;
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

  ping(): Promise<void>;

  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
  enable(chainIds: string | string[]): Promise<void>;
  /**
   * Delete permissions granted to origin.
   * If chain ids are specified, only the permissions granted to each chain id are deleted (In this case, permissions such as getChainInfosWithoutEndpoints() are not deleted).
   * Else, remove all permissions granted to origin (In this case, permissions that are not assigned to each chain, such as getChainInfosWithoutEndpoints(), are also deleted).
   *
   * @param chainIds disable(Remove approve domain(s)) target chain ID(s).
   */
  disable(chainIds?: string | string[]): Promise<void>;

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
  signDirectAux(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      publicKey?: {
        typeUrl: string;
        value: Uint8Array;
      } | null;
      chainId?: string | null;
      accountNumber?: Long | null;
      sequence?: Long | null;
      tip?: {
        amount: {
          denom: string;
          amount: string;
        }[];
        tipper: string;
      } | null;
    },
    signOptions?: Exclude<
      OWalletSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    >
  ): Promise<DirectAuxSignResponse>;
  sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array>;

  signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures>;

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

  signEthereum(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array>;

  getOfflineSigner(
    chainId: string,
    signOptions?: OWalletSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino(
    chainId: string,
    signOptions?: OWalletSignOptions
  ): OfflineAminoSigner;
  getOfflineSignerAuto(
    chainId: string,
    signOptions?: OWalletSignOptions
  ): Promise<OfflineAminoSigner | OfflineDirectSigner>;

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

  getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]>;
  getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints>;

  /** Change wallet extension user name **/
  changeKeyRingName(opts: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string>;

  sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string>;

  suggestERC20(chainId: string, contractAddress: string): Promise<void>;

  readonly ethereum: IEthereumProvider;
  readonly oasis?: IOasisProvider;
  readonly bitcoin?: IBitcoinProvider;
  readonly tron?: ITronProvider;
  readonly solana?: ISolanaProvider;
}
export interface IOasisProvider extends EventEmitter {
  getKey(chainId: string): Promise<Key>;
  getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
  sendTx(chainId: string, signedTx: types.SignatureSigned): Promise<string>;
  sign(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: TransactionType
  ): Promise<types.SignatureSigned>;
}
// export interface ISolanaProvider extends OWalletSolana {
//   getKey(chainId: string): Promise<Key>;
//   getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
// }
export interface ISolanaProvider extends EventEmitter {
  getKey(chainId: string): Promise<Key>;
  publicKey: PublicKey | null;
  getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
  connect?(options?: {
    onlyIfTrusted?: boolean;
    reconnect?: boolean;
  }): Promise<{ publicKey: PublicKey }>;
  // connect(options): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T,
    publicKey?: PublicKey,
    connection?: Connection
  ): Promise<T>;
  signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>;
  signMessage(
    msg: Uint8Array,
    publicKey?: PublicKey
  ): Promise<{ signature: Uint8Array }>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: Array<T>,
    publicKey?: PublicKey,
    connection?: Connection
  ): Promise<Array<T>>;
}
export interface IBitcoinProvider extends EventEmitter {
  getKey(chainId: string): Promise<Key>;
  getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
  sendTx(chainId: string, signedTx: string): Promise<string>;
  sign(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: TransactionBtcType
  ): Promise<string>;
}

export interface RequestArguments {
  method: string;
  params?: any;
  [key: string]: any;
}

export interface IEthereumProvider extends EventEmitter {
  // It must be in the hexadecimal format used in EVM-based chains, not the format used in Tendermint nodes.
  readonly chainId: string | null;
  // It must be in the decimal format of chainId.
  readonly networkVersion: string | null;

  readonly selectedAddress: string | null;

  readonly isOWallet: boolean;
  readonly isMetaMask: boolean;

  isConnected(): boolean;

  request<T = unknown>({
    method,
    params,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    chainId?: string;
  }): Promise<T>;

  enable(): Promise<string[]>;
  net_version(): Promise<string>;
}

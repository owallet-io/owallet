import { EthermintChainIdHelper } from "@owallet/cosmos";
import { Message, OWalletError } from "@owallet/router";
import { ROUTE } from "./constants";
import {
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected,
} from "./keyring";
import { ExportKeyRingData, SignEthereumTypedDataObject } from "./types";

import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
} from "@owallet/cosmos";
import {
  BIP44,
  OWalletSignOptions,
  Key,
  BIP44HDPath,
  AppCurrency,
} from "@owallet/types";
import Joi from "joi";
import { AminoSignResponse, StdSignature } from "@cosmjs/launchpad";
import { StdSignDoc } from "@owallet/types";
import Long from "long";
import { Int } from "@owallet/unit";
import bigInteger from "big-integer";

const bip39 = require("bip39");
import { SignDoc } from "@owallet/proto-types/cosmos/tx/v1beta1/tx";
import { schemaRequestSignBitcoin } from "./validates";
import { ISimulateSignTron } from "@owallet/types";

export class RestoreKeyRingMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "restore-keyring";
  }

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RestoreKeyRingMsg.type();
  }
}

export class DeleteKeyRingMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "delete-keyring";
  }

  constructor(public readonly index: number, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new OWalletError("keyring", 201, "Invalid index");
    }

    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeleteKeyRingMsg.type();
  }
}

export class UpdateNameKeyRingMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "update-name-keyring";
  }

  constructor(
    public readonly index: number,
    public readonly name: string,
    public readonly email?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new OWalletError("keyring", 201, "Invalid index");
    }

    if (!this.name) {
      throw new OWalletError("keyring", 273, "name not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateNameKeyRingMsg.type();
  }
}

export class ShowKeyRingMsg extends Message<string> {
  public static type() {
    return "show-keyring";
  }

  constructor(public readonly index: number, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new OWalletError("keyring", 201, "Invalid index");
    }

    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ShowKeyRingMsg.type();
  }
}

export class SimulateSignTronMsg extends Message<any> {
  public static type() {
    return "simulate-sign-tron";
  }

  constructor(public readonly msg: any) {
    super();
  }

  validateBasic(): void {
    // if (!this.msg) {
    //   throw new OWalletError("keyring", 201, "msg sign tron not set");
    // }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SimulateSignTronMsg.type();
  }
}

export class CreateMnemonicKeyMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "create-mnemonic-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly mnemonic: string,
    public readonly password: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new OWalletError("keyring", 202, "Invalid kdf");
    }

    if (!this.mnemonic) {
      throw new OWalletError("keyring", 272, "mnemonic not set");
    }

    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }

    // Validate mnemonic.
    // Checksome is not validate in this method.
    // Keeper should handle the case of invalid checksome.
    try {
      bip39.mnemonicToEntropy(this.mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateMnemonicKeyMsg.type();
  }
}

export class AddMnemonicKeyMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "add-mnemonic-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly mnemonic: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new OWalletError("keyring", 202, "Invalid kdf");
    }

    if (!this.mnemonic) {
      throw new OWalletError("keyring", 272, "mnemonic not set");
    }

    // Validate mnemonic.
    // Checksome is not validate in this method.
    // Keeper should handle the case of invalid checksome.
    try {
      bip39.mnemonicToEntropy(this.mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddMnemonicKeyMsg.type();
  }
}

export class CreatePrivateKeyMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "create-private-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly privateKey: Uint8Array,
    public readonly password: string,
    public readonly meta: Record<string, string>
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new Error("Invalid kdf");
    }

    if (!this.privateKey || this.privateKey.length === 0) {
      throw new OWalletError("keyring", 275, "private key not set");
    }

    if (this.privateKey.length !== 32) {
      throw new OWalletError("keyring", 260, "invalid length of private key");
    }

    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreatePrivateKeyMsg.type();
  }
}

export class CreateLedgerKeyMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "create-ledger-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly password: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new OWalletError("keyring", 202, "Invalid kdf");
    }

    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateLedgerKeyMsg.type();
  }
}

export class AddPrivateKeyMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "add-private-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly privateKey: Uint8Array,
    public readonly meta: Record<string, string>
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new OWalletError("keyring", 202, "Invalid kdf");
    }

    if (!this.privateKey || this.privateKey.length === 0) {
      throw new OWalletError("keyring", 275, "private key not set");
    }

    if (this.privateKey.length !== 32) {
      throw new OWalletError("keyring", 260, "invalid length of private key");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddPrivateKeyMsg.type();
  }
}

export class AddLedgerKeyMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "add-ledger-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new OWalletError("keyring", 202, "Invalid kdf");
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddLedgerKeyMsg.type();
  }
}

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "lock-keyring";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LockKeyRingMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "unlock-keyring";
  }

  constructor(public readonly password = "", public readonly saving = false) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UnlockKeyRingMsg.type();
  }
}

export class GetKeyMsg extends Message<Key> {
  public static type() {
    return "get-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyMsg.type();
  }
}

export class RequestSignAminoMsg extends Message<AminoSignResponse> {
  public static type() {
    return "request-sign-amino";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: OWalletSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
    } = {}
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

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new OWalletError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      if (this.signDoc.msgs[0].value.signer !== this.signer) {
        throw new OWalletError("keyring", 233, "Unmatched signer in sign doc");
      }
    }

    if (!this.signOptions) {
      throw new OWalletError("keyring", 235, "Sign options are null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignAminoMsg.type();
  }
}

export class RequestSignEIP712CosmosTxMsg_v0 extends Message<AminoSignResponse> {
  public static type() {
    return "request-sign-eip-712-cosmos-tx-v0";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: OWalletSignOptions
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

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new OWalletError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }

      const { ethChainId } = EthermintChainIdHelper.parse(this.chainId);

      const ethChainIdInMsg: Int = (() => {
        const value = this.eip712.domain["chainId"];
        if (typeof value === "string" && value.startsWith("0x")) {
          return new Int(bigInteger(value.replace("0x", ""), 16).toString());
        }
        return new Int(value);
      })();
      if (!ethChainIdInMsg.equals(new Int(ethChainId))) {
        throw new Error(
          `Unmatched chain id for eth (expected: ${ethChainId}, actual: ${this.eip712.domain["chainId"]})`
        );
      }
    } else {
      throw new Error("Can't sign ADR-36 with EIP-712");
    }

    if (!this.signOptions) {
      throw new OWalletError("keyring", 235, "Sign options are null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignEIP712CosmosTxMsg_v0.type();
  }
}

// request goes here
export class RequestSignDirectMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return "request-sign-direct";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: string | null;
    },
    public readonly signOptions: OWalletSignOptions = {}
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

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    const signDoc = SignDoc.create({
      bodyBytes: this.signDoc.bodyBytes,
      authInfoBytes: this.signDoc.authInfoBytes,
      chainId: this.signDoc.chainId,
      accountNumber: this.signDoc.accountNumber
        ? Long.fromString(this.signDoc.accountNumber)
        : undefined,
    });

    if (signDoc.chainId !== this.chainId) {
      throw new OWalletError(
        "keyring",
        234,
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new OWalletError("keyring", 235, "Sign options are null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignDirectMsg.type();
  }
}

// request sign tron goes here
export class RequestSignTronMsg extends Message<{}> {
  public static type() {
    return "request-sign-tron";
  }

  constructor(public readonly chainId: string, public readonly data: object) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignTronMsg.type();
  }
}

export class RequestSendRawTransactionMsg extends Message<object> {
  public static type() {
    return "request-send-raw-transaction";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.data) {
      throw new Error("data not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestSendRawTransactionMsg.type();
  }
}

export class GetDefaultAddressTronMsg extends Message<{
  hex?: string;
  base58?: string;
  name?: string;
  type?: number;
}> {
  public static type() {
    return "get-default-address-tron";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetDefaultAddressTronMsg.type();
  }
}

export class TriggerSmartContractMsg extends Message<{}> {
  public static type() {
    return "trigger-smart-contract-tron";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: {
      address: string;
      functionSelector: string;
      options: { feeLimit?: number };
      parameters: any[];
      issuerAddress: string;
    }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return TriggerSmartContractMsg.type();
  }
}

// request sign ethereum goes here
export class RequestSignEthereumMsg extends Message<{
  readonly rawTxHex: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-ethereum";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {} // public readonly signer: string, // public readonly signDoc: { //   bodyBytes?: Uint8Array | null; //   authInfoBytes?: Uint8Array | null; //   chainId?: string | null; //   accountNumber?: string | null; // }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "dât not set");
    }

    // const signDoc = cosmos.tx.v1beta1.SignDoc.create({
    //   bodyBytes: this.signDoc.bodyBytes,
    //   authInfoBytes: this.signDoc.authInfoBytes,
    //   chainId: this.signDoc.chainId,
    //   accountNumber: this.signDoc.accountNumber
    //     ? Long.fromString(this.signDoc.accountNumber)
    //     : undefined,
    // });

    // if (signDoc.chainId !== this.chainId) {
    //   throw new OWalletError(
    //     'keyring',
    //     234,
    //     'Chain id in the message is not matched with the requested chain id'
    //   );
    // }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignEthereumMsg.type();
  }
}

export class RequestSignBitcoinMsg extends Message<{
  readonly rawTxHex: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-bitcoin";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {} // public readonly signer: string, // public readonly signDoc: { //   bodyBytes?: Uint8Array | null; //   authInfoBytes?: Uint8Array | null; //   chainId?: string | null; //   accountNumber?: string | null; // }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }

    const { value, error } = schemaRequestSignBitcoin.validate(this.data);
    if (!!error) {
      throw new OWalletError("keyring", 231, error.message);
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBitcoinMsg.type();
  }
}

export class RequestSignEthereumTypedDataMsg extends Message<{
  readonly result: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-ethereum-typed-data";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: SignEthereumTypedDataObject // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "dât not set");
    }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignEthereumTypedDataMsg.type();
  }
}

export class RequestPublicKeyMsg extends Message<{
  readonly result: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-public-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestPublicKeyMsg.type();
  }
}

export class RequestSignDecryptDataMsg extends Message<{
  readonly result: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-proxy-deryption-data";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignDecryptDataMsg.type();
  }
}

export class RequestSignProxyReEncryptionDataMsg extends Message<{
  readonly result: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-proxy-re-encryption-data";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignProxyReEncryptionDataMsg.type();
  }
}

export class RequestSignProxyDecryptionDataMsg extends Message<{
  readonly result: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-proxy-deryption-data";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignProxyDecryptionDataMsg.type();
  }
}

export class RequestSignReEncryptDataMsg extends Message<{
  readonly result: string; // raw tx signature to broadcast
}> {
  public static type() {
    return "request-sign-re-encrypt-data";
  }

  constructor(
    public readonly chainId: string,
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.data) {
      throw new OWalletError("keyring", 231, "data not set");
    }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignReEncryptDataMsg.type();
  }
}

export class RequestVerifyADR36AminoSignDoc extends Message<boolean> {
  public static type() {
    return "request-verify-adr-36-amino-doc";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: Uint8Array,
    public readonly signature: StdSignature
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

    if (!this.signature) {
      throw new OWalletError("keyring", 271, "Signature not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestVerifyADR36AminoSignDoc.type();
  }
}

export class GetMultiKeyStoreInfoMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "get-multi-key-store-info";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetMultiKeyStoreInfoMsg.type();
  }
}

export class ChangeKeyRingMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "change-keyring";
  }

  constructor(public readonly index: number) {
    super();
  }

  validateBasic(): void {
    if (this.index < 0) {
      throw new OWalletError("keyring", 200, "Index is negative");
    }

    if (!Number.isInteger(this.index)) {
      throw new OWalletError("keyring", 201, "Invalid index");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangeKeyRingMsg.type();
  }
}

export class ChangeChainMsg extends Message<{
  chainInfos?: object;
}> {
  public static type() {
    return "change-chain";
  }

  constructor(public readonly chainInfos: object) {
    super();
  }

  validateBasic(): void {
    if (!this.chainInfos) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangeChainMsg.type();
  }
}

// Return the list of selectable path.
// If coin type was set for the key store, will return empty array.
export class GetIsKeyStoreCoinTypeSetMsg extends Message<
  {
    readonly path: BIP44;
    readonly bech32Address: string;
  }[]
> {
  public static type() {
    return "get-is-keystore-coin-type-set";
  }

  constructor(public readonly chainId: string, public readonly paths: BIP44[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (this.paths.length === 0) {
      throw new OWalletError("keyring", 250, "empty bip44 path list");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetIsKeyStoreCoinTypeSetMsg.type();
  }
}

export class SetKeyStoreCoinTypeMsg extends Message<KeyRingStatus> {
  public static type() {
    return "set-keystore-coin-type";
  }

  constructor(
    public readonly chainId: string,
    public readonly coinType: number
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (this.coinType < 0) {
      throw new OWalletError("keyring", 240, "coin type can not be negative");
    }

    if (!Number.isInteger(this.coinType)) {
      throw new OWalletError("keyring", 241, "coin type should be integer");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetKeyStoreCoinTypeMsg.type();
  }
}

export class SetKeyStoreLedgerAddressMsg extends Message<KeyRingStatus> {
  public static type() {
    return "set-keystore-ledger-address";
  }

  constructor(
    public readonly bip44HDPath: string,
    public readonly chainId: string | number
  ) {
    super();
  }

  validateBasic(): void {
    if (this.bip44HDPath === "") {
      throw new OWalletError(
        "keyring",
        240,
        "bip44HDPath address can not be empty"
      );
    }
    if (this.chainId === "") {
      throw new OWalletError(
        "keyring",
        240,
        "chainId address can not be empty"
      );
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetKeyStoreLedgerAddressMsg.type();
  }
}

export class CheckPasswordMsg extends Message<boolean> {
  public static type() {
    return "check-keyring-password";
  }

  constructor(public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckPasswordMsg.type();
  }
}

export class ExportKeyRingDatasMsg extends Message<ExportKeyRingData[]> {
  public static type() {
    return "export-keyring-datas";
  }

  constructor(public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new OWalletError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ExportKeyRingDatasMsg.type();
  }
}

// Oasis
// // request sign Oasis goes here
// export class RequestSignOasisMsg extends Message<{}> {
//   public static type() {
//     return "request-sign-oasis";
//   }

//   constructor(public readonly chainId: string, public readonly data: object) {
//     super();
//   }

//   validateBasic(): void {
//     if (!this.chainId) {
//       throw new OWalletError("keyring", 270, "chain id not set");
//     }

//     if (!this.data) {
//       throw new OWalletError("keyring", 231, "data not set");
//     }
//   }

//   approveExternal(): boolean {
//     return true;
//   }

//   route(): string {
//     return ROUTE;
//   }

//   type(): string {
//     return RequestSignOasisMsg.type();
//   }
// }

// export class GetDefaultAddressOasisMsg extends Message<{
//   hex?: string;
//   address?: string;
//   name?: string;
//   type?: number;
// }> {
//   public static type() {
//     return "get-default-address-oasis";
//   }

//   constructor(public readonly chainId: string) {
//     super();
//   }

//   validateBasic(): void {
//     if (!this.chainId) {
//       throw new OWalletError("keyring", 270, "chain id not set");
//     }
//   }

//   route(): string {
//     return ROUTE;
//   }

//   type(): string {
//     return GetDefaultAddressOasisMsg.type();
//   }
// }

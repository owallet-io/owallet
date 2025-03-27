import { PlainObject, Vault } from "../vault";
import { PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { ChainInfo, TransactionType } from "@owallet/types";
import { types } from "@oasisprotocol/client";
import { PublicKey } from "@solana/web3.js";

export type KeyRingStatus = "empty" | "locked" | "unlocked";

export type BIP44HDPath = {
  account: number;
  change: number;
  addressIndex: number;
};

export interface KeyInfo {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly isSelected: boolean;
  readonly insensitive: PlainObject;
}

export interface KeyRing {
  supportedKeyRingType(): string;

  createKeyRingVault(...args: any[]): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;
  simulateSignTron?(
    transaction: any,
    vault: Vault,
    coinType: number
  ): string | Promise<string>;
  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;
  sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256",
    chainInfo: ChainInfo
  ):
    | {
        readonly r: Uint8Array;
        readonly s: Uint8Array;
        readonly v: number | null;
      }
    | Promise<{
        readonly r: Uint8Array;
        readonly s: Uint8Array;
        readonly v: number | null;
      }>;
}
export interface KeyRingBtc {
  supportedKeyRingType(): string;

  createKeyRingVault(...args: any[]): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;

  getPubKeyBip84?(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;

  sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    //TODO: need check type inputs/outputs
    inputs: any,
    outputs: any,
    signType: "legacy" | "bech32",
    chainInfo: ChainInfo
  ): string | Promise<string>;
}
export interface KeyRingSvm {
  supportedKeyRingType(): string;

  createKeyRingVault(...args: any[]): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PublicKey | Promise<PublicKey>;

  sign(
    vault: Vault,
    coinType: number,
    data: string,
    chainInfo: ChainInfo
  ): string | Promise<string>;
}

export interface KeyRingOasis {
  supportedKeyRingType(): string;

  createKeyRingVault(...args: any[]): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): Uint8Array | Promise<Uint8Array>;

  sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    chainInfo: ChainInfo
  ): types.SignatureSigned | Promise<types.SignatureSigned>;
}

export interface KeyRingTron {
  supportedKeyRingType(): string;

  createKeyRingVault(...args: any[]): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;

  getPubKey(
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;

  sign(
    vault: Vault,
    coinType: number,
    data: string,
    chainInfo: ChainInfo
  ): unknown | Promise<unknown>;
}

export interface ExportedKeyRingVault {
  type: "mnemonic" | "private-key";
  id: string;
  insensitive: PlainObject;
  sensitive: string;
  privKey?: string;
  bip44HDPath?: {
    account: number;
    change: number;
    addressIndex: number;
  };
}

export interface PrivateKeyData {
  privateKey: Uint8Array;
  format: "hex" | "base58";
  chainType: string;
  meta?: Record<string, any>;
}

export interface PrivateKeyVault {
  type: "hex" | "base58";
  chainType: string;
  value: string;
  meta?: PlainObject;
}

export interface KeyRingVaultData {
  insensitive: PlainObject;
  sensitive: PlainObject;
}
export interface PrivateKeyCreateData {
  privateKey: Uint8Array;
  format: "hex" | "base58";
  chainType: string;
  meta?: Record<string, any>;
}

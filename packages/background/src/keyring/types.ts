import { PlainObject, Vault } from "../vault";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { ChainInfo, TransactionType } from "@owallet/types";
import { types } from "@oasisprotocol/client";

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

export interface ExportedKeyRingVault {
  type: "mnemonic" | "private-key";
  id: string;
  insensitive: PlainObject;
  sensitive: string;
}

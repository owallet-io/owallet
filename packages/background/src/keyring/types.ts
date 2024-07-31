import { BIP44HDPath } from "@owallet/types";
export type CoinTypeForChain = {
  [identifier: string]: number;
};

export interface CommonCrypto {
  scrypt: (text: string, params: ScryptParams) => Promise<Uint8Array>;
}

export interface ScryptParams {
  dklen: number;
  salt: string;
  n: number;
  r: number;
  p: number;
}

export interface ExportKeyRingData {
  type: "mnemonic" | "privateKey";
  // If the type is private key, the key is encoded as hex.
  key: string;
  coinTypeForChain: CoinTypeForChain;
  bip44HDPath: BIP44HDPath;
  meta: {
    [key: string]: string;
  };
}

export enum SignTypedDataVersion {
  V1 = "V1",
  V3 = "V3",
  V4 = "V4",
}

export interface MessageTypeProperty {
  name: string;
  type: string;
}
export interface MessageTypes {
  EIP712Domain: MessageTypeProperty[];
  [additionalProperties: string]: MessageTypeProperty[];
}

export type TypedDataV1 = TypedDataV1Field[];

export interface TypedDataV1Field {
  name: string;
  type: string;
  value: any;
}

export interface TypedMessage<T extends MessageTypes> {
  types: T;
  primaryType: keyof T;
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: ArrayBuffer;
  };
  message: Record<string, unknown>;
}
export interface MessageTypeProperty {
  name: string;
  type: string;
}
export interface ECDSASignature {
  v: number;
  r: Buffer;
  s: Buffer;
}

export interface SignEthereumTypedDataObject {
  typedMessage: TypedMessage<MessageTypes>;
  version: SignTypedDataVersion;
  defaultCoinType: number;
}

export interface SignEthereumTypedDataObject {
  typedMessage: TypedMessage<MessageTypes>;
  version: SignTypedDataVersion;
  defaultCoinType: number;
}

export interface PersonalSignObject {
  hashMessage: string;
}

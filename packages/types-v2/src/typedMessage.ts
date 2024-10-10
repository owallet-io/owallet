export interface SignEthereumTypedDataObject {
  typedMessage: TypedMessage<MessageTypes>;
  version: SignTypedDataVersion;
  defaultCoinType: number;
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

export declare enum SignTypedDataVersion {
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

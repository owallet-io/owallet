import { Message, OWalletError } from "@owallet/router";
import { Key, SettledResponses } from "@owallet/types";
import { ROUTE } from "./constants";

export class GetTronKeyMsg extends Message<Key> {
  public static type() {
    return "get-trx-key";
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
    return GetTronKeyMsg.type();
  }
}

export class GetTronKeysSettledMsg extends Message<SettledResponses<Key>> {
  public static type() {
    return "get-trx-keys-settled";
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
    return GetTronKeysSettledMsg.type();
  }
}

export class RequestSignTronMsg extends Message<{}> {
  public static type() {
    return "request-sign-tron";
  }

  constructor(public readonly chainId: string, public readonly data: string) {
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

export class RequestTriggerSmartContractMsg extends Message<{}> {
  public static type() {
    return "trigger-smart-contract";
  }

  constructor(public readonly chainId: string, public readonly data: string) {
    super();
  }

  validateBasic(): void {
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
    return RequestTriggerSmartContractMsg.type();
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

export class RequestGetTronAddressMsg extends Message<{}> {
  public static type() {
    return "request-get-tron-address";
  }

  constructor() {
    super();
  }

  validateBasic(): void {}

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestGetTronAddressMsg.type();
  }
}

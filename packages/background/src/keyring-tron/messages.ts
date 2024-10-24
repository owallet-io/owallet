import { Message } from "@owallet/router";
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

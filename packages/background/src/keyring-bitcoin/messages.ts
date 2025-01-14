import { Message } from "@owallet/router";
import { Key, SettledResponses, TransactionType } from "@owallet/types";
import { ROUTE } from "./constants";
import { isBtcAddress } from "@owallet/common";

export class GetBtcKeyMsg extends Message<Key> {
  public static type() {
    return "get-btc-key";
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
    return GetBtcKeyMsg.type();
  }
}

export class GetBtcKeysSettledMsg extends Message<SettledResponses<Key>> {
  public static type() {
    return "get-btc-keys-settled";
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
    return GetBtcKeysSettledMsg.type();
  }
}
export class RequestSignBtcMsg extends Message<string> {
  public static type() {
    return "request-sign-btc";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly message: Uint8Array,
    public readonly signType: "legacy" | "bech32"
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    if (!this.signType) {
      throw new Error("sign type not set");
    }

    // Validate signer address.
    try {
      const isValid = isBtcAddress(this.signer);
      if (!isValid) {
        throw new Error("Invalid BTC Address");
      }
    } catch {
      console.error(`Invalidate BTC address from ${RequestSignBtcMsg.type()}`);
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignBtcMsg.type();
  }
}

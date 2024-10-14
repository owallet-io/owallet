import { Message } from "@owallet/router";
import { ROUTE } from "./constants";

// Return the tx hash
export class SendTxMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly tx: unknown,
    public readonly mode: "async" | "sync" | "block",
    public readonly silent?: boolean | undefined
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.tx) {
      throw new Error("tx is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new Error("invalid mode");
    }
  }

  override approveExternal(): boolean {
    // Silent mode is only allowed for the internal txs.
    return !this.silent;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SendTxMsg.type();
  }
}

export class RequestEthereumMsg extends Message<string> {
  public static type() {
    return "send-tx-ethereum-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly method: string,
    public readonly params: any[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.method) {
      throw new Error("method is empty");
    }

    if (!this.params) {
      throw new Error("params is empty");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestEthereumMsg.type();
  }
}

import { OWalletError, Message } from "@owallet/router";
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
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("tx", 100, "chain id is empty");
    }

    if (!this.tx) {
      throw new OWalletError("tx", 101, "tx is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new OWalletError("tx", 120, "invalid mode");
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

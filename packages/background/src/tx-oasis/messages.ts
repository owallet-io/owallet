import { OWalletError, Message } from "@owallet/router";
import { ROUTE } from "./constants";
import { TW } from "@owallet/common";
import * as oasis from "@oasisprotocol/client";
import { types } from "@oasisprotocol/client";

// Return the tx hash
export class SendTxOasisMsg extends Message<string> {
  public static type() {
    return "send-oasis-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly signedTx: types.SignatureSigned,
    public readonly silent?: boolean
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("tx", 100, "chain id is empty");
    }

    if (!this.signedTx) {
      throw new OWalletError("tx", 101, "tx is empty");
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
    return SendTxOasisMsg.type();
  }
}

import { OWalletError, Message } from "@owallet/router";
import {
  AminoSignResponse,
  OWalletSignOptions,
  Key,
  SettledResponses,
  StdSignDoc,
  EthSignType,
  TransactionType,
} from "@owallet/types";
import { ROUTE } from "./constants";
import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
} from "@owallet/cosmos";
import { TW } from "@owallet/common";
import { types } from "@oasisprotocol/client";

export class GetOasisKeyMsg extends Message<Key> {
  public static type() {
    return "get-oasis-key";
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
    return GetOasisKeyMsg.type();
  }
}

export class GetOasisKeysSettledMsg extends Message<SettledResponses<Key>> {
  public static type() {
    return "get-oasis-keys-settled";
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
    return GetOasisKeysSettledMsg.type();
  }
}

export class RequestSignOasisMsg extends Message<types.SignatureSigned> {
  public static type() {
    return "request-sign-oasis";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly message: Uint8Array,
    public readonly signType: TransactionType
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
      Bech32Address.validate(this.signer);
    } catch {
      console.error(
        `Invalidate Bech32 address from ${RequestSignOasisMsg.type()}`
      );
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignOasisMsg.type();
  }
}

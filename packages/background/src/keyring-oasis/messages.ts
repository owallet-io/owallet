import { OWalletError, Message } from "@owallet/router";
import {
  AminoSignResponse,
  OWalletSignOptions,
  Key,
  SettledResponses,
  StdSignDoc,
} from "@owallet/types";
import { ROUTE } from "./constants";
import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
} from "@owallet/cosmos";

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

export class RequestOasisSignMsg extends Message<AminoSignResponse> {
  public static type() {
    return "request-oasis-sign";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: OWalletSignOptions
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new OWalletError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new OWalletError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new OWalletError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      if (this.signDoc.msgs[0].value.signer !== this.signer) {
        throw new OWalletError("keyring", 233, "Unmatched signer in sign doc");
      }
    }

    if (!this.signOptions) {
      throw new OWalletError("keyring", 235, "Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestOasisSignMsg.type();
  }
}

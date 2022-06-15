import { OWalletSignOptions } from '@owallet/types';
import { StdSignature } from '@cosmjs/launchpad';
import { Message } from './message';

export class RequestSignDirectMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return 'request-sign-direct';
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: string | null;
    },
    public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.signer) {
      throw new Error('signer not set');
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);

    // const signDoc = cosmos.tx.v1beta1.SignDoc.create({
    //   bodyBytes: this.signDoc.bodyBytes,
    //   authInfoBytes: this.signDoc.authInfoBytes,
    //   chainId: this.signDoc.chainId,
    //   accountNumber: this.signDoc.accountNumber
    //     ? Long.fromString(this.signDoc.accountNumber)
    //     : undefined,
    // });
    //
    // if (signDoc.chainId !== this.chainId) {
    //   throw new Error(
    //     "Chain id in the message is not matched with the requested chain id"
    //   );
    // }

    if (!this.signOptions) {
      throw new Error('Sign options are null');
    }
  }

  route(): string {
    return 'keyring';
  }

  type(): string {
    return RequestSignDirectMsg.type();
  }
}

// request sign ethereum goes here
export class RequestSignEthereumMsg extends Message<{
  readonly rawTxHex: string; // raw tx signature to broadcast
}> {
  public static type() {
    return 'request-sign-ethereum';
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: string,
    // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.signer) {
      throw new Error('signer not set');
    }

    // if (!this.signOptions) {
    //   throw new Error('Sign options are null');
    // }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return 'keyring';
  }

  type(): string {
    return RequestSignEthereumMsg.type();
  }
}
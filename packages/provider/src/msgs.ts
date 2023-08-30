import { StdSignature } from '@cosmjs/launchpad';
import { Message } from '@owallet/router';
import { OWalletSignOptions } from '@owallet/types';

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

// request sign tron
export class RequestSignBitcoinMsg extends Message<{
  readonly rawTxHex: string; // raw tx signature to broadcast
}> {
  public static type() {
    return 'request-sign-bitcoin';
  }

  constructor(public readonly chainId: string, public readonly data: object) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.data) {
      throw new Error('data not set');
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return 'keyring';
  }

  type(): string {
    return RequestSignBitcoinMsg.type();
  }
}
export class RequestSignTronMsg extends Message<{
  readonly rawTxHex: string; // raw tx signature to broadcast
}> {
  public static type() {
    return 'request-sign-tron';
  }

  constructor(public readonly chainId: string, public readonly data: object) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.data) {
      throw new Error('data not set');
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return 'keyring';
  }

  type(): string {
    return RequestSignTronMsg.type();
  }
}

export class GetDefaultAddressTronMsg extends Message<{}> {
  public static type() {
    return 'get-default-address-tron';
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }
  }

  route(): string {
    return 'keyring';
  }

  type(): string {
    return GetDefaultAddressTronMsg.type();
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
    public readonly data: object // public readonly signOptions: OWalletSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error('chain id not set');
    }

    if (!this.data) {
      throw new Error('data not set');
    }
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

import { Any } from "@owallet/proto-types/google/protobuf/any";
import { Dec } from "@owallet/unit";
import {
  BroadcastMode,
  OWallet,
  OWalletSignOptions,
  Msg,
  StdFee,
} from "@owallet/types";

export type ProtoMsgsOrWithAminoMsgs = {
  aminoMsgs?: Msg[];
  protoMsgs: Any[];

  // Add rlp types data if you need to support ethermint with ledger.
  // Must include `MsgValue`.
  rlpTypes?: Record<
    string,
    Array<{
      name: string;
      type: string;
    }>
  >;
};

export interface OWalletSignOptionsWithAltSignMethods
  extends OWalletSignOptions {
  readonly signAmino?: OWallet["signAmino"];
  readonly signDirect?: OWallet["signDirect"];
  readonly experimentalSignEIP712CosmosTx_v0?: OWallet["experimentalSignEIP712CosmosTx_v0"];
  readonly sendTx?: (
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ) => Promise<Uint8Array>;
}

export interface MakeTxResponse {
  ui: {
    type(): string;
    overrideType(type: string): void;
  };
  msgs(): Promise<ProtoMsgsOrWithAminoMsgs>;
  simulate(
    fee?: Partial<Omit<StdFee, "gas">>,
    memo?: string
  ): Promise<{
    gasUsed: number;
  }>;
  simulateAndSend(
    feeOptions: {
      gasAdjustment: number;
      gasPrice?: {
        denom: string;
        amount: Dec;
      };
    },
    memo?: string,
    signOptions?: OWalletSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
  send(
    fee: StdFee,
    memo?: string,
    signOptions?: OWalletSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
  sendWithGasPrice(
    gasInfo: {
      gas: number;
      gasPrice?: {
        denom: string;
        amount: Dec;
      };
    },
    memo?: string,
    signOptions?: OWalletSignOptionsWithAltSignMethods,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void>;
}

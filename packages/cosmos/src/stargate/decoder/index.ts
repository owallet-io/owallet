import {
  AuthInfo,
  SignDoc,
  SignDocDirectAux,
  TxBody,
} from "@owallet/proto-types/cosmos/tx/v1beta1/tx";
import { AnyWithUnpacked, defaultProtoCodec, ProtoCodec } from "../codec";
import { SignMode } from "@owallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { sortObjectByKey } from "@owallet/common";

export class ProtoSignDocDecoder {
  public static decode(bytes: Uint8Array): ProtoSignDocDecoder {
    return new ProtoSignDocDecoder(SignDoc.decode(bytes));
  }

  protected _txBody?: TxBody;
  protected _authInfo?: AuthInfo;

  constructor(
    public readonly signDoc: SignDoc | SignDocDirectAux,
    protected readonly protoCodec: ProtoCodec = defaultProtoCodec
  ) {}

  get txBody(): TxBody {
    if (!this._txBody) {
      this._txBody = TxBody.decode(this.signDoc.bodyBytes);
    }

    return this._txBody;
  }

  get txMsgs(): AnyWithUnpacked[] {
    const msgs: AnyWithUnpacked[] = [];
    for (const msg of this.txBody.messages) {
      msgs.push(this.protoCodec.unpackAny(msg));
    }

    return msgs;
  }

  get authInfo(): AuthInfo {
    if (!this._authInfo) {
      if ("authInfoBytes" in this.signDoc) {
        this._authInfo = AuthInfo.decode(this.signDoc.authInfoBytes);
      } else {
        // Actually it's impossible to create auth info from direct aux.
        // But we need it to reuse existing code, so we create it approximately.
        const directAux = this.signDoc;
        this._authInfo = AuthInfo.fromPartial({
          signerInfos: [
            {
              publicKey: directAux.publicKey,
              modeInfo: {
                single: {
                  mode: SignMode.SIGN_MODE_DIRECT,
                },
              },
              sequence: directAux.sequence,
            },
          ],
          fee: {
            amount: [],
            gasLimit: "1",
            payer: "",
            granter: "",
          },
        });
      }
    }

    return this._authInfo;
  }

  get chainId(): string {
    return this.signDoc.chainId;
  }

  get accountNumber(): string {
    return this.signDoc.accountNumber.toString();
  }

  toBytes(): Uint8Array {
    if ("authInfoBytes" in this.signDoc) {
      return SignDoc.encode(this.signDoc).finish();
    }
    return SignDocDirectAux.encode(this.signDoc).finish();
  }

  toJSON(): any {
    if ("authInfoBytes" in this.signDoc) {
      return sortObjectByKey({
        txBody: {
          ...(TxBody.toJSON(this.txBody) as any),
          ...{
            messages: this.txMsgs.map((msg) => {
              return this.protoCodec.unpackedAnyToJSONRecursive(msg);
            }),
          },
        },
        authInfo: AuthInfo.toJSON(this.authInfo),
        chainId: this.chainId,
        accountNumber: this.accountNumber,
      });
    }

    const directAuxJSON = SignDocDirectAux.toJSON(this.signDoc) as any;
    // The bodyBytes are unreadable in JSON format anyway.
    // Since we show txBody below, we remove bodyBytes.
    if (directAuxJSON.bodyBytes) {
      delete directAuxJSON.bodyBytes;
    }
    return sortObjectByKey({
      ...directAuxJSON,
      txBody: {
        ...(TxBody.toJSON(this.txBody) as any),
        ...{
          messages: this.txMsgs.map((msg) => {
            return this.protoCodec.unpackedAnyToJSONRecursive(msg);
          }),
        },
      },
    });
  }
}

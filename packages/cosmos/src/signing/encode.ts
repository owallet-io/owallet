import { PubKey, StdSignature, StdSignDoc } from "@owallet/types";
import { Buffer } from "buffer";
function escapeHTML(str: string): string {
  return str
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Unescapes \u003c/(<),\u003e(>),\u0026(&) in string.
 * Golang's json marshaller escapes <,>,& by default, whilst for most of the users, such escape characters are unfamiliar.
 * This function can be used to show the escaped characters with more familiar characters.
 * @param str
 */
function sortObjectByKey(obj: Record<string, any>): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectByKey);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  sortedKeys.forEach((key) => {
    result[key] = sortObjectByKey(obj[key]);
  });
  return result;
}

export function sortedJsonByKeyStringify(obj: Record<string, any>): string {
  return JSON.stringify(sortObjectByKey(obj));
}

export function encodeSecp256k1Pubkey(pubkey: Uint8Array): PubKey {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error(
      "Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03"
    );
  }
  return {
    type: "tendermint/PubKeySecp256k1",
    value: Buffer.from(pubkey).toString("base64"),
  };
}

export function encodeSecp256k1Signature(
  pubkey: Uint8Array,
  signature: Uint8Array
): StdSignature {
  if (signature.length !== 64) {
    throw new Error(
      "Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s."
    );
  }

  return {
    pub_key: encodeSecp256k1Pubkey(pubkey),
    signature: Buffer.from(signature).toString("base64"),
  };
}

export function serializeSignDoc(signDoc: StdSignDoc): Uint8Array {
  return Buffer.from(escapeHTML(sortedJsonByKeyStringify(signDoc)));
}

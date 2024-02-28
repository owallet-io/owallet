export function getBase58CheckAddress(addressBytes: any): string;
export function decodeBase58Address(base58Sting: any): false | number[];
export function signTransaction(priKeyBytes: any, transaction: any): any;
export function arrayToBase64String(a: any): string;
export function signBytes(privateKey: any, contents: any): string;
export function _signTypedData(
  domain: any,
  types: any,
  value: any,
  privateKey: any
): string;
export function getRowBytesFromTransactionBase64(base64Data: any): Uint8Array;
export function genPriKey(): any[];
export function computeAddress(pubBytes: any): any[];
export function getAddressFromPriKey(priKeyBytes: any): any[];
export function decode58Check(addressStr: any): false | number[];
export function isAddressValid(base58Str: any): boolean;
export function getBase58CheckAddressFromPriKeyBase64String(
  priKeyBase64String: any
): string;
export function getHexStrAddressFromPriKeyBase64String(
  priKeyBase64String: any
): string;
export function getAddressFromPriKeyBase64String(
  priKeyBase64String: any
): string;
export function getPubKeyFromPriKey(priKeyBytes: any): any[];
export function ECKeySign(hashBytes: any, priKeyBytes: any): string;
export function SHA256(msgBytes: any): any[];
export function passwordToAddress(password: any): string;
export function pkToAddress(privateKey: any, strict?: boolean): string;

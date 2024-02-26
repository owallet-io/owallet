export function Base64(): void;
export class Base64 {
    _keyStr: string;
    encode: (input: any) => string;
    encodeIgnoreUtf8: (inputBytes: any) => string;
    decode: (input: any) => string;
    decodeToByteArray: (input: any) => any[];
    _out2ByteArray: (utftext: any) => any[];
    _utf8_encode: (string: any) => string;
    _utf8_decode: (utftext: any) => string;
}

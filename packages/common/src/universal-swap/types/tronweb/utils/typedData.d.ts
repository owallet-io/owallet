export class TypedDataEncoder {
    static from(types: any): TypedDataEncoder;
    static getPrimaryType(types: any): any;
    static hashStruct(name: any, types: any, value: any): string;
    static hashDomain(domain: any): string;
    static encode(domain: any, types: any, value: any): string;
    static hash(domain: any, types: any, value: any): string;
    static getPayload(domain: any, types: any, value: any): {
        types: any;
        domain: {};
        primaryType: any;
        message: any;
    };
    constructor(types: any);
    getEncoder(type: any): any;
    _getEncoder(type: any): any;
    encodeType(name: any): any;
    encodeData(type: any, value: any): any;
    hashStruct(name: any, value: any): string;
    encode(value: any): any;
    hash(value: any): string;
    _visit(type: any, value: any, callback: any): any;
    visit(value: any, callback: any): any;
}

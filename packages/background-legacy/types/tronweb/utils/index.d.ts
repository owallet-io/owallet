declare namespace _default {
  export { code };
  export { accounts };
  export { base58 };
  export { bytes };
  export { crypto };
  export { abi };
  export { message };
  export { _TypedDataEncoder };
  export { transaction };
  export { ethersUtils };
  export function isValidURL(url: any): any;
  export function isObject(obj: any): boolean;
  export function isArray(array: any): boolean;
  export function isJson(string: any): boolean;
  export function isBoolean(bool: any): boolean;
  export function isBigNumber(number: any): boolean;
  export function isString(string: any): boolean;
  export function isFunction(obj: any): boolean;
  export function isHex(string: any): boolean;
  export function isInteger(number: any): boolean;
  export function hasProperty(obj: any, property: any): any;
  export function hasProperties(obj: any, ...properties: any[]): boolean;
  export function mapEvent(event: any): {
    block: any;
    timestamp: any;
    contract: any;
    name: any;
    transaction: any;
    result: any;
    resourceNode: any;
  };
  export function parseEvent(
    event: any,
    {
      inputs: abi,
    }: {
      inputs: any;
    }
  ): any;
  export function padLeft(input: any, padding: any, amount: any): any;
  export function isNotNullOrUndefined(val: any): boolean;
  export function sleep(millis?: number): Promise<any>;
}
export default _default;
import * as code from "./code";
import * as accounts from "./accounts";
import * as base58 from "./base58";
import * as bytes from "./bytes";
import * as crypto from "./crypto";
import * as abi from "./abi";
import * as message from "./message";
import { TypedDataEncoder as _TypedDataEncoder } from "./typedData";
import * as transaction from "./transaction";
import * as ethersUtils from "./ethersUtils";

export declare const protobufPackage = "noble.swap.v1";
/** buf:lint:ignore ENUM_VALUE_PREFIX */
export declare enum Algorithm {
  /** UNSPECIFIED - buf:lint:ignore ENUM_ZERO_VALUE_SUFFIX */
  UNSPECIFIED = 0,
  STABLESWAP = 1,
  PERFECTPRICE = 2,
  UNRECOGNIZED = -1,
}
export declare function algorithmFromJSON(object: any): Algorithm;
export declare function algorithmToJSON(object: Algorithm): string;

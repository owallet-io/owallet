export declare const protobufPackage = "stride.stakeibc";
export declare enum ICAAccountType {
  DELEGATION = 0,
  FEE = 1,
  WITHDRAWAL = 2,
  REDEMPTION = 3,
  UNRECOGNIZED = -1,
}
export declare function iCAAccountTypeFromJSON(object: any): ICAAccountType;
export declare function iCAAccountTypeToJSON(object: ICAAccountType): string;

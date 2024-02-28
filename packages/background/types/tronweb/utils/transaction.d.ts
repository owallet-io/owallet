export function txJsonToPb(transaction: any): any;
export function txPbToTxID(transactionPb: any): string;
export function txJsonToPbWithArgs(
  transaction: any,
  args?: {},
  options?: {}
): any;
export function txCheckWithArgs(
  transaction: any,
  args: any,
  options: any
): boolean;
export function txCheck(transaction: any): boolean;

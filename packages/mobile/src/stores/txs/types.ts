interface ParamsFilterReqTxs {
  action?: string;
  addressAccount?: string;
  token?: string;
}
interface TransferDetail {
  typeEvent: string;
  countTypeEvent: string;
  denom: string;
  isMinus: boolean;
  isPlus: boolean;
  transferInfo: TransferInfo[];
}
interface TransferInfo {
  from: string;
  to: string;
  amount: string;
}
interface ResTxsInfo {
  txHash: string;
  time: string;
  height: string;
  status: 'success' | 'fail';
  memo: string;
  gasUsed: number;
  gasWanted: number;
  fee: number;
  transfers: TransferDetail[];
}

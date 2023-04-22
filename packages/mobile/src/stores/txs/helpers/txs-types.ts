interface ParamsFilterReqTxs {
  action?: string;
  addressAccount?: string;
  token?: string;
}
interface TransferDetail {
  typeEvent: string;
  countTypeEvent: number;
  isMinus: boolean;
  isPlus: boolean;
  transferInfo: TransferInfo[];
}
interface TransferInfo {
  from: string;
  to: string;
  amount: string;
  token: string;
}
interface timeTxs {
  timeLong: string;
  timeShort: string;
}
interface ResTxsInfo {
  txHash: string;
  time: timeTxs;
  denom: string;
  height: string;
  status: 'success' | 'fail';
  memo: string;
  gasUsed: string;
  gasWanted: string;
  fee: string;
  transfers: Partial<TransferDetail>[];
}
interface ResTxs {
  current_page: number;
  total_page: number;
  result: Partial<ResTxsInfo>[];
}
interface InfoTxEthAndBsc {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  functionName: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  isError: string;
  methodId: string;
  nonce: string;
  timeStamp: string;
  to: string;
  transactionIndex: string;
  txreceipt_status: string;
  value: string;
}

interface txsEthAndBscResult {
  message: string;
  result: InfoTxEthAndBsc[];
  status: string;
}

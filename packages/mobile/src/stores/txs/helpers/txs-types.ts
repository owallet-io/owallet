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
interface ResDataTxsTron {
  total: number;
  rangeTotal: number;
  data: ResultDataTron[];
  wholeChainTxCount: number;
  contractMap: any;
  contractInfo: any;
}

type CostTron = {
  net_fee: number;
  energy_penalty_total: number;
  energy_usage: number;
  fee: number;
  energy_fee: number;
  energy_usage_total: number;
  origin_energy_usage: number;
  net_usage: number;
};

type TokenInfoTron = {
  tokenId: string;
  tokenAbbr: string;
  tokenName: string;
  tokenDecimal: number;
  tokenCanShow: number;
  tokenType: string;
  tokenLogo: string;
  tokenLevel: string;
  vip: boolean;
};

type ParameterTron = {
  _value: string;
  _to: string;
};

type TriggerInfoTron = {
  method: string;
  data: string;
  parameter: ParameterTron;
  methodId: string;
  methodName: string;
  contract_address: string;
  call_value: number;
};

type ContractDataTron = {
  data: string;
  owner_address: string;
  contract_address: string;
};

interface ResultDataTron {
  block: number;
  hash: string;
  timestamp: number;
  ownerAddress: string;
  toAddressList: string[];
  toAddress: string;
  contractType: number;
  confirmed: boolean;
  revert: boolean;
  contractData: ContractDataTron;
  SmartCalls: string;
  Events: string;
  id: string;
  data: string; // duplicate key
  fee: string;
  contractRet: string;
  result: string;
  amount: string;
  cost: CostTron;
  tokenInfo: TokenInfoTron;
  tokenType: string;
  trigger_info?: TriggerInfoTron; // optional because not present in all objects
}
interface timeTxs {
  timeLong: string;
  timeShort: string;
}
interface IInfoApi {
  RPC?: string;
  LCD?: string;
  BASE_URL?: string;
  API_KEY?: string;
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

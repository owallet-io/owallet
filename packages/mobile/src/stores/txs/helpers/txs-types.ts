import { StdFee } from "@owallet/types";

interface CurrencyInfo {
  prefix?: "cw20" | "trc20" | "erc20" | "bep20" | "ibc" | "";
  coinDenom?: string;
  coinMinimalDenom?: string;
  contractAddress?: string;
  coinDecimals?: number;
  coinGeckoId?: string;
  coinImageUrl?: string;
}
interface Currencies {
  [key: string]: CurrencyInfo;
}
//////////////
interface ResTxsEthAndBscByToken {
  status?: string;
  message?: string;
  result?: ResultEthAndBscByToken[];
}

interface ResultEthAndBscByToken {
  blockNumber?: string;
  timeStamp?: string;
  hash?: string;
  nonce?: string;
  blockHash?: string;
  from?: string;
  contractAddress?: string;
  to?: string;
  value?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  transactionIndex?: string;
  gas?: string;
  gasPrice?: string;
  gasUsed?: string;
  cumulativeGasUsed?: string;
  input?: string;
  confirmations?: string;
}

/////////////////////////////////////////////////
interface ResTxsRpcCosmos {
  txs?: TxRpcCosmos[];
  total_count?: string;
}

interface TxRpcCosmos {
  hash?: string;
  height?: string;
  index?: number;
  tx_result?: TxResultRpcCosmos;
  tx?: string;
}

interface TxResultRpcCosmos {
  code?: number;
  data?: string;
  log?: string;
  info?: string;
  gas_wanted?: string;
  gas_used?: string;
  events?: EventRpcCosmos[];
  codespace?: string;
}

interface EventRpcCosmos {
  type?: string;
  attributes?: AttributeRpcCosmos[];
}

interface AttributeRpcCosmos {
  key?: string;
  value?: string;
  index?: boolean;
}

interface ParamsFilterReqTxs {
  action?: string;
  addressAccount?: string;
  token?: string;
}
interface TransferDetail {
  typeEvent: string;
  transferInfo: TransferInfo[];
}
interface TransferInfo {
  from?: string;
  to?: string;
  isMinus?: boolean;
  isPlus?: boolean;
  amount?: string;
  token?: string;
  address?: string;
  txId?: string;
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
  date?: string;
  timestamp: number;
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
  denomFee: string;
  height: string;
  status: "success" | "fail" | "pending";
  memo: string;
  gasUsed: string;
  gasWanted: string;
  fee: string;
  stdFee?: StdFee;
  countTypeEvent: number;
  transfers: Partial<TransferDetail>[];
  isRefreshData?: boolean;
  isCosmos?: boolean;
  confirmations?: number;
  infoTransaction?: any;
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
//info bitcoin

interface InfoAddressBtc {
  address: string;
  chain_stats: ChainStats;
  mempool_stats: MempoolStats;
}

interface ChainStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

interface MempoolStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

interface txBitcoinResult {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: Status;
}

interface Vin {
  txid: string;
  vout: number;
  prevout: Prevout;
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: boolean;
  sequence: number;
}

interface Prevout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

interface Vout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

interface Status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

//Cosmos type////////////////////////

interface ResLcdCosmos {
  txs?: TxLcdCosmos[];
  tx_responses?: TxResponseLcdCosmos[];
  pagination?: PaginationLcdCosmos;
}
interface ResDetailLcdCosmos {
  txs?: TxLcdCosmos[];
  tx_response?: TxResponseLcdCosmos;
}

interface PaginationLcdCosmos {
  next_key?: null;
  total?: string;
}

interface TxResponseLcdCosmos {
  height?: string;
  txhash?: string;
  codespace?: string;
  code?: number;
  data?: string;
  raw_log?: string;
  logs?: Log[];
  info?: string;
  gas_wanted?: string;
  gas_used?: string;
  tx?: TxLcdCosmos;
  timestamp?: Date;
  events?: TxResponseEventLcdCosmos[];
}

interface TxResponseEventLcdCosmos {
  type?: string;
  attributes?: PurpleAttributeLcdCosmos[];
}

interface PurpleAttributeLcdCosmos {
  key?: string;
  value?: string;
  index?: boolean;
}

interface Log {
  msg_index?: number;
  log?: string;
  events?: LogEventLcdCosmos[];
}

interface LogEventLcdCosmos {
  type?: string;
  attributes?: FluffyAttributeLcdCosmos[];
}

interface FluffyAttributeLcdCosmos {
  key?: string;
  value?: string;
}

interface TxLcdCosmos {
  "@type"?: string;
  body?: Body;
  auth_info?: AuthInfo;
  signatures?: string[];
}

interface AuthInfo {
  signer_infos?: SignerInfoLcdCosmos[];
  fee?: FeeLcdCosmos;
}

interface FeeLcdCosmos {
  amount?: AmountLcdCosmos[];
  gas_limit?: string;
  payer?: string;
  granter?: string;
}

interface AmountLcdCosmos {
  denom?: string;
  amount?: string;
}

interface SignerInfoLcdCosmos {
  public_key?: PublicKey;
  mode_info?: ModeInfo;
  sequence?: string;
}

interface ModeInfo {
  single?: Single;
}

interface Single {
  mode?: string;
}

interface PublicKey {
  "@type"?: string;
  key?: string;
}

interface Body {
  messages?: MessageLcdCosmos[];
  memo?: string;
  timeout_height?: string;
  extension_options?: any[];
  non_critical_extension_options?: any[];
}

interface MessageLcdCosmos {
  "@type"?: string;
  sender?: string;
  contract?: string;
  msg?: MsgLcdCosmos;
  funds?: AmountLcdCosmos[];
}

interface MsgLcdCosmos {
  submit_order?: SubmitOrderLcdCosmos;
}

interface SubmitOrderLcdCosmos {
  assets?: AssetLcdCosmos[];
  direction?: string;
}

interface AssetLcdCosmos {
  amount?: string;
  info?: InfoLcdCosmos;
}

interface InfoLcdCosmos {
  native_token?: NativeTokenLcdCosmos;
  token?: TokenLcdCosmos;
}

interface NativeTokenLcdCosmos {
  denom?: string;
}

interface TokenLcdCosmos {
  contract_addr?: string;
}

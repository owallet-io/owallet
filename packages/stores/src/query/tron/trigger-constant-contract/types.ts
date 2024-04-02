import { ObservableQueryTriggerConstantContract } from "./index";

export interface ITriggerConstantContractReq {
  owner_address: string;
  contract_address: string;
  function_selector: string;
  parameter: string;
  visible: boolean;
}

export interface ITriggerConstantContract {
  result: Result;
  energy_used: number;
  constant_result: string[];
  logs: Log[];
  transaction: Transaction;
}

export interface Result {
  result: boolean;
}

export interface Log {
  address: string;
  data: string;
  topics: string[];
}

export interface Transaction {
  ret: Ret[];
  visible: boolean;
  txID: string;
  raw_data: RawData;
  raw_data_hex: string;
}

export interface Ret {}

export interface RawData {
  contract: Contract[];
  ref_block_bytes: string;
  ref_block_hash: string;
  expiration: number;
  timestamp: number;
}

export interface Contract {
  parameter: Parameter;
  type: string;
}

export interface Parameter {
  value: Value;
  type_url: string;
}

export interface Value {
  data: string;
  owner_address: string;
  contract_address: string;
}

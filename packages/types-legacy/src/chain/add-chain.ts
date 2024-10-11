export interface StatusRpcResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}

export interface Result {
  node_info: NodeInfo;
  sync_info: SyncInfo;
  validator_info: ValidatorInfo;
}

export interface NodeInfo {
  protocol_version: ProtocolVersion;
  id: string;
  listen_addr: string;
  network: string;
  version: string;
  channels: string;
  moniker: string;
  other: Other;
}

export interface ProtocolVersion {
  p2p: string;
  block: string;
  app: string;
}

export interface Other {
  tx_index: string;
  rpc_address: string;
}

export interface SyncInfo {
  latest_block_hash: string;
  latest_app_hash: string;
  latest_block_height: string;
  latest_block_time: string;
  earliest_block_hash: string;
  earliest_app_hash: string;
  earliest_block_height: string;
  earliest_block_time: string;
  catching_up: boolean;
}

export interface ValidatorInfo {
  address: string;
  pub_key: PubKeyData;
  voting_power: string;
}

export interface PubKeyData {
  type: string;
  value: string;
}

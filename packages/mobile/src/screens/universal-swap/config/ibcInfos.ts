export interface IBCInfo {
  source: string;
  channel: string;
  timeout: number;
}

import { CosmosChainId, NetworkChainId } from './chainInfos';
import { IBC_TRANSFER_TIMEOUT } from './constants';

export const [atom2oraichain, oraichain2atom] =
  process.env.REACT_APP_ATOM_ORAICHAIN_CHANNELS.split(/\s+/);
export const [osmosis2oraichain, oraichain2osmosis] =
  process.env.REACT_APP_OSMOSIS_ORAICHAIN_CHANNELS.split(/\s+/);
export const [oraib2oraichain, oraichain2oraib] =
  process.env.REACT_APP_ORAIB_ORAICHAIN_CHANNELS.split(/\s+/);
// export const [oraib2oraichain, oraichain2oraib] = ["channel-5", "channel-64"];
const [oraib2oraichain_old, oraichain2oraib_old] =
  process.env.REACT_APP_ORAIB_ORAICHAIN_CHANNELS_OLD.split(/\s+/);
const [kwt2oraichain, oraichain2kwt] =
  process.env.REACT_APP_KWT_ORAICHAIN_CHANNELS.split(/\s+/);
export type IBCInfoMap = {
  [key in CosmosChainId]: { [key in NetworkChainId]?: IBCInfo };
};

export const ibcInfos: IBCInfoMap = {
  'cosmoshub-4': {
    Oraichain: {
      source: 'transfer',
      channel: atom2oraichain,
      timeout: IBC_TRANSFER_TIMEOUT
    }
  },
  'osmosis-1': {
    Oraichain: {
      source: 'transfer',
      channel: osmosis2oraichain,
      timeout: IBC_TRANSFER_TIMEOUT
    }
  },
  'kawaii_6886-1': {
    Oraichain: {
      source: 'transfer',
      channel: kwt2oraichain,
      timeout: IBC_TRANSFER_TIMEOUT
    }
  },
  Oraichain: {
    'cosmoshub-4': {
      source: 'transfer',
      channel: oraichain2atom,
      timeout: IBC_TRANSFER_TIMEOUT
    },
    'osmosis-1': {
      source: 'transfer',
      channel: oraichain2osmosis,
      timeout: IBC_TRANSFER_TIMEOUT
    },
    'oraibridge-subnet-2': {
      source: `wasm.${process.env.REACT_APP_IBC_WASM_CONTRACT}`,
      channel: oraichain2oraib,
      timeout: IBC_TRANSFER_TIMEOUT
    },
    '0x01': {
      source: `wasm.${process.env.REACT_APP_IBC_WASM_CONTRACT}`,
      channel: oraichain2oraib,
      timeout: IBC_TRANSFER_TIMEOUT
    },
    '0x38': {
      source: `wasm.${process.env.REACT_APP_IBC_WASM_CONTRACT}`,
      channel: oraichain2oraib,
      timeout: IBC_TRANSFER_TIMEOUT
    },
    '0x2b6653dc': {
      source: `wasm.${process.env.REACT_APP_IBC_WASM_CONTRACT}`,
      channel: oraichain2oraib,
      timeout: IBC_TRANSFER_TIMEOUT
    },
    'kawaii_6886-1': {
      source: 'transfer',
      channel: oraichain2kwt,
      timeout: IBC_TRANSFER_TIMEOUT
    }
  },
  'oraibridge-subnet-2': {
    Oraichain: {
      source: 'transfer',
      channel: oraib2oraichain,
      timeout: IBC_TRANSFER_TIMEOUT
    }
  }
};

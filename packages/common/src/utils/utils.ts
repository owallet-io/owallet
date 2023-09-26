import { Base58 } from '@ethersproject/basex';
import { sha256 } from '@ethersproject/sha2';
import bech32, { fromWords } from 'bech32';
import { ETH } from '@hanchon/ethermint-address-converter';
import { TRON_ID } from './constants';
import { EmbedChainInfos } from '../config';

export type LedgerAppType = 'cosmos' | 'eth' | 'trx';
export const COINTYPE_NETWORK = {
  118: 'Cosmos',
  60: 'Ethereum',
  195: 'Tron'
};

export const getEvmAddress = (base58Address) => '0x' + Buffer.from(Base58.decode(base58Address)).slice(1, -4).toString('hex');

export const getBase58Address = (address) => {
  const evmAddress = '0x41' + (address ? address.substring(2) : '');
  const hash = sha256(sha256(evmAddress));
  const checkSum = hash.substring(2, 10);
  return Base58.encode(evmAddress + checkSum);
};

export const getAddressFromBech32 = (bech32address) => {
  const address = Buffer.from(fromWords(bech32.decode(bech32address).words));
  return ETH.encoder(address);
};

export const DEFAULT_BLOCK_TIMEOUT_HEIGHT = 90;
export const DEFAULT_BLOCK_TIME_IN_SECONDS = 2;
export const DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS = DEFAULT_BLOCK_TIMEOUT_HEIGHT * DEFAULT_BLOCK_TIME_IN_SECONDS * 1000;

export const getCoinTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  return network?.bip44?.coinType ?? network?.coinType ?? 60;
};

export const getUrlV1Beta = (isBeta: boolean) => {
  if (isBeta) return 'v1beta';
  return 'v1';
};
export const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

export function formatNeworkTypeToLedgerAppName(network: string, chainId?: string | number): LedgerAppType {
  switch (network) {
    case 'cosmos':
      return 'cosmos';
    case 'evm':
      if (chainId && chainId === TRON_ID) {
        return 'trx';
      }
      return 'eth';
    default:
      return 'cosmos';
  }
}

export const getNetworkTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId === chainId);
  return network?.networkType ?? 'cosmos';
};

export function splitPath(path: string): {
  coinType?: number;
  account: number;
  change: number;
  addressIndex: number;
} {
  const bip44HDPathOrder = ['coinType', 'account', 'change', 'addressIndex'];
  const result = {} as {
    coinType?: number;
    account: number;
    change: number;
    addressIndex: number;
  };
  const components = path.split('/');
  if (path.startsWith('44')) {
    components.shift();
  }
  components.forEach((element, index) => {
    result[bip44HDPathOrder[index]] = element.replace("'", '');
  });

  return result;
}

export function getNetworkTypeByBip44HDPath(path: { coinType?: number; account: number; change: number; addressIndex: number }): LedgerAppType {
  switch (path.coinType) {
    case 118:
      return 'cosmos';
    case 60:
      return 'eth';
    case 195:
      return 'trx';
    default:
      return 'cosmos';
  }
}

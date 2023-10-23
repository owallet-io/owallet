import { ChainInfo, BIP44HDPath } from '@owallet/types';
import bech32, { fromWords } from 'bech32';
import { ETH } from '@hanchon/ethermint-address-converter';
import { TRON_ID } from './constants';
import { EmbedChainInfos } from '../config';
import { Hash } from '@owallet/crypto';
import bs58 from 'bs58';
export type LedgerAppType = 'cosmos' | 'eth' | 'trx';
export const COINTYPE_NETWORK = {
  118: 'Cosmos',
  60: 'Ethereum',
  195: 'Tron'
};

export const getEvmAddress = (base58Address) => {
  return base58Address ? '0x' + Buffer.from(bs58.decode(base58Address).slice(1, -4)).toString('hex') : '-';
};

export const getBase58Address = (address) => {
  if (!address) return null;
  const evmAddress = Buffer.from('41' + address.slice(2), 'hex');
  const hash = Hash.sha256(Hash.sha256(evmAddress));
  const checkSum = Buffer.from(hash.slice(0, 4));
  return bs58.encode(Buffer.concat([evmAddress, checkSum]));
};

export const getAddressFromBech32 = (bech32address) => {
  const address = Buffer.from(fromWords(bech32.decode(bech32address).words));
  return ETH.encoder(address);
};

export const DEFAULT_BLOCK_TIMEOUT_HEIGHT = 90;
export const DEFAULT_BLOCK_TIME_IN_SECONDS = 2;
export const DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS =
  DEFAULT_BLOCK_TIMEOUT_HEIGHT * DEFAULT_BLOCK_TIME_IN_SECONDS * 1000;

export const getCoinTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  return network?.bip44?.coinType ?? network?.coinType ?? 60;
};

export const getChainInfoOrThrow = (chainId: string): ChainInfo => {
  const chainInfo = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  if (!chainInfo) {
    throw new Error(`There is no chain info for ${chainId}`);
  }
  return chainInfo;
};
export const isEthermintLike = (chainInfo: ChainInfo): boolean => {
  return (
    chainInfo?.networkType === 'evm' ||
    chainInfo.bip44.coinType === 60 ||
    !!chainInfo.features?.includes('eth-address-gen') ||
    !!chainInfo.features?.includes('eth-key-sign') ||
    !!chainInfo.features?.includes('isEvm')
  );
};
export const getUrlV1Beta = (isBeta: boolean) => {
  if (isBeta) return 'v1beta1';
  return 'v1';
};
export const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

export function formatNeworkTypeToLedgerAppName(network: string, chainId?: string | number): LedgerAppType {
  switch (network) {
    case 'cosmos':
      if ((chainId as string).startsWith('injective')) {
        return 'eth';
      }
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

export function splitPath(path: string): BIP44HDPath {
  const bip44HDPathOrder = ['coinType', 'account', 'change', 'addressIndex'];
  const result = {} as BIP44HDPath;
  const components = path.split('/');
  if (path.startsWith('44')) {
    components.shift();
  }
  components.forEach((element, index) => {
    result[bip44HDPathOrder[index]] = element.replace("'", '');
  });

  return result;
}

export function getNetworkTypeByBip44HDPath(path: BIP44HDPath): LedgerAppType {
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

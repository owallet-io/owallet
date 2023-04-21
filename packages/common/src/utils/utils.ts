import bech32, { fromWords } from 'bech32';
import { ETH } from '@hanchon/ethermint-address-converter';
import { NetworkType } from '@owallet/types';
import { EmbedChainInfos } from '../config';

export const getAddressFromBech32 = bech32address => {
  const address = Buffer.from(fromWords(bech32.decode(bech32address).words));
  return ETH.encoder(address);
};

export const getNetworkTypeByChainId = (
  chainId: string | number
): NetworkType => {
  const network = EmbedChainInfos.find(nw => nw.chainId == chainId);
  return network?.networkType ?? 'cosmos';
};

export const getCoinTypeByChainId = chainId => {
  const network = EmbedChainInfos.find(nw => nw.chainId == chainId);
  return network?.bip44?.coinType ?? network?.coinType ?? 60;
};

export const bufferToHex = buffer => {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

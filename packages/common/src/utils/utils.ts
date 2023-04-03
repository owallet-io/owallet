import bech32, { fromWords } from 'bech32';
import { ETH } from '@hanchon/ethermint-address-converter';

export const getAddressFromBech32 = bech32address => {
  const address = Buffer.from(fromWords(bech32.decode(bech32address).words));
  return ETH.encoder(address);
};

export const bufferToHex = buffer => {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

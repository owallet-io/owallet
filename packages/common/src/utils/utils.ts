import { Base58 } from '@ethersproject/basex';
import { sha256 } from '@ethersproject/sha2';
import bech32, { fromWords } from 'bech32';
import { ETH } from '@hanchon/ethermint-address-converter';

export const getEvmAddress = (base58Address) =>
  '0x' + Buffer.from(Base58.decode(base58Address)).slice(1, -4).toString('hex');

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

export const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
};

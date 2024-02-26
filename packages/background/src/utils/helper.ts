import { _TypedDataEncoder as TypedDataEncoder } from '@ethersproject/hash';
import { getAddressTypeByAddress, getBaseDerivationPath } from '@owallet/bitcoin';
import { LedgerAppType, getNetworkTypeByChainId, typeBtcLedgerByAddress } from '@owallet/common';
import { AddressBtcType, AddressesLedger, BIP44HDPath, ChainInfoWithoutEndpoints } from '@owallet/types';
import Joi from 'joi';
import { ChainInfoWithEmbed } from 'src/chains';
import * as oasis from '@oasisprotocol/client';

export const EIP712DomainTypeValidator = Joi.array()
  .items(
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid('name').required(),
      type: Joi.string().valid('string').required()
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid('version').required(),
      type: Joi.string().valid('string').required()
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid('chainId').required(),
      type: Joi.string().valid('uint256').required()
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid('verifyingContract').required(),
      // From https://eips.ethereum.org/EIPS/eip-712, (string) may be non-standard?
      // But, ethermint set this type as string.
      type: Joi.string().valid('address', 'string').required()
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid('salt').required(),
      // From https://eips.ethereum.org/EIPS/eip-712, (string) may be non-standard?
      // But, ethermint set this type as string.
      type: Joi.string().valid('bytes32', 'string').required()
    })
  )
  .unique()
  .min(1)
  .custom((value) => {
    // Sort by name
    const domainFieldNames: Array<string> = ['name', 'version', 'chainId', 'verifyingContract', 'salt'];

    return value.sort((a: { name: string }, b: { name: string }) => {
      return domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b.name);
    });
  });
export function ethSignatureToBytes(signature: { v: number | string; r: string; s: string }): Uint8Array {
  // Validate signature.r is hex encoded
  const r = Buffer.from(signature.r, 'hex');
  // Validate signature.s is hex encoded
  const s = Buffer.from(signature.s, 'hex');

  // Must be 32 bytes
  if (r.length !== 32 || s.length !== 32) {
    throw new Error('Unable to process signature: malformed fields');
  }

  const v = typeof signature.v === 'string' ? parseInt(signature.v, 16) : signature.v;

  if (!Number.isInteger(v)) {
    throw new Error('Unable to process signature: malformed fields');
  }

  return Buffer.concat([r, s, Buffer.from([v])]);
}

export const domainHash = (message: {
  types: Record<string, { name: string; type: string }[]>;
  domain: Record<string, any>;
}): string =>
  TypedDataEncoder.hashStruct('EIP712Domain', { EIP712Domain: message.types['EIP712Domain'] }, message.domain);

// Seems that there is no way to set primary type and the first type becomes primary type.
export const messageHash = (message: {
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
}): string =>
  TypedDataEncoder.from(
    (() => {
      const types = { ...message.types };

      delete types['EIP712Domain'];

      const primary = types[message.primaryType];

      if (!primary) {
        throw new Error(`No matched primary type: ${message.primaryType}`);
      }

      delete types[message.primaryType];

      return {
        [message.primaryType]: primary,
        ...types
      };
    })()
  ).hash(message.message);

export const EIP712MessageValidator = Joi.object<{
  types: Record<string, unknown>;
  primaryType: string;
  domain: Record<string, unknown>;
  message: Record<string, unknown>;
}>({
  types: Joi.object({
    EIP712Domain: EIP712DomainTypeValidator.required()
  })
    .unknown(true)
    .required(),
  primaryType: Joi.string().min(1).required(),
  domain: Joi.object().required(),
  message: Joi.object().required()
});
export function stringifyPath(paths: number[]): string {
  let stringPaths = '';
  if (paths.length < 5) {
    return "44'/118'/0'/0/0";
  }
  paths.map((path, index) => {
    if (index < 3) {
      stringPaths += `${path}'/`;
    } else {
      if (index < 4) {
        stringPaths += `${path}/`;
      } else {
        stringPaths += `${path}`;
      }
    }
  });
  return stringPaths;
}

export const handleAddressLedgerByChainId = (
  ledgerAppType: LedgerAppType,
  address: string,
  chainInfo: ChainInfoWithoutEndpoints
): AddressesLedger => {
  if (chainInfo.networkType !== 'bitcoin') {
    return {
      [ledgerAppType]: address
    };
  }
  const addressType = getAddressTypeByAddress(address) as AddressBtcType;
  return {
    [typeBtcLedgerByAddress(chainInfo, addressType)]: address
  };
};

/**
 * Return a nic client for the specified network,
 * or by default, for the currently selected network
 */
//TODO: need handle duplicate from common
export const getOasisNic = (url) => {
  const nic = new oasis.client.NodeInternal(url);
  return nic;
};

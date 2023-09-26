import { getNetworkTypeByChainId, TRON_ID } from '@owallet/common';

export function findLedgerAddressWithChainId(AddressesLedger, chainId) {
  let address;

  if (chainId === TRON_ID) {
    address = AddressesLedger.trx;
  } else {
    const networkType = getNetworkTypeByChainId(chainId);
    if (networkType === 'evm') {
      address = AddressesLedger.eth;
    } else {
      address = AddressesLedger.cosmos;
    }
  }
  return address;
}

export const generateMsgNft = (limit, address, startAfter) => {
  let obj: {
    limit?: number,
    owner: string,
    start_after?: string
  } = {
    owner: '',
  };
  if (limit) obj.limit = limit;
  if (address) obj.owner = address;
  if (startAfter) obj.start_after = startAfter;
  return {
    tokens: {
      ...obj
    }
  }
}

export const generateMsgInfoNft = (tokenId) => {
  return {
    nft_info: {
      token_id: tokenId
    }
  }
}

export const generateMsgAllNft = (tokenId) => {
  return {
    all_nft_info: {
      token_id: tokenId
    }
  }
}

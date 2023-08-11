import Long from 'long';
import { network } from '../config/networks';
import { Address } from '@owallet/crypto';

export const calculateTimeoutTimestamp = (timeout: number): string => {
  return Long.fromNumber(Math.floor(Date.now() / 1000) + timeout)
    .multiply(1000000000)
    .toString();
};

export const getNetworkGasPrice = async (): Promise<number> => {
  try {
    const chainInfosWithoutEndpoints =
      await window.Keplr?.getChainInfosWithoutEndpoints();
    const findToken = chainInfosWithoutEndpoints.find(
      e => e.chainId == network.chainId
    );
    if (findToken) {
      return findToken.feeCurrencies[0].gasPriceStep.average;
    }
  } catch {}
  return 0;
};

export const tronToEthAddress = (base58: string) =>
  Address.getEvmAddress(base58);

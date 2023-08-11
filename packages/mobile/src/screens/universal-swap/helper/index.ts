import Long from 'long';
import { network } from '../config/networks';
import { Address } from '@owallet/crypto';
import { MyBigInt } from '@owallet/common';
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

export const truncDecimals = 6;
export const atomic = 10 ** truncDecimals;

export const tronToEthAddress = (base58: string) =>
  Address.getEvmAddress(base58);

export const ethToTronAddress = (address: string) => {
  return Address.getBase58Address(address);
};

export const validateNumber = (amount: number | string): number => {
  if (typeof amount === 'string') return validateNumber(Number(amount));
  if (Number.isNaN(amount) || !Number.isFinite(amount)) return 0;
  return amount;
};

// decimals always >= 6
export const toAmount = (amount: number | string, decimals = 6): any => {
  const validatedAmount = validateNumber(amount);
  // return (
  //   new MyBigInt(Math.trunc(validatedAmount * atomic)) *
  //   new MyBigInt(10 ** (decimals - truncDecimals))
  // );
};

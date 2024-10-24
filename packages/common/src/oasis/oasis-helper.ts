import { quantity, staking, types, client } from "@oasisprotocol/client";
import * as oasis from "@oasisprotocol/client";
import * as oasisRT from "@oasisprotocol/client-rt";
// eslint-disable-next-line no-restricted-imports
import BigNumber from "bignumber.js";
import { sha512_256 } from "js-sha512";

/** Redux can't serialize bigint fields, so we stringify them, and mark them. */
export type StringifiedBigInt = string & PreserveAliasName;

// eslint-disable-next-line @typescript-eslint/ban-types
type PreserveAliasName = String;

type ParaTimeNetwork = {
  address: string | undefined;
  runtimeId: string | undefined;
};

export enum RuntimeTypes {
  Evm = "evm",
  Oasis = "oasis",
}

export interface OasisBalance {
  available: StringifiedBigInt;
  validator: {
    escrow: StringifiedBigInt;
    escrow_debonding: StringifiedBigInt;
  };
}

export type ParaTimeConfig = {
  mainnet: ParaTimeNetwork;
  testnet: ParaTimeNetwork;
  local: ParaTimeNetwork;
  gasPrice: bigint;
  feeGas: bigint;
  decimals: number;
  displayOrder: number;
  type: RuntimeTypes;
};

// Hover to check if inferred variable type is StringifiedBigInt (not string)
export const testPreserveAliasName = "0" as StringifiedBigInt;

export const uint2hex = (uint: Uint8Array) => Buffer.from(uint).toString("hex");
export const hex2uint = (hex: string) =>
  new Uint8Array(Buffer.from(hex, "hex"));

export const shortPublicKey = async (publicKey: Uint8Array) => {
  return await staking.addressFromPublicKey(publicKey);
};

export const publicKeyToAddress = async (publicKey: Uint8Array) => {
  const data = await staking.addressFromPublicKey(publicKey);
  return staking.addressToBech32(data);
};

export const addressToPublicKey = async (addr: string) => {
  return staking.addressFromBech32(addr);
};

export const uint2bigintString = (uint: Uint8Array): StringifiedBigInt =>
  quantity.toBigInt(uint).toString();
export const stringBigint2uint = (number: StringifiedBigInt) =>
  quantity.fromBigInt(BigInt(number));

export function parseRoseStringToBigNumber(
  value: string,
  decimals = 9
): BigNumber {
  const baseUnitBN = new BigNumber(value).shiftedBy(decimals); // * 10 ** decimals
  if (baseUnitBN.isNaN()) {
    throw new Error(`not a number in parseRoseStringToBigNumber(${value})`);
  }
  if (baseUnitBN.decimalPlaces()! > 0) {
    console.error("lost precision in parseRoseStringToBigNumber(", value);
  }
  return baseUnitBN.decimalPlaces(0);
}

export function parseRoseStringToBaseUnitString(
  value: string
): StringifiedBigInt {
  const baseUnitBN = parseRoseStringToBigNumber(value);
  return BigInt(baseUnitBN.toFixed(0)).toString();
}

function getRoseString(
  roseBN: BigNumber,
  minimumFractionDigits: number,
  maximumFractionDigits: number
) {
  return roseBN.toFormat(
    Math.min(
      Math.max(roseBN.decimalPlaces()!, minimumFractionDigits),
      maximumFractionDigits
    )
  );
}

export function isAmountGreaterThan(amount: string, value: string) {
  return parseRoseStringToBigNumber(amount).isGreaterThan(
    parseRoseStringToBigNumber(value)
  );
}

export function formatBaseUnitsAsRose(
  amount: StringifiedBigInt,
  { minimumFractionDigits = 0, maximumFractionDigits = Infinity } = {}
) {
  const roseBN = new BigNumber(amount).shiftedBy(-9); // / 10 ** 9
  return getRoseString(roseBN, minimumFractionDigits, maximumFractionDigits);
}

export function formatWeiAsWrose(
  amount: StringifiedBigInt,
  { minimumFractionDigits = 0, maximumFractionDigits = Infinity } = {}
) {
  const roseBN = new BigNumber(amount).shiftedBy(-18); // / 10 ** 18
  return getRoseString(roseBN, minimumFractionDigits, maximumFractionDigits);
}

export function parseRpcBalance(account: types.StakingAccount) {
  const zero = stringBigint2uint("0");

  return {
    available: uint2bigintString(account.general?.balance || zero),
    validator: {
      escrow: uint2bigintString(account.escrow?.active?.balance || zero),
      escrow_debonding: uint2bigintString(
        account.escrow?.debonding?.balance || zero
      ),
    },
  };
}

export function formatCommissionPercent(commission: number): string {
  return new BigNumber(commission).times(100).toFormat();
}

export function getFeeAmount(gasPrice: bigint, feeGas: bigint): string {
  // A wild guess: the minimum gas price times the default loose
  // overestimate of the gas.
  return (gasPrice * feeGas).toString();
}

const defaultDepositFeeAmount = "0";
export const getDefaultFeeAmount = (
  isDepositing: boolean,
  paraTimeConfig: ParaTimeConfig
): string => {
  return isDepositing
    ? defaultDepositFeeAmount
    : getFeeAmount(paraTimeConfig.feeGas, paraTimeConfig.gasPrice);
};
export const getOasisNic = (url) => {
  const nic = new client.NodeInternal(url);
  return nic;
};

export const isValidOasisAddress = (addr: string): boolean => {
  try {
    oasis.staking.addressFromBech32(addr);
    return true;
  } catch (e) {
    return false;
  }
};

// TODO: validate checksums with @ethereumjs/util isValidChecksumAddress
export const isValidEthAddress = (hexAddress: string): boolean => {
  return /^0x[0-9a-fA-F]{40}$/.test(hexAddress);
};

/** oasis.address.fromData(...) but without being needlessly asynchronous */
function oasisAddressFromDataSync(
  contextIdentifier: string,
  contextVersion: number,
  data: Uint8Array
): Uint8Array {
  const versionU8 = new Uint8Array([contextVersion]);
  return oasis.misc.concat(
    versionU8,
    new Uint8Array(
      sha512_256.arrayBuffer(
        oasis.misc.concat(
          oasis.misc.fromString(contextIdentifier),
          versionU8,
          data
        )
      )
    ).slice(0, 20)
  );
}

export function getEvmBech32Address(evmAddress: string) {
  const ethAddrU8 = oasis.misc.fromHex(evmAddress.replace("0x", ""));
  const addr = oasisAddressFromDataSync(
    oasisRT.address.V0_SECP256K1ETH_CONTEXT_IDENTIFIER,
    oasisRT.address.V0_SECP256K1ETH_CONTEXT_VERSION,
    ethAddrU8
  );
  return oasis.staking.addressToBech32(addr);
}

export const getOasisAddress = (address: string): string => {
  if (!address) return;
  if (isValidOasisAddress(address)) {
    return address;
  } else if (isValidEthAddress(address)) {
    return getEvmBech32Address(address);
  }
  console.error("Invalid oasis address");
  return;
};

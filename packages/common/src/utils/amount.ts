// decimals always >= 6
const truncDecimals = 6;
const atomic = 10 ** truncDecimals;
export const toAmount = (amount: number, decimals = 6): bigint => {
  const validatedAmount = validateNumber(amount);
  return (
    BigInt(Math.trunc(validatedAmount * atomic)) *
    BigInt(10 ** (decimals - truncDecimals))
  );
};

export const validateNumber = (amount: number | string): number => {
  if (typeof amount === "string") return validateNumber(Number(amount));
  if (Number.isNaN(amount) || !Number.isFinite(amount)) return 0;
  return amount;
};

export const toDecimal = (numerator: bigint, denominator: bigint): number => {
  if (denominator === BigInt(0)) return 0;
  return toDisplay((numerator * BigInt(atomic)) / denominator, truncDecimals);
};

export const toDisplay = (
  amount: string | bigint,
  sourceDecimals = 6,
  desDecimals = 6
): number => {
  if (!amount) return 0;
  // guarding conditions to prevent crashing
  const validatedAmount =
    typeof amount === "string" ? BigInt(amount || "0") : amount;
  const displayDecimals = Math.min(truncDecimals, desDecimals);
  const returnAmount =
    validatedAmount / BigInt(10 ** (sourceDecimals - displayDecimals));
  // save calculation by using cached atomic
  return (
    Number(returnAmount) /
    (displayDecimals === truncDecimals ? atomic : 10 ** displayDecimals)
  );
};

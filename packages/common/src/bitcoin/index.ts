import * as bitcoin from "bitcoinjs-lib";
import accumulative from "coinselect/accumulative";
import { simpleFetch } from "@owallet/simple-fetch";

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4; //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4; // 41
const TX_INPUT_PUBKEYHASH = 107;
const TX_OUTPUT_BASE = 8 + 1; //9
const TX_OUTPUT_PUBKEYHASH = 25;

export const inputBytes = (input) => {
  return (
    TX_INPUT_BASE +
    (input.witnessUtxo?.script
      ? input.witnessUtxo?.script.length
      : TX_INPUT_PUBKEYHASH)
  );
};
export const compileMemo = (memo) => {
  const data = Buffer.from(memo, "utf8"); // converts MEMO to buffer
  return bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, data]); // Compile OP_RETURN script
};

export const estimateFeeByFeeRate = (
  utxos,
  feeRate,
  data
): number | undefined => {
  if (!utxos) return;
  const { recipient, amount, message } = data;
  const compiledMemo = message ? compileMemo(message) : null;

  const targetOutputs = [];
  //1. add output amount and recipient to targets
  targetOutputs.push({
    address: recipient,
    value: amount,
  });
  //2. add output memo to targets (optional)
  if (compiledMemo) {
    targetOutputs.push({ script: compiledMemo, value: 0 });
  }

  const { fee } = accumulative(utxos, targetOutputs, feeRate);
  return fee;
};
// export const calculatorFee = ({
//   utxos = [],
//   transactionFee = 1,
//   message = "",
// }) => {
//   if (message && message.length > 80) {
//     throw new Error("message too long, must not be longer than 80 chars.");
//   }
//   if (utxos.length === 0) return 0;
//   const feeRateWhole = Math.ceil(transactionFee);
//   const compiledMemo = message ? compileMemo(message) : null;
//   return getFeeFromUtxos(utxos, feeRateWhole, compiledMemo);
// };
// export const getFeeFromUtxos = (utxos, feeRate, data) => {
//   if (!feeRate) return 0;
//   const inputSizeBasedOnInputs =
//     utxos.length > 0
//       ? utxos.reduce((a, x) => a + inputBytes(x), 0) + utxos.length // +1 byte for each input signature
//       : 0;
//   let sum =
//     TX_EMPTY_SIZE +
//     inputSizeBasedOnInputs +
//     TX_OUTPUT_BASE +
//     TX_OUTPUT_PUBKEYHASH +
//     TX_OUTPUT_BASE +
//     TX_OUTPUT_PUBKEYHASH;
//
//   if (data) {
//     sum += TX_OUTPUT_BASE + data.length;
//   }
//   return sum * feeRate;
// };

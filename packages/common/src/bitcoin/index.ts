import * as bitcoin from "bitcoinjs-lib";
import accumulative from "coinselect/accumulative";
import { Buffer } from "buffer";
import { UnsignedBtcTransaction } from "@owallet/types";
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

export const signSignatureBtc = (
  keyPair,
  data: Uint8Array,
  inputs,
  outputs
) => {
  const unsignedTx: UnsignedBtcTransaction = JSON.parse(
    Buffer.from(data).toString()
  );
  const { sender, memo } = unsignedTx;
  const psbt = new bitcoin.Psbt(); // Network-specific
  inputs.forEach((utxo) => {
    if (utxo.witnessUtxo) {
      const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
      });
      // If the UTXO is a SegWit output, use witnessUtxo
      psbt.addInput({
        //@ts-ignore
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          ...utxo.witnessUtxo,
          script: p2wpkh.output,
        },
      });
    } else if (utxo.nonWitnessUtxo) {
      // If the UTXO is non-SegWit, use nonWitnessUtxo
      psbt.addInput({
        //@ts-ignore
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(utxo.nonWitnessUtxo, "hex"),
      });
    }
  });
  const compiledMemo = memo ? compileMemo(memo) : null;
  outputs.forEach((output) => {
    if (!output.address) {
      //an empty address means this is the  change ddress
      output.address = sender;
    }
    if (!output.script) {
      psbt.addOutput(output);
    } else {
      //we need to add the compiled memo this way to
      //avoid dust error tx when accumulating memo output with 0 value
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 });
      }
    }
  });
  psbt.signAllInputs(keyPair); // Sign all inputs
  psbt.finalizeAllInputs(); // Finalise inputs

  return psbt.extractTransaction(true).toHex();
};

import Joi from "joi";
export const schemaRequestSignBitcoin = Joi.object({
  memo: Joi.string().empty(""),
  fee: Joi.object({
    gas: Joi.string().required(),
    amount: Joi.array()
      .items(
        Joi.object({
          denom: Joi.string().required(),
          amount: Joi.string().required(),
        })
      )
      .required(),
  }).required(),
  address: Joi.string().required(),
  msgs: Joi.object({
    address: Joi.string().required(),
    changeAddress: Joi.string().required(),
    amount: Joi.number().required(),
    message: Joi.string().empty(""),
    totalFee: Joi.number().required(),
    selectedCrypto: Joi.string().required(),
    confirmedBalance: Joi.number().required(),
    feeRate: Joi.number().required(),
  }).required(),
  confirmedBalance: Joi.number().required(),
  utxos: Joi.array()
    .items(
      Joi.object({
        address: Joi.string().required(),
        path: Joi.string().required(),
        value: Joi.number().required(),
        confirmations: Joi.number().required(),
        blockHeight: Joi.number().required(),
        txid: Joi.string().required(),
        vout: Joi.number().required(),
        tx_hash: Joi.string().required(),
        tx_hash_big_endian: Joi.string().required(),
        tx_output_n: Joi.number().required(),
      })
    )
    .empty(),
  blacklistedUtxos: Joi.array().items(Joi.object()).empty(),
  amount: Joi.number().required(),
  feeRate: Joi.number().required(),
});

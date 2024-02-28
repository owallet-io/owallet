import { getBase58Address } from "@owallet/common";
// import axios from 'axios';
// const TronWeb = require('tronweb');

describe("Test TronWeb", () => {
  // it('test_tronWeb_trx', async () => {
  //   const tronWeb = new TronWeb('https://nile.trongrid.io', 'https://nile.trongrid.io');

  //   // private key for testing purpose
  //   const privateKey = '4975143b17cb704090c925ed228d76b90f4c642bcad616439c7b7daa432d9a3f';

  //   const from = TronWeb.address.fromPrivateKey(privateKey);

  //   const transaction = await tronWeb.transactionBuilder.sendTrx('TE15PBm8MsyS4cHrW7u1VTjbZDx5MXVQfs', 10, from);

  //   TronWeb.utils.crypto.signTransaction(privateKey, transaction);

  //   const signature = TronWeb.utils.crypto.signBytes(privateKey, Buffer.from(transaction.raw_data_hex, 'hex'));

  //   expect(transaction.signature).toEqual([signature]);
  // });

  // it('test_tronWeb_trc20', async () => {
  //   const tronWeb = new TronWeb('https://api.trongrid.io', 'https://api.trongrid.io');

  //   // private key for testing purpose
  //   const privateKey = '4975143b17cb704090c925ed228d76b90f4c642bcad616439c7b7daa432d9a3f';

  //   const from = TronWeb.address.fromPrivateKey(privateKey);

  //   const transaction = (
  //     await tronWeb.transactionBuilder.triggerSmartContract(
  //       'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT contract address
  //       'transfer(address,uint256)',
  //       {
  //         callValue: 0,
  //         userFeePercentage: 100,
  //         shouldPollResponse: false
  //       },
  //       [
  //         { type: 'address', value: 'TE15PBm8MsyS4cHrW7u1VTjbZDx5MXVQfs' },
  //         { type: 'uint256', value: 1e6 }
  //       ],
  //       from
  //     )
  //   ).transaction;

  //   TronWeb.utils.crypto.signTransaction(privateKey, transaction);

  //   const signature = TronWeb.utils.crypto.signBytes(privateKey, Buffer.from(transaction.raw_data_hex, 'hex'));

  //   expect(transaction.signature).toEqual([signature]);
  // });

  it("test_generate_tron_address", async () => {
    const tronAddress = getBase58Address(
      "0x2c3aF9b7c1fe6dC94Fc9BeF92E35B2243d9984a8"
    );
    expect(tronAddress).toEqual("TE15PBm8MsyS4cHrW7u1VTjbZDx5MXVQfs");
  });

  // it('test_get_trc20_tokens', async () => {
  //   const url = `v1/accounts/${'TE15PBm8MsyS4cHrW7u1VTjbZDx5MXVQfs'}`;
  //   const res = await axios.get(url, {
  //     baseURL: 'https://api.trongrid.io'
  //   });

  //   expect(typeof res.data?.data?.[0]?.trc20).toEqual('object');
  // });
});

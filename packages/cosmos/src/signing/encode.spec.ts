import {
  encodeSecp256k1Pubkey,
  encodeSecp256k1Signature,
  serializeSignDoc,
  sortedJsonByKeyStringify,
} from "./encode";

describe("encode", () => {
  const tests: { readonly input: string; readonly output: string }[] = [
    {
      input: `{"cosmos":"foo", "atom":"bar",  "tendermint":"foobar"}`,
      output: `{"atom":"bar","cosmos":"foo","tendermint":"foobar"}`,
    },
    {
      input: `{"consensus_params":{"block_size_params":{"max_bytes":22020096,"max_txs":100000,"max_gas":-1},"tx_size_params":{"max_bytes":10240,"max_gas":-1},"block_gossip_params":{"block_part_size_bytes":65536},"evidence_params":{"max_age":100000}},"validators":[{"pub_key":{"type":"AC26791624DE60","value":"c7UMMAbjFuc5GhGPy0E5q5tefy12p9Tq0imXqdrKXwo="},"power":100,"name":""}],"app_hash":"","genesis_time":"2018-05-11T15:52:25.424795506Z","chain_id":"test-chain-Q6VeoW","app_state":{"accounts":[{"address":"718C9C23F98C9642569742ADDD9F9AB9743FBD5D","coins":[{"denom":"Token","amount":1000},{"denom":"stake","amount":50}]}],"stake":{"pool":{"total_supply":50,"bonded_shares":"0","unbonded_shares":"0","bonded_pool":0,"unbonded_pool":0,"inflation_last_time":0,"inflation":"7/100"},"params":{"inflation_rate_change":"13/100","inflation_max":"1/5","inflation_min":"7/100","goal_bonded":"67/100","max_validators":100,"bond_denom":"stake"},"candidates":null,"bonds":null}}}`,
      output: `{"app_hash":"","app_state":{"accounts":[{"address":"718C9C23F98C9642569742ADDD9F9AB9743FBD5D","coins":[{"amount":1000,"denom":"Token"},{"amount":50,"denom":"stake"}]}],"stake":{"bonds":null,"candidates":null,"params":{"bond_denom":"stake","goal_bonded":"67/100","inflation_max":"1/5","inflation_min":"7/100","inflation_rate_change":"13/100","max_validators":100},"pool":{"bonded_pool":0,"bonded_shares":"0","inflation":"7/100","inflation_last_time":0,"total_supply":50,"unbonded_pool":0,"unbonded_shares":"0"}}},"chain_id":"test-chain-Q6VeoW","consensus_params":{"block_gossip_params":{"block_part_size_bytes":65536},"block_size_params":{"max_bytes":22020096,"max_gas":-1,"max_txs":100000},"evidence_params":{"max_age":100000},"tx_size_params":{"max_bytes":10240,"max_gas":-1}},"genesis_time":"2018-05-11T15:52:25.424795506Z","validators":[{"name":"","power":100,"pub_key":{"type":"AC26791624DE60","value":"c7UMMAbjFuc5GhGPy0E5q5tefy12p9Tq0imXqdrKXwo="}}]}`,
    },
    {
      input: `{"chain_id":"test-chain-1","sequence":1,"fee_bytes":{"amount":[{"amount":5,"denom":"photon"}],"gas":10000},"msg_bytes":{"inputs":[{"address":"696E707574","coins":[{"amount":10,"denom":"atom"}]}],"outputs":[{"address":"6F7574707574","coins":[{"amount":10,"denom":"atom"}]}]},"alt_bytes":null}`,
      output: `{"alt_bytes":null,"chain_id":"test-chain-1","fee_bytes":{"amount":[{"amount":5,"denom":"photon"}],"gas":10000},"msg_bytes":{"inputs":[{"address":"696E707574","coins":[{"amount":10,"denom":"atom"}]}],"outputs":[{"address":"6F7574707574","coins":[{"amount":10,"denom":"atom"}]}]},"sequence":1}`,
    },
    {
      input: `{"type":"cosmos-sdk/MsgGrant","value":{"granter":"secret145s07us09dr5hs9t5t4z5x57427fe34jk0t8jd","grant":{"authorization":{"type":"cosmos-sdk/StakeAuthorization","value":{"Validators":{"type":"cosmos-sdk/StakeAuthorization/AllowList","value":{"allow_list":{"address":["secretvaloper1x76f2c2cuwa4e3lttjgqeqva0725ftmqvgvfnv"]}}},"authorization_type":1}},"expiration":"2024-10-19T18:00:00Z"},"grantee":"secret195qz2llswagsypzgh79r6yhmps8cpqmcl5pt8q"}}`,
      output: `{"type":"cosmos-sdk/MsgGrant","value":{"grant":{"authorization":{"type":"cosmos-sdk/StakeAuthorization","value":{"Validators":{"type":"cosmos-sdk/StakeAuthorization/AllowList","value":{"allow_list":{"address":["secretvaloper1x76f2c2cuwa4e3lttjgqeqva0725ftmqvgvfnv"]}}},"authorization_type":1}},"expiration":"2024-10-19T18:00:00Z"},"grantee":"secret195qz2llswagsypzgh79r6yhmps8cpqmcl5pt8q","granter":"secret145s07us09dr5hs9t5t4z5x57427fe34jk0t8jd"}}`,
    },
  ];
  test.each(tests)("Test sorting", async ({ input, output }) => {
    expect(sortedJsonByKeyStringify(JSON.parse(input))).toBe(output);
  });

  it("encodeSecp256k1Pubkey", () => {
    const mockPubKey = new Uint8Array([
      2, 59, 29, 39, 166, 47, 187, 235, 126, 180, 207, 194, 215, 129, 131, 199,
      191, 29, 95, 73, 53, 59, 110, 89, 145, 226, 147, 129, 32, 119, 195, 210,
      149,
    ]);
    const output = {
      type: "tendermint/PubKeySecp256k1",
      value: "AjsdJ6Yvu+t+tM/C14GDx78dX0k1O25ZkeKTgSB3w9KV",
    };
    const rs = encodeSecp256k1Pubkey(mockPubKey);
    expect(rs).toEqual(output);
  });
  it("encodeSecp256k1Signature", () => {
    const mockPubKey = new Uint8Array([
      2, 59, 29, 39, 166, 47, 187, 235, 126, 180, 207, 194, 215, 129, 131, 199,
      191, 29, 95, 73, 53, 59, 110, 89, 145, 226, 147, 129, 32, 119, 195, 210,
      149,
    ]);
    const mockSignature = new Uint8Array([
      15, 87, 121, 209, 52, 40, 88, 235, 85, 160, 107, 2, 2, 125, 251, 16, 215,
      51, 94, 25, 159, 80, 47, 126, 14, 249, 150, 211, 80, 18, 85, 130, 173,
      122, 34, 222, 222, 244, 195, 190, 60, 254, 195, 205, 159, 177, 12, 88, 91,
      126, 133, 18, 91, 205, 182, 160, 183, 243, 240, 212, 84, 175, 195, 7,
    ]);
    const output = {
      pub_key: {
        type: "tendermint/PubKeySecp256k1",
        value: "AjsdJ6Yvu+t+tM/C14GDx78dX0k1O25ZkeKTgSB3w9KV",
      },
      signature:
        "D1d50TQoWOtVoGsCAn37ENczXhmfUC9+DvmW01ASVYKteiLe3vTDvjz+w82fsQxYW36FElvNtqC38/DUVK/DBw==",
    };
    const rs = encodeSecp256k1Signature(mockPubKey, mockSignature);
    expect(rs).toEqual(output);
  });
  it("serializeSignDoc", () => {
    const mockStd = {
      account_number: "13298",
      chain_id: "Oraichain",
      fee: {
        gas: "200000",
        amount: [
          {
            amount: "600",
            denom: "orai",
          },
        ],
      },
      memo: "",
      msgs: [
        {
          type: "cosmos-sdk/MsgSend",
          value: {
            amount: [
              {
                amount: "100",
                denom: "orai",
              },
            ],
            from_address: "orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz",
            to_address: "orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz",
          },
        },
      ],
      sequence: "2819",
    };
    const rs = serializeSignDoc(mockStd);
    expect(Buffer.from(new Uint8Array(rs)).toString("base64")).toBe(
      "eyJhY2NvdW50X251bWJlciI6IjEzMjk4IiwiY2hhaW5faWQiOiJPcmFpY2hhaW4iLCJmZWUiOnsiYW1vdW50IjpbeyJhbW91bnQiOiI2MDAiLCJkZW5vbSI6Im9yYWkifV0sImdhcyI6IjIwMDAwMCJ9LCJtZW1vIjoiIiwibXNncyI6W3sidHlwZSI6ImNvc21vcy1zZGsvTXNnU2VuZCIsInZhbHVlIjp7ImFtb3VudCI6W3siYW1vdW50IjoiMTAwIiwiZGVub20iOiJvcmFpIn1dLCJmcm9tX2FkZHJlc3MiOiJvcmFpMTJ6eXU4dzkzaDBxMmxjbnQ1MGczZm4wdzN5cW5oeTRmdmF3YXF6IiwidG9fYWRkcmVzcyI6Im9yYWkxMnp5dTh3OTNoMHEybGNudDUwZzNmbjB3M3lxbmh5NGZ2YXdhcXoifX1dLCJzZXF1ZW5jZSI6IjI4MTkifQ=="
    );
  });
});

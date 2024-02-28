import { getChainInfoOrThrow } from "@owallet/common";
import {
  AccountSetBase,
  AminoMsgsOrWithProtoMsgs,
  WalletStatus,
} from "../base";
import { BaseAccount, TendermintTxTracer } from "@owallet/cosmos";
import { StdFee } from "@cosmjs/launchpad";
import { AminoSignResponse } from "@cosmjs/amino";
import { OWalletSignOptions } from "@owallet/types";
import { Bech32Address } from "@owallet/cosmos";

const mockTx = new Uint8Array([1, 2, 3, 4, 5]);

const aminoSignResponse: AminoSignResponse = {
  signed: {
    chain_id: "Oraichain-testnet",
    account_number: "123456",
    sequence: "1",
    fee: {
      amount: [
        {
          denom: "ATOM",
          amount: "1000",
        },
      ],
      gas: "200000",
    },
    msgs: [
      {
        type: "msg",
        value: { key: "value" },
      },
    ],
    memo: "Example memo",
  },
  signature: {
    pub_key: {
      type: "ed25519",
      value: "ABCDEF123456",
    },
    signature: "ABCDEF123456",
  },
  // ... other properties ...
};

const mockChain: any = {
  getChain: jest.fn(),
};

describe("AccountSetBase", () => {
  const accountSetBase = new AccountSetBase(
    null,
    mockChain,
    "Oraichain-testnet",
    null,
    {
      refetching: false,
      suggestChain: false,
      autoInit: false,
      getOWallet: jest.fn(),
    } as any
  );
  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  const mockOwalletCosmos = {
    signAmino: {
      bind: jest.fn().mockReturnValue(
        jest.fn().mockResolvedValue({
          signed: {
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
          },
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "Ah/mfS6755nv0aaYWryXhfLOWbvx/nN+e+TVsm+DflU4",
            },
            signature:
              "4qkv+X+rRQrI9KNV4nJ2oc06w5r078IcYczYpx1aIXRI1I/ylxHVRtZOj3THngaDtu6EfFedBeGMO4YFl5Rdpw==",
          },
        })
      ),
    },
    experimentalSignEIP712CosmosTx_v0: {
      bind: jest.fn().mockResolvedValue(
        jest.fn().mockResolvedValue({
          signed: {
            account_number: "91669",
            chain_id: "injective-1",
            fee: {
              gas: "200000",
              amount: [
                {
                  amount: "1000000000000000",
                  denom: "inj",
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
                      amount: "100000000000000",
                      denom: "inj",
                    },
                  ],
                  from_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                  to_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                },
              },
            ],
            sequence: "67",
          },
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "AhNz4jfCoBheEF3oBGlj+XXaBu7feDwIVZ2k13G7YuNV",
            },
            signature:
              "OMww7mX81bmlgVHwL3jQmIZE+pzTzOADeG7t0N/xGdtkTklBfK31aciW0tBVNMaGcQundPA64RKC7eqwG9+u6A==",
          },
        })
      ),
    },
  };
  const mockOwalletEvmos = {
    signAmino: {
      bind: jest.fn().mockReturnValue(
        jest.fn().mockResolvedValue({
          signed: {
            account_number: "91669",
            chain_id: "injective-1",
            fee: {
              gas: "200000",
              amount: [
                {
                  amount: "1000000000000000",
                  denom: "inj",
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
                      amount: "100000000000000",
                      denom: "inj",
                    },
                  ],
                  from_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                  to_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                },
              },
            ],
            sequence: "67",
          },
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "AhNz4jfCoBheEF3oBGlj+XXaBu7feDwIVZ2k13G7YuNV",
            },
            signature:
              "OMww7mX81bmlgVHwL3jQmIZE+pzTzOADeG7t0N/xGdtkTklBfK31aciW0tBVNMaGcQundPA64RKC7eqwG9+u6A==",
          },
        })
      ),
    },
    experimentalSignEIP712CosmosTx_v0: {
      bind: jest.fn().mockResolvedValue(
        jest.fn().mockResolvedValue({
          signed: {
            account_number: "91669",
            chain_id: "injective-1",
            fee: {
              gas: "200000",
              amount: [
                {
                  amount: "1000000000000000",
                  denom: "inj",
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
                      amount: "100000000000000",
                      denom: "inj",
                    },
                  ],
                  from_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                  to_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                },
              },
            ],
            sequence: "67",
          },
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "AhNz4jfCoBheEF3oBGlj+XXaBu7feDwIVZ2k13G7YuNV",
            },
            signature:
              "OMww7mX81bmlgVHwL3jQmIZE+pzTzOADeG7t0N/xGdtkTklBfK31aciW0tBVNMaGcQundPA64RKC7eqwG9+u6A==",
          },
        })
      ),
    },
  };
  describe("processSignedTxCosmos", () => {
    afterEach(() => {
      accountSetBase["_walletStatus"] = WalletStatus.Loaded;
      jest.clearAllMocks();
    });
    it.each([
      {
        msgs: {
          aminoMsgs: [
            {
              type: "cosmos-sdk/MsgSend",
              value: {
                from_address: "orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz",
                to_address: "orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz",
                amount: [
                  {
                    denom: "orai",
                    amount: "100",
                  },
                ],
              },
            },
          ],
          protoMsgs: [
            {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: new Uint8Array([
                10, 43, 111, 114, 97, 105, 49, 50, 122, 121, 117, 56, 119, 57,
                51, 104, 48, 113, 50, 108, 99, 110, 116, 53, 48, 103, 51, 102,
                110, 48, 119, 51, 121, 113, 110, 104, 121, 52, 102, 118, 97,
                119, 97, 113, 122, 18, 43, 111, 114, 97, 105, 49, 50, 122, 121,
                117, 56, 119, 57, 51, 104, 48, 113, 50, 108, 99, 110, 116, 53,
                48, 103, 51, 102, 110, 48, 119, 51, 121, 113, 110, 104, 121, 52,
                102, 118, 97, 119, 97, 113, 122, 26, 11, 10, 4, 111, 114, 97,
                105, 18, 3, 49, 48, 48,
              ]),
            },
          ],
          rlpTypes: {
            MsgValue: [
              {
                name: "from_address",
                type: "string",
              },
              {
                name: "to_address",
                type: "string",
              },
              {
                name: "amount",
                type: "TypeAmount[]",
              },
            ],
            TypeAmount: [
              {
                name: "denom",
                type: "string",
              },
              {
                name: "amount",
                type: "string",
              },
            ],
          },
        },
        fee: {
          amount: [
            {
              denom: "orai",
              amount: "600",
            },
          ],
          gas: "200000",
        },
        memo: "",
        owallet: mockOwalletCosmos,
        signOptions: {
          preferNoSetFee: true,
          preferNoSetMemo: true,
          networkType: "cosmos" as any,
          chainId: "Oraichain",
        },
        infoAcc: {
          getAccountNumber: 13298,
          getSequence: 2819,
        },
        expected:
          "CooBCocBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmcKK29yYWkxMnp5dTh3OTNoMHEybGNudDUwZzNmbjB3M3lxbmh5NGZ2YXdhcXoSK29yYWkxMnp5dTh3OTNoMHEybGNudDUwZzNmbjB3M3lxbmh5NGZ2YXdhcXoaCwoEb3JhaRIDMTAwEmYKUQpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQIf5n0uu+eZ79GmmFq8l4Xyzlm78f5zfnvk1bJvg35VOBIECgIIfxiDFhIRCgsKBG9yYWkSAzYwMBDAmgwaQOKpL/l/q0UKyPSjVeJydqHNOsOa9O/CHGHM2KcdWiF0SNSP8pcR1UbWTo90x54Gg7buhHxXnQXhjDuGBZeUXac=",
      },
      {
        msgs: {
          aminoMsgs: [
            {
              type: "cosmos-sdk/MsgSend",
              value: {
                from_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                to_address: "inj172zx58jd47h28rqkvznpsfmavas9h544t024u3",
                amount: [
                  {
                    denom: "inj",
                    amount: "100000000000000",
                  },
                ],
              },
            },
          ],
          protoMsgs: [
            {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: new Uint8Array([
                10, 42, 105, 110, 106, 49, 55, 50, 122, 120, 53, 56, 106, 100,
                52, 55, 104, 50, 56, 114, 113, 107, 118, 122, 110, 112, 115,
                102, 109, 97, 118, 97, 115, 57, 104, 53, 52, 52, 116, 48, 50,
                52, 117, 51, 18, 42, 105, 110, 106, 49, 55, 50, 122, 120, 53,
                56, 106, 100, 52, 55, 104, 50, 56, 114, 113, 107, 118, 122, 110,
                112, 115, 102, 109, 97, 118, 97, 115, 57, 104, 53, 52, 52, 116,
                48, 50, 52, 117, 51, 26, 22, 10, 3, 105, 110, 106, 18, 15, 49,
                48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48,
              ]),
            },
          ],
          rlpTypes: {
            MsgValue: [
              {
                name: "from_address",
                type: "string",
              },
              {
                name: "to_address",
                type: "string",
              },
              {
                name: "amount",
                type: "TypeAmount[]",
              },
            ],
            TypeAmount: [
              {
                name: "denom",
                type: "string",
              },
              {
                name: "amount",
                type: "string",
              },
            ],
          },
        },
        fee: {
          amount: [
            {
              denom: "inj",
              amount: "1000000000000000",
            },
          ],
          gas: "200000",
        },
        owallet: mockOwalletEvmos,
        memo: "",
        signOptions: {
          preferNoSetFee: true,
          preferNoSetMemo: true,
          networkType: "cosmos",
          chainId: "injective-1",
        },
        infoAcc: {
          getAccountNumber: 91669,
          getSequence: 67,
        },
        expected:
          "CpMBCpABChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEnAKKmluajE3Mnp4NThqZDQ3aDI4cnFrdnpucHNmbWF2YXM5aDU0NHQwMjR1MxIqaW5qMTcyeng1OGpkNDdoMjhycWt2em5wc2ZtYXZhczloNTQ0dDAyNHUzGhYKA2luahIPMTAwMDAwMDAwMDAwMDAwEnoKWQpPCigvZXRoZXJtaW50LmNyeXB0by52MS5ldGhzZWNwMjU2azEuUHViS2V5EiMKIQITc+I3wqAYXhBd6ARpY/l12gbu33g8CFWdpNdxu2LjVRIECgIIfxhDEh0KFwoDaW5qEhAxMDAwMDAwMDAwMDAwMDAwEMCaDBpAOMww7mX81bmlgVHwL3jQmIZE+pzTzOADeG7t0N/xGdtkTklBfK31aciW0tBVNMaGcQundPA64RKC7eqwG9+u6A==",
      },
    ])(
      "unit test for broadcastMsgs with chainId $signOptions.chainId",
      async ({ msgs, fee, memo, owallet, signOptions, expected, infoAcc }) => {
        const mockChainInfoOraichain: any = getChainInfoOrThrow(
          signOptions.chainId
        );
        jest
          .spyOn(accountSetBase["chainGetter"], "getChain")
          .mockReturnValue(mockChainInfoOraichain);
        jest.spyOn(BaseAccount, "fetchFromRest").mockResolvedValue({
          getAccountNumber: jest.fn().mockReturnValue(infoAcc.getAccountNumber),
          getSequence: jest.fn().mockReturnValue(infoAcc.getSequence),
        } as any);
        const rs = await accountSetBase["processSignedTxCosmos"](
          msgs,
          fee,
          memo,
          owallet,
          signOptions
        );
        expect(Buffer.from(rs, "base64").toString("base64")).toBe(expected);
      }
    );
  });

  // describe('sendMsgs', () => {
  //   const testCases = [
  //     [
  //       'unknown',
  //       [
  //         { type: 'msg1', value: {} },
  //         { type: 'msg2', value: {} }
  //       ] as AminoMsgsOrWithProtoMsgs,
  //       '',
  //       { amount: [{ denom: 'uatom', amount: '100' }], gas: '100' },
  //       null,
  //       null,
  //       null
  //     ],
  //     [
  //       'send',
  //       async (): Promise<AminoMsgsOrWithProtoMsgs> => {
  //         return {
  //           aminoMsgs: [{ type: 'msg1', value: {} }],
  //           protoMsgs: [
  //             /* protobuf messages */
  //           ]
  //         };
  //       },
  //       'Test memo',
  //       { amount: [{ denom: 'uatom', amount: '100' }], gas: '100' },
  //       {
  //         preferNoSetFee: true,
  //         preferNoSetMemo: true,
  //         disableBalanceCheck: true,
  //         networkType: 'cosmos',
  //         chainId: 'testnet'
  //       },
  //       {
  //         onBroadcasted: (txHash) => {
  //           expect(txHash).toEqual(mockTx);
  //         },
  //         onFulfill: (tx) => {
  //           expect(tx).toEqual(mockTx);
  //         }
  //       },
  //       {
  //         type: 'customType',
  //         contract_addr: 'customContractAddr',
  //         token_id: 'customTokenId',
  //         recipient: 'customRecipient',
  //         amount: 'customAmount',
  //         to: 'customTo'
  //       }
  //     ],
  //     [
  //       'delegate',
  //       async (): Promise<AminoMsgsOrWithProtoMsgs> => {
  //         throw new Error('test into catch');
  //       },
  //       'Test memo',
  //       { amount: [{ denom: 'uatom', amount: '100' }], gas: '100' },
  //       {
  //         preferNoSetFee: true,
  //         preferNoSetMemo: true,
  //         disableBalanceCheck: true,
  //         networkType: 'cosmos',
  //         chainId: 'testnet'
  //       },
  //       {
  //         onBroadcastFailed: (e) => {
  //         }
  //       },

  //       {
  //         type: 'customType',
  //         contract_addr: 'customContractAddr',
  //         token_id: 'customTokenId',
  //         recipient: 'customRecipient',
  //         amount: 'customAmount',
  //         to: 'customTo'
  //       }
  //     ]
  //   ];
  //   it.each(testCases)(
  //     'should send msgs with type %s',
  //     async (
  //       type: string | 'unknown',
  //       msgs: any,
  //       memo: string = '',
  //       fee: StdFee,
  //       signOptions?: OWalletSignOptions,
  //       onTxEvents?:
  //         | ((tx: any) => void)
  //         | {
  //             onBroadcastFailed?: (e?: Error) => void;
  //             onBroadcasted?: (txHash: Uint8Array) => void;
  //             onFulfill?: (tx: any) => void;
  //           },
  //       extraOptions?: {
  //         type: string;
  //         contract_addr: string;
  //         token_id?: string;
  //         recipient?: string;
  //         amount?: string;
  //         to?: string;
  //       }
  //     ) => {
  //       const spyOnRunInAction = jest.spyOn(require('mobx'), 'runInAction');
  //       const spyBroadcastMsgs = jest.spyOn(accountSetBase as any, 'broadcastMsgs').mockResolvedValue({
  //         txHash: mockTx
  //       });
  //       const mockKeyStore: any = {
  //         bip44: { coinType: 118, account: 0, change: 0, addressIndex: 0 }
  //       };
  //       const spyGetChain = jest.spyOn(accountSetBase['chainGetter'], 'getChain').mockReturnValue(mockKeyStore);
  //       const spyTraceTx = jest.spyOn(TendermintTxTracer.prototype, 'traceTx').mockResolvedValue(mockTx);
  //       const spyClose = jest.spyOn(TendermintTxTracer.prototype, 'close').mockReturnValue(true as any);
  //       const balMock = {
  //         currency: {
  //           coinMinimalDenom: 'uatom'
  //         },
  //         fetch: jest.fn()
  //       };

  //       const queryBalancesMock = {
  //         getQueryBech32Address: jest.fn().mockReturnValue({
  //           balances: [balMock]
  //         })
  //       };
  //       const spyQueries = jest.spyOn(accountSetBase as any, 'queries', 'get').mockReturnValue({
  //         queryBalances: queryBalancesMock
  //       });

  //       if (type == 'delegate') {
  //         await expect(() => accountSetBase.sendMsgs(type, msgs, memo, fee, signOptions, onTxEvents)).rejects.toThrow('test into catch');
  //         return;
  //       }
  //       await accountSetBase.sendMsgs(type, msgs, memo, fee, signOptions, onTxEvents);

  //       expect(spyOnRunInAction).toHaveBeenCalled();
  //       expect(spyBroadcastMsgs).toHaveBeenCalled();
  //       expect(spyBroadcastMsgs).toHaveBeenCalledTimes(1);
  //       expect(spyBroadcastMsgs).toHaveBeenCalledWith(typeof msgs === 'function' ? await msgs() : msgs, fee, memo, signOptions, accountSetBase.broadcastMode);
  //       expect(spyGetChain).toHaveBeenCalled();
  //       expect(spyGetChain).toHaveBeenCalledWith(accountSetBase['chainId']);
  //       expect(spyTraceTx).toHaveBeenCalledWith(mockTx);
  //       expect(spyClose).toHaveBeenCalled();
  //       expect(spyQueries).toHaveBeenCalled();
  //     }
  //   );
  // });
});

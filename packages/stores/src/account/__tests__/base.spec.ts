import {
  AccountSetBase,
  AminoMsgsOrWithProtoMsgs,
  WalletStatus
} from '../base';
import { BaseAccount, TendermintTxTracer } from '@owallet/cosmos';
import { StdFee } from '@cosmjs/launchpad';
import { AminoSignResponse } from '@cosmjs/amino';
import { OWalletSignOptions } from '@owallet/types';

const mockTx = new Uint8Array([1, 2, 3, 4, 5]);

const aminoSignResponse: AminoSignResponse = {
  signed: {
    chain_id: 'Oraichain-testnet',
    account_number: '123456',
    sequence: '1',
    fee: {
      amount: [
        {
          denom: 'ATOM',
          amount: '1000'
        }
      ],
      gas: '200000'
    },
    msgs: [
      {
        type: 'msg',
        value: { key: 'value' }
      }
    ],
    memo: 'Example memo'
  },
  signature: {
    pub_key: {
      type: 'ed25519',
      value: 'ABCDEF123456'
    },
    signature: 'ABCDEF123456'
  }
  // ... other properties ...
};

const mockChain: any = {
  getChain: jest.fn()
};

describe('AccountSetBase', () => {
  const accountSetBase = new AccountSetBase(
    null,
    mockChain,
    'Oraichain-testnet',
    null,
    {
      refetching: false,
      suggestChain: false,
      autoInit: false,
      getOWallet: jest.fn()
    } as any
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('broadcastMsgs', () => {
    beforeEach(() => {
      accountSetBase['_walletStatus'] = WalletStatus.Loaded;
    });
    it.each([
      ['walletStatus', null, [], null, null, null, null],
      [
        'hasNoLegacyStdFeature',
        null,
        [
          { type: 'msg1', value: 'Value 1' },
          { type: 'msg2', value: 'Value 2' }
        ],
        null,
        null,
        null,
        null
      ],
      [
        'main',
        mockTx,
        aminoSignResponse.signed.msgs,
        aminoSignResponse.signed.fee,
        aminoSignResponse.signed.memo,
        null,
        'async'
      ],
      [
        'main2',
        mockTx,
        {
          aminoMsgs: aminoSignResponse.signed.msgs,

          protoMsgs: [
            { type_url: 'example.com', value: new Uint8Array([1, 2, 3, 4, 5]) },
            { type_url: 'another.com', value: new Uint8Array([6, 7, 8]) }
          ]
        } as any,
        aminoSignResponse.signed.fee,
        aminoSignResponse.signed.memo,
        null,
        'async'
      ]
    ])(
      'unit test for broadcastMsgs method with case %s',
      async (
        caseTest: 'walletStatus' | 'hasNoLegacyStdFeature' | 'main1' | 'main2',
        expectValue: any,
        msgs: any,
        fee: any,
        memo: string,
        signOptions?: any,
        mode?: 'block' | 'async' | 'sync'
      ) => {
        if (caseTest == 'walletStatus') {
          [
            [
              WalletStatus.NotExist,
              `Wallet is not loaded: ${WalletStatus.NotExist}`
            ],
            // [
            //   WalletStatus.Rejected,
            //   `Wallet is not loaded: ${WalletStatus.Rejected}`
            // ],
            // [
            //   WalletStatus.NotInit,
            //   `Wallet is not loaded: ${WalletStatus.NotInit}`
            // ],
            // [
            //   WalletStatus.Loading,
            //   `Wallet is not loaded: ${WalletStatus.Loading}`
            // ],
            // [WalletStatus.Loaded, 'There is no msg to send']
          ].forEach(async (eleWalletStatus) => {
            // const walletStatus = eleWalletStatus[0] as any;
            // const expectThrow = eleWalletStatus[1];
            // accountSetBase['_walletStatus'] = walletStatus;
            // await expect(() =>
            //   accountSetBase['broadcastMsgs'](
            //     msgs as any,
            //     fee,
            //     memo,
            //     signOptions,
            //     mode
            //   )
            // ).rejects.toThrow(expectThrow);
          });
          return;
        } else if (caseTest == 'hasNoLegacyStdFeature') {
          const spyHasNoLegacyStdFeature = jest
            .spyOn(accountSetBase as any, 'hasNoLegacyStdFeature')
            .mockReturnValue(true);

          // await expect(() =>
          //   accountSetBase['broadcastMsgs'](
          //     msgs as any,
          //     fee,
          //     memo,
          //     signOptions,
          //     mode
          //   )
          // ).rejects.toThrow(
          //   `Chain can't send legecy stdTx. But, proto any type msgs are not provided`
          // );
          // expect(spyHasNoLegacyStdFeature).toHaveBeenCalled();
          return;
        }

        const spyGetOwallet = jest
          .spyOn(accountSetBase, 'getOWallet')
          .mockResolvedValue({
            signAmino: jest.fn().mockResolvedValue(aminoSignResponse),
            sendTx: jest.fn().mockResolvedValue(mockTx)
          } as any);

        const spyHasNoLegacyStdFeature = jest
          .spyOn(accountSetBase as any, 'hasNoLegacyStdFeature')
          .mockReturnValue(false);
        const mockKeyStore: any = {
          bip44: { coinType: 118, account: 0, change: 0, addressIndex: 0 }
        };
        const spyGetChain = jest
          .spyOn(accountSetBase['chainGetter'], 'getChain')
          .mockReturnValue(mockKeyStore);
        const spyBaseAccountFetchFromRest = jest
          .spyOn(BaseAccount, 'fetchFromRest')
          .mockResolvedValue({
            getAccountNumber: jest.fn().mockReturnValue(123456),
            getSequence: jest.fn().mockReturnValue(1)
          } as any);
        const spyMakeSignDoc = jest
          .spyOn(require('@cosmjs/launchpad'), 'makeSignDoc')
          .mockReturnValue(aminoSignResponse.signed);
        const spySignAmino = jest.spyOn(
          (await accountSetBase.getOWallet()) as any,
          'signAmino'
        );
        const spySendTx = jest.spyOn(
          (await accountSetBase.getOWallet()) as any,
          'sendTx'
        );

        const spyGetAccountNumber = jest.spyOn(
          (await BaseAccount.fetchFromRest(
            accountSetBase['instance'],
            accountSetBase['bech32Address'],
            true
          )) as any,
          'getAccountNumber'
        );
        const spyGetSequence = jest.spyOn(
          (await BaseAccount.fetchFromRest(
            accountSetBase['instance'],
            accountSetBase['bech32Address'],
            true
          )) as any,
          'getSequence'
        );
        const rs = await accountSetBase['broadcastMsgs'](
          msgs as any,
          fee,
          memo,
          signOptions,
          mode
        );
        expect(spyHasNoLegacyStdFeature).toHaveBeenCalled();
        expect(spyGetOwallet).toHaveBeenCalled();
        expect(spySignAmino).toHaveBeenCalledTimes(1);
        expect(spyBaseAccountFetchFromRest).toHaveBeenCalled();
        expect(spyGetChain).toHaveBeenCalled();
        expect(spyGetAccountNumber).toHaveBeenCalledTimes(1);
        expect(spyGetSequence).toHaveBeenCalledTimes(1);
        expect(spySendTx).toHaveBeenCalled();
        expect(spyGetChain).toHaveBeenCalledWith(
          aminoSignResponse.signed.chain_id
        );
        expect(spyBaseAccountFetchFromRest).toHaveBeenCalledTimes(3);
        expect(spyMakeSignDoc).toHaveBeenCalled();
        expect(spyMakeSignDoc).toHaveBeenCalledWith(
          aminoSignResponse.signed.msgs,
          aminoSignResponse.signed.fee,
          aminoSignResponse.signed.chain_id,
          aminoSignResponse.signed.memo,
          aminoSignResponse.signed.account_number,
          aminoSignResponse.signed.sequence
        );
        expect(spySignAmino).toHaveBeenCalledWith(
          accountSetBase['chainId'],
          accountSetBase['_bech32Address'],
          aminoSignResponse.signed,
          null
        );
        expect(spySendTx).toHaveBeenCalledWith(
          accountSetBase['chainId'],
          expect.any(Uint8Array),
          'async'
        );
        expect(rs.txHash).toEqual(expectValue);
      }
    );
  });

  describe('sendMsgs', () => {
    const testCases = [
      [
        'unknown',
        [
          { type: 'msg1', value: {} },
          { type: 'msg2', value: {} }
        ] as AminoMsgsOrWithProtoMsgs,
        '',
        { amount: [{ denom: 'uatom', amount: '100' }], gas: '100' },
        null,
        null,
        null
      ],
      [
        'send',
        async (): Promise<AminoMsgsOrWithProtoMsgs> => {
          return {
            aminoMsgs: [{ type: 'msg1', value: {} }],
            protoMsgs: [
              /* protobuf messages */
            ]
          };
        },
        'Test memo',
        { amount: [{ denom: 'uatom', amount: '100' }], gas: '100' },
        {
          preferNoSetFee: true,
          preferNoSetMemo: true,
          disableBalanceCheck: true,
          networkType: 'cosmos',
          chainId: 'testnet'
        },
        {
          onBroadcasted: (txHash) => {
            expect(txHash).toEqual(mockTx);
          },
          onFulfill: (tx) => {
            expect(tx).toEqual(mockTx);
          }
        },
        {
          type: 'customType',
          contract_addr: 'customContractAddr',
          token_id: 'customTokenId',
          recipient: 'customRecipient',
          amount: 'customAmount',
          to: 'customTo'
        }
      ],
      [
        'delegate',
        async (): Promise<AminoMsgsOrWithProtoMsgs> => {
          throw new Error('test into catch');
        },
        'Test memo',
        { amount: [{ denom: 'uatom', amount: '100' }], gas: '100' },
        {
          preferNoSetFee: true,
          preferNoSetMemo: true,
          disableBalanceCheck: true,
          networkType: 'cosmos',
          chainId: 'testnet'
        },
        {
          onBroadcastFailed: (e) => {
            console.log(
              '🚀 ~ file: base.spec.ts:338 ~ describe ~ err from onBroadcastFailed function:'
            );
          }
        },

        {
          type: 'customType',
          contract_addr: 'customContractAddr',
          token_id: 'customTokenId',
          recipient: 'customRecipient',
          amount: 'customAmount',
          to: 'customTo'
        }
      ]
    ];
    it.each(testCases)(
      'should send msgs with type %s',
      async (
        type: string | 'unknown',
        msgs: any,
        memo: string = '',
        fee: StdFee,
        signOptions?: OWalletSignOptions,
        onTxEvents?:
          | ((tx: any) => void)
          | {
              onBroadcastFailed?: (e?: Error) => void;
              onBroadcasted?: (txHash: Uint8Array) => void;
              onFulfill?: (tx: any) => void;
            },
        extraOptions?: {
          type: string;
          contract_addr: string;
          token_id?: string;
          recipient?: string;
          amount?: string;
          to?: string;
        }
      ) => {
        const spyOnRunInAction = jest.spyOn(require('mobx'), 'runInAction');
        const spyBroadcastMsgs = jest
          .spyOn(accountSetBase as any, 'broadcastMsgs')
          .mockResolvedValue({
            txHash: mockTx
          });
        const mockKeyStore: any = {
          bip44: { coinType: 118, account: 0, change: 0, addressIndex: 0 }
        };
        const spyGetChain = jest
          .spyOn(accountSetBase['chainGetter'], 'getChain')
          .mockReturnValue(mockKeyStore);
        const spyTraceTx = jest
          .spyOn(TendermintTxTracer.prototype, 'traceTx')
          .mockResolvedValue(mockTx);
        const spyClose = jest
          .spyOn(TendermintTxTracer.prototype, 'close')
          .mockReturnValue(true as any);
        const balMock = {
          currency: {
            coinMinimalDenom: 'uatom'
          },
          fetch: jest.fn()
        };

        const queryBalancesMock = {
          getQueryBech32Address: jest.fn().mockReturnValue({
            balances: [balMock]
          })
        };
        const spyQueries = jest
          .spyOn(accountSetBase as any, 'queries', 'get')
          .mockReturnValue({
            queryBalances: queryBalancesMock
          });

        if (type == 'delegate') {
          await expect(() =>
            accountSetBase.sendMsgs(
              type,
              msgs,
              memo,
              fee,
              signOptions,
              onTxEvents
            )
          ).rejects.toThrow('test into catch');
          return;
        }
        await accountSetBase.sendMsgs(
          type,
          msgs,
          memo,
          fee,
          signOptions,
          onTxEvents
        );

        expect(spyOnRunInAction).toHaveBeenCalled();
        expect(spyBroadcastMsgs).toHaveBeenCalled();
        expect(spyBroadcastMsgs).toHaveBeenCalledTimes(1);
        expect(spyBroadcastMsgs).toHaveBeenCalledWith(
          typeof msgs === 'function' ? await msgs() : msgs,
          fee,
          memo,
          signOptions,
          accountSetBase.broadcastMode
        );
        expect(spyGetChain).toHaveBeenCalled();
        expect(spyGetChain).toHaveBeenCalledWith(accountSetBase['chainId']);
        expect(spyTraceTx).toHaveBeenCalledWith(mockTx);
        expect(spyClose).toHaveBeenCalled();
        expect(spyQueries).toHaveBeenCalled();
      }
    );
  });
});

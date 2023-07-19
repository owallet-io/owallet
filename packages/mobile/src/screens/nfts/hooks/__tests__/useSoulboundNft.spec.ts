// import { renderHook, act } from '@testing-library/react-hooks';
// import { useSoulbound } from '../useSoulboundNft';
// import React from 'react';
// import { CWStargate } from '@src/common/cw-stargate';
// describe('useSoulbound', () => {
//   it('should empty getNftFromContract', async () => {
//     const account = jest.fn().mockImplementation(() => ({
//       bech32Address: 'orai1ntdmh848kktumfw5tx8l2semwkxa5s7e5rs03x',
//       evmosHexAddress: 'testAddressEvm'
//     }));
//     const rpc = 'https://rpc.orai.io';
//     const chainId = 'Oraichain';
//     // jest.spyOn();
//     const setState = jest.fn();
//     const useStateMock: any = (initState) => [initState, setState];
//     const useStateSpy = jest
//       .spyOn(React, 'useState')
//       .mockImplementationOnce(useStateMock);
//     const useRefSpy = jest
//       .spyOn(React, 'useRef')
//       .mockReturnValueOnce({ current: [] });
//     const useEffectSpy = jest
//       .spyOn(React, 'useEffect')
//       .mockImplementation((f) => f());
//     const mockClient: any = {
//       queryContractSmart: jest
//         .fn()
//         .mockResolvedValueOnce({
//           tokens: ['1']
//         })
//         .mockResolvedValueOnce({
//           token_uri:
//             'https://bafybeiebijqycbza6wqkdtvxluix6w3idifdgfhwebdawuufu5mympfhhe.ipfs.nftstorage.link/',
//           extension: {
//             image: null,
//             image_data: null,
//             external_url: null,
//             description: null,
//             name: 'Orchai NFT AIfinity',
//             attributes: null,
//             background_color: null,
//             animation_url: null,
//             youtube_url: null,
//             dyn_attrs: [['scAtom_pending_reward', '543483']]
//           }
//         })
//     };
//     const CwStargateInitSpy = jest
//       .spyOn(CWStargate, 'init')
//       .mockResolvedValue(mockClient);
//     const getTokensInfoFromContract = jest.spyOn(
//       useSoulbound as any,
//       'getTokensInfoFromContract'
//     );
//     const funcBSpy = jest.fn();
//     funcBSpy.mockResolvedValue()
//     const { result } = renderHook(() => useSoulbound(chainId, account, rpc));
//     console.log('result: ', result.all);

//     expect(useRefSpy).toHaveBeenCalledTimes(1);
//     expect(useEffectSpy).toHaveBeenCalledTimes(1);
//     expect(useStateSpy).toHaveBeenCalledTimes(1);
//     expect(useStateMock()[1]).toHaveBeenCalledTimes(1);
//     expect(useStateMock()[1]).toHaveBeenCalledWith({
//       soulboundNft: [],
//       loading: true
//     });
//     expect(getTokensInfoFromContract).toHaveBeenCalled();
//     // const [state,setStateData] = useStateMock(null);
//     // expect(setStateData).toHaveBeenCalledTimes(1);
//     //   try {
//     //   const { result } = renderHook(() => useSoulbound(chainId, account, rpc));
//     //   console.log('result: ', result.error);
//     // } catch (error) {
//     //   console.log('kaka: ', error);
//     // }
//     // act(() => {
//     //   result.current.getNftFromContract();
//     // });
//     // expect(result.current.tokenIds).toBe(null);
//     // expect(result.error).toEqual(Error("It's over 9000!"))
//     // console.log('result: ', result.current.getNftFromContract);
//   });
// });

import { getTokens, getTokensInfoFromContract } from '../useSoulboundNft';
const mockContractAddress =
  'orai15g3lhqtsdhsjr2qzhtrc06jfshyuaegmf75rn5jf3ql3u8lc4l2sje4xpu';
const mockAccountAddress = 'orai1ntdmh848kktumfw5tx8l2semwkxa5s7e5rs03x';
const mockToken = ['1', '2'];
const mockClient = {
  queryContractSmart: jest.fn().mockResolvedValue({ tokens: mockToken })
};
describe('getTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tokens and return them', async () => {
    const result = await getTokens(mockClient, mockAccountAddress);

    expect(result).toEqual(mockToken);

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      mockContractAddress,
      {
        tokens: {
          limit: 10,
          owner: mockAccountAddress,
          start_after: '0'
        }
      }
    );
  });

  it('should throw an error if tokens are empty', async () => {
    mockClient.queryContractSmart.mockResolvedValueOnce({ tokens: [] });

    await expect(
      getTokens(mockClient, mockAccountAddress)
    ).rejects.toThrowError('NFT is empty');

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      mockContractAddress,
      {
        tokens: {
          limit: 10,
          owner: mockAccountAddress,
          start_after: '0'
        }
      }
    );
  });
});
describe('getTokensInfoFromContract', () => {
  const mockTokenInfo = {
    token_uri:
      'https://bafybeiebijqycbza6wqkdtvxluix6w3idifdgfhwebdawuufu5mympfhhe.ipfs.nftstorage.link/',
    extension: {
      image: null,
      image_data: null,
      external_url: null,
      description: null,
      name: 'Orchai NFT AIfinity',
      attributes: null,
      background_color: null,
      animation_url: null,
      youtube_url: null,
      dyn_attrs: [['scAtom_pending_reward', '543483']]
    }
  };
  const mockClient = {
    queryContractSmart: jest.fn().mockResolvedValue(mockTokenInfo)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tokens info and return them', async () => {
    mockClient.queryContractSmart.mockResolvedValueOnce({ tokens: mockToken });
    const result = await getTokensInfoFromContract(
      mockClient,
      mockAccountAddress
    );

    expect(result).toEqual([mockTokenInfo, mockTokenInfo]);

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      mockContractAddress,
      {
        tokens: {
          limit: 10,
          owner: mockAccountAddress,
          start_after: '0'
        }
      }
    );

    expect(mockClient.queryContractSmart).toHaveBeenCalledTimes(3);
    expect(mockClient.queryContractSmart).toHaveBeenNthCalledWith(
      2,
      mockContractAddress,
      {
        nft_info: {
          token_id: '1'
        }
      }
    );
    expect(mockClient.queryContractSmart).toHaveBeenNthCalledWith(
      3,
      mockContractAddress,
      {
        nft_info: {
          token_id: '2'
        }
      }
    );
  });

  it('should throw an error if tokens info are empty', async () => {
    mockClient.queryContractSmart.mockResolvedValueOnce({ tokens: [] });

    await expect(
      getTokensInfoFromContract(mockClient, mockAccountAddress)
    ).rejects.toThrowError('NFT is empty');

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      mockContractAddress,
      {
        tokens: {
          limit: 10,
          owner: mockAccountAddress,
          start_after: '0'
        }
      }
    );

    expect(mockClient.queryContractSmart).toHaveBeenCalledTimes(1);
  });
});

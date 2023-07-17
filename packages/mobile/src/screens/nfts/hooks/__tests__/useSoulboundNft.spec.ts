import { renderHook, act } from '@testing-library/react-hooks';

// Mock the dependencies
// jest.mock('react', () => ({
//   ...jest.requireActual('react'),
//   useState: jest.fn(),
//   useEffect: jest.fn(),
//   useRef: jest.fn(),
// }));
// jest.mock('@cosmjs/cosmwasm-stargate', () => ({
//   ...jest.requireActual('@cosmjs/cosmwasm-stargate'),
//   SigningCosmWasmClient: jest.fn(),
// }));
import { useSoulbound } from '../useSoulboundNft';
import React from 'react';
import { RootStore } from '@src/stores/root';
describe('useSoulbound', () => {
  beforeEach(() => {
    // Reset the mock state for each test
    jest.resetAllMocks();
  });

  test('should fetch token information and update state', async () => {
    // Mock the dependencies
    // const setState = jest.fn();
    // const useStateMock = jest
    //   .fn()
    //   .mockReturnValueOnce([
    //     {
    //       soulboundNft: [],
    //       loading: true,
    //     },
    //     setState,
    //   ])
    //   .mockReturnValueOnce([]);

    // const useRefMock = jest.fn().mockReturnValue([]);

    // const useEffectMock = jest.fn((effect, deps) => {
    //   if (deps.every((d) => d !== undefined)) {
    //     act(effect); // Trigger the effect immediately
    //   }
    // });

    // Set up the mocked dependencies
    // jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    // jest.spyOn(React, 'useEffect').mockImplementation(useEffectMock);
    // jest.spyOn(React, 'useRef').mockImplementation(useRefMock);

    // Mock the necessary values
    const chainId = 'Oraichain';
    const account = new RootStore().accountStore;
    const rpc = 'https://rpc.orai.io';

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useSoulbound(chainId, account, rpc)
    );
    console.log('result: ', result.current);

    // Assert initial state
    // expect(result.current.tokenIds).toEqual(undefined);
    // expect(result.current.soulboundNft).toEqual([]);
    // expect(result.current.isLoading).toBe(true);

    // Wait for the effect to complete
    await waitForNextUpdate();
    console.log('result: ', result.current);
    // Assert updated state
    // expect(setState).toHaveBeenCalledTimes(3);
    // expect(setState).toHaveBeenNthCalledWith(1, {
    //   soulboundNft: [],
    //   loading: true
    // });
    // expect(setState).toHaveBeenNthCalledWith(2, {
    //   soulboundNft: [],
    //   loading: false
    // });
    // expect(setState).toHaveBeenNthCalledWith(3, {
    //   soulboundNft: expect.any(Array),
    //   loading: false
    // });

    // // Assert tokenIds are updated
    // expect(result.current.tokenIds).toEqual(expect.any(Array));

    // // Assert soulboundNft is updated
    // expect(result.current.soulboundNft).toEqual(expect.any(Array));

    // // Assert isLoading is updated
    // expect(result.current.isLoading).toBe(false);
  });

  //   test('should handle errors and update state', async () => {
  //     // Mock the dependencies
  //     const setState = jest.fn();
  //     const useStateMock = jest
  //       .fn()
  //       .mockReturnValueOnce([
  //         {
  //           soulboundNft: [],
  //           loading: true,
  //         },
  //         setState,
  //       ])
  //       .mockReturnValueOnce([]);

  //     const useRefMock = jest.fn().mockReturnValue([]);

  //     const useEffectMock = jest.fn((effect, deps) => {
  //       if (deps.every((d) => d !== undefined)) {
  //         act(effect); // Trigger the effect immediately
  //       }
  //     });

  //     // Set up the mocked dependencies
  //     jest.spyOn(React, 'useState').mockImplementation(useStateMock);
  //     jest.spyOn(React, 'useEffect').mockImplementation(useEffectMock);
  //     jest.spyOn(React, 'useRef').mockImplementation(useRefMock);

  //     // Mock the necessary values
  //     const chainId = 'chainId';
  //     const account = {
  //       bech32Address: 'accountAddress',
  //       evmosHexAddress: 'accountHexAddress',
  //       getOWallet: jest.fn().mockResolvedValue(null), // Simulate error
  //     };
  //     const rpc = 'rpcEndpoint';

  //     // Render the hook
  //     const { result, waitForNextUpdate } = renderHook(() =>
  //       useSoulbound(chainId, account, rpc)
  //     );

  //     // Wait for the effect to complete
  //     await waitForNextUpdate();

  //     // Assert updated state
  //     expect(setState).toHaveBeenCalledTimes(2);
  //     expect(setState).toHaveBeenNthCalledWith(1, {
  //       soulboundNft: [],
  //       loading: true,
  //     });
  //     expect(setState).toHaveBeenNthCalledWith(2, {
  //       soulboundNft: [],
  //       loading: false,
  //     });

  //     // Assert tokenIds are updated
  //     expect(result.current.tokenIds).toEqual([]);

  //     // Assert soulboundNft is updated
  //     expect(result.current.soulboundNft).toEqual([]);

  //     // Assert isLoading is updated
  //     expect(result.current.isLoading).toBe(false);
  //   });
});

import { EmbedChainInfos } from "@owallet/common";
jest.mock("../service", () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual<typeof import("../service")>("../service"),
  };
});
import * as bgTxService from "../service";
import { BackgroundTxService } from "../service";

import { Bech32Address, TendermintTxTracer } from "@owallet/cosmos";
import { mockChainIdEth, mockKeyCosmos } from "../../keyring/__mocks__/keyring";
import { PubKeySecp256k1 } from "@owallet/crypto";
const mockTx = "250001000192CD0000002F6D6E742F72";

const mockChainInfo = EmbedChainInfos[0];
const mockInfoEthChain = {
  rest: "https://rpc.ankr.com/eth",
  chainId: "0x01",
  chainName: "Ethereum",
  bip44: {
    coinType: 60,
  },
  coinType: 60,
  stakeCurrency: {
    coinDenom: "ETH",
    coinMinimalDenom: "eth",
    coinDecimals: 18,
    coinGeckoId: "ethereum",
    coinImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    gasPriceStep: {
      low: 10000000000,
      average: 25000000000,
      high: 40000000000,
    },
  },
  bech32Config: Bech32Address.defaultBech32Config("evmos"),
  networkType: "evm",
  currencies: [
    {
      coinDenom: "ETH",
      coinMinimalDenom: "eth",
      coinDecimals: 18,
      coinGeckoId: "ethereum",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    },
    {
      coinDenom: "ORAI",
      coinMinimalDenom:
        "erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5:Oraichain Token",
      contractAddress: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
      coinDecimals: 18,
      coinGeckoId: "oraichain-token",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
    },
  ],
  get feeCurrencies() {
    return [this.stakeCurrency];
  },

  features: ["ibc-go", "stargate", "isEvm"],
  txExplorer: {
    name: "Etherscan",
    txUrl: "https://etherscan.io/tx/{txHash}",
    accountUrl: "https://etherscan.io/address/{address}",
  },
};
const expectTx = Buffer.from(mockTx, "hex");
describe("service", () => {
  let backgroundTxService: BackgroundTxService;
  beforeEach(() => {
    jest.resetAllMocks();
    backgroundTxService = new BackgroundTxService(null, null, null, null);
  });
  const paramsCaseSendTx = [
    [
      "isProtoTx",
      expectTx,
      "testnet",
      Buffer.from(mockTx),
      "async",
      {
        data: {
          tx_response: {
            code: 0,
            txhash: mockTx,
            raw_log: "",
          },
        },
      },
      {
        param1: "/cosmos/tx/v1beta1/txs",
        param2: {
          mode: "BROADCAST_MODE_ASYNC",
          tx_bytes: "MjUwMDAxMDAwMTkyQ0QwMDAwMDAyRjZENkU3NDJGNzI=",
        },
      },
    ],
    [
      "NotIsProtoTx",
      expectTx,
      "testnet",
      mockTx,
      "async",
      {
        data: {
          code: 0,
          txhash: mockTx,
        },
      },
      {
        param1: "/txs",
        param2: {
          mode: "async",
          tx: mockTx,
        },
      },
    ],
    [
      `throw_tx_response`,
      "err_raw_log",
      "testnet",
      mockTx,
      "async",
      {
        data: {
          code: 1,
          raw_log: "err_raw_log",
        },
      },
      {
        param1: "/txs",
        param2: {
          mode: "async",
          tx: mockTx,
        },
      },
    ],
  ];

  it.each(paramsCaseSendTx)(
    "sendTx with case %s",
    async (
      caseTest,
      expectResult,
      chainId: any,
      tx: unknown,
      mode: any,
      txResponse: any,
      paramsPost: any
    ) => {
      Object.defineProperty(backgroundTxService, "chainsService", {
        value: { getChainInfo: jest.fn().mockResolvedValue(mockChainInfo) },
      });
      Object.defineProperty(backgroundTxService, "notification", {
        value: { create: jest.fn() },
      });
      const spyPostAxios = jest
        .spyOn(require("axios"), "create")
        .mockReturnValue({
          post: jest.fn().mockResolvedValue(txResponse),
        });
      const spyProcessTxError = jest
        .spyOn(BackgroundTxService as any, "processTxErrorNotification")
        .mockReturnValue(true);
      if (caseTest == "throw_tx_response") {
        await expect(() =>
          backgroundTxService.sendTx(chainId, tx, mode)
        ).rejects.toThrow("err");
        expect(spyProcessTxError).toHaveBeenCalled();
        return;
      }
      const spyTraceTx = jest
        .spyOn(TendermintTxTracer.prototype, "traceTx")
        .mockResolvedValue(mockTx);
      const spyClose = jest
        .spyOn(TendermintTxTracer.prototype, "close")
        .mockReturnValue(true as any);

      const spyGetChainInfo = jest
        .spyOn(backgroundTxService["chainsService"], "getChainInfo")
        .mockResolvedValue(mockChainInfo as any);
      const spyProcessTxResult = jest
        .spyOn(BackgroundTxService as any, "processTxResultNotification")
        .mockReturnValue(true);
      const rs = await backgroundTxService.sendTx(chainId, tx, mode);
      expect(rs).toEqual(expectResult);
      //   console.log('rs: ', backgroundTxService.sendTx.prototype.params);
      expect(spyGetChainInfo).toHaveBeenCalled();
      expect(spyGetChainInfo).toHaveBeenCalledWith(chainId);
      expect(backgroundTxService["notification"].create).toHaveBeenCalled();
      expect(backgroundTxService["notification"].create).toHaveBeenCalledWith({
        iconRelativeUrl: "assets/orai_wallet_logo.png",
        title: "Tx is pending...",
        message: "Wait a second",
      });
      expect(spyPostAxios).toHaveBeenCalled();
      expect(spyPostAxios.mock.results[0].value.post).toHaveBeenCalled();
      expect(spyPostAxios.mock.results[0].value.post).toHaveBeenCalledWith(
        paramsPost.param1,
        paramsPost.param2
      );
      expect(spyTraceTx).toHaveBeenCalled();
      expect(spyTraceTx).toHaveBeenCalledWith(expectResult);
      expect(spyClose).toHaveBeenCalled();
      expect(spyProcessTxResult).toHaveBeenCalled();
      expect(spyProcessTxResult).toHaveBeenCalledWith(
        backgroundTxService["notification"],
        mockTx
      );
    }
  );

  describe("request", () => {
    const caseTest = [
      [
        "eth_accounts",
        mockChainIdEth,
        [],
        {
          type: "ledger",
        },
        ["0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe"],
      ],
      [
        "eth_requestAccounts",
        mockChainIdEth,
        ["60"],
        {
          type: "mnemonic",
        },
        ["0x2a77016e89454aa2b15ae84757e32b75549af840"],
      ],
      [
        "wallet_switchEthereumChain",
        mockChainIdEth,
        [{ chainId: mockChainIdEth }],
        {
          type: null,
        },
        "0x01",
      ],
      [
        "default",
        mockChainIdEth,
        [{ chainId: mockChainIdEth }],
        {
          type: null,
        },
        "result",
      ],
    ] as any;
    it.each(caseTest)(
      "test for request method with %s",
      async (
        method: string,
        chainId: string,
        params: any[],
        option: any,
        result: any
      ) => {
        (backgroundTxService["chainsService"] as any) = {
          getChainInfo: jest.fn().mockResolvedValue(mockInfoEthChain),
        };
        const mockAddressEth = "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe";
        const pubKey = new PubKeySecp256k1(mockKeyCosmos.publicKeyHex);
        (backgroundTxService["keyRingService"] as any) = {
          getKey: jest.fn().mockResolvedValue({
            algo: "secp256k1",
            pubKey: pubKey.toBytes(),
            address: pubKey.getAddress(),
            isNanoLedger: true,
          }),
          getKeyRingType: jest.fn().mockResolvedValue(option.type),
          getKeyRingLedgerAddresses: jest.fn().mockResolvedValue({
            eth: mockAddressEth,
          }),
        };

        if (method == "eth_accounts" || method == "eth_requestAccounts") {
          const spyGetChainInfo = jest.spyOn(
            backgroundTxService["chainsService"],
            "getChainInfo"
          );
          const spyGetKey = jest.spyOn(
            backgroundTxService["keyRingService"],
            "getKey"
          );
          const spyGetKeyRingType = jest.spyOn(
            backgroundTxService["keyRingService"],
            "getKeyRingType"
          );
          let spyGetKeyRingLedgerAddresses;
          const rs = await backgroundTxService["request"](
            chainId,
            method,
            params
          );
          if (option.type == "ledger") {
            spyGetKeyRingLedgerAddresses = jest.spyOn(
              backgroundTxService["keyRingService"],
              "getKeyRingLedgerAddresses"
            );
          }
          expect(rs).toEqual(result);
          expect(spyGetChainInfo).toHaveBeenCalledTimes(1);
          expect(spyGetChainInfo).toHaveBeenCalledWith(chainId);
          if (option.type == "ledger") {
            expect(spyGetKeyRingLedgerAddresses).toHaveBeenCalledTimes(1);
          }
          expect(spyGetKey).toHaveBeenCalledTimes(1);
          expect(spyGetKey).toHaveBeenCalledWith(
            method == "eth_accounts" ? chainId : parseInt(params[0])
          );
          expect(spyGetKeyRingType).toHaveBeenCalledTimes(1);
        } else if (method == "wallet_switchEthereumChain") {
          const spyParseChainId = jest.spyOn(
            backgroundTxService as any,
            "parseChainId"
          );
          const spyGetChainInfo = jest.spyOn(
            backgroundTxService["chainsService"],
            "getChainInfo"
          );

          const rs = await backgroundTxService["request"](
            chainId,
            method,
            params
          );
          expect(rs).toEqual(result);
          expect(spyParseChainId).toHaveBeenCalledTimes(1);
          expect(spyParseChainId).toHaveBeenCalledWith(params[0]);
          expect(spyGetChainInfo).toHaveBeenCalledTimes(1);
          expect(spyGetChainInfo).toHaveBeenCalledWith(chainId, "evm");
        } else {
          const spyGetChainInfo = jest.spyOn(
            backgroundTxService["chainsService"],
            "getChainInfo"
          );
          const spyPostAxios = jest
            .spyOn(require("axios"), "create")
            .mockReturnValue({
              post: jest.fn().mockResolvedValue({
                data: {
                  result: true,
                },
              }),
            });
          const rs = await backgroundTxService["request"](
            chainId,
            method,
            params
          );
          expect(rs).toEqual(true);
          expect(spyGetChainInfo).toHaveBeenCalledTimes(1);
          expect(spyGetChainInfo).toHaveBeenCalledWith(chainId);
        }
      }
    );
  });
});

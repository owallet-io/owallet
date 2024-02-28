import { LedgerInternal } from "../index";
// class MockCosmosApp {
jest.mock("@ledgerhq/hw-app-cosmos");
jest.mock("@ledgerhq/hw-app-eth");
jest.mock("@ledgerhq/hw-app-trx");
import { OWalletError } from "@owallet/router";
import CosmosApp from "@ledgerhq/hw-app-cosmos";
import EthApp from "@ledgerhq/hw-app-eth";
import TrxApp from "@ledgerhq/hw-app-trx";
import { stringifyPath } from "../../utils/helper";

// const ledgerInternalMock =
//   jest.createMockFromModule<LedgerInternal>('./ledger-internal');
describe("LedgerInternal", () => {
  let ledgerInternal = new LedgerInternal(null, null);
  afterEach(() => {
    jest.resetAllMocks();

    ledgerInternal = new LedgerInternal(null, null);
  });

  describe("get version", () => {
    const mockCase = [
      [
        "result_version_1",
        {
          test_mode: false,
          version: "1.0.0",
          device_locked: false,
          major: 1,
        },
      ],
      [
        "result_version_2",
        {
          test_mode: true,
          version: "1.0.0",
          device_locked: false,
          major: 1,
        },
      ],
      [
        "result_version_3",
        {
          test_mode: false,
          version: "1.0.0",
          device_locked: true,
          major: 1,
        },
      ],
      [
        "result_version_4",
        {
          test_mode: true,
          version: "1.0.0",
          device_locked: true,
          major: 1,
        },
      ],
      ["err", null],
    ];
    it.each(mockCase)(
      "test case get version with data mock %s",
      async (caseTest: string, expectResult: any) => {
        if (caseTest == "err") {
          await expect(ledgerInternal.getVersion()).rejects.toThrowError(
            "Cosmos App not initialized"
          );
          return;
        }
        (ledgerInternal["ledgerApp"] as any) = {
          getAppConfiguration: jest.fn().mockResolvedValue({
            version: expectResult.version,
            device_locked: expectResult.device_locked,
            major: expectResult.major,
            test_mode: expectResult.test_mode,
          }),
        };
        const rs = await ledgerInternal.getVersion();

        expect(rs.deviceLocked).toBe(expectResult.device_locked);
        expect(rs.major).toBe(expectResult.major);
        expect(rs.version).toBe(expectResult.version);
        expect(rs.testMode).toBe(expectResult.test_mode);
      }
    );
  });
  describe("getPublicKey", () => {
    // afterEach(() => {
    //   jest.resetAllMocks();
    // });
    const mockPathNumber = [44, 118, 0, 0, 0];
    it.each([["cosmos"], ["eth"], ["trx"]])("test err %s", async (type) => {
      (ledgerInternal["type"] as any) = type;
      await expect(ledgerInternal.getPublicKey(mockPathNumber)).rejects.toThrow(
        `${ledgerInternal["LedgerAppTypeDesc"]} not initialized`
      );
    });
    it.each([
      [
        {
          publicKey: "A1TFLB1j5R6xDWpaUrWnjYcKLTZUjwa53o1C+Q9djjkQ",
          address: "cosmos1t68n2ezn5zt8frhjg0yv8ls0jv62xkcg7v8rs0",
        },
        mockPathNumber,
        CosmosApp,
        {
          publicKey:
            "0354c52c1d63e51eb10d6a5a52b5a78d870a2d36548f06b9de8d42f90f5d8e3910",
          address: "cosmos1t68n2ezn5zt8frhjg0yv8ls0jv62xkcg7v8rs0",
        },
      ],
      [
        {
          publicKey:
            "BPIbKy/sdYZwwpBuaFr6a97Eo2VaK81fEsq/Dr+8yD1E66IdG6hOUgzdFj1RCh4n+PgDwK2UHHtQqRvV4RVW7a8=",
          address: "0x1ABC7154748D1CE5144478CDEB574AE244B939B5",
        },
        mockPathNumber,
        EthApp,
        {
          publicKey:
            "04f21b2b2fec758670c2906e685afa6bdec4a3655a2bcd5f12cabf0ebfbcc83d44eba21d1ba84e520cdd163d510a1e27f8f803c0ad941c7b50a91bd5e11556edaf",
          address: "0x1ABC7154748D1CE5144478CDEB574AE244B939B5",
        },
      ],
      [
        {
          publicKey: "A6GiCxN7eDSlX2A9Py090kbt/5Tfx+IMOa03x0I/K2bR",
          address: "TQytohYEbXZFJnSAXkEoCRdHDpM2Kp3KAW",
        },
        mockPathNumber,
        TrxApp,
        {
          publicKey:
            "03a1a20b137b7834a55f603d3f2d3dd246edff94dfc7e20c39ad37c7423f2b66d1",
          address: "TQytohYEbXZFJnSAXkEoCRdHDpM2Kp3KAW",
        },
      ],
    ])(
      "test getPublicKey %s",
      async (
        expectResult: {
          publicKey: any;
          address: string;
        },
        path: number[],
        ledgerApp: CosmosApp | TrxApp | EthApp,
        getAddress
      ) => {
        (ledgerInternal["ledgerApp"] as any) = new ledgerApp(null);
        const spyMethodSign = jest
          .spyOn(ledgerInternal["ledgerApp"], "getAddress")
          .mockResolvedValue({
            publicKey: getAddress.publicKey,
            address: getAddress.address,
          });

        const rs = (await ledgerInternal.getPublicKey(path)) as {
          publicKey: any;
          address: string;
        };

        expect(Buffer.from(rs.publicKey).toString("base64")).toBe(
          expectResult.publicKey
        );
        expect(rs.address).toBe(expectResult.address);
      }
    );
  });

  describe("sign", () => {
    it.each([["cosmos"], ["eth"], ["trx"]])("test err %s", async (type) => {
      (ledgerInternal["type"] as any) = type;
      const mockPathNumber = [44, 118, 0, 0, 0];
      await expect(
        ledgerInternal.sign(mockPathNumber, "message sign")
      ).rejects.toThrow(
        `${ledgerInternal["LedgerAppTypeDesc"]} not initialized`
      );
    });
    const mockMessage =
      "3045022100e3cb8c2abc8b1973c79ebd19a9bba6a4f04efbcefde0f1561a3fe85184aef2b9022008320e35f2d274fbf1bc48a9344412b589396ea86ce0e0b4dcc904650c51c320";
    it.each([
      [
        "case1",
        "e3cb8c2abc8b1973c79ebd19a9bba6a4f04efbcefde0f1561a3fe85184aef2b908320e35f2d274fbf1bc48a9344412b589396ea86ce0e0b4dcc904650c51c320",
        [44, 118, 0, 0, 0],
        mockMessage,
        CosmosApp,
        "sign",
      ],
      [
        "case2",
        "3045022100e3cb8c2abc8b1973c79ebd19a9bba6a4f04efbcefde0f1561a3fe85184aef2b9022008320e35f2d274fbf1bc48a9344412b589396ea86ce0e0b4dcc904650c51c320",
        [44, 118, 0, 0, 0],
        mockMessage,
        EthApp,
        "signTransaction",
      ],
      [
        "case3",
        "3045022100e3cb8c2abc8b1973c79ebd19a9bba6a4f04efbcefde0f1561a3fe85184aef2b9022008320e35f2d274fbf1bc48a9344412b589396ea86ce0e0b4dcc904650c51c320",
        [44, 118, 0, 0, 0],
        mockMessage,
        TrxApp,
        "signTransactionHash",
      ],
    ])(
      "test case sign %s",
      async (
        caseTest: string,
        expectResult: any,
        path: number[],
        message: any,
        ledgerApp: CosmosApp | TrxApp | EthApp,
        methodSign: string
      ) => {
        (ledgerInternal["ledgerApp"] as any) = new ledgerApp(null);
        let spyMethodSign;
        if (ledgerApp == CosmosApp) {
          spyMethodSign = jest
            .spyOn(ledgerInternal["ledgerApp"], methodSign)
            .mockResolvedValue({
              signature: new Uint8Array(Buffer.from(message, "hex")),
            });
        } else {
          spyMethodSign = jest
            .spyOn(ledgerInternal["ledgerApp"], methodSign)
            .mockResolvedValue(new Uint8Array(Buffer.from(message, "hex")));
        }

        const rs = await ledgerInternal.sign(path, message);
        expect(Buffer.from(rs).toString("hex")).toEqual(expectResult);
        expect(spyMethodSign).toHaveBeenCalled();
        expect(spyMethodSign).toHaveBeenCalledTimes(1);

        if (ledgerApp == EthApp) {
          expect(spyMethodSign).toHaveBeenCalledWith(
            stringifyPath(path),
            Buffer.from(message).toString("hex")
          );
        } else {
          expect(spyMethodSign).toHaveBeenCalledWith(
            stringifyPath(path),
            message
          );
        }
      }
    );
  });
  describe("init", () => {
    it.each([
      [
        "webusb-cosmos",
        "webusb",
        [],
        "cosmos",
        {
          deviceLocked: false,
          major: 12,
          version: "1.2",
          testMode: true,
        },
      ],
      [
        "webhid-cosmos",
        "webhid",
        [],
        "cosmos",
        {
          deviceLocked: true,
          major: 1,
          version: "1.2",
          testMode: true,
        },
      ],
      [
        "ble-cosmos",
        "ble",
        [],
        "cosmos",
        {
          deviceLocked: false,
          major: 1,
          version: "1.2",
          testMode: false,
        },
      ],
      [
        "webusb-eth",
        "webusb",
        [],
        "eth",
        {
          deviceLocked: true,
          major: 1,
          version: "1.2",
          testMode: true,
        },
      ],
      [
        "webhid-eth",
        "webhid",
        [],
        "eth",
        {
          deviceLocked: false,
          major: 1,
          version: "1.2",
          testMode: false,
        },
      ],
      [
        "ble-eth",
        "ble",
        [],
        "eth",
        {
          deviceLocked: false,
          major: 3,
          version: "1.2",
          testMode: true,
        },
      ],
      [
        "webusb-trx",
        "webusb",
        [],
        "trx",
        {
          deviceLocked: false,
          major: 12,
          version: "1.4",
          testMode: true,
        },
      ],
      [
        "webhid-trx",
        "webhid",
        [],
        "trx",
        {
          deviceLocked: false,
          major: 1,
          version: "1.5",
          testMode: true,
        },
      ],
      [
        "ble-trx",
        "ble",
        [],
        "trx",
        {
          deviceLocked: false,
          major: 1,
          version: "2.2",
          testMode: true,
        },
      ],
      [
        "transportIniterIsNull",
        "inValid",
        [],
        null,
        {
          deviceLocked: false,
          major: 1,
          version: "4.2",
          testMode: true,
        },
      ],
    ])(
      "init %s",
      async (
        caseTest: string,
        mode: any,
        initArgs: any,
        ledgerAppType: any,
        versionResponse: {
          deviceLocked: boolean;
          major: number;
          version: string;
          testMode: boolean;
        }
      ) => {
        const TransportWebUSB = jest.createMockFromModule<
          typeof import("@ledgerhq/hw-transport-webusb")
        >("@ledgerhq/hw-transport-webusb");
        const TransportWebHID = jest.createMockFromModule<
          typeof import("@ledgerhq/hw-transport-webhid")
        >("@ledgerhq/hw-transport-webhid");

        LedgerInternal.transportIniters = {
          webusb: jest.fn().mockResolvedValue(caseTest),
          webhid: jest.fn().mockResolvedValue(caseTest),
          ble: jest.fn().mockResolvedValue(caseTest),
        };
        if (caseTest === "transportIniterIsNull") {
          await expect(
            LedgerInternal.init(mode, initArgs, ledgerAppType)
          ).rejects.toThrow(
            new OWalletError("ledger", 112, `Unknown mode: ${mode}`)
          );
          return;
        }
        const spyTransportIniter = jest.spyOn(
          LedgerInternal.transportIniters,
          mode
        );
        const spyLedger = jest
          .spyOn(LedgerInternal.prototype, "getVersion")
          .mockResolvedValue({
            deviceLocked: versionResponse.deviceLocked,
            major: versionResponse.major,
            version: versionResponse.version,
            testMode: versionResponse.testMode,
          });
        if (caseTest === "webhid-cosmos") {
          await expect(
            LedgerInternal.init(mode, initArgs, ledgerAppType)
          ).rejects.toThrow("transport.close is not a function");
          return;
        }
        const rs = await LedgerInternal.init(mode, initArgs, ledgerAppType);
        expect(spyTransportIniter).toHaveBeenCalled();
        expect(spyTransportIniter).toHaveBeenCalledWith(...initArgs);
        if (ledgerAppType === "trx") {
          expect(TrxApp).toHaveBeenCalled();
          expect(TrxApp).toHaveBeenCalledTimes(1);
          expect(TrxApp).toHaveBeenCalledWith(caseTest);
        } else if (ledgerAppType === "eth") {
          expect(EthApp).toHaveBeenCalled();
          expect(EthApp).toHaveBeenCalledTimes(1);
          expect(EthApp).toHaveBeenCalledWith(caseTest);
        } else if (ledgerAppType === "cosmos") {
          expect(CosmosApp).toHaveBeenCalled();
          expect(CosmosApp).toHaveBeenCalledTimes(1);
          expect(CosmosApp).toHaveBeenCalledWith(caseTest);
          expect(spyLedger).toHaveBeenCalled();
          expect(spyLedger).toHaveBeenCalledTimes(1);
        }
      }
    );
  });
});

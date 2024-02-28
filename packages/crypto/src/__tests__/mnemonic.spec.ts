import {
  mockKeyCosmos,
  mockPassword,
  mockPathBip44,
} from "@owallet/background/src/keyring/__mocks__/keyring";

import { Mnemonic } from "../mnemonic";

describe("generateWalletFromMnemonic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should generate wallet from mnemonic with default path and password", () => {
    const result = Mnemonic.generateWalletFromMnemonic(
      mockKeyCosmos.mnemonic,
      mockPathBip44,
      mockPassword
    );
    const expectRs =
      "877afdd00be7d66e1baa1cec7766dfed69b98e88650eff3dae51694b4de8295b";
    expect(Buffer.from(result).toString("hex")).toEqual(expectRs);
  });

  test("should throw an error if privateKey is null", () => {
    const spymne = jest.spyOn(require("bip39"), "mnemonicToSeedSync");
    const spyFromSeed = jest
      .spyOn(require("bip32"), "fromSeed")
      .mockReturnValue({
        derivePath: jest.fn().mockReturnValueOnce({
          privateKey: null,
        }),
      });
    expect(() => {
      Mnemonic.generateWalletFromMnemonic(
        mockKeyCosmos.mnemonic,
        mockPathBip44,
        mockPassword
      );
    }).toThrow("null hd key");
    expect(spymne).toBeCalledTimes(1);
    expect(spyFromSeed).toBeCalledTimes(1);
  });
  test("simulate pass params for all function children", () => {
    const spymne = jest
      .spyOn(require("bip39"), "mnemonicToSeedSync")
      .mockReturnValue("mnemonicSeed");
    const spyFromSeed = jest
      .spyOn(require("bip32"), "fromSeed")
      .mockReturnValue({
        derivePath: jest.fn().mockReturnValueOnce({
          privateKey: mockKeyCosmos.privateKeyHex,
        }),
      });

    const result = Mnemonic.generateWalletFromMnemonic(
      mockKeyCosmos.mnemonic,
      mockPathBip44,
      mockPassword
    );
    expect(result).toEqual(mockKeyCosmos.privateKeyHex);
    expect(spymne).toHaveBeenCalled();
    expect(spymne).toBeCalledWith(mockKeyCosmos.mnemonic, mockPassword);
    expect(spyFromSeed).toHaveBeenCalled();
    expect(spyFromSeed).toBeCalledWith("mnemonicSeed");
  });
});

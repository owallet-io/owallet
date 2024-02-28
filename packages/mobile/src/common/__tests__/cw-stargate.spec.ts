import { CWStargate } from "../cw-stargate";
import * as cosmwasm from "@cosmjs/cosmwasm-stargate";

jest.mock("@cosmjs/cosmwasm-stargate", () => ({
  SigningCosmWasmClient: {
    connectWithSigner: jest.fn().mockResolvedValue("mockClient"),
  },
}));

describe("CWStargate", () => {
  let mockAccount;
  let mockChainId;
  let mockRpc;

  beforeEach(() => {
    mockAccount = {
      getOWallet: jest.fn().mockResolvedValue({
        getOfflineSigner: jest.fn().mockReturnValue("mockOfflineSigner"),
      }),
    };
    mockChainId = "Oraichain";
    mockRpc = "https://rpc.orai.io";
    jest.clearAllMocks();
  });

  it("should initialize and return the client", async () => {
    const result = await CWStargate.init(mockAccount, mockChainId, mockRpc);

    expect(result).toBe("mockClient");

    expect(mockAccount.getOWallet).toHaveBeenCalled();
    expect(
      cosmwasm.SigningCosmWasmClient.connectWithSigner
    ).toHaveBeenCalledWith(mockRpc, "mockOfflineSigner");
  });

  it("should throw an error if owallet API can't be obtained", async () => {
    mockAccount.getOWallet.mockResolvedValueOnce(null);
    await expect(
      CWStargate.init(mockAccount, mockChainId, mockRpc)
    ).rejects.toThrowError("Can't get the owallet API");

    expect(mockAccount.getOWallet).toHaveBeenCalled();
    expect(
      cosmwasm.SigningCosmWasmClient.connectWithSigner
    ).not.toHaveBeenCalled();
  });
});

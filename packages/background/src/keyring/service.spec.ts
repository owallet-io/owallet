import { KeyRingStatus } from ".";
import { KeyRingService } from "./service";
import * as commonOwallet from "@owallet/common";
describe("signEIP712", () => {
  it("processSignDocEIP712", async () => {
    const keyringService = new KeyRingService(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    const evm = commonOwallet.EmbedChainInfos.filter(
      (item, index) => item.chainId === "injective-1"
    )[0];
    Object.defineProperty(keyringService, "chainsService", {
      value: {
        getChainInfo: () => {
          return {
            ...evm,
            embeded: true,
          };
        },
      },
      writable: true,
    });
    //@ts-ignore
    keyringService.status = KeyRingStatus.UNLOCKED;
    const mockSignDoc = {
      account_number: "96604",
      chain_id: "injective-1",
      fee: {
        amount: [
          {
            amount: "1000000000000000",
            denom: "inj",
          },
        ],
        gas: "200000",
      },
      memo: "",
      msgs: [
        {
          type: "cosmos-sdk/MsgSend",
          value: {
            amount: [
              {
                amount: "84802076410841756",
                denom: "inj",
              },
            ],
            from_address: "inj18v67vx8dvd4ctmwdtwvxsmc8q52neqmgreumrt",
            to_address: "inj18v67vx8dvd4ctmwdtwvxsmc8q52neqmgreumrt",
          },
        },
      ],
      sequence: "10",
      timeout_height: "9007199254740991",
    };
    const mockKeyInfo = {
      algo: "ethsecp256k1",
      pubKey: new Uint8Array([
        2, 59, 29, 39, 166, 47, 187, 235, 126, 180, 207, 194, 215, 129, 131,
        199, 191, 29, 95, 73, 53, 59, 110, 89, 145, 226, 147, 129, 32, 119, 195,
        210, 149,
      ]),
      address: new Uint8Array([
        59, 53, 230, 24, 237, 99, 107, 133, 237, 205, 91, 152, 104, 111, 7, 5,
        21, 60, 131, 104,
      ]),
      isNanoLedger: true,
    };
    const expected = {
      account_number: "96604",
      chain_id: "injective-1",
      fee: {
        amount: [{ amount: "1000000000000000", denom: "inj" }],
        gas: "200000",
      },
      memo: "",
      msgs: [
        {
          type: "cosmos-sdk/MsgSend",
          value: {
            amount: [{ amount: "84802076410841756", denom: "inj" }],
            from_address: "inj18v67vx8dvd4ctmwdtwvxsmc8q52neqmgreumrt",
            to_address: "inj18v67vx8dvd4ctmwdtwvxsmc8q52neqmgreumrt",
          },
        },
      ],
      sequence: "10",
      timeout_height: "9007199254740991",
    };
    const rs = await keyringService.processSignDocEIP712(
      mockSignDoc,
      "injective-1",
      "inj18v67vx8dvd4ctmwdtwvxsmc8q52neqmgreumrt",
      mockKeyInfo
    );
    expect(rs).toEqual(expected);
  });
});

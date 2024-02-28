import { Bech32Address } from "./index";

describe("Test bech32", () => {
  it("bech32 address should be parsed properly", () => {
    const address = Bech32Address.fromBech32(
      "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k"
    );

    expect(address.address).toStrictEqual(
      new Uint8Array([
        99, 53, 113, 240, 28, 16, 86, 74, 152, 54, 129, 69, 59, 56, 232, 36, 40,
        106, 206, 19,
      ])
    );
    expect(address.address.length).toBe(20);
    expect(address.toBech32("cosmos")).toBe(
      "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k"
    );
  });

  it("fromBech32Btc address", () => {
    const address = Bech32Address.fromBech32Btc(
      "tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g"
    );
    expect(address.address).toEqual(
      new Uint8Array([
        165, 26, 223, 204, 1, 244, 2, 44, 194, 205, 105, 212, 26, 66, 25, 32,
        50, 98, 107, 208,
      ])
    );
    expect(address.address.length).toBe(20);
    expect(address.toBech32Btc("tb")).toBe(
      "tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g"
    );
  });
});

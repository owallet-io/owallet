import { ROUTE } from "../constants";

describe("Keyring Constants", () => {
  it("should have the correct route", () => {
    expect(ROUTE).toBe("keyring-v2");
  });
});

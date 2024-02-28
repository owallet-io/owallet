import { Hash } from "../hash";

describe("Hash", () => {
  describe("sha256", () => {
    it("should return the SHA-256 hash of input data", () => {
      const data: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const expectedHash: Uint8Array = new Uint8Array([
        116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
        120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220, 236,
        96, 208,
      ]);

      const hash: Uint8Array = Hash.sha256(data);
      expect(hash).toEqual(expectedHash);
    });
  });

  describe("truncHashPortion", () => {
    it("should truncate the hash portion of the string correctly", () => {
      const str: string = "This is a long string";
      const expectedTruncatedStr: string = "This is a long…";

      const truncatedStr: string = Hash.truncHashPortion(str, 14);

      expect(truncatedStr).toEqual(expectedTruncatedStr);
    });

    it("should truncate the hash portion of the string correctly with specified start and end counts", () => {
      const str: string = "This is another long string";
      const expectedTruncatedStr: string = "This is ano…ring";

      const truncatedStr: string = Hash.truncHashPortion(str, 11, 4);

      expect(truncatedStr).toEqual(expectedTruncatedStr);
    });
  });
});

import * as indexExports from "./index";
import { simpleFetch } from "./fetch";
import { SimpleFetchError, isSimpleFetchError } from "./error";
import * as types from "./types";

describe("Index exports", () => {
  it("should export simpleFetch function", () => {
    expect(indexExports.simpleFetch).toBe(simpleFetch);
  });

  it("should export SimpleFetchError class", () => {
    expect(indexExports.SimpleFetchError).toBe(SimpleFetchError);
  });

  it("should export isSimpleFetchError function", () => {
    expect(indexExports.isSimpleFetchError).toBe(isSimpleFetchError);
  });

  it("should have all required exports", () => {
    // Check that the main exports are included
    const expectedExports = [
      "simpleFetch",
      "SimpleFetchError",
      "isSimpleFetchError",
      "makeURL",
    ];
    expectedExports.forEach((exportName) => {
      expect(Object.keys(indexExports)).toContain(exportName);
    });
  });
});

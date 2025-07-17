import { SimpleFetchRequestOptions, SimpleFetchResponse } from "./types";

describe("Type definitions", () => {
  it("should have correct SimpleFetchRequestOptions structure", () => {
    // This is just a type test to ensure the structure matches our expectations
    const options: SimpleFetchRequestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true }),
      validateStatus: (status: number) => status >= 200 && status < 300,
    };

    // Check that all expected properties are present
    expect(options.method).toBe("GET");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(options.body).toBe(JSON.stringify({ test: true }));
    expect(options.validateStatus!(200)).toBe(true);
    expect(options.validateStatus!(400)).toBe(false);
  });

  it("should have correct SimpleFetchResponse structure", () => {
    // This is just a type test to ensure the structure matches our expectations
    const response: SimpleFetchResponse<{ test: boolean }> = {
      url: "https://example.com/api",
      data: { test: true },
      headers: new Headers(),
      status: 200,
      statusText: "OK",
    };

    // Check that all expected properties are present
    expect(response.url).toBe("https://example.com/api");
    expect(response.data).toEqual({ test: true });
    expect(response.headers).toBeInstanceOf(Headers);
    expect(response.status).toBe(200);
    expect(response.statusText).toBe("OK");
  });
});

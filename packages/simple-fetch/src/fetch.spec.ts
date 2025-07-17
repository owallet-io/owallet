import { makeURL, simpleFetch } from "./fetch";
import { SimpleFetchError } from "./error";

// Mock global fetch
global.fetch = jest.fn();

describe("makeURL function", () => {
  it("should add https protocol when not provided", () => {
    expect(makeURL("example.com", "/path")).toBe("https://example.com/path");
  });

  it("should preserve http protocol when provided", () => {
    expect(makeURL("http://example.com", "/path")).toBe(
      "http://example.com/path"
    );
  });

  it("should preserve https protocol when provided", () => {
    expect(makeURL("https://example.com", "/path")).toBe(
      "https://example.com/path"
    );
  });

  it("should handle trailing slashes in baseURL correctly", () => {
    expect(makeURL("https://example.com/", "/path")).toBe(
      "https://example.com/path"
    );
  });

  it("should handle leading slashes in url correctly", () => {
    expect(makeURL("https://example.com", "/path")).toBe(
      "https://example.com/path"
    );
  });

  it("should handle both trailing and leading slashes", () => {
    expect(makeURL("https://example.com/", "/path")).toBe(
      "https://example.com/path"
    );
  });

  it("should handle no slashes", () => {
    expect(makeURL("https://example.com", "path")).toBe(
      "https://example.com/path"
    );
  });

  it("should maintain path in baseURL", () => {
    expect(makeURL("https://example.com/api", "/v1/users")).toBe(
      "https://example.com/api/v1/users"
    );
  });

  it("should handle trailing slashes in both baseURL path and url", () => {
    expect(makeURL("https://example.com/api/", "/v1/users/")).toBe(
      "https://example.com/api/v1/users"
    );
  });

  it("should maintain query parameters from baseURL", () => {
    expect(makeURL("https://example.com?token=123", "/users")).toBe(
      "https://example.com/users?token=123"
    );
  });

  it("should handle query parameters in both baseURL and url", () => {
    expect(makeURL("https://example.com?token=123", "/users?id=456")).toBe(
      "https://example.com/users?id=456&token=123"
    );
  });

  it("should handle multiple query parameters", () => {
    expect(makeURL("https://example.com?token=123&version=1", "/users")).toBe(
      "https://example.com/users?token=123&version=1"
    );
  });

  it("should handle empty url", () => {
    expect(makeURL("https://example.com/api", "")).toBe(
      "https://example.com/api"
    );
  });

  it("should maintain url integrity with special characters", () => {
    expect(makeURL("https://example.com", "/search?q=test%20string")).toBe(
      "https://example.com/search?q=test%20string"
    );
  });

  it("should maintain integrity of specific API URL with query parameters", () => {
    const baseURL = "https://api.scan.orai.io";
    const url = "/v1/validators?page_id=1";
    const combinedURL = makeURL(baseURL, url);

    expect(combinedURL).toBe(
      "https://api.scan.orai.io/v1/validators?page_id=1"
    );
  });

  it("should maintain integrity when passing full URL as baseURL", () => {
    const fullURL = "https://api.scan.orai.io/v1/validators?page_id=1";
    const result = makeURL(fullURL, "");

    expect(result).toBe("https://api.scan.orai.io/v1/validators?page_id=1");
  });
});

describe("removeFirstSlashIfIs function", () => {
  // Since this is a private function, we'll test it indirectly through makeURL
  it("should remove leading slash when combining URLs", () => {
    expect(makeURL("https://example.com", "/path")).toBe(
      "https://example.com/path"
    );
  });

  it("should handle url without leading slash", () => {
    expect(makeURL("https://example.com", "path")).toBe(
      "https://example.com/path"
    );
  });
});

describe("removeLastSlashIfIs function", () => {
  // Since this is a private function, we'll test it indirectly through makeURL
  it("should remove trailing slash from baseURL", () => {
    expect(makeURL("https://example.com/", "path")).toBe(
      "https://example.com/path"
    );
  });

  it("should remove trailing slash from url", () => {
    expect(makeURL("https://example.com", "path/")).toBe(
      "https://example.com/path"
    );
  });
});

describe("simpleFetch function", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("should make a GET request with proper URL construction", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: "test" }),
      text: jest.fn(),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await simpleFetch("https://example.com", "/api/data");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api/data", {
      headers: {
        accept: "application/json, text/plain, */*",
      },
    });
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ data: "test" });
  });

  it("should handle baseURL with only one parameter", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: "test" }),
      text: jest.fn(),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await simpleFetch("https://example.com");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com", {
      headers: {
        accept: "application/json, text/plain, */*",
      },
    });
  });

  it("should handle options in second parameter", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: "test" }),
      text: jest.fn(),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options = { method: "POST", body: JSON.stringify({ test: true }) };
    const result = await simpleFetch("https://example.com", options);

    expect(global.fetch).toHaveBeenCalledWith("https://example.com", {
      headers: {
        accept: "application/json, text/plain, */*",
      },
      method: "POST",
      body: JSON.stringify({ test: true }),
    });
  });

  it("should handle custom headers", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: "test" }),
      text: jest.fn(),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options = { headers: { "X-Custom": "Value" } };
    const result = await simpleFetch("https://example.com", "/api", options);

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/api", {
      headers: {
        accept: "application/json, text/plain, */*",
        "X-Custom": "Value",
      },
    });
  });

  it("should handle 204 No Content response", async () => {
    const mockResponse = {
      json: jest.fn(),
      text: jest.fn(),
      status: 204,
      statusText: "No Content",
      headers: new Headers({}),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // Need to provide validateStatus that allows 404 (which is what 204 becomes for GET requests)
    const options = { validateStatus: (status: number) => true };
    const result = await simpleFetch("https://example.com", options);

    expect(result.status).toBe(404); // GET request with 204 is treated as 404
    expect(result.data).toBeUndefined();
  });

  it("should handle 204 No Content with non-GET request", async () => {
    const mockResponse = {
      json: jest.fn(),
      text: jest.fn(),
      status: 204,
      statusText: "No Content",
      headers: new Headers({}),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options = { method: "DELETE" };
    const result = await simpleFetch("https://example.com", options);

    expect(result.status).toBe(204); // Non-GET request with 204 stays as 204
    expect(result.data).toBeUndefined();
  });

  it("should handle non-JSON responses", async () => {
    const mockResponse = {
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      text: jest.fn().mockResolvedValue("Plain text response"),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "text/plain",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await simpleFetch("https://example.com");

    expect(result.data).toBe("Plain text response");
  });

  it("should handle JSON-like text responses", async () => {
    const jsonText = '{"key": "value"}';
    const mockResponse = {
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      text: jest.fn().mockResolvedValue(jsonText),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "text/plain",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await simpleFetch("https://example.com");

    expect(result.data).toEqual({ key: "value" });
  });

  it("should throw SimpleFetchError for error responses", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ error: "Not found" }),
      text: jest.fn(),
      status: 404,
      statusText: "Not Found",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(simpleFetch("https://example.com")).rejects.toThrow(
      SimpleFetchError
    );
  });

  it("should use custom validateStatus function if provided", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ warning: "Resource outdated" }),
      text: jest.fn(),
      status: 409,
      statusText: "Conflict",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options = { validateStatus: (status: number) => status !== 500 };
    const result = await simpleFetch("https://example.com", options);

    // Should not throw even though status is 409
    expect(result.status).toBe(409);
    expect(result.data).toEqual({ warning: "Resource outdated" });
  });

  it('should handle url as "/" properly', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: "test" }),
      text: jest.fn(),
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await simpleFetch("https://example.com", "/");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com", {
      headers: {
        accept: "application/json, text/plain, */*",
      },
    });
  });
});

describe("SimpleFetchError", () => {
  it("should construct proper error object", () => {
    const response = {
      url: "https://example.com/api",
      data: { error: "Not found" },
      headers: new Headers(),
      status: 404,
      statusText: "Not Found",
    };

    const error = new SimpleFetchError("https://example.com", "/api", response);

    expect(error.message).toBe(
      "Failed to get response from https://example.com/api"
    );
    expect(error.baseURL).toBe("https://example.com");
    expect(error.url).toBe("/api");
    expect(error.response).toBe(response);
  });
});

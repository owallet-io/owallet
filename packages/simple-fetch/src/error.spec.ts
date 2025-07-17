import { SimpleFetchError, isSimpleFetchError } from "./error";

describe("SimpleFetchError", () => {
  it("should create an error with correct properties", () => {
    const response = {
      url: "https://example.com/api",
      data: { message: "Not found" },
      headers: new Headers(),
      status: 404,
      statusText: "Not Found",
    };

    const error = new SimpleFetchError("https://example.com", "/api", response);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      "Failed to get response from https://example.com/api"
    );
    expect(error.baseURL).toBe("https://example.com");
    expect(error.url).toBe("/api");
    expect(error.response).toBe(response);
    expect(error.name).toBe("Error");
  });

  it("should handle error with different status codes", () => {
    const response = {
      url: "https://example.com/api",
      data: { error: "Invalid input", message: "Validation failed" },
      headers: new Headers(),
      status: 400,
      statusText: "Bad Request",
    };

    const error = new SimpleFetchError("https://example.com", "/api", response);

    expect(error.message).toBe(
      "Failed to get response from https://example.com/api"
    );
    expect(error.response.data).toEqual({
      error: "Invalid input",
      message: "Validation failed",
    });
  });

  it("should handle empty response data", () => {
    const response = {
      url: "https://example.com/api",
      data: undefined,
      headers: new Headers(),
      status: 500,
      statusText: "Internal Server Error",
    };

    const error = new SimpleFetchError("https://example.com", "/api", response);

    expect(error.message).toBe(
      "Failed to get response from https://example.com/api"
    );
    expect(error.response.data).toBeUndefined();
  });

  it("should preserve stack trace", () => {
    const response = {
      url: "https://example.com/api",
      data: { message: "Not found" },
      headers: new Headers(),
      status: 404,
      statusText: "Not Found",
    };

    const error = new SimpleFetchError("https://example.com", "/api", response);

    expect(error.stack).toBeDefined();
  });

  it("should handle undefined response", () => {
    const error = new SimpleFetchError(
      "https://example.com",
      "/api",
      undefined
    );

    expect(error.message).toBe(
      "Failed to get response from https://example.com/api"
    );
    expect(error.response).toBeUndefined();
  });
});

describe("isSimpleFetchError function", () => {
  it("should return true for SimpleFetchError instances", () => {
    const error = new SimpleFetchError(
      "https://example.com",
      "/api",
      undefined
    );
    expect(isSimpleFetchError(error)).toBe(true);
  });

  it("should return false for other error instances", () => {
    const error = new Error("Generic error");
    expect(isSimpleFetchError(error)).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(isSimpleFetchError(null)).toBe(false);
    expect(isSimpleFetchError(undefined)).toBe(false);
    expect(isSimpleFetchError({})).toBe(false);
    expect(isSimpleFetchError("")).toBe(false);
  });
});

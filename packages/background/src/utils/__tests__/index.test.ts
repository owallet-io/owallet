// Import the mock browser first
import "./browser-mock";

// Mock the isServiceWorker function
jest.mock("@owallet/common", () => ({
  isServiceWorker: jest.fn(),
}));

import { runIfOnlyAppStart } from "../index";
import { isServiceWorker } from "@owallet/common";
import { mockBrowser } from "./browser-mock";

describe("Utils", () => {
  describe("runIfOnlyAppStart", () => {
    let mockFn: jest.Mock;

    beforeEach(() => {
      mockFn = jest.fn();
      // Reset all mocks
      mockBrowser.storage.session.get.mockReset();
      mockBrowser.storage.session.set.mockReset();
      (isServiceWorker as jest.Mock).mockReset();
    });

    it("should execute the function when not in service worker", async () => {
      (isServiceWorker as jest.Mock).mockReturnValue(false);

      await runIfOnlyAppStart("test-key", mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockBrowser.storage.session.get).not.toHaveBeenCalled();
      expect(mockBrowser.storage.session.set).not.toHaveBeenCalled();
    });

    it("should execute the function in service worker when key not found", async () => {
      (isServiceWorker as jest.Mock).mockReturnValue(true);
      mockBrowser.storage.session.get.mockResolvedValue({});

      await runIfOnlyAppStart("test-key", mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockBrowser.storage.session.get).toHaveBeenCalledWith("test-key");
      expect(mockBrowser.storage.session.set).toHaveBeenCalledWith({
        "test-key": true,
      });
    });

    it("should not execute the function in service worker when key found", async () => {
      (isServiceWorker as jest.Mock).mockReturnValue(true);
      mockBrowser.storage.session.get.mockResolvedValue({ "test-key": true });

      await runIfOnlyAppStart("test-key", mockFn);

      expect(mockFn).not.toHaveBeenCalled();
      expect(mockBrowser.storage.session.get).toHaveBeenCalledWith("test-key");
      expect(mockBrowser.storage.session.set).toHaveBeenCalledWith({
        "test-key": true,
      });
    });

    it("should handle errors from browser storage", async () => {
      (isServiceWorker as jest.Mock).mockReturnValue(true);
      mockBrowser.storage.session.get.mockRejectedValue(
        new Error("Test error")
      );

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await runIfOnlyAppStart("test-key", mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockBrowser.storage.session.get).toHaveBeenCalledWith("test-key");

      consoleSpy.mockRestore();
    });
  });
});

// Mock browser object for testing
export const mockBrowser = {
  storage: {
    session: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

// Create a global browser object for tests
(global as any).browser = mockBrowser;

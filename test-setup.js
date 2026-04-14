// Jest test setup file
// This file is run before all tests

// Mock console methods to avoid noisy output during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
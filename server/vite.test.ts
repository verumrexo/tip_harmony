import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupVite } from './vite';
import { type Express } from 'express';
import { type Server } from 'http';

// Mocks
vi.mock('vite', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
  createServer: vi.fn(),
}));

vi.mock('fs', () => ({
  default: {
    promises: {
      readFile: vi.fn().mockResolvedValue('<html><body><div id="root"></div><script src="/src/main.tsx"></script></body></html>'),
    },
  },
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id'),
}));

vi.mock('../vite.config', () => ({
  default: {},
}));

describe('setupVite', () => {
  let mockViteServer: any;
  let mockApp: any;
  let mockServer: any;
  let mockTransformIndexHtml: any;
  let mockSsrFixStacktrace: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockTransformIndexHtml = vi.fn();
    mockSsrFixStacktrace = vi.fn();

    mockViteServer = {
      middlewares: vi.fn((req, res, next) => next()),
      transformIndexHtml: mockTransformIndexHtml,
      ssrFixStacktrace: mockSsrFixStacktrace,
    };

    const vite = await import('vite');
    (vite.createServer as any).mockResolvedValue(mockViteServer);

    mockApp = {
      use: vi.fn(),
    };

    mockServer = {} as Server;
  });

  it('should call ssrFixStacktrace when an Error is thrown', async () => {
    await setupVite(mockServer, mockApp as Express);

    // Get the middleware for "*"
    const calls = mockApp.use.mock.calls;
    const middlewareEntry = calls.find((call: any[]) => call[0] === '*');

    // If not found, fail early
    expect(middlewareEntry).toBeDefined();
    const middleware = middlewareEntry[1];

    // Mock transformIndexHtml to throw an Error
    const error = new Error('Test Error');
    mockTransformIndexHtml.mockRejectedValue(error);

    const req = { originalUrl: '/' };
    const res = { status: vi.fn().mockReturnThis(), set: vi.fn().mockReturnThis(), end: vi.fn() };
    const next = vi.fn();

    await middleware(req, res, next);

    expect(mockSsrFixStacktrace).toHaveBeenCalledWith(error);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should NOT call ssrFixStacktrace when a non-Error is thrown', async () => {
    await setupVite(mockServer, mockApp as Express);

    const calls = mockApp.use.mock.calls;
    const middlewareEntry = calls.find((call: any[]) => call[0] === '*');

    expect(middlewareEntry).toBeDefined();
    const middleware = middlewareEntry[1];

    // Mock transformIndexHtml to throw a string
    const nonError = 'Test Error String';
    mockTransformIndexHtml.mockRejectedValue(nonError);

    const req = { originalUrl: '/' };
    const res = { status: vi.fn().mockReturnThis(), set: vi.fn().mockReturnThis(), end: vi.fn() };
    const next = vi.fn();

    await middleware(req, res, next);

    // This expectation is what verifies the fix.
    // Initially this will FAIL if the code unconditionally calls ssrFixStacktrace.
    // However, since the code currently casts `e as Error`, it passes `nonError` (string) to `ssrFixStacktrace`.
    // So `ssrFixStacktrace` IS called.
    // We want it NOT to be called after our fix.
    expect(mockSsrFixStacktrace).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(nonError);
  });
});

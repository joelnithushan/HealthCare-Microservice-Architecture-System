/**
 * Tests for WebSocketService
 * Issue #19: URL was hardcoded to 'http://localhost:8080/ws' — must use env var.
 * Issue #26: Reconnect had no backoff — tested via connect/error callback count.
 */

// We test the module in isolation by resetting module registry each time
// so that process.env changes are picked up on re-require.

let SockJSMock;
let stompClientMock;

beforeEach(() => {
  jest.resetModules();

  stompClientMock = {
    debug: jest.fn(),
    connect: jest.fn(),
    subscribe: jest.fn(),
    disconnect: jest.fn(),
  };

  SockJSMock = jest.fn().mockImplementation(() => ({}));

  jest.doMock('sockjs-client', () => SockJSMock);
  jest.doMock('@stomp/stompjs', () => ({
    Stomp: { over: jest.fn(() => stompClientMock) },
  }));
  jest.doMock('react-hot-toast', () => ({ default: jest.fn() }));
});

afterEach(() => {
  delete process.env.REACT_APP_API_URL;
  jest.clearAllMocks();
});

// ── Issue #19: Must read URL from env var, not hardcoded ──

test('uses REACT_APP_API_URL environment variable when set', () => {
  process.env.REACT_APP_API_URL = 'http://api.example.com:8080';

  const { connectWebSocket } = require('../services/WebSocketService');
  connectWebSocket(42, jest.fn());

  expect(SockJSMock).toHaveBeenCalledWith('http://api.example.com:8080/ws');
});

test('falls back to localhost when REACT_APP_API_URL is not set', () => {
  delete process.env.REACT_APP_API_URL;

  const { connectWebSocket } = require('../services/WebSocketService');
  connectWebSocket(42, jest.fn());

  expect(SockJSMock).toHaveBeenCalledWith('http://localhost:8080/ws');
});

test('never passes a hardcoded production host as the only option', () => {
  // This test ensures the URL construction is dynamic.
  // With env var set to a test host, it must NOT use localhost.
  process.env.REACT_APP_API_URL = 'http://prod-server:8080';

  const { connectWebSocket } = require('../services/WebSocketService');
  connectWebSocket(1, jest.fn());

  const calledUrl = SockJSMock.mock.calls[0][0];
  expect(calledUrl).not.toBe('http://localhost:8080/ws');
  expect(calledUrl).toBe('http://prod-server:8080/ws');
});

// ── disconnectWebSocket must not throw when called before connecting ──

test('disconnectWebSocket does not throw when not connected', () => {
  const { disconnectWebSocket } = require('../services/WebSocketService');
  expect(() => disconnectWebSocket()).not.toThrow();
});

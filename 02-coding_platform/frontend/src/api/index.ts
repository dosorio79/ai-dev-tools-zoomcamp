import {
  api as realApi,
  connectSessionWebSocket as realConnectSessionWebSocket
} from "./client";
import { mockApi, mockWebSocket } from "./mockApi";

export type {
  Session,
  User,
  ExecutionResult,
  Language,
  WebSocketEvent
} from "./client";

// -------------------------------------------------------
//  🔥 IMPORTANT: Vite uses import.meta.env, NOT process.env
// -------------------------------------------------------

// Vite replaces import.meta.env.* at build-time.
// In Vitest, import.meta.env.MODE === "test"
const useMock =
  import.meta.env?.VITE_USE_MOCK_API === "true" ||
  import.meta.env?.MODE === "test";

// Select API implementation (real backend or mock)
export const api = useMock ? mockApi : realApi;

// Select WS implementation
export const connectSessionWebSocket = useMock
  ? (
      sessionId: string,
      onMessage: (event: any) => void,
      onConnected?: (connected: boolean) => void
    ) => {
      const disconnect = mockWebSocket.connect(sessionId, onMessage);
      onConnected?.(true);
      return {
        disconnect,
        send: (event: any) => mockWebSocket.emit(sessionId, event)
      };
    }
  : realConnectSessionWebSocket;

export { mockApi, mockWebSocket };

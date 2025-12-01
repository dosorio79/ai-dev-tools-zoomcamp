import { WebSocket, WebSocketServer } from "ws";
import { Server as HTTPServer, IncomingMessage } from "http";
import { sessionStore } from "../store/sessionStore";
import { ExecutionResult, WebSocketMessage } from "../types";

type SessionWebSocket = WebSocket & { sessionId?: string };

const sessionClients = new Map<string, Set<WebSocket>>();

export const broadcastSessionMessage = (sessionId: string, message: WebSocketMessage) => {
  const clients = sessionClients.get(sessionId);
  if (!clients) return;
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

const registerClient = (sessionId: string, ws: WebSocket) => {
  const clients = sessionClients.get(sessionId) ?? new Set<WebSocket>();
  clients.add(ws);
  sessionClients.set(sessionId, clients);

  ws.on("close", () => {
    clients.delete(ws);
    if (clients.size === 0) {
      sessionClients.delete(sessionId);
    }
  });
};

const isExecutionResult = (payload: any): payload is ExecutionResult =>
  payload &&
  typeof payload.output === "string" &&
  (payload.error === null || typeof payload.error === "string") &&
  typeof payload.timestamp === "string";

const getSessionIdFromUrl = (url?: string) => {
  if (!url) return null;
  const clean = url.split("?")[0];
  const parts = clean.split("/");
  if (parts.length < 3 || parts[1] !== "ws") return null;
  return parts[2] || null;
};

export const initWebSocket = (httpServer: HTTPServer) => {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const sessionId = getSessionIdFromUrl(req.url);
    if (!sessionId || !sessionStore.hasSession(sessionId)) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      const sessionSocket = ws as SessionWebSocket;
      sessionSocket.sessionId = sessionId;
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    const sessionSocket = ws as SessionWebSocket;
    const sessionId = sessionSocket.sessionId;
    if (!sessionId) {
      ws.close();
      return;
    }
    registerClient(sessionId, ws);
    ws.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as WebSocketMessage;
        if (message.type === "execution_result" && isExecutionResult(message.payload)) {
          broadcastSessionMessage(sessionId, message);
        }
      } catch {
        // Ignore malformed client messages
      }
    });
  });
};

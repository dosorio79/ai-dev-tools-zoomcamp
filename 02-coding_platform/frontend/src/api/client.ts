export type Language = "javascript" | "python";

export interface Session {
  id: string;
  createdAt: string;
  code: string;
  language: Language;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface ExecutionResult {
  output: string;
  error: string | null;
  timestamp: string;
}

export type WebSocketEvent =
  | { type: "code_change"; payload: { code: string } }
  | { type: "user_joined"; payload: { user: User } }
  | { type: "user_left"; payload: { user: User } }
  | { type: "language_change"; payload: { language: Language } }
  | { type: "execution_result"; payload: ExecutionResult };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000";
const WS_BASE_URL =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined) ??
  API_BASE_URL.replace(/^http/, "ws");

const buildUrl = (path: string) => `${API_BASE_URL.replace(/\/$/, "")}${path}`;

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error || res.statusText;
    throw new Error(message);
  }
  if (res.status === 204) {
    // @ts-expect-error allow void
    return undefined;
  }
  return res.json() as Promise<T>;
};

export const api = {
  createSession: async (language?: Language): Promise<Session> => {
    const res = await fetch(buildUrl("/sessions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(language ? { language } : {})
    });
    return handleResponse<Session>(res);
  },

  getSession: async (sessionId: string): Promise<Session> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}`));
    return handleResponse<Session>(res);
  },

  joinSession: async (sessionId: string, userName: string): Promise<{ session: Session; user: User }> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}/join`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName })
    });
    return handleResponse<{ session: Session; user: User }>(res);
  },

  getSessionUsers: async (sessionId: string): Promise<User[]> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}/users`));
    return handleResponse<User[]>(res);
  },

  updateCode: async (sessionId: string, code: string): Promise<void> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}/code`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    return handleResponse<void>(res);
  },

  changeLanguage: async (sessionId: string, language: Language): Promise<void> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}/language`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language })
    });
    return handleResponse<void>(res);
  },

  executeCode: async (sessionId: string, result: ExecutionResult): Promise<ExecutionResult> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}/execute`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    });
    return handleResponse<ExecutionResult>(res);
  },

  leaveSession: async (sessionId: string, userId: string): Promise<void> => {
    const res = await fetch(buildUrl(`/sessions/${sessionId}/leave`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return handleResponse<void>(res);
  }
};

export const connectSessionWebSocket = (
  sessionId: string,
  onMessage: (event: WebSocketEvent) => void,
  onConnected?: (connected: boolean) => void
) => {
  const ws = new WebSocket(`${WS_BASE_URL.replace(/\/$/, "")}/ws/${sessionId}`);
  const pending: string[] = [];

  ws.onopen = () => onConnected?.(true);
  ws.onclose = () => onConnected?.(false);
  ws.onerror = () => onConnected?.(false);
  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as WebSocketEvent;
      onMessage(parsed);
    } catch {
      // ignore malformed frames
    }
  };

  const send = (event: WebSocketEvent) => {
    const payload = JSON.stringify(event);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
      return;
    }
    if (ws.readyState === WebSocket.CONNECTING) {
      pending.push(payload);
      ws.addEventListener(
        "open",
        () => {
          while (pending.length) {
            const next = pending.shift();
            if (next) ws.send(next);
          }
        },
        { once: true }
      );
    }
  };

  return {
    disconnect: () => ws.close(),
    send
  };
};

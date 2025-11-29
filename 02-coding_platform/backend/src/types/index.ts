export const supportedLanguages = ["javascript", "python"] as const;
export type Language = (typeof supportedLanguages)[number];

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

export type WebSocketMessageType =
  | "code_change"
  | "user_joined"
  | "user_left"
  | "language_change"
  | "execution_result";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
}

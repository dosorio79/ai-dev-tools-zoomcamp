export type Language = 'python' | 'javascript';

export interface ExecutionResult {
  output: string;
  error: string | null;
  timestamp: string;
}

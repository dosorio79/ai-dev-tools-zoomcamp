import { Terminal, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useInterviewStore } from '@/store/interviewStore';

export const ExecutionPanel = () => {
  const { isExecuting, executionResult } = useInterviewStore();

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Output</span>
      </div>

      <Card className="flex-1 p-4 bg-black text-white font-mono text-sm overflow-auto border border-border">
        {!executionResult && !isExecuting && (
          <div className="h-full flex items-center justify-center text-gray-400">
            Click "Run Code" to see the output
          </div>
        )}

        {isExecuting && (
          <div className="h-full flex items-center justify-center text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin text-gray-200" />
          </div>
        )}

        {executionResult && (
          <div className="space-y-2">
            <pre className="whitespace-pre-wrap">
              {executionResult.output}
            </pre>
            {executionResult.error && (
              <pre className="whitespace-pre-wrap text-red-400 mt-2">
                {executionResult.error}
              </pre>
            )}
            <div className="text-xs text-gray-400 mt-3">
              Executed at {new Date(executionResult.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

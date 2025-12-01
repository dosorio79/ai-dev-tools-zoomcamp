import { Play, Terminal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useInterviewStore } from '@/store/interviewStore';
import { useToast } from '@/hooks/use-toast';
import { executeLocally } from '@/lib/runtime';
import { api } from '@/api';

export const ExecutionPanel = () => {
  const { currentSession, code, language, isExecuting, executionResult, wsSend, setIsExecuting, setExecutionResult } =
    useInterviewStore();
  const { toast } = useToast();

  const handleExecute = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executeLocally(language, code);
      setExecutionResult(result);
      wsSend?.({ type: 'execution_result', payload: result });
      if (currentSession) {
        // Relay to backend so other participants receive the result even if WS send is dropped
        api.executeCode(currentSession.id, result).catch(() => {});
      }
      
      if (result.error) {
        toast({
          title: 'Execution Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Execution Complete',
          description: 'Code executed successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute code',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Output</span>
        </div>
        <Button 
          onClick={handleExecute} 
          disabled={isExecuting}
          size="sm"
          className="gap-2"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Code
            </>
          )}
        </Button>
      </div>

      <Card className="flex-1 p-4 bg-secondary/20 font-mono text-sm overflow-auto">
        {!executionResult && !isExecuting && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Click "Run Code" to see the output
          </div>
        )}

        {isExecuting && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {executionResult && (
          <div className="space-y-2">
            <pre className="whitespace-pre-wrap text-foreground">
              {executionResult.output}
            </pre>
            {executionResult.error && (
              <pre className="whitespace-pre-wrap text-destructive mt-2">
                {executionResult.error}
              </pre>
            )}
            <div className="text-xs text-muted-foreground mt-3">
              Executed at {new Date(executionResult.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

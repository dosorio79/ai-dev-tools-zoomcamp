import { useCallback } from 'react';
import { executeLocally } from '@/lib/runtime';
import { useInterviewStore } from '@/store/interviewStore';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api';

const withDefaultOutput = (result: Awaited<ReturnType<typeof executeLocally>>) => ({
  ...result,
  output: result.output && result.output.trim().length > 0 ? result.output : 'No output captured.'
});

export const useRunCode = () => {
  const { toast } = useToast();
  const { 
    currentSession, 
    code, 
    language, 
    isExecuting, 
    wsSend, 
    setIsExecuting, 
    setExecutionResult 
  } = useInterviewStore();

  const runCode = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executeLocally(language, code);
      const normalized = withDefaultOutput(result);
      setExecutionResult(normalized);
      wsSend?.({ type: 'execution_result', payload: normalized });
      if (currentSession) {
        // Relay to backend so other participants receive the result even if WS send is dropped
        api.executeCode(currentSession.id, normalized).catch(() => {});
      }
      
      if (normalized.error) {
        toast({
          title: 'Execution Error',
          description: normalized.error,
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
  }, [code, currentSession, isExecuting, language, setExecutionResult, setIsExecuting, toast, wsSend]);

  return { runCode, isExecuting };
};

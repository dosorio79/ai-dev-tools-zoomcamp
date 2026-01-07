import { useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeLocally, isPyodideLoaded, preloadPyodide } from '@/api/executeLocally';
import type { ExecutionResult } from '@/types/execution';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runPhase, setRunPhase] = useState<'idle' | 'loading' | 'running'>('idle');
  const [outputCopied, setOutputCopied] = useState(false);
  const runIdRef = useRef(0);
  const EXECUTION_TIMEOUT_MS = 10000;

  const normalizedLanguage = language.toLowerCase();
  const isPython = normalizedLanguage === 'python';
  const panelBorderClass = isPython ? 'border-neutral-800' : 'border-border';
  const headerClass = isPython
    ? 'bg-neutral-950 text-neutral-200 border-neutral-800'
    : 'bg-secondary/30 border-border';
  const languageClass = isPython ? 'text-neutral-300' : 'text-muted-foreground';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (!isPython || isRunning) return;
    setIsRunning(true);
    setRunPhase(isPyodideLoaded() ? 'running' : 'loading');
    setResult(null);
    setOutputCopied(false);
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    const timeoutId = window.setTimeout(() => {
      if (runIdRef.current !== runId) return;
      runIdRef.current += 1;
      setIsRunning(false);
      setRunPhase('idle');
      setResult({
        output: '',
        error: `Execution timed out after ${Math.round(EXECUTION_TIMEOUT_MS / 1000)}s. Try reducing the data size.`,
        timestamp: new Date().toISOString(),
      });
    }, EXECUTION_TIMEOUT_MS);

    const run = async () => {
      try {
        if (!isPyodideLoaded()) {
          await preloadPyodide();
        }
        if (runIdRef.current !== runId) return;
        setRunPhase('running');

        const executionResult = await executeLocally('python', code);
        if (runIdRef.current !== runId) return;
        setResult(executionResult);
      } catch (error: unknown) {
        if (runIdRef.current !== runId) return;
        setResult({
          output: '',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      } finally {
        if (runIdRef.current !== runId) return;
        clearTimeout(timeoutId);
        setIsRunning(false);
        setRunPhase('idle');
      }
    };

    run();
  };

  const handleStop = () => {
    if (!isRunning) return;
    runIdRef.current += 1;
    setIsRunning(false);
    setRunPhase('idle');
    setResult({
      output: '',
      error: 'Execution stopped. If the runtime is still busy, reload the page.',
      timestamp: new Date().toISOString(),
    });
  };

  const handleCopyOutput = async () => {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setOutputCopied(true);
    setTimeout(() => setOutputCopied(false), 2000);
  };

  const runLabel = runPhase === 'loading' ? 'Loading...' : 'Running';

  return (
    <div className={`relative my-4 rounded-lg overflow-hidden border ${panelBorderClass}`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${headerClass}`}>
        <span className={`text-sm font-mono ${languageClass}`}>{language}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          {isPython && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRun}
                className="h-7 px-3 gap-1.5"
                data-testid="run-button"
                disabled={isRunning}
              >
                {isRunning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {isRunning ? runLabel : 'Run'}
              </Button>
              {isRunning && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStop}
                  className="h-7 px-2 text-xs"
                  data-testid="stop-button"
                >
                  Stop
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          background: isPython ? '#0b0b0b' : 'hsl(var(--card))',
        }}
      >
        {code}
      </SyntaxHighlighter>
      {result && (
        <div className="px-4 py-3 bg-accent border-t border-border text-sm text-accent-foreground">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span>Output</span>
            <div className="flex items-center gap-2">
              {typeof result.duration_ms === 'number' && (
                <span className="normal-case text-muted-foreground">
                  {result.duration_ms < 1000
                    ? `${result.duration_ms} ms`
                    : `${(result.duration_ms / 1000).toFixed(2)} s`}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOutput}
                className="h-6 px-2"
                disabled={!result.output}
                data-testid="copy-output"
              >
                {outputCopied ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          {result.output ? (
            <pre
              className="mt-2 whitespace-pre-wrap font-mono text-xs text-foreground"
              data-testid="execution-output"
            >
              {result.output}
            </pre>
          ) : (
            <div className="mt-2 text-xs text-muted-foreground" data-testid="execution-output-empty">
              No output yet. To see results, add a `print(...)` statement.
            </div>
          )}
          {result.error && (
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-red-500/80">Error</div>
              <pre
                className="mt-2 whitespace-pre-wrap font-mono text-xs text-red-500"
                data-testid="execution-error"
              >
                {result.error}
              </pre>
              {result.error.includes('Execution timed out') && (
                <div className="mt-2 text-xs text-muted-foreground" data-testid="execution-timeout-hint">
                  Tip: Try running with a smaller sample to keep execution fast.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [executed, setExecuted] = useState(false);

  const isPython = language.toLowerCase() === 'python';
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
    setExecuted(true);
    setTimeout(() => setExecuted(false), 3000);
  };

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
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRun}
              className="h-7 px-3 gap-1.5"
              data-testid="run-button"
            >
              <Play className="h-3 w-3" />
              Run
            </Button>
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
      {executed && (
        <div 
          className="px-4 py-2 bg-accent border-t border-border text-sm text-accent-foreground"
          data-testid="execution-message"
        >
          ⚡ Execution not enabled yet
        </div>
      )}
    </div>
  );
}

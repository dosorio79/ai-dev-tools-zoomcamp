import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface ExerciseBlockProps {
  content: string;
}

export function ExerciseBlock({ content }: ExerciseBlockProps) {
  const [isDone, setIsDone] = useState(false);

  return (
    <div className="my-6 rounded-lg border-2 border-primary/30 bg-accent/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-primary/20">
        <span className="text-lg">✍️</span>
        <span className="font-semibold text-foreground">Your turn!</span>
        <button
          type="button"
          className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
            isDone
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setIsDone((prev) => !prev)}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isDone ? 'Done' : 'Mark as done'}
        </button>
      </div>
      <div className="p-4 prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;
              
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-secondary/50 font-mono text-sm" {...props}>
                    {children}
                  </code>
                );
              }
              
              return (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={match[1]}
                />
              );
            },
            p({ children }) {
              return <p className="text-foreground mb-3">{children}</p>;
            },
            strong({ children }) {
              return <strong className="text-foreground font-semibold">{children}</strong>;
            },
            ol({ children }) {
              return <ol className="list-decimal list-inside text-foreground mb-3 space-y-1">{children}</ol>;
            },
            ul({ children }) {
              return <ul className="list-disc list-inside text-foreground mb-3 space-y-1">{children}</ul>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

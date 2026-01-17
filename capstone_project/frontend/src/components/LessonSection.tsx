import { Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { ExerciseBlock } from './ExerciseBlock';
import { LessonSection as LessonSectionType } from '@/types/lesson';

interface LessonSectionProps {
  section: LessonSectionType;
}

function parseExerciseBlocks(markdown: string): Array<{ type: 'markdown' | 'exercise'; content: string }> {
  const parts: Array<{ type: 'markdown' | 'exercise'; content: string }> = [];
  const exerciseRegex = /:::exercise\n([\s\S]*?):::/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = exerciseRegex.exec(markdown)) !== null) {
    // Add markdown before the exercise block
    if (match.index > lastIndex) {
      const beforeContent = markdown.slice(lastIndex, match.index).trim();
      if (beforeContent) {
        parts.push({ type: 'markdown', content: beforeContent });
      }
    }
    
    // Add the exercise block
    parts.push({ type: 'exercise', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining markdown after last exercise block
  if (lastIndex < markdown.length) {
    const afterContent = markdown.slice(lastIndex).trim();
    if (afterContent) {
      parts.push({ type: 'markdown', content: afterContent });
    }
  }
  
  // If no exercise blocks found, return the whole markdown
  if (parts.length === 0) {
    parts.push({ type: 'markdown', content: markdown });
  }
  
  return parts;
}

export function LessonSection({ section }: LessonSectionProps) {
  const contentParts = parseExerciseBlocks(section.content_markdown);
  const chipLabel =
    section.id === 'concept'
      ? '🧠 Core concept'
      : section.id === 'example'
      ? '🧪 Example'
      : section.id === 'exercise'
      ? '✍️ Exercise'
      : section.title;

  return (
    <section className="mb-8 last:mb-0" data-testid={`section-${section.id}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-3 py-1 text-sm font-semibold text-foreground">
          {chipLabel}
        </span>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{section.minutes} min</span>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none">
        {contentParts.map((part, index) => (
          part.type === 'exercise' ? (
            <ExerciseBlock key={index} content={part.content} />
          ) : (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-secondary/20 font-mono text-sm text-foreground" {...props}>
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
                h2({ children }) {
                  return <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">{children}</h3>;
                },
                h3({ children }) {
                  return <h4 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h4>;
                },
                p({ children }) {
                  return <p className="text-foreground mb-4 leading-relaxed">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-outside ml-5 text-foreground mb-4 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-outside ml-5 text-foreground mb-4 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-foreground">{children}</li>;
                },
                strong({ children }) {
                  return <strong className="font-semibold text-foreground">{children}</strong>;
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-border rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-secondary/30">{children}</thead>;
                },
                th({ children }) {
                  return <th className="px-4 py-2 text-left font-semibold text-foreground border-b border-border">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-4 py-2 text-foreground border-b border-border">{children}</td>;
                },
              }}
            >
              {part.content}
            </ReactMarkdown>
          )
        ))}
      </div>
    </section>
  );
}

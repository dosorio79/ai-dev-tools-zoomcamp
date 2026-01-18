import { useEffect, useRef, useState } from 'react';
import { Info, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LessonRenderer } from '@/components/LessonRenderer';
import { generateLesson } from '@/api/lessonClient';
import { LessonResponse } from '@/types/lesson';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/ui/use-toast';

type DifficultyLevel = 'beginner' | 'intermediate';

const LOADING_MESSAGE_STEPS = [
  { maxMs: 2500, text: 'Planning a 15-minute lesson...' },
  { maxMs: 6000, text: 'Selecting the key concepts...' },
  { maxMs: 10000, text: 'Building a concrete example...' },
  { maxMs: 15000, text: 'Finalizing lesson...' },
];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<DifficultyLevel>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'requesting' | 'received'>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [topicNeedsAttention, setTopicNeedsAttention] = useState(false);
  const topicInputRef = useRef<HTMLInputElement | null>(null);
  const isTopicEmpty = !topic.trim();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      setElapsedMs(0);
      setLoadingPhase('idle');
      return;
    }

    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 250);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (lesson === null) {
      topicInputRef.current?.focus();
    }
  }, [lesson]);

  useEffect(() => {
    if (!topicNeedsAttention) return;
    const timeout = setTimeout(() => setTopicNeedsAttention(false), 1600);
    return () => clearTimeout(timeout);
  }, [topicNeedsAttention]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (isTopicEmpty) {
      setTopicNeedsAttention(true);
      topicInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setLoadingPhase('requesting');
    try {
      const result = await generateLesson({ topic, level });
      setLoadingPhase('received');
      setLesson(result);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      toast({
        title: 'Lesson failed',
        description: 'Please try again in a moment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLesson(null);
    setTopic('');
    setLevel('intermediate');
  };

  const loadingMessage =
    loadingPhase === 'received'
      ? 'Rendering lesson...'
      : LOADING_MESSAGE_STEPS.find((step) => elapsedMs <= step.maxMs)?.text ||
        'Finalizing lesson...';
  const elapsedSeconds = Math.max(1, Math.round(elapsedMs / 1000));
  const loadingProgress = loadingPhase === 'received'
    ? 100
    : Math.min(90, Math.round((elapsedMs / 15000) * 90));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <Logo />
              <p className="text-xs text-[#8a8a8a]">
                The best remedy for doomscrolling
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {lesson ? (
          <LessonRenderer lesson={lesson} onReset={handleReset} />
        ) : (
          <div className="w-full max-w-xl mx-auto">
            {/* Input Panel */}
            <div className="p-8 rounded-xl bg-card border border-border shadow-sm">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-serif font-semibold text-[#1f1f1f] leading-snug mb-4">
                  Learn something new in <span className="whitespace-nowrap">15 minutes</span>
                </h2>
                <p className="text-base text-[#5f5f5f] leading-relaxed">
                  Short lessons, clear takeaways, zero doomscrolling.
                </p>
                <p className="text-base text-[#5f5f5f] leading-relaxed">
                  Enter a data or Python topic. We’ll handle the thinking.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Topic Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="topic" className="text-[#8a8a8a] font-medium">
                      What do you want to learn?
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-[#8a8a8a] hover:text-[#1f1f1f] transition-colors"
                            aria-label="Topic guidance"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Keep it narrow for a 15-minute lesson, e.g., "pandas groupby performance".
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="topic"
                    type="text"
                    placeholder="e.g., pandas groupby performance"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      if (topicNeedsAttention) {
                        setTopicNeedsAttention(false);
                      }
                    }}
                    className={`h-12 text-base text-[#1f1f1f] placeholder:text-[#8a8a8a] transition ${
                      topicNeedsAttention
                        ? 'border-destructive ring-2 ring-destructive/50'
                        : 'focus-visible:ring-1 focus-visible:ring-primary/40'
                    }`}
                    disabled={isLoading}
                    ref={topicInputRef}
                    data-highlight={topicNeedsAttention ? 'true' : 'false'}
                  />
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#8a8a8a] font-medium">Difficulty level</Label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLevel('beginner')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        level === 'beginner'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 bg-secondary/20 text-[#8a8a8a] hover:border-primary/50'
                      }`}
                      disabled={isLoading}
                    >
                      Beginner
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel('intermediate')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        level === 'intermediate'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 bg-secondary/20 text-[#8a8a8a] hover:border-primary/50'
                      }`}
                      disabled={isLoading}
                    >
                      Intermediate
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="space-y-2">
                  {isLoading && (
                    <div className="space-y-2">
                      <div
                        className="h-1 w-full overflow-hidden rounded-full bg-secondary/40"
                        aria-hidden
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${loadingProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-[#8a8a8a]">
                        {elapsedSeconds}s elapsed
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className={`w-full h-12 text-base font-semibold transition-transform duration-200 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md ${
                      isTopicEmpty && !isLoading ? 'opacity-60' : ''
                    }`}
                    disabled={isLoading}
                    aria-disabled={isTopicEmpty || isLoading}
                    aria-live="polite"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="transition-opacity duration-200">
                          {loadingMessage}
                        </span>
                      </div>
                    ) : (
                      'Generate lesson'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Feature hints */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 space-y-1">
                <div className="text-2xl font-bold text-primary">15</div>
                <div className="text-sm text-[#5f5f5f]">minutes</div>
              </div>
              <div className="p-4 space-y-1">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-[#5f5f5f]">sections</div>
              </div>
              <div className="p-4 space-y-1">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-[#5f5f5f]">Generated just for you</div>
              </div>
            </div>

            {/* Why it works */}
            <div className="mt-8 grid gap-3 text-sm text-[#5f5f5f]">
              <p className="text-xs uppercase tracking-wide text-[#8a8a8a]">
                Why it works
              </p>
              <div className="grid gap-2">
                <p>Focused scope prevents cognitive overload.</p>
                <p>Runnable examples make ideas stick quickly.</p>
                <p>Exercises turn concepts into memory.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 text-xs text-[#8a8a8a] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Built for fast learning sessions.</span>
          <div className="flex gap-4">
            <a
              className="hover:text-[#1f1f1f] transition-colors"
              href="https://github.com/dosorio79/ai-dev-tools-zoomcamp"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="hover:text-[#1f1f1f] transition-colors"
              href="https://github.com/dosorio79/ai-dev-tools-zoomcamp/tree/main/docs"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Info, Loader2, Sparkles } from 'lucide-react';
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

type DifficultyLevel = 'beginner' | 'intermediate';

const LOADING_MESSAGES = [
  'Planning a 15-minute lesson...',
  'Selecting the key concepts...',
  'Building a concrete example...',
  'Checking scope and difficulty...',
  'Finalizing lesson...',
];
const LOADING_ROTATION_MS = 650;

export default function Home() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<DifficultyLevel>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const topicInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, LOADING_ROTATION_MS);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (lesson === null) {
      topicInputRef.current?.focus();
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await generateLesson({ topic, level });
      setLesson(result);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLesson(null);
    setTopic('');
    setLevel('intermediate');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">uLearn</h1>
              <p className="text-sm text-muted-foreground">Micro-learning, generated on demand</p>
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
              <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground mb-2">
                  Learn something new in 15 minutes
                </h2>
                <p className="text-muted-foreground">
                  Enter any data or Python topic and get a focused lesson instantly
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="topic" className="text-foreground font-medium">
                      What do you want to learn?
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground transition-colors"
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
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-12 text-base"
                    disabled={isLoading}
                    ref={topicInputRef}
                  />
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground font-medium">Difficulty level</Label>
                    <Badge variant="secondary" className="capitalize">
                      {level}
                    </Badge>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLevel('beginner')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        level === 'beginner'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50'
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
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                      }`}
                      disabled={isLoading}
                    >
                      Intermediate
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={!topic.trim() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="transition-opacity duration-200">
                        {LOADING_MESSAGES[loadingMessageIndex]}
                      </span>
                    </div>
                  ) : (
                    'Generate lesson'
                  )}
                </Button>
              </form>
            </div>

            {/* Feature hints */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-primary">15</div>
                <div className="text-sm text-muted-foreground">minutes</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">sections</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">topics</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { Target, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonSection } from './LessonSection';
import { LessonResponse } from '@/types/lesson';

interface LessonRendererProps {
  lesson: LessonResponse;
  onReset: () => void;
}

export function LessonRenderer({ lesson, onReset }: LessonRendererProps) {
  return (
    <div className="w-full max-w-3xl mx-auto" data-testid="lesson-content">
      {/* Lesson Header */}
      <div className="mb-8 p-6 rounded-xl bg-card border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-2">Learning Objective</h2>
            <p className="text-muted-foreground leading-relaxed">{lesson.objective}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Total time: <strong className="text-foreground">{lesson.total_minutes} minutes</strong></span>
          </div>
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            New lesson
          </Button>
        </div>
      </div>

      {/* Lesson Sections */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
        {lesson.sections.map((section) => (
          <LessonSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
